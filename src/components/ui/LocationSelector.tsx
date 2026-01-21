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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">{selected.city}, {selected.state}</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-2xl card-shadow border border-border z-50 overflow-hidden animate-scale-in">
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-2 font-medium">
                Selecione sua cidade
              </p>
              {LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelected(location);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors",
                    selected.id === location.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{location.city}</span>
                    <span className="text-muted-foreground">{location.state}</span>
                  </div>
                  {selected.id === location.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
