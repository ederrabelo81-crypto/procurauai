import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { listings, deals, events, news, businesses as mockBusinesses } from '@/data/mockData';
import { matchesAllFilters, normalizeText } from '@/lib/tagUtils';
import { getBusinessTags } from '@/lib/businessTags';
import { LISTING_TYPES } from '@/lib/taxonomy';
import { normalizeBusinessData, type Business } from '@/lib/dataNormalization';

export type ContentType = 'business' | 'listing' | 'deal' | 'event' | 'news';

export interface SearchFilters {
  query: string;
  activeFilters: string[];
  listingType?: string;
  categorySlug?: string;
}

export interface SearchResults {
  business: Business[];
  listing: typeof listings;
  deal: typeof deals;
  event: typeof events;
  news: typeof news;
  isLoading: boolean;
}

function useSupabaseBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      const fallbackBusinesses = mockBusinesses.map((business) => normalizeBusinessData(business));

      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*');

        if (error) {
          console.error('Erro ao buscar negócios do Supabase:', error);
          setBusinesses(fallbackBusinesses);
          setIsLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setBusinesses(fallbackBusinesses);
          setIsLoading(false);
          return;
        }

        // Normaliza os dados do Supabase (snake_case -> camelCase)
        const normalizedData = data.map((row) =>
          normalizeBusinessData({
            id: row.id,
            name: row.name,
            category: row.category,
            categorySlug: row.category_slug,
            tags: row.tags,
            neighborhood: row.neighborhood,
            hours: row.hours,
            phone: row.phone,
            whatsapp: row.whatsapp,
            coverImages: row.cover_images,
            isOpenNow: row.is_open_now,
            isVerified: row.is_verified,
            description: row.description,
            address: row.address,
            averageRating: row.average_rating,
            reviewCount: row.review_count,
            plan: row.plan,
            website: row.website,
            instagram: row.instagram,
            logo: row.logo,
          })
        );

        // Merge com dados mock para garantir conteúdo inicial
        const uniqueBusinesses = new Map<string, Business>();
        normalizedData.forEach((business) => uniqueBusinesses.set(business.id, business));
        fallbackBusinesses.forEach((business) => {
          if (!uniqueBusinesses.has(business.id)) {
            uniqueBusinesses.set(business.id, business);
          }
        });

        setBusinesses(Array.from(uniqueBusinesses.values()));
      } catch (error) {
        console.error('Erro ao buscar negócios:', error);
        setBusinesses(fallbackBusinesses);
      }
      setIsLoading(false);
    };

    fetchBusinesses();
  }, []);

  return { businesses, isLoading };
}

export function useSearchEngine(filters: SearchFilters): SearchResults {
  const { businesses: allBusinesses, isLoading } = useSupabaseBusinesses();

  return useMemo(() => {
    const { query, activeFilters, categorySlug } = filters;
    const hasQuery = !!query.trim();
    const hasFilters = activeFilters.length > 0;
    const lowerQuery = query.toLowerCase().trim();

    let filteredBusinesses = allBusinesses;

    // 1. Filtra por Categoria
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
          checkOpenNow: true,
        })
      );
    }

    return {
      business: filteredBusinesses,
      listing: listings,
      deal: deals,
      event: events,
      news: news,
      isLoading,
    };
  }, [filters.query, filters.activeFilters, filters.categorySlug, allBusinesses, isLoading]);
}

export function getAllTaxonomyFilters(): { key: string; label: string; icon?: string }[] {
  const allTags = new Set<string>();
  Object.values(LISTING_TYPES).forEach((type) => {
    type.tags.forEach((tag) => allTags.add(tag));
  });
  return Array.from(allTags).map((tag) => ({ key: normalizeText(tag), label: tag }));
}
