import type { Locale } from '@/lib/types';

export const locales: Locale[] = ['pt', 'en'];

export function isLocale(value: string): value is Locale {
  return value === 'pt' || value === 'en';
}

/** Public path for a locale: Portuguese lives at the root, English under /en. */
export function localePath(locale: Locale, path = '') {
  const clean = path.startsWith('/') ? path : path ? `/${path}` : '';
  return locale === 'pt' ? clean || '/' : `/en${clean}`;
}

const pt = {
  meta: {
    title: 'Vitor Marcelli | Desenvolvedor Full Stack',
    description:
      'Vitor Marcelli, desenvolvedor full stack. Sistemas web, automações fiscais, integrações com WhatsApp e IA para empresas.',
  },
  nav: {
    projects: 'Projetos',
    services: 'Serviços',
    experience: 'Trajetória',
    contact: 'Contato',
    menu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    switchLanguage: 'English',
    switchLanguageLabel: 'Ver o site em inglês',
    themeToLight: 'Usar tema claro',
    themeToDark: 'Usar tema escuro',
    skip: 'Pular para o conteúdo',
  },
  hero: {
    role: 'Desenvolvedor Full Stack',
    tagline: '& Automação de Processos',
    leadBefore: 'Construo sistemas web, automações e integrações que ',
    leadHighlight: 'tiram trabalho manual',
    leadAfter: ' da rotina de empresas',
    leadSecond: 'Emissão de guias fiscais, atendimento por WhatsApp com IA e painéis de gestão',
    scroll: 'Role para explorar',
  },
  about: {
    title: 'Sobre',
    paragraphs: [
      'Sou desenvolvedor full stack e trabalho do banco de dados à interface. A maior parte dos meus projetos nasce de um processo que alguém faz à mão todo dia e que pode ser automatizado.',
      'Tenho experiência com automação de portais da SEFAZ, sistemas multi-tenant, atendimento por WhatsApp com IA e integrações com ERPs e CRMs.',
      'Antes de escrever código, entendo o processo e o que precisa mudar no negócio. Depois entrego o sistema funcionando, documentado e com alguém para dar suporte.',
    ],
  },
  services: {
    title: 'O que eu faço',
    items: [
      {
        title: 'Sistemas web sob medida',
        description: 'Painéis, CRMs e SaaS com React, Next.js, Node.js e PostgreSQL, do banco ao deploy.',
      },
      {
        title: 'Automação de processos',
        description: 'Robôs que operam portais, leem e-mails, geram PDFs e alimentam planilhas e ERPs sem intervenção manual.',
      },
      {
        title: 'WhatsApp e IA no atendimento',
        description: 'Atendimento automático que qualifica o cliente e passa a conversa para uma pessoa na hora certa.',
      },
      {
        title: 'Integrações',
        description: 'APIs REST, webhooks e conectores entre sistemas como Bitrix24, Google Workspace e ERPs.',
      },
    ],
  },
  projects: {
    title: 'Projetos',
    subtitle: 'Sistemas que construí. Alguns têm código aberto; outros são privados, com demonstração e disponíveis para venda.',
    viewCase: 'Ler o case',
    viewLive: 'Abrir sistema',
    viewCode: 'Ver código',
    more: 'Outros projetos',
    empty: 'Os projetos estão sendo atualizados. Volte em breve ou fale comigo.',
    back: 'Todos os projetos',
    stack: 'Tecnologias',
    year: 'Ano',
    links: 'Links',
    talkCta: 'Quer algo parecido para a sua empresa?',
    filterAll: 'Todos',
    filterLabel: 'Filtrar projetos por categoria',
    privateCode: 'Código privado',
    privateCodeHint: 'O código-fonte é privado. A demonstração está disponível.',
    forSale: 'Disponível para venda',
    priceOnRequest: 'Valor sob consulta',
    status: { live: 'No ar', mvp: 'MVP', in_progress: 'Em desenvolvimento', completed: 'Concluído' },
    challenge: 'O desafio',
    solution: 'A solução',
    results: 'Resultados',
    highlights: 'Destaques',
    gallery: 'Telas',
    galleryOpen: 'Ampliar imagem',
    galleryClose: 'Fechar',
    galleryPrev: 'Imagem anterior',
    galleryNext: 'Próxima imagem',
    interestTitle: 'Tenho interesse neste sistema',
    interestText: 'Conte o que você precisa. Respondo com uma proposta, uma demonstração ou os próximos passos.',
    buyCta: 'Quero este sistema',
    demoCta: 'Pedir demonstração',
  },
  experience: {
    title: 'Trajetória',
    work: 'Experiência',
    education: 'Formação',
    present: 'atual',
    downloadCv: 'Baixar currículo (PDF)',
  },
  stack: {
    title: 'Ferramentas',
    groups: [
      { label: 'Interface', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'React Native'] },
      { label: 'Servidor', items: ['Node.js', 'NestJS', 'Python', 'FastAPI', 'REST e webhooks'] },
      { label: 'Dados', items: ['PostgreSQL', 'Supabase', 'Prisma', 'Redis', 'MongoDB'] },
      { label: 'Automação e IA', items: ['Playwright', 'Claude e OpenAI', 'Evolution API', 'BullMQ'] },
      { label: 'Infra', items: ['Vercel', 'Docker', 'Linux', 'GitHub Actions'] },
    ],
  },
  approach: {
    title: 'Como eu trabalho',
    items: [
      {
        title: 'Começo pelo processo',
        description: 'Mapeio quem faz o quê hoje e quanto tempo isso custa, para saber o que o sistema precisa resolver.',
      },
      {
        title: 'Entregas curtas',
        description: 'Você acompanha versões funcionando desde as primeiras semanas, não só no final.',
      },
      {
        title: 'Tecnologia comprovada',
        description: 'Uso ferramentas maduras e tipagem forte, para o sistema continuar fácil de manter depois da entrega.',
      },
      {
        title: 'Suporte depois do deploy',
        description: 'Acompanho o sistema em produção e ajusto o que aparecer no uso real.',
      },
    ],
  },
  contact: {
    title: 'Vamos conversar sobre o seu projeto',
    subtitle:
      'Conte o que você precisa. Respondo pelo WhatsApp ou por e-mail, e também estou aberto a vagas CLT ou PJ.',
    whatsapp: 'Chamar no WhatsApp',
    whatsappMessage: 'Olá Vitor, vi seu portfólio e gostaria de conversar sobre um projeto.',
    or: 'ou envie uma mensagem',
    form: {
      name: 'Nome',
      email: 'E-mail',
      phone: 'WhatsApp',
      phoneHint: 'Opcional',
      company: 'Empresa',
      companyHint: 'Opcional',
      message: 'Como posso ajudar?',
      submit: 'Enviar mensagem',
      sending: 'Enviando…',
      success: 'Mensagem enviada. Respondo em até um dia útil.',
      error: 'Não foi possível enviar agora. Tente de novo ou me chame no WhatsApp.',
      invalid: 'Preencha nome, e-mail válido e uma mensagem com pelo menos 10 caracteres.',
      intentLabel: 'O que você procura?',
      intents: { contato: 'Conversar sobre um projeto', compra: 'Comprar ou licenciar este sistema', demonstracao: 'Ver uma demonstração' },
      projectLabel: 'Projeto',
    },
    channels: 'Outros canais',
  },
  dock: {
    toolbar: 'Navegação',
    home: 'Início',
    projects: 'Projetos',
    contact: 'Contato',
    language: 'English',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    email: 'E-mail',
    theme: 'Tema',
  },
  footer: {
    rights: 'Todos os direitos reservados.',
    admin: 'Área restrita',
  },
  notFound: {
    title: 'Página não encontrada',
    back: 'Voltar ao início',
  },
};

export type Dictionary = typeof pt;

const en: Dictionary = {
  meta: {
    title: 'Vitor Marcelli | Full Stack Developer',
    description:
      'Vitor Marcelli, full stack developer. Web systems, tax automation, WhatsApp and AI integrations for businesses.',
  },
  nav: {
    projects: 'Projects',
    services: 'Services',
    experience: 'Background',
    contact: 'Contact',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Português',
    switchLanguageLabel: 'View the site in Portuguese',
    themeToLight: 'Use light theme',
    themeToDark: 'Use dark theme',
    skip: 'Skip to content',
  },
  hero: {
    role: 'Full Stack Developer',
    tagline: '& Process Automation',
    leadBefore: 'I build web systems, automations and integrations that ',
    leadHighlight: 'take manual work',
    leadAfter: ' off a company’s plate',
    leadSecond: 'Tax slip issuing, WhatsApp support with AI and management dashboards',
    scroll: 'Scroll to explore',
  },
  about: {
    title: 'About',
    paragraphs: [
      'I am a full stack developer working from the database to the interface. Most of my projects start with a process someone does by hand every day that can be automated.',
      'I have hands-on experience automating Brazilian tax portals (SEFAZ), multi-tenant systems, WhatsApp support with AI, and ERP and CRM integrations.',
      'Before writing code I learn the process and what needs to change in the business. Then I ship the system working, documented and supported.',
    ],
  },
  services: {
    title: 'What I do',
    items: [
      {
        title: 'Custom web systems',
        description: 'Dashboards, CRMs and SaaS with React, Next.js, Node.js and PostgreSQL, from database to deploy.',
      },
      {
        title: 'Process automation',
        description: 'Bots that operate portals, read emails, generate PDFs and feed spreadsheets and ERPs with no manual steps.',
      },
      {
        title: 'WhatsApp and AI support',
        description: 'Automated support that qualifies the customer and hands the chat to a person at the right moment.',
      },
      {
        title: 'Integrations',
        description: 'REST APIs, webhooks and connectors between systems such as Bitrix24, Google Workspace and ERPs.',
      },
    ],
  },
  projects: {
    title: 'Projects',
    subtitle: 'Systems I built. Some are open source; others are private, with a live demo and available for purchase.',
    viewCase: 'Read the case',
    viewLive: 'Open app',
    viewCode: 'View code',
    more: 'More projects',
    empty: 'Projects are being updated. Check back soon or get in touch.',
    back: 'All projects',
    stack: 'Technologies',
    year: 'Year',
    links: 'Links',
    talkCta: 'Want something similar for your company?',
    filterAll: 'All',
    filterLabel: 'Filter projects by category',
    privateCode: 'Private code',
    privateCodeHint: 'The source code is private. A live demo is available.',
    forSale: 'Available for purchase',
    priceOnRequest: 'Price on request',
    status: { live: 'Live', mvp: 'MVP', in_progress: 'In progress', completed: 'Completed' },
    challenge: 'The challenge',
    solution: 'The solution',
    results: 'Results',
    highlights: 'Highlights',
    gallery: 'Screens',
    galleryOpen: 'Enlarge image',
    galleryClose: 'Close',
    galleryPrev: 'Previous image',
    galleryNext: 'Next image',
    interestTitle: 'I am interested in this system',
    interestText: 'Tell me what you need. I will reply with a proposal, a demo or the next steps.',
    buyCta: 'I want this system',
    demoCta: 'Request a demo',
  },
  experience: {
    title: 'Background',
    work: 'Experience',
    education: 'Education',
    present: 'present',
    downloadCv: 'Download résumé (PDF)',
  },
  stack: {
    title: 'Tools',
    groups: [
      { label: 'Interface', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'React Native'] },
      { label: 'Server', items: ['Node.js', 'NestJS', 'Python', 'FastAPI', 'REST and webhooks'] },
      { label: 'Data', items: ['PostgreSQL', 'Supabase', 'Prisma', 'Redis', 'MongoDB'] },
      { label: 'Automation and AI', items: ['Playwright', 'Claude and OpenAI', 'Evolution API', 'BullMQ'] },
      { label: 'Infra', items: ['Vercel', 'Docker', 'Linux', 'GitHub Actions'] },
    ],
  },
  approach: {
    title: 'How I work',
    items: [
      {
        title: 'Process first',
        description: 'I map who does what today and what it costs, so the system solves the right problem.',
      },
      {
        title: 'Short iterations',
        description: 'You see working versions from the first weeks, not only at the end.',
      },
      {
        title: 'Proven technology',
        description: 'Mature tools and strong typing, so the system stays easy to maintain after handover.',
      },
      {
        title: 'Support after launch',
        description: 'I watch the system in production and adjust whatever shows up in real use.',
      },
    ],
  },
  contact: {
    title: 'Let’s talk about your project',
    subtitle: 'Tell me what you need. I reply on WhatsApp or by email, and I am also open to full-time roles.',
    whatsapp: 'Message me on WhatsApp',
    whatsappMessage: 'Hi Vitor, I saw your portfolio and would like to talk about a project.',
    or: 'or send a message',
    form: {
      name: 'Name',
      email: 'Email',
      phone: 'WhatsApp',
      phoneHint: 'Optional',
      company: 'Company',
      companyHint: 'Optional',
      message: 'How can I help?',
      submit: 'Send message',
      sending: 'Sending…',
      success: 'Message sent. I reply within one business day.',
      error: 'Could not send right now. Try again or message me on WhatsApp.',
      invalid: 'Fill in your name, a valid email and a message of at least 10 characters.',
      intentLabel: 'What are you looking for?',
      intents: { contato: 'Talk about a project', compra: 'Buy or license this system', demonstracao: 'See a demo' },
      projectLabel: 'Project',
    },
    channels: 'Other channels',
  },
  dock: {
    toolbar: 'Navigation',
    home: 'Home',
    projects: 'Projects',
    contact: 'Contact',
    language: 'Português',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    email: 'Email',
    theme: 'Theme',
  },
  footer: {
    rights: 'All rights reserved.',
    admin: 'Admin',
  },
  notFound: {
    title: 'Page not found',
    back: 'Back to home',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { pt, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
