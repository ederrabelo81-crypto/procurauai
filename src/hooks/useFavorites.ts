import { useState, useEffect, useCallback } from 'react';

type FavoriteType = 'business' | 'listing' | 'place' | 'car' | 'job' | 'realestate' | 'deal' | 'event' | 'news';

interface Favorite {
  type: FavoriteType;
  id: string;
}

const STORAGE_KEY = 'monte-de-tudo-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((type: FavoriteType, id: string) => {
    return favorites.some(f => f.type === type && f.id === id);
  }, [favorites]);

  const toggleFavorite = useCallback((type: FavoriteType, id: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.type === type && f.id === id);
      if (exists) {
        return prev.filter(f => !(f.type === type && f.id === id));
      }
      return [...prev, { type, id }];
    });
  }, []);

  const getFavorites = useCallback((type?: FavoriteType) => {
    if (type) {
      return favorites.filter(f => f.type === type);
    }
    return favorites;
  }, [favorites]);

  return { favorites, isFavorite, toggleFavorite, getFavorites };
}
