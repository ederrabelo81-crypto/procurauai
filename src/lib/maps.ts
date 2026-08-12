/**
 * Camada única de integração com o Google Maps.
 *
 * Todo acesso à chave da API e toda montagem de URL do Maps passa por aqui.
 * Nenhum componente deve ler `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`
 * diretamente nem embutir chave em string literal.
 *
 * APIs usadas e o que cada uma exige no Google Cloud Console:
 *  - Maps JavaScript API .... mapas interativos (<Map> do @vis.gl/react-google-maps)
 *  - Maps Embed API ......... iframes de localização (MapEmbed)
 *  - Maps Static API ........ imagem estática usada como fallback leve
 *  - Geocoding API .......... opcional, para scripts de coleta de coordenadas
 *
 * Os links "abrir no Google Maps" usam a Maps URLs API, que é pública e
 * não consome cota nem exige chave.
 */

import { env } from '@/config/env';

/** Centro padrão: praça matriz de Monte Santo de Minas / MG. */
export const DEFAULT_CENTER = { lat: -20.8903, lng: -46.7029 } as const;

export const DEFAULT_ZOOM = 14;

/** Chave da Maps JavaScript/Embed/Static API. Vazia quando não configurada. */
export const MAPS_API_KEY: string = env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? '';

/**
 * Map ID do Cloud Console. Obrigatório para `AdvancedMarker` e para aplicar
 * estilo de mapa via nuvem. `DEMO_MAP_ID` é o fallback oficial do Google para
 * desenvolvimento — funciona, mas exibe marca d'água e ignora o estilo salvo.
 */
export const MAPS_MAP_ID: string =
  env.VITE_GOOGLE_MAPS_MAP_ID?.trim() || 'DEMO_MAP_ID';

/** true quando há chave configurada; use para decidir entre mapa e fallback. */
export const hasMapsKey = MAPS_API_KEY.length > 0;

export interface LatLng {
  lat: number;
  lng: number;
}

/** Extrai coordenadas de um objeto solto, devolvendo null se inválidas. */
export function toLatLng(
  lat?: number | string | null,
  lng?: number | string | null
): LatLng | null {
  const parsedLat = typeof lat === 'string' ? Number(lat) : lat;
  const parsedLng = typeof lng === 'string' ? Number(lng) : lng;

  if (
    typeof parsedLat !== 'number' ||
    typeof parsedLng !== 'number' ||
    Number.isNaN(parsedLat) ||
    Number.isNaN(parsedLng) ||
    parsedLat < -90 ||
    parsedLat > 90 ||
    parsedLng < -180 ||
    parsedLng > 180 ||
    (parsedLat === 0 && parsedLng === 0)
  ) {
    return null;
  }

  return { lat: parsedLat, lng: parsedLng };
}

/** Monta a busca textual usada quando não há coordenadas. */
export function buildPlaceQuery(...parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .trim();
}

/* ─────────────────────────────────────────────────────────────────────────
   Maps URLs API — links externos, sem chave e sem cota
   ───────────────────────────────────────────────────────────────────────── */

/** Abre o Google Maps na busca por coordenadas (preferido) ou texto. */
export function mapsSearchUrl(target: LatLng | string): string {
  const query =
    typeof target === 'string' ? target : `${target.lat},${target.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Abre a rota até o destino, deixando o Maps resolver a origem. */
export function mapsDirectionsUrl(target: LatLng | string): string {
  const destination =
    typeof target === 'string' ? target : `${target.lat},${target.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}&travelmode=driving`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Maps Embed API — iframes (exige chave)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * URL do iframe de localização. Devolve null sem chave, para o chamador
 * renderizar o fallback em vez de um iframe que retornaria erro.
 */
export function mapsEmbedUrl(
  target: LatLng | string,
  { zoom = 15 }: { zoom?: number } = {}
): string | null {
  if (!hasMapsKey) return null;

  const query =
    typeof target === 'string' ? target : `${target.lat},${target.lng}`;
  if (!query) return null;

  const params = new URLSearchParams({
    key: MAPS_API_KEY,
    q: query,
    zoom: String(zoom),
    language: 'pt-BR',
    region: 'BR',
  });

  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Maps Static API — imagem única, mais barata que um mapa interativo
   ───────────────────────────────────────────────────────────────────────── */

export function mapsStaticUrl(
  center: LatLng,
  {
    zoom = 15,
    width = 640,
    height = 360,
    scale = 2,
    markerColor = '0xC4472C',
  }: {
    zoom?: number;
    width?: number;
    height?: number;
    scale?: 1 | 2;
    markerColor?: string;
  } = {}
): string | null {
  if (!hasMapsKey) return null;

  const params = new URLSearchParams({
    key: MAPS_API_KEY,
    center: `${center.lat},${center.lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: String(scale),
    maptype: 'roadmap',
    language: 'pt-BR',
    region: 'BR',
    markers: `color:${markerColor}|${center.lat},${center.lng}`,
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Distâncias
   ───────────────────────────────────────────────────────────────────────── */

const EARTH_RADIUS_KM = 6371;

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function distanceKm(from: LatLng, to: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Formata distância para leitura em pt-BR: "320 m", "1,4 km", "12 km". */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}
