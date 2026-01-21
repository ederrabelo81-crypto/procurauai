import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ListingType = 'business' | 'listing' | 'deal' | 'event' | 'news' | 'obituary' | 'place' | 'car' | 'job' | 'realestate';

interface RelatedItem {
  id: string;
  type: ListingType;
  title: string;
  subtitle?: string;
  image: string;
  slug?: string; // Para places que usam slug
}

interface RelatedCarouselProps {
  title?: string;
  items: RelatedItem[];
  className?: string;
}

/**
 * Carrossel horizontal de itens relacionados
 * Padrão MyListing: mesmo Listing Type e Categoria
 */
export function RelatedCarousel({ title = 'Relacionados', items, className }: RelatedCarouselProps) {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const getPath = (item: RelatedItem) => {
    switch (item.type) {
      case 'business':
        return `/comercio/${item.id}`;
      case 'listing':
        return `/anuncio/${item.id}`;
      case 'deal':
        return `/oferta/${item.id}`;
      case 'event':
        return `/evento/${item.id}`;
      case 'news':
        return `/noticia/${item.id}`;
      case 'obituary':
        return `/falecimento/${item.id}`;
      case 'place':
        return `/lugares/${item.slug || item.id}`;
      case 'car':
        return `/carros/${item.id}`;
      case 'job':
        return `/empregos/${item.id}`;
      case 'realestate':
        return `/imoveis/${item.id}`;
      default:
        return '#';
    }
  };

  return (
    <section className={cn('', className)}>
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(getPath(item))}
            className="flex-shrink-0 w-36 text-left group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </p>
            {item.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</p>}
          </button>
        ))}
      </div>
    </section>
  );
}
