begin;

-- ── Global Gem Vault — Phase 3: database foundation ─────────────────────────
-- Permanent achievement collectibles earned through learning milestones.
-- All writes are server-controlled (SECURITY DEFINER + assert_student_access);
-- students can never self-award. Awards live in Phase 4 (milestone evaluator).

create table if not exists public.gem_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  rarity text not null check (rarity in ('common','uncommon','rare','epic','legendary')),
  category text not null,
  milestone_type text not null,
  threshold integer not null default 0,
  realm_id text null,
  asset_key text not null,
  silhouette_asset_key text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  active_for_completion boolean not null default true,
  available_from timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_gems (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  gem_id uuid not null references public.gem_definitions(id) on delete cascade,
  award_event_key text null,
  earned_at timestamptz not null default now(),
  source_type text not null default 'milestone',
  source_id text null,
  metadata jsonb not null default '{}'::jsonb,
  unique (student_id, gem_id)
);
create index if not exists idx_student_gems_student on public.student_gems(student_id, earned_at desc);

create table if not exists public.student_gem_display (
  student_id uuid primary key references public.students(id) on delete cascade,
  favourite_gem_id uuid null references public.gem_definitions(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.gem_award_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  gem_id uuid not null references public.gem_definitions(id) on delete cascade,
  event_key text not null,
  trigger_type text null,
  trigger_id text null,
  created_at timestamptz not null default now(),
  unique (student_id, gem_id, event_key)
);

-- All access via security-definer RPCs — revoke direct table access.
alter table public.gem_definitions enable row level security;
alter table public.student_gems enable row level security;
alter table public.student_gem_display enable row level security;
alter table public.gem_award_events enable row level security;
revoke all on public.gem_definitions from public, anon, authenticated;
revoke all on public.student_gems from public, anon, authenticated;
revoke all on public.student_gem_display from public, anon, authenticated;
revoke all on public.gem_award_events from public, anon, authenticated;

-- Seed catalogue (idempotent upsert on slug).
insert into public.gem_definitions
  (slug,name,description,rarity,category,milestone_type,threshold,realm_id,asset_key,silhouette_asset_key,display_order,is_active,active_for_completion)
values
  ('first-steps-quartz','First Steps Quartz','Complete 1 lesson','common','lessons','lessons_completed',1,null,'first-steps-quartz','sil-common',10,true,true),
  ('granite-of-growth','Granite of Growth','Complete 5 lessons','common','lessons','lessons_completed',5,null,'granite-of-growth','sil-common',20,true,true),
  ('sandstone-scholar','Sandstone Scholar','Complete 10 lessons','common','lessons','lessons_completed',10,null,'sandstone-scholar','sil-common',30,true,true),
  ('marble-milestone','Marble Milestone','Complete 15 lessons','uncommon','lessons','lessons_completed',15,null,'marble-milestone','sil-uncommon',40,true,true),
  ('jade-journey-stone','Jade Journey Stone','Complete 25 lessons','uncommon','lessons','lessons_completed',25,null,'jade-journey-stone','sil-uncommon',50,true,true),
  ('emerald-explorer','Emerald Explorer','Complete 50 lessons','rare','lessons','lessons_completed',50,null,'emerald-explorer','sil-rare',60,true,true),
  ('ruby-of-persistence','Ruby of Persistence','Complete 100 lessons','rare','lessons','lessons_completed',100,null,'ruby-of-persistence','sil-rare',70,true,true),
  ('sapphire-scholar','Sapphire Scholar','Complete 200 lessons','epic','lessons','lessons_completed',200,null,'sapphire-scholar','sil-epic',80,true,true),
  ('diamond-of-dedication','Diamond of Dedication','Complete 350 lessons','epic','lessons','lessons_completed',350,null,'diamond-of-dedication','sil-epic',90,true,true),
  ('celestial-learning-crystal','Celestial Learning Crystal','Complete 500 lessons','legendary','lessons','lessons_completed',500,null,'celestial-learning-crystal','sil-legendary',100,true,true),
  ('amethyst-accuracy','Amethyst Accuracy','Complete 1 lesson with 100% accuracy','common','perfect','perfect_lessons',1,null,'amethyst-accuracy','sil-common',10,true,true),
  ('tiger-eye-focus','Tiger Eye Focus','Complete 5 perfect lessons','uncommon','perfect','perfect_lessons',5,null,'tiger-eye-focus','sil-uncommon',20,true,true),
  ('aquamarine-precision','Aquamarine Precision','Complete 10 perfect lessons','uncommon','perfect','perfect_lessons',10,null,'aquamarine-precision','sil-uncommon',30,true,true),
  ('topaz-mastery','Topaz Mastery','Complete 15 perfect lessons','rare','perfect','perfect_lessons',15,null,'topaz-mastery','sil-rare',40,true,true),
  ('sapphire-accuracy','Sapphire Accuracy','Complete 25 perfect lessons','rare','perfect','perfect_lessons',25,null,'sapphire-accuracy','sil-rare',50,true,true),
  ('black-diamond-focus','Black Diamond Focus','Complete 50 perfect lessons','epic','perfect','perfect_lessons',50,null,'black-diamond-focus','sil-epic',60,true,true),
  ('phoenix-ruby','Phoenix Ruby','Complete 100 perfect lessons','legendary','perfect','perfect_lessons',100,null,'phoenix-ruby','sil-legendary',70,true,true),
  ('agate-challenger','Agate Challenger','Pass your first weekly quiz','common','quizzes_tests','weekly_quizzes_passed',1,null,'agate-challenger','sil-common',10,true,true),
  ('citrine-quiz-star','Citrine Quiz Star','Earn 100% on a weekly quiz','uncommon','quizzes_tests','perfect_weekly_quizzes',1,null,'citrine-quiz-star','sil-uncommon',20,true,true),
  ('moonstone-quiz-master','Moonstone Quiz Master','Earn 100% on 5 weekly quizzes','rare','quizzes_tests','perfect_weekly_quizzes',5,null,'moonstone-quiz-master','sil-rare',30,true,true),
  ('opal-of-excellence','Opal of Excellence','Earn 100% on 10 weekly quizzes','rare','quizzes_tests','perfect_weekly_quizzes',10,null,'opal-of-excellence','sil-rare',40,true,true),
  ('star-sapphire','Star Sapphire','Earn 100% on 20 weekly quizzes','epic','quizzes_tests','perfect_weekly_quizzes',20,null,'star-sapphire','sil-epic',50,true,true),
  ('aurora-diamond','Aurora Diamond','Earn 100% on 40 weekly quizzes','legendary','quizzes_tests','perfect_weekly_quizzes',40,null,'aurora-diamond','sil-legendary',60,true,true),
  ('pathfinder-crystal','Pathfinder Crystal','Complete your first pre-test','common','quizzes_tests','pretests_completed',1,null,'pathfinder-crystal','sil-common',70,true,true),
  ('mastery-peridot','Mastery Peridot','Pass your first post-test','uncommon','quizzes_tests','posttests_passed',1,null,'mastery-peridot','sil-uncommon',80,true,true),
  ('alexandrite-achiever','Alexandrite Achiever','Pass 3 post-tests','rare','quizzes_tests','posttests_passed',3,null,'alexandrite-achiever','sil-rare',90,true,true),
  ('crown-emerald','Crown Emerald','Pass 5 post-tests','epic','quizzes_tests','posttests_passed',5,null,'crown-emerald','sil-epic',100,true,true),
  ('eternal-mastery-crystal','Eternal Mastery Crystal','Pass 10 post-tests across all realms','legendary','quizzes_tests','posttests_passed',10,null,'eternal-mastery-crystal','sil-legendary',110,true,true),
  ('sunstone-spark','Sunstone Spark','Reach a 3-day learning streak','common','streaks_xp','streak_days',3,null,'sunstone-spark','sil-common',10,true,true),
  ('rose-quartz-routine','Rose Quartz Routine','Reach a 5-day learning streak','uncommon','streaks_xp','streak_days',5,null,'rose-quartz-routine','sil-uncommon',20,true,true),
  ('blue-sapphire-streak','Blue Sapphire Streak','Reach a 10-day learning streak','rare','streaks_xp','streak_days',10,null,'blue-sapphire-streak','sil-rare',30,true,true),
  ('fire-opal-commitment','Fire Opal Commitment','Reach a 20-day learning streak','epic','streaks_xp','streak_days',20,null,'fire-opal-commitment','sil-epic',40,true,true),
  ('eternal-flame-crystal','Eternal Flame Crystal','Reach a 50-day learning streak','legendary','streaks_xp','streak_days',50,null,'eternal-flame-crystal','sil-legendary',50,true,true),
  ('amber-spark','Amber Spark','Earn 500 lifetime XP','common','streaks_xp','lifetime_xp',500,null,'amber-spark','sil-common',60,true,true),
  ('jade-energy-stone','Jade Energy Stone','Earn 1,000 lifetime XP','uncommon','streaks_xp','lifetime_xp',1000,null,'jade-energy-stone','sil-uncommon',70,true,true),
  ('ruby-powerstone','Ruby Powerstone','Earn 2,500 lifetime XP','rare','streaks_xp','lifetime_xp',2500,null,'ruby-powerstone','sil-rare',80,true,true),
  ('diamond-explorer-core','Diamond Explorer Core','Earn 5,000 lifetime XP','epic','streaks_xp','lifetime_xp',5000,null,'diamond-explorer-core','sil-epic',90,true,true),
  ('celestial-xp-crystal','Celestial XP Crystal','Earn 10,000 lifetime XP','legendary','streaks_xp','lifetime_xp',10000,null,'celestial-xp-crystal','sil-legendary',100,true,true),
  ('bronze-explorer-stone','Bronze Explorer Stone','Reach Explorer Rank 5','common','explorer','explorer_rank',5,null,'bronze-explorer-stone','sil-common',10,true,true),
  ('silver-explorer-gem','Silver Explorer Gem','Reach Explorer Rank 10','uncommon','explorer','explorer_rank',10,null,'silver-explorer-gem','sil-uncommon',20,true,true),
  ('gold-explorer-emerald','Gold Explorer Emerald','Reach Explorer Rank 25','rare','explorer','explorer_rank',25,null,'gold-explorer-emerald','sil-rare',30,true,true),
  ('master-explorer-diamond','Master Explorer Diamond','Reach Explorer Rank 50','epic','explorer','explorer_rank',50,null,'master-explorer-diamond','sil-epic',40,true,true),
  ('legendary-explorer-crystal','Legendary Explorer Crystal','Reach Explorer Rank 100','legendary','explorer','explorer_rank',100,null,'legendary-explorer-crystal','sil-legendary',50,true,true),
  ('first-legend-amethyst','First Legend Amethyst','Unlock your first Legend','common','explorer','legends_unlocked',1,null,'first-legend-amethyst','sil-common',60,true,true),
  ('ruby-legendstone','Ruby Legendstone','Unlock 5 Legends','uncommon','explorer','legends_unlocked',5,null,'ruby-legendstone','sil-uncommon',70,true,true),
  ('star-sapphire-legend','Star Sapphire Legend','Unlock 10 Legends','rare','explorer','legends_unlocked',10,null,'star-sapphire-legend','sil-rare',80,true,true),
  ('diamond-hallstone','Diamond Hallstone','Unlock 25 Legends','epic','explorer','legends_unlocked',25,null,'diamond-hallstone','sil-epic',90,true,true),
  ('eternal-legend-crystal','Eternal Legend Crystal','Unlock every available Legend across all live realms','legendary','explorer','all_live_legends',0,null,'eternal-legend-crystal','sil-legendary',100,true,true),
  ('nexus-energy-gem','Nexus Energy Gem','Complete your first Number Nexus level','rare','realm','realm_levels_completed',1,'number','nexus-energy-gem','sil-rare',10,true,true),
  ('quantum-numbot-core','Quantum Numbot Core','Collect every Number Nexus Legend','legendary','realm','realm_legends_completed',7,'number','quantum-numbot-core','sil-legendary',20,true,true),
  ('surveyor-emerald','Surveyor Emerald','Complete your first Measurelands level','rare','realm','realm_levels_completed',1,'measurement','surveyor-emerald','sil-rare',30,true,true),
  ('master-measure-crystal','Master Measure Crystal','Collect every Measurelands Legend','legendary','realm','realm_legends_completed',7,'measurement','master-measure-crystal','sil-legendary',40,true,true),
  ('pattern-rune-gem','Pattern Rune Gem','Complete your first Pattern Peaks level','rare','realm','realm_levels_completed',1,'pattern-peaks','pattern-rune-gem','sil-rare',50,false,false),
  ('infinite-pattern-crystal','Infinite Pattern Crystal','Collect every Pattern Peaks Legend','legendary','realm','realm_legends_completed',7,'pattern-peaks','infinite-pattern-crystal','sil-legendary',60,false,false),
  ('data-prism','Data Prism','Complete your first Statistica level','rare','realm','realm_levels_completed',1,'statistica','data-prism','sil-rare',70,false,false),
  ('grand-analyst-crystal','Grand Analyst Crystal','Collect every Statistica Legend','legendary','realm','realm_legends_completed',7,'statistica','grand-analyst-crystal','sil-legendary',80,false,false),
  ('fortune-stone','Fortune Stone','Complete your first Chance Hollow level','rare','realm','realm_levels_completed',1,'chance-hollow','fortune-stone','sil-rare',90,false,false),
  ('probability-pearl','Probability Pearl','Collect every Chance Hollow Legend','legendary','realm','realm_legends_completed',7,'chance-hollow','probability-pearl','sil-legendary',100,false,false),
  ('starstone','Starstone','Complete your first Starpath level','rare','realm','realm_levels_completed',1,'starpath','starstone','sil-rare',110,false,false),
  ('celestial-navigator-crystal','Celestial Navigator Crystal','Collect every Starpath Legend','legendary','realm','realm_legends_completed',7,'starpath','celestial-navigator-crystal','sil-legendary',120,false,false),
  ('time-fragment','Time Fragment','Complete your first Chronoscape level','rare','realm','realm_levels_completed',1,'chronoscape','time-fragment','sil-rare',130,false,false),
  ('eternal-time-crystal','Eternal Time Crystal','Collect every Chronoscape Legend','legendary','realm','realm_legends_completed',7,'chronoscape','eternal-time-crystal','sil-legendary',140,false,false)
on conflict (slug) do update set
  name=excluded.name, description=excluded.description, rarity=excluded.rarity,
  category=excluded.category, milestone_type=excluded.milestone_type, threshold=excluded.threshold,
  realm_id=excluded.realm_id, asset_key=excluded.asset_key, silhouette_asset_key=excluded.silhouette_asset_key,
  display_order=excluded.display_order, is_active=excluded.is_active,
  active_for_completion=excluded.active_for_completion, updated_at=now();

-- Read the student's Gem Vault: active definitions + owned gems + favourite.
-- (Live progress numbers for locked gems arrive with the Phase 4 evaluator.)
create or replace function public.get_gem_vault_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  perform public.assert_student_access(p_student_id);
  select jsonb_build_object(
    'definitions', coalesce((
      select jsonb_agg(to_jsonb(d) order by d.display_order, d.slug)
      from public.gem_definitions d where d.is_active
    ), '[]'::jsonb),
    'owned', coalesce((
      select jsonb_agg(jsonb_build_object(
        'gem_id', sg.gem_id, 'slug', gd.slug, 'earned_at', sg.earned_at, 'source_type', sg.source_type))
      from public.student_gems sg
      join public.gem_definitions gd on gd.id = sg.gem_id
      where sg.student_id = p_student_id
    ), '[]'::jsonb),
    'favourite_gem_id', (select favourite_gem_id from public.student_gem_display where student_id = p_student_id)
  ) into v;
  return v;
end; $$;
revoke all on function public.get_gem_vault_secure(uuid) from public;
grant execute on function public.get_gem_vault_secure(uuid) to anon, authenticated;

-- Set the favourite displayed gem — must be a gem the student owns (or null).
create or replace function public.set_favourite_gem_secure(p_student_id uuid, p_gem_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  if p_gem_id is not null and not exists (
    select 1 from public.student_gems where student_id = p_student_id and gem_id = p_gem_id
  ) then
    raise exception 'You can only display a gem you own';
  end if;
  insert into public.student_gem_display(student_id, favourite_gem_id, updated_at)
  values (p_student_id, p_gem_id, now())
  on conflict (student_id) do update set favourite_gem_id = excluded.favourite_gem_id, updated_at = now();
  return public.get_gem_vault_secure(p_student_id);
end; $$;
revoke all on function public.set_favourite_gem_secure(uuid, uuid) from public;
grant execute on function public.set_favourite_gem_secure(uuid, uuid) to anon, authenticated;

commit;
