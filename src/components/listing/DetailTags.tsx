import { useNavigate } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/utils';
import { formatTag } from '@/lib/tags';

interface DetailTagsProps {
  tags: string[];
  title?: string;
  maxVisible?: number;
  className?: string;
  onTagClick?: (tag: string) => void;
}

/**
 * Bloco de tags clicáveis com limite de visibilidade
 * Padrão MyListing: máximo 6 tags visíveis
 */
export function DetailTags({
  tags,
  title = 'Diferenciais',
  maxVisible = 6,
  className,
  onTagClick,
}: DetailTagsProps) {
  const navigate = useNavigate();
  
  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  const handleClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      navigate(`/buscar?filters=${encodeURIComponent(tag)}`);
    }
  };

  if (!tags || tags.length === 0) return null;

  return (
    <section className={cn('space-y-2', className)}>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => (
          <Chip 
            key={tag} 
            onClick={() => handleClick(tag)} 
            size="sm" 
            className="cursor-pointer"
          >
            {formatTag(tag)}
          </Chip>
        ))}
        {remainingCount > 0 && (
          <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm">
            +{remainingCount}
          </span>
        )}
      </div>
    </section>
  );
}
