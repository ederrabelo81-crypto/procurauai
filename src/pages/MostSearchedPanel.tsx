import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDemandByCategory,
  useMostSearchedBusinesses,
} from "@/hooks/useMostSearchedInsights";
import type { MostSearchedEntry } from "@/services/mostSearchedInsights";

const MAX_ROWS_RENDERED = 500;

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function matchesQuery(entry: MostSearchedEntry, query: string) {
  const haystack =
    `${entry.negocio_normalizado} ${entry.categoria}`.toLowerCase();
  return haystack.includes(query);
}

/**
 * Ranking dos Mais Buscados — painel INTERNO (não é feature de consumidor).
 * Lê o staging gerado por scripts/whatsapp-insights/extract-insights.mjs.
 * Rota não linkada em lugar nenhum da navegação (mesmo padrão de
 * /debug-env): serve pra abrir direto pela URL, não pra aparecer no app.
 */
export default function MostSearchedPanel() {
  const { data: entries = [], isLoading, error } = useMostSearchedBusinesses();
  const { data: categories = [] } = useDemandByCategory();

  const [query, setQuery] = useState("");
  const [onlyUnlisted, setOnlyUnlisted] = useState(true);
  const [minMentions, setMinMentions] = useState(2);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries
      .filter((entry) => entry.vezes_pedido >= minMentions)
      .filter((entry) => !onlyUnlisted || entry.status === "nao_listado")
      .filter(
        (entry) => !normalizedQuery || matchesQuery(entry, normalizedQuery),
      );
  }, [entries, query, onlyUnlisted, minMentions]);

  const naoListadosCount = useMemo(
    () => entries.filter((e) => e.status === "nao_listado").length,
    [entries],
  );

  const visible = filtered.slice(0, MAX_ROWS_RENDERED);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6 pb-24 text-sm">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Ranking dos Mais Buscados</h1>
        <p className="text-muted-foreground">
          Uso interno — priorização de vendas/curadoria, não é uma feature
          pública. Negócios pedidos repetidamente no grupo de WhatsApp e ainda
          não listados no app são leads prontos. Gerado por{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            scripts/whatsapp-insights/extract-insights.mjs
          </code>
          .
        </p>
      </header>

      {isLoading && <p className="text-muted-foreground">Carregando…</p>}
      {!isLoading && error && (
        <p className="font-semibold text-destructive">
          Erro ao carregar os dados.
        </p>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Negócios agrupados" value={entries.length} />
            <StatCard label="Ainda não listados" value={naoListadosCount} />
            <StatCard
              label="Já listados"
              value={entries.length - naoListadosCount}
            />
            <StatCard
              label="Categorias com demanda"
              value={categories.filter((c) => c.mensagens > 0).length}
            />
          </div>

          {categories.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-2 font-semibold">Demanda por categoria</h2>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                {categories.map((c) => (
                  <li key={c.categoria} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{c.categoria}</span>
                    <span className="font-mono">{c.mensagens}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar negócio ou categoria..."
              className="h-9 flex-1 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyUnlisted}
                onChange={(e) => setOnlyUnlisted(e.target.checked)}
              />
              Só não listados
            </label>
            <label className="flex items-center gap-2">
              Mínimo de pedidos
              <input
                type="number"
                min={1}
                value={minMentions}
                onChange={(e) => setMinMentions(Number(e.target.value) || 1)}
                className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm"
              />
            </label>
            <span className="text-muted-foreground">
              Mostrando {visible.length} de {filtered.length}
              {filtered.length !== entries.length
                ? ` (${entries.length} no total)`
                : ""}
            </span>
          </section>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negócio</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Contato .vcf</TableHead>
                  <TableHead>1ª menção</TableHead>
                  <TableHead>Última menção</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((entry) => (
                  <TableRow
                    key={`${entry.negocio_normalizado}-${entry.categoria}`}
                  >
                    <TableCell className="font-medium">
                      {entry.negocio_normalizado}
                    </TableCell>
                    <TableCell>{entry.categoria}</TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.vezes_pedido}
                    </TableCell>
                    <TableCell>
                      {entry.status === "nao_listado"
                        ? "não listado"
                        : "já listado"}
                    </TableCell>
                    <TableCell>{entry.confianca}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.contato_vcf_encontrado ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.primeira_mencao ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.ultima_mencao ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length > MAX_ROWS_RENDERED && (
            <p className="text-muted-foreground">
              Resultado truncado em {MAX_ROWS_RENDERED} linhas — refine a busca
              ou aumente o mínimo de pedidos para ver menos ruído.
            </p>
          )}
        </>
      )}
    </div>
  );
}
