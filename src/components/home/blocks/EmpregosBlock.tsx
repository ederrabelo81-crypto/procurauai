import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { jobs } from '@/data/newListingTypes';
import { MapPin, Briefcase, Building2, AlertTriangle } from 'lucide-react';

export function EmpregosBlock() {
  // Ordena por data de postagem (mais recentes primeiro)
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 4);

  // Se não há empregos, não renderiza o bloco
  if (recentJobs.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="💼 Empregos Recentes"
        action={{ label: 'Ver todos', to: '/empregos' }}
      />

      <div className="space-y-3">
        {recentJobs.map((job) => {
          const isUrgent = job.tags.some(
            (tag) => tag.toLowerCase().includes('urgente')
          );

          return (
            <Link
              key={job.id}
              to={`/empregos/${job.id}`}
              className="flex bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all p-4"
            >
              {job.logo && (
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 mr-3 bg-muted">
                  <img
                    src={job.logo}
                    alt={job.companyName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h3 className="font-semibold text-foreground text-sm mb-0.5 line-clamp-1 flex-1">
                    {job.jobTitle}
                  </h3>
                  {isUrgent && (
                    <span className="flex items-center gap-0.5 bg-destructive text-destructive-foreground text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      Urgente
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {job.companyName}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {job.employmentType}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.city}
                  </span>
                  {job.salaryRange && (
                    <span className="text-primary font-medium">{job.salaryRange}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
