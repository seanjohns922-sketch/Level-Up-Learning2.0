// Disposable PostgreSQL only: no production connection, credentials or people.
// Checks the reliq.au sign-up rules in 20261127100000_website_signups.sql.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const container = `reliq-website-signups-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || result.stdout);
  return result.stdout;
}

const fixture = `
CREATE ROLE authenticated NOLOGIN; CREATE ROLE anon NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
`;

const tests = `
SET ROLE anon;
-- The table itself is closed to the site's key.
DO $$BEGIN PERFORM count(*) FROM website_signups; RAISE EXCEPTION 'anon can read the table'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;
DO $$BEGIN INSERT INTO website_signups(list, email) VALUES ('waitlist', 'x@y.au'); RAISE EXCEPTION 'anon can insert'; EXCEPTION WHEN insufficient_privilege THEN NULL; END$$;

DO $$DECLARE r record; t uuid; BEGIN
  SELECT * INTO r FROM website_join_list('waitlist', '  Parent@Example.COM ', '/families', 'client-a');
  IF r.status <> 'joined' OR r.unsubscribe_token IS NULL THEN RAISE EXCEPTION 'first join: %', r; END IF;
  t := r.unsubscribe_token;
  -- Same address, any case: no second row and no token handed out.
  SELECT * INTO r FROM website_join_list('waitlist', 'parent@example.com', '/', 'client-a');
  IF r.status <> 'already' OR r.unsubscribe_token IS NOT NULL THEN RAISE EXCEPTION 'repeat join leaked: %', r; END IF;
  -- Another list is a separate sign-up.
  SELECT * INTO r FROM website_join_list('store', 'parent@example.com', '/store', 'client-a');
  IF r.status <> 'joined' THEN RAISE EXCEPTION 'store list: %', r; END IF;
  -- Unsubscribe covers every list for the address; joining again re-subscribes.
  IF NOT website_unsubscribe(t) THEN RAISE EXCEPTION 'unsubscribe'; END IF;
  IF website_unsubscribe(gen_random_uuid()) THEN RAISE EXCEPTION 'unknown token accepted'; END IF;
  SELECT * INTO r FROM website_join_list('waitlist', 'parent@example.com', '/families', 'client-b');
  IF r.status <> 'joined' OR r.unsubscribe_token <> t THEN RAISE EXCEPTION 'rejoin: %', r; END IF;
END$$;

-- Validation.
DO $$BEGIN PERFORM website_join_list('waitlist', 'not-an-email'); RAISE EXCEPTION 'bad email accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END$$;
DO $$BEGIN PERFORM website_join_list('secret', 'a@b.au'); RAISE EXCEPTION 'unknown list accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END$$;
DO $$BEGIN PERFORM website_join_list('school_enquiry', 'a@b.au'); RAISE EXCEPTION 'enquiry without school'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END$$;
DO $$BEGIN PERFORM website_join_list('school_enquiry', 'a@b.au', '/schools', 'c', 'Ms J', 'teacher', 'Brightside PS', null, 'XX', 300);
  RAISE EXCEPTION 'bad state accepted'; EXCEPTION WHEN check_violation THEN NULL; END$$;

-- School enquiries always store (they can repeat) with every detail.
DO $$DECLARE r record; BEGIN
  SELECT * INTO r FROM website_join_list('school_enquiry', 'lead@school.edu.au', '/schools', 'client-c',
    'Ms Johnson', 'school_leader', 'Brightside Primary', '03 9000 0000', 'VIC', 350, 'Keen for Term 1');
  IF r.status <> 'received' THEN RAISE EXCEPTION 'enquiry: %', r; END IF;
  SELECT * INTO r FROM website_join_list('school_enquiry', 'lead@school.edu.au', '/schools', 'client-c', 'Ms Johnson', null, 'Brightside Primary');
  IF r.status <> 'received' THEN RAISE EXCEPTION 'repeat enquiry: %', r; END IF;
END$$;

-- Throttle: eight an hour from one sender.
DO $$DECLARE r record; BEGIN
  FOR n IN 1..8 LOOP PERFORM website_join_list('literacy', 'kid' || n || '@spam.au', '/', 'flooder'); END LOOP;
  SELECT * INTO r FROM website_join_list('literacy', 'kid9@spam.au', '/', 'flooder');
  IF r.status <> 'rate_limited' THEN RAISE EXCEPTION 'throttle: %', r; END IF;
END$$;
RESET ROLE;

DO $$BEGIN
  IF (SELECT count(*) FROM website_signups WHERE list = 'waitlist') <> 1 THEN RAISE EXCEPTION 'waitlist rows'; END IF;
  IF (SELECT count(*) FROM website_signups WHERE list = 'school_enquiry') <> 2 THEN RAISE EXCEPTION 'enquiry rows'; END IF;
  IF (SELECT count(*) FROM website_signups WHERE list = 'literacy') <> 8 THEN RAISE EXCEPTION 'throttled row stored'; END IF;
  IF (SELECT email FROM website_signups WHERE list = 'waitlist') <> 'parent@example.com' THEN RAISE EXCEPTION 'email not normalised'; END IF;
  IF (SELECT unsubscribed_at FROM website_signups WHERE list = 'store') IS NULL THEN RAISE EXCEPTION 'unsubscribe missed the store list'; END IF;
  IF (SELECT state || student_count FROM website_signups WHERE list = 'school_enquiry' ORDER BY created_at LIMIT 1) <> 'VIC350' THEN RAISE EXCEPTION 'enquiry details'; END IF;
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
  docker(psql, readFileSync('supabase/migrations/20261127100000_website_signups.sql', 'utf8'));
  docker(psql, tests);
  console.log('PASS website sign-ups: table closed to the site key, one row per address per list, no token leak on repeats, unsubscribe covers every list, enquiries keep their details, validation and throttle hold.');
} finally {
  docker(['rm', '-f', container]);
}
