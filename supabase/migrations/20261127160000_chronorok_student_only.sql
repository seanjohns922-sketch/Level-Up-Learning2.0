-- Chronorok is the student's own (Sean, 2026-11-25): no parent or teacher part. Removes the physical-card
-- hand-over and the parent/teacher read added in 20261127150000.
--
-- Changes: drops set_chronorok_handed_over_secure and get_chronorok_secure; chronorok_state no longer returns
-- handedOver; drops student_chronorok_cards.handed_over_at.
-- Data: only the handed-over timestamps go (nothing shipped that set them).
-- Rollback: re-run those parts of 20261127150000.

begin;

drop function if exists public.set_chronorok_handed_over_secure(uuid, text);
drop function if exists public.get_chronorok_secure(uuid);

create or replace function public.chronorok_state(p_student_id uuid, p_newly text[] default '{}')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from timezone('Australia/Melbourne', now()))::integer;
  v_days integer;
  v_crystals integer;
begin
  select count(*), count(*) filter (where extract(year from d)::integer = v_year)
  into v_days, v_crystals from public.chronorok_learning_days(p_student_id) d;
  return jsonb_build_object(
    'year', v_year,
    'learningDays', v_days,
    'crystals', least(v_crystals, 100),
    'open', v_days >= 5,
    'gradeIndex', public.chronorok_student_grade(p_student_id),
    'buyXp', public.chronorok_buy_xp(),
    'cards', coalesce((select jsonb_agg(jsonb_build_object('cardId', c.card_id, 'year', c.school_year, 'how', c.how)
      order by array_position(public.chronorok_cards_in_order(), c.card_id))
      from public.student_chronorok_cards c where c.student_id = p_student_id), '[]'::jsonb),
    'newly', to_jsonb(coalesce(p_newly, '{}'))
  );
end;
$$;

revoke all on function public.chronorok_state(uuid, text[]) from public, anon, authenticated;

alter table public.student_chronorok_cards drop column if exists handed_over_at;

commit;
