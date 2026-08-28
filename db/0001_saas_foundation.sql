PRAGMA foreign_keys = ON;

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  organization_type TEXT NOT NULL DEFAULT 'COMPANY' CHECK (organization_type IN ('PLATFORM','TRAINING_PROVIDER','COMPANY')),
  parent_organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#ff6a00',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE memberships (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','TRAINER','LEARNER')),
  PRIMARY KEY (user_id, organization_id)
);

CREATE TABLE trainings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  delivery_mode TEXT NOT NULL DEFAULT 'BOTH' CHECK (delivery_mode IN ('LIVE','SELF_PACED','BOTH')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_sections (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE content_blocks (
  id TEXT PRIMARY KEY,
  training_id TEXT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES training_sections(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('TEXT','IMAGE','VIDEO','QUESTION')),
  delivery_mode TEXT NOT NULL DEFAULT 'BOTH' CHECK (delivery_mode IN ('LIVE','SELF_PACED','BOTH')),
  title TEXT,
  body TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IMAGE','VIDEO')),
  storage_key TEXT,
  external_url TEXT,
  filename TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  content_block_id TEXT NOT NULL UNIQUE REFERENCES content_blocks(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'INTEGRATION' CHECK (stage IN ('OPENING','INTEGRATION','EVALUATION')),
  question_type TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE' CHECK (question_type IN ('MULTIPLE_CHOICE','TRUE_FALSE','POLL','SCENARIO')),
  prompt TEXT NOT NULL,
  skill TEXT,
  preferred_answer_index INTEGER,
  trainer_notes TEXT,
  participant_debrief TEXT,
  synthesis TEXT
);

CREATE TABLE question_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE live_sessions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  training_id TEXT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  trainer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'LOBBY' CHECK (state IN ('LOBBY','QUESTION','DISCUSSION','RESULTS','FINISHED')),
  current_block_id TEXT REFERENCES content_blocks(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  live_session_id TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  live_session_id TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id TEXT REFERENCES question_options(id) ON DELETE SET NULL,
  text_value TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_id, question_id)
);

CREATE TABLE learning_enrollments (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  training_id TEXT NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  learner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  learner_email TEXT,
  status TEXT NOT NULL DEFAULT 'INVITED' CHECK (status IN ('INVITED','IN_PROGRESS','COMPLETED')),
  due_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_parent ON organizations(parent_organization_id);
CREATE INDEX idx_trainings_org ON trainings(organization_id);
CREATE INDEX idx_blocks_training ON content_blocks(training_id, position);
CREATE INDEX idx_live_code ON live_sessions(code);
CREATE INDEX idx_enrollments_org ON learning_enrollments(organization_id);
