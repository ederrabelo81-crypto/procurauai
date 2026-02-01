const DebugEnv = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const hasAny = Boolean(supabaseUrl || supabaseAnonKey);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6 font-mono text-sm">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Verificação de Variáveis de Ambiente</h1>
        <p className="text-muted-foreground">
          Esta página mostra os valores das variáveis VITE_* expostas no build para ajudar no diagnóstico.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Supabase</h2>
        <ul className="space-y-1">
          <li>
            <strong>VITE_SUPABASE_URL:</strong>{" "}
            {supabaseUrl ? `"${supabaseUrl.substring(0, 30)}..."` : "undefined"}
          </li>
          <li>
            <strong>VITE_SUPABASE_ANON_KEY:</strong>{" "}
            {supabaseAnonKey ? `"${supabaseAnonKey.substring(0, 20)}..."` : "undefined"}
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Google Maps</h2>
        <ul className="space-y-1">
          <li>
            <strong>VITE_GOOGLE_MAPS_API_KEY:</strong>{" "}
            {googleMapsApiKey ? `"${googleMapsApiKey.substring(0, 15)}..."` : "undefined"}
          </li>
        </ul>
      </section>

      <section className="space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Diagnóstico</h2>
        {!hasAny ? (
          <p className="font-semibold text-destructive">
            Nenhuma variável do Supabase foi encontrada. Verifique se as variáveis de ambiente estão configuradas.
          </p>
        ) : !supabaseUrl ? (
          <p className="font-semibold text-destructive">
            A VITE_SUPABASE_URL está ausente. O Supabase não funcionará corretamente.
          </p>
        ) : !supabaseAnonKey ? (
          <p className="font-semibold text-destructive">
            A VITE_SUPABASE_ANON_KEY está ausente. O Supabase não funcionará corretamente.
          </p>
        ) : (
          <p className="font-semibold text-emerald-500">
            Variáveis do Supabase configuradas corretamente!
          </p>
        )}
      </section>
    </div>
  );
};

export default DebugEnv;
