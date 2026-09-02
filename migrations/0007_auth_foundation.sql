PRAGMA foreign_keys = ON;

-- Secure authentication foundation for EVOOT.
-- Login delivery (magic link / one-time code) will be wired separately.
-- Only hashes are stored for authentication secrets and sessions.

CREATE TABLE IF NOT EXISTS auth_login_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL DEFAULT 'LOGIN',
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  active_organization_id TEXT,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (active_organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_email_expires
  ON auth_login_challenges(email,expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_expires
  ON auth_sessions(user_id,expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_org
  ON auth_sessions(active_organization_id,revoked_at);
