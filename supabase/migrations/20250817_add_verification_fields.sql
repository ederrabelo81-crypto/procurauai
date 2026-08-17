-- Migration: Add verification fields to businesses table
-- Date: 2025-08-17
-- Purpose: Support manual validation workflow without Google API dependency
-- 
-- This migration adds fields to track data source and verification status,
-- enabling the app to work without continuous Google Maps API consumption.

-- Add new columns for data quality control
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'google_places',
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN businesses.data_source IS 'Origem do dado: google_places, manual, user_submission, partnership';
COMMENT ON COLUMN businesses.verification_status IS 'Status de validação: pending, verified, rejected, needs_update';
COMMENT ON COLUMN businesses.verified_at IS 'Data/hora da validação manual';
COMMENT ON COLUMN businesses.verified_by IS 'ID do usuário que validou (admin)';
COMMENT ON COLUMN businesses.last_synced_at IS 'Última sincronização com Google Places (se aplicável)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS businesses_verification_status_idx 
ON businesses (verification_status)
WHERE verification_status != 'verified';

CREATE INDEX IF NOT EXISTS businesses_city_status_idx 
ON businesses (city, verification_status);

-- Create index for filtering by city (important for multi-city expansion)
CREATE INDEX IF NOT EXISTS businesses_city_idx 
ON businesses (city);

-- Update existing businesses to have proper defaults
UPDATE businesses 
SET 
  data_source = COALESCE(data_source, 'google_places'),
  verification_status = CASE 
    WHEN is_verified = true THEN 'verified'
    ELSE 'pending'
  END,
  verified_at = CASE 
    WHEN is_verified = true AND verified_at IS NULL THEN NOW()
    ELSE verified_at
  END
WHERE data_source IS NULL OR verification_status IS NULL;

-- Optional: Create enum type for stricter validation (commented out for now)
-- Uncomment if you want to enforce specific values at database level
/*
DO $$ BEGIN
  CREATE TYPE business_data_source AS ENUM ('google_places', 'manual', 'user_submission', 'partnership');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE business_verification_status AS ENUM ('pending', 'verified', 'rejected', 'needs_update');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Future: migrate to enum types
-- ALTER TABLE businesses 
--   ALTER COLUMN data_source TYPE business_data_source 
--   USING data_source::business_data_source;
-- ALTER TABLE businesses 
--   ALTER COLUMN verification_status TYPE business_verification_status 
--   USING verification_status::business_verification_status;
*/
