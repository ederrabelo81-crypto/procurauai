import { z } from "zod";
import { reportError } from "@/lib/errors/errorHandler";

/**
 * Ranking dos Mais Buscados — leitura do staging gerado por
 * scripts/whatsapp-insights/extract-insights.mjs. Uso interno (priorização
 * de vendas/curadoria), não é feature de consumidor — ver
 * docs/whatsapp-insights.md e src/pages/MostSearchedPanel.tsx.
 *
 * Os dois `import()` são dinâmicos de propósito: mais-buscados.json tem
 * ~700 KB (1.7k negócios) e só interessa a quem abre este painel — importar
 * estático inflaria o bundle de toda página do app.
 */

const CONFIANCA_VALUES = ["alta", "media", "baixa"] as const;
const STATUS_VALUES = ["ja_listado", "nao_listado"] as const;

const mostSearchedEntrySchema = z.object({
  negocio_normalizado: z.string(),
  categoria: z.string(),
  vezes_pedido: z.number(),
  primeira_mencao: z.string().nullable(),
  ultima_mencao: z.string().nullable(),
  exemplos_pedido: z.array(z.string()),
  contato_vcf_encontrado: z.string().nullable(),
  confianca: z.enum(CONFIANCA_VALUES),
  status: z.enum(STATUS_VALUES),
});

export type MostSearchedEntry = z.infer<typeof mostSearchedEntrySchema>;

const demandByCategorySchema = z.object({
  categoria: z.string(),
  mensagens: z.number(),
});

export type DemandByCategory = z.infer<typeof demandByCategorySchema>;

function parseRows<T>(rows: unknown, schema: z.ZodType<T>, scope: string): T[] {
  if (!Array.isArray(rows)) return [];
  const parsed: T[] = [];
  for (const row of rows) {
    const result = schema.safeParse(row);
    if (result.success) parsed.push(result.data);
    else reportError(result.error, { scope });
  }
  return parsed;
}

export async function getMostSearchedBusinesses(): Promise<
  MostSearchedEntry[]
> {
  const mod = await import("../../data/whatsapp-insights/mais-buscados.json");
  return parseRows(
    mod.default,
    mostSearchedEntrySchema,
    "getMostSearchedBusinesses row",
  );
}

export async function getDemandByCategory(): Promise<DemandByCategory[]> {
  const mod =
    await import("../../data/whatsapp-insights/demanda-por-categoria.json");
  return parseRows(
    mod.default,
    demandByCategorySchema,
    "getDemandByCategory row",
  );
}
