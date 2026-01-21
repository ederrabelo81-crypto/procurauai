import { ReactNode } from 'react';
import { MapPin, Clock, Phone, Globe, Mail, Calendar, DollarSign, Briefcase, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOpenNow } from '@/lib/tagUtils';

interface EssentialItem {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  action?: () => void;
  highlight?: boolean;
}

interface DetailEssentialsProps {
  items: EssentialItem[];
  className?: string;
}

/**
 * Bloco de informações essenciais (horário, endereço, contato, links)
 * Padrão MyListing: layout limpo e acionável
 */
export function DetailEssentials({ items, className }: DetailEssentialsProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className={cn('space-y-2', className)}>
      {items.map((item, index) => {
        const Component = item.action ? 'button' : 'div';
        
        return (
          <Component
            key={index}
            onClick={item.action}
            className={cn(
              'flex items-start gap-3 w-full text-left p-3 rounded-xl transition-colors',
              item.action 
                ? 'bg-muted/50 hover:bg-muted cursor-pointer' 
                : 'bg-muted/30',
              item.highlight && 'ring-1 ring-primary/20'
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn(
                'font-medium truncate',
                item.action ? 'text-primary' : 'text-foreground'
              )}>
                {item.value}
              </p>
              {item.subValue && (
                <p className="text-sm text-muted-foreground">{item.subValue}</p>
              )}
            </div>
          </Component>
        );
      })}
    </section>
  );
}

// Helper para criar items de essenciais a partir de dados comuns
interface BuildEssentialsOptions {
  address?: string;
  neighborhood?: string;
  hours?: string;
  phone?: string;
  email?: string;
  website?: string;
  businessName?: string;
  price?: string;
  date?: string;
  workType?: string;
  propertyType?: string;
}

export function buildEssentialItems(options: BuildEssentialsOptions): EssentialItem[] {
  const items: EssentialItem[] = [];
  
  // Preço (se existir)
  if (options.price) {
    items.push({
      icon: <DollarSign className="w-5 h-5 text-primary" />,
      label: 'Preço',
      value: options.price,
      highlight: true,
    });
  }

  // Tipo de trabalho
  if (options.workType) {
    items.push({
      icon: <Briefcase className="w-5 h-5 text-muted-foreground" />,
      label: 'Modelo',
      value: options.workType,
    });
  }

  // Tipo de imóvel
  if (options.propertyType) {
    items.push({
      icon: <Home className="w-5 h-5 text-muted-foreground" />,
      label: 'Tipo',
      value: options.propertyType,
    });
  }

  // Data (para eventos)
  if (options.date) {
    items.push({
      icon: <Calendar className="w-5 h-5 text-muted-foreground" />,
      label: 'Data',
      value: options.date,
    });
  }

  // Horário
  if (options.hours) {
    const openStatus = isOpenNow(options.hours);
    items.push({
      icon: <Clock className="w-5 h-5 text-muted-foreground" />,
      label: 'Horário',
      value: options.hours,
      subValue: openStatus === true ? 'Aberto agora' : openStatus === false ? 'Fechado agora' : undefined,
    });
  }

  // Endereço
  if (options.address || options.neighborhood) {
    items.push({
      icon: <MapPin className="w-5 h-5 text-primary" />,
      label: 'Localização',
      value: options.address || options.neighborhood || '',
      action: () => {
        const query = encodeURIComponent(`${options.businessName || ''} ${options.address || options.neighborhood || ''}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      },
    });
  }

  // Telefone
  if (options.phone) {
    items.push({
      icon: <Phone className="w-5 h-5 text-muted-foreground" />,
      label: 'Telefone',
      value: options.phone,
      action: () => window.open(`tel:${options.phone}`, '_self'),
    });
  }

  // Email
  if (options.email) {
    items.push({
      icon: <Mail className="w-5 h-5 text-muted-foreground" />,
      label: 'Email',
      value: options.email,
      action: () => window.open(`mailto:${options.email}`, '_blank'),
    });
  }

  // Website
  if (options.website) {
    items.push({
      icon: <Globe className="w-5 h-5 text-muted-foreground" />,
      label: 'Site',
      value: options.website,
      action: () => {
        const url = options.website!.startsWith('http') ? options.website! : `https://${options.website}`;
        window.open(url, '_blank');
      },
    });
  }

  return items;
}
