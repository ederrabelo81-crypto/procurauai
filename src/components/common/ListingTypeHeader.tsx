import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { getCategoryLucideIcon } from '@/lib/categoryIcons';
import { cn } from '@/lib/utils';

interface ListingTypeHeaderProps {
  title: string;
  subtitle?: string;
  iconKey?: string;
  searchPlaceholder: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  backTo?: string;
  children?: React.ReactNode; // Para chips de filtro
}

/**
 * COMPONENTE UNIFICADO: Header para páginas de Listing Type
 * 
 * ESTRUTURA OBRIGATÓRIA:
 * - Linha 1: Botão voltar + Ícone (se houver) + Título
 * - Linha 2: Subtítulo (opcional)
 * - Linha 3: Search input
 * - Linha 4: Chips de filtro (via children)
 * 
 * ESTILOS FIXOS:
 * - Ícone: h-8 w-8 rounded-xl bg-primary/10
 * - Título: text-lg font-semibold
 * - Subtítulo: text-sm text-muted-foreground
 * 
 * Usado em: JobsList, PlacesList, CarsList, RealEstateList, Category
 */
export function ListingTypeHeader({
  title,
  subtitle,
  iconKey,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  backTo = '/',
  children,
}: ListingTypeHeaderProps) {
  const navigate = useNavigate();
  
  // Obtém ícone com fallback seguro
  const Icon = iconKey ? getCategoryLucideIcon(iconKey) : null;

  const handleBack = () => {
    if (backTo === 'back') {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
      <div className="px-4 py-3">
        {/* Linha 1: Voltar + Ícone + Título */}
        <div className="flex items-center gap-3 mb-3">
          {backTo === 'back' ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors touch-target"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link 
              to={backTo} 
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors touch-target"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          
          <div className="flex items-center gap-2.5">
            {/* Ícone - container fixo h-8 w-8 */}
            {Icon && (
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
            )}
            
            {/* Título e Subtítulo */}
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Linha 3: Search */}
        <SearchBar 
          value={searchValue} 
          onChange={onSearchChange} 
          placeholder={searchPlaceholder} 
        />

        {/* Linha 4: Chips de filtro (via children) */}
        {children}
      </div>
    </header>
  );
}
