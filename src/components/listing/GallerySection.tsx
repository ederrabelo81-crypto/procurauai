import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature, PLAN_INFO } from '@/lib/planUtils';

interface GallerySectionProps {
  images: string[];
  title?: string;
  className?: string;
  /** Plano do negócio - se FREE, galeria fica com blur */
  plan?: BusinessPlan;
  /** Callback para abrir modal de upgrade */
  onUpgrade?: () => void;
}

export function GallerySection({
  images,
  title = 'Galeria',
  className,
  plan = 'pro',
  onUpgrade,
}: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasAccess = hasFeature(plan, 'gallery');

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    if (!hasAccess) {
      onUpgrade?.();
      return;
    }
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <section className={cn('relative', className)}>
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>

      {/* Grid de miniaturas */}
      <div className={cn('grid grid-cols-3 gap-2', !hasAccess && 'relative')}>
        {images.slice(0, 6).map((img, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className={cn(
              'aspect-square rounded-lg overflow-hidden bg-muted relative group',
              !hasAccess && 'cursor-pointer'
            )}
          >
            <img
              src={img}
              alt={`Foto ${idx + 1}`}
              className={cn(
                'w-full h-full object-cover transition-transform',
                hasAccess && 'group-hover:scale-105',
                !hasAccess && 'filter blur-sm'
              )}
            />
            {idx === 5 && images.length > 6 && hasAccess && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 6}</span>
              </div>
            )}
          </button>
        ))}

        {/* Overlay de bloqueio para FREE */}
        {!hasAccess && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg cursor-pointer"
            onClick={onUpgrade}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Galeria bloqueada
            </p>
            <p className="text-xs text-muted-foreground mb-3 text-center px-4">
              Veja todas as fotos do negócio
            </p>
            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
              Ativar {PLAN_INFO.pro.label}
            </span>
          </div>
        )}
      </div>

      {/* Lightbox - só abre se tiver acesso */}
      {lightboxOpen && hasAccess && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 z-10"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
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
            src={images[currentIndex]}
            alt={`Foto ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
          />

          {/* Indicador */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, idx) => (
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
