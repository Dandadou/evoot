PRAGMA foreign_keys = ON;

-- A training remains owned by its creator organization through trainings.organization_id.
-- Client organizations only gain access through an explicit assignment.
CREATE TABLE IF NOT EXISTS organization_trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  training_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | SUSPENDED | REVOKED
  assigned_by_user_id INTEGER,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(organization_id,training_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_trainings_org
ON organization_trainings(organization_id,status,training_id);

CREATE INDEX IF NOT EXISTS idx_organization_trainings_training
ON organization_trainings(training_id,status,organization_id);
