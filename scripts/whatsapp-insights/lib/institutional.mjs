/**
 * Classificação de contatos `.vcf` institucionais/saúde pública (PSF, CRAS,
 * farmácias, Conselho Tutelar, etc.) e contagem de menções no grupo —
 * base de `saude-e-servicos.json` (Tarefa 2.3).
 */
import { normalizeForMatch, similarityRatio } from "./fuzzy.mjs";

/**
 * Contatos que amarram um apelido/nome pessoal a uma função da prefeitura
 * (ex.: motorista específico), em vez de ser a linha institucional em si.
 * Não são "o contato público do serviço" — são o número de alguém, salvo
 * por quem fez o export. Ficam de fora por precaução de LGPD; ver
 * resumo-extracao.md.
 */
const PERSONAL_NICKNAME_EXCLUDE = new Set(
  ["daniela transporte prefeitura", "gordo prefeitura", "jaba prefeitura"].map(normalizeForMatch),
);

// Palavras genéricas que não ajudam a distinguir uma unidade específica
// (ex.: duas entradas de PSF diferentes) — removidas antes de extrair o
// "fragmento distintivo" usado para contar menções no grupo.
const GENERIC_WORDS = new Set(
  [
    "psf", "farmacia", "farmácia", "farma", "prefeitura", "conselho", "tutelar",
    "cras", "vigilancia", "vigilância", "sanitaria", "sanitária", "defensoria",
    "publica", "pública", "do", "da", "de", "dos", "das", "e", "monte", "santo",
    "minas", "mg", "municipal", "plantao", "plantão", "zap", "celular", "fixo",
    "matriz", "call", "center", "transporte", "ambulatorio", "ambulatório",
    "pronto", "socorro", "santa", "casa", "estado",
  ].map(normalizeForMatch),
);

/**
 * Ordem importa: termos mais específicos (psf, farmácia, cras, ...) são
 * checados antes de "prefeitura", que é o fallback genérico mais amplo.
 * `ambulatório` (clínica ambulatorial pública) é aproximado para
 * `posto_saude` — o enum fechado não tem um valor mais específico; ver
 * resumo-extracao.md.
 */
const CATEGORY_RULES = [
  { categoria: "posto_saude", pattern: /\bpsf\b|posto de sa[au]de|postinho/ },
  { categoria: "pronto_socorro", pattern: /pronto socorro|santa casa/ },
  { categoria: "farmacia", pattern: /farm[aá]/ },
  { categoria: "vacina", pattern: /vacin/ },
  { categoria: "assistencia_social", pattern: /\bcras\b|assist[eê]ncia social/ },
  { categoria: "conselho_tutelar", pattern: /conselho tutelar/ },
  { categoria: "defensoria", pattern: /defensoria/ },
  { categoria: "vigilancia_sanitaria", pattern: /vigil[aâ]ncia sanit[aá]ria/ },
  { categoria: "posto_saude", pattern: /ambulat[oó]rio/ },
  { categoria: "prefeitura", pattern: /prefeitura|call center|regula[çc][ãa]o|garagem|caps\b/ },
];

/** `categoria_servico` do enum fechado, ou `null` se o contato não for institucional/saúde. */
export function classifyInstitutionalCategory(name) {
  const normalized = normalizeForMatch(name);
  if (PERSONAL_NICKNAME_EXCLUDE.has(normalized)) return null;

  for (const { categoria, pattern } of CATEGORY_RULES) {
    if (pattern.test(normalized)) return categoria;
  }
  return null;
}

/** Palavras do nome que não são genéricas — o que distingue esta unidade das outras. */
function distinctiveTokens(name) {
  return normalizeForMatch(name)
    .split(" ")
    .filter((word) => word.length >= 3 && !GENERIC_WORDS.has(word));
}

/**
 * Agrupa contatos institucionais duplicados (o mesmo PSF salvo várias vezes
 * com pequenas variações de grafia) e conta quantas mensagens do grupo
 * mencionam cada unidade.
 *
 * `contacts`: `{ fileName, name, phone }[]` já filtrados para os
 * institucionais (via `classifyInstitutionalCategory`).
 * `messageTexts`: textos (já achatados) de todas as mensagens, para contagem
 * de menções — não carrega remetente.
 */
export function clusterInstitutionalContacts(contacts, messageTexts, { minRatio = 0.72 } = {}) {
  const clusters = [];

  for (const contact of contacts) {
    const categoria = classifyInstitutionalCategory(contact.name);
    if (!categoria) continue;

    let best = null;
    let bestRatio = 0;
    for (const cluster of clusters) {
      if (cluster.categoria !== categoria) continue;
      const ratio = similarityRatio(contact.name, cluster.contacts[0].name);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = cluster;
      }
    }

    if (best && bestRatio >= minRatio) {
      best.contacts.push(contact);
    } else {
      clusters.push({ categoria, contacts: [contact] });
    }
  }

  // Quantos clusters cada categoria acabou tendo — decide se o fallback por
  // categoria (abaixo) é seguro ou se ele estaria somando várias unidades
  // diferentes sob o mesmo número.
  const clustersPerCategory = new Map();
  for (const cluster of clusters) {
    clustersPerCategory.set(cluster.categoria, (clustersPerCategory.get(cluster.categoria) ?? 0) + 1);
  }

  return clusters.map(({ categoria, contacts }) => {
    // Nome mais completo (mais informativo) como canônico de exibição.
    const canonical = [...contacts].sort((a, b) => b.name.length - a.name.length)[0];
    const phone = contacts.find((c) => c.phone)?.phone ?? "";
    const tokens = distinctiveTokens(canonical.name);

    let mentionCount;
    let confiancaContagem;

    if (tokens.length > 0) {
      mentionCount = messageTexts.filter((text) => {
        const normalizedText = normalizeForMatch(text);
        return tokens.every((token) => normalizedText.includes(token));
      }).length;
      confiancaContagem = "alta";
    } else {
      // Sem fragmento distintivo (ex.: "Cras", "Defensoria Pública" puros):
      // conta por categoria inteira. Só é uma contagem confiável quando é a
      // única unidade da categoria — com mais de uma, o número soma todas e
      // não dá pra saber quanto é de cada uma.
      mentionCount = messageTexts.filter((text) =>
        CATEGORY_RULES.some((rule) => rule.categoria === categoria && rule.pattern.test(normalizeForMatch(text))),
      ).length;
      confiancaContagem = clustersPerCategory.get(categoria) === 1 ? "alta" : "baixa_soma_categoria";
    }

    return {
      nome: canonical.name,
      categoria_servico: categoria,
      telefone: phone,
      fonte: "vcf",
      vezes_mencionado_no_grupo: mentionCount,
      // Extra em relação ao schema da tarefa: "alta" = contagem específica
      // desta unidade; "baixa_soma_categoria" = número é o total da
      // categoria inteira (várias unidades sem nome distintivo somadas sob
      // o mesmo total) — não atribuir esse volume só a esta unidade.
      confianca_contagem: confiancaContagem,
      status: "pendente_validacao_manual",
    };
  });
}
