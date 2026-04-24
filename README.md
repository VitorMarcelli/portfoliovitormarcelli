# Portfólio Profissional | Vitor Marcelli

Portfólio profissional desenvolvido para apresentar minha trajetória, habilidades técnicas, projetos, experiências e soluções digitais como Desenvolvedor Full Stack.

O objetivo deste projeto é centralizar minha presença profissional em uma página moderna, responsiva e acessível, facilitando a apresentação do meu trabalho para clientes, empresas, recrutadores e parceiros de tecnologia.

## Projeto online

Acesse o portfólio publicado:

https://vitormarcelli.github.io/portfoliovitormarcelli/

## Sobre o projeto

Este portfólio foi criado para representar minha atuação como desenvolvedor, reunindo informações relevantes sobre minha experiência, principais tecnologias, projetos desenvolvidos e canais de contato.

A proposta é ir além de uma página estática simples. O projeto foi construído com foco em performance, organização, responsividade, identidade visual moderna e facilidade de manutenção.

Ele também serve como uma vitrine técnica, demonstrando conhecimentos em desenvolvimento frontend moderno, estruturação de aplicações com Next.js, componentização, estilização com Tailwind CSS e publicação automatizada com GitHub Actions.

## Objetivos do portfólio

- Apresentar minha trajetória profissional de forma clara e objetiva.
- Reunir projetos, experiências e habilidades técnicas em um único lugar.
- Facilitar o contato com empresas, clientes e recrutadores.
- Demonstrar domínio em tecnologias modernas de desenvolvimento web.
- Criar uma base escalável para evolução contínua do meu posicionamento profissional.

## Tecnologias utilizadas

O projeto foi desenvolvido utilizando tecnologias modernas do ecossistema web:

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- React
- GitHub Pages
- GitHub Actions

## Funcionalidades

- Página profissional responsiva.
- Seção de apresentação pessoal.
- Seção de tecnologias e habilidades.
- Seção de projetos.
- Links para contato profissional.
- Integração com GitHub e LinkedIn.
- Layout moderno e adaptável.
- Deploy automatizado via GitHub Actions.
- Publicação gratuita via GitHub Pages.
- Estrutura preparada para evolução futura.

## Diferenciais técnicos

Este projeto foi estruturado considerando boas práticas importantes para aplicações frontend modernas:

- Componentização organizada.
- Uso de TypeScript para maior segurança no desenvolvimento.
- Estilização com Tailwind CSS.
- Animações com Framer Motion.
- Exportação estática compatível com GitHub Pages.
- Configuração de `basePath` para funcionamento correto em subdiretório.
- Pipeline de deploy automatizado.
- SEO básico configurado.
- README preparado como vitrine técnica do projeto.

## Estrutura do projeto

```txt
portfoliovitormarcelli/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── projects/
├── src/
│   ├── app/
│   ├── components/
│   ├── sections/
│   └── ...
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Como rodar localmente

Clone o repositório:

```bash
git clone https://github.com/VitorMarcelli/portfoliovitormarcelli.git
```

Acesse a pasta do projeto:

```bash
cd portfoliovitormarcelli
```

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Depois acesse no navegador:

```txt
http://localhost:3000
```

## Como gerar o build

Para gerar a versão de produção:

```bash
npm run build
```

O projeto está configurado para exportação estática, gerando os arquivos necessários para publicação no GitHub Pages.

## Deploy

O deploy é feito automaticamente via GitHub Actions.

Sempre que houver um push para a branch `main`, o workflow localizado em:

```txt
.github/workflows/deploy.yml
```

executa o processo de build e publica o resultado no GitHub Pages.

URL de produção:

```txt
https://vitormarcelli.github.io/portfoliovitormarcelli/
```

## Autor

Desenvolvido por Vitor Marcelli.

Sou Desenvolvedor Full Stack com experiência em desenvolvimento de sistemas web, automações, integrações com APIs, soluções com IA, WordPress, React, Next.js, Python, backend, frontend e DevOps.

Tenho foco em criar soluções digitais úteis, escaláveis e alinhadas às necessidades reais de clientes e empresas.

## Contato profissional

LinkedIn:

https://www.linkedin.com/in/vitor-augusto-marcelli-ba4070220/

GitHub:

https://github.com/VitorMarcelli

Portfólio:

https://vitormarcelli.github.io/portfoliovitormarcelli/

## Licença

Este projeto está licenciado sob a licença MIT.

Consulte o arquivo `LICENSE` para mais detalhes.
