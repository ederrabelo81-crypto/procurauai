import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailCTAProps {
  listingTypeName?: string;
  className?: string;
}

/**
 * CTA para incentivar novos anunciantes
 * Padrão MyListing: "Anunciar um negócio como este"
 */
export function DetailCTA({
  listingTypeName = 'negócio',
  className,
}: DetailCTAProps) {
  return (
    <section className={cn('py-6 px-4 bg-muted/30 rounded-2xl text-center', className)}>
      <h3 className="font-semibold text-foreground mb-2">
        Você tem um {listingTypeName} para anunciar?
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Apareça para milhares de pessoas na sua cidade
      </p>
      <Link
        to="/publicar"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus className="w-5 h-5" />
        Anunciar na Cidade
      </Link>
    </section>
  );
}
