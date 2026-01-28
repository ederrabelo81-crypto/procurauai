# Banco de Dados (PostgreSQL + PostGIS)

Este documento define o schema recomendado para substituir o Firebase e manter o Procurauai com dados próprios, usando o Google Maps apenas para mapas, geocoding e rotas.

## 1) Pré-requisitos

- PostgreSQL 15+ (com extensão PostGIS)
- `psql` local ou conexão em nuvem (RDS, Supabase, Neon, etc.)

## 2) Aplicando o schema

```bash
psql "$DATABASE_URL" -f docs/database/schema.sql
```

> Se estiver usando Postgres gerenciado, habilite a extensão PostGIS no painel (quando necessário).

## 3) Chips (tags) e filtros

Os chips ficam em `chips` e o vínculo com negócios em `business_chips`. Isso suporta:

- chips de filtros (ex: "Entrega", "Aceita Cartão")
- chips exibidos dentro dos cards

A lógica do frontend já usa `getBusinessTags` para juntar `tags` e flags de negócio, então no backend basta garantir que `chips`/`business_chips` e/ou `tags` estejam disponíveis na API do negócio.【F:src/lib/businessTags.ts†L1-L29】

## 4) Features e planos

As features expostas em mini-sites e cartões estão mapeadas no frontend por `planUtils`. Para manter consistência:

- `plan_features` deve conter as chaves: `whatsapp`, `call`, `maps`, `website`, `schedule`, `gallery`, `events`, `reviews`, `hours`, `profile`.
- `plan_feature_map` define quais features entram em cada plano (`free`, `pro`, `destaque`).

Isso espelha a regra do frontend em `PLAN_FEATURES` e garante o mesmo gating no backend.【F:src/lib/planUtils.ts†L1-L30】

## 5) Painéis do mini-site

Os painéis do mini-site ficam em `mini_site_panels`:

- `panel_key` identifica o tipo (ex: `about`, `gallery`, `reviews`, `events`, `hours`, `menu`).
- `content` guarda o JSON específico do painel.
- `position` controla a ordem no mini-site.

Esses dados são vinculados ao plano via `plan_feature_map` (ex: painel `gallery` exige feature `gallery`).

## 6) Integração com Google Maps

- `businesses.google_place_id` e `businesses.maps_url` guardam a referência para o Maps.
- `latitude`, `longitude`, `location` (geography) permitem buscas por distância.

Exemplo de busca por raio:

```sql
SELECT *
FROM businesses
WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3);
```

## 7) Checklist para colocar no ar

- [ ] Rodar `schema.sql` no banco de produção
- [ ] Popular `plan_features` e `plan_feature_map`
- [ ] Criar categorias e chips iniciais
- [ ] Ajustar API para retornar `chips` e `plan` do negócio
- [ ] Alimentar `mini_site_panels` conforme o plano

