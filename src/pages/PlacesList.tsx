import { useMemo, useState } from "react";
import { ListingTypeHeader } from "@/components/common/ListingTypeHeader";
import { BusinessCard } from "@/components/cards/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaces } from "@/hooks/useCategories";

function BusinessCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-1">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function PlacesList() {
  const [query, setQuery] = useState("");
  const { data: places = [], isLoading, error } = usePlaces();

  const filteredPlaces = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return places;
    return places.filter((place) => {
      const name = place.name.toLowerCase();
      const category = place.category.toLowerCase();
      const neighborhood = place.neighborhood.toLowerCase();
      return (
        name.includes(trimmed) ||
        category.includes(trimmed) ||
        neighborhood.includes(trimmed)
      );
    });
  }, [places, query]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Lugares"
        subtitle="Destinos turísticos da cidade"
        iconKey="places"
        searchPlaceholder="Buscar lugares..."
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      />

      <main className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Mostrando {filteredPlaces.length} de {places.length} lugares
        </p>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, index) => (
              <BusinessCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-12 text-sm text-destructive">
            Erro ao carregar lugares. Tente novamente mais tarde.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {filteredPlaces.map((place) => (
              <BusinessCard key={place.id} business={place} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
