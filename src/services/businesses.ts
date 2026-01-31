import { supabase } from "@/lib/supabaseClient";

// Formato que o bloco da Home precisa (parecido com o mock)
export type UiBusiness = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  neighborhood: string;
  coverImages: string[];
  isOpenNow: boolean;
  tags: string[];
  plan?: "free" | "pro" | "destaque";
  isVerified?: boolean;
};

export async function getBusinessesByCategorySlug(slug: string, limit = 8): Promise<UiBusiness[]> {
  // JOIN com categories e filtra por slug
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      id,
      name,
      neighborhood,
      cover_images,
      is_open_now,
      plan,
      is_verified,
      categories!inner (
        name,
        slug
      )
    `
    )
    .eq("categories.slug", slug)
    .limit(limit);

  if (error) {
    console.error("Supabase error (getBusinessesByCategorySlug):", error);
    throw error;
  }

  // Converte do formato do banco para o formato do UI
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood || "",
    coverImages: Array.isArray(row.cover_images) ? row.cover_images : [],
    isOpenNow: !!row.is_open_now,
    plan: row.plan ?? "free",
    isVerified: !!row.is_verified,
    category: row.categories?.name ?? "",
    categorySlug: row.categories?.slug ?? slug,
    tags: [], // ainda não temos chips/tags ligados no seed
  }));
}
