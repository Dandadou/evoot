PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS course_session_state (
  course_session_id INTEGER PRIMARY KEY,
  organization_id TEXT NOT NULL,
  active_block_position INTEGER NOT NULL DEFAULT 0,
  projection_enabled INTEGER NOT NULL DEFAULT 0,
  updated_by_user_id INTEGER,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_course_session_state_org ON course_session_state(organization_id,course_session_id);

CREATE TABLE IF NOT EXISTS trainer_session_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL,
  course_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (course_session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(organization_id,course_session_id,user_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_session_notes_session ON trainer_session_notes(organization_id,course_session_id,user_id);
