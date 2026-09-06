-- Punto 4: catalogo multi-settore ordinato (Vertical > Categoria > Servizio)
-- LOGICA: aggiungere un settore = 1 INSERT qui, zero codice. Il match, Gemini e la UI leggono da questa tabella.
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical VARCHAR(50) NOT NULL,
  category VARCHAR(80) NOT NULL,
  slug VARCHAR(80) UNIQUE NOT NULL,
  label VARCHAR(120) NOT NULL,
  keywords TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_services_vertical ON services(vertical);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- Seed 4 verticali (Casa, Fitness, Benessere, Servizi) — ordinati, estendibili
INSERT INTO services (vertical, category, slug, label, keywords) VALUES
-- Casa
('casa','idraulica','idraulica','Idraulica','perdita acqua tubo rubinetto scarico allagamento'),
('casa','caldaia','caldaia','Caldaia','caldaia blocco errore e35 riscaldamento acqua calda'),
('casa','elettricista','elettricista','Elettricista','corrente presa corto scossa interruttore luce'),
('casa','climatizzazione','climatizzazione','Climatizzazione','clima condizionatore aria calda fredda'),
('casa','fabbro','fabbro','Fabbro','serratura porta bloccata chiave persa'),
('casa','muratura','muratura','Muratura','muro ristrutturazione piastrelle'),
-- Fitness
('fitness','palestre','palestra','Palestra','palestra abbonamento sala pesi corsi fitness sauna'),
('fitness','personal','personal-trainer','Personal Trainer','personal trainer scheda allenamento'),
('fitness','piscina','piscina','Piscina','piscina nuoto corsi acqua'),
-- Benessere
('benessere','parrucchiere','parrucchiere','Parrucchiere','taglio piega colore parrucchiere'),
('benessere','estetista','estetista','Estetista','ceretta manicure pedicure estetica'),
('benessere','massaggi','massaggi','Massaggi','massaggio rilassante decontratturante'),
-- Servizi
('servizi','pulizie','pulizie','Pulizie','pulizie casa ufficio condominio'),
('servizi','traslochi','traslochi','Traslochi','trasloco facchini furgone'),
('servizi','giardinaggio','giardinaggio','Giardinaggio','giardino potatura prato')
ON CONFLICT (slug) DO NOTHING;
