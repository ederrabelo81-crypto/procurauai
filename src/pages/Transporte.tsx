import { useMemo, useState } from "react";
import { ListingTypeHeader } from "@/components/common/ListingTypeHeader";
import { TransporteServiceCard } from "@/components/cards/TransporteServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransporteServices } from "@/hooks/useTransporteServices";
import type { TransporteCategoria } from "@/services/transporteServices";
import { TRANSPORTE_CATEGORIA_LABELS } from "@/services/transporteServices";

function TransporteServiceCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-1">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export default function Transporte() {
  const [query, setQuery] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<TransporteCategoria | "todos">("todos");
  const { data: services = [], isLoading, error } = useTransporteServices();

  const filteredServices = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let filtered = services;

    // Filtra por categoria se selecionado
    if (categoriaFilter !== "todos") {
      filtered = filtered.filter((s) => s.categoria === categoriaFilter);
    }

    // Filtra por busca textual
    if (trimmed) {
      filtered = filtered.filter((service) => {
        const nome = service.nome.toLowerCase();
        const categoria = TRANSPORTE_CATEGORIA_LABELS[service.categoria].toLowerCase();
        const exemplos = service.exemplos_pedido?.join(" ").toLowerCase() || "";
        return nome.includes(trimmed) || categoria.includes(trimmed) || exemplos.includes(trimmed);
      });
    }

    return filtered;
  }, [services, query, categoriaFilter]);

  const categoriasComServicos = useMemo(() => {
    const cats = new Set<TransporteCategoria>();
    services.forEach((s) => cats.add(s.categoria));
    return Array.from(cats);
  }, [services]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Transporte"
        subtitle="Táxis, Ubers, vans, fretes e entregadores — contatos mais buscados na cidade"
        iconKey="cars"
        searchPlaceholder="Buscar táxi, uber, frete..."
        searchValue={query}
        onSearchChange={setQuery}
        backTo="back"
      />

      <main className="px-4 py-4">
        {/* Filtros por categoria */}
        {categoriasComServicos.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCategoriaFilter("todos")}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                categoriaFilter === "todos"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            {categoriasComServicos.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaFilter(cat)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  categoriaFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {TRANSPORTE_CATEGORIA_LABELS[cat]}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, index) => (
              <TransporteServiceCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="py-12 text-center text-sm text-destructive">
            Erro ao carregar os contatos de transporte. Tente novamente mais tarde.
          </div>
        )}

        {!isLoading && !error && services.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhum contato de transporte encontrado.
          </div>
        )}

        {!isLoading && !error && services.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Mostrando {filteredServices.length} de {services.length} contatos
            </p>
            <div className="grid grid-cols-1 gap-4">
              {filteredServices.map((service, index) => (
                <TransporteServiceCard
                  key={`${service.categoria}-${service.nome}-${index}`}
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
