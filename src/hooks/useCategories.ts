import { useQuery } from "@tanstack/react-query";
import {
  getCars,
  getClassifieds,
  getDeals,
  getEvents,
  getFood,
  getJobs,
  getNews,
  getObituary,
  getPlaces,
  getRealEstate,
  getServices,
  getStore,
  type Business,
} from "@/services/categories";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

const useCategoryQuery = (key: string, queryFn: () => Promise<Business[]>) =>
  useQuery({
    queryKey: ["categories", key],
    queryFn,
    staleTime: DEFAULT_STALE_TIME,
  });

export const useFood = () => useCategoryQuery("food", getFood);
export const usePlaces = () => useCategoryQuery("places", getPlaces);
export const useCars = () => useCategoryQuery("cars", getCars);
export const useJobs = () => useCategoryQuery("jobs", getJobs);
export const useDeals = () => useCategoryQuery("deals", getDeals);
export const useServices = () => useCategoryQuery("services", getServices);
export const useEvents = () => useCategoryQuery("events", getEvents);
export const useNews = () => useCategoryQuery("news", getNews);
export const useStore = () => useCategoryQuery("store", getStore);
export const useRealEstate = () => useCategoryQuery("realestate", getRealEstate);
export const useObituary = () => useCategoryQuery("obituary", getObituary);
export const useClassifieds = () =>
  useCategoryQuery("classifieds", getClassifieds);
