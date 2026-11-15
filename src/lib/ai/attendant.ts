import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ConversationRow, MessageRow, ProjectRow, SettingsRow } from '@/lib/types';
import { handOff, sendAndStore } from '@/lib/whatsapp/inbox';

const MODEL = 'claude-haiku-5-5';
const MAX_TOOL_ROUNDS = 4;
const HISTORY_LIMIT = 40;

const BASE_PROMPT = `Você é o assistente virtual do Vitor Marcelli no WhatsApp. O Vitor é desenvolvedor full stack e atende empresas que precisam de sistemas web, automações de processos (como emissão de guias fiscais em portais da SEFAZ), atendimento por WhatsApp com IA e integrações entre sistemas (ERPs, CRMs, Google Workspace).

Seu trabalho:
1. Receber a pessoa com cordialidade e entender o que ela precisa.
2. Fazer poucas perguntas por vez para entender: o problema ou processo atual, a empresa e o segmento, o prazo desejado e se já existe algum sistema em uso.
3. Explicar de forma simples como o Vitor pode ajudar, citando projetos parecidos da lista abaixo quando fizer sentido.
4. Assim que souber o nome da pessoa e a necessidade, chame a ferramenta registrar_lead.
5. Chame transferir_para_vitor quando: a pessoa pedir para falar com o Vitor ou com um humano; pedir preço, orçamento, proposta ou prazo de entrega; quiser marcar uma reunião; o assunto for uma vaga de emprego; ou você não souber responder com segurança. Depois de transferir, avise que o Vitor vai continuar a conversa por aqui em breve.

Regras:
- Responda sempre no idioma da pessoa (português por padrão).
- Mensagens curtas, no estilo do WhatsApp: no máximo 3 parágrafos curtos, sem títulos nem listas longas. Pode usar *negrito* com moderação.
- Nunca invente preços, prazos, disponibilidade de agenda ou projetos que não estão na lista. Valores e prazos são sempre definidos pelo Vitor.
- Não peça dados sensíveis (CPF, senhas, dados bancários).
- Se a mensagem não tiver relação com serviços do Vitor (spam, propaganda, assunto pessoal), responda educadamente uma vez e não insista.
- Você é uma IA: se perguntarem, diga isso com naturalidade.
- Mensagens como "[Áudio recebido]" ou "[Imagem recebida]" indicam mídia que você não consegue ver nem ouvir: peça com gentileza que a pessoa escreva o principal em texto.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'registrar_lead',
    description:
      'Salva ou atualiza o contato como lead no painel do Vitor. Chame assim que souber o nome e a necessidade da pessoa, e de novo se descobrir empresa ou e-mail.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', description: 'Nome da pessoa' },
        empresa: { type: ['string', 'null'], description: 'Empresa, se informada' },
        email: { type: ['string', 'null'], description: 'E-mail, se informado' },
        necessidade: { type: 'string', description: 'Resumo em 1 a 3 frases do que a pessoa precisa' },
      },
      required: ['nome', 'empresa', 'email', 'necessidade'],
      additionalProperties: false,
    },
  },
  {
    name: 'transferir_para_vitor',
    description:
      'Passa a conversa para o Vitor responder pessoalmente. Depois disso você não responde mais nesta conversa.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string', description: 'Por que a conversa precisa do Vitor, em uma frase' },
        resumo: { type: 'string', description: 'Resumo do que já foi conversado, para o Vitor continuar sem reler tudo' },
      },
      required: ['motivo', 'resumo'],
      additionalProperties: false,
    },
  },
];

let client: Anthropic | undefined;
function anthropic() {
  client ??= new Anthropic();
  return client;
}

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function buildSystemPrompt(projects: ProjectRow[], instructions: string | null) {
  const list = projects.map((p) => `- ${p.title_pt}: ${p.summary_pt}${p.live_url ? ` (no ar: ${p.live_url})` : ''}`).join('\n');
  return [
    BASE_PROMPT,
    `Projetos do Vitor que você pode citar:\n${list || '- (nenhum cadastrado)'}`,
    instructions ? `Instruções adicionais do Vitor:\n${instructions}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function toApiMessages(history: MessageRow[]): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = [];
  for (const m of history) {
    if (m.author === 'system') continue;
    messages.push({ role: m.author === 'contact' ? 'user' : 'assistant', content: m.body });
  }
  while (messages.length > 0 && messages[0].role !== 'user') messages.shift();
  return messages;
}

async function registerLead(conversation: ConversationRow, input: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const record = {
    name: String(input.nome || conversation.contact_name || 'Contato WhatsApp').slice(0, 120),
    company: typeof input.empresa === 'string' && input.empresa ? input.empresa.slice(0, 120) : null,
    email: typeof input.email === 'string' && input.email ? input.email.slice(0, 200) : null,
    message: String(input.necessidade || '').slice(0, 4000),
    phone: conversation.phone,
    source: 'whatsapp' as const,
  };
  if (conversation.lead_id) {
    await db.from('leads').update(record).eq('id', conversation.lead_id);
  } else {
    const { data } = await db.from('leads').insert(record).select('id').single();
    if (data) {
      await db.from('conversations').update({ lead_id: data.id }).eq('id', conversation.id);
      conversation.lead_id = data.id;
    }
  }
  return 'Lead salvo.';
}

/**
 * Answers the latest messages of a conversation with Claude, running the tool loop
 * (lead registration and hand-off) and sending the final reply through WhatsApp.
 */
export async function runAttendant(conversationId: string) {
  const db = getSupabaseAdmin();
  const [{ data: conv }, { data: settings }, { data: projects }, { data: history }] = await Promise.all([
    db.from('conversations').select('*').eq('id', conversationId).single(),
    db.from('settings').select('*').eq('id', 1).single(),
    db.from('projects').select('*').eq('published', true).order('sort_order'),
    db.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(HISTORY_LIMIT),
  ]);
  const conversation = conv as ConversationRow | null;
  const config = settings as SettingsRow | null;
  if (!conversation || conversation.mode !== 'ai') return;

  if (!config?.ai_enabled || !isAiConfigured()) {
    await db.from('conversations').update({ needs_attention: true }).eq('id', conversation.id);
    return;
  }

  const messages = toApiMessages(((history ?? []) as MessageRow[]).reverse());
  if (messages.length === 0) return;

  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: buildSystemPrompt((projects ?? []) as ProjectRow[], config.ai_instructions), cache_control: { type: 'ephemeral' } },
  ];

  let handedOff: { motivo: string; resumo: string } | null = null;
  let reply = '';

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await anthropic().messages.create({
        model: MODEL,
        max_tokens: 2048,
        system,
        tools: TOOLS,
        output_config: { effort: 'low' },
        messages,
      });

      if (response.stop_reason === 'refusal') {
        handedOff = { motivo: 'A IA não conseguiu responder a esta conversa.', resumo: '' };
        break;
      }

      reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) break;

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolUses) {
        const input = (tool.input ?? {}) as Record<string, unknown>;
        if (tool.name === 'registrar_lead') {
          results.push({ type: 'tool_result', tool_use_id: tool.id, content: await registerLead(conversation, input) });
        } else if (tool.name === 'transferir_para_vitor') {
          handedOff = { motivo: String(input.motivo || 'Pedido de atendimento humano'), resumo: String(input.resumo || '') };
          results.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Conversa transferida. Avise a pessoa em uma frase curta.' });
        } else {
          results.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Ferramenta desconhecida.', is_error: true });
        }
      }
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: results });
    }
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) console.error('[ai] rate limited');
    else if (error instanceof Anthropic.AuthenticationError) console.error('[ai] invalid ANTHROPIC_API_KEY');
    else if (error instanceof Anthropic.APIError) console.error(`[ai] API error ${error.status}`, error.message);
    else console.error('[ai] unexpected error', error);
    await handOff(conversation, 'A IA ficou indisponível ao responder esta mensagem.');
    return;
  }

  if (reply) await sendAndStore(conversation, 'ai', reply);
  if (handedOff) await handOff(conversation, handedOff.motivo, handedOff.resumo);
}
