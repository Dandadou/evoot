PRAGMA foreign_keys = ON;

-- Adds a human-entered one-time code alongside the existing magic-link token.
ALTER TABLE auth_login_challenges ADD COLUMN code_hash TEXT;
ALTER TABLE auth_login_challenges ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_auth_challenges_email_code
  ON auth_login_challenges(email,code_hash,expires_at);
