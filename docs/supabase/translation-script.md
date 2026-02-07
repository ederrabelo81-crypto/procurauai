# Script de tradução direta (Supabase + DeepL)

Este script traduz a coluna `description` para PT-BR usando a API do DeepL,
normaliza `rating` para 1 casa decimal e ajusta categorias de comida para
`Negócios` na tabela `public.businesses`.

## Pré-requisitos

- Chave da API do DeepL (`DEEPL_API_KEY`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (necessário para bypass do RLS)

## Como usar

```bash
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
export DEEPL_API_KEY="sua-chave-deepl"

node scripts/translate-businesses.mjs --dry-run --limit=20
```

### Executar de verdade (sem dry-run)

```bash
node scripts/translate-businesses.mjs --limit=20
```

### Processar IDs específicos

```bash
node scripts/translate-businesses.mjs --ids=uuid1,uuid2
```

### Ajustar offset

```bash
node scripts/translate-businesses.mjs --limit=50 --offset=50
```

## Observações

- O script usa o endpoint gratuito do DeepL por padrão (`api-free.deepl.com`).
  Para planos pagos, defina `DEEPL_API_URL="https://api.deepl.com/v2/translate"`.
- O `rating` é arredondado com `Math.round(valor * 10) / 10`.
- As categorias são ajustadas para `Negócios` se houver palavras-chave como
  `comida`, `restaurante`, `supermercado`, `padaria`, `pizzaria`, etc.
