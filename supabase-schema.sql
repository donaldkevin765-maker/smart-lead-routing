-- Smart Lead Routing — schema PostGIS (Supabase Free Tier)
CREATE EXTENSION IF NOT EXISTS postgis;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('pending', 'assigned', 'accepted', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  telegram_chat_id VARCHAR(100),
  services_offered TEXT[] NOT NULL DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  coverage_radius_km INT DEFAULT 20,
  rating NUMERIC(2,1) DEFAULT 5.0,
  max_daily_leads INT DEFAULT 10,
  leads_today INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partners_location ON partners USING GIST(location);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50) NOT NULL,
  user_email VARCHAR(255),
  raw_prompt TEXT NOT NULL,
  extracted_service VARCHAR(100),
  urgency_level VARCHAR(20),
  summary TEXT,
  user_location GEOGRAPHY(POINT, 4326) NOT NULL,
  status lead_status DEFAULT 'pending',
  assigned_partner_id UUID REFERENCES partners(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads USING GIST(user_location);

CREATE TABLE IF NOT EXISTS lead_dispatch_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  status lead_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_lead ON lead_dispatch_attempts(lead_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status_timeout ON lead_dispatch_attempts(status, timeout_at);

CREATE OR REPLACE FUNCTION match_smart_partners(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  required_service TEXT,
  urgency TEXT,
  excluded_partner_ids UUID[] DEFAULT '{}'
)
RETURNS TABLE (
  partner_id UUID,
  partner_name TEXT,
  partner_email TEXT,
  partner_phone TEXT,
  partner_telegram_chat_id TEXT,
  distance_km DOUBLE PRECISION,
  final_score DOUBLE PRECISION
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS partner_id,
    p.name::TEXT AS partner_name,
    p.email::TEXT AS partner_email,
    p.phone::TEXT AS partner_phone,
    p.telegram_chat_id::TEXT AS partner_telegram_chat_id,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) / 1000.0 AS distance_km,
    (
      (100 - (ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) / 1000.0)) * 0.4 +
      (p.rating * 10) * 0.4 +
      (10 - p.leads_today) * 0.2
    ) AS final_score
  FROM partners p
  WHERE p.is_active = true
    AND p.leads_today < p.max_daily_leads
    AND required_service = ANY(p.services_offered)
    AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, p.coverage_radius_km * 1000)
    AND NOT (p.id = ANY(excluded_partner_ids))
  ORDER BY final_score DESC;
END;
$$;
