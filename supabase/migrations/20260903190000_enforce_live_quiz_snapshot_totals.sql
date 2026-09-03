begin;

-- Live Class telemetry is advisory. Weekly quiz snapshots must honour the
-- canonical 15-question contract even if a client misses its quiz-start reset
-- or asynchronous events arrive out of order.
create or replace function public.enforce_live_weekly_quiz_snapshot_total()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if lower(coalesce(new.current_lesson_title, '')) = 'weekly quiz'
    or lower(coalesce(new.current_lesson, '')) like '%weekly%quiz%'
  then
    new.questions_answered := least(15, greatest(0, coalesce(new.questions_answered, 0)));
    new.correct_count := least(
      new.questions_answered,
      greatest(0, coalesce(new.correct_count, 0))
    );
    new.accuracy_percent := case
      when new.questions_answered > 0
        then round(new.correct_count::numeric * 100 / new.questions_answered)::integer
      else 0
    end;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_live_weekly_quiz_snapshot_total() from public, anon, authenticated;

drop trigger if exists trg_enforce_live_weekly_quiz_snapshot_total
  on public.live_student_activity;
create trigger trg_enforce_live_weekly_quiz_snapshot_total
before insert or update on public.live_student_activity
for each row execute function public.enforce_live_weekly_quiz_snapshot_total();

-- Repair every existing affected snapshot. Canonical saved quiz attempts are
-- untouched; they already store their true 15-question results.
update public.live_student_activity
set
  questions_answered = least(15, greatest(0, coalesce(questions_answered, 0))),
  correct_count = least(
    least(15, greatest(0, coalesce(questions_answered, 0))),
    greatest(0, coalesce(correct_count, 0))
  ),
  accuracy_percent = case
    when least(15, greatest(0, coalesce(questions_answered, 0))) > 0
      then round(
        least(
          least(15, greatest(0, coalesce(questions_answered, 0))),
          greatest(0, coalesce(correct_count, 0))
        )::numeric * 100
        / least(15, greatest(0, coalesce(questions_answered, 0)))
      )::integer
    else 0
  end,
  updated_at = now()
where lower(coalesce(current_lesson_title, '')) = 'weekly quiz'
   or lower(coalesce(current_lesson, '')) like '%weekly%quiz%';

commit;
