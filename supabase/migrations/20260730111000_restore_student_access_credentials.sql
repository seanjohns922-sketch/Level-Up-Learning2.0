begin;

-- Some production databases were provisioned without the account-linking
-- foundation migration. The school directory and student creation commands
-- both rely on this canonical credential history, so restore it additively.
create table if not exists public.student_access_credentials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  credential_type text not null check (
    credential_type in ('pin', 'claim_code', 'qr_token')
  ),
  credential_secret text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  revoked_at timestamptz
);

alter table public.student_access_credentials enable row level security;

create unique index if not exists
  student_access_credentials_active_claim_unique
on public.student_access_credentials (credential_secret)
where credential_type = 'claim_code' and revoked_at is null;

create unique index if not exists
  student_access_credentials_active_qr_unique
on public.student_access_credentials (credential_secret)
where credential_type = 'qr_token' and revoked_at is null;

create index if not exists student_access_credentials_student_id_idx
on public.student_access_credentials(student_id);

insert into public.student_access_credentials (
  student_id,
  credential_type,
  credential_secret
)
select
  student.id,
  'pin',
  student.pin
from public.students student
where student.pin is not null
  and not exists (
    select 1
    from public.student_access_credentials credential
    where credential.student_id = student.id
      and credential.credential_type = 'pin'
      and credential.credential_secret = student.pin
      and credential.revoked_at is null
  )
on conflict do nothing;

insert into public.student_access_credentials (
  student_id,
  credential_type,
  credential_secret
)
select
  student.id,
  'qr_token',
  student.qr_token
from public.students student
where student.qr_token is not null
  and not exists (
    select 1
    from public.student_access_credentials credential
    where credential.student_id = student.id
      and credential.credential_type = 'qr_token'
      and credential.credential_secret = student.qr_token
      and credential.revoked_at is null
  )
on conflict do nothing;

drop policy if exists "Teachers can read class student credentials"
  on public.student_access_credentials;
create policy "Teachers can read class student credentials"
on public.student_access_credentials
for select
to authenticated
using (
  exists (
    select 1
    from public.class_enrollments enrolment
    join public.classes class on class.id = enrolment.class_id
    where enrolment.student_id = student_access_credentials.student_id
      and (
        class.teacher_id = auth.uid()
        or public.can_manage_class(class.id)
      )
  )
);

revoke all on public.student_access_credentials from public, anon;
grant select on public.student_access_credentials to authenticated;

commit;
