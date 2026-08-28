PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS live_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL DEFAULT 'evolution-pme',
  training_slug TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'LOBBY',
  current_question INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  participant_id INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(participant_id, question_index)
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_code ON live_sessions(code);
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_question ON responses(session_id, question_index);
