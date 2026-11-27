-- Website sign-ups: the reliq.au waiting list, "notify me" lists and school enquiries.
--
-- The marketing site (a separate Vercel project) collects these through four forms:
--   waitlist        Families page "Join the waitlist" (also every page's header button)
--   store           Store page "Notify me"
--   literacy        Literacy page "Notify me"
--   school_enquiry  Schools page enquiry form (name, role, school, email, phone, state, size)
--
-- Security: the table is closed to anon and authenticated (RLS on, no policies, no
-- grants). The site only holds the public anon key and can do exactly two things:
--   website_join_list(...)     validate and store one sign-up, throttled
--   website_unsubscribe(token) stop all marketing email to that address
-- Neither returns anything about other people. An unsubscribe token is only handed
-- back when a row is new or re-joined, so the site can put it in that confirmation email.
-- Mailing lists, exports and the January launch email read the table with the service
-- role (SQL Editor or a server script).
--
-- Data: none changed. Rollback: drop the two functions and the table.

begin;

create table if not exists public.website_signups (
  id uuid primary key default gen_random_uuid(),
  list text not null check (list in ('waitlist', 'store', 'literacy', 'school_enquiry')),
  email text not null check (char_length(email) between 3 and 254),
  email_normalized text generated always as (lower(btrim(email))) stored,
  full_name text check (char_length(full_name) <= 120),
  role text check (role in ('parent', 'teacher', 'school_leader', 'business_manager', 'other')),
  school_name text check (char_length(school_name) <= 160),
  phone text check (char_length(phone) <= 40),
  state text check (state in ('VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  student_count integer check (student_count between 1 and 20000),
  message text check (char_length(message) <= 2000),
  source_page text check (char_length(source_page) <= 200),
  client_key text check (char_length(client_key) <= 128),
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.website_signups is
  'reliq.au waiting list, notify-me lists and school enquiries. Service role only; the site writes through website_join_list.';
comment on column public.website_signups.client_key is
  'Salted hash of the sender''s IP address, set by the website server, used only for throttling.';

-- One row per address per list (enquiries can repeat).
create unique index if not exists website_signups_list_email_key
  on public.website_signups (list, email_normalized)
  where list <> 'school_enquiry';
create index if not exists website_signups_created_idx on public.website_signups (created_at);
create index if not exists website_signups_client_idx on public.website_signups (client_key, created_at);
create index if not exists website_signups_email_idx on public.website_signups (email_normalized);

alter table public.website_signups enable row level security;
revoke all on public.website_signups from public, anon, authenticated;

create or replace function public.website_join_list(
  p_list text,
  p_email text,
  p_source_page text default null,
  p_client_key text default null,
  p_full_name text default null,
  p_role text default null,
  p_school_name text default null,
  p_phone text default null,
  p_state text default null,
  p_student_count integer default null,
  p_message text default null
)
returns table (status text, unsubscribe_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_list text := btrim(coalesce(p_list, ''));
  v_client text := nullif(btrim(coalesce(p_client_key, '')), '');
  v_row public.website_signups%rowtype;
begin
  if v_list not in ('waitlist', 'store', 'literacy', 'school_enquiry') then
    raise exception 'Unknown list' using errcode = '22023';
  end if;
  if char_length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address' using errcode = '22023';
  end if;
  if v_list = 'school_enquiry' and (
    nullif(btrim(coalesce(p_full_name, '')), '') is null
    or nullif(btrim(coalesce(p_school_name, '')), '') is null
  ) then
    raise exception 'Name and school are required' using errcode = '22023';
  end if;

  -- Throttle: 8 sign-ups an hour from one sender, 300 every 10 minutes site-wide.
  perform pg_advisory_xact_lock(hashtext('website_join_list'));
  if v_client is not null and (
    select count(*) from public.website_signups s
    where s.client_key = v_client and s.created_at > now() - interval '1 hour'
  ) >= 8 then
    return query select 'rate_limited'::text, null::uuid;
    return;
  end if;
  if (
    select count(*) from public.website_signups s
    where s.created_at > now() - interval '10 minutes'
  ) >= 300 then
    return query select 'rate_limited'::text, null::uuid;
    return;
  end if;

  if v_list = 'school_enquiry' then
    insert into public.website_signups (
      list, email, full_name, role, school_name, phone, state, student_count, message, source_page, client_key
    ) values (
      v_list, v_email,
      nullif(btrim(p_full_name), ''), nullif(btrim(coalesce(p_role, '')), ''),
      nullif(btrim(p_school_name), ''), nullif(btrim(coalesce(p_phone, '')), ''),
      nullif(btrim(coalesce(p_state, '')), ''), p_student_count,
      nullif(btrim(coalesce(p_message, '')), ''), left(p_source_page, 200), v_client
    )
    returning * into v_row;
    return query select 'received'::text, v_row.unsubscribe_token;
    return;
  end if;

  select * into v_row from public.website_signups s
  where s.list = v_list and s.email_normalized = v_email
  for update;

  if not found then
    insert into public.website_signups (list, email, role, source_page, client_key)
    values (v_list, v_email, nullif(btrim(coalesce(p_role, '')), ''), left(p_source_page, 200), v_client)
    returning * into v_row;
    return query select 'joined'::text, v_row.unsubscribe_token;
  elsif v_row.unsubscribed_at is not null then
    update public.website_signups s
    set unsubscribed_at = null, updated_at = now()
    where s.id = v_row.id;
    return query select 'joined'::text, v_row.unsubscribe_token;
  else
    return query select 'already'::text, null::uuid;
  end if;
end;
$$;

comment on function public.website_join_list is
  'Stores one reliq.au sign-up. Returns joined (send a confirmation), already, received (school enquiry) or rate_limited.';

create or replace function public.website_unsubscribe(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select s.email_normalized into v_email from public.website_signups s where s.unsubscribe_token = p_token;
  if v_email is null then
    return false;
  end if;
  update public.website_signups s
  set unsubscribed_at = coalesce(s.unsubscribed_at, now()), updated_at = now()
  where s.email_normalized = v_email;
  return true;
end;
$$;

comment on function public.website_unsubscribe is
  'Stops all reliq.au marketing email to the address that owns this token. Returns false for an unknown token.';

revoke all on function public.website_join_list(text, text, text, text, text, text, text, text, text, integer, text) from public;
revoke all on function public.website_unsubscribe(uuid) from public;
grant execute on function public.website_join_list(text, text, text, text, text, text, text, text, text, integer, text) to anon, authenticated, service_role;
grant execute on function public.website_unsubscribe(uuid) to anon, authenticated, service_role;

commit;
