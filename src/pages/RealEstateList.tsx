import { useMemo, useState } from "react";
import { ListingTypeHeader } from "@/components/common/ListingTypeHeader";
import { BusinessCard } from "@/components/cards/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealEstate } from "@/hooks/useCategories";

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

export default function RealEstateList() {
  const [query, setQuery] = useState("");
  const { data: listings = [], isLoading, error } = useRealEstate();

  const filteredListings = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return listings;
    return listings.filter((listing) => {
      const name = listing.name.toLowerCase();
      const category = listing.category.toLowerCase();
      const neighborhood = listing.neighborhood.toLowerCase();
      return (
        name.includes(trimmed) ||
        category.includes(trimmed) ||
        neighborhood.includes(trimmed)
      );
    });
  }, [listings, query]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Imóveis"
        subtitle="Residenciais e comerciais"
        iconKey="realestate"
        searchPlaceholder="Buscar imóveis..."
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      />

      <main className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Mostrando {filteredListings.length} de {listings.length} imóveis
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
            Erro ao carregar imóveis. Tente novamente mais tarde.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {filteredListings.map((listing) => (
              <BusinessCard key={listing.id} business={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
