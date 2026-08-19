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
 * `"pendente_validacao_manual"` — o número veio de contato salvo por morador
 * no WhatsApp, não de uma ligação de confirmação com o próprio serviço.
 * Decisão do Eder (founder): publicar tudo assim mesmo, sem selo de "não
 * confirmado" na UI — os contatos já são os que a cidade usa informalmente.
 * `"rejeitado"` continua sendo um jeito de tirar uma entrada específica do ar
 * (editando só o JSON) sem precisar mexer em código, para quando alguém
 * confirmar que um número está errado.
 */
const HIDDEN_STATUSES = new Set(["rejeitado"]);

function parseHealthServiceRows(rows: unknown): HealthService[] {
  if (!Array.isArray(rows)) return [];

  const parsed: HealthService[] = [];
  for (const row of rows) {
    const result = healthServiceRowSchema.safeParse(row);
    if (result.success) parsed.push(result.data);
    else reportError(result.error, { scope: "getHealthServices row" });
  }
  return parsed;
}

export function getHealthServices(): HealthService[] {
  return parseHealthServiceRows(saudeEServicosData).filter(
    (service) => !HIDDEN_STATUSES.has(service.status),
  );
}
