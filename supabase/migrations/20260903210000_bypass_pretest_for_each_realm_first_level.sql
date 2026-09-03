begin;

-- This is the database counterpart to RealmRegistryEntry.levelLabels[0].
-- The release gate requires every live realm to appear here before launch.
create or replace function public.realm_first_level(p_realm_id text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_realm_id
    when 'number' then 'Prep'
    when 'measurement' then 'Prep'
    when 'space' then 'Prep'
    when 'statistics' then 'Year 1'
    when 'pattern' then 'Year 3'
    when 'chance' then 'Prep'
    else null
  end;
$$;

create or replace function public.normalise_first_realm_level_placement()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.assigned_start_level = public.realm_first_level(new.realm_id)
    and new.assigned_entry_mode = 'pretest' then
    new.assigned_entry_mode := case
      when new.assigned_start_level = 'Prep' then 'ground_week1'
      else 'full_level'
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_normalise_first_realm_level_placement
  on public.student_realm_placement;
create trigger trg_normalise_first_realm_level_placement
before insert or update on public.student_realm_placement
for each row execute function public.normalise_first_realm_level_placement();

create or replace function public.normalise_first_realm_level_progress()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.working_level = public.realm_first_level(new.realm_id)
    and new.status = 'ASSIGNED_PROGRAM'
    and not new.placement_complete then
    new.placement_complete := true;
    new.current_week := coalesce(new.current_week, 1);
    new.assigned_week := coalesce(new.assigned_week, 1);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_normalise_first_realm_level_progress
  on public.student_realm_progress;
create trigger trg_normalise_first_realm_level_progress
before insert or update on public.student_realm_progress
for each row execute function public.normalise_first_realm_level_progress();

revoke all on function public.realm_first_level(text) from public, anon, authenticated;
revoke all on function public.normalise_first_realm_level_placement() from public, anon, authenticated;
revoke all on function public.normalise_first_realm_level_progress() from public, anon, authenticated;

-- Repair only pathway state that was waiting for an impossible first-level
-- pre-test. Assessment results, lesson attempts, XP and diagnostic history are
-- deliberately untouched.
update public.student_realm_placement
set
  assigned_entry_mode = case
    when assigned_start_level = 'Prep' then 'ground_week1'
    else 'full_level'
  end,
  updated_at = now()
where assigned_start_level = public.realm_first_level(realm_id)
  and assigned_entry_mode = 'pretest';

update public.student_realm_progress
set
  placement_complete = true,
  current_week = coalesce(current_week, 1),
  assigned_week = coalesce(assigned_week, 1),
  updated_at = now()
where working_level = public.realm_first_level(realm_id)
  and status = 'ASSIGNED_PROGRAM'
  and not placement_complete;

commit;
