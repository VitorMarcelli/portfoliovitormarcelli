# Portfólio — Vitor Marcelli

Portfólio digital premium de Vitor Marcelli. Aplicação web responsiva de apresentação profissional, posicionamento técnico e vitrine de projetos.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Framer Motion**

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar dev server
npm run dev

# Build de produção
npm run build
```

O servidor de desenvolvimento estará disponível em [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
├── app/          # Rotas e layout (Next.js App Router)
├── components/   # Componentes reutilizáveis
├── sections/     # Seções da página principal
├── data/         # Dados estruturados (projetos)
├── types/        # Interfaces TypeScript
├── hooks/        # Hooks customizados
├── lib/          # Utilitários
└── styles/       # Estilos adicionais
```

## Documentação

- [PRD do Produto](docs/PRD_Portfolio_Vitor_Marcelli.md)
- [Contexto de Execução](docs/EXECUTION_CONTEXT.md)
- [Plano Fase 1](docs/PHASE_01_IMPLEMENTATION.md)
