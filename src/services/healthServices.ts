import { z } from "zod";
import { reportError } from "@/lib/errors/errorHandler";
// Gerado por scripts/whatsapp-insights/extract-insights.mjs (Tarefa 2.3) a
// partir dos exports de WhatsApp — fica fora de src/ porque é saída de um
// script de dados, não código do app; ver CLAUDE.md §6.
import saudeEServicosData from "../../data/whatsapp-insights/saude-e-servicos.json";

export const CATEGORIA_SERVICO_VALUES = [
  "posto_saude",
  "pronto_socorro",
  "farmacia",
  "vacina",
  "assistencia_social",
  "conselho_tutelar",
  "defensoria",
  "vigilancia_sanitaria",
  "prefeitura",
  "outro",
] as const;

export type CategoriaServico = (typeof CATEGORIA_SERVICO_VALUES)[number];

export const CATEGORIA_SERVICO_LABELS: Record<CategoriaServico, string> = {
  posto_saude: "Posto de Saúde",
  pronto_socorro: "Pronto-Socorro",
  farmacia: "Farmácia",
  vacina: "Vacinação",
  assistencia_social: "Assistência Social",
  conselho_tutelar: "Conselho Tutelar",
  defensoria: "Defensoria Pública",
  vigilancia_sanitaria: "Vigilância Sanitária",
  prefeitura: "Prefeitura",
  outro: "Outro serviço",
};

export interface HealthService {
  nome: string;
  categoria_servico: CategoriaServico;
  telefone: string;
  vezes_mencionado_no_grupo: number;
  status: string;
}

const healthServiceRowSchema = z.object({
  nome: z.string(),
  categoria_servico: z.enum(CATEGORIA_SERVICO_VALUES),
  telefone: z.string(),
  fonte: z.string().optional(),
  vezes_mencionado_no_grupo: z.number(),
  confianca_contagem: z.string().optional(),
  status: z.string(),
});

/**
 * O script de extração marca todo contato institucional como
 * `"pendente_validacao_manual"` — nada publicável sem a curadoria manual que
 * o projeto já define (confirmar telefone e horário com o próprio serviço).
 * Só o que alguém revisou e marcou `"validado"` em
 * `data/whatsapp-insights/saude-e-servicos.json` aparece na página pública.
 */
const PUBLISHED_STATUSES = new Set(["validado"]);

function parseHealthServiceRows(rows: unknown): HealthService[] {
  if (!Array.isArray(rows)) return [];

  const parsed: HealthService[] = [];
  for (const row of rows) {
    const result = healthServiceRowSchema.safeParse(row);
    if (result.success) parsed.push(result.data);
    else reportError(result.error, { scope: "getValidatedHealthServices row" });
  }
  return parsed;
}

export function getValidatedHealthServices(): HealthService[] {
  return parseHealthServiceRows(saudeEServicosData).filter((service) =>
    PUBLISHED_STATUSES.has(service.status),
  );
}
