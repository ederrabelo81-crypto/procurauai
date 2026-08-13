-- ============================================================================
-- Remoção da tabela de backup criada antes da reclassificação de categorias
-- ============================================================================
-- O backup foi tirado como rede de segurança da correção do trigger
-- (`bar\b` que nunca casava). Confirmado o app, ele é só uma tabela a mais em
-- produção — some daqui.
--
-- ⚠ Rode o passo 1 antes do passo 2 e confira o nome. Este script não adivinha
--   qual tabela apagar: `drop table` não tem volta e a única cópia dos dados
--   anteriores está nela.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Descobrir o nome exato e o tamanho do backup.
-- ---------------------------------------------------------------------------
select
  table_name,
  pg_size_pretty(
    pg_total_relation_size(format('public.%I', table_name)::regclass)
  ) as tamanho,
  (
    select count(*)
    from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = t.table_name
  ) as colunas
from information_schema.tables t
where table_schema = 'public'
  and table_type = 'BASE TABLE'
  and (table_name like '%backup%' or table_name like '%bkp%')
order by table_name;

-- ---------------------------------------------------------------------------
-- 2. Última conferência antes de apagar: as contagens por categoria de hoje
--    contra as do backup. Troque <tabela_de_backup> pelo nome do passo 1.
-- ---------------------------------------------------------------------------
-- select 'hoje' as origem, category_slug, count(*)
-- from public.businesses group by 1, 2
-- union all
-- select 'backup', category_slug, count(*)
-- from public.<tabela_de_backup> group by 1, 2
-- order by origem, count desc;

-- ---------------------------------------------------------------------------
-- 3. Apagar. Troque <tabela_de_backup> e descomente.
-- ---------------------------------------------------------------------------
-- drop table if exists public.<tabela_de_backup>;
