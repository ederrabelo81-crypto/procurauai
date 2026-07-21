# Manual — Procura UAI: Diagnóstico e Plano de Ação para Rentabilização

**Data da análise:** 21/07/2026
**Escopo:** revisão completa do código, banco de dados e estrutura do projeto, com plano passo a passo para tornar o produto funcional e começar a rentabilizá-lo como retail media em Monte Santo de Minas e região.

---

## 1. Resumo executivo

**O projeto funciona?** Parcialmente. O site compila sem erros, os testes passam e a interface é bonita e completa. Porém, **a maior parte do que aparece na tela hoje é simulação**: cerca de 90% do conteúdo vem de um arquivo de dados falsos (`src/data/mockData.ts`, com 14 mil linhas), e não do banco de dados real. Na prática, hoje o Procura UAI é um **protótipo visual de alta qualidade**, não um produto em operação.

**Tem potencial?** Sim, e acima da média para projetos desse tipo:

- A arquitetura é moderna e barata de operar (React + Supabase + Vercel — dá para rodar por R$ 0–50/mês no início).
- O modelo de planos (Grátis / Pro / Destaque) **já está desenhado no código e no banco** — a fundação da monetização existe.
- Guias comerciais de cidades pequenas têm pouca concorrência direta e alto valor local: em Monte Santo de Minas (~22 mil habitantes) não há player estabelecido, e o formato "tudo da cidade num lugar só" (comércios + ofertas + eventos + empregos + imóveis + falecimentos) gera visitas recorrentes — que é exatamente o que você vende para anunciantes.
- O caminho de retail media é viável, mas **depende de audiência real e métricas** — anunciante local paga por resultado visível (cliques no WhatsApp, visualizações), e hoje o app não mede nada disso.

**O que falta, em uma frase:** conectar a interface ao banco de dados de verdade, criar o painel para você administrar o conteúdo, medir audiência, e só então vender.

---

## 2. Diagnóstico técnico detalhado

### 2.1 O que está funcionando

| Item | Situação |
|---|---|
| Build do projeto (`npm run build`) | ✅ Compila sem erros |
| Testes automatizados (`npm test`) | ✅ 6 testes, todos passam |
| CI no GitHub (roda testes a cada PR) | ✅ Configurado |
| Interface (design, navegação, mobile) | ✅ Muito boa — padrão de app profissional |
| Estrutura do banco (10 tabelas: comércios, classificados, ofertas, eventos, notícias, falecimentos, lugares, carros, empregos, imóveis) | ✅ Bem modelada, com segurança (RLS) ativada |
| Camada de erros, retry, cache e monitoramento no código | ✅ Acima do esperado para o estágio |
| Modelo de planos free/pro/destaque no código e no banco | ✅ Pronto para ser usado na monetização |

### 2.2 O que NÃO está funcionando (em ordem de gravidade)

1. **Conteúdo é quase todo falso.** 47 arquivos importam dados do `mockData.ts`. Somente a home (blocos "Comer Agora" etc.) e a página de detalhe de comércio tentam ler o Supabase — e, se o banco retorna pouco ou nada, o app **silenciosamente mostra os dados falsos**. O usuário vê um app "cheio" que na verdade está vazio.
2. **O formulário "Publicar" não publica nada.** Ele valida os campos, espera 1,5 segundo (`setTimeout`) e mostra sucesso — mas **nunca grava no banco** (`src/pages/Publish.tsx:185-189`). Qualquer pessoa que "anunciar" algo hoje está anunciando no vazio.
3. **A busca não consulta o banco.** `src/pages/Search.tsx` busca apenas nos dados falsos. Buscar um comércio real cadastrado no Supabase não retorna nada.
4. **Não existe login nem painel administrativo.** Não há nenhuma linha de código de autenticação. Você não tem como cadastrar/editar comércios, aprovar anúncios ou gerenciar ofertas sem mexer direto no banco. As regras de segurança do banco só permitem escrita via chave administrativa (`service_role`) — ou seja, hoje só por script.
5. **Inconsistência entre código e banco.** `src/services/categories.ts` consulta um relacionamento `categories(name, slug)` e ordena por `created_at` — mas a tabela `businesses` do `supabase/schema.sql` **não tem** nem a tabela `categories` relacionada nem a coluna `created_at`. Essas consultas tendem a falhar sempre, derrubando tudo para os dados falsos.
6. **Zero métricas de audiência.** Não há analytics de página, nem rastreio de cliques no WhatsApp/telefone. Sem isso, não há o que mostrar (nem cobrar) de um anunciante.
7. **Páginas de lista/detalhe de carros, empregos, imóveis, lugares, ofertas, eventos, notícias, falecimentos e classificados**: todas 100% mock.

### 2.3 Problemas menores (mas que valem corrigir)

- **`.env.local` está versionado no Git** com a URL e a chave pública do Supabase. A chave anon é pública por design, mas o arquivo não deveria estar no repositório. O `.gitignore` está malformado (contém cercas de markdown ` ``` ` como se fossem padrões).
- **README desatualizado**: descreve Firebase como backend, mas o projeto usa Supabase.
- **SEO fraco**: canonical aponta para `procurauai.lovable.app` (domínio antigo do Lovable), título único para todas as páginas, sem sitemap. Para um guia local, aparecer no Google buscando "restaurante em Monte Santo de Minas" é canal de aquisição essencial.
- **Bundle de 1,27 MB** em um único arquivo JS — pesado para celular com 3G/4G da região. Falta dividir o código por rota (`React.lazy`).
- **Página `/debug-env` exposta em produção** — mostra parte das variáveis de ambiente; deve ser removida ou protegida.
- **`user-scalable=no` no HTML** impede zoom — ruim para acessibilidade (público 50+ usa bastante zoom).
- Arquivos mortos no repositório: `ComerAgoraBlock_old.tsx`, `TrendingSection_old.tsx`, hooks `.js` duplicando `.ts`.

---

## 3. Plano de ação passo a passo

O plano está dividido em 4 fases. **Não pule para a Fase 3 (vender) sem completar a 1 e a 2** — vender espaço num app com dados falsos queima a credibilidade do produto na cidade, e credibilidade é seu único ativo no lançamento.

Como você desenvolve com ferramentas de IA (Lovable, Claude Code etc.), as estimativas abaixo estão em **sessões de trabalho** (uma sessão ≈ 2–4 horas suas com a ferramenta). Se contratar um freelancer, o custo de referência no Brasil é R$ 60–120/hora para pleno.

### FASE 1 — Tornar o produto real (3–5 semanas, custo ~R$ 0)

**Objetivo: tudo que aparece na tela vem do banco; você consegue administrar o conteúdo.**

**Passo 1.1 — Alinhar banco e código (1–2 sessões)**
- Adicionar a coluna `created_at timestamptz default now()` na tabela `businesses` (e nas demais que não têm).
- Corrigir `src/services/categories.ts`: remover o join com a tabela `categories` inexistente (ou criar a tabela de categorias de verdade — recomendado criar, pois facilita o painel admin depois).
- Conferir se o `supabase/schema.sql` do repositório é idêntico ao banco em produção; se não for, exportar o schema real e versionar.

**Passo 1.2 — Popular o banco com dados reais (2–4 sessões + trabalho de campo)**
- Meta inicial: **80–150 comércios reais** de Monte Santo de Minas com nome, categoria, bairro, WhatsApp, horário e 1 foto. Esse é o "estoque mínimo" para o app parecer vivo.
- Como fazer: planilha (Google Sheets) → script de importação para o Supabase (o repositório já tem exemplos de script em `scripts/`). Dados: Google Maps, Instagram das lojas, associação comercial, e caminhada pelo centro com o celular.
- Dica: cadastrar TODOS de graça, sem pedir permissão para listar dados públicos (nome, endereço, telefone comercial). O plano pago vem depois, para quem quiser mais.

**Passo 1.3 — Ligar todas as telas ao banco e remover os mocks (3–5 sessões)**
- Trocar, página por página, a importação de `@/data/mockData` por consultas ao Supabase (padrão já existe em `src/services/businesses.ts` — replicar para ofertas, eventos, notícias, falecimentos, classificados, carros, empregos, imóveis, lugares).
- Onde não houver dados, mostrar **estado vazio honesto** ("Ainda não há ofertas hoje — anuncie a sua") em vez de dados falsos. Estado vazio com chamada para anunciar é, inclusive, um canal de venda.
- Fazer a busca (`Search.tsx`) consultar o banco (o Supabase tem busca `ilike`/full-text pronta).

**Passo 1.4 — Login e painel administrativo (4–6 sessões)**
- Ativar o Supabase Auth (e-mail/senha basta para começar; só você terá acesso no início).
- Criar rota `/admin` protegida com: listar/criar/editar/excluir comércios, ofertas, eventos, notícias e falecimentos; aprovar ou rejeitar anúncios enviados pelo público.
- Ajustar as regras RLS: trocar o `is_admin()` provisório (que hoje aponta para um UUID zerado) por verificação do seu usuário real ou de uma tabela `admins`.

**Passo 1.5 — Fazer o "Publicar" publicar de verdade (2–3 sessões)**
- O formulário passa a gravar na tabela certa com `status = 'pendente'` (criar política RLS permitindo INSERT anônimo apenas com status pendente, ou usar uma Edge Function do Supabase).
- Nada vai ao ar sem sua aprovação no painel admin — isso protege contra spam e golpes, essencial para a confiança numa cidade pequena.
- Upload de fotos para o Supabase Storage (com limite de tamanho e compressão no navegador).

**Passo 1.6 — Limpeza técnica (1–2 sessões)**
- Remover `.env.local` do Git (`git rm --cached .env.local`) e corrigir o `.gitignore`.
- Remover `/debug-env`, arquivos `_old`, e o `user-scalable=no`.
- Corrigir canonical para o domínio definitivo; atualizar o README (Supabase, não Firebase).
- Dividir o bundle por rota com `React.lazy` (o próprio aviso do build indica isso).

### FASE 2 — Medir audiência e preparar a venda (1–2 semanas, custo ~R$ 15–40/mês)

**Objetivo: números para mostrar a anunciantes.**

**Passo 2.1 — Analytics (1 sessão)**
- Instalar um analytics leve e sem banner de cookies (Plausible ~US$ 9/mês, ou Umami grátis auto-hospedado, ou Vercel Analytics). Métricas-chave: visitantes/semana, páginas mais vistas, buscas mais feitas.

**Passo 2.2 — Rastrear o que interessa ao anunciante (1–2 sessões)**
- Criar tabela `metrics_events` no Supabase e registrar: visualização de perfil de comércio, clique no WhatsApp, clique em ligar, clique em "como chegar". Os componentes `WhatsAppButton`, `CallButton` e `MapsButton` já existem — é adicionar o registro do evento neles.
- Isso vira o **relatório mensal do anunciante**: "seu perfil foi visto 340 vezes, gerou 52 conversas no WhatsApp". É o argumento de venda inteiro.

**Passo 2.3 — SEO local (1–2 sessões)**
- Título e descrição por página (componente `DynamicMeta` já existe, só não é usado — aplicar em todas as rotas), sitemap.xml gerado a partir do banco, dados estruturados (schema.org `LocalBusiness`) nas páginas de comércio.
- Cadastrar o site no Google Search Console.
- Meta: em 3–6 meses, ranquear para "X em Monte Santo de Minas" (pizzaria, farmácia, chaveiro...).

**Passo 2.4 — Lançamento local (trabalho de campo, custo R$ 0–300)**
- Divulgar nos grupos de WhatsApp/Facebook da cidade, parceria com a associação comercial, QR code em comércios parceiros.
- Meta de validação antes de vender: **1.000–2.000 visitantes únicos/mês e 30 dias de métricas**. Numa cidade de 22 mil habitantes, isso é atingível em 4–8 semanas com o conteúdo de falecimentos, eventos e ofertas atualizado (são os três maiores geradores de tráfego recorrente em portais de cidade pequena).

### FASE 3 — Monetizar como retail media (a partir do 2º–3º mês)

**Objetivo: primeiras receitas, operação simples, sem depender de sistema de pagamento automático.**

**Produtos de anúncio sugeridos** (a infraestrutura já existe no código: `plan`, `is_sponsored`, `is_highlighted`):

| Produto | O que o anunciante ganha | Preço sugerido (cidade pequena) |
|---|---|---|
| **Plano Pro** | Mini-site completo: galeria, avaliações, botão ligar, site | R$ 39–59/mês |
| **Plano Destaque** | Tudo do Pro + topo da categoria + selo + agendamento | R$ 79–129/mês |
| **Oferta patrocinada** | Oferta fixada no bloco de ofertas da home por 7 dias | R$ 25–50/semana |
| **Banner da home** | Banner rotativo no topo (máx. 3–4 anunciantes) | R$ 150–250/mês |
| **Evento patrocinado** | Destaque na agenda da cidade | R$ 30–60/evento |

**Como operar no início (sem desenvolver nada de pagamento):**
- Venda pessoal (você conhece os comerciantes) + cobrança por **PIX manual ou Mercado Pago link de pagamento**. Ativação do plano: você muda o campo `plan` do comércio no painel admin. Simples e suficiente até ~30 anunciantes.
- Entregar **relatório mensal por WhatsApp** com os números do Passo 2.2. Renovação depende disso.
- Meta realista do trimestre 1 de vendas: 10–20 anunciantes pagos = **R$ 500–1.500/mês** — já cobre toda a infraestrutura com folga e valida o modelo.

**Automatizar depois (quando passar de ~30 anunciantes):** checkout com Mercado Pago/Stripe + ativação automática do plano (3–5 sessões de desenvolvimento).

### FASE 4 — Expandir para a região (a partir do 6º mês)

- O banco já tem campos `city` nas tabelas certas — adicionar `city` também em `businesses` e filtrar todo o app pela cidade selecionada (o componente `LocationSelector` já existe na home).
- Replicar o playbook: uma cidade por vez (Arceburgo, Guaranésia, Guaxupé, São Sebastião do Paraíso...), sempre na ordem conteúdo → audiência → venda. Guaxupé (~52 mil hab.) é o maior prêmio regional.
- Considerar um "embaixador" comissionado por cidade para cadastro e venda local.

---

## 4. Custos estimados

### Infraestrutura mensal

| Item | Início (0–2k visitas/mês) | Crescimento (10k+/mês) |
|---|---|---|
| Vercel (hospedagem) | R$ 0 (free) | R$ 0–110 (Pro US$ 20) |
| Supabase (banco/auth/storage) | R$ 0 (free) | R$ 140 (Pro US$ 25) |
| Domínio `.com.br` | R$ 40/ano | R$ 40/ano |
| Analytics | R$ 0–50 | R$ 50 |
| Google Maps API | R$ 0 (crédito mensal do Google cobre uso pequeno) | R$ 0–100 |
| **Total** | **~R$ 5–60/mês** | **~R$ 300–400/mês** |

### Desenvolvimento (se contratar; com IA você mesmo, é tempo em vez de dinheiro)

| Fase | Sessões (você + IA) | Freelancer (referência) |
|---|---|---|
| Fase 1 completa | 13–22 sessões (~3–5 semanas) | R$ 4.000–8.000 |
| Fase 2 | 4–6 sessões (~1–2 semanas) | R$ 1.200–2.500 |
| Fase 3 (checkout automático, opcional) | 3–5 sessões | R$ 1.000–2.000 |

O ponto de equilíbrio é baixo: com **2 anunciantes no plano Destaque a operação já se paga**.

---

## 5. Checklist resumido (ordem de execução)

- [ ] 1. Adicionar `created_at` em `businesses`; corrigir `categories.ts`; sincronizar schema
- [ ] 2. Cadastrar 80–150 comércios reais no banco
- [ ] 3. Ligar home, busca e todas as listas/detalhes ao banco; remover fallback de mock
- [ ] 4. Estados vazios honestos com chamada "anuncie aqui"
- [ ] 5. Supabase Auth + painel `/admin` (CRUD + moderação)
- [ ] 6. Formulário Publicar gravando no banco com aprovação
- [ ] 7. Limpeza: `.env.local` fora do Git, `.gitignore`, `/debug-env`, arquivos `_old`, code-splitting
- [ ] 8. Analytics + rastreio de cliques WhatsApp/ligar/mapa
- [ ] 9. SEO: meta por página, sitemap, schema.org, Search Console
- [ ] 10. Lançamento local; meta de 1.000–2.000 visitantes/mês
- [ ] 11. Vender planos Pro/Destaque e ofertas patrocinadas com PIX manual
- [ ] 12. Relatório mensal por anunciante; depois, checkout automático; depois, região

---

## 6. Riscos e recomendações finais

- **Maior risco não é técnico, é operacional**: guia de cidade só funciona com conteúdo fresco (ofertas, eventos, falecimentos atualizados). Reserve 30–60 min/dia para curadoria ou recrute 1–2 parceiros locais cedo.
- **Não lance vendendo**: primeiro 4–8 semanas de app real e cheio, depois venda. O comerciante de cidade pequena decide por prova social ("todo mundo já usa").
- **Falecimentos e eventos são o motor de tráfego** em portais de cidade pequena — trate como prioridade editorial, não como recurso secundário.
- **A base técnica é boa.** Não reescreva o projeto; complete-o. O trabalho grande já foi feito — o que falta é conectar as pontas (banco ↔ telas ↔ painel) e operar.
