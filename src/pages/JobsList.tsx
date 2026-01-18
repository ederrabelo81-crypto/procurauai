import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Clock, Building2 } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { jobs } from '@/data/newListingTypes';
import { filtersByCategory } from '@/data/mockData';

export default function JobsList() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const filters = filtersByCategory['empregos'] || [];

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery = !query || 
        job.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
        job.companyName.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = activeFilters.length === 0 ||
        activeFilters.some(f => job.tags.some(t => t.toLowerCase().includes(f.toLowerCase())));
      
      return matchesQuery && matchesFilters;
    });
  }, [query, activeFilters]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
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
              <h1 className="text-lg font-bold">Empregos</h1>
              <p className="text-xs text-muted-foreground">Vagas na cidade e região</p>
            </div>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar vagas..." />
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
          {filtered.length} {filtered.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
        </p>

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
                <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium capitalize">
                  {job.workModel}
                </span>
                {job.salaryRange && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {job.salaryRange}
                  </span>
                )}
              </div>

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
          </div>
        )}
      </main>
    </div>
  );
}
