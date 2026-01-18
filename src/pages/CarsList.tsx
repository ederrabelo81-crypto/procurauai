import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Fuel, Gauge } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { cars } from '@/data/newListingTypes';
import { filtersByCategory } from '@/data/mockData';

export default function CarsList() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filters = filtersByCategory['carros'] || [];

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      const matchesQuery = !query || 
        car.title.toLowerCase().includes(query.toLowerCase()) ||
        car.brand.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = activeFilters.length === 0 ||
        activeFilters.some(f => car.tags.some(t => t.toLowerCase().includes(f.toLowerCase())));
      
      return matchesQuery && matchesFilters;
    });
  }, [query, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted touch-target">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Carros</h1>
              <p className="text-xs text-muted-foreground">Concessionárias e particulares</p>
            </div>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar carros..." />
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                active={activeFilters.includes(filter)}
                onClick={() => toggleFilter(filter)}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? 'carro encontrado' : 'carros encontrados'}
        </p>

        <div className="space-y-4">
          {filtered.map((car) => (
            <Link
              key={car.id}
              to={`/carros/${car.id}`}
              className="block bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="relative aspect-video">
                <img
                  src={car.coverImage}
                  alt={car.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-1 bg-background/90 rounded-full text-xs font-medium">
                    {car.year}
                  </span>
                  <span className="px-2 py-1 bg-background/90 rounded-full text-xs font-medium capitalize">
                    {car.condition}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium capitalize">
                    {car.sellerType}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{car.title}</h3>
                <p className="text-lg font-bold text-primary mb-2">{formatPrice(car.price)}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" />
                    {(car.mileageKm / 1000).toFixed(0)}mil km
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Fuel className="w-3.5 h-3.5" />
                    {car.fuel}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {car.neighborhood}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum carro encontrado</p>
          </div>
        )}
      </main>
    </div>
  );
}
