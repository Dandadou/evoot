PRAGMA foreign_keys = ON;

ALTER TABLE trainings ADD COLUMN target_duration_minutes INTEGER;
ALTER TABLE trainings ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'BOTH';

CREATE TABLE IF NOT EXISTS training_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  content_json TEXT NOT NULL DEFAULT '{}',
  duration_minutes INTEGER,
  visibility TEXT NOT NULL DEFAULT 'BOTH',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  UNIQUE(training_id, position)
);

CREATE INDEX IF NOT EXISTS idx_training_blocks_training ON training_blocks(training_id, position);

-- training_questions remains the live-question source for the current production flow.
-- training_blocks becomes the flexible master scenario used by the unified builder.
