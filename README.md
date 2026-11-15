# Portfólio Profissional | Vitor Marcelli

Portfólio e central de atendimento de Vitor Marcelli, Desenvolvedor Full Stack.

Além de apresentar trajetória, serviços e projetos, o site concentra o contato com possíveis clientes: formulário, WhatsApp com atendimento por IA e um painel privado para acompanhar visitas, leads e conversas.

## Funcionalidades

**Site público (PT em `/`, EN em `/en`)**

- Projetos, trajetória e currículo gerenciados pelo painel, com página de case para cada projeto.
- Formulário de contato que vira lead no painel.
- Botão de WhatsApp, e-mail, LinkedIn e GitHub.
- SEO: metadados por idioma, `hreflang`, sitemap, robots, imagem Open Graph e dados estruturados.
- Tema claro e escuro, sem flash na troca, e respeito a `prefers-reduced-motion`.
- Métricas de visita próprias, sem cookies.

**Painel (`/admin`)**

- Visão geral: visualizações, visitantes, origem do tráfego, páginas, países, dispositivos e cliques.
- Conversas do WhatsApp em tempo real: a IA atende, qualifica e transfere para mim; posso assumir ou devolver qualquer conversa.
- Funil de leads (novo, em contato, proposta, fechado, perdido) com anotações.
- Cadastro de projetos com upload de capa, tradução e publicação.
- Trajetória profissional, currículo em PDF e configurações do atendimento.

## Tecnologias

- Next.js 16 (App Router, Server Actions, Proxy), React 19 e TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Storage e Realtime)
- Claude API (atendimento com IA)
- Evolution API (WhatsApp)
- Vercel

## Como rodar localmente

```bash
git clone https://github.com/VitorMarcelli/portfoliovitormarcelli.git
cd portfoliovitormarcelli
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Acesse `http://localhost:3000`.

O banco é criado executando os arquivos de `supabase/migrations` em ordem no SQL Editor do Supabase.

## Deploy

O deploy é feito pela Vercel a cada push na branch `main`. As variáveis de ambiente necessárias estão listadas em `.env.example`.

## Contato

- LinkedIn: https://www.linkedin.com/in/vitor-augusto-marcelli-ba4070220/
- GitHub: https://github.com/VitorMarcelli
- E-mail: tecnologybluelife@gmail.com

## Licença

MIT. Consulte o arquivo `LICENSE`.
