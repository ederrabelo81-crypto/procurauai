import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThingsToKnowProps {
  tags?: string[];
  onTagClick?: (tag: string) => void;
  className?: string;
}

/**
 * Airbnb-style "Things to know" section with tags/features
 */
export function ThingsToKnow({ tags = [], onTagClick, className }: ThingsToKnowProps) {
  if (tags.length === 0) return null;

  return (
    <div className={cn('py-8 space-y-4', className)}>
      <h2 className="text-xl font-semibold text-foreground">O que você deve saber</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Features/Tags as cards */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Info className="w-4 h-4" />
            Diferenciais
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full text-foreground transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
