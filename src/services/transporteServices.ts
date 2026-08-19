import { z } from "zod";
import { reportError } from "@/lib/errors/errorHandler";

// Dados de transporte do WhatsApp insights
import transporteData from "../../data/whatsapp-insights/mais-buscados.json";

export const TRANSPORTE_CATEGORIA_VALUES = [
  "taxi",
  "uber",
  "van",
  "frete",
  "mudanca",
  "entregador",
  "ambulancia",
  "outro",
] as const;

export type TransporteCategoria = (typeof TRANSPORTE_CATEGORIA_VALUES)[number];

export const TRANSPORTE_CATEGORIA_LABELS: Record<TransporteCategoria, string> = {
  taxi: "Táxi",
  uber: "Uber / Aplicativo",
  van: "Van / Kombi",
  frete: "Frete",
  mudanca: "Mudança",
  entregador: "Entregador",
  ambulancia: "Ambulância",
  outro: "Outro transporte",
};

export interface TransporteService {
  nome: string;
  categoria: TransporteCategoria;
  telefone?: string;
  vezes_pedido: number;
  exemplos_pedido?: string[];
  contato_vcf_encontrado?: string | null;
  confianca: "alta" | "media" | "baixa";
  status: "ja_listado" | "nao_listado";
}

const transporteEntrySchema = z.object({
  negocio_normalizado: z.string(),
  categoria: z.string(),
  vezes_pedido: z.number(),
  primeira_mencao: z.string().nullable(),
  ultima_mencao: z.string().nullable(),
  exemplos_pedido: z.array(z.string()),
  contato_vcf_encontrado: z.string().nullable(),
  confianca: z.enum(["alta", "media", "baixa"]),
  status: z.enum(["ja_listado", "nao_listado"]),
});

function parseTransporteEntries(rows: unknown): TransporteService[] {
  if (!Array.isArray(rows)) return [];

  const parsed: TransporteService[] = [];
  for (const row of rows) {
    const result = transporteEntrySchema.safeParse(row);
    if (result.success && result.data.categoria === "transporte") {
      // Mapeia o negócio normalizado para uma categoria mais específica
      const nome = result.data.negocio_normalizado.toLowerCase();
      let categoria: TransporteCategoria = "outro";

      if (nome.includes("taxi") || nome.includes("táxi") || nome.includes("tavim")) {
        categoria = "taxi";
      } else if (nome.includes("uber")) {
        categoria = "uber";
      } else if (nome.includes("van") || nome.includes("kombi")) {
        categoria = "van";
      } else if (nome.includes("frete") || nome.includes("neslinho")) {
        categoria = "frete";
      } else if (nome.includes("mudança") || nome.includes("mudanca")) {
        categoria = "mudanca";
      } else if (nome.includes("entregador") || nome.includes("shopee") || nome.includes("mercado livre")) {
        categoria = "entregador";
      } else if (nome.includes("ambulância") || nome.includes("ambulancia")) {
        categoria = "ambulancia";
      }

      parsed.push({
        nome: result.data.negocio_normalizado,
        categoria,
        vezes_pedido: result.data.vezes_pedido,
        exemplos_pedido: result.data.exemplos_pedido,
        contato_vcf_encontrado: result.data.contato_vcf_encontrado,
        confianca: result.data.confianca,
        status: result.data.status,
      });
    }
  }

  // Ordena por quantidade de pedidos (mais buscados primeiro)
  return parsed.sort((a, b) => b.vezes_pedido - a.vezes_pedido);
}

export function getTransporteServices(): TransporteService[] {
  return parseTransporteEntries(transporteData);
}
