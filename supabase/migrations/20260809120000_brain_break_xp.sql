-- Brain-break XP — a small, farm-resistant reward for completing a mid-lesson
-- brain break. This is deliberately SEPARATE from the graded lesson score: it
-- credits the Explorer economy wallet only (spendable XP), never touches
-- completions or canonical progression.
--
-- Anti-farm design, mirroring apply_completion_xp:
--   * the award is capped at 10 XP per break (server-side, cannot be raised by the client),
--   * it is idempotent on (student_id, source_type='brain_break', source_key) — the
--     unique constraint on student_economy_transactions means each specific
--     lesson-break awards at most once ever, so replaying a lesson cannot farm it.

create or replace function public.award_brain_break_xp_secure(
  p_student_id uuid,
  p_class_id uuid,
  p_xp integer,
  p_source_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  safe_xp integer := least(greatest(coalesce(p_xp, 0), 0), 10); -- hard server cap
begin
  if nullif(trim(p_source_key), '') is null then
    raise exception 'brain_break XP requires a source key';
  end if;
  if safe_xp = 0 then
    return false;
  end if;

  insert into public.student_economy_transactions(
    student_id, transaction_type, xp_delta, source_type, source_key, metadata
  ) values (
    p_student_id, 'earn', safe_xp, 'brain_break', p_source_key,
    coalesce(p_metadata, '{}'::jsonb)
  ) on conflict (student_id, source_type, source_key) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return false; -- already earned for this break
  end if;

  insert into public.student_economy_wallets(student_id, xp_earned)
  values (p_student_id, safe_xp)
  on conflict (student_id) do update set
    xp_earned = public.student_economy_wallets.xp_earned + excluded.xp_earned,
    updated_at = now();

  return true;
end;
$$;

revoke all on function public.award_brain_break_xp_secure(uuid, uuid, integer, text, jsonb) from public;
grant execute on function public.award_brain_break_xp_secure(uuid, uuid, integer, text, jsonb) to anon, authenticated;
