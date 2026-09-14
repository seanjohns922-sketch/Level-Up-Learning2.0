-- Compare the old and revised completion functions with the same pathway inputs.
do $$
declare realm text; score int; assessment_kind text; old_student uuid; new_student uuid; payload jsonb; old_rows jsonb; new_rows jsonb;
begin
 foreach realm in array array['number','measurement','space','statistics','pattern','chance'] loop
  foreach assessment_kind in array array['pretest','posttest'] loop
  foreach score in array array[40,49,50,70,84,85,95] loop
   old_student:=gen_random_uuid();new_student:=gen_random_uuid();
   insert into public.students(id,class_id,school_year_level,year_level) values(old_student,'00000000-0000-0000-0000-000000000001','Year 3','Year 3'),(new_student,'00000000-0000-0000-0000-000000000001','Year 3','Year 3');
   payload:=jsonb_build_object('status',case when score>=85 then 'PASSED' else 'ASSIGNED_PROGRAM' end,'placement_complete',true,'current_week',case when score>=50 and score<85 then 3 else 1 end,'assigned_week',1,'required_weeks','[3,4,5]'::jsonb,'optional_weeks','[1,2]'::jsonb,'unlocked_legends','["kept-reward"]'::jsonb,'next_working_level',case when score>=85 and assessment_kind='pretest' then 'Year 4' else null end);
   perform public.test_old_complete_realm_assessment(old_student,'00000000-0000-0000-0000-000000000001',realm,public.realm_program_key('Year 3',realm),'Year 3','Year 3',assessment_kind,gen_random_uuid(),jsonb_build_object('score_percent',score),payload);
   perform public.complete_realm_assessment(new_student,'00000000-0000-0000-0000-000000000001',realm,public.realm_program_key('Year 3',realm),'Year 3','Year 3',assessment_kind,gen_random_uuid(),jsonb_build_object('score_percent',score),payload);
   select jsonb_agg(to_jsonb(t)-'id'-'student_id'-'created_at'-'updated_at' order by working_level) into old_rows from public.student_realm_progress t where student_id=old_student;
   select jsonb_agg(to_jsonb(t)-'id'-'student_id'-'created_at'-'updated_at' order by working_level) into new_rows from public.student_realm_progress t where student_id=new_student;
   perform public.test_assert(old_rows=new_rows,realm||' '||assessment_kind||' score '||score||': higher-level pathway exactly matches previous database function');
  end loop;
 end loop;
 end loop;
end $$;
