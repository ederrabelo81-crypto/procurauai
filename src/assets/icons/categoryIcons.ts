// Centralized mapping of category IDs to 3D icon images
import categoryFood from '@/assets/icons/category-food.png';
import categoryStore from '@/assets/icons/category-store.png';
import categoryServices from '@/assets/icons/category-services.png';
import categoryClassifieds from '@/assets/icons/category-classifieds.png';
import categoryDeals from '@/assets/icons/category-deals.png';
import categoryEvents from '@/assets/icons/category-events.png';
import categoryNews from '@/assets/icons/category-news.png';
import categoryObituary from '@/assets/icons/category-obituary.png';
import categoryPlaces from '@/assets/icons/category-places.png';
import categoryCars from '@/assets/icons/category-cars.png';
import categoryJobs from '@/assets/icons/category-jobs.png';
import categoryRealEstate from '@/assets/icons/category-realestate.png';

export const categoryIconMap: Record<string, string> = {
  food: categoryFood,
  store: categoryStore,
  negocios: categoryStore,
  services: categoryServices,
  classifieds: categoryClassifieds,
  deals: categoryDeals,
  events: categoryEvents,
  news: categoryNews,
  obituary: categoryObituary,
  places: categoryPlaces,
  cars: categoryCars,
  jobs: categoryJobs,
  realestate: categoryRealEstate,
};

export function getCategoryIcon(categoryId: string): string | undefined {
  return categoryIconMap[categoryId];
}
