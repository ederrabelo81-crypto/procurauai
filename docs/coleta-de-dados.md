# Guia de Coleta de Dados — Comércios, Serviços e Atrações

**Objetivo:** montar a base de dados de Monte Santo de Minas (e depois região) para popular a tabela `businesses` do Supabase, executando o Passo 1.2 do manual (`docs/manual-proximo-passo.md`).

**Resposta curta à pergunta "preciso de um scraper tipo o do RAC?":** não. As coletas de marketplace (RAC) são **monitoramento recorrente** de milhares de itens que mudam todo dia (preço, estoque, ads) — por isso precisam de infraestrutura de scraping contínuo. Aqui o problema é outro: uma **carga única de ~300–800 estabelecimentos** de uma cidade pequena, que depois será mantida manualmente pelo painel admin. Para isso, a API oficial do Google resolve em uma tarde, de graça, sem risco de bloqueio.

---

## 1. Comparação das fontes disponíveis

| Fonte | O que entrega | Custo | Esforço | Veredito |
|---|---|---|---|---|
| **A. Google Places API (oficial)** | Nome, endereço, telefone fixo, site, horário, coordenadas, avaliação | R$ 0 (dentro da cota grátis) | Baixo (script pronto neste repo) | ✅ **Fonte principal** |
| **B. Dados abertos do CNPJ (Receita Federal)** | TODAS as empresas formais da cidade (inclusive MEI), com CNAE e endereço | R$ 0 | Médio/alto (arquivos gigantes) | ✅ Complemento para cobertura total |
| **C. OpenStreetMap (Overpass API)** | Poucos POIs em cidade pequena do interior | R$ 0 | Baixo | ⚠️ Cobertura fraca; usar só para atrações/praças |
| **D. Trabalho de campo + fontes locais** | **WhatsApp** (o dado mais valioso!), fotos, confirmação | R$ 0 | Alto (mas é também venda) | ✅ **Obrigatório para enriquecer** |
| **Scraping direto do site do Google Maps** | — | — | — | ❌ Viola os termos do Google, quebra com frequência, risco de bloqueio da conta/IP. Não vale para 500 registros. |

**Ponto crítico que nenhuma API resolve:** o campo mais importante do Procura UAI é o **WhatsApp** do comércio (é o botão de conversão do app), e nenhuma fonte automatizada fornece isso de forma confiável. O telefone fixo do Google é um ponto de partida; o WhatsApp vem do contato direto — que é, convenientemente, o mesmo contato que inicia seu relacionamento comercial com o anunciante.

---

## 2. Caminho recomendado (passo a passo)

### Etapa 1 — Coleta automática via Google Places API (1 tarde, R$ 0)

1. **Criar a chave de API:**
   - Acesse [console.cloud.google.com](https://console.cloud.google.com) → crie um projeto (ou use o existente do Maps).
   - Ative a **Places API (New)** (não confundir com a "Places API" legada).
   - Crie uma chave de API em *APIs e serviços → Credenciais*. Restrinja a chave à Places API (New).
   - Ative o faturamento (exigido), mas configure **alertas de orçamento** (ex.: US$ 5) por segurança.

   ⚠️ **Use uma chave separada da do front-end.** A chave do app
   (`VITE_GOOGLE_MAPS_API_KEY`) é restrita por *referenciador HTTP*, e o Google
   recusa chamadas de servidor feitas com ela (`Requests from referer <empty>
   are blocked`). Crie uma segunda chave **sem restrição de referenciador** (ou
   restrita por IP), limitada à Places API (New), e use só nos scripts.

2. **Guardar a chave** — no shell na hora de rodar, ou em `.env.local`
   (git-ignored; o script carrega esse arquivo sozinho):
   ```bash
   # .env.local
   GOOGLE_MAPS_API_KEY=sua_chave_de_servidor
   ```

3. **Testar antes de gastar cota** (`--dry-run` faz 1 busca, mostra um registro
   de exemplo e não grava nada):
   ```bash
   node scripts/collect-places.mjs --dry-run
   ```
   O script valida a chave antes de começar a varredura: se ela estiver errada,
   sem a API ativada, sem faturamento ou restrita por referenciador, ele para na
   primeira requisição e diz exatamente o que corrigir.

4. **Rodar a coleta completa:**
   ```bash
   node scripts/collect-places.mjs
   # ou, sem guardar a chave em arquivo:
   GOOGLE_MAPS_API_KEY=sua_chave node scripts/collect-places.mjs
   ```
   - Padrão: varre ~40 categorias em Monte Santo de Minas (~40–120 requisições).
   - Gera `data/places/places-AAAA-MM-DD.json` e `.csv`.
   - Para outra cidade depois: `--cities="Guaxupé - MG"`.
   - `--help` lista todas as opções (`--categories`, `--out`, `--max-pages`).
   - Buscas que falharem por instabilidade são repetidas com backoff; as que
     falharem de vez aparecem numa lista no final, para você rodar de novo só
     aquelas categorias.

5. **Custo real:** a busca textual com telefone/horário usa o SKU "Enterprise" da Places API (New), que tem **1.000 chamadas grátis/mês**. Uma cidade consome 40–120 chamadas. Ou seja: **1–2 cidades por mês = R$ 0**. Para varrer a região inteira de uma vez, espere algo em torno de US$ 10–25 — ou simplesmente distribua 1–2 cidades por mês e pague nada (confira os valores atuais em [developers.google.com/maps/billing-and-pricing](https://developers.google.com/maps/billing-and-pricing/pricing), eles mudam).

### Etapa 2 — Revisão humana no Google Sheets (2–4 horas)

Importe o CSV no Google Sheets e revise linha a linha:

- [ ] Remover o que não faz sentido (resultados de outra cidade, órgãos públicos duplicados, lugares fechados);
- [ ] Ajustar a coluna `category_hint` para as categorias do app (Restaurante, Farmácia, Loja, Oficina...);
- [ ] Conferir `neighborhood` (o Google raramente sabe o bairro em cidade pequena — na dúvida, "Centro");
- [ ] **Preencher a coluna `whatsapp`** dos comércios que você já conhece (o restante fica para a Etapa 4);
- [ ] Exportar de volta para JSON/CSV (mantendo as mesmas colunas).

### Etapa 3 — Importar para o Supabase (30 minutos)

1. Pegue a **Service Role Key** no painel do Supabase (*Settings → API Keys → `service_role` (secret)*).
   ⚠️ Essa chave é secreta e ignora RLS: nunca no Git, nunca no front-end.
   Ela **não** é a `anon`/`publishable` que está no `.env.local` para o app — com a
   `anon` a importação é barrada pelas policies e o erro fala em *row-level security*.

2. Guarde as credenciais no `.env.local` (git-ignored; os scripts leem sozinhos):
   ```bash
   # .env.local — além das VITE_* que o app já usa
   SUPABASE_URL=https://SEU-PROJETO.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role
   ```
   `SUPABASE_URL` é opcional se já houver `VITE_SUPABASE_URL` no arquivo — a URL não
   é secreta e os scripts a reaproveitam.

3. (Uma vez só) Crie o índice de deduplicação no SQL Editor do Supabase:
   ```sql
   create unique index if not exists businesses_google_place_id_key
     on public.businesses (google_place_id)
     where google_place_id is not null;
   ```

4. Teste sem gravar, depois importe:
   ```bash
   node scripts/import-businesses.mjs --file=data/places/places-2026-07-22.json --dry-run

   # se o exemplo mostrado estiver certo:
   node scripts/import-businesses.mjs --file=data/places/places-2026-07-22.json
   ```
   - O script deduplica por `google_place_id`: pode rodar de novo sem duplicar.
   - `--update` atualiza registros já existentes; `--limit=10` para testar com poucos.

**Definindo as variáveis direto no terminal** (em vez do `.env.local`), atenção à
sintaxe — a forma `VAR=valor node script.mjs` é do bash e **não funciona no PowerShell**:

```powershell
# PowerShell (Windows)
$env:SUPABASE_URL="https://SEU-PROJETO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role"
node scripts/import-businesses.mjs --file=data\places\places-2026-07-22.json --dry-run
```

```bash
# bash/zsh (Linux/macOS)
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  node scripts/import-businesses.mjs --file=data/places/places-2026-07-22.json --dry-run
```

### Etapa 4 — Enriquecimento em campo (contínuo; é também sua prospecção)

Para cada comércio importado, na sua rotina pela cidade ou por telefone:

1. Confirmar nome, horário e endereço;
2. Pegar o **WhatsApp** e pedir **2–3 fotos** (fachada + interior/produto) — fotos vêm do comerciante, nunca copiadas do Google;
3. Apresentar o Procura UAI ("seu comércio já está no app, de graça — quer conferir se está tudo certo?") — essa conversa é o primeiro passo da venda dos planos Pro/Destaque;
4. Atualizar o registro no painel admin (ou na planilha, enquanto o admin não existe).

Meta: 10–15 comércios confirmados por dia de campo → centro da cidade completo em 2–3 semanas.

---

## 3. Fonte complementar: dados abertos do CNPJ (cobertura total)

O Google só mostra quem tem presença no Maps. Para enxergar **todas** as empresas formais da cidade (inclusive MEIs sem placa na rua — diaristas, eletricistas, doceiras, costureiras — que são ótimos anunciantes de "Serviços"):

- **Consulta prática (sem programar):** [casadosdados.com.br](https://casadosdados.com.br) → busca avançada → filtrar por município "Monte Santo de Minas/MG" e situação "Ativa". Dá para navegar de graça e montar a lista dos CNAEs interessantes (restaurantes = CNAE 5611-2, cabeleireiros = 9602-5, etc.).
- **Download oficial completo (para quem quiser automatizar):** [arquivos.receitafederal.gov.br/dados/cnpj](https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/) — arquivos mensais "Estabelecimentos" (grandes, vários GB; filtrar pelo código do município). Vale a pena só quando for expandir para muitas cidades de uma vez.
- Cruzando CNPJ × coleta do Google você descobre quem está **faltando** no Maps — esses comércios nem sabem que são invisíveis no Google, e agradecem o cadastro (bom gancho de venda).

**Nota LGPD:** dados de MEI incluem o nome da pessoa física. Use apenas para contato comercial B2B, não publique CPF/dados pessoais no app, e remova quem pedir.

---

## 4. Regras do jogo (para não criar passivo)

1. **Não copie fotos nem avaliações/reviews do Google.** Fotos: do comerciante ou tiradas por você. Avaliações: o app deve construir as próprias.
2. **Trate o dado do Google como rascunho de descoberta**, não como acervo permanente: a política do Google prevê cache limitado (só o `place_id` pode ser guardado indefinidamente). Na prática, o fluxo deste guia resolve isso — cada registro é **confirmado com o próprio comerciante** na Etapa 4 e passa a ser dado seu, de primeira mão. Priorize confirmar os registros importados nas primeiras semanas.
3. **Não raspe o site do Google Maps** nem use "APIs alternativas" que fazem isso por você (SerpAPI/Outscraper etc. têm zona cinzenta legal; para 500 registros o caminho oficial é grátis mesmo).
4. Dados factuais (nome, endereço, telefone comercial) são públicos e listá-los é prática padrão de guias comerciais — o cuidado acima é com **conteúdo criativo** (fotos, textos, reviews) e **dados pessoais**.

---

## 5. Sequência sugerida para a região

| Ordem | Cidade | Habitantes (aprox.) | Quando |
|---|---|---|---|
| 1 | Monte Santo de Minas | 22 mil | Agora |
| 2 | Arceburgo | 10 mil | Mês 2–3 (colada em MSM) |
| 3 | Itamogi | 10 mil | Mês 2–3 |
| 4 | Guaranésia | 19 mil | Mês 3–4 |
| 5 | São Sebastião do Paraíso | 71 mil | Mês 4–6 (mercado grande) |
| 6 | Guaxupé | 52 mil | Mês 4–6 (maior prêmio regional) |

Regra do manual continua valendo: **só entre numa cidade nova quando a anterior tiver conteúdo vivo e audiência** — cada cidade nova custa 1 tarde de coleta + 2–3 semanas de campo.

---

## 6. Checklist rápido

- [ ] Chave da Places API (New) criada, com restrição e alerta de orçamento
- [ ] `node scripts/collect-places.mjs` rodado para Monte Santo de Minas
- [ ] CSV revisado no Sheets (categorias, duplicados, WhatsApp conhecidos)
- [ ] Índice único de `google_place_id` criado no Supabase
- [ ] `node scripts/import-businesses.mjs --dry-run` conferido, depois importado
- [ ] Rotina de campo iniciada (WhatsApp + fotos + confirmação = prospecção)
- [ ] Lista complementar de MEIs/serviços montada via Casa dos Dados
