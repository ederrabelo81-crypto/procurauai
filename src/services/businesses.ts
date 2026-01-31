import { supabase } from "@/lib/supabaseClient";

export async function getBusinessesByCategorySlug(slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      description,
      neighborhood,
      address,
      phone,
      whatsapp,
      website,
      instagram,
      logo_url,
      cover_images,
      plan,
      is_verified,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("categories.slug", slug);

  if (error) {
    console.error("Erro ao buscar businesses:", error);
    throw error;
  }

  return data;
}

