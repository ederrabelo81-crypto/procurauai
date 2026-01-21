import { useMemo } from 'react';
import { businesses, listings, deals, events, news } from '@/data/mockData';
import { matchesAllFilters, normalizeText, matchesListingFilter } from '@/lib/tagUtils';
import { getBusinessTags } from '@/lib/businessTags';
import { LISTING_TYPES, getTagsForType } from '@/lib/taxonomy';

export type ContentType = 'business' | 'listing' | 'deal' | 'event' | 'news';

export interface SearchFilters {
  query: string;
  activeFilters: string[];
  listingType?: string;
}

export interface SearchResults {
  business: typeof businesses;
  listing: typeof listings;
  deal: typeof deals;
  event: typeof events;
  news: typeof news;
}

/**
 * Custom hook que isola a lógica de busca e filtragem.
 * Preparado para migração futura para API backend.
 */
export function useSearchEngine(filters: SearchFilters): SearchResults {
  return useMemo(() => {
    const { query, activeFilters } = filters;
    const hasQuery = !!query.trim();
    const hasFilters = activeFilters.length > 0;
    const lowerQuery = query.toLowerCase().trim();

    // Businesses
    let filteredBusinesses = businesses;
    if (hasQuery) {
      filteredBusinesses = filteredBusinesses.filter((b) => {
        const tagHit = getBusinessTags(b).some((t) => t.toLowerCase().includes(lowerQuery));
        return (
          b.name.toLowerCase().includes(lowerQuery) ||
          b.category.toLowerCase().includes(lowerQuery) ||
          b.neighborhood.toLowerCase().includes(lowerQuery) ||
          tagHit
        );
      });
    }
    if (hasFilters) {
      filteredBusinesses = filteredBusinesses.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, { hours: business.hours, checkOpenNow: true })
      );
    }

    // Listings
    let filteredListings = listings;
    if (hasQuery) {
      filteredListings = filteredListings.filter(
        (l) => l.title.toLowerCase().includes(lowerQuery) || l.neighborhood.toLowerCase().includes(lowerQuery)
      );
    }
    if (hasFilters) {
      filteredListings = filteredListings.filter((listing) => matchesListingFilter(listing, activeFilters));
    }

    // Deals
    let filteredDeals = deals;
    if (hasQuery) {
      filteredDeals = filteredDeals.filter(
        (d) => d.title.toLowerCase().includes(lowerQuery) || d.businessName?.toLowerCase().includes(lowerQuery)
      );
    }
    if (hasFilters) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));
      filteredDeals = filteredDeals.filter((deal) => {
        if (normalizedFilters.includes('valido hoje')) {
          const today = new Date().toISOString().split('T')[0];
          if (deal.validUntil < today) return false;
        }
        if (normalizedFilters.includes('entrega')) {
          const text = `${deal.title} ${deal.subtitle || ''}`.toLowerCase();
          if (!text.includes('entrega') && !text.includes('delivery')) return false;
        }
        return true;
      });
    }

    // Events
    let filteredEvents = events;
    if (hasQuery) {
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQuery) ||
          e.location.toLowerCase().includes(lowerQuery) ||
          e.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    }
    if (hasFilters) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));
      filteredEvents = filteredEvents.filter((event) => {
        if (normalizedFilters.includes('entrada gratuita')) {
          const price = event.priceText.toLowerCase();
          const ok =
            price.includes('grátis') ||
            price.includes('gratuito') ||
            price.includes('free') ||
            price === 'entrada livre';
          if (!ok) return false;
        }
        if (normalizedFilters.includes('hoje')) {
          const today = new Date().toISOString().split('T')[0];
          if (!event.dateTime.startsWith(today)) return false;
        }
        if (normalizedFilters.includes('fim de semana')) {
          const eventDate = new Date(event.dateTime);
          const day = eventDate.getDay();
          if (day !== 0 && day !== 6) return false;
        }
        const remainingFilters = activeFilters.filter(
          (f) => !['entrada gratuita', 'hoje', 'fim de semana'].includes(normalizeText(f))
        );
        return matchesAllFilters(event.tags, remainingFilters, {});
      });
    }

    // News
    let filteredNews = news;
    if (hasQuery) {
      filteredNews = filteredNews.filter(
        (n) =>
          n.title.toLowerCase().includes(lowerQuery) ||
          n.tag.toLowerCase().includes(lowerQuery) ||
          n.snippet.toLowerCase().includes(lowerQuery)
      );
    }

    return {
      business: filteredBusinesses,
      listing: filteredListings,
      deal: filteredDeals,
      event: filteredEvents,
      news: filteredNews,
    };
  }, [filters.query, filters.activeFilters, filters.listingType]);
}

/**
 * Retorna todos os filtros únicos da taxonomia
 */
export function getAllTaxonomyFilters(): { key: string; label: string; icon?: string }[] {
  const allTags = new Set<string>();
  
  Object.values(LISTING_TYPES).forEach(type => {
    type.tags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).map(tag => ({
    key: normalizeText(tag),
    label: tag,
  }));
}
