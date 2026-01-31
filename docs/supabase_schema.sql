-- Supabase schema for Procurauai
-- Enable required extension for UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  lat double precision,
  lng double precision,
  google_place_id text,
  whatsapp text,
  image_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  author text,
  created_at timestamptz not null default now()
);

create table if not exists public.obituaries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date,
  death_date date,
  photo_url text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.real_estate (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  price numeric(12, 2),
  address text,
  lat double precision,
  lng double precision,
  image_url text,
  contact_phone text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.businesses enable row level security;
alter table public.news enable row level security;
alter table public.obituaries enable row level security;
alter table public.real_estate enable row level security;

-- Public read access
create policy "Public read businesses" on public.businesses
  for select
  using (true);

create policy "Public read news" on public.news
  for select
  using (true);

create policy "Public read obituaries" on public.obituaries
  for select
  using (true);

create policy "Public read real_estate" on public.real_estate
  for select
  using (true);

-- Admin-only write access (authenticated + is_admin claim)
create policy "Admin write businesses" on public.businesses
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin update businesses" on public.businesses
  for update
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true)
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin delete businesses" on public.businesses
  for delete
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin write news" on public.news
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin update news" on public.news
  for update
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true)
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin delete news" on public.news
  for delete
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin write obituaries" on public.obituaries
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin update obituaries" on public.obituaries
  for update
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true)
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin delete obituaries" on public.obituaries
  for delete
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin write real_estate" on public.real_estate
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin update real_estate" on public.real_estate
  for update
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true)
  with check ((auth.jwt() ->> 'is_admin')::boolean = true);

create policy "Admin delete real_estate" on public.real_estate
  for delete
  to authenticated
  using ((auth.jwt() ->> 'is_admin')::boolean = true);
