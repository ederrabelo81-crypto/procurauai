# Insights dos grupos de WhatsApp de Monte Santo de Minas

**Objetivo:** extrair, de exports reais de grupos de WhatsApp da cidade,
o que os moradores mais perguntam e não encontram — negócios pedidos
repetidamente e nunca listados, e contatos de saúde/serviço público que
aparecem centenas de vezes no grupo. Roda uma vez sobre um export estático;
não é um serviço contínuo.

Script: [`scripts/whatsapp-insights/extract-insights.mjs`](../scripts/whatsapp-insights/extract-insights.mjs).

---

## 1. Entrada (não versionada)

```
data/whatsapp-raw/
├── tv-web-monte-santo-2.txt
├── tv-web-monte-santo-2-contatos/       (.vcf, um por contato)
├── boa-acao-doacao.txt
└── boa-acao-doacao-contatos/            (.vcf, um por contato)
```

Exports brutos do WhatsApp (`Conversa do WhatsApp com <grupo>.txt` + os
`.vcf` exportados junto). `data/whatsapp-raw/` está no `.gitignore` — **nunca
commite esses arquivos**: têm número de telefone de moradores reais.

## 2. Rodar

```bash
node scripts/whatsapp-insights/extract-insights.mjs
```

Sem argumentos além de `--help`. Falha cedo se `data/whatsapp-raw/` não
existir, com a lista dos arquivos esperados.

## 3. Saída (`data/whatsapp-insights/`, versionada — ver §5 sobre privacidade)

| Arquivo | Conteúdo |
| --- | --- |
| `mais-buscados.json` | Negócios agrupados por menção recorrente (fuzzy match contra os `.vcf` e, sem contato, entre si), com `status: "ja_listado"\|"nao_listado"` (comparado contra `src/data/mockData.ts`) e `confianca: "alta"\|"media"\|"baixa"`. |
| `demanda-por-categoria.json` | Contagem de mensagens de busca por categoria (15 categorias — ver `lib/patterns.mjs`). |
| `saude-e-servicos.json` | Contatos institucionais/saúde pública extraídos dos `.vcf` (PSF, CRAS, farmácias, Conselho Tutelar, ...), todos com `status: "pendente_validacao_manual"`. |
| `resumo-extracao.md` | Relatório técnico: totais, distribuição por categoria, top 20 não-listados, decisões de baixa confiança que pedem revisão humana. |
| `mais-buscados.md` | Tabela do "Ranking dos Mais Buscados" (uso interno — ver §4). |

Estrutura interna do script, em `scripts/whatsapp-insights/lib/`:
`parser.mjs` (parse do `.txt`), `patterns.mjs` (intenção de busca +
categorização + tempo real), `fuzzy.mjs` (Levenshtein), `vcf.mjs` (parse dos
contatos), `businessMatching.mjs` (agrupamento de negócios "fantasma"),
`institutional.mjs` (classificação/agrupamento de contatos de saúde) e
`privacy.mjs` (redação de telefone digitado no corpo da mensagem). Testes em
`scripts/whatsapp-insights/__tests__/`.

## 4. "Ranking dos Mais Buscados" — uso interno, não é feature de consumidor

Ferramenta de priorização de vendas/curadoria para o Eder: negócios pedidos
várias vezes no grupo e ainda não listados no app são leads prontos. Hoje sai
como `mais-buscados.md` (tabela markdown, filtrada a 2+ pedidos) porque **não
existe painel administrativo no código ainda**. Quando existir, o próximo
passo é uma tela ali lendo `mais-buscados.json` (ordenado por `vezes_pedido`,
com filtro por `status: "nao_listado"`) em vez desta tabela estática.

## 5. Privacidade (LGPD) — não é opcional

- `data/whatsapp-raw/` nunca é commitado (`.gitignore`).
- O `sender` de cada mensagem (número/nome de quem perguntou) nunca é gravado
  em nenhum arquivo de saída — só a categoria, a contagem e o texto da
  pergunta.
- Telefone que a própria pessoa digitou dentro do corpo da mensagem (ex.:
  "me chama nesse número 35 9...") é redigido para `[número removido]` antes
  de qualquer texto virar `exemplos_pedido` — ver `lib/privacy.mjs`.
- Contatos `.vcf` **institucionais/comerciais** (farmácia, PSF, CRAS, ...) são
  diferentes: são contatos já divulgados publicamente pelo próprio negócio ou
  serviço, então podem virar dado estruturado — mas saem sempre com
  `status: "pendente_validacao_manual"`. Nada disso vai ao ar (nem no app, nem
  no Supabase de produção) sem a curadoria manual que o projeto já define:
  contato com o comerciante/serviço, confirmação do telefone, correção de
  categoria.
- Alguns `.vcf` da prefeitura amarram um apelido pessoal a uma função pública
  (ex.: "Gordo Prefeitura") — esses ficam de fora de `saude-e-servicos.json`
  por precaução (não são uma linha institucional divulgada pelo próprio
  serviço). Ver a nota em `resumo-extracao.md` de cada execução.

## 6. Publicação em `/saude-e-servicos`

`src/services/healthServices.ts` lê `data/whatsapp-insights/saude-e-servicos.json`
e só devolve registros com `status: "validado"` — ninguém marca isso
automaticamente, é um campo que se edita à mão no JSON depois de confirmar o
contato. Com tudo `"pendente_validacao_manual"` (estado logo após rodar o
script), a página `/saude-e-servicos` mostra a lista vazia por design, não um
bug.
