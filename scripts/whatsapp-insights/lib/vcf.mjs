/**
 * Leitura dos contatos `.vcf` exportados junto com as conversas — são os
 * contatos comerciais/institucionais salvos no telefone que gerou o export
 * (farmácias, PSFs, oficinas, etc.), um arquivo por contato.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

function extractField(vcard, field) {
  // Formato vCard 3.0: "FN:Nome" ou "item1.TEL;waid=...:+55 35 9999-9999".
  const line = vcard.split(/\r?\n/).find((l) => l.startsWith(`${field}:`) || l.includes(`.${field};`));
  if (!line) return "";
  const colonIndex = line.indexOf(":");
  return colonIndex === -1 ? "" : line.slice(colonIndex + 1).trim();
}

/** Lê todos os `.vcf` de um diretório e devolve `{ fileName, name, phone }[]`. */
export async function parseVcfDirectory(dirPath) {
  let fileNames;
  try {
    fileNames = await readdir(dirPath);
  } catch {
    return [];
  }

  const contacts = [];
  for (const fileName of fileNames.filter((f) => f.toLowerCase().endsWith(".vcf"))) {
    const raw = await readFile(path.join(dirPath, fileName), "utf8");
    const fn = extractField(raw, "FN");
    const tel = extractField(raw, "TEL");
    contacts.push({
      fileName,
      name: fn || path.basename(fileName, ".vcf"),
      phone: tel,
    });
  }
  return contacts;
}
