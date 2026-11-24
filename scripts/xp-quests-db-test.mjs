// Disposable PostgreSQL only: no production connection, credentials or students.
// Checks the daily quests, accuracy, week and level bonuses in 20261127130000_xp_quests_and_milestones.sql.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const container = `reliq-xp-quests-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout;
}
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const fixture = `
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN;
CREATE TABLE classes(id uuid PRIMARY KEY, battles_enabled boolean NOT NULL DEFAULT true);
CREATE TABLE students(id uuid PRIMARY KEY, class_id uuid REFERENCES classes(id), battles_enabled boolean NOT NULL DEFAULT true, archived_at timestamptz);
CREATE TABLE student_economy_wallets(student_id uuid PRIMARY KEY REFERENCES students(id), xp_earned integer NOT NULL DEFAULT 0, updated_at timestamptz);
CREATE TABLE student_economy_transactions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_id uuid NOT NULL REFERENCES students(id),
  transaction_type text NOT NULL, xp_delta integer NOT NULL DEFAULT 0, source_type text NOT NULL, source_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(student_id, source_type, source_key));
CREATE TABLE student_lesson_attempts(
  student_id uuid NOT NULL, realm_id text NOT NULL, working_level text NOT NULL, week integer NOT NULL, lesson integer NOT NULL,
  attempt_no integer NOT NULL, correct_count integer NOT NULL, total_questions integer NOT NULL, completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE student_realm_progress(student_id uuid NOT NULL, realm_id text NOT NULL, working_level text NOT NULL, posttest_completed_at timestamptz);
CREATE TABLE student_battles(challenger_id uuid, opponent_id uuid, status text, finished_at timestamptz);
CREATE FUNCTION battles_allowed(p uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce((SELECT s.battles_enabled AND coalesce(c.battles_enabled, true) FROM students s LEFT JOIN classes c ON c.id = s.class_id WHERE s.id = p), false) $$;
-- Fixture convention: access is granted by a session setting instead of a real student session.
CREATE FUNCTION assert_student_write(uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN
  IF current_setting('test.write', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Student write access denied' USING ERRCODE = '42501'; END IF; END$$;
CREATE FUNCTION assert_student_read(uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN
  IF current_setting('test.read', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Student read access denied' USING ERRCODE = '42501'; END IF; END$$;
CREATE FUNCTION lesson_xp(p uuid, p_realm text, p_at timestamptz DEFAULT now()) RETURNS void LANGUAGE sql AS $$
  INSERT INTO student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key, metadata, created_at)
  VALUES (p, 'earn', 40, 'lesson_completion', gen_random_uuid()::text, jsonb_build_object('realm_id', p_realm), p_at) $$;
CREATE FUNCTION attempt(p uuid, p_week int, p_lesson int, p_no int, p_correct int, p_total int, p_at timestamptz DEFAULT now()) RETURNS void LANGUAGE sql AS $$
  INSERT INTO student_lesson_attempts VALUES (p, 'number', 'Year 4', p_week, p_lesson, p_no, p_correct, p_total, true, p_at) $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
`;

const tests = `
INSERT INTO classes VALUES ('${id(900)}', true), ('${id(901)}', false);
INSERT INTO students(id, class_id) VALUES ('${id(1)}', '${id(900)}'), ('${id(2)}', NULL), ('${id(3)}', '${id(901)}');

-- Quest lists: a lesson always; in class on a school day the fun quest is battle or Rex; no battle where switched off.
DO $$DECLARE d date; l text[]; seen text[] := '{}'; BEGIN
  FOR d IN SELECT generate_series('2026-11-23'::date, '2027-02-28', '1 day')::date LOOP
    l := xp_daily_quest_list('${id(1)}', d);
    IF l[1] <> 'lesson' OR NOT l[2] = ANY(ARRAY['two_lessons','sharp_lesson','two_realms']) THEN RAISE EXCEPTION 'list %', l; END IF;
    IF extract(isodow FROM d) <= 5 AND l[3] = 'build' THEN RAISE EXCEPTION 'build quest in class on a school day'; END IF;
    IF 'battle' = ANY(xp_daily_quest_list('${id(3)}', d)) THEN RAISE EXCEPTION 'battle quest with battles off'; END IF;
    seen := seen || xp_daily_quest_list('${id(2)}', d);
  END LOOP;
  IF NOT ARRAY['two_lessons','sharp_lesson','two_realms','battle','rex','build'] <@ seen THEN RAISE EXCEPTION 'home quests never offer some: %', seen; END IF;
  IF xp_accuracy_bonus(10, 10) <> 20 OR xp_accuracy_bonus(8, 10) <> 10 OR xp_accuracy_bonus(7, 10) <> 0 OR xp_accuracy_bonus(4, 4) <> 0 THEN RAISE EXCEPTION 'accuracy'; END IF;
END$$;

-- Student 2 today: lessons in two realms, a perfect first lesson, an 80% one, a poor first try later retried perfectly,
-- a finished battle, Rex and a purchase, so every quest is done; plus a level test and an old week.
SELECT lesson_xp('${id(2)}', 'number'), lesson_xp('${id(2)}', 'space');
SELECT attempt('${id(2)}', 3, 1, 1, 10, 10), attempt('${id(2)}', 3, 2, 1, 8, 10), attempt('${id(2)}', 3, 3, 1, 3, 10), attempt('${id(2)}', 3, 3, 2, 10, 10);
SELECT attempt('${id(2)}', 1, l, 1, 5, 10, now() - interval '30 days') FROM generate_series(1, 3) l;
INSERT INTO student_battles VALUES ('${id(2)}', '${id(1)}', 'finished', now());
INSERT INTO student_economy_transactions(student_id, transaction_type, xp_delta, source_type, source_key) VALUES
  ('${id(2)}', 'earn', 50, 'rex', 'rex:1'), ('${id(2)}', 'purchase', -300, 'purchase', 'buy:1');
INSERT INTO student_realm_progress VALUES ('${id(2)}', 'measurement', 'Year 5', now()), ('${id(2)}', 'number', 'Year 3', now() - interval '60 days');

SET ROLE anon;
DO $$BEGIN PERFORM claim_xp_rewards_secure('${id(2)}'); RAISE EXCEPTION 'claim without access'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN PERFORM xp_quest_progress('${id(2)}', 'lesson', current_date); RAISE EXCEPTION 'helper callable by anon'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
SET test.write = 'on';
DO $$DECLARE r jsonb; kinds text; BEGIN
  r := claim_xp_rewards_secure('${id(2)}');
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(r->'quests') q WHERE NOT (q->>'done')::boolean) THEN RAISE EXCEPTION 'quests not all done: %', r->'quests'; END IF;
  SELECT string_agg(a->>'kind' || ':' || (a->>'xp'), ',' ORDER BY a->>'kind', (a->>'xp')::int) INTO kinds FROM jsonb_array_elements(r->'awarded') a;
  IF kinds <> 'accuracy:10,accuracy:20,level:1000,quest:20,quest:30,quest:30,quests_all:50,week:100' THEN RAISE EXCEPTION 'first claim paid %', kinds; END IF;
  r := claim_xp_rewards_secure('${id(2)}');
  IF r->'awarded' <> '[]'::jsonb THEN RAISE EXCEPTION 'second claim paid again: %', r->'awarded'; END IF;
END$$;
SET test.read = 'on';
DO $$BEGIN IF jsonb_array_length(get_daily_quests_secure('${id(1)}')->'quests') <> 3 THEN RAISE EXCEPTION 'read'; END IF; END$$;
RESET ROLE;
DO $$BEGIN
  IF (SELECT xp_earned FROM student_economy_wallets WHERE student_id = '${id(2)}') <> 1260 THEN RAISE EXCEPTION 'wallet %', (SELECT xp_earned FROM student_economy_wallets WHERE student_id = '${id(2)}'); END IF;
  IF EXISTS (SELECT 1 FROM student_economy_transactions WHERE source_key LIKE 'week:number:Year 4:1') THEN RAISE EXCEPTION 'old week paid'; END IF;
  IF EXISTS (SELECT 1 FROM student_economy_transactions WHERE source_key = 'level:number:Year 3') THEN RAISE EXCEPTION 'old level paid'; END IF;
  IF EXISTS (SELECT 1 FROM student_economy_transactions WHERE source_key = 'accuracy:number:Year 4:3:3') THEN RAISE EXCEPTION 'a retry earned the accuracy bonus'; END IF;
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
  docker(psql, readFileSync('supabase/migrations/20261127130000_xp_quests_and_milestones.sql', 'utf8'));
  docker(psql, tests);
  console.log('PASS XP quests: three quests a day (no build quest in class on school days, no battle quest when battles are off), every quest ticks from server rows, accuracy on first tries only, week and level bonuses within 7 days, each reward paid once into the wallet, students cannot call the helpers.');
} finally {
  docker(['rm', '-f', container]);
}
