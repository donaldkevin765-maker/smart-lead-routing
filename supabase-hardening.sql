-- PROFESSIONAL HARDENING (senza rompere il live)
-- WHY RLS: anche se le API sono protette, il DB non deve mai fidarsi del client. Se una chiave ANON leaks, RLS blocca.
-- WHY UNIQUE: anti-farming (1 email = 1 partner) e idempotenza (1 lead non può avere 2 accept dello stesso partner).
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_dispatch_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy minime professionali: lettura pubblica per services (serve al form), resto solo service_role
DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read" ON services FOR SELECT USING (is_active = true);

-- Partner: 1 email unica = 1 account (anti-farming)
CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_email_unique ON partners (lower(email));

-- Dispatch: 1 partner non può accettare 2 volte lo stesso lead
CREATE UNIQUE INDEX IF NOT EXISTS idx_dispatch_lead_partner_unique ON lead_dispatch_attempts (lead_id, partner_id);
