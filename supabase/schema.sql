-- Supabase PostgreSQL schema for Procurauai

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ==================== ENUM TYPES ====================
create type business_plan as enum ('free', 'pro', 'destaque');
create type listing_type as enum ('venda', 'doacao');
create type place_price_level as enum ('Grátis', '$', '$$', '$$$');
create type car_fuel_type as enum ('flex', 'gasolina', 'diesel', 'hibrido', 'eletrico');
create type car_transmission as enum ('manual', 'automatico', 'cvt');
create type car_condition as enum ('novo', 'seminovo', 'usado');
create type car_seller_type as enum ('concessionaria', 'particular');
create type job_employment_type as enum ('CLT', 'PJ', 'Estágio', 'Freelancer');
create type job_work_model as enum ('presencial', 'hibrido', 'remoto');
create type real_estate_transaction_type as enum ('alugar', 'comprar');
create type real_estate_property_type as enum ('apartamento', 'casa', 'kitnet', 'terreno', 'comercial');
create type real_estate_furnished as enum ('mobiliado', 'semimobiliado', 'vazio');
create type real_estate_availability as enum ('imediata', 'negociar');
create type obituary_status as enum ('pending', 'approved');

-- ==================== HELPERS ====================
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_slug()
returns trigger
language plpgsql
as $$
declare
  source text;
begin
  source := coalesce(to_jsonb(new) ->> tg_argv[0], '');
  if source <> '' then
    new.slug := public.slugify(source);
  end if;
  return new;
end;
$$;

create or replace function public.set_business_category_slug()
returns trigger
language plpgsql
as $$
declare
  input_text text;
begin
  input_text := lower(coalesce(new.name, '') || ' ' || coalesce(new.category, ''));

  if input_text ~ 'restaurante|lanchonete|pizzaria|hamburguer|bar\\b|cafe|café|padaria|panificadora|confeitaria|gastro|sorveteria' then
    new.category_slug := 'comer-agora';
  elsif input_text ~ 'madeireira|material de construcao|materiais de construção|construcao|construção|loja|mercado|farmacia|farmácia|autopecas|autopeças|pet shop|boutique' then
    new.category_slug := 'negocios';
  else
    new.category_slug := coalesce(new.category_slug, 'servicos');
  end if;

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select auth.role() = 'service_role'
    or auth.uid() = '00000000-0000-0000-0000-000000000000';
$$;

-- ==================== TABLES ====================
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text,
  name text not null,
  category text not null,
  category_slug text not null,
  tags text[] not null default '{}',
  neighborhood text not null,
  hours text not null,
  phone text,
  whatsapp text not null,
  cover_images text[] not null default '{}',
  is_open_now boolean not null default false,
  is_verified boolean default false,
  description text,
  address text,
  plan business_plan default 'free',
  website text,
  instagram text,
  logo text,
  google_place_id text,
  lat numeric,
  lng numeric
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text,
  type listing_type not null,
  title text not null,
  price numeric,
  neighborhood text not null,
  images text[] not null default '{}',
  whatsapp text not null,
  created_at timestamptz not null,
  description text,
  is_highlighted boolean default false
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  subtitle text,
  price_text text not null,
  valid_until timestamptz not null,
  business_id uuid,
  business_name text,
  image text not null,
  whatsapp text not null,
  is_sponsored boolean default false
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  date_time timestamptz not null,
  location text not null,
  price_text text not null,
  tags text[] not null default '{}',
  image text not null,
  whatsapp text,
  description text
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  tag text not null,
  snippet text not null,
  date timestamptz not null,
  image text
);

create table if not exists public.obituaries (
  id uuid primary key default gen_random_uuid(),
  slug text,
  name text not null,
  age integer,
  date timestamptz not null,
  wake_location text not null,
  burial_location text not null,
  burial_date_time timestamptz not null,
  message text,
  status obituary_status not null default 'pending'
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  slug text,
  name text not null,
  city text not null,
  neighborhood text not null,
  lat numeric,
  lng numeric,
  cover_image text not null,
  gallery text[] not null default '{}',
  short_description text not null,
  type_tag text not null,
  opening_hours text,
  price_level place_price_level not null,
  best_time_to_go text,
  duration_suggestion text,
  highlights text[] not null default '{}',
  rating numeric not null,
  reviews_count integer not null,
  tags text[] not null default '{}',
  google_place_id text
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  brand text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  mileage_km integer not null,
  fuel car_fuel_type not null,
  transmission car_transmission not null,
  condition car_condition not null,
  doors integer not null,
  color text not null,
  city text not null,
  neighborhood text not null,
  seller_type car_seller_type not null,
  whatsapp text not null,
  phone text,
  cover_image text not null,
  gallery text[] not null default '{}',
  description text not null,
  features text[] not null default '{}',
  tags text[] not null default '{}'
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text,
  job_title text not null,
  company_name text not null,
  city text not null,
  neighborhood text,
  employment_type job_employment_type not null,
  work_model job_work_model not null,
  salary_range text,
  benefits text[] not null default '{}',
  description text not null,
  requirements text[] not null default '{}',
  differentials text[] not null default '{}',
  how_to_apply text not null,
  whatsapp text,
  email text,
  posted_at timestamptz not null,
  expires_at timestamptz,
  tags text[] not null default '{}',
  logo text
);

create table if not exists public.real_estate (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  transaction_type real_estate_transaction_type not null,
  property_type real_estate_property_type not null,
  price numeric,
  rent_price numeric,
  condo_fee numeric,
  bedrooms integer not null,
  bathrooms integer not null,
  parking_spots integer not null,
  area_m2 numeric not null,
  pet_friendly boolean not null,
  furnished real_estate_furnished not null,
  city text not null,
  neighborhood text not null,
  lat numeric,
  lng numeric,
  cover_image text not null,
  gallery text[] not null default '{}',
  description text not null,
  amenities text[] not null default '{}',
  whatsapp text not null,
  phone text,
  availability real_estate_availability not null,
  tags text[] not null default '{}'
);

-- ==================== TRIGGERS ====================
create trigger businesses_set_slug
before insert or update on public.businesses
for each row execute function public.set_slug('name');

create trigger listings_set_slug
before insert or update on public.listings
for each row execute function public.set_slug('title');

create trigger deals_set_slug
before insert or update on public.deals
for each row execute function public.set_slug('title');

create trigger events_set_slug
before insert or update on public.events
for each row execute function public.set_slug('title');

create trigger news_set_slug
before insert or update on public.news
for each row execute function public.set_slug('title');

create trigger obituaries_set_slug
before insert or update on public.obituaries
for each row execute function public.set_slug('name');

create trigger places_set_slug
before insert or update on public.places
for each row execute function public.set_slug('name');

create trigger cars_set_slug
before insert or update on public.cars
for each row execute function public.set_slug('title');

create trigger jobs_set_slug
before insert or update on public.jobs
for each row execute function public.set_slug('job_title');

create trigger real_estate_set_slug
before insert or update on public.real_estate
for each row execute function public.set_slug('title');

create trigger businesses_set_category_slug
before insert or update on public.businesses
for each row execute function public.set_business_category_slug();

-- ==================== INDEXES ====================
create index if not exists businesses_tags_gin on public.businesses using gin (tags);
create index if not exists events_tags_gin on public.events using gin (tags);
create index if not exists places_tags_gin on public.places using gin (tags);
create index if not exists cars_tags_gin on public.cars using gin (tags);
create index if not exists cars_features_gin on public.cars using gin (features);
create index if not exists jobs_tags_gin on public.jobs using gin (tags);
create index if not exists real_estate_tags_gin on public.real_estate using gin (tags);

-- ==================== RLS ====================
alter table public.businesses enable row level security;
alter table public.listings enable row level security;
alter table public.deals enable row level security;
alter table public.events enable row level security;
alter table public.news enable row level security;
alter table public.obituaries enable row level security;
alter table public.places enable row level security;
alter table public.cars enable row level security;
alter table public.jobs enable row level security;
alter table public.real_estate enable row level security;

create policy "public read businesses" on public.businesses
  for select using (true);
create policy "admin write businesses" on public.businesses
  for insert with check (public.is_admin());
create policy "admin update businesses" on public.businesses
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete businesses" on public.businesses
  for delete using (public.is_admin());

create policy "public read listings" on public.listings
  for select using (true);
create policy "admin write listings" on public.listings
  for insert with check (public.is_admin());
create policy "admin update listings" on public.listings
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete listings" on public.listings
  for delete using (public.is_admin());

create policy "public read deals" on public.deals
  for select using (true);
create policy "admin write deals" on public.deals
  for insert with check (public.is_admin());
create policy "admin update deals" on public.deals
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete deals" on public.deals
  for delete using (public.is_admin());

create policy "public read events" on public.events
  for select using (true);
create policy "admin write events" on public.events
  for insert with check (public.is_admin());
create policy "admin update events" on public.events
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete events" on public.events
  for delete using (public.is_admin());

create policy "public read news" on public.news
  for select using (true);
create policy "admin write news" on public.news
  for insert with check (public.is_admin());
create policy "admin update news" on public.news
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete news" on public.news
  for delete using (public.is_admin());

create policy "public read obituaries" on public.obituaries
  for select using (true);
create policy "admin write obituaries" on public.obituaries
  for insert with check (public.is_admin());
create policy "admin update obituaries" on public.obituaries
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete obituaries" on public.obituaries
  for delete using (public.is_admin());

create policy "public read places" on public.places
  for select using (true);
create policy "admin write places" on public.places
  for insert with check (public.is_admin());
create policy "admin update places" on public.places
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete places" on public.places
  for delete using (public.is_admin());

create policy "public read cars" on public.cars
  for select using (true);
create policy "admin write cars" on public.cars
  for insert with check (public.is_admin());
create policy "admin update cars" on public.cars
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete cars" on public.cars
  for delete using (public.is_admin());

create policy "public read jobs" on public.jobs
  for select using (true);
create policy "admin write jobs" on public.jobs
  for insert with check (public.is_admin());
create policy "admin update jobs" on public.jobs
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete jobs" on public.jobs
  for delete using (public.is_admin());

create policy "public read real_estate" on public.real_estate
  for select using (true);
create policy "admin write real_estate" on public.real_estate
  for insert with check (public.is_admin());
create policy "admin update real_estate" on public.real_estate
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete real_estate" on public.real_estate
  for delete using (public.is_admin());
