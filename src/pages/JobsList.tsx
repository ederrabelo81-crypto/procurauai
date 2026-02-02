import { useMemo, useState } from "react";
import { ListingTypeHeader } from "@/components/common/ListingTypeHeader";
import { BusinessCard } from "@/components/cards/BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobs } from "@/hooks/useCategories";

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

export default function JobsList() {
  const [query, setQuery] = useState("");
  const { data: jobs = [], isLoading, error } = useJobs();

  const filteredJobs = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return jobs;
    return jobs.filter((job) => {
      const name = job.name.toLowerCase();
      const category = job.category.toLowerCase();
      const neighborhood = job.neighborhood.toLowerCase();
      return (
        name.includes(trimmed) ||
        category.includes(trimmed) ||
        neighborhood.includes(trimmed)
      );
    });
  }, [jobs, query]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Empregos"
        subtitle="Oportunidades profissionais"
        iconKey="jobs"
        searchPlaceholder="Buscar empregos..."
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      />

      <main className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Mostrando {filteredJobs.length} de {jobs.length} empregos
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
            Erro ao carregar empregos. Tente novamente mais tarde.
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <BusinessCard key={job.id} business={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
