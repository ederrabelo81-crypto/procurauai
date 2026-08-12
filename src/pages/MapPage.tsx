import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  ArrowLeft,
  Compass,
  Crosshair,
  MapPin,
  Navigation,
  Phone,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cache, BUSINESS_CACHE_KEYS } from '@/lib/cache';
import { getUserLocation } from '@/lib/geolocation';
import { useMapsReady } from '@/components/maps';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAPS_MAP_ID,
  distanceKm,
  formatDistance,
  mapsDirectionsUrl,
  toLatLng,
  type LatLng,
} from '@/lib/maps';
import { cn } from '@/lib/utils';

const SEARCH_RADIUS_KM = 25;

interface MapBusiness {
  id: string;
  name: string;
  address?: string;
  position: LatLng;
  category?: string;
  categorySlug?: string;
  neighborhood?: string;
  coverImage?: string;
  phone?: string;
  whatsapp?: string;
  distance?: number;
}

type LoadState = 'locating' | 'loading' | 'ready' | 'empty' | 'error';

/* ────────────────────────────────────────────────────────────────────────────
   Pino desenhado à mão — nada de marcador vermelho padrão do Google
   ──────────────────────────────────────────────────────────────────────────── */

function BrandPin({ active, label }: { active: boolean; label?: string }) {
  return (
    <div className="flex -translate-y-1 flex-col items-center">
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-2 transition-all duration-300',
          active
            ? 'h-10 w-10 scale-110 border-card bg-primary shadow-lg'
            : 'h-7 w-7 border-card bg-secondary shadow-md'
        )}
      >
        <MapPin
          className={cn('text-primary-foreground', active ? 'h-5 w-5' : 'h-3.5 w-3.5')}
          strokeWidth={2.5}
          fill="currentColor"
        />
      </div>
      <span
        className={cn(
          'h-2 w-[2px]',
          active ? 'bg-primary' : 'bg-secondary'
        )}
      />
      {active && label && (
        <span className="mt-1 max-w-[9rem] truncate rounded border border-border bg-card px-2 py-0.5 text-2xs font-semibold text-foreground shadow-md">
          {label}
        </span>
      )}
    </div>
  );
}

function UserPin() {
  return (
    <span className="relative flex h-4 w-4">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-card bg-accent" />
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Controlador imperativo do mapa (pan/zoom ao selecionar um comércio)
   ──────────────────────────────────────────────────────────────────────────── */

function MapController({ target }: { target: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    if ((map.getZoom() ?? 0) < 16) map.setZoom(16);
  }, [map, target]);

  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
   Página
   ──────────────────────────────────────────────────────────────────────────── */

export default function MapPage() {
  const mapsReady = useMapsReady();

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>('locating');
  const cardsRef = useRef<HTMLDivElement>(null);

  const loadBusinesses = useCallback(async (origin: LatLng) => {
    setState('loading');

    const cacheKey = BUSINESS_CACHE_KEYS.byLocation(
      origin.lat,
      origin.lng,
      SEARCH_RADIUS_KM
    );

    const cached = cache.get<MapBusiness[]>(cacheKey);
    if (cached) {
      setBusinesses(cached);
      setState(cached.length ? 'ready' : 'empty');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(
          'id, name, address, latitude, longitude, category, category_slug, neighborhood, cover_images, phone, whatsapp'
        )
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      const nearby = (data ?? [])
        .reduce<MapBusiness[]>((acc, row) => {
          const position = toLatLng(row.latitude, row.longitude);
          if (!position) return acc;

          const distance = distanceKm(origin, position);
          if (distance > SEARCH_RADIUS_KM) return acc;

          acc.push({
            id: row.id,
            name: row.name,
            address: row.address ?? undefined,
            position,
            category: row.category ?? undefined,
            categorySlug: row.category_slug ?? undefined,
            neighborhood: row.neighborhood ?? undefined,
            coverImage: row.cover_images?.[0],
            phone: row.phone ?? undefined,
            whatsapp: row.whatsapp ?? undefined,
            distance,
          });
          return acc;
        }, [])
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

      cache.set(cacheKey, nearby, 10 * 60 * 1000);
      setBusinesses(nearby);
      setState(nearby.length ? 'ready' : 'empty');
    } catch (err) {
      console.error('Falha ao carregar comércios do mapa:', err);
      setBusinesses([]);
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const location = await getUserLocation();
      if (cancelled) return;

      const origin = location ?? DEFAULT_CENTER;
      setUserLocation(location);
      setCenter(origin);
      await loadBusinesses(origin);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadBusinesses]);

  const selected = useMemo(
    () => businesses.find((b) => b.id === selectedId) ?? null,
    [businesses, selectedId]
  );

  const handleSelect = (business: MapBusiness) => {
    setSelectedId(business.id);
    setCenter(business.position);
    cardsRef.current
      ?.querySelector(`[data-business-id="${business.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const recenter = () => {
    const origin = userLocation ?? DEFAULT_CENTER;
    setSelectedId(null);
    setCenter({ ...origin });
  };

  const statusLabel: Record<LoadState, string> = {
    locating: 'Localizando você…',
    loading: 'Carregando comércios…',
    ready: `${businesses.length} ${businesses.length === 1 ? 'lugar' : 'lugares'} num raio de ${SEARCH_RADIUS_KM} km`,
    empty: 'Nenhum comércio com coordenadas por perto',
    error: 'Não foi possível carregar o mapa agora',
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* ── Mapa ─────────────────────────────────────────────────────────── */}
      {mapsReady ? (
        <Map
          mapId={MAPS_MAP_ID}
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          reuseMaps
          className="h-full w-full"
          onClick={() => setSelectedId(null)}
        >
          <MapController target={center} />

          {userLocation && (
            <AdvancedMarker position={userLocation} title="Você está aqui" zIndex={1}>
              <UserPin />
            </AdvancedMarker>
          )}

          {businesses.map((business) => (
            <AdvancedMarker
              key={business.id}
              position={business.position}
              title={business.name}
              zIndex={business.id === selectedId ? 10 : 2}
              onClick={() => handleSelect(business)}
            >
              <BrandPin active={business.id === selectedId} label={business.name} />
            </AdvancedMarker>
          ))}
        </Map>
      ) : (
        <MissingKeyNotice />
      )}

      {/* ── Cabeçalho flutuante ──────────────────────────────────────────── */}
      <header className="pointer-events-none absolute inset-x-0 top-0 safe-top">
        <div className="pointer-events-auto flex items-center gap-2 p-3">
          <Link
            to="/"
            aria-label="Voltar para a home"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground backdrop-blur-md card-shadow transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/95 px-3 py-2 backdrop-blur-md card-shadow">
            <p className="eyebrow flex items-center gap-1.5 text-primary">
              <Compass className="h-3 w-3" />
              Mapa da cidade
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {statusLabel[state]}
            </p>
          </div>

          <button
            type="button"
            onClick={recenter}
            aria-label="Centralizar na minha localização"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground backdrop-blur-md card-shadow transition-colors hover:text-primary"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Carrossel inferior ───────────────────────────────────────────── */}
      {businesses.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 pb-20 safe-bottom">
          <div
            ref={cardsRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
          >
            {businesses.slice(0, 30).map((business) => (
              <button
                key={business.id}
                type="button"
                data-business-id={business.id}
                onClick={() => handleSelect(business)}
                className={cn(
                  'w-[16rem] flex-shrink-0 snap-center overflow-hidden rounded-lg border bg-card/95 p-3 text-left backdrop-blur-md transition-all card-shadow',
                  business.id === selectedId
                    ? 'border-primary ring-1 ring-primary/40'
                    : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 font-display text-sm font-bold text-foreground">
                    {business.name}
                  </h3>
                  {typeof business.distance === 'number' && (
                    <span className="flex-shrink-0 font-mono text-2xs font-semibold text-primary">
                      {formatDistance(business.distance)}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {business.category ?? business.neighborhood ?? 'Comércio local'}
                </p>

                <div className="mt-2.5 flex gap-2">
                  <a
                    href={mapsDirectionsUrl(business.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-2 py-1.5 text-2xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Rota
                  </a>

                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Ligar para ${business.name}`}
                      className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <Link
                    to={`/comercio/${business.categorySlug ?? 'negocios'}/${business.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-2xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Ver
                  </Link>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Detalhe do selecionado (desktop) ─────────────────────────────── */}
      {selected && (
        <aside className="absolute right-3 top-24 hidden w-72 overflow-hidden rounded-lg border border-border bg-card/95 backdrop-blur-md card-shadow animate-scale-in md:block">
          {selected.coverImage && (
            <img
              src={selected.coverImage}
              alt={selected.name}
              className="h-32 w-full object-cover"
              loading="lazy"
            />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-bold leading-tight text-foreground">
                {selected.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Fechar detalhe"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {selected.address && (
              <p className="mt-2 text-sm text-muted-foreground">{selected.address}</p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function MissingKeyNotice() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-grid bg-grid-cell px-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
        <MapPin className="h-6 w-6 text-primary" />
      </span>
      <div className="max-w-sm space-y-2">
        <h1 className="font-display text-xl font-bold text-foreground">
          Mapa não configurado
        </h1>
        <p className="text-sm text-muted-foreground">
          Defina <code className="font-mono text-xs text-primary">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
          no arquivo <code className="font-mono text-xs">.env.local</code> para
          habilitar o mapa. O passo a passo está em{' '}
          <code className="font-mono text-xs">docs/google-maps.md</code>.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground button-shadow"
      >
        Voltar para a home
      </Link>
    </div>
  );
}
