import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { NewsCard } from '@/components/cards/NewsCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { news, listings } from '@/data/mockData';
import { jobs } from '@/data/mockData';
import { MapPin, Briefcase, Building2 } from 'lucide-react';

function SectionBadge({ text }: { text: string }) {
  return (
    <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full mb-3">
      {text}
    </span>
  );
}

export function TrendingSection() {
  // Ordem fixa: 4 Notícias → 4 Classificados → 4 Empregos
  const latestNews = [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const latestListings = listings.slice(0, 4);

  const latestJobs = [...jobs]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 4);

  return (
    <section>
      <SectionHeader title="Em alta" action={{ label: 'Ver tudo', to: '/buscar' }} />

      <div className="space-y-6">
        {/* Notícias - 4 itens */}
        <div>
          <SectionBadge text="📰 Notícias" />
          <div className="space-y-3">
            {latestNews.map((item) => (
              <NewsCard key={item.id} news={item} variant="compact" />
            ))}
          </div>
        </div>

        {/* Classificados - 4 itens */}
        <div>
          <SectionBadge text="🏷️ Classificados" />
          <div className="grid grid-cols-2 gap-3">
            {latestListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        {/* Empregos - 4 itens */}
        <div>
          <SectionBadge text="💼 Empregos" />
          <div className="space-y-3">
            {latestJobs.map((job) => (
              <Link
                key={job.id}
                to={`/empregos/${job.id}`}
                className="flex almanac-card overflow-hidden p-4"
              >
                {job.logo && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-3 bg-muted">
                    <img
                      src={job.logo}
                      alt={job.companyName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm mb-0.5 line-clamp-1">{job.jobTitle}</h3>
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
