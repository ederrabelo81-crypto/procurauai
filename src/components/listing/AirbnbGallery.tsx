import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';

interface AirbnbGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

/**
 * Airbnb-style mosaic gallery with 1 large + 4 small thumbnails
 * and a "Show all photos" button that opens a fullscreen lightbox
 */
export function AirbnbGallery({ images, title, className }: AirbnbGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex: currentIndex });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') emblaApi?.scrollNext();
    if (e.key === 'ArrowLeft') emblaApi?.scrollPrev();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  // Mobile: horizontal scroll carousel
  // Desktop: mosaic grid (1 large + 4 small)
  const displayImages = images.slice(0, 5);

  return (
    <>
      {/* Mobile Carousel */}
      <div className={cn('md:hidden relative', className)}>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0">
                <button
                  onClick={() => openLightbox(idx)}
                  className="w-full aspect-[4/3] relative"
                >
                  <img
                    src={img}
                    alt={`${title} - Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Image counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 rounded-full text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        
        {/* Show all button */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 left-4 px-3 py-1.5 bg-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-md"
        >
          <Grid className="w-4 h-4" />
          Ver todas
        </button>
      </div>

      {/* Desktop Mosaic Grid */}
      <div className={cn('hidden md:block relative rounded-xl overflow-hidden', className)}>
        <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[2.5/1]">
          {/* Large main image */}
          <button
            onClick={() => openLightbox(0)}
            className="col-span-2 row-span-2 relative group"
          >
            <img
              src={displayImages[0]}
              alt={`${title} - Principal`}
              className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
            />
          </button>
          
          {/* 4 smaller images */}
          {displayImages.slice(1, 5).map((img, idx) => (
            <button
              key={idx}
              onClick={() => openLightbox(idx + 1)}
              className="relative group"
            >
              <img
                src={img}
                alt={`${title} - Foto ${idx + 2}`}
                className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                loading="lazy"
              />
            </button>
          ))}
        </div>
        
        {/* Show all photos button */}
        {images.length > 5 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Grid className="w-4 h-4" />
            Mostrar todas as fotos ({images.length})
          </button>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 left-4 px-4 py-2 bg-transparent text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors z-10"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Fechar</span>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium z-10">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-4 md:left-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-4 md:right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
                aria-label="Próxima"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Carousel */}
          <div className="overflow-hidden w-full max-w-5xl mx-4" ref={emblaRef}>
            <div className="flex">
              {images.map((img, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-4">
                  <img
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    className="max-w-full max-h-[85vh] object-contain"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
