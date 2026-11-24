// Disposable PostgreSQL only: no production connection, credentials or students.
// Checks the Chronorok card, catch-up, XP unlock, best-score and hand-over rules in 20261127150000_chronorok_cards.sql.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const container = `reliq-chronorok-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout;
}
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const fixture = `
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
CREATE TABLE students(id uuid PRIMARY KEY, first_name text, display_name text, school_year_level text, year_level text);
CREATE TABLE student_economy_wallets(student_id uuid PRIMARY KEY REFERENCES students(id), xp_earned integer NOT NULL DEFAULT 0, xp_spent integer NOT NULL DEFAULT 0, updated_at timestamptz);
CREATE TABLE student_economy_transactions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_id uuid NOT NULL REFERENCES students(id),
  transaction_type text NOT NULL, xp_delta integer NOT NULL DEFAULT 0, source_type text NOT NULL, source_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(student_id, source_type, source_key));
CREATE TABLE student_lesson_attempts(student_id uuid NOT NULL, completed boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE student_weekly_quiz_attempts(student_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE student_friendships(student_low uuid, student_high uuid, status text);
CREATE TABLE parent_student_links(parent_user_id uuid, student_id uuid, status text);
CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid', true), '')::uuid $$;
CREATE FUNCTION request_student_session_token() RETURNS text LANGUAGE sql AS $$ SELECT nullif(current_setting('test.session', true), '') $$;
CREATE FUNCTION friend_label(p uuid) RETURNS text LANGUAGE sql STABLE AS $$ SELECT first_name FROM students WHERE id = p $$;
CREATE FUNCTION friend_outfit(p uuid) RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
-- Fixture convention: access is granted by a session setting instead of a real student session.
CREATE FUNCTION assert_student_write(uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN
  IF current_setting('test.write', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Student write access denied' USING ERRCODE = '42501'; END IF; END$$;
CREATE FUNCTION assert_student_read(uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN
  IF current_setting('test.read', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Student read access denied' USING ERRCODE = '42501'; END IF; END$$;
-- n learning days this year (lessons), plus one quiz-only day.
CREATE FUNCTION learn(p uuid, n int) RETURNS void LANGUAGE sql AS $$
  INSERT INTO student_lesson_attempts(student_id, created_at)
  SELECT p, (date_trunc('year', timezone('Australia/Melbourne', now())) + make_interval(days => d, hours => 12)) AT TIME ZONE 'Australia/Melbourne'
  FROM generate_series(0, n - 1) d $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
`;

const tests = `
INSERT INTO students(id, first_name, school_year_level) VALUES
  ('${id(1)}', 'Ava', 'Year 3'), ('${id(2)}', 'Ben', 'Year 3'), ('${id(3)}', 'Cal', 'Prep'), ('${id(4)}', 'Dee', 'Year 8'), ('${id(5)}', 'Eli', 'Year 2');
SELECT learn('${id(1)}', 100), learn('${id(2)}', 99), learn('${id(3)}', 100), learn('${id(4)}', 100);
-- Incomplete lessons don't count; a quiz-only day does.
INSERT INTO student_lesson_attempts VALUES ('${id(2)}', false, now());
INSERT INTO student_weekly_quiz_attempts VALUES ('${id(5)}', now());

DO $$BEGIN
  IF chronorok_grade_index('Prep') <> 0 OR chronorok_grade_index('Year 1') <> 1 OR chronorok_grade_index('Grade 6') <> 6 OR chronorok_grade_index('Year 8') <> 6 OR chronorok_grade_index('Kinder') IS NOT NULL THEN
    RAISE EXCEPTION 'grade index'; END IF;
END$$;

SET ROLE anon;
DO $$BEGIN PERFORM claim_chronorok_secure('${id(1)}'); RAISE EXCEPTION 'claim without access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM chronorok_state('${id(1)}'); RAISE EXCEPTION 'helper callable by anon'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
SET test.write = 'on';
DO $$DECLARE r jsonb; BEGIN
  -- First 100 in Grade 3: Current plus the catch-up (Spark, Ember, Pulse), once.
  r := claim_chronorok_secure('${id(1)}');
  IF r->'newly' <> '["chronorok-current-y3","chronorok-spark-y0","chronorok-ember-y1","chronorok-pulse-y2"]'::jsonb THEN RAISE EXCEPTION 'first awakening %', r->'newly'; END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(r->'cards')) <> 4 OR r->'cards'->0->>'how' <> 'catch_up' THEN RAISE EXCEPTION 'cards %', r->'cards'; END IF;
  IF claim_chronorok_secure('${id(1)}')->'newly' <> '[]'::jsonb THEN RAISE EXCEPTION 'awakened twice'; END IF;
  -- 99 days: nothing (the incomplete lesson doesn't count).
  r := claim_chronorok_secure('${id(2)}');
  IF (r->>'crystals')::int <> 99 OR r->'newly' <> '[]'::jsonb THEN RAISE EXCEPTION '99 days %', r; END IF;
  -- Prep: Spark only; Year 8: Eternal plus six catch-up cards.
  IF claim_chronorok_secure('${id(3)}')->'newly' <> '["chronorok-spark-y0"]'::jsonb THEN RAISE EXCEPTION 'prep'; END IF;
  IF jsonb_array_length(claim_chronorok_secure('${id(4)}')->'newly') <> 7 THEN RAISE EXCEPTION 'year 8 catch-up'; END IF;
  IF (claim_chronorok_secure('${id(5)}')->>'learningDays')::int <> 1 THEN RAISE EXCEPTION 'quiz day'; END IF;
END$$;

-- Later, Ava is in Grade 5 and missed Grade 4: Rift can be bought for 5,000 XP; Blaze (this year) and Eternal can't.
RESET ROLE;
UPDATE students SET school_year_level = 'Year 5' WHERE id = '${id(1)}';
INSERT INTO student_economy_wallets(student_id, xp_earned) VALUES ('${id(1)}', 5200), ('${id(2)}', 9000);
SET ROLE anon;
DO $$BEGIN PERFORM buy_chronorok_card_secure('${id(1)}', 'chronorok-blaze-y5'); RAISE EXCEPTION 'bought this year''s card'; EXCEPTION WHEN sqlstate '22023' THEN NULL; END$$;
DO $$BEGIN PERFORM buy_chronorok_card_secure('${id(1)}', 'chronorok-pulse-y2'); RAISE EXCEPTION 'bought an owned card'; EXCEPTION WHEN sqlstate '22023' THEN NULL; END$$;
DO $$BEGIN PERFORM buy_chronorok_card_secure('${id(2)}', 'chronorok-spark-y0'); RAISE EXCEPTION 'bought before a first awakening'; EXCEPTION WHEN sqlstate '22023' THEN NULL; END$$;
DO $$BEGIN IF buy_chronorok_card_secure('${id(1)}', 'chronorok-rift-y4')->'newly' <> '["chronorok-rift-y4"]'::jsonb THEN RAISE EXCEPTION 'buy'; END IF; END$$;
RESET ROLE;
DO $$BEGIN
  IF (SELECT xp_earned - xp_spent FROM student_economy_wallets WHERE student_id = '${id(1)}') <> 200 THEN RAISE EXCEPTION 'wallet after buying'; END IF;
  IF NOT EXISTS (SELECT 1 FROM student_economy_transactions WHERE student_id = '${id(1)}' AND source_type = 'chronorok_card' AND xp_delta = -5000) THEN RAISE EXCEPTION 'ledger'; END IF;
END$$;
UPDATE students SET school_year_level = 'Year 6' WHERE id = '${id(1)}';
SET ROLE anon;
DO $$BEGIN PERFORM buy_chronorok_card_secure('${id(1)}', 'chronorok-blaze-y5'); RAISE EXCEPTION 'not enough XP'; EXCEPTION WHEN sqlstate '22023' THEN NULL; END$$;

-- Best scores: only go up, capped per game; the board is the student and accepted friends.
DO $$BEGIN
  IF submit_chronorok_best_secure('${id(1)}', 'time-slope', 300) <> 300 OR submit_chronorok_best_secure('${id(1)}', 'time-slope', 200) <> 300 THEN RAISE EXCEPTION 'best'; END IF;
  PERFORM submit_chronorok_best_secure('${id(2)}', 'time-slope', 400), submit_chronorok_best_secure('${id(3)}', 'time-slope', 999);
END$$;
DO $$BEGIN PERFORM submit_chronorok_best_secure('${id(1)}', 'rune-blocks', 37); RAISE EXCEPTION 'cap'; EXCEPTION WHEN sqlstate '22023' THEN NULL; END$$;
DO $$BEGIN PERFORM submit_chronorok_best_secure('${id(1)}', 'snake', 1); RAISE EXCEPTION 'game'; EXCEPTION WHEN sqlstate '22023' THEN NULL; END$$;
RESET ROLE;
INSERT INTO student_friendships VALUES ('${id(1)}', '${id(2)}', 'accepted'), ('${id(1)}', '${id(3)}', 'pending');
SET ROLE anon;
DO $$DECLARE r jsonb; BEGIN
  r := get_chronorok_board_secure('${id(1)}', 'time-slope');
  IF jsonb_path_query_array(r, '$.top[*].name') <> '["Ben","Ava"]'::jsonb OR (r->>'myBest')::int <> 300 THEN RAISE EXCEPTION 'board %', r; END IF;
END$$;

-- Student only: no parent or teacher functions.
DO $$BEGIN IF to_regprocedure('set_chronorok_handed_over_secure(uuid,text)') IS NOT NULL OR to_regprocedure('get_chronorok_secure(uuid)') IS NOT NULL THEN RAISE EXCEPTION 'parent functions remain'; END IF; END$$;
`;

try {
  docker(['run', '--detach', '--name', container, '--network', 'none', '--memory', '512m', '-e', 'POSTGRES_PASSWORD=fictional-only', 'postgres:17-alpine']);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (spawnSync('docker', ['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']).status === 0) { ready = true; break; }
    await new Promise((r) => setTimeout(r, 500));
  }
  assert(ready);
  const psql = ['exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1'];
  docker(psql, fixture);
  docker(psql, readFileSync('supabase/migrations/20261127150000_chronorok_cards.sql', 'utf8'));
  docker(psql, readFileSync('supabase/migrations/20261127160000_chronorok_student_only.sql', 'utf8'));
  docker(psql, tests);
  console.log('PASS Chronorok cards: 100 server-counted days awakens the grade card once (first time with the earlier grades), Prep and Year 8 map right, missed earlier grades cost 5,000 XP (not this year\'s, not owned, not before a first card, not without the XP), bests only go up within caps, the board is friends only, and nothing for parents or teachers.');
} finally {
  docker(['rm', '-f', container]);
}
