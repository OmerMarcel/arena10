-- ============================================================
-- ARENA 10 — Schéma PostgreSQL : La Mémoire Permanente
-- Stockage persistant des utilisateurs et de leur espace personnel
-- ============================================================

-- 1. Table des Utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  salt TEXT NOT NULL DEFAULT '',
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100) DEFAULT 'Analyste ARENA',
  role VARCHAR(32) DEFAULT 'user',
  avatar_color VARCHAR(16) DEFAULT '#f59a23',
  avatar_url TEXT DEFAULT NULL,
  google_id VARCHAR(128) UNIQUE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Migration : ajout des colonnes Google OAuth si elles n'existent pas encore
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='google_id') THEN
    ALTER TABLE users ADD COLUMN google_id VARCHAR(128) UNIQUE DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='salt') THEN
    ALTER TABLE users ADD COLUMN salt TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Table des Préférences & Réglages Personnels
CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  odds_format VARCHAR(16) DEFAULT 'decimal',
  currency VARCHAR(8) DEFAULT 'EUR',
  min_confidence INT DEFAULT 75,
  ai_model VARCHAR(32) DEFAULT 'v2.1_balanced',
  theme VARCHAR(16) DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Favoris de l'Espace Personnel (Clubs & Ligues)
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(16) NOT NULL,
  item_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_favorite UNIQUE (user_id, type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);

-- 4. Table du Carnet de Paris Personnel (Mon Carnet)
CREATE TABLE IF NOT EXISTS user_bets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id INT,
  match_name VARCHAR(255) NOT NULL,
  league VARCHAR(100),
  pick VARCHAR(64) NOT NULL,
  odds NUMERIC(5,2) NOT NULL,
  stake NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  result VARCHAR(16) DEFAULT 'pending',
  profit NUMERIC(10,2) DEFAULT 0.00,
  date VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bets_user ON user_bets(user_id);

-- 5. Table des Pronostics Clôturés et Archivés
CREATE TABLE IF NOT EXISTS prediction_history (
  id VARCHAR(128) PRIMARY KEY,
  date VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(64),
  total_odds NUMERIC(5,2) NOT NULL,
  total_confidence INT NOT NULL,
  status VARCHAR(16) NOT NULL,
  legs_json JSONB NOT NULL,
  justification TEXT,
  source VARCHAR(32),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pred_history_date ON prediction_history(date);

