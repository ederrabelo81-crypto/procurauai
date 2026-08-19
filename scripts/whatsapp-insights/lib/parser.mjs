/**
 * Parser do formato de export de conversas do WhatsApp
 * (`DD/MM/AAAA HH:MM - Remetente: mensagem`).
 */

// Marcas de direcionamento invisíveis (LRM/RLM) que o WhatsApp injeta antes de
// números de telefone e nomes em linhas de sistema. Removê-las no início não
// afeta o conteúdo real das mensagens.
const INVISIBLE_MARKS = /[‎‏]/g;

const LINE_START = /^(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}) - (.*)$/;

const IGNORED_MESSAGE_BODIES = new Set(["<mídia oculta>", "mensagem apagada", "<media omitted>"]);

/**
 * Divide o texto bruto do export em entradas `{ date, time, sender, text }`.
 *
 * Linhas de sistema (entrada/saída do grupo, admin trocou descrição, número
 * mudou, etc.) nunca têm o padrão "remetente: mensagem" — não há ": " na
 * linha. Por isso, qualquer linha com prefixo de data que não contenha ": "
 * é descartada como sistema, e linhas sem prefixo de data são anexadas à
 * mensagem aberta (continuação multilinha).
 */
export function parseWhatsAppExport(rawText) {
  const lines = String(rawText ?? "").replace(/\r\n/g, "\n").split("\n");

  const entries = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(INVISIBLE_MARKS, "");
    const match = line.match(LINE_START);

    if (!match) {
      // Continuação de mensagem multilinha (ou linha em branco dentro dela).
      if (current) current.textLines.push(rawLine.replace(INVISIBLE_MARKS, ""));
      continue;
    }

    const [, date, time, rest] = match;
    const separatorIndex = rest.indexOf(": ");

    if (separatorIndex === -1) {
      // Linha de sistema: sem "remetente: mensagem". Fecha a mensagem
      // corrente (se houver) e não abre uma nova.
      current = null;
      continue;
    }

    const sender = rest.slice(0, separatorIndex).trim();
    const firstLine = rest.slice(separatorIndex + 2);

    current = { date, time, sender, textLines: [firstLine] };
    entries.push(current);
  }

  return entries
    .map(({ date, time, sender, textLines }) => ({
      date,
      time,
      sender,
      text: textLines.join("\n").trim(),
    }))
    .filter((entry) => {
      if (entry.text === "") return false;
      return !IGNORED_MESSAGE_BODIES.has(entry.text.toLowerCase());
    });
}

/** Converte "DD/MM/AAAA" em "AAAA-MM-DD" (ISO, para ordenar/serializar). */
export function toIsoDate(brDate) {
  const match = String(brDate ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}
