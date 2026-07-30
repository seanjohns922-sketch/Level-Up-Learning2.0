begin;

-- Some legacy Number Nexus weekly quizzes treated only one string as correct
-- even when another option was an equivalent partition of the stated target.
-- Repair only immutable snapshots where the stored student expression can be
-- proven to equal the number in the stored prompt.
do $$
declare
  attempt record;
  question record;
  breakdown_item record;
  repaired_question jsonb;
  repaired_questions jsonb;
  repaired_breakdown jsonb;
  prompt_text text;
  student_expression text;
  target_match text[];
  target_value numeric;
  expression_value numeric;
  v_repaired_count integer;
  v_correct_count integer;
  v_total_count integer;
  v_accuracy_percent integer;
  lesson_number integer;
  lesson_correct integer;
  lesson_total integer;
begin
  for attempt in
    select
      id,
      student_id,
      realm_id,
      working_level,
      week,
      passed,
      summary,
      lesson_breakdown,
      total_questions
    from public.student_weekly_quiz_attempts
    where jsonb_typeof(summary->'questionResults') = 'array'
  loop
    repaired_questions := '[]'::jsonb;
    v_repaired_count := 0;
    v_correct_count := 0;
    v_total_count := 0;

    for question in
      select value
      from jsonb_array_elements(attempt.summary->'questionResults')
    loop
      repaired_question := question.value;
      v_total_count := v_total_count + 1;
      prompt_text := coalesce(question.value->>'question_text', '');
      student_expression := coalesce(question.value->>'student_answer', '');
      target_match := regexp_match(
        prompt_text,
        'different way to partition[[:space:]]+([0-9,]+)',
        'i'
      );
      if target_match is null then
        target_match := regexp_match(
          prompt_text,
          'expanded form matches[[:space:]]+([0-9,]+)',
          'i'
        );
      end if;

      if coalesce((question.value->>'correct')::boolean, false) = false
        and target_match is not null
        and student_expression ~ '^[[:space:]0-9,+.]+$'
      then
        target_value := replace(target_match[1], ',', '')::numeric;
        select sum(replace(trim(term), ',', '')::numeric)
        into expression_value
        from regexp_split_to_table(student_expression, '\+') as term
        where trim(term) <> '';

        if expression_value = target_value then
          repaired_question := question.value
            || jsonb_build_object(
              'correct', true,
              'response_status', 'correct',
              'correct_answer', question.value->'student_answer',
              'explanation', 'This partition is mathematically equivalent to the target number.',
              'integrity_repair', jsonb_build_object(
                'reason', 'equivalent_partition_answer',
                'original_correct_answer', question.value->'correct_answer',
                'repaired_at', now()
              )
            );
          v_repaired_count := v_repaired_count + 1;
        end if;
      end if;

      if coalesce((repaired_question->>'correct')::boolean, false) then
        v_correct_count := v_correct_count + 1;
      end if;
      repaired_questions := repaired_questions || jsonb_build_array(repaired_question);
    end loop;

    if v_repaired_count = 0 then
      continue;
    end if;

    v_accuracy_percent := case
      when greatest(attempt.total_questions, v_total_count) > 0
        then round(
          v_correct_count::numeric * 100 / greatest(attempt.total_questions, v_total_count)
        )::integer
      else 0
    end;

    repaired_breakdown := '[]'::jsonb;
    if jsonb_typeof(attempt.lesson_breakdown) = 'array' then
      for breakdown_item in
        select value
        from jsonb_array_elements(attempt.lesson_breakdown)
      loop
        lesson_number := nullif(breakdown_item.value->>'lessonNumber', '')::integer;
        select
          count(*)::integer,
          count(*) filter (where coalesce((item->>'correct')::boolean, false))::integer
        into lesson_total, lesson_correct
        from jsonb_array_elements(repaired_questions) as item
        where nullif(item->'lesson_mapping'->0->>'lesson', '')::integer = lesson_number;

        if lesson_total > 0 then
          repaired_breakdown := repaired_breakdown || jsonb_build_array(
            breakdown_item.value || jsonb_build_object(
              'correct', lesson_correct,
              'total', lesson_total,
              'percent', round(lesson_correct::numeric * 100 / lesson_total)::integer
            )
          );
        else
          repaired_breakdown := repaired_breakdown || jsonb_build_array(breakdown_item.value);
        end if;
      end loop;
    else
      repaired_breakdown := attempt.lesson_breakdown;
    end if;

    update public.student_weekly_quiz_attempts
    set
      correct_count = v_correct_count,
      accuracy_percent = v_accuracy_percent,
      passed = v_accuracy_percent >= 80,
      lesson_breakdown = repaired_breakdown,
      summary = summary
        || jsonb_build_object(
          'score', v_correct_count,
          'correct', v_correct_count,
          'percent', v_accuracy_percent,
          'accuracy', v_accuracy_percent,
          'passRate', v_accuracy_percent,
          'passed', v_accuracy_percent >= 80,
          'questionResults', repaired_questions,
          'lessonBreakdown', repaired_breakdown,
          'answer_integrity_repair', jsonb_build_object(
            'reason', 'equivalent_partition_answers',
            'questions_repaired', v_repaired_count,
            'repaired_at', now()
          )
        )
    where id = attempt.id;

    -- Match the canonical quiz-save rule if the corrected score changes this
    -- attempt from failed to passed. GREATEST preserves any later progress.
    if not attempt.passed and v_accuracy_percent >= 80 then
      update public.student_realm_progress
      set
        current_week = greatest(coalesce(current_week, attempt.week), attempt.week + 1),
        assigned_week = greatest(coalesce(assigned_week, attempt.week), attempt.week + 1),
        updated_at = now()
      where student_id = attempt.student_id
        and realm_id = attempt.realm_id
        and working_level = attempt.working_level;
    end if;
  end loop;
end;
$$;

commit;
