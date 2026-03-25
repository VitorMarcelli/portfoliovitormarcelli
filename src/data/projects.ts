import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: '1',
    slug: 'sistema-emissao-guias',
    title: 'Sistema de Emissão de Guias SEFAZ',
    shortDescription:
      'Automação completa de emissão de guias fiscais para múltiplos estados brasileiros.',
    fullDescription:
      'Sistema robusto de automação que integra com portais SEFAZ de diversos estados para emissão automatizada de guias fiscais. Inclui tratamento de CAPTCHAs, geração de PDFs, cálculo de multas/juros e suporte a múltiplos tipos de documento.',
    category: 'automation',
    technologies: ['Node.js', 'Playwright', 'TypeScript', 'PDF Generation'],
    coverImage: '/projects/guias-sefaz.webp',
    links: {
      repository: 'https://github.com/vitormarcelli',
    },
    featured: true,
    status: 'active',
    updatedAt: '2026-03-23',
  },
  {
    id: '2',
    slug: 'portfolio-premium',
    title: 'Portfólio Digital Premium',
    shortDescription:
      'Portfólio de alto impacto visual com arquitetura moderna e experiência premium.',
    fullDescription:
      'Aplicação web responsiva construída com Next.js, TypeScript e Tailwind CSS. Foco em impacto visual, performance otimizada e arquitetura escalável para evolução contínua.',
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    coverImage: '/projects/portfolio.webp',
    links: {
      live: 'https://vitormarcelli.dev',
    },
    featured: true,
    status: 'in-progress',
    updatedAt: '2026-03-25',
  },
  {
    id: '3',
    slug: 'api-integracao-fiscal',
    title: 'API de Integração Fiscal',
    shortDescription:
      'API REST para integração com sistemas fiscais estaduais e geração de documentos.',
    fullDescription:
      'API construída com arquitetura modular para consumo de serviços fiscais, tratamento de erros, retry patterns e geração de relatórios automatizados.',
    category: 'api',
    technologies: ['Node.js', 'Express', 'TypeScript', 'REST API'],
    coverImage: '/projects/api-fiscal.webp',
    links: {},
    featured: false,
    status: 'completed',
    updatedAt: '2026-02-15',
  },
];
