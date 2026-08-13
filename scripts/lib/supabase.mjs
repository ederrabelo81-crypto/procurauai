/**
 * Tradução dos erros mais comuns do Supabase nos scripts de carga.
 * Sem isto, uma chave errada aparece como um objeto de erro cru no terminal.
 */

/**
 * Devolve `{ title, hint }` para o erro, ou `null` quando não é um caso conhecido
 * (aí o chamador imprime o erro original, sem esconder informação).
 */
export function describeSupabaseFailure(error, { supabaseUrl = "" } = {}) {
  const message = String(error?.message ?? error ?? "");

  if (/invalid api key|jwt|unauthorized|\b401\b/i.test(message)) {
    return {
      title: `O Supabase recusou a chave: ${message}`,
      hint:
        "Confira se SUPABASE_SERVICE_ROLE_KEY é mesmo a service_role do projeto" +
        (supabaseUrl ? `\n  ${supabaseUrl}` : "") +
        " (Settings → API Keys → service_role) e se foi copiada inteira.",
    };
  }
  if (/row-level security|permission denied/i.test(message)) {
    return {
      title: `Bloqueado pelas policies de RLS: ${message}`,
      hint: "Isso costuma significar que a chave usada não é a service_role.",
    };
  }
  if (/relation .* does not exist|schema cache|could not find the table/i.test(message)) {
    return {
      title: `Tabela ausente no banco: ${message}`,
      hint: "Aplique supabase/schema.sql no SQL Editor do Supabase antes de importar.",
    };
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|timeout|not in allowlist/i.test(message)) {
    return {
      title: `Não consegui falar com o Supabase: ${message}`,
      hint: `Confira a conexão e se a URL está certa${supabaseUrl ? `: ${supabaseUrl}` : ""}.`,
    };
  }
  return null;
}
