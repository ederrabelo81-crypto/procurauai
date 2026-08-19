/**
 * Extração de insights dos grupos de WhatsApp de Monte Santo de Minas —
 * "o que a cidade mais pergunta e não encontra".
 *
 * Lê os exports brutos (`.txt` + contatos `.vcf`) de `data/whatsapp-raw/`,
 * detecta mensagens de busca ("alguém sabe...", "onde acho...", ...),
 * categoriza por tipo de negócio/serviço e agrupa negócios recorrentes
 * ("fantasmas": pedidos várias vezes, nunca listados) via fuzzy match contra
 * os contatos `.vcf` e contra `src/data/mockData.ts`.
 *
 * Uso:
 *   node scripts/whatsapp-insights/extract-insights.mjs [--help]
 *
 * ⚠️ Privacidade (LGPD): os `.txt`/`.vcf` brutos e o remetente de cada
 * mensagem nunca são gravados em disco por este script — só contagens,
 * categorias e o texto (sem remetente) das mensagens de busca. Contatos
 * `.vcf` institucionais/comerciais (farmácia, PSF, CRAS, ...) são
 * estruturados com `status: "pendente_validacao_manual"`: nada publicável
 * sem revisão humana. Ver o guardrail de privacidade na descrição da tarefa
 * e as notas em `resumo-extracao.md`.
 *
 * Saída (staging, não produção): `data/whatsapp-insights/`
 *   - mais-buscados.json       negócios mais pedidos, no grupo, e não listados
 *   - demanda-por-categoria.json  contagem de buscas por categoria
 *   - saude-e-servicos.json    contatos de saúde/serviço público (.vcf)
 *   - resumo-extracao.md       relatório técnico para conferência
 *   - mais-buscados.md         ranking em tabela (uso interno / curadoria)
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseWhatsAppExport, toIsoDate } from "./lib/parser.mjs";
import { CATEGORY_PATTERNS, categorizeMessage, detectSearchIntent, isRealtimeIntent } from "./lib/patterns.mjs";
import { parseVcfDirectory } from "./lib/vcf.mjs";
import { redactPhoneNumbers } from "./lib/privacy.mjs";
import {
  clusterBusinessMentions,
  extractBusinessNameCandidate,
  withListedStatus,
} from "./lib/businessMatching.mjs";
import { classifyInstitutionalCategory, clusterInstitutionalContacts } from "./lib/institutional.mjs";

const RAW_DIR = "data/whatsapp-raw";
const OUT_DIR = "data/whatsapp-insights";

const SOURCES = [
  {
    key: "tv-web-monte-santo-2",
    label: "Tv Web Monte Santo 2",
    txt: "tv-web-monte-santo-2.txt",
    vcfDir: "tv-web-monte-santo-2-contatos",
  },
  {
    key: "boa-acao-doacao",
    label: "Boa ação é doação",
    txt: "boa-acao-doacao.txt",
    vcfDir: "boa-acao-doacao-contatos",
  },
];

// Cluster com menos de 2 menções vira ruído demais para a tabela de
// priorização (milhares de fragmentos de 1 mensagem); a lista completa,
// sem esse corte, continua em mais-buscados.json.
const MIN_MENTIONS_FOR_RANKING_TABLE = 2;

const HELP_TEXT = `
Extração de insights dos grupos de WhatsApp — Procura UAI

  node scripts/whatsapp-insights/extract-insights.mjs [opções]

Opções:
  --help    mostra esta ajuda

Requer ${RAW_DIR}/ com os exports brutos do WhatsApp (ver o cabeçalho do
script para o formato esperado). Nunca grava remetente nem número de
telefone de pessoa física em disco — ver o cabeçalho do script.
`.trim();

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrai os nomes de `businesses` (`src/data/mockData.ts`) por regex — o
 * script roda fora do bundler, então não pode importar o `.ts` diretamente.
 * Restringe ao trecho do array `businesses` para não pegar `name` de outros
 * arrays do mesmo arquivo (listings, deals, events, ...).
 */
async function loadMockBusinessNames(repoRoot) {
  const filePath = path.join(repoRoot, "src/data/mockData.ts");
  const content = await readFile(filePath, "utf8");

  const start = content.indexOf("export const businesses");
  if (start === -1) return [];
  const nextExport = content.indexOf("\nexport const", start + 1);
  const section = nextExport === -1 ? content.slice(start) : content.slice(start, nextExport);

  return [...section.matchAll(/\bname:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function toMarkdownTable(headers, rows) {
  const headerLine = `| ${headers.join(" | ")} |`;
  const dividerLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyLines = rows.map((row) => `| ${row.map((cell) => String(cell ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

async function collectSource(rawDirPath, source) {
  const txtPath = path.join(rawDirPath, source.txt);
  if (!(await pathExists(txtPath))) {
    throw new Error(`${source.txt} não encontrado em ${RAW_DIR}/.`);
  }

  const rawText = await readFile(txtPath, "utf8");
  const messages = parseWhatsAppExport(rawText).map((entry) => ({
    ...entry,
    isoDate: toIsoDate(entry.date),
    source: source.key,
  }));

  const vcfDirPath = path.join(rawDirPath, source.vcfDir);
  const contacts = (await parseVcfDirectory(vcfDirPath)).map((contact) => ({
    ...contact,
    source: source.key,
  }));

  return { messages, contacts };
}

export async function runExtraction({ repoRoot = process.cwd() } = {}) {
  const rawDirPath = path.join(repoRoot, RAW_DIR);

  const perSourceStats = [];
  const allMessages = [];
  const allVcfContacts = [];

  for (const source of SOURCES) {
    const { messages, contacts } = await collectSource(rawDirPath, source);
    allMessages.push(...messages);
    allVcfContacts.push(...contacts);
    perSourceStats.push({
      label: source.label,
      totalMessages: messages.length,
      totalContatos: contacts.length,
    });
  }

  // ── Intenção de busca + categorização ────────────────────────────────
  const buscaMessages = [];
  for (const message of allMessages) {
    const intents = detectSearchIntent(message.text);
    if (intents.length === 0) continue;
    buscaMessages.push({
      ...message,
      intents,
      categories: categorizeMessage(message.text),
      realtime: isRealtimeIntent(message.text),
    });
  }

  const demandaPorCategoria = Object.keys(CATEGORY_PATTERNS)
    .map((categoria) => ({
      categoria,
      mensagens: buscaMessages.filter((m) => m.categories.includes(categoria)).length,
    }))
    .sort((a, b) => b.mensagens - a.mensagens);

  const realtimeCount = buscaMessages.filter((m) => m.realtime).length;
  const semCategoriaCount = buscaMessages.filter((m) => m.categories.length === 0).length;

  // ── Negócios recorrentes ("fantasmas") ───────────────────────────────
  const businessMentions = [];
  for (const message of buscaMessages) {
    if (message.categories.length === 0) continue;
    const candidate = extractBusinessNameCandidate(message.text);
    if (!candidate) continue;
    businessMentions.push({
      candidate,
      category: message.categories[0],
      isoDate: message.isoDate,
      // Redigido: gente às vezes cola o próprio telefone no corpo da
      // mensagem (ex.: "me chama nesse número 35 9..."), e isso não pode
      // ir para um arquivo versionado — ver lib/privacy.mjs.
      text: redactPhoneNumbers(message.text.replace(/\s+/g, " ").trim()),
    });
  }

  const clusters = clusterBusinessMentions(businessMentions, allVcfContacts);
  const mockBusinessNames = await loadMockBusinessNames(repoRoot);
  const maisBuscados = clusters.map((entry) => withListedStatus(entry, mockBusinessNames));

  // ── Saúde & serviços públicos ─────────────────────────────────────────
  const institutionalContacts = allVcfContacts.filter((contact) =>
    classifyInstitutionalCategory(contact.name),
  );
  const saudeEServicos = clusterInstitutionalContacts(
    institutionalContacts,
    allMessages.map((m) => m.text),
  ).sort((a, b) => b.vezes_mencionado_no_grupo - a.vezes_mencionado_no_grupo);

  return {
    perSourceStats,
    totalMessages: allMessages.length,
    totalBusca: buscaMessages.length,
    realtimeCount,
    semCategoriaCount,
    demandaPorCategoria,
    maisBuscados,
    saudeEServicos,
  };
}

function buildResumoMarkdown(result) {
  const { perSourceStats, totalMessages, totalBusca, realtimeCount, semCategoriaCount, demandaPorCategoria, maisBuscados, saudeEServicos } = result;

  const naoListadosTop20 = maisBuscados
    .filter((entry) => entry.status === "nao_listado")
    .slice(0, 20);

  const baixaConfiancaCount = maisBuscados.filter((entry) => entry.confianca === "baixa").length;
  const semVcfCount = maisBuscados.filter((entry) => !entry.contato_vcf_encontrado).length;
  const somaCategoriaCount = saudeEServicos.filter(
    (entry) => entry.confianca_contagem === "baixa_soma_categoria",
  ).length;
  const porCategoriaServico = new Map();
  for (const entry of saudeEServicos) {
    porCategoriaServico.set(entry.categoria_servico, (porCategoriaServico.get(entry.categoria_servico) ?? 0) + 1);
  }

  return `# Resumo da extração — insights de WhatsApp

Gerado por \`scripts/whatsapp-insights/extract-insights.mjs\`. Relatório técnico
para conferência — o relatório estratégico já existe fora deste repositório.

## Mensagens processadas

${toMarkdownTable(
    ["Arquivo", "Mensagens (após filtro de sistema/mídia)", "Contatos .vcf"],
    perSourceStats.map((s) => [s.label, s.totalMessages, s.totalContatos]),
  )}

- Total geral: **${totalMessages}** mensagens.
- Mensagens de busca detectadas (intenção casada): **${totalBusca}**.
- Dessas, **${semCategoriaCount}** não casaram em nenhuma das 15 categorias de
  negócio/serviço (Tarefa 1.3) — ficam fora de \`demanda-por-categoria.json\`
  e do agrupamento de negócios, mas contam no total acima.
- Mensagens marcadas como tempo real/urgência (\`realtime: true\`): **${realtimeCount}**.

> Nota: a tarefa descreve "16 categorias" em alguns pontos, mas só define
> regex para 15 (\`saude_medico\` … \`outros_servicos\`). Implementamos
> exatamente as 15 fornecidas — não inventamos uma 16ª categoria.

## Distribuição por categoria

${toMarkdownTable(
    ["Categoria", "Mensagens de busca"],
    demandaPorCategoria.map((c) => [c.categoria, c.mensagens]),
  )}

## Top 20 negócios mais pedidos e não listados

${naoListadosTop20.length === 0
      ? "_Nenhum negócio não-listado com pedidos suficientes para destacar._"
      : toMarkdownTable(
        ["Negócio", "Categoria", "Vezes pedido", "Confiança", "Contato .vcf", "1ª menção", "Última menção"],
        naoListadosTop20.map((e) => [
          e.negocio_normalizado,
          e.categoria,
          e.vezes_pedido,
          e.confianca,
          e.contato_vcf_encontrado ?? "—",
          e.primeira_mencao ?? "—",
          e.ultima_mencao ?? "—",
        ]),
      )
    }

Lista completa (inclusive já listados, para comparação) em \`mais-buscados.json\`
(${maisBuscados.length} agrupamentos) e em tabela filtrada (≥ ${MIN_MENTIONS_FOR_RANKING_TABLE}
pedidos) em \`mais-buscados.md\`.

## Saúde & serviços públicos

Contatos institucionais extraídos dos \`.vcf\` (farmácias, PSFs, CRAS,
Conselho Tutelar, Defensoria, Vigilância Sanitária, Ambulatório, Prefeitura,
Santa Casa/Pronto Socorro): **${saudeEServicos.length}** unidades, após
deduplicar contatos repetidos (a mesma unidade salva com pequenas variações
de grafia).

${toMarkdownTable(
    ["categoria_servico", "Unidades"],
    [...porCategoriaServico.entries()].sort((a, b) => b[1] - a[1]),
  )}

Todos os registros saem com \`status: "pendente_validacao_manual"\` — nenhum
vai ao ar sem a curadoria manual que o projeto já define (confirmar telefone,
horário, categoria com o próprio serviço). Ver \`saude-e-servicos.json\`.

## Decisões que merecem revisão humana

- **${baixaConfiancaCount}** dos ${maisBuscados.length} agrupamentos de
  \`mais-buscados.json\` saíram com \`confianca: "baixa"\` — nome extraído da
  mensagem é curto/ambíguo ou o cluster não tem contato \`.vcf\` de
  referência. Revisar antes de usar para prospecção.
- **${semVcfCount}** agrupamentos não casaram com nenhum contato \`.vcf\`
  (\`contato_vcf_encontrado: null\`) — o nome do negócio veio só do texto da
  mensagem, agrupado por similaridade com outras menções.
- Contatos "${"Daniela Transporte Prefeitura"}", "${"Gordo Prefeitura"}" e
  "${"Jaba Prefeitura"}" (\`.vcf\` da prefeitura) foram **excluídos** de
  \`saude-e-servicos.json\` por precaução de LGPD: o nome amarra um
  apelido/pessoa a uma função pública, diferente de uma linha institucional
  divulgada pelo próprio serviço (ex.: "PSF São Camilo",
  "Farmácia São Geraldo"). Revisar se algum desses deveria entrar mesmo
  assim, com o nome genérico da função em vez do apelido.
- "Ambulatório" foi mapeado para \`categoria_servico: "posto_saude"\` por
  aproximação — o enum fechado não tem um valor específico para clínica
  ambulatorial. Revisar se merece virar \`"outro"\` em vez disso.
- \`vezes_mencionado_no_grupo\` em \`saude-e-servicos.json\` é uma contagem
  por palavra-chave (categoria + fragmento distintivo do nome, ex.:
  "são camilo" para o PSF São Camilo). **${somaCategoriaCount}** unidades
  saíram com \`confianca_contagem: "baixa_soma_categoria"\`: o nome não tem
  fragmento distintivo o bastante (ex.: duas farmácias cujo nome, sem as
  palavras genéricas "farmácia"/"pública", não sobra nada) e a categoria tem
  mais de uma unidade — o número reportado é o total de menções à categoria
  inteira, repetido em cada uma, **não** uma contagem por unidade. Não usar
  esse número para comparar unidades entre si sem revisar antes.
- O painel administrativo do projeto ainda não existe no código — por isso
  o "Ranking dos Mais Buscados" saiu como \`mais-buscados.md\` (tabela) em vez
  de uma tela nova. Integrar \`mais-buscados.json\` a um painel é o próximo
  passo, quando esse painel existir.
`;
}

function buildRankingMarkdown(maisBuscados) {
  const rows = maisBuscados.filter((e) => e.vezes_pedido >= MIN_MENTIONS_FOR_RANKING_TABLE);

  return `# Ranking dos Mais Buscados (uso interno)

Gerado por \`scripts/whatsapp-insights/extract-insights.mjs\` a partir de
\`mais-buscados.json\`. **Não é uma feature para o consumidor final** — é
ferramenta de priorização de vendas/curadoria. Mostra só agrupamentos com
${MIN_MENTIONS_FOR_RANKING_TABLE}+ pedidos no grupo (a lista completa,
inclusive singelos, está em \`mais-buscados.json\`).

Não existe painel administrativo no código ainda — quando existir, o próximo
passo é ler \`mais-buscados.json\` ali (ordenado por \`vezes_pedido\`, com
filtro por \`status: "nao_listado"\`) em vez desta tabela estática.

${toMarkdownTable(
    ["Negócio", "Categoria", "Vezes pedido", "Status", "Confiança", "Contato .vcf", "1ª menção", "Última menção"],
    rows.map((e) => [
      e.negocio_normalizado,
      e.categoria,
      e.vezes_pedido,
      e.status,
      e.confianca,
      e.contato_vcf_encontrado ?? "—",
      e.primeira_mencao ?? "—",
      e.ultima_mencao ?? "—",
    ]),
  )}
`;
}

async function writeOutputs(repoRoot, result) {
  const outDirPath = path.join(repoRoot, OUT_DIR);
  await mkdir(outDirPath, { recursive: true });

  const writeJson = (fileName, data) =>
    writeFile(path.join(outDirPath, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");

  await writeJson("mais-buscados.json", result.maisBuscados);
  await writeJson("demanda-por-categoria.json", result.demandaPorCategoria);
  await writeJson("saude-e-servicos.json", result.saudeEServicos);
  await writeFile(path.join(outDirPath, "resumo-extracao.md"), buildResumoMarkdown(result), "utf8");
  await writeFile(path.join(outDirPath, "mais-buscados.md"), buildRankingMarkdown(result.maisBuscados), "utf8");
}

const run = async () => {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(HELP_TEXT);
    return 0;
  }

  const repoRoot = process.cwd();
  const rawDirPath = path.join(repoRoot, RAW_DIR);

  if (!(await pathExists(rawDirPath))) {
    console.error(`✖ ${RAW_DIR}/ não encontrado.`);
    console.error(
      `\n  Coloque os exports brutos do WhatsApp em ${RAW_DIR}/ antes de rodar este script:\n` +
        `    ${RAW_DIR}/tv-web-monte-santo-2.txt\n` +
        `    ${RAW_DIR}/tv-web-monte-santo-2-contatos/*.vcf\n` +
        `    ${RAW_DIR}/boa-acao-doacao.txt\n` +
        `    ${RAW_DIR}/boa-acao-doacao-contatos/*.vcf\n`,
    );
    return 1;
  }

  let result;
  try {
    result = await runExtraction({ repoRoot });
  } catch (error) {
    console.error(`✖ ${error.message}`);
    return 1;
  }

  await writeOutputs(repoRoot, result);

  console.log(`Mensagens processadas: ${result.totalMessages}`);
  console.log(`Mensagens de busca detectadas: ${result.totalBusca}`);
  console.log(`Agrupamentos em mais-buscados.json: ${result.maisBuscados.length}`);
  console.log(`Contatos de saúde/serviço em saude-e-servicos.json: ${result.saudeEServicos.length}`);
  console.log(`\nArquivos gerados em ${OUT_DIR}/:`);
  console.log("  mais-buscados.json\n  demanda-por-categoria.json\n  saude-e-servicos.json\n  resumo-extracao.md\n  mais-buscados.md");

  return 0;
};

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  run()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error("Falha no script:", error);
      process.exitCode = 1;
    });
}
