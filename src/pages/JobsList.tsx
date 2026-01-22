import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Building2, X, ChevronDown } from 'lucide-react';
import { ListingTypeHeader } from '@/components/common/ListingTypeHeader';
import { TagChip } from '@/components/ui/TagChip';
import { jobs } from '@/data/newListingTypes';
import { filtersByCategory } from '@/data/mockData';
import { 
  createFilterOptions, 
  formatTag, 
  matchesAnyFilter, 
  sortItems,
  SORT_OPTIONS 
} from '@/lib/tags';

export default function JobsList() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  const filterOptions = useMemo(
    () => createFilterOptions(filtersByCategory['empregos'] || []),
    []
  );
  const sortOptions = SORT_OPTIONS['empregos'] || [];

  const filtered = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesQuery = !query || 
        job.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
        job.companyName.toLowerCase().includes(query.toLowerCase());
      
      const matchesFiltersResult = matchesAnyFilter(job, activeFilters, 'empregos');
      
      return matchesQuery && matchesFiltersResult;
    });
    
    if (sortKey) {
      result = sortItems(result, sortKey, 'empregos');
    }
    
    return result;
  }, [query, activeFilters, sortKey]);

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev => 
      prev.includes(filterKey) ? prev.filter(f => f !== filterKey) : [...prev, filterKey]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSortKey('');
  };

  const currentSort = sortOptions.find(s => s.key === sortKey);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ListingTypeHeader
        title="Empregos"
        subtitle="Vagas na cidade e região"
        iconKey="empregos"
        searchPlaceholder="Buscar vagas..."
        searchValue={query}
        onSearchChange={setQuery}
      >
        {filterOptions.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {activeFilters.length > 0 && (
              <TagChip
                onClick={clearFilters}
                icon={X}
                size="sm"
                variant="filter"
                className="border-destructive/40 text-destructive"
              >
                Limpar
              </TagChip>
            )}
            {filterOptions.map((filter) => (
              <TagChip
                key={filter.key}
                isActive={activeFilters.includes(filter.key)}
                onClick={() => toggleFilter(filter.key)}
                size="sm"
                variant="filter"
              >
                {filter.label}
              </TagChip>
            ))}
          </div>
        )}
      </ListingTypeHeader>

      <main className="px-4 py-4">
        {/* Sort & Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {jobs.length} vagas
          </p>
          
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {currentSort?.label || 'Ordenar'} <ChevronDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[150px]">
                {sortOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-muted ${sortKey === opt.key ? 'text-primary' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        <div className="space-y-4">
          {filtered.map((job) => (
            <Link
              key={job.id}
              to={`/empregos/${job.id}`}
              className="block bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="flex gap-3">
                {job.logo ? (
                  <img src={job.logo} alt={job.companyName} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-0.5">{job.jobTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{job.companyName}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {job.employmentType}
                </span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium">
                  {formatTag(job.workModel)}
                </span>
                {job.salaryRange && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {job.salaryRange}
                  </span>
                )}
              </div>
              
              {/* Tags - formatted */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-muted/50 rounded-full text-xs text-muted-foreground">
                      {formatTag(tag)}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.city}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(job.postedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma vaga encontrada</p>
            {activeFilters.length > 0 && (
              <button onClick={clearFilters} className="text-primary text-sm mt-2 hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
