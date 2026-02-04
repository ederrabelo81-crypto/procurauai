import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useFavorites } from '@/hooks/useFavorites';
import { businesses as mockBusinesses } from '@/data/mockData';
import { normalizeBusinessData, type Business } from '@/lib/dataNormalization';

// Airbnb-inspired components
import { AirbnbGallery } from '@/components/listing/AirbnbGallery';
import { BusinessHeader } from '@/components/listing/BusinessHeader';
import { HostCard } from '@/components/listing/HostCard';
import { AirbnbReviews } from '@/components/listing/AirbnbReviews';
import { LocationSection } from '@/components/listing/LocationSection';
import { ThingsToKnow } from '@/components/listing/ThingsToKnow';
import { FloatingActions } from '@/components/listing/FloatingActions';
import { StickyNav } from '@/components/listing/StickyNav';
import { ListingActionsBar } from '@/components/listing/ListingActionsBar';
import { RelatedCarousel } from '@/components/listing/RelatedCarousel';
import { EventsSection } from '@/components/listing/EventsSection';

function normalizeSupabaseRow(row: Record<string, unknown>): Business {
  return normalizeBusinessData({
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    categorySlug: row.category_slug as string,
    tags: row.tags as string[],
    neighborhood: row.neighborhood as string,
    hours: row.hours as string,
    phone: row.phone as string,
    whatsapp: row.whatsapp as string,
    coverImages: row.cover_images as string[],
    isOpenNow: row.is_open_now as boolean,
    isVerified: row.is_verified as boolean,
    description: row.description as string,
    address: row.address as string,
    averageRating: row.average_rating as number,
    reviewCount: row.review_count as number,
    plan: row.plan as 'free' | 'pro' | 'destaque',
    website: row.website as string,
    instagram: row.instagram as string,
    logo: row.logo as string,
  });
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const headerRef = useRef<HTMLDivElement>(null);

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBusinesses, setRelatedBusinesses] = useState<Business[]>([]);
  const [businessDeals, setBusinessDeals] = useState<unknown[]>([]);
  const [businessEvents, setBusinessEvents] = useState<unknown[]>([]);
  const [showStickyNav, setShowStickyNav] = useState(false);

  // Scroll listener for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowStickyNav(headerBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!id) return;
      setLoading(true);

      const fallbackBusinesses = mockBusinesses.map((b) => normalizeBusinessData(b));
      const loadFallbackData = () => {
        const fallbackBusiness = fallbackBusinesses.find((item) => item.id === id);
        if (!fallbackBusiness) {
          setBusiness(null);
          setRelatedBusinesses([]);
          setBusinessDeals([]);
          setBusinessEvents([]);
          return;
        }
        setBusiness(fallbackBusiness);
        setRelatedBusinesses(
          fallbackBusinesses
            .filter((item) => item.categorySlug === fallbackBusiness.categorySlug && item.id !== id)
            .slice(0, 6)
        );
        setBusinessDeals([]);
        setBusinessEvents([]);
      };

      try {
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (businessError || !businessData) {
          console.warn('Negócio não encontrado no Supabase, usando fallback:', businessError);
          loadFallbackData();
          setLoading(false);
          return;
        }

        const normalizedBusiness = normalizeSupabaseRow(businessData);
        setBusiness(normalizedBusiness);

        const [relatedResult, dealsResult, eventsResult] = await Promise.all([
          supabase
            .from('businesses')
            .select('*')
            .eq('category_slug', businessData.category_slug)
            .neq('id', id)
            .limit(6),
          supabase.from('deals').select('*').eq('business_id', id),
          supabase.from('events').select('*').eq('business_id', id),
        ]);

        if (relatedResult.data) {
          setRelatedBusinesses(relatedResult.data.map(normalizeSupabaseRow));
        }
        if (dealsResult.data) {
          setBusinessDeals(dealsResult.data);
        }
        if (eventsResult.data) {
          setBusinessEvents(eventsResult.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do negócio:', error);
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Comércio não encontrado</p>
      </div>
    );
  }

  const isLiked = isFavorite('business', business.id);
  const rating = business.averageRating;
  const reviewCount = business.reviewCount;
  const reviews = business.reviews ?? [];

  const websiteMatch = business.description?.match(/Site:\s*(https?:\/\/[^\s]+|[^\s]+\.[a-z]{2,}[^\s]*)/i);
  const website = business.website || (websiteMatch ? websiteMatch[1] : undefined);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Veja ${business.name} no Procura UAI!`;
    if (navigator.share) {
      await navigator.share({ title: business.name, text, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    }
  };

  const handleTagClick = (tag: string) => navigate(`/buscar?filters=${encodeURIComponent(tag)}`);

  const relatedItemsForCarousel = relatedBusinesses.map((b) => ({
    id: b.id,
    type: 'business' as const,
    title: b.name,
    subtitle: b.neighborhood,
    image: b.coverImages[0],
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Navigation (appears on scroll) */}
      <StickyNav
        title={business.name}
        isVisible={showStickyNav}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('business', business.id)}
        onShare={handleShare}
      />

      {/* Gallery with floating action buttons */}
      <div className="relative">
        <FloatingActions
          isFavorite={isLiked}
          onFavoriteToggle={() => toggleFavorite('business', business.id)}
          onShare={handleShare}
        />
        <AirbnbGallery 
          images={business.coverImages} 
          title={business.name} 
        />
      </div>

      {/* Main content container */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header section */}
        <div ref={headerRef} className="pt-6">
          <BusinessHeader
            title={business.name}
            category={business.category}
            neighborhood={business.neighborhood}
            rating={rating}
            reviewCount={reviewCount}
            isVerified={business.isVerified}
            plan={business.plan}
          />
        </div>

        {/* Divider */}
        <div className="border-b border-border my-6" />

        {/* Host/Business card */}
        <HostCard
          name={business.name}
          logo={business.logo}
          isVerified={business.isVerified}
          description={business.description}
        />

        {/* About section */}
        {business.description && (
          <div className="py-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Sobre</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {business.description}
            </p>
          </div>
        )}

        {/* Events & Deals */}
        {(businessDeals.length > 0 || businessEvents.length > 0) && (
          <div className="py-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Eventos e Promoções</h2>
            <EventsSection 
              events={businessEvents as never[]} 
              deals={businessDeals as never[]} 
              plan={business.plan}
            />
          </div>
        )}

        {/* Reviews section */}
        <div className="border-b border-border">
          <AirbnbReviews
            reviews={reviews}
            averageRating={rating}
            reviewCount={reviewCount}
          />
        </div>

        {/* Location section */}
        <div className="border-b border-border">
          <LocationSection
            address={business.address}
            neighborhood={business.neighborhood}
            hours={business.hours}
            phone={business.phone}
            website={website}
            instagram={business.instagram}
            businessName={business.name}
          />
        </div>

        {/* Things to know / Tags */}
        {business.tags && business.tags.length > 0 && (
          <div className="border-b border-border">
            <ThingsToKnow 
              tags={business.tags} 
              onTagClick={handleTagClick} 
            />
          </div>
        )}

        {/* Related businesses */}
        {relatedItemsForCarousel.length > 0 && (
          <div className="py-8">
            <RelatedCarousel 
              title="Similares na região" 
              items={relatedItemsForCarousel} 
            />
          </div>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <ListingActionsBar
        whatsapp={business.whatsapp}
        phone={business.phone}
        address={business.address || business.neighborhood}
        businessName={business.name}
        website={website}
        onShare={handleShare}
      />
    </div>
  );
}
