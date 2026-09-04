PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  uploaded_by_user_id INTEGER,
  purpose TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_uploads_org ON uploads(organization_id,status,purpose);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(uploaded_by_user_id,status);
