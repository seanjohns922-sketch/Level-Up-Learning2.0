
-- Add quiz_scores jsonb column to progress table
-- Format: {"1": {"score": 12, "total": 15, "percent": 80, "passed": true, "attempts": [{"score": 8, "total": 15, "percent": 53, "passed": false, "at": "..."}, ...]}, "2": {...}}
ALTER TABLE public.progress ADD COLUMN IF NOT EXISTS quiz_scores jsonb NOT NULL DEFAULT '{}'::jsonb;
