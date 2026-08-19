/**
 * Padrões de detecção de intenção de busca e de categorização por
 * tipo de negócio/serviço, aplicados sobre o texto (já sem quebras de
 * linha) de cada mensagem.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Intenção de busca (Tarefa 1.2)
// ─────────────────────────────────────────────────────────────────────────────

export const SEARCH_INTENT_PATTERNS = {
  alguem_sabe: /algu[ée]m sabe/i,
  alguem_tem: /algu[ée]m tem/i,
  alguem_indica: /algu[ée]m indica|me indica|indica[çc][aã]o de|indicam/i,
  alguem_conhece: /algu[ée]m conhece/i,
  procuro_preciso: /\bprocuro\b|\bpreciso de\b|\bprocurando\b|estou precisando|to precisando|tô precisando/i,
  onde_tem_acho: /onde (tem|encontro|acho|vende|comprar|faz|conserta|arruma|tem que)/i,
  quem_faz_tem: /quem (faz|tem|vende|conserta|arruma|sabe|trabalha|entrega|conhece)/i,
  tem_alguem_que: /tem algu[ée]m que/i,
  numero_contato: /(n[úu]mero|contato|telefone|zap|whats) (d[aeo]|del[ae]|de algu|daquel)/i,
  alguem_faz: /algu[ée]m faz|algu[ée]m fazendo/i,
  alguem_trabalha: /algu[ée]m (que )?trabalh/i,
};

// ─────────────────────────────────────────────────────────────────────────────
// Categorização por tipo de negócio/serviço (Tarefa 1.3)
// ─────────────────────────────────────────────────────────────────────────────

// A tarefa descreve 16 categorias, mas só define regex para 15 — não
// inventamos uma 16ª aqui; ver docs/whatsapp-insights (resumo-extracao.md)
// para a nota sobre essa divergência.
export const CATEGORY_PATTERNS = {
  saude_medico:
    /m[ée]dico|dentista|consulta|cardiologi|dermato|ortoped|neuro|psic[óo]log|fisioterap|exame|laborat[óo]rio|ultrassom|raio ?x|vacina|fonoaudi|nutri|posto de sa[úu]de|psf|remedio|rem[ée]dio|farm[áa]cia/i,
  pet_veterinario: /veterin|vet\b|ra[çc]ao|castra|banho e tosa|pet|cachorr|gato|filhote|animal/i,
  auto_mecanico:
    /mec[âa]nic|guincho|borrach|pneu|auto pe[çc]a|funilaria|bateria|[óo]leo|retifica|alinh/i,
  reparos_casa:
    /eletricist|encanador|pedreiro|geladeira|m[áa]quina de lav|fog[ãa]o|conserto|conserta|refriger|ar condicionado|antena|marceneiro|montador|vidra/i,
  transporte: /uber|t[áa]xi|frete|carreto|mudan[çc]a|van\b|motorista|excurs[ãa]o|entrega/i,
  aluguel_imovel:
    /aluga|aluguel|casa pra alugar|apartament|kitnet|im[óo]vel|terreno|chacara|ch[áa]cara|quarto pra/i,
  comida:
    /marmit|restaurante|pizza|lanche|salgad|bolo|pamonha|a[çc]a[íi]|sorvete|padaria|almo[çc]o|janta|hamburg|comida|doce|torta|esfiha|churrasc/i,
  beleza_estetica:
    /manicure|cabelele|cabeleire|sobrancelha|unha|est[ée]tica|depila|maquiag|sal[ãa]o|barbei|nail|massag/i,
  servico_domestico: /faxin|diarist|costure|passadeira|empregada|cozinheir|dom[ée]stica|limpeza|cuidador/i,
  educacao: /aula de|professor|refor[çc]o|explicad|escola|curso|monitor|aula particular/i,
  documentos_juridico: /advog|despachant|contad|cart[óo]rio|document|iptu|cnh|reconhecer firma/i,
  roupa_loja: /loja|roupa|cal[çc]ad|sapato|presente|vestido|brech[óo]|modas|t[êe]nis/i,
  construcao: /pintor|material de constru|tijolo|cimento|areia|reforma|obra|gesso|telha/i,
  gas_agua: /\bg[áa]s\b|g[áa]s de cozinha|botij|[áa]gua mineral|gal[ãa]o/i,
  outros_servicos:
    /chaveiro|dj\b|som|fotografo|f[óo]tografo|festa|buffet|decora|toldo|jardinagem|piscina|dedetiza/i,
};

// ─────────────────────────────────────────────────────────────────────────────
// Urgência / tempo real
// ─────────────────────────────────────────────────────────────────────────────

export const REALTIME_PATTERN =
  /\burgente\b|pra hoje|para hoje|agora\?|preciso agora|com urg[êe]ncia|dispon[íi]vel agora|trabalhando (hoje|agora)|fazendo corrida agora|(est[áa]|ta) aberto|que horas (abre|fecha)|hor[áa]rio de (funcion|atend)|abre hoje|funciona hoje|atende hoje|aberto hoje|aberto agora/i;

/** Achata quebras de linha em espaço, para os regex não dependerem de linha única. */
function flatten(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

/** Retorna as chaves de `SEARCH_INTENT_PATTERNS` que casam com o texto. */
export function detectSearchIntent(text) {
  const flat = flatten(text);
  return Object.entries(SEARCH_INTENT_PATTERNS)
    .filter(([, pattern]) => pattern.test(flat))
    .map(([key]) => key);
}

/** Retorna as chaves de `CATEGORY_PATTERNS` que casam com o texto. */
export function categorizeMessage(text) {
  const flat = flatten(text);
  return Object.entries(CATEGORY_PATTERNS)
    .filter(([, pattern]) => pattern.test(flat))
    .map(([key]) => key);
}

/** `true` quando a mensagem sinaliza urgência/tempo real. */
export function isRealtimeIntent(text) {
  return REALTIME_PATTERN.test(flatten(text));
}
