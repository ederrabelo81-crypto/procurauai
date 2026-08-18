# Rotina semanal do Procura UAI

Como funciona o ciclo semanal automatizado e o que cabe a você em cada etapa.

---

## O que está configurado

Uma **Routine** (ação agendada) no Claude Cowork, que dispara sozinha toda
semana e abre um PR draft com uma melhoria.

| | |
| --- | --- |
| **Nome** | Procura UAI — evolução semanal |
| **ID** | `trig_01SDrgfQ7Nn7mxvZHGxPXL9Q` |
| **Quando** | Toda **segunda-feira, 8h** (horário de Brasília) |
| **Como** | Sessão **nova** a cada disparo — começa lendo o `CLAUDE.md`, sem contexto acumulado |
| **Aviso** | Notificação no celular + e-mail quando termina |

A sessão é nova de propósito: uma sessão que ficasse viva seis meses acumularia
contexto velho e passaria a decidir com base no que o projeto *era*, não no que
ele *é*.

---

## O ciclo, em seis passos

O que a sessão faz sozinha, toda segunda:

1. **Lê o estado** — `CLAUDE.md`, `docs/README.md`, os últimos 20 commits, os
   PRs abertos, e roda `npm test`, `npm run lint` e `npm run build` para saber o
   que está verde hoje. Se tiver acesso ao Supabase, mede a fila de curadoria.
2. **Escolhe UMA melhoria**, pela ordem de prioridade abaixo, e diz por quê.
3. **Implementa** seguindo as convenções do `CLAUDE.md`.
4. **Valida** — testes, lint e build limpos no que tocou.
5. **Entrega** — branch `claude/semanal-AAAA-MM-DD`, commit em Conventional
   Commits, PR draft com o template preenchido.
6. **Relata** — o que mudou, o estado do projeto, o que recomenda para a semana
   seguinte e **o que depende de decisão sua**.

### Ordem de prioridade

1. Regressão ou bug em produção.
2. **O que destrava a curadoria de dados** — hoje é o gargalo: ~351 comércios
   importados do Google esperando revisão humana e WhatsApp, e boa parte da home
   ainda caindo no fallback de `mockData.ts`.
3. Dívida técnica do §15 do `CLAUDE.md`.
4. Cobertura de teste em service ou hook descoberto.
5. Funcionalidade nova do roadmap.

---

## O que cabe a você

### Segunda de manhã — 5 min

Chega a notificação. Abra o relatório e leia a seção **"o que precisa de decisão
humana"** primeiro: é a única parte que trava a semana seguinte se ficar parada.

### Durante a semana — 15 min

Revise o PR draft. Três perguntas bastam:

- O que ele escolheu fazer era mesmo o mais importante?
- O diff faz o que o resumo diz que faz?
- Algum número no texto está apresentado como fato sem ter sido medido?

Aprovando: tire do draft e faça merge. O push em `main` dispara o deploy na
Vercel automaticamente.

Discordando da escolha: responda no PR dizendo o que era mais importante. Na
semana seguinte, ajuste a prioridade da rotina (comando abaixo) para que o
critério mude de verdade, não só naquele PR.

### Uma vez por mês — 30 min

Rode um lote de curadoria você mesmo. É o trabalho que nenhuma automação faz,
porque depende de falar com o comerciante:

```bash
node scripts/validate-businesses.mjs --export-csv
# revise no Excel/Sheets: preencha whatsapp, escreva verified/rejected em action
node scripts/validate-businesses.mjs --import-csv=data/validation/ARQUIVO.csv --dry-run
node scripts/validate-businesses.mjs --import-csv=data/validation/ARQUIVO.csv
```

Cada WhatsApp preenchido é uma conversa a mais que o app consegue gerar — e o
contato para conseguir o número já é prospecção do plano pago.

---

## Ajustando a rotina

É só pedir em linguagem natural numa sessão do Claude Code, citando o ID
`trig_01SDrgfQ7Nn7mxvZHGxPXL9Q`:

| O que você quer | O que pedir |
| --- | --- |
| Mudar o dia/hora | "muda a rotina semanal para sexta às 18h" |
| Mudar a prioridade | "na rotina semanal, prioriza performance antes de dívida técnica" |
| Pausar (férias, congelamento) | "desativa a rotina semanal" |
| Voltar | "reativa a rotina semanal" |
| Rodar agora, fora da agenda | "dispara a rotina semanal agora" |
| Encerrar de vez | "apaga a rotina semanal" |
| Ver o que está agendado | "lista minhas rotinas" |

Pausar é melhor que apagar quando a interrupção é temporária: apagar perde o
histórico de execuções.

---

## Se a semana passar em branco

Não é falha automaticamente. Três causas comuns, em ordem de frequência:

1. **Não havia nada relevante para fazer** — o relatório deve dizer isso com
   todas as letras. Se disser, ótimo: significa que o critério funcionou.
2. **O CI estava vermelho antes** e a sessão gastou o ciclo consertando. Vale o
   PR mesmo assim.
3. **A escolha foi ruim.** Aí é ajuste de prioridade, não de frequência.

Se três semanas seguidas renderem pouco, o problema provavelmente é o critério
de prioridade, não a cadência. Reescreva a lista.

---

## Limites conhecidos

- **A rotina não aplica migração no Supabase.** SQL em `supabase/migrations/` é
  o estado desejado; aplicar em produção é sempre decisão sua, pelo SQL Editor.
- **A sessão semanal roda sem conectores** (Supabase MCP, Drive, Gmail). Ela
  trabalha pelo repositório e pelos scripts. Se precisar de conector, crie a
  rotina pela interface de Routines do claude.ai.
- **PR draft nunca vira merge sozinho.** O merge é sempre seu.
