import { useQuery } from "@tanstack/react-query";
import { getHealthServices } from "@/services/healthServices";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export const useHealthServices = () =>
  useQuery({
    queryKey: ["healthServices"],
    queryFn: async () => getHealthServices(),
    staleTime: DEFAULT_STALE_TIME,
  });
