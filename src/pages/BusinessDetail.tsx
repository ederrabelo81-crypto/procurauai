
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { User, Images, Phone as PhoneIcon, Info, CalendarDays, Star, BadgeCheck } from 'lucide-react';
import { ListingHero } from '@/components/listing/ListingHero';
import { ListingActionsBar } from '@/components/listing/ListingActionsBar';
import { ListingTabs, TabItem } from '@/components/listing/ListingTabs';
import { GallerySection } from '@/components/listing/GallerySection';
import { ContactSection } from '@/components/listing/ContactSection';
import { RelatedCarousel } from '@/components/listing/RelatedCarousel';
import { EventsSection } from '@/components/listing/EventsSection';
import { ReviewsSection } from '@/components/listing/ReviewsSection';
import { TagChip } from '@/components/ui/TagChip';
import { useFavorites } from '@/hooks/useFavorites';
import { businesses as mockBusinesses } from '@/data/mockData';
import { normalizeBusinessData } from '@/lib/dataNormalization';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBusinesses, setRelatedBusinesses] = useState<any[]>([]);
  const [businessDeals, setBusinessDeals] = useState<any[]>([]);
  const [businessEvents, setBusinessEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!id) return;
      setLoading(true);

      const fallbackBusinesses = mockBusinesses.map((business) => normalizeBusinessData(business));
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
          fallbackBusinesses.filter((item) => item.categorySlug === fallbackBusiness.categorySlug && item.id !== id).slice(0, 6)
        );
        setBusinessDeals([]);
        setBusinessEvents([]);
      };

      try {
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authError) {
            console.warn("Falha ao autenticar anonimamente. Continuando sem autenticação.", authError);
          }
        }
        // Buscar o negócio principal
        const businessDocRef = doc(db, 'businesses', id);
        const businessDoc = await getDoc(businessDocRef);

        if (!businessDoc.exists()) {
          loadFallbackData();
          setLoading(false);
          return;
        }

        const businessData = normalizeBusinessData({ id: businessDoc.id, ...businessDoc.data() });
        setBusiness(businessData);

        // Buscar dados relacionados em paralelo
        const relatedQuery = query(
          collection(db, 'businesses'), 
          where('categorySlug', '==', businessData.categorySlug), 
          where('__name__', '!=', id), 
          limit(6)
        );
        const dealsQuery = query(collection(db, 'deals'), where('businessId', '==', id));
        const eventsQuery = query(collection(db, 'events'), where('businessId', '==', id));

        const [relatedSnapshot, dealsSnapshot, eventsSnapshot] = await Promise.all([
          getDocs(relatedQuery),
          getDocs(dealsQuery),
          getDocs(eventsQuery)
        ]);

        setRelatedBusinesses(relatedSnapshot.docs.map(doc => normalizeBusinessData({ id: doc.id, ...doc.data() })));
        setBusinessDeals(dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setBusinessEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Erro ao buscar dados do negócio:", error);
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Carregando...</p></div>;
  }

  if (!business) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Comércio não encontrado</p></div>;
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

  const tabs: TabItem[] = [
    { id: 'perfil', label: 'Perfil', icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-6 px-4">
          {business.isVerified && <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg w-fit"><BadgeCheck className="w-4 h-4 text-primary" /><span className="text-sm font-medium text-primary">Anunciante Verificado</span></div>}
          {business.description && <div><h3 className="font-semibold text-foreground mb-2">Sobre</h3><p className="text-muted-foreground leading-relaxed">{business.description}</p></div>}
          {business.tags && business.tags.length > 0 && <div><h3 className="font-semibold text-foreground mb-2">Diferenciais</h3><div className="flex flex-wrap gap-2">{business.tags.map((tag) => <TagChip key={tag} onClick={() => handleTagClick(tag)} size="sm" variant="tag">{tag}</TagChip>)}</div></div>}
          {relatedItemsForCarousel.length > 0 && <RelatedCarousel title="Similares na região" items={relatedItemsForCarousel} className="pt-4" />}
        </div>
      ),
    },
    { id: 'galeria', label: 'Galeria', icon: <Images className="w-4 h-4" />, count: business.coverImages.length,
      content: <div className="px-4"><GallerySection images={business.coverImages} title="Fotos" /></div>,
    },
    { id: 'avaliacoes', label: 'Avaliações', icon: <Star className="w-4 h-4" />, count: reviewCount,
      content: (
        <div className="px-4">
          <ReviewsSection
            reviews={reviews}
            averageRating={rating}
            reviewCount={reviewCount}
            plan={business.plan}
          />
        </div>
      ),
    },
    { id: 'eventos', label: 'Eventos', icon: <CalendarDays className="w-4 h-4" />, count: businessDeals.length + businessEvents.length, hideIfEmpty: businessDeals.length === 0 && businessEvents.length === 0,
      content: <div className="px-4"><EventsSection events={businessEvents} deals={businessDeals} /></div>,
    },
    { id: 'contato', label: 'Contato', icon: <PhoneIcon className="w-4 h-4" />,
      content: <div className="px-4"><ContactSection address={business.address} neighborhood={business.neighborhood} hours={business.hours} phone={business.phone} businessName={business.name} /></div>,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <ListingHero
        coverImage={business.coverImages[0]}
        avatar={business.logo}
        title={business.name}
        category={business.category}
        neighborhood={business.neighborhood}
        hours={business.hours}
        rating={rating}
        reviewCount={reviewCount}
        isVerified={business.isVerified}
        isFavorite={isLiked}
        onFavoriteToggle={() => toggleFavorite('business', business.id)}
        onShare={handleShare}
      />
      <ListingTabs tabs={tabs} defaultTab="perfil" className="mt-4" />
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
