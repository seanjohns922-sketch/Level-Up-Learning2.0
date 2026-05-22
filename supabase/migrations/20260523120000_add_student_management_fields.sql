-- Add student management fields for teacher CRUD
-- Adds year_level, notes, archived_at to students table
-- archived_at = soft delete; NULL = active student

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS year_level  TEXT,
  ADD COLUMN IF NOT EXISTS notes       TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
