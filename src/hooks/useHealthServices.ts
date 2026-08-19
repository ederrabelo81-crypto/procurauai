import { useQuery } from "@tanstack/react-query";
import { getValidatedHealthServices } from "@/services/healthServices";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export const useHealthServices = () =>
  useQuery({
    queryKey: ["healthServices"],
    queryFn: async () => getValidatedHealthServices(),
    staleTime: DEFAULT_STALE_TIME,
  });
