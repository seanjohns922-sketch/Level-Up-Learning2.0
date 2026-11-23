// Disposable PostgreSQL only: no production connection, credentials or students.
// Checks the learning-streak rules in 20261125090000_learning_streaks.sql.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const container = `reliq-learning-streak-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout;
}
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const fixture = `
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
CREATE TABLE students(id uuid PRIMARY KEY);
CREATE TABLE economy_items(item_key text PRIMARY KEY);
CREATE TABLE student_economy_wallets(student_id uuid PRIMARY KEY REFERENCES students(id), xp_earned integer NOT NULL DEFAULT 0, updated_at timestamptz);
CREATE TABLE student_economy_transactions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_id uuid NOT NULL REFERENCES students(id),
  transaction_type text NOT NULL, xp_delta integer NOT NULL DEFAULT 0, essence_delta integer NOT NULL DEFAULT 0,
  source_type text NOT NULL, source_key text NOT NULL, item_key text REFERENCES economy_items(item_key),
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, source_type, source_key));
-- Fixture convention: access is granted by a session setting instead of a real student session.
CREATE FUNCTION assert_student_write(uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN
  IF current_setting('test.write', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Student write access denied' USING ERRCODE = '42501'; END IF; END$$;
CREATE FUNCTION assert_student_read(uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN
  IF current_setting('test.read', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Student read access denied' USING ERRCODE = '42501'; END IF; END$$;
CREATE FUNCTION learn(p_student uuid, p_day date, p_kind text DEFAULT 'lesson_completion') RETURNS void LANGUAGE sql AS $$
  INSERT INTO student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key, created_at)
  VALUES (p_student, 'earn', 40, p_kind, p_kind || ':' || p_day || ':' || gen_random_uuid(), (p_day + time '10:00') AT TIME ZONE 'Australia/Melbourne') $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
`;

// 2026-11-23 is a Monday. "today" below is the real Melbourne date, for claims.
const tests = `
INSERT INTO students SELECT ('00000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid FROM generate_series(1, 20) n;
SELECT learn('${id(1)}', d::date) FROM unnest(ARRAY['2026-11-18','2026-11-19','2026-11-20']) d;
SELECT learn('${id(2)}', d::date) FROM generate_series('2026-11-16'::date, '2026-11-20', '1 day') d;
SELECT learn('${id(3)}', d::date) FROM unnest(ARRAY['2026-11-16','2026-11-17','2026-11-19']) d;
SELECT learn('${id(4)}', d::date) FROM generate_series('2026-11-01'::date, '2026-11-15', '1 day') d;
SELECT learn('${id(5)}', '2026-11-22', 'brain_break'), learn('${id(5)}', '2026-11-23', 'learning_streak');
DO $$DECLARE r record; BEGIN
  SELECT * INTO r FROM learning_streak_state('${id(1)}', '2026-11-23');
  IF (r.streak, r.shields, r.today_done) IS DISTINCT FROM (3, 0, false) THEN RAISE EXCEPTION 'weekend or today broke the streak: %', r; END IF;
  SELECT * INTO r FROM learning_streak_state('${id(2)}', '2026-11-24');
  IF (r.streak, r.shields) IS DISTINCT FROM (5, 0) THEN RAISE EXCEPTION 'shield not used on a missed Monday: %', r; END IF;
  SELECT * INTO r FROM learning_streak_state('${id(2)}', '2026-11-25');
  IF r.streak <> 0 THEN RAISE EXCEPTION 'second missed weekday should end the streak'; END IF;
  SELECT * INTO r FROM learning_streak_state('${id(3)}', '2026-11-19');
  IF r.streak <> 1 THEN RAISE EXCEPTION 'missed weekday without a shield should reset'; END IF;
  SELECT * INTO r FROM learning_streak_state('${id(4)}', '2026-11-15');
  IF (r.streak, r.shields) IS DISTINCT FROM (15, 2) THEN RAISE EXCEPTION 'shields should cap at two: %', r; END IF;
  SELECT * INTO r FROM learning_streak_state('${id(5)}', '2026-11-23');
  IF r.streak <> 0 THEN RAISE EXCEPTION 'only lessons and quizzes are learning days'; END IF;
  IF (SELECT array_agg(d ORDER BY d) FROM generate_series(1, 40) d WHERE learning_streak_milestone_xp(d) > 0) <> ARRAY[3,5,10,20,30,35,40] THEN
    RAISE EXCEPTION 'milestone days'; END IF;
END$$;

-- Claims: five days ending today pays day 3 and 5 once; twelve days skips day 3 (over 7 days ago).
SELECT learn('${id(10)}', ((timezone('Australia/Melbourne', now()))::date - n)) FROM generate_series(0, 4) n;
SELECT learn('${id(11)}', ((timezone('Australia/Melbourne', now()))::date - n)) FROM generate_series(0, 11) n;
SET ROLE anon;
DO $$BEGIN PERFORM claim_learning_streak_secure('${id(10)}'); RAISE EXCEPTION 'claim without access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM learning_streak_state('${id(10)}'); RAISE EXCEPTION 'helper callable by anon'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
SET test.write = 'on';
DO $$DECLARE r jsonb; BEGIN
  r := claim_learning_streak_secure('${id(10)}');
  IF r->'awarded' <> '[{"day":3,"xp":100},{"day":5,"xp":500}]'::jsonb THEN RAISE EXCEPTION 'first claim: %', r; END IF;
  r := claim_learning_streak_secure('${id(10)}');
  IF r->'awarded' <> '[]'::jsonb OR (r->>'nextDay')::int <> 10 THEN RAISE EXCEPTION 'second claim: %', r; END IF;
  r := claim_learning_streak_secure('${id(11)}');
  IF r->'awarded' <> '[{"day":5,"xp":500},{"day":10,"xp":750}]'::jsonb THEN RAISE EXCEPTION 'seven-day window: %', r; END IF;
END$$;
SET test.read = 'on';
DO $$BEGIN IF (get_learning_streak_secure('${id(10)}')->>'streak')::int <> 5 THEN RAISE EXCEPTION 'read'; END IF; END$$;
RESET ROLE;
DO $$BEGIN
  IF (SELECT xp_earned FROM student_economy_wallets WHERE student_id = '${id(10)}') <> 600 THEN RAISE EXCEPTION 'wallet 10'; END IF;
  IF (SELECT xp_earned FROM student_economy_wallets WHERE student_id = '${id(11)}') <> 1250 THEN RAISE EXCEPTION 'wallet 11'; END IF;
  IF (SELECT count(*) FROM student_economy_transactions WHERE source_type = 'learning_streak' AND student_id IN ('${id(10)}', '${id(11)}')) <> 4 THEN RAISE EXCEPTION 'ledger'; END IF;
END$$;
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
  docker(psql, readFileSync('supabase/migrations/20261125090000_learning_streaks.sql', 'utf8'));
  docker(psql, tests);
  console.log('PASS learning streaks: weekends and today never break it, shields save a missed weekday (max 2), only lessons/quizzes count, milestones paid once into the wallet within 7 days, students cannot call the helpers.');
} finally {
  docker(['rm', '-f', container]);
}
