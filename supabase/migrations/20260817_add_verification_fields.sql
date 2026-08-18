-- Campos de verificação em businesses: origem do dado e status de validação.
--
-- Sustentam o fluxo de curadoria manual (scripts/validate-businesses.mjs): a
-- Places API entra só na coleta inicial, e o que vai ao ar é o que passou pela
-- revisão humana. Sem isso não há como separar "importado do Google" de
-- "conferido com o comerciante".
--
-- Aplicar pelo SQL Editor do Supabase. Idempotente: pode rodar de novo.
--
-- Renomeada de 20250817_add_verification_fields.sql — o nome antigo tinha o ano
-- errado (2025) e ordenava antes das migrações de 2026, que vieram bem antes.

begin;

-- 1. Colunas -------------------------------------------------------------

alter table businesses
  add column if not exists data_source text default 'google_places',
  add column if not exists verification_status text default 'pending',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users (id),
  add column if not exists last_synced_at timestamptz;

comment on column businesses.data_source is
  'Origem do dado: google_places, manual, user_submission, partnership';
comment on column businesses.verification_status is
  'Status de validação: pending, verified, rejected, needs_update';
comment on column businesses.verified_at is 'Data/hora da validação manual';
comment on column businesses.verified_by is 'Usuário que validou (admin)';
comment on column businesses.last_synced_at is
  'Última sincronização com a Places API (se aplicável)';

-- 2. Restrições de domínio ----------------------------------------------
-- Sem enum: `text` + check aceita valor novo com um alter simples, e o script
-- de validação já barra ação desconhecida antes de chegar aqui. O check é a
-- segunda barreira, para gravação feita direto no painel.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'businesses_data_source_check'
  ) then
    alter table businesses add constraint businesses_data_source_check
      check (data_source in ('google_places', 'manual', 'user_submission', 'partnership'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'businesses_verification_status_check'
  ) then
    alter table businesses add constraint businesses_verification_status_check
      check (verification_status in ('pending', 'verified', 'rejected', 'needs_update'));
  end if;
end $$;

-- 3. Índices -------------------------------------------------------------
-- O índice parcial cobre a fila de revisão (tudo que não está aprovado); o
-- composto por (city, verification_status) serve tanto o filtro por cidade
-- sozinho quanto cidade + status, então não há índice só de city.

create index if not exists businesses_verification_status_idx
  on businesses (verification_status)
  where verification_status <> 'verified';

create index if not exists businesses_city_status_idx
  on businesses (city, verification_status);

-- 4. Backfill ------------------------------------------------------------
-- `add column ... default` já preencheu as linhas antigas com 'pending', então
-- não sobra nenhum NULL para filtrar: quem já estava marcado como is_verified
-- precisa ser promovido explicitamente, ou volta para a fila de revisão sem
-- motivo. (A versão anterior desta migração filtrava por `... is null` e, por
-- isso, nunca atualizava linha nenhuma.)

-- Prévia — rode antes do update e confira o número:
-- select count(*) from businesses
--  where is_verified is true and verification_status is distinct from 'verified';

update businesses
   set verification_status = 'verified',
       verified_at = coalesce(verified_at, now())
 where is_verified is true
   and verification_status is distinct from 'verified';

commit;

-- Conferência:
-- select verification_status, data_source, count(*)
--   from businesses group by 1, 2 order by 3 desc;
