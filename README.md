
# Procurauai - O seu guia comercial local

![Capa](https://procurauai.com.br/assets/img/og-image.png)

## 🚀 Sobre o Projeto

O Procurauai é um guia comercial completo e moderno para a cidade de Monte Santo de Minas e região. A plataforma tem como objetivo conectar consumidores a negócios, serviços e eventos locais de forma rápida, intuitiva e eficiente.

### ✨ Funcionalidades Principais

-   **Busca Inteligente:** Encontre o que precisa com filtros avançados e sugestões em tempo real.
-   **Listagens Detalhadas:** Informações completas sobre cada negócio, incluindo fotos, horários, contato e localização no mapa.
-   **Avaliações e Comentários:** Compartilhe suas experiências e ajude outros usuários.
-   **Eventos e Ofertas:** Fique por dentro de tudo que acontece na cidade.
-   **Perfil de Negócio:** Ferramentas para empresários gerenciarem suas listagens e interagirem com clientes.

### 🛠️ Tecnologias Utilizadas

-   **Frontend:**
    -   [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix)
    -   [TanStack Query](https://tanstack.com/query) e [React Router 6](https://reactrouter.com/)
-   **Backend & Infraestrutura:**
    -   [Supabase](https://supabase.com/) (Postgres + Auth + Storage)
    -   [Vercel](https://vercel.com/) (hospedagem e deploy)
-   **APIs Externas:**
    -   [Google Maps Platform](https://developers.google.com/maps) — Maps JavaScript, Embed e Static API
-   **Qualidade:**
    -   [Vitest](https://vitest.dev/) + Testing Library, [Playwright](https://playwright.dev/), ESLint, Husky + lint-staged

---

## 💻 Rodando o projeto na sua máquina

### 📋 Pré-requisitos

| Ferramenta | Versão | Como conferir |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 18 ou superior (recomendado: 20 LTS) | `node -v` |
| npm | vem junto com o Node | `npm -v` |
| [Git](https://git-scm.com/) | qualquer versão recente | `git --version` |

Você também vai precisar de:

-   Acesso ao projeto no [Supabase](https://supabase.com/) (URL + chave `anon`).
-   Uma chave da [Google Maps Platform](https://console.cloud.google.com/google/maps-apis) — **opcional**: sem ela o app roda normalmente e os mapas mostram um substituto desenhado em CSS. Veja [`docs/google-maps.md`](docs/google-maps.md).

### ⚙️ Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/ederrabelo81-crypto/procurauai.git
cd procurauai
```

**2. Instale as dependências**

```bash
npm install
```

> O projeto tem `package-lock.json` e `bun.lockb`. Escolha **um** gerenciador e mantenha o padrão: se usar npm, ignore o `bun.lockb`.

**3. Crie o arquivo `.env.local`**

Copie o modelo e preencha os valores:

```bash
cp .env.example .env.local
```

```dotenv
# Supabase → Project Settings → API
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon

# Ambiente: development | staging | production
VITE_ENVIRONMENT=development

# Opcionais
VITE_SENTRY_DSN=
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_MAPS_MAP_ID=
```

`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são **obrigatórias**: o app valida as
variáveis com Zod em `src/config/env.ts` e falha logo no start se faltarem.

> ⚠️ `.env.local` nunca vai para o Git. Só a chave `anon` (pública) pode ficar no
> front-end — a `service_role` jamais.

**4. Suba o servidor de desenvolvimento**

```bash
npm run dev
```

Abra <http://localhost:5173>. O Vite recarrega sozinho a cada alteração.

**5. Confira se está tudo certo**

```bash
npm test          # testes unitários (Vitest)
npm run lint      # ESLint
npm run build     # build de produção em dist/
npm run preview   # serve o build para conferência local
```

Se algo falhar em `npm install`, apague `node_modules` e o lockfile local e
reinstale: `rm -rf node_modules && npm install`.

### 🧭 Rotas úteis em desenvolvimento

| Rota | O que mostra |
| --- | --- |
| `/` | Home com os 9 blocos de descoberta |
| `/buscar` | Busca global e categorias |
| `/mapa` | Mapa da cidade (precisa da chave do Google Maps) |
| `/debug-env` | Diagnóstico das variáveis de ambiente carregadas |

### 📦 Build para Produção

```bash
npm run build
```

A saída vai para `dist/`.

### 🚀 Deploy

O deploy é feito pela Vercel a cada `push` na branch `main`.

1.  No painel da Vercel, vá em `Settings` → `Environment Variables`.
2.  Cadastre as mesmas variáveis do `.env.local` (`VITE_SUPABASE_URL`,
    `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_MAP_ID`,
    `VITE_ENVIRONMENT=production`).
3.  Faça o push — a Vercel builda e publica automaticamente.

> Ao publicar, lembre de adicionar o domínio de produção nas restrições da chave
> do Google Maps, senão os mapas param de carregar em produção.

---

## 🎨 Design System

A interface segue o design system **"Almanaque"** — papel quente, tinta marrom,
terracota dominante, azulejo e mostarda como acentos. Tipografia: **Fraunces**
(títulos), **Archivo** (interface) e **Azeret Mono** (rótulos e números).

Tokens em `src/index.css`, escalas em `tailwind.config.ts`.
Guia completo: [`docs/design-system.md`](docs/design-system.md).

---

## 🗺️ Google Maps

Toda a integração passa por `src/lib/maps.ts` e pelos componentes em
`src/components/maps/`. **Nunca** escreva uma chave de API direto no componente.
Guia de configuração: [`docs/google-maps.md`](docs/google-maps.md).

---

## 📊 Documentação de Negócio e Expansão

-   **[Resumo Executivo](docs/RESUMO-EXECUTIVO.md)** — Visão geral do modelo de negócio, mercado e potencial financeiro
-   **[Análise Completa de Negócio](docs/analise-negocio-expansao.md)** — Validação da ideia, expansão regional, monetização e riscos
-   **[Implementação Técnica - Otimização API](docs/implementacao-otimizacao-api.md)** — Guia passo-a-passo para eliminar consumo recorrente da API Google Maps

### Plano de Expansão Regional

| Fase | Cidades | Habitantes | Período |
|------|---------|-----------|---------|
| Base | Monte Santo de Minas | 22 mil | Agora |
| 1 | Arceburgo + Itamogi | 20 mil | Mês 2-3 |
| 2 | Guaranésia | 19 mil | Mês 3-4 |
| 3 | São Sebastião do Paraíso + Guaxupé | 123 mil | Mês 4-6 |
| 4 | Passos (futuro) | 114 mil | Ano 2 |

**Total região:** ~298.000 habitantes | ~10.400 estabelecimentos potenciais

---

## 🗺️ Roadmap do Projeto

-   [ ] **Módulo de Anúncios:** Sistema de banners e destaques pagos.
-   [ ] **Integração com WhatsApp Business API:** Agendamentos e pedidos direto da plataforma.
-   [ ] **App PWA (Progressive Web App):** Melhorias para instalação no celular e uso offline.
-   [ ] **Painel Administrativo:** Gestão de usuários, listagens e conteúdo.
-   [ ] **Sistema de Notificações:** Alertas sobre novas ofertas, eventos e mensagens.

---

## 🤝 Como Contribuir

Contribuições são o que fazem a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

1.  **Faça um Fork** do projeto.
2.  **Crie uma Branch** para sua Feature (`git checkout -b feature/AmazingFeature`).
3.  **Faça o Commit** de suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`).
4.  **Faça o Push** para a Branch (`git push origin feature/AmazingFeature`).
5.  **Abra um Pull Request**.

---

## 📄 Licença

Distribuído sob a Licença MIT. Veja `LICENSE` para mais informações.

---

## 🏆 Reconhecimento e Padrões

-   **Estrutura de Pastas:** Mantemos uma estrutura organizada para facilitar a manutenção e escalabilidade.

    ```
    /src
    ├── assets         # Imagens, fontes, etc.
    ├── components     # Componentes React reutilizáveis
    │   ├── ui         # Componentes de UI genéricos (botões, cards)
    │   ├── cards      # Cards de listagem por tipo de conteúdo
    │   ├── home       # Cabeçalho, letreiro e blocos da home
    │   ├── listing    # Seções das páginas de detalhe
    │   ├── maps       # Provider e componentes do Google Maps
    │   └── common     # Componentes de domínio específico
    ├── data           # Mock data, dados estáticos
    ├── hooks          # React Hooks customizados
    ├── config         # Validação das variáveis de ambiente (Zod)
    ├── lib            # Funções utilitárias, configs (inclui maps.ts)
    ├── pages          # Componentes de página (rotas)
    ├── services       # Lógica de negócio, chamadas de API
    ├── styles         # Estilos globais
    └── App.tsx        # Componente principal
    └── main.tsx       # Ponto de entrada da aplicação
    ```

-   **Qualidade de Código:**
    -   **ESLint:** Para garantir um padrão de código consistente.
    -   **Prettier:** Para formatação automática do código.

---

### Padrões de Commit
**Seguimos Conventional Commits:<br>**
feat: nova funcionalidade <br>
fix: correção de bug <br>
docs: alteração em documentação <br>
style: formatação, ponto e vírgula, etc <br>
refactor: refatoração de código <br>
test: adição ou correção de testes <br>
chore: tarefas de manutenção <br>


---

### 👥 Time <br>
Criado e mantido por:<br>
Eder Rabelo (@ederrabelo81-crypto)

### 📞 Contato

📧 Email: ederrabelo81@gmail.com<br>
💬 Issues: GitHub Issues<br>
📱 WhatsApp: (11) 98193-7266<br>

### 🙏 Agradecimentos

Comunidades de desenvolvedores React e TypeScript<br>
Contributors e early adopters<br>
Associações comerciais locais parceiras<br>


Desenvolvido com ❤️ para a comunidade de **Monte Santo de Minas** e região
