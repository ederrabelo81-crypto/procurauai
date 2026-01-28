const DebugEnv = () => {
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_PROJECT_ID as string | undefined;

  const hasAny = Boolean(apiKey || authDomain || projectId);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6 font-mono text-sm">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Verificação de Variáveis de Ambiente</h1>
        <p className="text-muted-foreground">
          Esta página mostra os valores das variáveis VITE_* expostas no build para ajudar no diagnóstico do
          Firebase.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Valores atuais</h2>
        <ul className="space-y-1">
          <li>
            <strong>VITE_API_KEY:</strong> {apiKey ? `"${apiKey}"` : "undefined"}
          </li>
          <li>
            <strong>VITE_AUTH_DOMAIN:</strong> {authDomain ? `"${authDomain}"` : "undefined"}
          </li>
          <li>
            <strong>VITE_PROJECT_ID:</strong> {projectId ? `"${projectId}"` : "undefined"}
          </li>
        </ul>
      </section>

      <section className="space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Diagnóstico</h2>
        {!hasAny ? (
          <p className="font-semibold text-destructive">
            Nenhuma variável do Firebase foi encontrada. Isso confirma que o build não está recebendo as variáveis
            da Vercel.
          </p>
        ) : !apiKey ? (
          <p className="font-semibold text-destructive">
            A VITE_API_KEY está ausente. Esse é o motivo do erro &quot;auth/invalid-api-key&quot;.
          </p>
        ) : (
          <p className="font-semibold text-emerald-500">
            A VITE_API_KEY foi encontrada. Se o erro persistir, verifique as demais chaves do Firebase.
          </p>
        )}
      </section>
    </div>
  );
};

export default DebugEnv;
