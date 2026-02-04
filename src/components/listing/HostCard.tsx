import { cn } from '@/lib/utils';

interface HostCardProps {
  name: string;
  logo?: string;
  isVerified?: boolean;
  description?: string;
  className?: string;
}

/**
 * Airbnb-style host/business card showing the business identity
 */
export function HostCard({ name, logo, isVerified, description, className }: HostCardProps) {
  return (
    <div className={cn('flex gap-4 py-6 border-b border-border', className)}>
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {logo ? (
          <img src={logo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-primary">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Anunciado por {name}</h3>
          {isVerified && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
              Verificado
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
}
