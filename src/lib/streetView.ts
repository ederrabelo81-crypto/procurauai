/**
 * Cobertura do Street View por coordenada.
 *
 * Nem todo endereço tem panorama. Sem checar antes, o app pede a imagem, o
 * Google responde 404 (`return_error_code=true`) e o `SmartImage` cai no
 * placeholder — funciona, mas gasta uma requisição de imagem (cota paga) e
 * pisca na tela.
 *
 * O endpoint de metadados responde a mesma pergunta em JSON e **é gratuito**,
 * então a consulta acontece antes de montar a URL da foto.
 *
 * **A checagem é um otimizador, nunca um requisito.** Se a consulta falhar por
 * qualquer motivo — CORS, rede, cota — o resultado vira `"assumida"` e a foto é
 * pedida assim mesmo, exatamente como antes. Nenhum comércio perde a capa
 * porque a checagem não pôde rodar.
 */

import { mapsStreetViewMetadataUrl, type LatLng } from "@/lib/maps";
import { reportError } from "@/lib/errors/errorHandler";

export type StreetViewCoverage =
  /** Metadado confirmou que existe panorama. */
  | "disponivel"
  /** Metadado confirmou que não existe: não peça a imagem. */
  | "indisponivel"
  /** Não deu para checar (CORS/rede). Pede a imagem e deixa o onError decidir. */
  | "assumida";

const STORAGE_KEY = "procura-uai-streetview";

/** Coordenadas a ~1 m de distância compartilham o mesmo panorama. */
function coverageKey(position: LatLng): string {
  return `${position.lat.toFixed(5)},${position.lng.toFixed(5)}`;
}

const coverage = new Map<string, StreetViewCoverage>();
const inFlight = new Map<string, Promise<StreetViewCoverage>>();

/**
 * O resultado vale para a sessão inteira: navegar entre categorias reencontra
 * os mesmos comércios, e sem isso cada volta à home refaria todas as consultas.
 */
function loadPersisted(): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      // "assumida" não é resultado, é ausência de resposta: não persiste.
      if (value === "disponivel" || value === "indisponivel") {
        coverage.set(key, value);
      }
    }
  } catch {
    /* sessionStorage indisponível ou JSON corrompido: segue sem cache */
  }
}

function persist(): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(coverage)),
    );
  } catch {
    /* cota de storage estourada ou modo privado: o cache em memória basta */
  }
}

let loaded = false;

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  if (typeof sessionStorage !== "undefined") loadPersisted();
}

/**
 * Leitura síncrona do que já se sabe. `undefined` = ainda não checado —
 * quem precisa do resultado chama `checkStreetViewCoverage()`.
 */
export function getStreetViewCoverage(
  position: LatLng | null | undefined,
): StreetViewCoverage | undefined {
  if (!position) return undefined;
  ensureLoaded();
  return coverage.get(coverageKey(position));
}

/**
 * Consulta o metadado uma única vez por coordenada. Chamadas simultâneas para
 * a mesma coordenada compartilham a mesma requisição.
 */
export function checkStreetViewCoverage(
  position: LatLng | null | undefined,
): Promise<StreetViewCoverage> {
  if (!position) return Promise.resolve("indisponivel");

  ensureLoaded();
  const key = coverageKey(position);

  const known = coverage.get(key);
  if (known) return Promise.resolve(known);

  const running = inFlight.get(key);
  if (running) return running;

  const url = mapsStreetViewMetadataUrl(position);
  // Sem chave não há foto do Street View para pedir de qualquer forma.
  if (!url) {
    coverage.set(key, "indisponivel");
    return Promise.resolve("indisponivel");
  }

  const request = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<{ status?: string }>;
    })
    .then((body): StreetViewCoverage => {
      if (body?.status === "OK") return "disponivel";
      if (body?.status === "ZERO_RESULTS") return "indisponivel";

      // REQUEST_DENIED / OVER_QUERY_LIMIT: problema de configuração ou cota,
      // não de cobertura. Reporta uma vez e deixa a imagem tentar.
      reportError(new Error(`Street View metadata: ${body?.status}`), {
        scope: "checkStreetViewCoverage",
      });
      return "assumida";
    })
    .catch((): StreetViewCoverage => {
      // Falha de CORS ou de rede não diz nada sobre a cobertura: mantém o
      // comportamento antigo (pede a imagem, onError resolve).
      return "assumida";
    })
    .then((result) => {
      coverage.set(key, result);
      if (result !== "assumida") persist();
      inFlight.delete(key);
      return result;
    });

  inFlight.set(key, request);
  return request;
}

/** Só para teste: zera o cache em memória e o que estiver persistido. */
export function resetStreetViewCoverage(): void {
  coverage.clear();
  inFlight.clear();
  loaded = false;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sem storage, nada a limpar */
  }
}
