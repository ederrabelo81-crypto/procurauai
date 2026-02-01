import { useEffect, useMemo, useState } from 'react';
import { getBusinessesByCategorySlug, type UiBusiness } from '@/services/businesses';
import { normalizeBusinessData, type Business } from '@/lib/dataNormalization';
import { getBusinessTags } from '@/lib/businessTags';
import { matchesAllFilters } from '@/lib/tagUtils';

export interface CategoryBusinessFilters {
  categorySlug?: string;
  query: string;
  activeFilters: string[];
  limit?: number;
}

const DEFAULT_LIMIT = 60;

function normalizeBusinesses(items: UiBusiness[]): Business[] {
  return items.map((item) =>
    normalizeBusinessData({
      ...item,
      coverImages: item.coverImages,
      isOpenNow: item.isOpenNow,
      isVerified: item.isVerified,
    })
  );
}

export function useCategoryBusinesses({
  categorySlug,
  query,
  activeFilters,
  limit = DEFAULT_LIMIT,
}: CategoryBusinessFilters) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!categorySlug) {
      setBusinesses([]);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        const data = await getBusinessesByCategorySlug(categorySlug, limit);
        if (!isActive) return;
        setBusinesses(normalizeBusinesses(data));
      } catch (error) {
        console.error('Erro ao buscar negócios por categoria:', error);
        if (isActive) {
          setBusinesses([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchBusinesses();

    return () => {
      isActive = false;
    };
  }, [categorySlug, limit]);

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;
    const trimmedQuery = query.trim().toLowerCase();

    if (trimmedQuery) {
      filtered = filtered.filter((business) => {
        const name = (business.name || '').toLowerCase();
        const category = (business.category || '').toLowerCase();
        const neighborhood = (business.neighborhood || '').toLowerCase();
        const tagHit = getBusinessTags(business).some((tag) =>
          (tag || '').toLowerCase().includes(trimmedQuery)
        );

        return (
          name.includes(trimmedQuery) ||
          category.includes(trimmedQuery) ||
          neighborhood.includes(trimmedQuery) ||
          tagHit
        );
      });
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, {
          hours: business.hours,
          checkOpenNow: true,
        })
      );
    }

    return filtered;
  }, [businesses, query, activeFilters]);

  return { businesses: filteredBusinesses, isLoading };
}
