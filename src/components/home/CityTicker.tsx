import { cn } from '@/lib/utils';

interface CityTickerProps {
  items?: string[];
  className?: string;
}

const DEFAULT_ITEMS = [
  'Comércio local aberto agora',
  'Ofertas da semana',
  'Agenda da cidade',
  'Vagas de emprego',
  'Imóveis e aluguéis',
  'Classificados e doações',
  'Notícias de Monte Santo',
];

/**
 * Letreiro rolante entre o cabeçalho e o conteúdo.
 *
 * A lista é duplicada e a faixa desliza -50%: a emenda cai exatamente no ponto
 * em que a segunda cópia assume, então o loop não tem salto visível.
 */
export function CityTicker({ items = DEFAULT_ITEMS, className }: CityTickerProps) {
  const loop = [...items, ...items];

  return (
    <div
      className={cn(
        'relative overflow-hidden border-y border-border bg-secondary text-secondary-foreground',
        className
      )}
      aria-hidden
    >
      <div className="flex w-max animate-marquee items-center gap-6 py-2 pr-6">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="eyebrow flex flex-shrink-0 items-center gap-6 whitespace-nowrap"
          >
            {item}
            <span className="h-1 w-1 rounded-full bg-current opacity-50" />
          </span>
        ))}
      </div>
    </div>
  );
}
