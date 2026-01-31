import { useEffect, useState } from "react";
import { getBusinessesByCategorySlug } from "@/services/businesses";

type Business = {
  id: string;
  name: string;
  neighborhood?: string | null;
  address?: string | null;
  logo_url?: string | null;
  cover_images?: string[] | null;
  plan?: "free" | "pro" | "destaque";
  is_verified?: boolean;
};

export default function ComerAgoraSection() {
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getBusinessesByCategorySlug("comer-agora");
        setItems((data ?? []) as unknown as Business[]);
      } catch (e: any) {
        console.error(e);
        setError("Não foi possível carregar Comer Agora.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-4">Carregando Comer Agora...</div>;
  if (error) return <div className="p-4">{error}</div>;

  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-3">Comer Agora</h2>

      {items.length === 0 ? (
        <div>Nenhum item encontrado.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.slice(0, 8).map((b) => {
            const img = b.logo_url || b.cover_images?.[0] || "";
            return (
              <div key={b.id} className="border rounded-lg p-3">
                {img ? (
                  <img
                    src={img}
                    alt={b.name}
                    className="w-full h-28 object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-28 bg-gray-200 rounded-md mb-2" />
                )}

                <div className="font-medium">{b.name}</div>
                <div className="text-sm opacity-70">
                  {b.neighborhood || b.address || ""}
                </div>

                <div className="text-xs mt-2 opacity-70">
                  Plano: {b.plan || "free"} {b.is_verified ? "• Verificado" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
