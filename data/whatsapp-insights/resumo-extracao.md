# Resumo da extração — insights de WhatsApp

Gerado por `scripts/whatsapp-insights/extract-insights.mjs`. Relatório técnico
para conferência — o relatório estratégico já existe fora deste repositório.

## Mensagens processadas

| Arquivo | Mensagens (após filtro de sistema/mídia) | Contatos .vcf |
| --- | --- | --- |
| Tv Web Monte Santo 2 | 27759 | 2230 |
| Boa ação é doação | 10502 | 330 |

- Total geral: **38261** mensagens.
- Mensagens de busca detectadas (intenção casada): **7032**.
- Dessas, **3897** não casaram em nenhuma das 15 categorias de
  negócio/serviço (Tarefa 1.3) — ficam fora de `demanda-por-categoria.json`
  e do agrupamento de negócios, mas contam no total acima.
- Mensagens marcadas como tempo real/urgência (`realtime: true`): **213**.

> Nota: a tarefa descreve "16 categorias" em alguns pontos, mas só define
> regex para 15 (`saude_medico` … `outros_servicos`). Implementamos
> exatamente as 15 fornecidas — não inventamos uma 16ª categoria.

## Distribuição por categoria

| Categoria | Mensagens de busca |
| --- | --- |
| transporte | 597 |
| saude_medico | 505 |
| comida | 494 |
| aluguel_imovel | 383 |
| roupa_loja | 357 |
| reparos_casa | 246 |
| pet_veterinario | 137 |
| documentos_juridico | 115 |
| outros_servicos | 97 |
| auto_mecanico | 87 |
| beleza_estetica | 84 |
| educacao | 80 |
| servico_domestico | 59 |
| gas_agua | 54 |
| construcao | 30 |

## Top 20 negócios mais pedidos e não listados

| Negócio | Categoria | Vezes pedido | Confiança | Contato .vcf | 1ª menção | Última menção |
| --- | --- | --- | --- | --- | --- | --- |
| casa alugar | aluguel_imovel | 105 | media | — | 2025-06-23 | 2026-08-05 |
| Farmacia Pedro | saude_medico | 89 | media | Farmacia Pedro.vcf | 2025-06-22 | 2026-08-16 |
| Uber | transporte | 74 | media | — | 2025-06-27 | 2026-08-17 |
| médico pronto socorro | saude_medico | 27 | media | — | 2025-07-07 | 2026-07-17 |
| Entregador Shopee | transporte | 19 | media | Entregador Shopee.vcf | 2025-06-24 | 2026-07-13 |
| Adriano Mercado Livre | transporte | 19 | media | Adriano Mercado Livre .vcf | 2025-07-11 | 2026-07-19 |
| Farmácia | saude_medico | 17 | alta | Farmácia.vcf | 2025-08-10 | 2026-08-10 |
| Loja Periquito | roupa_loja | 16 | alta | Loja Periquito.vcf | 2025-06-21 | 2026-07-06 |
| geladeira | reparos_casa | 16 | media | — | 2025-06-30 | 2026-07-10 |
| Laboratório Vinícius | saude_medico | 15 | media | Laboratório Vinícius.vcf | 2025-07-03 | 2026-08-12 |
| Tavim | transporte | 15 | baixa | Tavim.vcf | 2025-07-25 | 2026-07-16 |
| Salgado 1 Real | comida | 14 | media | Salgado 1 Real .vcf | 2025-07-26 | 2026-08-07 |
| Algar Monte Santo | aluguel_imovel | 13 | media | Algar Monte Santo.vcf | 2025-06-30 | 2026-05-12 |
| Andre Chaveiro | outros_servicos | 13 | alta | Andre Chaveiro.vcf | 2025-07-04 | 2026-07-22 |
| Pizzaria Casa | comida | 13 | baixa | Pizzaria Casa.vcf | 2025-08-09 | 2026-08-15 |
| Laboratório Da Luana | saude_medico | 12 | media | Laboratório Da Luana.vcf | 2025-07-07 | 2026-07-20 |
| Naiane Escola | educacao | 11 | baixa | Naiane Escola.vcf | 2025-06-24 | 2026-03-30 |
| Padaria Santos Reis | comida | 11 | media | Padaria Santos Reis .vcf | 2025-08-29 | 2026-06-06 |
| d casa p alugar cômodos | aluguel_imovel | 11 | media | — | 2025-07-07 | 2026-08-13 |
| casa alugar pode ser pequena | aluguel_imovel | 11 | media | — | 2025-11-18 | 2026-08-16 |

Lista completa (inclusive já listados, para comparação) em `mais-buscados.json`
(1685 agrupamentos) e em tabela filtrada (≥ 2
pedidos) em `mais-buscados.md`.

## Saúde & serviços públicos

Contatos institucionais extraídos dos `.vcf` (farmácias, PSFs, CRAS,
Conselho Tutelar, Defensoria, Vigilância Sanitária, Ambulatório, Prefeitura,
Santa Casa/Pronto Socorro): **83** unidades, após
deduplicar contatos repetidos (a mesma unidade salva com pequenas variações
de grafia).

| categoria_servico | Unidades |
| --- | --- |
| farmacia | 25 |
| posto_saude | 22 |
| prefeitura | 14 |
| pronto_socorro | 7 |
| conselho_tutelar | 4 |
| assistencia_social | 4 |
| vacina | 3 |
| defensoria | 3 |
| vigilancia_sanitaria | 1 |

Todos os registros saem com `status: "pendente_validacao_manual"` — nenhum
vai ao ar sem a curadoria manual que o projeto já define (confirmar telefone,
horário, categoria com o próprio serviço). Ver `saude-e-servicos.json`.

## Decisões que merecem revisão humana

- **1386** dos 1685 agrupamentos de
  `mais-buscados.json` saíram com `confianca: "baixa"` — nome extraído da
  mensagem é curto/ambíguo ou o cluster não tem contato `.vcf` de
  referência. Revisar antes de usar para prospecção.
- **1168** agrupamentos não casaram com nenhum contato `.vcf`
  (`contato_vcf_encontrado: null`) — o nome do negócio veio só do texto da
  mensagem, agrupado por similaridade com outras menções.
- Contatos "Daniela Transporte Prefeitura", "Gordo Prefeitura" e
  "Jaba Prefeitura" (`.vcf` da prefeitura) foram **excluídos** de
  `saude-e-servicos.json` por precaução de LGPD: o nome amarra um
  apelido/pessoa a uma função pública, diferente de uma linha institucional
  divulgada pelo próprio serviço (ex.: "PSF São Camilo",
  "Farmácia São Geraldo"). Revisar se algum desses deveria entrar mesmo
  assim, com o nome genérico da função em vez do apelido.
- "Ambulatório" foi mapeado para `categoria_servico: "posto_saude"` por
  aproximação — o enum fechado não tem um valor específico para clínica
  ambulatorial. Revisar se merece virar `"outro"` em vez disso.
- `vezes_mencionado_no_grupo` em `saude-e-servicos.json` é uma contagem
  por palavra-chave (categoria + fragmento distintivo do nome, ex.:
  "são camilo" para o PSF São Camilo). **27** unidades
  saíram com `confianca_contagem: "baixa_soma_categoria"`: o nome não tem
  fragmento distintivo o bastante (ex.: duas farmácias cujo nome, sem as
  palavras genéricas "farmácia"/"pública", não sobra nada) e a categoria tem
  mais de uma unidade — o número reportado é o total de menções à categoria
  inteira, repetido em cada uma, **não** uma contagem por unidade. Não usar
  esse número para comparar unidades entre si sem revisar antes.
- O painel administrativo do projeto ainda não existe no código — por isso
  o "Ranking dos Mais Buscados" saiu como `mais-buscados.md` (tabela) em vez
  de uma tela nova. Integrar `mais-buscados.json` a um painel é o próximo
  passo, quando esse painel existir.
