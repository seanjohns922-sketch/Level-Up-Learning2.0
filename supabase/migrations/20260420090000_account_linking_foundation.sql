-- Account linking foundation: one student profile shared between school and home.

alter table public.students alter column user_id drop not null;
alter table public.students alter column class_id drop not null;

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active',
  unique(student_id, class_id)
);

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null default 'guardian',
  status text not null default 'active',
  linked_at timestamptz not null default now(),
  unique(parent_user_id, student_id)
);

create table if not exists public.student_access_credentials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  credential_type text not null check (credential_type in ('pin', 'claim_code', 'qr_token')),
  credential_secret text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  revoked_at timestamptz
);

create unique index if not exists student_access_credentials_active_claim_unique
on public.student_access_credentials (credential_secret)
where credential_type = 'claim_code' and revoked_at is null;

create unique index if not exists student_access_credentials_active_qr_unique
on public.student_access_credentials (credential_secret)
where credential_type = 'qr_token' and revoked_at is null;

create index if not exists class_enrollments_class_id_idx on public.class_enrollments(class_id);
create index if not exists class_enrollments_student_id_idx on public.class_enrollments(student_id);
create index if not exists parent_student_links_parent_user_id_idx on public.parent_student_links(parent_user_id);
create index if not exists parent_student_links_student_id_idx on public.parent_student_links(student_id);
create index if not exists student_access_credentials_student_id_idx on public.student_access_credentials(student_id);

insert into public.class_enrollments (student_id, class_id)
select id, class_id
from public.students
where class_id is not null
on conflict (student_id, class_id) do nothing;

insert into public.student_access_credentials (student_id, credential_type, credential_secret)
select id, 'pin', pin
from public.students
where pin is not null
on conflict do nothing;

insert into public.student_access_credentials (student_id, credential_type, credential_secret)
select id, 'qr_token', qr_token
from public.students
where qr_token is not null
on conflict do nothing;

create or replace function public.generate_student_claim_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
  exists_check boolean;
begin
  loop
    code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
    select exists(
      select 1
      from public.student_access_credentials
      where credential_type = 'claim_code'
        and credential_secret = code
        and revoked_at is null
    ) into exists_check;
    exit when not exists_check;
  end loop;
  return code;
end;
$$;

create or replace function public.create_student_for_class(
  class_uuid uuid,
  display_name_input text,
  pin_input text default null
)
returns table(student_id uuid, pin text, claim_code text, qr_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text;
  generated_pin text;
  generated_claim text;
  generated_qr text;
  new_student_id uuid;
begin
  clean_name := nullif(trim(display_name_input), '');
  if clean_name is null then
    raise exception 'Student name is required';
  end if;

  if not exists (
    select 1 from public.classes c where c.id = class_uuid and c.teacher_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  generated_pin := nullif(trim(pin_input), '');
  if generated_pin is null then
    loop
      generated_pin := lpad(floor(random() * 10000)::text, 4, '0');
      exit when not exists (
        select 1 from public.students s where s.class_id = class_uuid and s.pin = generated_pin
      );
    end loop;
  end if;
  if generated_pin !~ '^\d{4}$' then
    raise exception 'PIN must be 4 digits';
  end if;
  if exists (select 1 from public.students s where s.class_id = class_uuid and s.pin = generated_pin) then
    raise exception 'That PIN is already used in this class';
  end if;

  generated_claim := public.generate_student_claim_code();
  generated_qr := public.generate_qr_token();
  new_student_id := gen_random_uuid();

  insert into public.students (id, class_id, display_name, pin, qr_token, user_id)
  values (new_student_id, class_uuid, clean_name, generated_pin, generated_qr, null);

  insert into public.class_enrollments (student_id, class_id)
  values (new_student_id, class_uuid)
  on conflict (student_id, class_id) do update set status = 'active', ended_at = null;

  insert into public.student_access_credentials (student_id, credential_type, credential_secret, created_by)
  values
    (new_student_id, 'pin', generated_pin, auth.uid()),
    (new_student_id, 'claim_code', generated_claim, auth.uid()),
    (new_student_id, 'qr_token', generated_qr, auth.uid());

  return query select new_student_id, generated_pin, generated_claim, generated_qr;
end;
$$;

create or replace function public.claim_student_profile(claim_code_input text)
returns table(student_id uuid, display_name text, class_id uuid, class_name text, link_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  credential_row public.student_access_credentials%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select * into credential_row
  from public.student_access_credentials
  where credential_type = 'claim_code'
    and credential_secret = upper(trim(claim_code_input))
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  order by created_at desc
  limit 1;

  if credential_row.id is null then
    raise exception 'Invalid or expired claim code';
  end if;

  insert into public.parent_student_links (parent_user_id, student_id)
  values (auth.uid(), credential_row.student_id)
  on conflict (parent_user_id, student_id) do update set status = 'active', linked_at = now();

  update public.student_access_credentials
  set used_at = coalesce(used_at, now())
  where id = credential_row.id;

  return query
  select s.id, s.display_name, c.id, c.name, 'home_linked'::text
  from public.students s
  left join public.class_enrollments ce on ce.student_id = s.id and ce.status = 'active'
  left join public.classes c on c.id = ce.class_id
  where s.id = credential_row.student_id
  limit 1;
end;
$$;

create or replace function public.lookup_student_by_qr(token text)
returns table(student_id uuid, display_name text, class_name text, user_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.display_name, c.name as class_name, s.user_id
  from public.students s
  left join public.class_enrollments ce on ce.student_id = s.id and ce.status = 'active'
  left join public.classes c on c.id = coalesce(s.class_id, ce.class_id)
  where s.qr_token = token
     or exists (
       select 1 from public.student_access_credentials sac
       where sac.student_id = s.id
         and sac.credential_type = 'qr_token'
         and sac.credential_secret = token
         and sac.revoked_at is null
     )
  limit 1;
$$;

drop function if exists public.verify_student_pin(text, text);

create or replace function public.verify_student_pin(token text, pin_input text)
returns table(user_id uuid, student_id uuid, display_name text, class_code text)
language sql
stable
security definer
set search_path = public
as $$
  select s.user_id, s.id, s.display_name, c.class_code
  from public.students s
  left join public.class_enrollments ce on ce.student_id = s.id and ce.status = 'active'
  left join public.classes c on c.id = coalesce(s.class_id, ce.class_id)
  where (s.qr_token = token or exists (
      select 1 from public.student_access_credentials qr
      where qr.student_id = s.id
        and qr.credential_type = 'qr_token'
        and qr.credential_secret = token
        and qr.revoked_at is null
    ))
    and (s.pin = pin_input or exists (
      select 1 from public.student_access_credentials pin
      where pin.student_id = s.id
        and pin.credential_type = 'pin'
        and pin.credential_secret = pin_input
        and pin.revoked_at is null
    ))
  limit 1;
$$;

create or replace function public.regenerate_student_qr(student_uuid uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_token text;
begin
  if not exists (
    select 1
    from public.students s
    left join public.class_enrollments ce on ce.student_id = s.id and ce.status = 'active'
    join public.classes c on c.id = coalesce(s.class_id, ce.class_id)
    where s.id = student_uuid and c.teacher_id = auth.uid()
  ) then
    raise exception 'Unauthorized';
  end if;

  new_token := public.generate_qr_token();
  update public.students set qr_token = new_token where id = student_uuid;
  update public.student_access_credentials set revoked_at = now()
  where student_id = student_uuid and credential_type = 'qr_token' and revoked_at is null;
  insert into public.student_access_credentials (student_id, credential_type, credential_secret, created_by)
  values (student_uuid, 'qr_token', new_token, auth.uid());
  return new_token;
end;
$$;

alter table public.class_enrollments enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.student_access_credentials enable row level security;

drop policy if exists "Teachers can manage class enrollments" on public.class_enrollments;
create policy "Teachers can manage class enrollments"
on public.class_enrollments
for all
to authenticated
using (exists (select 1 from public.classes c where c.id = class_enrollments.class_id and c.teacher_id = auth.uid()))
with check (exists (select 1 from public.classes c where c.id = class_enrollments.class_id and c.teacher_id = auth.uid()));

drop policy if exists "Parents can read own student links" on public.parent_student_links;
create policy "Parents can read own student links"
on public.parent_student_links
for select
to authenticated
using (parent_user_id = auth.uid());

drop policy if exists "Teachers can read parent links for class students" on public.parent_student_links;
create policy "Teachers can read parent links for class students"
on public.parent_student_links
for select
to authenticated
using (exists (
  select 1
  from public.class_enrollments ce
  join public.classes c on c.id = ce.class_id
  where ce.student_id = parent_student_links.student_id
    and c.teacher_id = auth.uid()
));

drop policy if exists "Parents can read linked students" on public.students;
create policy "Parents can read linked students"
on public.students
for select
to authenticated
using (exists (
  select 1 from public.parent_student_links psl
  where psl.student_id = students.id
    and psl.parent_user_id = auth.uid()
    and psl.status = 'active'
));

drop policy if exists "Teachers can insert class students" on public.students;
create policy "Teachers can insert class students"
on public.students
for insert
to authenticated
with check (class_id is null or exists (
  select 1 from public.classes c where c.id = students.class_id and c.teacher_id = auth.uid()
));

drop policy if exists "Parents can read linked progress" on public.progress;
create policy "Parents can read linked progress"
on public.progress
for select
to authenticated
using (exists (
  select 1 from public.parent_student_links psl
  where psl.student_id = progress.student_id
    and psl.parent_user_id = auth.uid()
    and psl.status = 'active'
));

drop policy if exists "Parents can update linked progress" on public.progress;
create policy "Parents can update linked progress"
on public.progress
for update
to authenticated
using (exists (
  select 1 from public.parent_student_links psl
  where psl.student_id = progress.student_id
    and psl.parent_user_id = auth.uid()
    and psl.status = 'active'
));

drop policy if exists "Parents can insert linked progress" on public.progress;
create policy "Parents can insert linked progress"
on public.progress
for insert
to authenticated
with check (exists (
  select 1 from public.parent_student_links psl
  where psl.student_id = progress.student_id
    and psl.parent_user_id = auth.uid()
    and psl.status = 'active'
));

drop policy if exists "Teachers can read class student credentials" on public.student_access_credentials;
create policy "Teachers can read class student credentials"
on public.student_access_credentials
for select
to authenticated
using (exists (
  select 1
  from public.class_enrollments ce
  join public.classes c on c.id = ce.class_id
  where ce.student_id = student_access_credentials.student_id
    and c.teacher_id = auth.uid()
));
