import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailDescriptionProps {
  description: string;
  title?: string;
  maxLength?: number;
  className?: string;
}

/**
 * Bloco de descrição com opção de expandir/colapsar
 * Padrão MyListing: texto curto inicialmente, expandir sob demanda
 */
export function DetailDescription({
  description,
  title = 'Descrição',
  maxLength = 180,
  className,
}: DetailDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = description.length > maxLength;
  
  const displayText = needsExpansion && !expanded 
    ? description.slice(0, maxLength).trim() + '...'
    : description;

  if (!description) return null;

  return (
    <section className={cn('space-y-2', className)}>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{displayText}</p>
      
      {needsExpansion && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? (
            <>
              Mostrar menos
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Ler mais
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </section>
  );
}
