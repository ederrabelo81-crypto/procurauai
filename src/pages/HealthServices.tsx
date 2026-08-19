import { useMemo, useState } from "react";
import { ListingTypeHeader } from "@/components/common/ListingTypeHeader";
import { HealthServiceCard } from "@/components/cards/HealthServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthServices } from "@/hooks/useHealthServices";
import { CATEGORIA_SERVICO_LABELS } from "@/services/healthServices";

function HealthServiceCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-1">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export default function HealthServices() {
  const [query, setQuery] = useState("");
  const { data: services = [], isLoading, error } = useHealthServices();

  const filteredServices = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return services;
    return services.filter((service) => {
      const nome = service.nome.toLowerCase();
      const categoria =
        CATEGORIA_SERVICO_LABELS[service.categoria_servico].toLowerCase();
      return nome.includes(trimmed) || categoria.includes(trimmed);
    });
  }, [services, query]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Saúde & Serviços"
        subtitle="Postos, farmácias e serviço público — sem cadastro, direto ao ponto"
        iconKey="services"
        searchPlaceholder="Buscar posto, farmácia, CRAS..."
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      />

      <main className="px-4 py-4">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, index) => (
              <HealthServiceCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="py-12 text-center text-sm text-destructive">
            Erro ao carregar os contatos. Tente novamente mais tarde.
          </div>
        )}

        {!isLoading && !error && services.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhum contato encontrado.
          </div>
        )}

        {!isLoading && !error && services.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Mostrando {filteredServices.length} de {services.length} contatos
            </p>
            <div className="grid grid-cols-1 gap-4">
              {filteredServices.map((service) => (
                <HealthServiceCard
                  key={`${service.categoria_servico}-${service.nome}`}
                  service={service}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
