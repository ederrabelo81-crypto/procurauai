-- PostgreSQL + PostGIS schema for Procurauai (Supabase-ready)
-- Focus: business discovery (incl. Comer Agora), listings, deals, events, etc.
-- Notes:
-- - Keeps normalized categories table (category_id) AND denormalized columns
--   (category/category_slug) to match frontend queries.
-- - Adds slug helpers + triggers for consistent slugs and category slugs.

-- =========================
-- 0) EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =========================
-- 1) TYPES (ENUMS)
-- =========================
DO $$ BEGIN
  CREATE TYPE business_plan AS ENUM ('free', 'pro', 'destaque');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('venda', 'doacao');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =========================
-- 2) HELPERS
-- =========================
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(unaccent(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  source text;
BEGIN
  source := coalesce(to_jsonb(NEW) ->> TG_ARGV[0], '');
  IF source <> '' THEN
    NEW.slug := public.slugify(source);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_business_category_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  input_text text;
BEGIN
  input_text := lower(coalesce(NEW.name, '') || ' ' || coalesce(NEW.category, ''));

  IF input_text ~ 'restaurante|lanchonete|pizzaria|hamburguer|bar\\b|cafe|café|padaria|panificadora|confeitaria|gastro|sorveteria' THEN
    NEW.category_slug := 'comer-agora';
  ELSIF input_text ~ 'madeireira|material de construcao|materiais de construção|construcao|construção|loja|mercado|farmacia|farmácia|autopecas|autopeças|pet shop|boutique' THEN
    NEW.category_slug := 'negocios';
  ELSE
    NEW.category_slug := coalesce(NEW.category_slug, 'servicos');
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_business_location_from_latlng()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.role() = 'service_role'
    OR auth.uid() = '00000000-0000-0000-0000-000000000000';
$$;

-- =========================
-- 3) BASE TABLES
-- =========================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  group_name TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 4) PLANS / FEATURES
-- =========================
CREATE TABLE IF NOT EXISTS plan_features (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_feature_map (
  plan business_plan NOT NULL,
  feature_key TEXT NOT NULL REFERENCES plan_features(key) ON DELETE CASCADE,
  PRIMARY KEY (plan, feature_key)
);

-- =========================
-- 5) BUSINESSES
-- =========================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'Serviços',
  category_slug TEXT NOT NULL DEFAULT 'servicos',
  tags TEXT[] NOT NULL DEFAULT '{}',
  neighborhood TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  instagram TEXT,
  logo TEXT,
  logo_url TEXT,
  cover_images TEXT[] NOT NULL DEFAULT '{}',
  hours TEXT,
  is_open_now BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  plan business_plan NOT NULL DEFAULT 'free',
  google_place_id TEXT,
  maps_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS businesses_location_idx ON businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS businesses_category_idx ON businesses (category_id);
CREATE INDEX IF NOT EXISTS businesses_plan_idx ON businesses (plan);
CREATE INDEX IF NOT EXISTS businesses_tags_gin ON businesses USING GIN (tags);
CREATE INDEX IF NOT EXISTS businesses_category_slug_idx ON businesses (category_slug);

CREATE TABLE IF NOT EXISTS business_chips (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  chip_id UUID NOT NULL REFERENCES chips(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, chip_id)
);

-- =========================
-- 6) LISTINGS / CLASSIFICADOS
-- =========================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  type listing_type NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(12,2),
  neighborhood TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  whatsapp TEXT,
  description TEXT,
  is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 7) DEALS / OFERTAS
-- =========================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  business_name TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  price_text TEXT NOT NULL,
  valid_until DATE NOT NULL,
  image_url TEXT NOT NULL,
  image TEXT,
  whatsapp TEXT,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 8) EVENTS
-- =========================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  price_text TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  image TEXT,
  whatsapp TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_tags_gin ON events USING GIN (tags);

-- =========================
-- 9) REVIEWS
-- =========================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 10) HOURS (OPTIONAL)
-- =========================
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE
);

-- =========================
-- 11) MINI-SITE PANELS
-- =========================
CREATE TABLE IF NOT EXISTS mini_site_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  panel_key TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mini_site_panels_business_idx ON mini_site_panels (business_id);

-- =========================
-- 12) TRIGGERS
-- =========================
DROP TRIGGER IF EXISTS trg_set_updated_at_businesses ON businesses;
CREATE TRIGGER trg_set_updated_at_businesses
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_location_businesses ON businesses;
CREATE TRIGGER trg_set_location_businesses
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION public.set_business_location_from_latlng();

DROP TRIGGER IF EXISTS businesses_set_slug ON businesses;
CREATE TRIGGER businesses_set_slug
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION public.set_slug('name');

DROP TRIGGER IF EXISTS businesses_set_category_slug ON businesses;
CREATE TRIGGER businesses_set_category_slug
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION public.set_business_category_slug();

DROP TRIGGER IF EXISTS listings_set_slug ON listings;
CREATE TRIGGER listings_set_slug
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION public.set_slug('title');

DROP TRIGGER IF EXISTS deals_set_slug ON deals;
CREATE TRIGGER deals_set_slug
BEFORE INSERT OR UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION public.set_slug('title');

DROP TRIGGER IF EXISTS events_set_slug ON events;
CREATE TRIGGER events_set_slug
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION public.set_slug('title');

-- =========================
-- 13) RLS (PUBLIC READ)
-- =========================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read businesses" ON businesses
  FOR SELECT USING (true);
CREATE POLICY "admin write businesses" ON businesses
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin update businesses" ON businesses
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete businesses" ON businesses
  FOR DELETE USING (public.is_admin());

CREATE POLICY "public read listings" ON listings
  FOR SELECT USING (true);
CREATE POLICY "admin write listings" ON listings
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin update listings" ON listings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete listings" ON listings
  FOR DELETE USING (public.is_admin());

CREATE POLICY "public read deals" ON deals
  FOR SELECT USING (true);
CREATE POLICY "admin write deals" ON deals
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin update deals" ON deals
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete deals" ON deals
  FOR DELETE USING (public.is_admin());

CREATE POLICY "public read events" ON events
  FOR SELECT USING (true);
CREATE POLICY "admin write events" ON events
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin update events" ON events
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete events" ON events
  FOR DELETE USING (public.is_admin());
