export type Locale = 'pt' | 'en';

export interface Dictionary {
  nav: {
    work: string;
    services: string;
    stack: string;
    contact: string;
  };
  hero: {
    role: string;
    manifesto: string;
    status: string;
    cta: string;
  };
  about: {
    title: string;
    paragraphs: [string, string, string];
  };
  services: {
    title: string;
    items: { title: string; description: string }[];
  };
  projects: {
    title: string;
    subtitle: string;
    exploreCta: string;
    otherWorks: string;
    mediaPlaceholder: string;
    featured: {
      title: string;
      shortDescription: string;
    }[];
    other: {
      title: string;
      shortDescription: string;
    }[];
  };
  stack: {
    title: string;
    intro: string;
    groups: { label: string }[];
  };
  differentials: {
    title: string;
    items: { title: string; description: string }[];
  };
  contact: {
    title: string;
    subtitle: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  pt: {
    nav: {
      work: 'Projetos',
      services: 'Serviços',
      stack: 'Stack',
      contact: 'Contato',
    },
    hero: {
      role: 'Desenvolvedor Web Fullstack',
      manifesto: 'Engenharia de software ponta a ponta. Construo sistemas complexos, integrações escaláveis e interfaces premium que resolvem problemas reais.',
      status: 'Disponível para novos projetos',
      cta: 'Ver Projetos',
    },
    about: {
      title: 'Sobre Mim',
      paragraphs: [
        'Sou um Desenvolvedor Fullstack com foco em criar aplicações web robustas e sistemas sob medida. Minha base técnica rigorosa permite atuar com segurança desde a arquitetura de dados e APIs até ecossistemas de interfaces visuais premium.',
        'Minha experiência principal envolve processos críticos de negócio: da automação pesada de sistemas fiscais governamentais (SEFAZ) à construção de plataformas web modernas de alta tração.',
        'Para mim, código é ferramenta, não objetivo final. Eu desenvolvo sistemas com forte visão de produto, garantindo que arquiteturas de alta resiliência se traduzam em interfaces estéticas, rápidas e orientadas ao usuário real.',
      ],
    },
    services: {
      title: 'Expertise',
      items: [
        {
          title: 'Engenharia Web Fullstack',
          description: 'Desenvolvimento end-to-end usando stack moderna (React, Next.js, Node.js, TypeScript). Da modelagem do banco de dados ao deploy final.',
        },
        {
          title: 'Sistemas & Integrações',
          description: 'Automação de processos complexos, construção de APIs RESTful resilientes, web scraping governamental e orquestração de microsserviços.',
        },
        {
          title: 'Interfaces Premium',
          description: 'Tradução do design system para o código com excelência visual, performance "Lighthouse 100" e interações fluidas (Framer Motion).',
        },
        {
          title: 'Engenharia Aplicada ao Produto',
          description: 'Desenvolvimento orientado não apenas à completude funcional, mas à entrega de valor estratégico e validação de métricas do negócio.',
        },
      ],
    },
    projects: {
      title: 'Projetos\nEm Destaque',
      subtitle: 'Comprovações reais da interseção entre engenharia de software sólida e design de produto refinado na web.',
      exploreCta: 'Explorar Projeto',
      otherWorks: 'Repositórios & Ferramentas',
      mediaPlaceholder: 'Visual Portfolio Asset',
      featured: [
        {
          title: 'Automação Fiscal Cross-State',
          shortDescription: 'Solução completa em Node.js/Playwright para automação de emissões SEFAZ com bypass de desafios antibot em escala de produção.',
        },
        {
          title: 'Web App Premium & Identidade',
          shortDescription: 'Experiência imersiva desenvolvida em Next.js 15, com arquitetura Server-First, i18n dinâmico e design system customizado.',
        },
      ],
      other: [
        {
          title: 'SDK de Visão Computacional',
          shortDescription: 'Módulo backend para integração com modelos avançados de visão estruturada e extração de dados via câmera web/mobile.',
        },
        {
          title: 'Microserviço Fiscal REST',
          shortDescription: 'API resiliente para geração, parseamento e disparo massivo de documentos PDF otimizados.',
        },
        {
          title: 'Sistema de Agendamento IA',
          shortDescription: 'POC exploratória de integração de fluxos naturais conversacionais e ferramentas autônomas.',
        },
      ],
    },
    stack: {
      title: 'Base Técnica',
      intro: 'A tecnologia ideal é a que resolve o problema da melhor forma. Este é o meu ecossistema principal de atuação para engenharia de produto.',
      groups: [
        { label: 'Frontend & UI' },
        { label: 'Backend & APIs' },
        { label: 'Dados & ORMs' },
        { label: 'Automação B2B' },
        { label: 'Deploy & DevOps' },
      ],
    },
    differentials: {
      title: 'Metodologia',
      items: [
        {
          title: 'Ownership Total',
          description: 'Mapeamento de domínio, arquitetura, design de banco, implementação fullstack e DevOps. Assumo a responsabilidade técnica completa.',
        },
        {
          title: 'Alinhamento com Negócio',
          description: 'Aplicações precisam ser viáveis financeiramente, escaláveis e estáveis. Código limpo é importante, mas o impacto comercial dita a prioridade.',
        },
        {
          title: 'Profundidade antes de Hype',
          description: 'Uso ferramentas sólidas que passaram pelo crivo do mercado. Foco em estabilidade, type-safety forte e robustez estrutural.',
        },
        {
          title: 'Atenção Absoluta ao Detalhe',
          description: 'O acabamento diferencia o produto amador da plataforma premium. Tolerância zero para falhas visuais de sub-pixel ou erros não tratados.',
        },
      ],
    },
    contact: {
      title: 'Inicie um\nProjeto.',
      subtitle: 'Precisa desenvolver um sistema web ou produto digital? Estou disponível para posições e consultorias técnicas.',
    },
  },
  en: {
    nav: {
      work: 'Projects',
      services: 'Services',
      stack: 'Stack',
      contact: 'Contact',
    },
    hero: {
      role: 'Fullstack Web Developer',
      manifesto: 'End-to-end software engineering. I build complex systems, scalable integrations, and premium interfaces that solve real business problems.',
      status: 'Available for new challenges',
      cta: 'View Work',
    },
    about: {
      title: 'About Me',
      paragraphs: [
        'I am a Fullstack Developer focused on creating robust web applications and bespoke systems. My rigorous technical foundation allows me to work confidently from data architectures and APIs to premium visual interface ecosystems.',
        'My core experience involves critical business processes: from heavy automation of government tax systems (SEFAZ) to building modern, high-traction web platforms.',
        'To me, code is a tool, not the ultimate goal. I develop systems with a strong product vision, ensuring that highly resilient architectures translate into aesthetic, snappy, and user-centric interfaces.',
      ],
    },
    services: {
      title: 'Expertise',
      items: [
        {
          title: 'Fullstack Web Engineering',
          description: 'End-to-end development using modern stacks (React, Next.js, Node.js, TypeScript). From database modeling to production deployment.',
        },
        {
          title: 'Systems & Integrations',
          description: 'Complex process automation, resilient RESTful APIs, high-stakes web scraping, and microservices orchestration.',
        },
        {
          title: 'Premium Interfaces',
          description: 'Translating design systems into code with visual excellence, "Lighthouse 100" performance, and fluid interactions.',
        },
        {
          title: 'Product-Applied Engineering',
          description: 'Development guided not only by functional completion, but by delivering strategic value and validating business metrics.',
        },
      ],
    },
    projects: {
      title: 'Featured\nWork',
      subtitle: 'Real proof of the intersection between solid software engineering and refined digital product design.',
      exploreCta: 'Explore Project',
      otherWorks: 'Repositories & Tooling',
      mediaPlaceholder: 'Visual Portfolio Asset',
      featured: [
        {
          title: 'Cross-State Tax Automation',
          shortDescription: 'Complete Node.js/Playwright solution for automating tax issuances with production-scale anti-bot bypass capabilities.',
        },
        {
          title: 'Premium Web App & Identity',
          shortDescription: 'Immersive experience developed in Next.js 15, featuring a Server-First architecture, dynamic i18n, and a custom design system.',
        },
      ],
      other: [
        {
          title: 'Computer Vision Backing SDK',
          shortDescription: 'Backend module integrating advanced structured vision models and data extraction pipelines.',
        },
        {
          title: 'REST Fiscal Microservice',
          shortDescription: 'Resilient API engine for mass generation, parsing, and dispatching of optimized PDF documents.',
        },
        {
          title: 'AI Scheduling System',
          shortDescription: 'Exploratory POC integrating natural conversational flows with autonomous agentic tools.',
        },
      ],
    },
    stack: {
      title: 'Technical Base',
      intro: 'The ideal technology is the one that best solves the problem. This is my core ecosystem for product engineering.',
      groups: [
        { label: 'Frontend & UI' },
        { label: 'Backend & APIs' },
        { label: 'Data & ORMs' },
        { label: 'B2B Automation' },
        { label: 'Deploy & DevOps' },
      ],
    },
    differentials: {
      title: 'Methodology',
      items: [
        {
          title: 'Total Ownership',
          description: 'Domain mapping, architecture, DB design, fullstack implementation, and DevOps. I take full technical responsibility over the lifecycle.',
        },
        {
          title: 'Business Alignment',
          description: 'Applications must be financially viable and stable. Clean code is important, but commercial impact dictates priority.',
        },
        {
          title: 'Depth Over Hype',
          description: 'I use solid tools that have passed the market test. Absolute focus on stability, strong type-safety, and structural robustness.',
        },
        {
          title: 'Ruthless Attention to Detail',
          description: 'Finishing touches separate amateur products from premium platforms. Zero tolerance for visual sub-pixel flaws or unhandled errors.',
        },
      ],
    },
    contact: {
      title: 'Start a\nProject.',
      subtitle: 'Need to engineer a web system or digital product? I am currently open for technical roles and consulting.',
    },
  },
};
