-- Synthetic cohort/auth fixture. Production authorisation is not mocked as verified.
create function public.can_view_school_administration(uuid) returns boolean language sql as $$select true$$;
create function public.has_school_role(uuid,text[]) returns boolean language sql as $$select true$$;
create function public.can_view_student(uuid) returns boolean language sql as $$select true$$;
alter table public.students add column display_name text, add column first_name text, add column last_name text, add column username text, add column archived_at timestamptz;
create table public.academic_years(id uuid, school_id uuid);
create table public.student_access_entitlements(student_id uuid, school_id uuid,academic_year_id uuid,access_source text,status text,starts_at timestamptz,ends_at timestamptz);
create table public.class_enrollments(student_id uuid,school_id uuid,academic_year_id uuid,class_id uuid,status text,ended_at timestamptz,is_primary boolean,enrolled_at timestamptz);
insert into public.academic_years values('00000000-0000-0000-0000-000000000200','00000000-0000-0000-0000-000000000201');
insert into public.student_access_entitlements select id,'00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000200','school','active',now()-interval '90 days',null from public.students;
insert into public.class_enrollments select id,'00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000200',class_id,'active',null,true,now()-interval '90 days' from public.students;
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at)
select '00000000-0000-0000-0000-000000000010','number','prep-number','Prep',t.kind,t.score,now()-t.days*interval '1 day' from (values('pretest',40,25),('pretest',70,10),('posttest',90,1)) t(kind,score,days);
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('00000000-0000-0000-0000-000000000011','space','prep-space','Prep','pretest',98,now()-interval '10 days','{"assessment_evidence":{"comparison_group":"starpath-space-2026-09-14"}}');
create temporary table reports as select public.get_school_analytics_snapshot('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000200',30,null,null,'space') space,
public.get_school_analytics_snapshot('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000200',30,null,null,'number') number;
select public.test_assert((select space #>> '{overview,matchedGrowthPairs}'='1' and space #>> '{overview,averageGrowth}'='5.0' from reports),'Complete school analytics uses original Space baseline, not later retest');
select public.test_assert((select number #>> '{overview,averageGrowth}'='20.0' from reports),'Number analytics preserves latest-pretest growth');
select public.test_assert((select space #>> '{overview,students}'='2' and jsonb_array_length(space->'students')=2 from reports),'Teacher/school snapshot retains existing students');
select public.test_assert((select r->>'lessons'='1' and r->>'quizzes'='1' from reports,jsonb_array_elements(space->'realms') r where r->>'realmId'='space'),'Analytics retains existing lesson and quiz activity');
select public.test_assert((select (number-'generatedAt'-'methodology')=(public.test_old_school_analytics_snapshot('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000200',30,null,null,'number')-'generatedAt'-'methodology') from reports),'Entire Number analytics payload matches the previous implementation');
insert into public.student_realm_assessments(student_id,realm_id,program_key,working_level,assessment_type,score_percent,completed_at,placement_result)
values('00000000-0000-0000-0000-000000000011','space','prep-space','Prep','posttest',100,now()+interval '1 second','{"assessment_evidence":{"comparison_group":"incompatible-version"}}');
select public.test_assert(public.get_school_analytics_snapshot('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000200',30,null,null,'space') #>> '{overview,matchedGrowthPairs}'='0','Incompatible replacement bank is excluded from reported growth');
