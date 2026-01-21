import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BusinessPlan } from '@/data/mockData';
import { hasFeature } from '@/lib/planUtils';
import useEmblaCarousel from 'embla-carousel-react';

interface GallerySectionProps {
  images: string[];
  title?: string;
  className?: string;
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
  
  // Embla Carousel para swipe gestures
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: currentIndex });

  const hasAccess = hasFeature(plan, 'gallery');

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Atualiza o índice quando o slide muda
  useState(() => {
    if (emblaApi) {
      emblaApi.on('select', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  });

  if (images.length === 0) return null;

  const visibleImages = hasAccess ? images : images.slice(0, 1);
  const hiddenCount = images.length - visibleImages.length;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = () => setCurrentIndex((i) => (i + 1) % visibleImages.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + visibleImages.length) % visibleImages.length);

  // Handle touch/swipe in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <section className={cn('relative', className)}>
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>

      {/* Grid de miniaturas */}
      <div className="grid grid-cols-3 gap-2">
        {visibleImages.slice(0, 6).map((img, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="aspect-square rounded-2xl overflow-hidden bg-muted relative group"
          >
            <img
              src={img}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            {idx === 5 && visibleImages.length > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{visibleImages.length - 6}</span>
              </div>
            )}
          </button>
        ))}

        {/* Placeholder para plano básico */}
        {!hasAccess && hiddenCount > 0 && (
          <div className="aspect-square rounded-2xl bg-muted/50 flex flex-col items-center justify-center text-center p-2 col-span-2">
            <Info className="w-5 h-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">
              +{hiddenCount} {hiddenCount === 1 ? 'foto não disponível' : 'fotos não disponíveis'} neste anúncio
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Premium com Swipe */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Botão fechar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 z-10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navegação */}
          {visibleImages.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Próxima"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Carrossel com suporte a swipe */}
          <div className="overflow-hidden w-full max-w-4xl mx-4" ref={emblaRef}>
            <div className="flex">
              {visibleImages.map((img, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 flex items-center justify-center">
                  <img
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {visibleImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  emblaApi?.scrollTo(idx);
                }}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  idx === currentIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 rounded-full text-white text-sm font-medium">
            {currentIndex + 1} / {visibleImages.length}
          </div>
        </div>
      )}
    </section>
  );
}
