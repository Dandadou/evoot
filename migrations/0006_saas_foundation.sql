PRAGMA foreign_keys = ON;

-- ÉVOOT SaaS foundation. This migration intentionally creates the future
-- architecture without forcing the current prototype to use every table yet.

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'BUSINESS', -- BUSINESS | SCHOOL | ORGANIZATION | INTERNAL
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  locale TEXT NOT NULL DEFAULT 'fr-CA',
  branding_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO organizations (id,name,type) VALUES
('evoot','ÉVOOT','INTERNAL'),
('evolution-pme','Évolution PME','BUSINESS');

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  locale TEXT NOT NULL DEFAULT 'fr-CA',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- EVOOT_ADMIN | ORG_ADMIN | TRAINER | LEARNER
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(organization_id,user_id,role)
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  billing_period TEXT NOT NULL DEFAULT 'MONTHLY',
  price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'CAD',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_entitlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  limit_value INTEGER,
  unit TEXT,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  UNIQUE(plan_id,feature_key)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'TRIAL', -- TRIAL | ACTIVE | PAST_DUE | CANCELED
  provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  trial_ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS usage_counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  period_key TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(organization_id,metric_key,period_key)
);

CREATE TABLE IF NOT EXISTS cohorts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  training_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cohort_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cohort_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'LEARNER', -- LEARNER | TRAINER
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(cohort_id,user_id,role)
);

CREATE TABLE IF NOT EXISTS course_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  cohort_id INTEGER,
  training_id INTEGER NOT NULL,
  trainer_user_id INTEGER,
  title TEXT,
  delivery_mode TEXT NOT NULL DEFAULT 'IN_PERSON', -- IN_PERSON | VIRTUAL | HYBRID | SELF_PACED
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  starts_at TEXT,
  ends_at TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  recurrence_rule TEXT,
  classroom_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE SET NULL,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS classrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'VIRTUAL', -- PHYSICAL | VIRTUAL | HYBRID
  capacity INTEGER,
  location_text TEXT,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  training_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  cohort_id INTEGER,
  status TEXT NOT NULL DEFAULT 'ENROLLED',
  available_from TEXT,
  available_until TEXT,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS learner_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrollment_id INTEGER NOT NULL,
  block_position INTEGER NOT NULL DEFAULT 0,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  state_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  UNIQUE(enrollment_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TEXT,
  left_at TEXT,
  status TEXT NOT NULL DEFAULT 'EXPECTED',
  FOREIGN KEY (course_session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(course_session_id,user_id)
);

CREATE TABLE IF NOT EXISTS session_recordings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  course_session_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSING',
  storage_key TEXT,
  duration_seconds INTEGER,
  available_from TEXT,
  available_until TEXT,
  access_policy TEXT NOT NULL DEFAULT 'ENROLLED_ONLY',
  auto_expire_rule TEXT, -- e.g. NEXT_SESSION | DATE | DAYS_AFTER_SESSION
  hidden_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (course_session_id) REFERENCES course_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classroom_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  course_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- HAND_RAISE | PUBLIC_QUESTION | PRIVATE_QUESTION | PUBLIC_CHAT | ANNOUNCEMENT
  body TEXT,
  visibility TEXT NOT NULL DEFAULT 'CLASS', -- CLASS | TRAINER_ONLY
  status TEXT NOT NULL DEFAULT 'OPEN',
  shared_anonymously_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (course_session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  course_session_id INTEGER,
  training_id INTEGER,
  uploaded_by_user_id INTEGER,
  title TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  visibility TEXT NOT NULL DEFAULT 'ENROLLED', -- ENROLLED | INDIVIDUAL | TRAINERS
  available_from TEXT,
  available_until TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (course_session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resource_recipients (
  resource_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY(resource_id,user_id),
  FOREIGN KEY (resource_id) REFERENCES course_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_org ON organization_members(organization_id,role);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id,status);
CREATE INDEX IF NOT EXISTS idx_cohorts_org ON cohorts(organization_id,status);
CREATE INDEX IF NOT EXISTS idx_course_sessions_schedule ON course_sessions(organization_id,starts_at,status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id,status);
CREATE INDEX IF NOT EXISTS idx_recordings_session ON session_recordings(course_session_id,status);
CREATE INDEX IF NOT EXISTS idx_interactions_session ON classroom_interactions(course_session_id,status,type);
CREATE INDEX IF NOT EXISTS idx_resources_session ON course_resources(course_session_id,deleted_at);

-- Seed a non-commercial internal plan. Commercial pricing/limits remain configurable later.
INSERT OR IGNORE INTO plans (id,name,status,billing_period,price_cents,currency)
VALUES ('internal','Interne ÉVOOT','ACTIVE','MONTHLY',0,'CAD');

INSERT OR IGNORE INTO plan_entitlements (plan_id,feature_key,enabled,limit_value,unit) VALUES
('internal','TRAINING_BUILDER',1,NULL,NULL),
('internal','EVOOT_AI',1,NULL,NULL),
('internal','LIVE_IN_PERSON',1,NULL,NULL),
('internal','VIRTUAL_CLASSROOM',1,NULL,NULL),
('internal','HYBRID_CLASSROOM',1,NULL,NULL),
('internal','SELF_PACED',1,NULL,NULL),
('internal','RECORDINGS',1,NULL,NULL),
('internal','COURSE_RESOURCES',1,NULL,NULL),
('internal','CLASSROOM_INTERACTIONS',1,NULL,NULL);
