import { useMemo } from 'react';
import { businesses, listings, deals, events, news } from '@/data/mockData';
import { matchesAllFilters, normalizeText, matchesListingFilter } from '@/lib/tagUtils';
import { getBusinessTags } from '@/lib/businessTags';
import { LISTING_TYPES } from '@/lib/taxonomy';

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

export function useSearchEngine(filters: SearchFilters): SearchResults {
  return useMemo(() => {
    const { query, activeFilters } = filters;
    const hasQuery = !!query.trim();
    const hasFilters = activeFilters.length > 0;
    const lowerQuery = query.toLowerCase().trim();

    // Businesses - COM VALIDAÇÃO
    let filteredBusinesses = businesses;
    if (hasQuery) {
      filteredBusinesses = filteredBusinesses.filter((b) => {
        // ✅ Validar campos antes de usar toLowerCase()
        const name = (b.name || '').toLowerCase();
        const category = (b.category || '').toLowerCase();
        const neighborhood = (b.neighborhood || '').toLowerCase();
        
        const tagHit = getBusinessTags(b).some((t) => 
          (t || '').toLowerCase().includes(lowerQuery)
        );
        
        return (
          name.includes(lowerQuery) ||
          category.includes(lowerQuery) ||
          neighborhood.includes(lowerQuery) ||
          tagHit
        );
      });
    }
    if (hasFilters) {
      filteredBusinesses = filteredBusinesses.filter((business) =>
        matchesAllFilters(getBusinessTags(business), activeFilters, { 
          hours: business.hours, 
          checkOpenNow: true 
        })
      );
    }

    // Listings - COM VALIDAÇÃO
    let filteredListings = listings;
    if (hasQuery) {
      filteredListings = filteredListings.filter((l) => {
        const title = (l.title || '').toLowerCase();
        const neighborhood = (l.neighborhood || '').toLowerCase();
        return title.includes(lowerQuery) || neighborhood.includes(lowerQuery);
      });
    }
    if (hasFilters) {
      filteredListings = filteredListings.filter((listing) => 
        matchesListingFilter(listing, activeFilters)
      );
    }

    // Deals - COM VALIDAÇÃO
    let filteredDeals = deals;
    if (hasQuery) {
      filteredDeals = filteredDeals.filter((d) => {
        const title = (d.title || '').toLowerCase();
        const businessName = (d.businessName || '').toLowerCase();
        return title.includes(lowerQuery) || businessName.includes(lowerQuery);
      });
    }
    if (hasFilters) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));
      filteredDeals = filteredDeals.filter((deal) => {
        if (normalizedFilters.includes('valido hoje')) {
          const today = new Date().toISOString().split('T')[0];
          if (deal.validUntil < today) return false;
        }
        if (normalizedFilters.includes('entrega')) {
          const text = `${deal.title || ''} ${deal.subtitle || ''}`.toLowerCase();
          if (!text.includes('entrega') && !text.includes('delivery')) return false;
        }
        return true;
      });
    }

    // Events - COM VALIDAÇÃO
    let filteredEvents = events;
    if (hasQuery) {
      filteredEvents = filteredEvents.filter((e) => {
        const title = (e.title || '').toLowerCase();
        const location = (e.location || '').toLowerCase();
        const tagHit = (e.tags || []).some((t) => 
          (t || '').toLowerCase().includes(lowerQuery)
        );
        return title.includes(lowerQuery) || 
               location.includes(lowerQuery) || 
               tagHit;
      });
    }
    if (hasFilters) {
      const normalizedFilters = activeFilters.map((f) => normalizeText(f));
      filteredEvents = filteredEvents.filter((event) => {
        if (normalizedFilters.includes('entrada gratuita')) {
          const price = (event.priceText || '').toLowerCase();
          const ok =
            price.includes('grátis') ||
            price.includes('gratuito') ||
            price.includes('free') ||
            price === 'entrada livre';
          if (!ok) return false;
        }
        if (normalizedFilters.includes('hoje')) {
          const today = new Date().toISOString().split('T')[0];
          if (!event.dateTime || !event.dateTime.startsWith(today)) return false;
        }
        if (normalizedFilters.includes('fim de semana')) {
          if (!event.dateTime) return false;
          const eventDate = new Date(event.dateTime);
          const day = eventDate.getDay();
          if (day !== 0 && day !== 6) return false;
        }
        const remainingFilters = activeFilters.filter(
          (f) => !['entrada gratuita', 'hoje', 'fim de semana'].includes(normalizeText(f))
        );
        return matchesAllFilters(event.tags || [], remainingFilters, {});
      });
    }

    // News - COM VALIDAÇÃO
    let filteredNews = news;
    if (hasQuery) {
      filteredNews = filteredNews.filter((n) => {
        const title = (n.title || '').toLowerCase();
        const tag = (n.tag || '').toLowerCase();
        const snippet = (n.snippet || '').toLowerCase();
        return title.includes(lowerQuery) ||
               tag.includes(lowerQuery) ||
               snippet.includes(lowerQuery);
      });
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