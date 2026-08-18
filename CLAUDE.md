# CLAUDE.md

Guia para agentes de IA (Claude Code e afins) trabalhando neste repositório.
Documentação para humanos fica no [`README.md`](README.md) e em [`docs/`](docs/).

---

## 1. O que é o projeto

**Procura UAI** — guia comercial local de Monte Santo de Minas / MG e região:
comércios, serviços, ofertas, eventos, notícias, falecimentos, classificados,
imóveis, vagas, carros e lugares. SPA em React servida pela Vercel, com
Supabase (Postgres) como backend e Google Maps para mapas/rotas.

**Idioma:** o produto, os comentários de código, os commits e a documentação são
em **português do Brasil**. Escreva novos comentários, mensagens de UI e docs em
pt-BR. Identificadores de código seguem inglês/português misto conforme o
arquivo vizinho — imite o arquivo que você está editando.

**Estado real (importante):** boa parte da interface ainda é alimentada por
`src/data/mockData.ts` (~14 mil linhas de dados falsos), com o Supabase usado
como fonte primária apenas em alguns caminhos. Veja §6.

---

## 2. Comandos

```bash
npm install          # instalação (existe package-lock.json E bun.lockb; use npm)
npm run dev          # Vite dev server
npm run build        # build de produção → dist/
npm run build:dev    # build com mode=development
npm run preview      # serve o build
npm test             # Vitest (roda uma vez) — é o que o CI executa
npm run test:watch   # Vitest em watch
npm run lint         # ESLint
```

Sempre rode `npm test` e `npm run lint` antes de commitar. O CI
(`.github/workflows/ci.yml`, Node 20) roda **apenas `npm run test`** — lint e
build quebrados passam pelo CI, então valide localmente.

**Porta do dev server:** `vite.config.ts` fixa `server.port: 8080`. O
`README.md` e o `playwright.config.ts` falam em `5173`. Ao instruir alguém a
abrir o app, use **8080** (o que o Vite realmente usa), ou corrija a config —
não repita o número errado.

---

## 3. Stack

| Camada | Tecnologia |
| --- | --- |
| Build | Vite 5 + `@vitejs/plugin-react-swc` |
| UI | React 18, TypeScript 5, Tailwind 3, shadcn/ui (Radix) |
| Rotas | React Router 6 (`BrowserRouter`, rotas em `src/App.tsx`) |
| Dados remotos | Supabase JS v2 (`@supabase/supabase-js`) |
| Estado de servidor | TanStack Query 5 (configurado em `App.tsx`, uso ainda parcial) |
| Mapas | `@vis.gl/react-google-maps` + Maps Embed/Static/URLs API |
| Validação | Zod (env e linhas do Supabase) |
| Testes | Vitest + Testing Library (jsdom); Playwright configurado mas **sem specs** |
| Hooks de git | Husky + lint-staged |

---

## 4. Estrutura de pastas

```
src/
├── App.tsx              # providers + tabela de rotas (fonte da verdade de rotas)
├── main.tsx             # bootstrap do React
├── index.css            # tokens do design system + @layer components
├── config/env.ts        # validação Zod de import.meta.env → export `env`
├── components/
│   ├── ui/              # shadcn/ui (minúsculo: button.tsx) + componentes próprios (PascalCase)
│   ├── cards/           # cards de listagem por tipo de conteúdo
│   ├── home/            # masthead, ticker e blocks/ da home
│   ├── listing/         # seções das páginas de detalhe
│   ├── maps/            # MapsProvider, MapEmbed, MiniMap, MapPlaceholder
│   ├── common/, icons/, seo/
│   └── ErrorBoundary.tsx
├── pages/               # um componente por rota
├── hooks/               # hooks de dados e de UI
├── services/            # acesso ao Supabase + retry/timeout/queryKeys
├── lib/                 # taxonomia, maps, cache, erros, logging, utils
├── data/mockData.ts     # dados falsos (14k linhas) usados como fallback
├── types/               # ids "branded", featureFlags, errors
└── test/setup.ts        # setup do Vitest (jest-dom + stub de matchMedia)

docs/          # guias em pt-BR (índice em docs/README.md)
scripts/       # scripts Node avulsos (coleta/import/tradução) — rodam fora do app
supabase/      # schema.sql aplicado no projeto Supabase
```

---

## 5. Arquitetura e fluxo de dados

### Camadas

```
página (src/pages) → hook (src/hooks) → service (src/services) → supabase client
                                      ↘ fallback: src/data/mockData.ts
```

- **`src/services/`** é onde as queries ao Supabase devem morar. Componentes não
  deveriam chamar `supabase.from(...)` direto — hoje `useSearchEngine.ts`,
  `pages/BusinessDetail.tsx` e `pages/MapPage.tsx` ainda fazem isso; ao mexer
  nesses arquivos, prefira mover a query para um service.
- **`src/services/supabaseRequest.ts`** (`executeSupabase`) envolve uma operação
  com timeout (8 s) + retry exponencial, decidindo retry pelo `retryable` do
  `AppError`. Use-o para chamadas novas.
- **`src/lib/cache.ts`** é um cache em memória com TTL (padrão 5 min), usado por
  `getBusinessesByCategorySlug`. Chaves em `BUSINESS_CACHE_KEYS`.
- **TanStack Query** já está montado em `App.tsx` com `staleTime` de 60 s e
  retry baseado em `reportError`. Chaves ficam em `src/services/queryKeys.ts`.

### Erros

`src/lib/errors/` define `AppError` (com `code`, `userMessage`, `severity`,
`retryable`), `SupabaseRequestError` e o `errorHandler`:

- `normalizeError(unknown) → AppError` — classifica; erros Supabase com status
  429 ou ≥500 viram `retryable`.
- `reportError(error, context)` — normaliza, loga via `lib/logging/logger` e
  devolve o `AppError`. **Use `reportError` em vez de `console.error`** em
  código novo (parte do código legado ainda usa `console.error`).

### Taxonomia (regra central)

`src/lib/taxonomy.ts` é a **única fonte de verdade** para a estrutura
Listing Type → Categoria → Tags (`comer-agora`, `negocios`, `servicos`, …).
Inclui `LEGACY_SLUG_MAP` e `resolveListingTypeId()` para normalizar slugs
antigos. Ao adicionar um tipo/categoria/tag, edite **este arquivo**; não
espalhe listas de slugs por componentes.

A heurística "adivinha a categoria pelo nome" mora em
`src/lib/categoryHeuristics.ts` — **fonte única** das palavras-chave, usada por
`services/businesses.ts` e `lib/dataNormalization.ts`. O trigger
`set_business_category_slug()` (`supabase/schema.sql`) roda no banco e continua
sendo uma cópia, mas `src/lib/__tests__/categoryHeuristics.test.ts` lê o SQL e
quebra se os dois lados divergirem. Ao acrescentar uma palavra, acrescente nos
dois — o teste cobra.

A classificação acontece em **duas etapas** (`guessBusinessCategorySlug()` no
front, `set_business_category_slug()` no banco):

1. **nome + categoria** — o sinal forte;
2. **descrição** — só quando a etapa 1 não casou nada.

A ordem não é detalhe. A carga inicial gravou 351 comércios com `category`
uniformemente "Serviços" e nome sem palavra-chave ("Alforria", "Casa da Sogra"),
que por isso caíam no fallback; a descrição desses registros carrega o tipo do
Google em pt-BR ("Bar em Centro. Nota 4,2 (18 avaliações).") e resolve o caso.
Concatenar tudo numa etapa só faria a descrição atropelar nomes confiantes —
"Barbearia do Alisson" com descrição "Loja em Centro" viraria `negocios`.
`matchCategorySlug()` devolve `null` em vez de fallback justamente para as duas
etapas conseguirem distinguir "não casou" de "casou serviço".

Detalhe que já custou caro: o limite de palavra no Postgres é `\y`, não o `\b`
do PCRE. A versão anterior do trigger usava `bar\\b`, que nunca casava, e todo
bar da base foi classificado como `servicos`.

Mudança no trigger não chega sozinha ao banco: `supabase/schema.sql` é o estado
desejado, e o SQL para aplicar em produção (mais o backfill dos registros já
gravados) fica em `supabase/migrations/`.

### Planos

`src/lib/planUtils.ts` define o gating de features por plano
(`free` / `pro` / `destaque`) via `PLAN_FEATURES` e `hasFeature()`. O mesmo
mapa é espelhado no banco (`plan_features` / `plan_feature_map`, ver
`docs/database/README.md`). Componentes usam `LockedFeature` / `PlanBadge`
para o estado bloqueado.

### Rotas

Todas em `src/App.tsx`. Padrão de URLs em português:
`/buscar`, `/categoria/:categoryId`, `/comercio/:categorySlug?/:id`,
`/anuncio|/oferta|/evento|/noticia|/falecimento/:id`, listas `/lugares`,
`/carros`, `/empregos`, `/imoveis` com detalhes `/lugares/:slug` etc.,
`/mapa`, `/publicar`, `/perfil`, `/debug-env` (diagnóstico de env) e `*`.
Ao criar uma página, registre a rota aqui **e** o link de origem — rotas órfãs
já causaram 404 neste projeto.

---

## 6. Mock data vs. Supabase — leia antes de mexer em dados

`src/data/mockData.ts` é importado por ~47 arquivos. O padrão atual em vários
blocos da home é: busca no Supabase → se vier vazio ou der erro, cai no mock
(ex.: `components/home/blocks/ComerAgoraBlock.tsx`, `hooks/useSearchEngine.ts`).

Consequências práticas:

- **Tela cheia não significa banco populado.** Ao depurar "por que não aparece
  X", verifique se o dado veio do Supabase ou do fallback.
- Não amplie o uso de mock em código novo; prefira Supabase com estado vazio
  explícito.
- Ao remover um fallback, confirme que a query real cobre o caso — o mock está
  escondendo lacunas de dados de propósito enquanto a base é populada
  (`docs/manual-proximo-passo.md`, `docs/coleta-de-dados.md`).

### Fotos (`src/lib/businessPhotos.ts`)

Toda foto de comércio passa por `resolveBusinessPhotos()`. Nunca leia
`row.cover_images` direto: a coluna é `jsonb` e a base tem array de strings,
array de objetos e JSON dentro de string — `parsePhotoList()` entende as três e
descarta entradas vazias (`<img src="">` renderiza como imagem quebrada).

A cadeia de resolução, em ordem: foto gravada (`cover_images`, e também
`coverImage`/`gallery`/`images` dos tipos do mock) → `logo`/`logo_url` → acervo
curado casado por nome → Street View das coordenadas → `/placeholder.svg`.

Ao renderizar, use `SmartImage` (`src/components/ui/SmartImage.tsx`) em vez de
`<img>`: ele percorre as candidatas no `onError` e sempre termina no
placeholder, então URL morta não deixa ícone quebrado na tela.

**O degrau do Street View é meio síncrono, meio assíncrono.**
`resolveBusinessPhotos()` é síncrona e só oferece a fachada quando a cobertura
daquela coordenada já é conhecida — nem todo endereço tem panorama, e pedir a
imagem onde não há gasta cota paga à toa. Quem descobre é
`src/lib/streetView.ts`, pelo endpoint de **metadados** (JSON, gratuito),
com cache por coordenada arredondada (~1 m) em memória + `sessionStorage`.

Componente que exibe capa de comércio sem foto própria precisa chamar
`useStreetViewProbe(position)`: ele dispara a consulta e re-renderiza quando a
resposta chega. Sem o probe, o comércio nunca sai do mapa/placeholder.

A checagem é **otimização, nunca requisito**: se a consulta falhar (CORS, rede),
o resultado vira `"assumida"` e a imagem é pedida assim mesmo, com o `onError`
do `SmartImage` cobrindo o resto. Nenhum comércio perde a capa porque a
checagem não pôde rodar.

Sem `VITE_GOOGLE_MAPS_API_KEY` nada disso acontece — nem consulta, nem imagem.

**Clientes Supabase duplicados:** existem `src/lib/supabaseClient.ts` (valida as
env vars e lança erro se faltarem) e `src/lib/supabaseClient.js` (sem
validação), além de `src/hooks/useSupabase.js` e `src/lib/supabaseStorage.js`
em JS puro. Importe sempre `@/lib/supabaseClient` — o resolver do Vite pega o
`.ts`. Não crie novos arquivos `.js` em `src/`.

---

## 7. Convenções de código

- **Alias `@/` → `src/`** (definido em `vite.config.ts`, `vitest.config.ts` e
  `tsconfig.app.json`). Use `@/...` em vez de caminhos relativos longos.
- **ESLint (regras que quebram o build de lint):**
  - `@typescript-eslint/no-explicit-any`: **error** — sem `any`. Onde for
    inevitável (linhas cruas do Supabase), use `unknown` + validação Zod, ou
    isole com `// eslint-disable-next-line` e um comentário explicando.
  - `@typescript-eslint/consistent-type-imports`: **error** — `import type { X }`
    para tipos.
  - `@typescript-eslint/no-unused-vars`: warn.
- **TypeScript não é estrito** (`strict: false`, `noImplicitAny: false` em
  `tsconfig.app.json`). Isso é herança do template, não um convite: tipe o
  código novo como se fosse estrito.
- **Tipos branded** em `src/types/ids.ts` (`BusinessId`) para IDs de domínio.
- **shadcn/ui**: componentes gerados ficam em `src/components/ui/` com nome em
  minúsculas (`button.tsx`); componentes próprios usam PascalCase
  (`SearchBar.tsx`). Config em `components.json`. Evite editar os gerados —
  componha por cima.
- **Estilos**: Tailwind com tokens. Nunca use cor crua (`bg-orange-500`); use os
  tokens semânticos (`bg-primary`, `text-muted-foreground`, `bg-card`, …).
- **`console.log`** só para scripts em `scripts/`; no app, use
  `lib/logging/logger` ou `reportError`.

---

## 8. Design system "Almanaque"

Referência completa: [`docs/design-system.md`](docs/design-system.md).
Tokens em `src/index.css` (bloco `:root` + bloco `.dark` escrito à mão),
expostos ao Tailwind em `tailwind.config.ts`.

Regras que não devem ser quebradas:

- **Terracota (`primary`) domina**; azulejo (`secondary`) e mostarda (`accent`)
  são acentos pontuais.
- Nenhum cinza neutro puro — todo cinza tem temperatura.
- Ao criar um token novo, **defina os dois valores** (claro e escuro). O tema
  escuro é uma segunda paleta, não uma inversão automática.
- Tipografia por função: `font-display` (Fraunces) para títulos, `font-sans`
  (Archivo) para interface, `font-mono` (Azeret Mono) para números, preços,
  distâncias e micro-labels.
- Classes utilitárias próprias em `@layer components` do `index.css`:
  `.almanac-card`, `.stamp`, `.eyebrow`, `.rule-line`, `.logo-mark`
  (obrigatória em `<img src="/logo.svg">`), `.reveal` / `.reveal-stagger`,
  `.bg-hatch`, `.bg-grid`, `.scrollbar-hide`, `.fade-edges`, `.safe-bottom`.

---

## 9. Google Maps

Guia: [`docs/google-maps.md`](docs/google-maps.md).

- **Toda** integração passa por `src/lib/maps.ts` e `src/components/maps/`.
  Nunca leia `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` num componente nem
  monte URL do Maps na mão.
- `MapsProvider` (montado na raiz em `App.tsx`) carrega a Maps JavaScript API
  **uma única vez**; componentes consomem `useMapsReady()`.
- **A chave é opcional.** Sem `VITE_GOOGLE_MAPS_API_KEY`, `hasMapsKey` é
  `false`, `mapsEmbedUrl`/`mapsStaticUrl` retornam `null` e a UI cai no
  `MapPlaceholder` desenhado em CSS. Qualquer código novo de mapa precisa
  tratar esse caminho.
- Links "abrir no Maps" (`mapsSearchUrl`, `mapsDirectionsUrl`) usam a Maps URLs
  API — públicos, sem chave e sem cota.
- Utilidades de geo: `toLatLng`, `distanceKm` (Haversine), `formatDistance`
  (formato pt-BR: `320 m`, `1,4 km`).

---

## 10. Variáveis de ambiente

Validadas com Zod em `src/config/env.ts` — o app **falha no start** se faltar
algo obrigatório. Modelo em `.env.example`; valores locais em `.env.local`
(git-ignored).

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | sim | chave pública `anon` |
| `VITE_ENVIRONMENT` | não (default `development`) | `development` \| `staging` \| `production` |
| `VITE_SENTRY_DSN` | não | observabilidade |
| `VITE_GOOGLE_MAPS_API_KEY` | não | mapas (sem ela, fallback em CSS) |
| `VITE_GOOGLE_MAPS_MAP_ID` | não | `AdvancedMarker` + estilo na nuvem (fallback `DEMO_MAP_ID`) |

Regras: **nunca** commite `.env.local` nem qualquer chave. Somente a chave
`anon` pode ir para o front-end — a `service_role` só existe em scripts
executados localmente (`scripts/*.mjs`, via `process.env`). A rota `/debug-env`
mostra o estado das variáveis carregadas.

---

## 11. Banco de dados (Supabase)

⚠️ **O banco de produção não segue `supabase/schema.sql`.** O projeto real usa a
proposta mais ampla de `docs/database/schema.sql` (PostGIS, `chips`,
`mini_site_panels`): em `businesses` as coordenadas são `latitude`/`longitude`
(não `lat`/`lng`), existem `city`/`state`/`hours_text` e `cover_images` é `jsonb`.
Antes de escrever query nova, confira as colunas reais no painel — os dois
arquivos de schema divergem e o front-end ainda referencia os dois nomes.
`scripts/import-businesses.mjs` contorna isso descobrindo as colunas em runtime
(`scripts/lib/businessRow.mjs`).

- Schema de produção (desatualizado, ver aviso acima):
  [`supabase/schema.sql`](supabase/schema.sql) — enums
  (`business_plan`, `listing_type`, `car_fuel_type`, …), tabelas
  (`businesses`, `listings`, `deals`, `events`, `news`, `obituaries`, …),
  helpers `slugify()`/`set_slug()` e o trigger `set_business_category_slug()`
  que preenche `category_slug` por regex.
- Proposta mais ampla (PostGIS, chips, painéis de mini-site):
  [`docs/database/README.md`](docs/database/README.md) + `docs/database/schema.sql`.
- Scripts pontuais aplicados em produção pelo SQL Editor:
  [`supabase/migrations/`](supabase/migrations/) — um arquivo por mudança,
  idempotente, com prévia (`select`) antes de qualquer `update`/`drop`. Não é
  um sistema de migração de verdade: ninguém roda isso automaticamente.
- Problemas conhecidos e receitas de correção:
  [`docs/supabase/troubleshooting.md`](docs/supabase/troubleshooting.md)
  (ex.: `record "new" has no field "slug"`).
- Ao alterar colunas usadas pelo front, atualize **os dois lados**: o `select`
  no service e o schema SQL.

---

## 12. Testes

- Vitest com `environment: "jsdom"`, `globals: true`, setup em
  `src/test/setup.ts` (jest-dom + stub de `matchMedia`).
- **As variáveis de ambiente dos testes ficam em `vitest.config.ts`** (bloco
  `test.env`), com valores de mentira. `src/config/env.ts` valida com Zod e
  derruba o processo se faltar alguma, então sem isso todo teste que importe um
  módulo que use `env` quebra na coleta. Antes o CI passava porque havia um
  `.env.local` versionado no repositório — não faça isso voltar: é o arquivo
  onde os scripts mandam gravar a `SUPABASE_SERVICE_ROLE_KEY`.
- Padrão de arquivo: `src/**/__tests__/*.test.ts(x)` ou `*.test.ts` ao lado.
- Cobertura atual é pequena: `services/__tests__/businesses.test.ts`,
  `components/__tests__/ListingCard.test.tsx`, três testes de hooks e
  `test/example.test.ts`. Ao tocar em service ou hook, adicione teste.
- Supabase é mockado com `vi.mock("@/lib/supabaseClient", ...)` devolvendo um
  objeto encadeável (`select/in/or/limit`) — veja
  `services/__tests__/businesses.test.ts` como referência.
- **Playwright** está configurado (`playwright.config.ts`, baseURL 5173) mas
  **não há nenhum spec E2E** no repo. Não afirme que existem testes E2E.

---

## 13. Git, commits e PRs

- **Conventional Commits** em pt-BR: `feat:`, `fix:`, `docs:`, `style:`,
  `refactor:`, `test:`, `chore:`.
- Husky roda `lint-staged` no pre-commit: `eslint --fix` + `prettier --write`
  em `src/**/*.{ts,tsx}`. **Atenção:** `prettier` não está em
  `devDependencies` — o hook depende de resolução via `npx`/cache e pode falhar
  em ambiente limpo. Se o commit quebrar por causa disso, instale o Prettier
  como devDependency em vez de desabilitar o hook.
- Template de PR em `.github/PULL_REQUEST_TEMPLATE.md` (Summary / Testing /
  Screenshots). Preencha as três seções.
- Deploy: push em `main` → Vercel builda e publica. Variáveis de ambiente
  precisam estar cadastradas no painel da Vercel.

---

## 14. Scripts utilitários (`scripts/`)

Rodam com Node, **fora** do app, e usam `process.env` (não `import.meta.env`):

| Script | O que faz |
| --- | --- |
| `collect-places.mjs` | coleta comércios via Google Places API (New) → JSON + CSV em `data/places/` (git-ignored); aceita `--dry-run`, `--cities`, `--categories`, `--max-pages`, `--help` |
| `import-businesses.mjs` | importa o JSON revisado para `businesses`, deduplicando por `google_place_id`, por nome+cidade contra o banco **e entre os registros do próprio arquivo**; aceita `--dry-run`, `--update`, `--limit`, `--allow-name-duplicates` |
| `fix-descriptions.mjs` | reescreve as descrições da carga inicial em pt-BR (tipo do Google traduzido por `lib/googleTypes.mjs`) e deixa a nota com 1 casa decimal; determinístico e idempotente, sem custo de API |
| `validate-businesses.mjs` | curadoria manual: exporta os pendentes para CSV, o revisor decide em planilha (`action` = verified/rejected/needs_update) e reimporta; aceita `--dry-run`, `--export-csv`, `--import-csv`, `--city`, `--status`, `--limit`, `--verified-by`, `--help` |
| `translate-businesses.mjs` | traduz `description` para pt-BR via DeepL e normaliza `rating` |
| `check-database-content.ts` | inspeciona categorias/contagens no banco |

Os três primeiros exigem `SUPABASE_SERVICE_ROLE_KEY` e/ou
`GOOGLE_MAPS_API_KEY` / `DEEPL_API_KEY`. Sempre ofereça `--dry-run` antes de
escrever no banco.

**Credenciais dos scripts:** use `scripts/lib/env.mjs` (`readEnv`,
`loadEnvFiles`, `formatEnvHelp`) em vez de ler `process.env` direto — ele carrega
`.env.local`/`.env` via `process.loadEnvFile` e dá precedência ao que está
exportado no shell. Dois detalhes que já causaram confusão:

- a chave do Maps dos scripts precisa ser **separada** da
  `VITE_GOOGLE_MAPS_API_KEY` do front-end, que é restrita por referenciador HTTP
  e falha fora do navegador;
- `SUPABASE_SERVICE_ROLE_KEY` não é a `anon`/`publishable`;
  `looksLikePublicSupabaseKey()` detecta a troca antes de o erro virar um
  *row-level security policy* incompreensível. A URL, por não ser secreta, aceita
  `VITE_SUPABASE_URL` como fallback.

Erros de conexão/permissão do Supabase passam por
`describeSupabaseFailure()` (`scripts/lib/supabase.mjs`). Testes dos helpers
puros ficam em `scripts/__tests__/` (incluídos no `vitest.config.ts`).

**Curadoria por planilha (`validate-businesses.mjs`):** a Places API não entrega
WhatsApp, que é o dado que converte. Por isso o que vai ao ar é o que passou por
revisão humana: o script exporta os pendentes, a pessoa revisa no Excel/Sheets e
o script reimporta. Três detalhes que o formato exige:

- **O CSV é lido pelo nome do cabeçalho, não pela posição.** O revisor reordena
  colunas sem quebrar a importação. O parser fica em `scripts/lib/csv.mjs` e
  segue RFC 4180 — endereço com vírgula (`"Rua São João, 320 - Centro"`) não
  parte a linha no meio. Um `split(",")` ingênuo lê a coluna errada como decisão
  e grava status trocado sem reclamar; foi assim na primeira versão.
- **`verified_by` só entra com `--verified-by=UUID`.** A coluna é FK para
  `auth.users` e um UUID inventado derruba a gravação inteira.
- **Só `phone` e `whatsapp` voltam da planilha.** As outras colunas viajam para
  o revisor se localizar; nome, categoria e endereço se corrigem no painel.

O módulo exporta `planUpdate()` e só chama `main()` quando executado direto, para
os testes poderem exercitar a decisão sem tocar no banco.
Documentação:
[`docs/coleta-de-dados.md`](docs/coleta-de-dados.md) e
[`docs/supabase/translation-script.md`](docs/supabase/translation-script.md).

---

## 15. Dívida técnica conhecida

Não "conserte" isso de passagem sem combinar; mas saiba que existe:

- `src/data/mockData.ts` com 14k linhas usado como fallback em toda a home.
- Clientes Supabase duplicados (`.ts` e `.js`) e módulos JS soltos em `src/`.
- Arquivos `_old` mortos: `components/home/TrendingSection_old.tsx`,
  `components/home/blocks/ComerAgoraBlock_old.tsx`.
- Heurística de categoria espelhada no trigger SQL (o front já usa fonte única
  em `lib/categoryHeuristics.ts`; um teste compara os dois lados).
- A carga inicial gravou 351 comércios sem foto (`cover_images: []`, por
  política de fotos do Google). Enquanto os comerciantes não sobem as próprias
  imagens, a capa vem do acervo curado em `mockData.ts` por casamento de nome —
  ver `src/lib/businessPhotos.ts`. É uma ponte, não um destino.
- Dois lockfiles (`package-lock.json` e `bun.lockb`).
- Divergência de porta do dev server (8080 na config, 5173 no README/Playwright).
- CI roda só os testes; `lint` e `build` não são verificados.
- `tsconfig` com `strict: false`.

---

## 16. Ao terminar uma tarefa

1. `npm run lint` e `npm test` — ambos limpos.
2. `npm run build` quando tiver mexido em imports, config ou rotas.
3. Atualize a doc relevante em `docs/` (e este arquivo, se mudou convenção,
   comando ou estrutura).
4. Commit em Conventional Commits, PR usando o template.
