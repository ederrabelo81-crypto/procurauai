import { useQuery } from "@tanstack/react-query";
import {
  getDemandByCategory,
  getMostSearchedBusinesses,
} from "@/services/mostSearchedInsights";

// Staging estático: só muda quando alguém roda o script de extração de novo
// e faz um novo deploy — não vale a pena revalidar em background.
const STATIC_STALE_TIME = Infinity;

export const useMostSearchedBusinesses = () =>
  useQuery({
    queryKey: ["mostSearchedBusinesses"],
    queryFn: getMostSearchedBusinesses,
    staleTime: STATIC_STALE_TIME,
  });

export const useDemandByCategory = () =>
  useQuery({
    queryKey: ["demandByCategory"],
    queryFn: getDemandByCategory,
    staleTime: STATIC_STALE_TIME,
  });
