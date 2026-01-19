import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Clock, Navigation } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { places } from "@/data/newListingTypes";
import { formatTag } from "@/lib/tags";

export default function PlaceDetail() {
  const { slug } = useParams();

  const place = places.find((p) => p.slug === slug);

  if (!place) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/lugares" className="text-primary underline">Voltar para Lugares</Link>
        <p className="mt-4 text-muted-foreground">Lugar não encontrado.</p>
      </div>
    );
  }

  const mapsUrl = place.lat && place.lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.city)}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/lugares" className="p-2 -ml-2 rounded-full hover:bg-muted touch-target">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{place.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{place.typeTag} • {place.priceLevel}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-2xl overflow-hidden card-shadow">
          <div className="relative aspect-video">
            <img src={place.coverImage} alt={place.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {place.rating} ({place.reviewsCount} avaliações)
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {place.neighborhood}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">{place.shortDescription}</p>

            {/* Tags - formatted */}
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {place.tags.slice(0, 10).map((t) => (
                  <Chip key={t}>{formatTag(t)}</Chip>
                ))}
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              {place.openingHours && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">Horário</div>
                  <div className="font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {place.openingHours}
                  </div>
                </div>
              )}
              {place.durationSuggestion && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">Duração sugerida</div>
                  <div className="font-medium">{place.durationSuggestion}</div>
                </div>
              )}
              {place.bestTimeToGo && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">Melhor horário</div>
                  <div className="font-medium">{place.bestTimeToGo}</div>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground text-xs mb-1">Preço</div>
                <div className="font-medium">{place.priceLevel}</div>
              </div>
            </div>

            {/* Highlights */}
            {place.highlights && place.highlights.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Destaques</h3>
                <div className="flex flex-wrap gap-2">
                  {place.highlights.map((h) => (
                    <span key={h} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              <Navigation className="w-4 h-4" /> Como chegar
            </a>
          </div>
        </div>

        {/* Gallery */}
        {place.gallery && place.gallery.length > 0 && (
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <h2 className="font-semibold mb-3">Fotos</h2>
            <div className="grid grid-cols-2 gap-2">
              {place.gallery.slice(0, 6).map((url, idx) => (
                <img key={idx} src={url} alt="" className="rounded-xl object-cover aspect-square" />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
