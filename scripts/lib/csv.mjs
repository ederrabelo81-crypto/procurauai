/**
 * Leitura e escrita de CSV para os scripts de validação.
 *
 * Existe porque o caminho de ida e o de volta precisam falar a mesma língua:
 * a exportação escreve endereços ("Rua São João, 320 - Centro") entre aspas, e
 * um `split(",")` na volta quebra a linha no meio do endereço e lê a coluna
 * errada como decisão de validação. Aqui as duas pontas seguem o mesmo formato
 * (RFC 4180): aspas duplicadas para escapar aspas, campo entre aspas pode conter
 * vírgula e quebra de linha.
 */

/** Escapa um valor para uma célula CSV. */
export function toCsvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Só precisa de aspas quando há vírgula, aspas ou quebra de linha.
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Monta o CSV completo a partir do cabeçalho e das linhas (arrays de valores). */
export function toCsv(header, rows) {
  return [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n");
}

/**
 * Divide o texto em linhas de células, respeitando aspas.
 * Aceita terminador \n e \r\n; ignora a última linha quando vazia.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char !== '"') {
        cell += char;
      } else if (text[i + 1] === '"') {
        cell += '"';
        i += 1; // aspas escapadas ("") viram uma só
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  // Última linha sem quebra no fim.
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((line) => line.some((value) => value.trim() !== ""));
}

/**
 * Lê o CSV como lista de objetos, usando a primeira linha como cabeçalho.
 *
 * Casa as colunas pelo nome, não pela posição: o revisor abre o arquivo no
 * Excel/Sheets e pode reordenar ou acrescentar colunas sem que a importação
 * passe a ler a coluna errada.
 */
export function parseCsvRecords(text) {
  const [header, ...lines] = parseCsv(text);
  if (!header) return [];

  const keys = header.map((name) => name.trim().toLowerCase());

  return lines.map((line) => {
    const record = {};
    keys.forEach((key, index) => {
      if (key) record[key] = (line[index] ?? "").trim();
    });
    return record;
  });
}
