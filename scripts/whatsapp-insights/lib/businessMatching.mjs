/**
 * Extração do nome de negócio citado numa mensagem de busca já categorizada,
 * e agrupamento (fuzzy) das menções recorrentes — a base do
 * "Ranking dos Mais Buscados" (Tarefa 1.4 / 2.1).
 */
import { confidenceFromRatio, findBestMatch, normalizeForMatch, similarityRatio } from "./fuzzy.mjs";
import { CATEGORY_PATTERNS } from "./patterns.mjs";
import { classifyInstitutionalCategory } from "./institutional.mjs";

// Categorias institucionais que não são prospect comercial (não vendem
// assinatura, não têm dono de negócio pra abordar) — ficam de fora do
// "Ranking dos Mais Buscados", que é ferramenta de priorização de vendas.
// `farmacia` fica fora dessa lista de propósito: é serviço público E
// comércio pago, candidato legítimo a assinatura.
const NON_COMMERCIAL_INSTITUTIONAL_CATEGORIES = new Set([
  "posto_saude",
  "pronto_socorro",
  "assistencia_social",
  "conselho_tutelar",
  "defensoria",
  "vigilancia_sanitaria",
  "prefeitura",
]);

// Palavras de pergunta/conectores que não fazem parte do nome do negócio.
// Combina os gatilhos de intenção (Tarefa 1.2) com artigos/preposições comuns
// em pt-BR. É heurístico por natureza — não tenta ser um NLP completo.
const STOPWORDS = new Set(
  [
    "a", "o", "as", "os", "um", "uma", "uns", "umas",
    "de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas",
    "por", "pra", "para", "com", "sem", "que", "se", "e", "ou", "mas",
    "ai", "aí", "aqui", "la", "lá", "isso", "esse", "essa", "esses", "essas",
    "algum", "alguma", "alguns", "algumas", "algo", "alguém", "alguem",
    "sabe", "sabem", "sabia", "indica", "indicacao", "indicação", "indicam",
    "conhece", "conhecem", "procuro", "procurando", "preciso", "precisando",
    "precisava", "onde", "encontro", "acho", "vende", "vendem", "comprar",
    "compra", "faz", "fazendo", "fazem", "conserta", "arruma", "quem",
    "trabalha", "trabalham", "entrega", "entregam", "numero", "número",
    "contato", "telefone", "zap", "whats", "whatsapp", "daquele", "daquela",
    "daqueles", "daquelas", "tem", "tinha", "ter", "vc", "voce", "você",
    "favor", "obrigado", "obrigada", "gente", "oi", "ola", "olá", "bom",
    "boa", "dia", "tarde", "noite", "urgente", "hoje", "perto", "sera",
    "será", "por gentileza", "gentileza", "manda", "mandar", "passa",
    "passar", "alguemé", "eh", "eé", "qual", "quais", "esta", "está",
    "estao", "estão", "ta", "tá", "tao", "tão", "ate", "até", "hj",
    "pfv", "pf", "cade", "cadê", "vai", "vao", "vão", "aberta", "aberto",
    "fechada", "fechado", "funciona", "funcionando",
  ].map((w) => normalizeForMatch(w)),
);

// Vocabulário genérico das 15 categorias (Tarefa 1.3) — as palavras que os
// próprios regex de categoria usam para reconhecer o tipo de negócio/serviço.
// Um contato .vcf cujo nome é feito só desse vocabulário (ex.: "Casa
// Aluguel") não identifica um negócio específico — é só um rótulo genérico
// que alguém salvou, e usá-lo como âncora de fuzzy match "adota" qualquer
// mensagem genérica da categoria como se fosse um pedido daquele contato.
const CATEGORY_VOCAB = new Set(
  Object.values(CATEGORY_PATTERNS).flatMap((pattern) =>
    (pattern.source.match(/[a-zà-ú]+/gi) ?? [])
      .filter((word) => word.length >= 3)
      .map((word) => normalizeForMatch(word)),
  ),
);

/** `true` quando todas as palavras do nome são vocabulário genérico de categoria. */
function isGenericVcfName(name) {
  const tokens = normalizeForMatch(name).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((token) => CATEGORY_VOCAB.has(token));
}

/** `true` para serviço público sem potencial comercial (ver `NON_COMMERCIAL_INSTITUTIONAL_CATEGORIES`). */
function isNonCommercialInstitutional(name) {
  const categoria = classifyInstitutionalCategory(name);
  return categoria !== null && NON_COMMERCIAL_INSTITUTIONAL_CATEGORIES.has(categoria);
}

const WORD_PATTERN = /[\p{L}\p{N}][\p{L}\p{N}'-]*/gu;
const MAX_CANDIDATE_WORDS = 5;

/**
 * Tenta extrair o "nome de negócio" citado numa mensagem, removendo palavras
 * de pergunta/conectores comuns. Devolve `null` quando não sobra nada que
 * pareça um nome (mensagem só com o padrão de busca, sem substantivo).
 */
export function extractBusinessNameCandidate(text) {
  const words = String(text ?? "").match(WORD_PATTERN) ?? [];
  const kept = words.filter((word) => !STOPWORDS.has(normalizeForMatch(word)) && !/^\d+$/.test(word));

  if (kept.length === 0) return null;

  const candidate = kept.slice(0, MAX_CANDIDATE_WORDS).join(" ").trim();
  if (candidate.replace(/[^\p{L}]/gu, "").length < 3) return null;

  return candidate;
}

/**
 * Agrupa menções de negócio por similaridade (Levenshtein), ancorando
 * primeiro nos contatos `.vcf` (quando existe um casamento razoável) e
 * agrupando o restante entre si mesmo ("fantasmas" sem contato conhecido).
 *
 * `mentions`: `{ candidate, category, date, text }[]` (já com
 * `extractBusinessNameCandidate` aplicado e não-nulo).
 * `vcfContacts`: `{ fileName, name, phone }[]`.
 */
export function clusterBusinessMentions(mentions, vcfContacts, { vcfMinRatio = 0.55, selfMinRatio = 0.75 } = {}) {
  const vcfClusters = new Map(); // fileName -> cluster
  const selfClusters = []; // clusters sem contato .vcf
  const namedVcfContacts = vcfContacts.filter(
    (contact) => !isGenericVcfName(contact.name) && !isNonCommercialInstitutional(contact.name),
  );

  for (const mention of mentions) {
    const vcfMatch = findBestMatch(mention.candidate, namedVcfContacts, {
      minRatio: vcfMinRatio,
      getText: (contact) => contact.name,
    });

    if (vcfMatch) {
      const key = vcfMatch.match.fileName;
      if (!vcfClusters.has(key)) {
        vcfClusters.set(key, {
          contact: vcfMatch.match,
          mentions: [],
          ratios: [],
        });
      }
      const cluster = vcfClusters.get(key);
      cluster.mentions.push(mention);
      cluster.ratios.push(vcfMatch.ratio);
      continue;
    }

    // Sem contato .vcf: agrupa contra os clusters "órfãos" já vistos,
    // comparando com a forma normalizada mais frequente de cada cluster.
    let best = null;
    let bestRatio = 0;
    for (const cluster of selfClusters) {
      const ratio = similarityRatio(mention.candidate, cluster.anchor);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = cluster;
      }
    }

    if (best && bestRatio >= selfMinRatio) {
      best.mentions.push(mention);
    } else {
      selfClusters.push({ anchor: mention.candidate, mentions: [mention] });
    }
  }

  const results = [];

  for (const { contact, mentions: clusterMentions, ratios } of vcfClusters.values()) {
    const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    results.push(buildEntry(contact.name, clusterMentions, {
      contatoVcfEncontrado: contact.fileName,
      confianca: confidenceFromRatio(avgRatio),
    }));
  }

  for (const { mentions: clusterMentions } of selfClusters) {
    const canonicalName = mostCommonRawForm(clusterMentions);
    results.push(buildEntry(canonicalName, clusterMentions, {
      contatoVcfEncontrado: null,
      // Sem contato .vcf de referência, a confiança é sempre limitada —
      // ganha "média" só quando o cluster é consistente e tem repetição.
      confianca: clusterMentions.length >= 3 ? "media" : "baixa",
    }));
  }

  return results.sort((a, b) => b.vezes_pedido - a.vezes_pedido);
}

function mostCommonRawForm(mentions) {
  const counts = new Map();
  for (const mention of mentions) {
    const normalized = normalizeForMatch(mention.candidate);
    const entry = counts.get(normalized) ?? { count: 0, raw: mention.candidate };
    entry.count += 1;
    counts.set(normalized, entry);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0].raw;
}

function mostCommonCategory(mentions) {
  const counts = new Map();
  for (const mention of mentions) {
    counts.set(mention.category, (counts.get(mention.category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function buildEntry(negocioNormalizado, mentions, extra) {
  const dates = mentions.map((m) => m.isoDate).filter(Boolean).sort();
  return {
    negocio_normalizado: negocioNormalizado,
    categoria: mostCommonCategory(mentions),
    vezes_pedido: mentions.length,
    primeira_mencao: dates[0] ?? null,
    ultima_mencao: dates[dates.length - 1] ?? null,
    exemplos_pedido: [...new Set(mentions.map((m) => m.text))].slice(0, 3),
    contato_vcf_encontrado: extra.contatoVcfEncontrado,
    confianca: extra.confianca,
  };
}

/** Marca `status: "ja_listado" | "nao_listado"` comparando com negócios já no app. */
export function withListedStatus(entry, existingBusinessNames, { minRatio = 0.72 } = {}) {
  const match = findBestMatch(entry.negocio_normalizado, existingBusinessNames, { minRatio });
  return {
    ...entry,
    status: match ? "ja_listado" : "nao_listado",
  };
}
