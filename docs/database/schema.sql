-- PostgreSQL + PostGIS schema for Procurauai
-- Provides businesses, listings, chips, and mini-site panels.

CREATE EXTENSION IF NOT EXISTS postgis;

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

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  neighborhood TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  instagram TEXT,
  logo_url TEXT,
  cover_images JSONB DEFAULT '[]',
  hours_text TEXT,
  is_open_now BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS business_chips (
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  chip_id UUID NOT NULL REFERENCES chips(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, chip_id)
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  type listing_type NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(12,2),
  neighborhood TEXT,
  images JSONB DEFAULT '[]',
  whatsapp TEXT,
  description TEXT,
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  price_text TEXT NOT NULL,
  valid_until DATE NOT NULL,
  image_url TEXT NOT NULL,
  whatsapp TEXT,
  is_sponsored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  price_text TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  whatsapp TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS mini_site_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  panel_key TEXT NOT NULL,
  title TEXT,
  content JSONB DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mini_site_panels_business_idx ON mini_site_panels (business_id);
