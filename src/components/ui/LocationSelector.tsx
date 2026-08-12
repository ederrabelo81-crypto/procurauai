import { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
  className?: string;
}

const LOCATIONS = [
  { id: 'monte-santo', city: 'Monte Santo de Minas', state: 'MG' },
  { id: 'guaxupe', city: 'Guaxupé', state: 'MG' },
  { id: 'muzambinho', city: 'Muzambinho', state: 'MG' },
  { id: 'sao-sebastiao', city: 'São Sebastião do Paraíso', state: 'MG' },
];

export function LocationSelector({ className }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(LOCATIONS[0]);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 transition-colors hover:border-primary/50"
      >
        <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
        <span className="text-sm font-semibold text-foreground">
          {selected.city}
        </span>
        <span className="font-mono text-2xs font-bold uppercase text-muted-foreground">
          {selected.state}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-popover card-shadow animate-scale-in">
            <p className="eyebrow border-b border-dashed border-border px-3 py-2.5 text-muted-foreground">
              Selecione sua cidade
            </p>

            <div className="p-1.5">
              {LOCATIONS.map((location) => {
                const isSelected = selected.id === location.id;
                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelected(location);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{location.city}</span>
                      <span className="font-mono text-2xs uppercase text-muted-foreground">
                        {location.state}
                      </span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
