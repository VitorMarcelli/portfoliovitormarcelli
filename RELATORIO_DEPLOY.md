# Relatório de Diagnóstico e Deploy — Portfólio Vitor Marcelli

Após uma análise profunda da estrutura do projeto e execução de testes de build rigorosos, concluí a preparação completa do seu portfólio para publicação gratuita, estática e automatizada através do GitHub Pages, seguindo as melhores práticas exigidas para ambientes Next.js 15+ (App Router).

Aqui está o detalhamento completo do que foi executado:

## 1. Arquivos alterados

*   **`next.config.ts`**: Reescrito para suportar build estático, injetar `basePath` e `assetPrefix` dinamicamente conforme ambiente, e definir imagens como desotimizadas (requisito do GitHub Pages).
*   **`src/app/layout.tsx`**: Metadados (SEO e Open Graph) atualizados para melhorar a visualização e conversão no compartilhamento em redes como LinkedIn e WhatsApp, utilizando as descrições solicitadas.
*   **`src/components/ProjectCard.tsx`** e **`src/sections/Projects.tsx`**: Imagens reescritas para concatenar o caminho base automaticamente através da variável `process.env.NEXT_PUBLIC_BASE_PATH`, garantindo que os caminhos absolutos não quebrem no GitHub Pages.
*   **`.github/workflows/deploy.yml`**: Criado do zero contendo o pipeline rigoroso de integração contínua (CI/CD) validando `npm`, fazendo o build estático e publicando via Actions.
*   **`README.md`**: Totalmente reescrito e otimizado como vitrine técnica.

## 2. Problemas encontrados no diagnóstico

*   O arquivo `next.config.ts` não possuía o atributo `output: "export"`, que é **obrigatório** para que o GitHub Pages consiga hospedar o site sem depender de um servidor Node.js.
*   Havia um risco iminente com caminhos absolutos das capas dos projetos em `Projects.tsx` e `ProjectCard.tsx`. Como o site será hospedado dentro de `/portfoliovitormarcelli/` e o projeto utiliza tags `<img>` padrão, e não a tag nativa `<Image>` do Next.js, as imagens retornariam "Error 404 (Not Found)" em produção.
*   Os metadados originais de SEO não possuíam chamadas ou resumos fortes que ajudassem no rankeamento profissional para recrutadores.
*   Ausência total de pipelines ou ações para automatizar a manutenção do projeto sem Vercel ou Netlify.

## 3. Correções aplicadas

1.  **Suporte Estático (`out`)**: Configurei o `next.config.ts` para que sempre gere a pasta `out/` e respeite o `trailingSlash`.
2.  **Solução de Imagens (Asset Pathing)**: Configurei a aplicação para aceitar o injetor `NEXT_PUBLIC_BASE_PATH`. Na cloud, ele preencherá o prefixo de pasta. Localmente ele se manterá vázio, de forma que seu ambiente `dev` local não quebre ou pare de exibir os assets.
3.  **SEO Robusto**: Title, Description, Keywords e Open Graph refinados.
4.  **Workflow Resiliente**: O arquivo `deploy.yml` inclui fallback inteligente de verificação de gerenciador de pacotes, bloqueio de re-execução paralela com o `concurrency`, e suporte a ambiente virtual Ubuntu limpo.

## 4. Como rodar localmente

Como preservamos as configurações do ambiente, basta continuar com os comandos nativos. Você pode validar o funcionamento a qualquer momento executando:

```bash
npm install
npm run dev
```
*(Opcional: Você pode rodar `npm run build` para garantir que o código que está subindo está gerando estáticos saudáveis, pois ele testará tudo gerando a pasta `out`).*

## 5. Como publicar no GitHub Pages

O processo de deploy agora é **100% automatizado**.

1.  Faça um simples git commit e push para a sua branch `main` no repositório remoto.
2.  No GitHub do seu repositório, navegue até a aba **Settings** > **Pages**.
3.  Em **Build and deployment**, verifique se a **Source** está definida para **"GitHub Actions"**.
4.  Acompanhe o andamento na aba **Actions**; o deploy leva em média de 1 a 2 minutos. 

## 6. URL esperada do site

Acesso final esperado após o Workflow ser processado com sucesso:
👉 **`https://vitormarcelli.github.io/portfoliovitormarcelli/`**

## 7. Checklist final de validação

- [x] O projeto roda localmente.
- [x] O build (`npm run build`) passa sem erro localmente (testado rigorosamente no shell local).
- [x] A exportação estática gera a pasta `out`.
- [x] O `next.config` está compatível com GitHub Pages e App Router.
- [x] O `basePath` dinâmico está devidamente apontado para `/portfoliovitormarcelli`.
- [x] As imagens agora estão imunes a quebras por conta de refatoração para concatenação de `basePath`.
- [x] Workflow `deploy.yml` aprovado e criado com Action Runners oficiais.
- [x] README foi atualizado para vitrine.
- [x] SEO revisto usando padrão de alta empregabilidade.
- [x] Nenhum lock em Vercel, Netlify ou serviços pagos.

## 8. Próximos passos recomendados

1. Fazer o **commit** e **push** de todas essas mudanças para o seu repositório.
2. Abrir o seu repositório na web e se certificar de que as configurações de "Pages" estão configuradas para ler a partir de "GitHub Actions" em vez de Deploy a partir de branch (Deploy from branch).
3. Após visualizar a branch online, teste de forma definitiva a versão light/dark do seu site para garantir que tudo ocorreu conforme o esperado.
