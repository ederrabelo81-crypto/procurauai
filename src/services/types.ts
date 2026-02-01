import { BusinessId } from "@/types/ids";

export type Business = {
  id: BusinessId;
  name: string;
  category: string | null;
  neighborhood: string | null;
};
