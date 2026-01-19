import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Clock } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { places } from "@/data/newListingTypes";

export default function PlaceDetail() {
  const { slug } = useParams();

  const place = places.find((p: any) => p.slug === slug);

  if (!place) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/lugares" className="text-primary underline">Voltar para Lugares</Link>
        <p className="mt-4 text-muted-foreground">Lugar não encontrado.</p>
      </div>
    );
  }

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
            <p className="text-sm text-muted-foreground">{place.shortDescription}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {(place.tags || []).slice(0, 10).map((t: string) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                {place.rating} ({place.reviewsCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {place.neighborhood}
              </span>
              {place.durationSuggestion && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {place.durationSuggestion}
                </span>
              )}
            </div>
          </div>
        </div>

        {place.gallery?.length ? (
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <h2 className="font-semibold mb-3">Fotos</h2>
            <div className="grid grid-cols-2 gap-2">
              {place.gallery.slice(0, 6).map((url: string) => (
                <img key={url} src={url} alt="" className="rounded-xl object-cover aspect-square" />
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
