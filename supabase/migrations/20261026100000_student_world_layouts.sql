-- Each learner's built world (placed items and painted ground) is saved to
-- their account, so it follows them to any device. Until now it lived only in
-- the browser that built it.
--
-- Access is through the two functions below only (RLS on, no table policies):
--   get_student_world_layout_secure   student-read boundary (student, teacher, linked parent)
--   save_student_world_layout_secure  student-write boundary (student session or teacher; never a parent)
-- Rollback: drop the two functions and the table. Nothing else depends on them;
-- the app falls back to the browser copy if they are missing.

create table if not exists public.student_world_layouts (
  student_id uuid primary key references public.students(id) on delete cascade,
  placements jsonb not null default '[]'::jsonb,
  ground_tiles jsonb not null default '[]'::jsonb,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint student_world_layouts_placements_array check (jsonb_typeof(placements) = 'array'),
  constraint student_world_layouts_ground_array check (jsonb_typeof(ground_tiles) = 'array')
);

alter table public.student_world_layouts enable row level security;
revoke all on table public.student_world_layouts from public, anon, authenticated;

create or replace function public.get_student_world_layout_secure(p_student_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  layout public.student_world_layouts%rowtype;
begin
  perform public.assert_student_read(p_student_id);
  select * into layout from public.student_world_layouts where student_id = p_student_id;
  if layout.student_id is null then
    return null;
  end if;
  return jsonb_build_object(
    'placements', layout.placements,
    'groundTiles', layout.ground_tiles,
    'revision', layout.revision,
    'updatedAt', layout.updated_at
  );
end;
$$;

create or replace function public.save_student_world_layout_secure(
  p_student_id uuid,
  p_placements jsonb,
  p_ground_tiles jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  saved public.student_world_layouts%rowtype;
begin
  perform public.assert_student_write(p_student_id);
  if jsonb_typeof(p_placements) is distinct from 'array' or jsonb_typeof(p_ground_tiles) is distinct from 'array' then
    raise exception 'World layout must be two lists' using errcode = '22023';
  end if;
  -- The world grid is 46 x 43 cells, so these limits are far above any real build.
  if jsonb_array_length(p_placements) > 3000 or jsonb_array_length(p_ground_tiles) > 5000 then
    raise exception 'World layout is too large' using errcode = '22023';
  end if;
  if pg_column_size(p_placements) + pg_column_size(p_ground_tiles) > 1048576 then
    raise exception 'World layout is too large' using errcode = '22023';
  end if;

  insert into public.student_world_layouts(student_id, placements, ground_tiles)
  values (p_student_id, p_placements, p_ground_tiles)
  on conflict (student_id) do update
    set placements = excluded.placements,
        ground_tiles = excluded.ground_tiles,
        revision = public.student_world_layouts.revision + 1,
        updated_at = now()
  returning * into saved;

  return jsonb_build_object('revision', saved.revision, 'updatedAt', saved.updated_at);
end;
$$;

revoke all on function public.get_student_world_layout_secure(uuid) from public;
revoke all on function public.save_student_world_layout_secure(uuid, jsonb, jsonb) from public;
-- Student sessions run as anon with the validated x-student-session header.
grant execute on function public.get_student_world_layout_secure(uuid) to anon, authenticated;
grant execute on function public.save_student_world_layout_secure(uuid, jsonb, jsonb) to anon, authenticated;
