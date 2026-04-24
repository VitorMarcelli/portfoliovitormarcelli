import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: '1',
    slug: 'cross-state-tax-automation',
    title: 'Automação Fiscal Cross-State',
    shortDescription:
      'Solução completa em Node.js/Playwright para automação de emissões SEFAZ com bypass de desafios antibot.',
    fullDescription:
      'Sistema robusto de automação que integra com portais SEFAZ de diversos estados para emissão automatizada de guias fiscais. Inclui tratamento profundo de CAPTCHAs em escala, geração de PDFs nativos no backend, cálculo de multas/juros e suporte cross-region.',
    category: 'Sistemas Core',
    technologies: ['Node.js', 'Playwright', 'TypeScript', 'Docker', 'Ghost-Cursor'],
    coverImage: '/projects/cover_automation.png',
    links: {
      repository: 'https://github.com/vitormarcelli',
    },
    featured: true,
    status: 'active',
    updatedAt: '2026-03-24',
  },
  {
    id: '2',
    slug: 'premium-web-identity',
    title: 'Web App Premium & Identidade',
    shortDescription:
      'Experiência imersiva desenvolvida em Next.js 15, com arquitetura Server-First.',
    fullDescription:
      'Aplicação web responsiva com arquitetura de alta performance (Turbopack, App Router). Design system autoral "Brutalist Elegance", i18n em tempo real (PT-BR/EN) e integração fluida de microinterações via Framer Motion.',
    category: 'Frontend & UI',
    technologies: ['Next.js 15', 'React 19', 'Tailwind CSS v4', 'Framer Motion'],
    coverImage: '/projects/cover_web.png',
    links: {
      live: 'https://vitormarcelli.dev',
    },
    featured: true,
    status: 'in-progress',
    updatedAt: '2026-03-25',
  },
  {
    id: '3',
    slug: 'cv-backing-sdk',
    title: 'SDK de Visão Computacional',
    shortDescription:
      'Módulo backend para integração com modelos avançados de visão estruturada e extração de dados via câmera web/mobile.',
    fullDescription:
        'Desenvolvimento de SDK unificado conectando frontends React Native/Web com módulos de visão computacional Python para OCR estruturado e validação de documentos.',
    category: 'Backend & APIs',
    technologies: ['Node.js', 'Python', 'Openai SDK', 'LangChain'],
    coverImage: '/projects/cover_api.png',
    links: {},
    featured: false,
    status: 'completed',
    updatedAt: '2026-03-24',
  },
  {
    id: '4',
    slug: 'rest-fiscal-microservice',
    title: 'Microserviço Fiscal REST',
    shortDescription:
      'API resiliente para geração, parseamento e disparo massivo de documentos PDF otimizados.',
    fullDescription:
      'Arquitetura Serverless-first focada em escalabilidade horizontal. Manipula streams de dados JSON complexos para compilação PDF high-throughput, injetando códigos de barra e estruturação fiscal obrigatória.',
    category: 'Backend & APIs',
    technologies: ['Node.js', 'Express', 'Prisma ORM', 'Redis', 'PDF-Lib'],
    coverImage: '/projects/cover_api.png',
    links: {},
    featured: false,
    status: 'completed',
    updatedAt: '2026-02-15',
  },
  {
    id: '5',
    slug: 'ai-scheduling-system',
    title: 'Sistema de Agendamento IA',
    shortDescription:
      'POC exploratória de integração de fluxos naturais conversacionais e ferramentas autônomas.',
    fullDescription:
      'Integração de LLMs com APIs de calendário e mensageria, permitindo agendamentos complexos via Whatsapp utilizando Agentic Workflows.',
    category: 'Automação B2B',
    technologies: ['TypeScript', 'OpenAI', 'WhatsApp API'],
    coverImage: '/projects/cover_api.png',
    links: {},
    featured: false,
    status: 'archived',
    updatedAt: '2026-01-10',
  },
];
