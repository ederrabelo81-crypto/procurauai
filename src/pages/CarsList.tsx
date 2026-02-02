import { useMemo, useState } from "react";
import { ListingTypeHeader } from "@/components/common/ListingTypeHeader";
import { BusinessCard } from "@/components/cards/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCars } from "@/hooks/useCategories";

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

export default function CarsList() {
  const [query, setQuery] = useState("");
  const { data: cars = [], isLoading, error } = useCars();

  const filteredCars = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return cars;
    return cars.filter((car) => {
      const name = car.name.toLowerCase();
      const category = car.category.toLowerCase();
      const neighborhood = car.neighborhood.toLowerCase();
      return (
        name.includes(trimmed) ||
        category.includes(trimmed) ||
        neighborhood.includes(trimmed)
      );
    });
  }, [cars, query]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Carros"
        subtitle="Veículos novos e usados"
        iconKey="cars"
        searchPlaceholder="Buscar carros..."
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      />

      <main className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Mostrando {filteredCars.length} de {cars.length} carros
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
            Erro ao carregar carros. Tente novamente mais tarde.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {filteredCars.map((car) => (
              <BusinessCard key={car.id} business={car} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
