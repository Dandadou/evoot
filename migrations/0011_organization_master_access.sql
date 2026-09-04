PRAGMA foreign_keys = ON;

-- Master contacts are the EVOOT-side owners of an organization account.
-- They are intentionally separate from the users/trainers/learners that
-- the organization manages itself from its administration portal.
CREATE TABLE IF NOT EXISTS organization_master_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(organization_id,email)
);

CREATE INDEX IF NOT EXISTS idx_org_master_access_email
  ON organization_master_access(email,status);

CREATE INDEX IF NOT EXISTS idx_org_master_access_org
  ON organization_master_access(organization_id,status);
