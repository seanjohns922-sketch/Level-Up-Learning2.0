#!/usr/bin/env python3
"""Run real PostgreSQL integration checks with synthetic records in an isolated Docker container.

Requires an already running Supabase PostgreSQL container with --network none.
The test database is newly created and dropped by this runner. No production connection
or credentials are used. Identity/cohort tables are fixture approximations: this suite
validates repository SQL persistence, not deployed-schema parity, production RLS or UI.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
import uuid

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / 'supabase/migrations'
TESTS = ROOT / 'supabase/tests/starpath_rebuild'
NEW = ['20260914160000_starpath_ground_baseline.sql', '20260914161000_starpath_comparable_growth.sql']


def sql_function_catalog():
    functions = {}
    for path in sorted(MIGRATIONS.glob('*.sql')):
        if path.name >= NEW[0]:
            continue
        for match in re.finditer(r'create\s+(?:or\s+replace\s+)?function\s+public\.(\w+)\s*\(.*?\$\$\s*;', path.read_text(), re.I | re.S):
            functions[match[1].lower()] = match[0]
    return functions


def fixture_sql(functions):
    parts = ['''set check_function_bodies=off;
create schema if not exists auth;
create function auth.uid() returns uuid language sql as $$select null::uuid$$;
create table public.classes(id uuid primary key, teacher_id uuid, name text);
create table public.students(id uuid primary key, class_id uuid references public.classes(id), school_year_level text, year_level text);
-- Fixture-only identity boundary. Production RLS must be verified separately.
create function public.teacher_belongs_to_auth(uuid) returns boolean language sql as $$select true$$;
create function public.teacher_owns_student(uuid) returns boolean language sql as $$select true$$;
create function public.assert_student_access(uuid) returns void language plpgsql as $$begin if current_setting('test.deny_access',true)='on' then raise exception 'Access denied' using errcode='42501'; end if; end$$;
''', (MIGRATIONS / '20260601134000_create_student_realm_tables.sql').read_text()]
    for name in ['student_realm_placement', 'teacher_realm_actions']:
        text = (MIGRATIONS / '20260714120000_teacher_placement_rpcs.sql').read_text()
        parts.append(re.search(r'create table if not exists public\.' + name + r'\s*\(.*?\n\);', text, re.I | re.S)[0])
    text = (MIGRATIONS / '20260717213000_secure_student_completions.sql').read_text()
    parts.append(re.search(r'create table if not exists public\.student_completion_receipts\s*\(.*?\n\);', text, re.I | re.S)[0].replace("('number', 'measurement')", "('number','measurement','space','statistics','pattern','chance')"))
    for name in ['save_student_realm_progress', 'save_realm_assessment', 'get_student_realm_assessments', 'get_student_realm_progress', 'get_student_realm_progress_compat', 'get_student_realm_progress_compat_secure', 'realm_first_level', 'realm_first_level_pretest_enabled', 'normalise_first_realm_level_placement', 'normalise_first_realm_level_progress', 'realm_program_key', 'teacher_change_starting_level', 'teacher_reset_pretest', 'complete_realm_assessment']:
        parts.append(functions[name])
    parts.append('''create trigger test_normalise_progress before insert or update on public.student_realm_progress for each row execute function public.normalise_first_realm_level_progress();
create trigger test_normalise_placement before insert or update on public.student_realm_placement for each row execute function public.normalise_first_realm_level_placement();
create function public.test_assert(ok boolean, label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end$$;
''')
    parts.append(functions['get_school_analytics_snapshot'].replace('public.get_school_analytics_snapshot(', 'public.test_old_school_analytics_snapshot(', 1))
    parts.append(functions['complete_realm_assessment'].replace('public.complete_realm_assessment(', 'public.test_old_complete_realm_assessment(', 1))
    return '\n'.join(parts)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--container', default='starpath-integration-20260914')
    args = parser.parse_args()
    container = args.container
    info = json.loads(subprocess.check_output(['docker', 'inspect', container], text=True))[0]
    if info['HostConfig']['NetworkMode'] != 'none' or not info['Name'].startswith('/starpath-integration-'):
        raise SystemExit('Refusing: tests require a dedicated starpath-integration-* container with --network none.')
    database = 'starpath_qa_' + uuid.uuid4().hex[:12]
    functions = sql_function_catalog()
    sql = '\n'.join([fixture_sql(functions), (TESTS / 'before.sql').read_text(), *[(MIGRATIONS / n).read_text() for n in NEW], (TESTS / 'after.sql').read_text(), (TESTS / 'analytics.sql').read_text(), (TESTS / 'parity.sql').read_text()])
    subprocess.run(['docker', 'exec', container, 'createdb', '-U', 'postgres', database], check=True)
    try:
        run = subprocess.run(['docker', 'exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-d', database, '-v', 'ON_ERROR_STOP=1'], input=sql, text=True, capture_output=True)
        for line in run.stderr.splitlines():
            if 'PASS:' in line or 'ERROR:' in line or 'CONTEXT:' in line or 'FAIL:' in line:
                print(line)
        if run.returncode:
            print(run.stderr[-3500:])
            raise SystemExit(run.returncode)
        print(f"PASS: {run.stderr.count('PASS:')} PostgreSQL checks. Synthetic fixture only; production identity/schema verification remains separate.")
    finally:
        subprocess.run(['docker', 'exec', container, 'dropdb', '-U', 'postgres', database], check=True)


if __name__ == '__main__':
    main()
