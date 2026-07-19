begin;

-- ── Global Gem Vault — Phase 7: historical backfill ─────────────────────────
-- Existing students keep every milestone they've already achieved. The award
-- logic is refactored into gem_award_core (no access check — internal only) so
-- both the live evaluator and this one-off backfill share exactly one code path.
-- Backfilled gems are tagged source_type = 'migration'. Fully idempotent:
-- re-running never duplicates awards.

create or replace function public.gem_award_core(
  p_student_id uuid,
  p_trigger text,
  p_source text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t jsonb; g record; cur int; target int; newly jsonb := '[]'::jsonb; ekey text;
begin
  t := public.gem_student_totals(p_student_id);

  for g in
    select * from public.gem_definitions d
    where d.is_active
      and not exists (select 1 from public.student_gems sg
                      where sg.student_id = p_student_id and sg.gem_id = d.id)
  loop
    cur := public.gem_current_value(t, g.milestone_type, g.realm_id);
    target := case when g.milestone_type = 'all_live_legends'
                   then coalesce((t->>'all_live_expected')::int, 0) else g.threshold end;

    if target > 0 and cur >= target then
      ekey := g.slug || ':' || coalesce(p_trigger, 'auto');
      insert into public.student_gems(student_id, gem_id, award_event_key, source_type)
      values (p_student_id, g.id, ekey, p_source)
      on conflict (student_id, gem_id) do nothing;
      if found then
        insert into public.gem_award_events(student_id, gem_id, event_key, trigger_type)
        values (p_student_id, g.id, ekey, p_trigger)
        on conflict (student_id, gem_id, event_key) do nothing;
        newly := newly || jsonb_build_array(to_jsonb(g));
      end if;
    end if;
  end loop;

  return newly;
end; $$;
revoke all on function public.gem_award_core(uuid, text, text) from public, anon, authenticated;

-- Live evaluator now delegates to the shared core (after the access check).
create or replace function public.evaluate_gems_secure(
  p_student_id uuid,
  p_trigger text default 'manual',
  p_trigger_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare newly jsonb;
begin
  perform public.assert_student_access(p_student_id);
  newly := public.gem_award_core(p_student_id, coalesce(p_trigger, 'manual'), 'milestone');
  return jsonb_build_object('newly_awarded', newly, 'vault', public.get_gem_vault_secure(p_student_id));
end; $$;
revoke all on function public.evaluate_gems_secure(uuid, text, text) from public;
grant execute on function public.evaluate_gems_secure(uuid, text, text) to anon, authenticated;

-- One-off backfill: award every already-earned gem to existing students.
do $$
declare s record;
begin
  for s in select id from public.students loop
    perform public.gem_award_core(s.id, 'backfill', 'migration');
  end loop;
end $$;

commit;
