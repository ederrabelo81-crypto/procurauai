
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '@/firebase'; 
import { listings, deals, events, news } from '@/data/mockData';
import { matchesAllFilters, normalizeText } from '@/lib/tagUtils';
import { getBusinessTags } from '@/lib/businessTags';
import { LISTING_TYPES } from '@/lib/taxonomy';
import { normalizeBusinessData, type Business } from '@/lib/dataNormalization';

export type ContentType = 'business' | 'listing' | 'deal' | 'event' | 'news';

export interface SearchFilters {
  query: string;
  activeFilters: string[];
  listingType?: string;
  categorySlug?: string; // Adicionado para filtrar por categoria
}

export interface SearchResults {
  business: Business[]; 
  listing: typeof listings;
  deal: typeof deals;
  event: typeof events;
  news: typeof news;
  isLoading: boolean;
}

function useFirestoreBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        const querySnapshot = await getDocs(collection(db, 'businesses'));
        const businessesData = querySnapshot.docs.map(doc => 
          normalizeBusinessData({ ...doc.data(), id: doc.id })
        );
        setBusinesses(businessesData);
      } catch (error) {
        console.error("Erro ao buscar negócios do Firestore:", error);
        setBusinesses([]); 
      }
      setIsLoading(false);
    };
    fetchBusinesses();
  }, []);

  return { businesses, isLoading };
}

export function useSearchEngine(filters: SearchFilters): SearchResults {
  const { businesses: allBusinesses, isLoading } = useFirestoreBusinesses();

  return useMemo(() => {
    const { query, activeFilters, categorySlug } = filters; // Pega o categorySlug
    const hasQuery = !!query.trim();
    const hasFilters = activeFilters.length > 0;
    const lowerQuery = query.toLowerCase().trim();

    let filteredBusinesses = allBusinesses;

    // 1. Filtra por Categoria (NOVO)
    if (categorySlug) {
        filteredBusinesses = filteredBusinesses.filter(
            (b) => b.categorySlug === categorySlug
        );
    }

    // 2. Filtra por Query de Texto
    if (hasQuery) {
      filteredBusinesses = filteredBusinesses.filter((b) => {
        const name = (b.name || '').toLowerCase();
        const category = (b.category || '').toLowerCase();
        const neighborhood = (b.neighborhood || '').toLowerCase();
        const tagHit = getBusinessTags(b).some((t) => (t || '').toLowerCase().includes(lowerQuery));
        
        return name.includes(lowerQuery) || category.includes(lowerQuery) || neighborhood.includes(lowerQuery) || tagHit;
      });
    }

    // 3. Filtra por Filtros Ativos (tags, etc.)
    if (hasFilters) {
      filteredBusinesses = filteredBusinesses.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, { 
          hours: business.hours, 
          checkOpenNow: true 
        })
      );
    }
    
    return {
      business: filteredBusinesses,
      listing: listings, // Dados estáticos por enquanto
      deal: deals,       // Dados estáticos por enquanto
      event: events,     // Dados estáticos por enquanto
      news: news,       // Dados estáticos por enquanto
      isLoading,
    };
  }, [filters.query, filters.activeFilters, filters.categorySlug, allBusinesses, isLoading]);
}

// A função de obter filtros de taxonomia permanece a mesma
export function getAllTaxonomyFilters(): { key: string; label: string; icon?: string }[] {
    const allTags = new Set<string>();
    Object.values(LISTING_TYPES).forEach(type => {
        type.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).map(tag => ({ key: normalizeText(tag), label: tag }));
}
