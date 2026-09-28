-- 1. Erweiterung der User/Profile-Tabelle (Haushalts-Daten)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS anzahl_personen int DEFAULT 0,
ADD COLUMN IF NOT EXISTS anwesenheit_tage int DEFAULT 0,
ADD COLUMN IF NOT EXISTS anzahl_zelte int DEFAULT 0,
ADD COLUMN IF NOT EXISTS zelt_naechte int DEFAULT 0,
ADD COLUMN IF NOT EXISTS anzahl_autos int DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_naechte int DEFAULT 0,
ADD COLUMN IF NOT EXISTS anzahl_pavillons int DEFAULT 0,
ADD COLUMN IF NOT EXISTS pavillon_naechte int DEFAULT 0,
ADD COLUMN IF NOT EXISTS strom_genutzt boolean DEFAULT false;

-- 2. Neue Tabelle: global_settings (Tarife & System-Status)
CREATE TABLE IF NOT EXISTS global_settings (
  id integer PRIMARY KEY DEFAULT 1,
  preis_person_nacht numeric DEFAULT 0,
  preis_zelt_nacht numeric DEFAULT 0,
  preis_auto_nacht numeric DEFAULT 0,
  preis_pavillon_nacht numeric DEFAULT 0,
  preis_strom_person_tag numeric DEFAULT 0.60,
  kuehlwagen_gesamtkosten numeric DEFAULT 0,
  abrechnung_freigegeben boolean DEFAULT false,
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read global_settings" ON global_settings;
CREATE POLICY "Everyone can read global_settings" 
ON global_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update global_settings" ON global_settings;
CREATE POLICY "Admins can update global_settings" 
ON global_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can insert global_settings" ON global_settings;
CREATE POLICY "Admins can insert global_settings" 
ON global_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Initiale Zeile einfügen
INSERT INTO global_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Neue Tabellen für das Brötchen-Vorbestellsystem (Session-Logik)
CREATE TABLE IF NOT EXISTS broetchen_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  completed_at timestamp with time zone
);

ALTER TABLE broetchen_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read broetchen_sessions" ON broetchen_sessions;
CREATE POLICY "Everyone can read broetchen_sessions" 
ON broetchen_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage broetchen_sessions" ON broetchen_sessions;
CREATE POLICY "Admins can manage broetchen_sessions" 
ON broetchen_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE TABLE IF NOT EXISTS broetchen_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES broetchen_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES broetchen_items(id) ON DELETE CASCADE,
  menge int NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE broetchen_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read broetchen_orders" ON broetchen_orders;
CREATE POLICY "Everyone can read broetchen_orders" 
ON broetchen_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own orders" ON broetchen_orders;
CREATE POLICY "Users can insert their own orders" 
ON broetchen_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON broetchen_orders;
CREATE POLICY "Users can update their own orders" 
ON broetchen_orders FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own orders" ON broetchen_orders;
CREATE POLICY "Users can delete their own orders" 
ON broetchen_orders FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage broetchen_orders" ON broetchen_orders;
CREATE POLICY "Admins can manage broetchen_orders" 
ON broetchen_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
