/**
 * Fonte única de resolução de fotos.
 *
 * Antes da carga de comércios reais, quase toda tela caía no `mockData.ts` —
 * e cada registro do mock traz uma foto. Com o banco populado
 * (`scripts/import-businesses.mjs`, que grava `cover_images: []` de propósito,
 * ver `docs/coleta-de-dados.md` §4), o fallback parou de disparar e os cards
 * passaram a exibir só o `/placeholder.svg`. As fotos não quebraram: a origem
 * delas mudou.
 *
 * Este módulo resolve a foto de qualquer registro percorrendo, em ordem:
 *
 *   1. fotos gravadas na linha  (`cover_images`, `gallery`, `images`, …)
 *   2. logo do comércio         (`logo` / `logo_url`)
 *   3. índice de fotos curadas  (casa por nome + cidade com o acervo do mock)
 *   4. Street View das coordenadas (chave do Maps + cobertura confirmada)
 *   5. `/placeholder.svg`
 *
 * O passo 4 depende de uma consulta assíncrona (`lib/streetView.ts`), então a
 * resolução aqui é **síncrona e otimista**: só inclui o Street View quando a
 * cobertura já é conhecida. Quem renderiza chama `useStreetViewProbe()` para
 * disparar a consulta e re-renderizar quando a resposta chegar.
 *
 * O passo 3 é uma ponte, não um destino: vale enquanto os comerciantes não
 * sobem as próprias fotos para o Supabase Storage. Quando a coluna
 * `cover_images` estiver populada, ele deixa de ser alcançado sozinho.
 */

import { businesses as curatedBusinesses } from "@/data/mockData";
import { mapsStreetViewUrl, toLatLng } from "@/lib/maps";
import { getStreetViewCoverage } from "@/lib/streetView";

/** Imagem final quando não há absolutamente nenhuma foto. */
export const PHOTO_PLACEHOLDER = "/placeholder.svg";

/**
 * Aceita as formas que `cover_images` realmente assume na base.
 *
 * A coluna é `jsonb` no banco de produção (CLAUDE.md §11) e o conteúdo variou
 * conforme quem gravou: array de strings, array de objetos vindo do payload do
 * Places, uma string com JSON dentro (carga manual pelo SQL Editor) ou uma
 * lista separada por vírgula. O código anterior fazia `Array.isArray(...)` e
 * descartava em silêncio tudo que não fosse o primeiro caso.
 */
export function parsePhotoList(value: unknown): string[] {
  const out: string[] = [];

  const push = (candidate: unknown): void => {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      // `""` viraria <img src="">, que o navegador resolve para a própria
      // página e desenha como imagem quebrada.
      if (trimmed) out.push(trimmed);
      return;
    }

    if (candidate && typeof candidate === "object") {
      const record = candidate as Record<string, unknown>;
      push(record.url ?? record.src ?? record.image_url ?? record.publicUrl);
    }
  };

  const visit = (input: unknown): void => {
    if (input == null) return;

    if (Array.isArray(input)) {
      input.forEach(visit);
      return;
    }

    if (typeof input === "string") {
      const trimmed = input.trim();
      if (!trimmed) return;

      // String com JSON dentro: '["https://..."]' ou '{"url":"https://..."}'.
      if (/^[[{]/.test(trimmed)) {
        try {
          visit(JSON.parse(trimmed));
          return;
        } catch {
          /* não era JSON válido: segue como texto puro */
        }
      }

      // Lista separada por vírgula — só quando não é uma URL única (uma URL
      // pode conter vírgula em parâmetros, então exige o "http" no pedaço).
      if (trimmed.includes(",") && /,\s*https?:\/\//.test(trimmed)) {
        trimmed.split(",").forEach(push);
        return;
      }

      push(trimmed);
      return;
    }

    push(input);
  };

  visit(value);

  return Array.from(new Set(out));
}

/**
 * Chave de comparação de nomes: minúsculas, sem acento e sem pontuação.
 * Mesmo critério de `scripts/lib/businessRow.mjs`, para que o casamento aqui e
 * o da importação enxerguem o mesmo comércio.
 */
export function normalizeForMatch(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Índice nome → fotos, montado a partir do acervo já curado no repositório.
 * Construído sob demanda: quem nunca resolve foto não paga a varredura.
 */
let curatedIndex: Map<string, string[]> | null = null;

function getCuratedIndex(): Map<string, string[]> {
  if (curatedIndex) return curatedIndex;

  const index = new Map<string, string[]>();
  for (const business of curatedBusinesses) {
    const photos = parsePhotoList(business.coverImages);
    if (photos.length === 0) continue;

    const key = normalizeForMatch(business.name);
    // A primeira ocorrência vence, como na dedup da importação.
    if (key && !index.has(key)) index.set(key, photos);
  }

  curatedIndex = index;
  return index;
}

/** Só para teste: força a reconstrução do índice. */
export function resetCuratedPhotoIndex(): void {
  curatedIndex = null;
}

/** Fotos curadas para um nome de comércio, ou lista vazia. */
export function getCuratedPhotos(name: unknown): string[] {
  const key = normalizeForMatch(name);
  if (!key) return [];
  return getCuratedIndex().get(key) ?? [];
}

/**
 * Registro solto de onde extrair fotos. Os nomes variam por origem — linha do
 * Supabase (`cover_images`, `logo_url`, `latitude`), tipos do mock
 * (`coverImage` + `gallery` em Place/Car/RealEstate, `logo` em Job) e o tipo
 * já normalizado (`coverImages`).
 */
export interface PhotoSourceLike {
  name?: unknown;
  coverImages?: unknown;
  cover_images?: unknown;
  coverImage?: unknown;
  gallery?: unknown;
  images?: unknown;
  image?: unknown;
  logo?: unknown;
  logo_url?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  lat?: unknown;
  lng?: unknown;
}

/** Junta todas as chaves de foto conhecidas, preservando a ordem de prioridade. */
function collectStoredPhotos(source: PhotoSourceLike): string[] {
  const photos = [
    ...parsePhotoList(source.coverImages),
    ...parsePhotoList(source.cover_images),
    ...parsePhotoList(source.coverImage),
    ...parsePhotoList(source.images),
    ...parsePhotoList(source.image),
    ...parsePhotoList(source.gallery),
  ];

  // O placeholder não é foto gravada. Ele reaparece aqui porque um registro já
  // normalizado volta a passar por `resolveBusinessPhotos` (o BusinessCard
  // renormaliza a prop a cada render); sem descartá-lo, a cadeia pararia no
  // primeiro passo e nunca chegaria ao acervo curado nem ao Street View.
  return Array.from(new Set(photos)).filter(
    (photo) => photo !== PHOTO_PLACEHOLDER,
  );
}

export interface ResolvePhotosOptions {
  /** Consultar o índice de fotos curadas quando a linha não tiver nenhuma. */
  useCurated?: boolean;
  /** Usar Street View como último recurso antes do placeholder. */
  useStreetView?: boolean;
  /** Garante ao menos uma entrada (o placeholder) na lista devolvida. */
  fallbackToPlaceholder?: boolean;
}

/**
 * Devolve a lista de fotos de um registro, já na ordem de exibição.
 *
 * Nunca devolve string vazia; com `fallbackToPlaceholder` (padrão) nunca
 * devolve lista vazia — o chamador pode renderizar direto.
 */
export function resolveBusinessPhotos(
  source: PhotoSourceLike | null | undefined,
  {
    useCurated = true,
    useStreetView = true,
    fallbackToPlaceholder = true,
  }: ResolvePhotosOptions = {},
): string[] {
  if (!source) return fallbackToPlaceholder ? [PHOTO_PLACEHOLDER] : [];

  const stored = collectStoredPhotos(source);
  if (stored.length > 0) return stored;

  const logo = [
    ...parsePhotoList(source.logo),
    ...parsePhotoList(source.logo_url),
  ];
  if (logo.length > 0) return logo;

  if (useCurated) {
    const curated = getCuratedPhotos(source.name);
    if (curated.length > 0) return curated;
  }

  if (useStreetView) {
    const position = toLatLng(
      (source.latitude ?? source.lat) as number | string | null | undefined,
      (source.longitude ?? source.lng) as number | string | null | undefined,
    );

    // Só pede a foto onde o metadado (gratuito) confirmou cobertura — ou onde
    // não deu para checar (`"assumida"`), aí vale tentar como antes.
    // `"indisponivel"` é o Google dizendo que não há panorama: pedir a imagem
    // ali é cota jogada fora. `undefined` (ainda não checado) espera o
    // `useStreetViewProbe` disparar a consulta e re-renderizar; até lá o
    // comércio mostra o mapa.
    const coverage = position ? getStreetViewCoverage(position) : undefined;
    if (position && (coverage === "disponivel" || coverage === "assumida")) {
      const streetView = mapsStreetViewUrl(position);
      if (streetView) return [streetView];
    }
  }

  return fallbackToPlaceholder ? [PHOTO_PLACEHOLDER] : [];
}

/** Atalho para quem só precisa da capa. */
export function resolveBusinessCover(
  source: PhotoSourceLike | null | undefined,
  options?: ResolvePhotosOptions,
): string {
  return resolveBusinessPhotos(source, options)[0] ?? PHOTO_PLACEHOLDER;
}
