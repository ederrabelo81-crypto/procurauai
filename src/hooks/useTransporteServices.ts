import { useQuery } from "@tanstack/react-query";
import { getTransporteServices } from "@/services/transporteServices";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export const useTransporteServices = () =>
  useQuery({
    queryKey: ["transporteServices"],
    queryFn: async () => getTransporteServices(),
    staleTime: DEFAULT_STALE_TIME,
  });
