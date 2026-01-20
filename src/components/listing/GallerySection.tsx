import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature } from '@/lib/planUtils';

interface GallerySectionProps {
  images: string[];
  title?: string;
  className?: string;
  /** Plano do negócio */
  plan?: BusinessPlan;
}

export function GallerySection({
  images,
  title = 'Galeria',
  className,
  plan = 'pro',
}: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasAccess = hasFeature(plan, 'gallery');

  if (images.length === 0) return null;

  // Plano básico: mostrar apenas primeira foto
  const visibleImages = hasAccess ? images : images.slice(0, 1);
  const hiddenCount = images.length - visibleImages.length;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = () => setCurrentIndex((i) => (i + 1) % visibleImages.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + visibleImages.length) % visibleImages.length);

  return (
    <section className={cn('relative', className)}>
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>

      {/* Grid de miniaturas */}
      <div className="grid grid-cols-3 gap-2">
        {visibleImages.slice(0, 6).map((img, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="aspect-square rounded-lg overflow-hidden bg-muted relative group"
          >
            <img
              src={img}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {idx === 5 && visibleImages.length > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{visibleImages.length - 6}</span>
              </div>
            )}
          </button>
        ))}

        {/* Placeholder informativo para plano básico */}
        {!hasAccess && hiddenCount > 0 && (
          <div className="aspect-square rounded-lg bg-muted/50 flex flex-col items-center justify-center text-center p-2 col-span-2">
            <Info className="w-5 h-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">
              +{hiddenCount} {hiddenCount === 1 ? 'foto não disponível' : 'fotos não disponíveis'} neste anúncio
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 z-10"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {visibleImages.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                aria-label="Próxima"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={visibleImages[currentIndex]}
            alt={`Foto ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
          />

          {/* Indicador */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
            {visibleImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  idx === currentIndex ? 'bg-white' : 'bg-white/40'
                )}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
