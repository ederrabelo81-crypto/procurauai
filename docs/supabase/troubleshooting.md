# Troubleshooting Supabase

## Erro: `record "new" has no field "slug"` ao salvar `businesses`

Esse erro indica que há um trigger `set_slug()` ativo na tabela `public.businesses`,
mas a coluna `slug` não existe nessa tabela no seu banco do Supabase.
O trigger tenta executar `NEW.slug := public.slugify(...)`, o que falha quando o campo
`slug` não está definido.

### 1) Confirmar a estrutura da tabela

No Supabase, abra **SQL Editor** e rode:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'businesses'
order by ordinal_position;
```

Se `slug` não aparecer, o trigger vai falhar ao inserir/atualizar qualquer linha.

### 2) Opção recomendada: adicionar a coluna `slug`

Adicione a coluna (e deixe o trigger preenchê-la automaticamente):

```sql
alter table public.businesses
add column if not exists slug text;
```

Depois, atualize os registros existentes para gerar o slug:

```sql
update public.businesses
set slug = public.slugify(name)
where slug is null or slug = '';
```

### 3) Alternativa (não recomendada): remover o trigger

Se você não pretende usar slug, pode remover o trigger:

```sql
drop trigger if exists businesses_set_slug on public.businesses;
```

> **Atenção:** sem o trigger, a coluna `slug` não é gerada automaticamente.

### 4) Verificar se o trigger existe

```sql
select tgname
from pg_trigger
join pg_class on pg_trigger.tgrelid = pg_class.oid
join pg_namespace on pg_class.relnamespace = pg_namespace.oid
where pg_namespace.nspname = 'public'
  and pg_class.relname = 'businesses';
```

Se o trigger `businesses_set_slug` aparecer, ele precisa de uma coluna `slug` válida.
