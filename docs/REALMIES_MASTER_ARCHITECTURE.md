# Realmies Master Architecture

Status: Phase R2 secure data foundation implemented

Date: 31 July 2026

## 1. Decision

Realmies will be a separate, server-authoritative collection system.

They will not be stored as:

- economy inventory items
- Gems
- Hall of Legends cards
- Pets
- avatar cosmetics

The first release will contain 18 standard Legend Realmies:

- six Numbot evolutions for Years 1-6
- six Meazurex evolutions for Years 1-6
- six Geospin evolutions for Years 1-6

Ground Level does not unlock a Realmie. Villains, variants, event figures,
streak figures, trial figures, physical products, purchases, packs, trading,
gifting, duplicates and crafting remain out of scope until approved separately.

## 2. Existing-System Audit

### 2.1 Canonical learning completion

The authoritative assessment write is:

`complete_realm_assessment(...)`

It currently:

1. validates the active student session with `assert_student_access`
2. verifies student, class, realm and assessment context
3. writes an idempotent `student_completion_receipts` row
4. stores the canonical assessment attempt
5. updates `student_realm_progress`

The current canonical database realm identifiers are:

| Product realm | Canonical `realm_id` |
| --- | --- |
| Number Nexus | `number` |
| Measurelands | `measurement` |
| Starpath | `space` |

The post-test pass threshold is 85%. Weekly quiz progression remains 80% and is
not a Realmie unlock source in the first release.

Realmie grants must be evaluated inside the same server transaction as
`complete_realm_assessment`, after the assessment and progress writes succeed.
A client-side follow-up grant request is not sufficient because it could fail
after progression is saved or be called with fabricated input.

### 2.2 Existing collection systems

The repository already contains four distinct reward or identity systems:

| System | Purpose | Realmies relationship |
| --- | --- | --- |
| Student economy | XP wallet, rooms, avatar items and Pets | Separate |
| Gem Vault | Achievement milestones and favourite Gem | Separate |
| Hall of Legends | Evolution cards unlocked by level mastery | Related source identity, separate ownership |
| Canonical avatar | Student appearance and equipped cosmetics | Separate |

The Gem Vault provides useful structural precedents:

- immutable catalogue keys
- one ownership row per student and collectible
- event receipts
- access-guarded security-definer reads and writes
- idempotent backfill
- favourite validation

Realmies may follow these security patterns, but must not reuse Gem tables,
Gem milestone definitions or economy inventory.

### 2.3 My Home

`app/home-base/page.tsx` is the current My Home implementation. It already
contains:

- the canonical student avatar
- an equipped Pet space
- room theme selection
- Gem Vault entry and favourite Gem
- Hall of Legends widget

The Realmies display should be a new section sourced only from the Realmies
read model. It must not replace the Pet area, Gem pedestal or Hall of Legends.

### 2.4 Teacher access

Teacher and school access is already derived from current class membership and
school roles. Realmies should expose a read-only summary through a dedicated
teacher-safe RPC in a later UI phase. Teachers must not receive direct catalogue
management, ownership writes, display writes or grant functions.

### 2.5 Telemetry

Current live-class events describe active learning and must not be reused as
Realmie ownership evidence. Realmies require product-interaction telemetry with
a separate contract. Telemetry must never unlock or revoke a Realmie.

## 3. Asset Audit

### 3.1 Available production assets

The repository contains front and back card compositions for all required
Numbot, Meazurex and Geospin evolutions, including:

- Numbot Counter through Numbot Equationator
- Meazurex Ticklet through Meazurex Timewielder
- Geospin Roller through Geospin Starweaver

These assets are registered in `data/legends.ts` and are suitable for the Hall
of Legends.

### 3.2 Missing Realmie assets

No approved transparent miniature figure renders were found for the 18 initial
Realmies. The available PNGs are complete trading-card compositions with text,
frames and backgrounds. Cropping or stretching these card files into figure
tiles would violate the Realmies specification and produce a low-quality result.

No approved transparent villain Realmie assets were found. Existing brain-break
villains use emoji and procedural presentation, which is not suitable as final
Realmie artwork.

### 3.3 Required asset deliverables

Before the student collection room ships, each active Realmie requires:

- transparent PNG or WebP figure render
- consistent character scale and baseline
- no card border, title or background
- square-safe composition with transparent padding
- minimum recommended source size of 1024 x 1024
- optional dedicated silhouette asset
- alt text approved with the catalogue entry

The UI may use an explicit internal placeholder while assets are in production,
but placeholders must not be presented as final artwork.

### 3.4 Asset path convention

Approved files should use:

`/realmies/{realm}/{realmie-key}.webp`

Optional silhouettes should use:

`/realmies/{realm}/{realmie-key}-silhouette.webp`

The database catalogue is authoritative for paths. Page components must not
hardcode Realmie asset paths.

## 4. Canonical Catalogue

### 4.1 Identity

Every definition has a permanent `realmie_key`. Display names may change, but
keys must not.

Database `realm_id` values use the canonical learning identifiers:

- `number`
- `measurement`
- `space`

Stable keys retain product-facing realm names for readability:

- `number-nexus-*`
- `measurelands-*`
- `starpath-*`

### 4.2 Initial standard catalogue

The initial rarity distribution deliberately avoids overusing high rarities:

| Level | Default rarity |
| --- | --- |
| 1 | Rare |
| 2 | Rare |
| 3 | Epic |
| 4 | Epic |
| 5 | Epic |
| 6 | Legendary |

Catalogue proposal:

| `realmie_key` | Name | Realm | Level | Rarity |
| --- | --- | --- | --- | --- |
| `number-nexus-numbot-counter-standard` | Numbot Counter | `number` | 1 | rare |
| `number-nexus-numbot-builder-standard` | Numbot Builder | `number` | 2 | rare |
| `number-nexus-numbot-processor-standard` | Numbot Processor | `number` | 3 | epic |
| `number-nexus-numbot-solver-standard` | Numbot Solver | `number` | 4 | epic |
| `number-nexus-numbot-calculator-standard` | Numbot Calculator | `number` | 5 | epic |
| `number-nexus-numbot-equationator-standard` | Numbot Equationator | `number` | 6 | legendary |
| `measurelands-meazurex-ticklet-standard` | Meazurex Ticklet | `measurement` | 1 | rare |
| `measurelands-meazurex-measurer-standard` | Meazurex Measurer | `measurement` | 2 | rare |
| `measurelands-meazurex-tracker-standard` | Meazurex Tracker | `measurement` | 3 | epic |
| `measurelands-meazurex-balancer-standard` | Meazurex Balancer | `measurement` | 4 | epic |
| `measurelands-meazurex-calibrator-standard` | Meazurex Calibrator | `measurement` | 5 | epic |
| `measurelands-meazurex-timewielder-standard` | Meazurex Timewielder | `measurement` | 6 | legendary |
| `starpath-geospin-roller-standard` | Geospin Roller | `space` | 1 | rare |
| `starpath-geospin-mapper-standard` | Geospin Mapper | `space` | 2 | rare |
| `starpath-geospin-navigator-standard` | Geospin Navigator | `space` | 3 | epic |
| `starpath-geospin-shapeshifter-standard` | Geospin Shapeshifter | `space` | 4 | epic |
| `starpath-geospin-galaxycrafter-standard` | Geospin Galaxycrafter | `space` | 5 | epic |
| `starpath-geospin-starweaver-standard` | Geospin Starweaver | `space` | 6 | legendary |

All 18 entries use:

- `category = 'legend'`
- `variant_type = 'standard'`
- `unlock_rule_type = 'realm_posttest_pass'`
- `active_for_standard_completion = true`

Crystal and Mythic remain valid rarity values for future approved definitions,
but are not assigned in the initial standard catalogue.

## 5. Database Model

### 5.1 `realmie_catalogue`

```sql
create table public.realmie_catalogue (
  id uuid primary key default gen_random_uuid(),
  realmie_key text not null unique,
  display_name text not null,
  realm_id text not null,
  category text not null,
  evolution_level integer,
  variant_type text not null default 'standard',
  rarity text not null,
  lore_text text not null,
  unlock_rule_type text not null,
  unlock_rule_payload jsonb not null default '{}'::jsonb,
  asset_path text,
  silhouette_asset_path text,
  sort_order integer not null default 0,
  active_for_standard_completion boolean not null default false,
  is_active boolean not null default false,
  available_from timestamptz,
  available_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (realm_id in ('number', 'measurement', 'space')),
  check (category in ('legend', 'villain', 'variant', 'event')),
  check (variant_type in ('standard', 'special', 'event', 'trial')),
  check (rarity in ('common', 'rare', 'epic', 'legendary', 'crystal', 'mythic')),
  check (evolution_level is null or evolution_level between 1 and 6)
);
```

Inactive rows remain historically resolvable. A definition referenced by an
ownership or receipt row is never deleted.

### 5.2 `student_realmies`

```sql
create table public.student_realmies (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  realmie_id uuid not null references public.realmie_catalogue(id),
  earned_at timestamptz not null default now(),
  source_type text not null,
  source_key text not null,
  source_payload jsonb not null default '{}'::jsonb,
  is_favourite boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, realmie_id)
);
```

The unique constraint makes ownership idempotent. Ownership is never removed
when a definition is made inactive.

### 5.3 `realmie_unlock_receipts`

```sql
create table public.realmie_unlock_receipts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  realmie_id uuid not null references public.realmie_catalogue(id),
  unlock_event_key text not null,
  source_type text not null,
  source_id text,
  canonical_realm_id text,
  canonical_working_level text,
  canonical_assessment_id uuid,
  is_backfill boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, realmie_id, unlock_event_key)
);
```

Receipts are append-only audit evidence. They do not replace the ownership
unique constraint.

### 5.4 `student_realmie_display_slots`

```sql
create table public.student_realmie_display_slots (
  student_id uuid not null references public.students(id) on delete cascade,
  slot_number integer not null check (slot_number between 1 and 6),
  realmie_id uuid not null references public.realmie_catalogue(id),
  updated_at timestamptz not null default now(),
  primary key (student_id, slot_number),
  unique (student_id, realmie_id)
);
```

The second unique constraint prevents the same Realmie appearing in multiple
My Home slots.

### 5.5 `realmie_product_events`

```sql
create table public.realmie_product_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  event_name text not null,
  realmie_id uuid references public.realmie_catalogue(id),
  realm_id text,
  source_screen text not null,
  session_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

Allowed event names are:

- `realmie_collection_opened`
- `realmie_detail_viewed`
- `realmie_favourited`
- `realmie_display_added`
- `realmie_display_removed`
- `realmie_unlock_viewed`
- `realmie_collection_filter_changed`

These events measure interaction only.

## 6. Unlock Architecture

### 6.1 Eligibility

A standard Legend Realmie is eligible only when all conditions are true:

1. the canonical assessment is a post-test
2. the canonical `realm_id` is `number`, `measurement` or `space`
3. the working level is Year 1 through Year 6
4. the stored canonical post-test score is at least 85
5. the catalogue contains an active matching standard Legend definition

Ground/Prep, weekly quizzes, lesson completion, local state, query parameters,
live telemetry and display state are never valid standard unlock evidence.

### 6.2 Atomic evaluator

Create an internal function:

```sql
grant_standard_realmie_for_canonical_posttest(
  p_student_id uuid,
  p_realm_id text,
  p_working_level text,
  p_assessment_id uuid,
  p_completion_key uuid,
  p_is_backfill boolean default false
) returns uuid
```

The function:

1. reads the stored canonical assessment/progress row
2. rechecks the post-test type and score
3. maps `working_level` to evolution level 1-6
4. finds the active standard catalogue definition
5. inserts ownership with `on conflict do nothing`
6. writes an immutable unlock receipt
7. returns the newly owned Realmie ID only when ownership was first created

No score, pass flag, Realmie key or ownership decision is trusted from the
browser.

`complete_realm_assessment` invokes this internal function only after
`save_realm_assessment` and `save_student_realm_progress` succeed. All writes
occur in the same transaction.

### 6.3 Celebration delivery

Canonical ownership and celebration delivery are separate.

The server response may return a newly unlocked Realmie summary after the
transaction commits. If the UI misses that response, ownership remains correct.
The collection read model should also expose unacknowledged unlocks so the next
eligible student screen can show one celebration and then acknowledge it.

The client never marks ownership permanent before the server confirms it.

### 6.4 Backfill

Backfill derives eligibility from canonical passed post-tests only:

```text
student_realm_progress
  where posttest_score >= 85
  and realm_id in (number, measurement, space)
  and working_level in (Year 1 ... Year 6)
```

For each eligible row, invoke the same internal grant function with
`is_backfill = true`.

Backfill must:

- be idempotent
- preserve `earned_at` using the canonical post-test completion time where available
- create receipts
- award no XP, Gems, cards or progression
- not emit live unlock telemetry
- expose one grouped backfill message rather than one animation per Realmie

## 7. Read and Command APIs

### 7.1 Student collection read

`get_student_realmies_secure(p_student_id uuid)` returns:

- active catalogue definitions
- owned definitions, including inactive historical ownership
- earned dates and source summaries
- favourite state
- six display slots
- standard completion totals by realm
- unacknowledged unlock summaries

The function requires the opaque `x-student-session` token and then calls
`assert_student_access`. Educator and parent authentication cannot substitute
for the student session on full collection reads or student-owned commands.

Demo mode uses a separate catalogue-only function and synthetic ownership in
the application. It never writes production ownership.

### 7.2 Favourite command

`set_student_realmie_favourite_secure(p_student_id, p_realmie_id, p_favourite)`

Rules:

- target must be owned by the student
- multiple Realmies may be favourited
- ownership and rarity never change

### 7.3 Display command

`set_student_realmie_display_slot_secure(p_student_id, p_slot_number, p_realmie_id)`

Rules:

- slot is 1-6
- Realmie must be owned
- a Realmie may occupy only one slot
- `null` removes a display slot

### 7.4 Unlock acknowledgement

`acknowledge_student_realmie_unlocks_secure(...)` records presentation state
only. It cannot create or remove ownership.

### 7.5 Teacher summary read

`get_teacher_student_realmie_summary_secure(p_student_id)` returns only:

- total standard Realmies collected
- total active standard Realmies
- totals by realm
- most recently earned Realmie name and date

It uses current class/school authorization. It exposes no write capability.

## 8. Security and RLS

All Realmies tables enable RLS and revoke direct client writes.

### Student

- can read their collection only through an access-guarded RPC
- can favourite and configure display only through validated RPCs
- cannot insert ownership or unlock receipts
- cannot change catalogue definitions, rarity or unlock rules

### Teacher

- may read an approved summary for an authorized student
- cannot grant, remove, edit, favourite or display Realmies

### Parent

- no Phase 1 access
- future linked-child access is read-only

### Platform service

- catalogue administration and backfill run through migrations or privileged
  server operations
- no service key is exposed to the browser

Every security-definer function sets `search_path = public`, validates the
student or educator context, and has explicit grants.

## 9. Student Experience

### 9.1 Route

Use:

`/my-realmies`

The room contains:

- title and overall standard collection count
- realm filter: All, Number Nexus, Measurelands, Starpath
- status filter: All, Owned, Locked, Favourites
- rarity filter
- grid of fixed-size figure tiles
- detail modal or panel

### 9.2 Locked state

Locked entries show:

- a consistent silhouette
- display name only when product rules permit
- unlock requirement
- no hidden final art

Rarity is communicated with text and iconography, not colour alone.

### 9.3 Detail state

Owned entries show:

- approved figure artwork
- name
- realm
- category
- rarity
- lore
- unlock reason
- date earned
- favourite command
- My Home display command

### 9.4 Completion calculation

Standard completion is:

`owned active standard Realmies / active standard Realmies`

Variants, events, villains and trial figures do not prevent 100% standard realm
completion.

### 9.5 My Home

My Home renders the same six canonical display slots returned by the Realmies
read model. It never infers displayed figures from favourites, economy
inventory, Hall of Legends or local storage.

## 10. Telemetry and Trial Measures

Required measures:

- percentage of eligible students who open My Realmies
- repeat collection-room visits
- detail views
- most viewed Realmies
- favourite rate
- display-slot use
- most displayed Realmies
- unlock-to-room-open conversion
- return visits after new unlocks

Events should include:

- student ID
- event name
- Realmie ID/key when applicable
- realm
- source screen
- session identifier
- timestamp
- non-authoritative UI metadata

Telemetry is append-only product analytics. It must not participate in
eligibility, progression, XP, card, Gem or Realmie grants.

## 11. Required Tests

### Catalogue

- unique stable keys
- valid realm, category, variant and rarity values
- unique realm/level standard mappings
- valid asset and silhouette paths for active entries
- no Pet definitions

### Unlock

- Year 1-6 post-test at 85 unlocks the matching Realmie
- score below 85 does not unlock
- Ground Level does not unlock
- weekly quiz does not unlock a standard Realmie
- repeated completion is idempotent
- conflicting client payload cannot fabricate an unlock
- ownership survives catalogue deactivation

### Backfill

- existing canonical passes receive matching Realmies
- rerunning creates no duplicates
- no XP, Gems, cards or progression changes
- one grouped backfill notice is produced

### Display

- only owned Realmies can be favourited or displayed
- only slots 1-6 are accepted
- duplicate display placement is rejected
- removal does not affect ownership

### Security

- student cannot read another student's collection
- student cannot insert ownership or receipts
- teacher cannot grant or remove Realmies
- unauthorized educator cannot read a summary
- demo mode creates no production rows

### Regression

- post-test progression remains unchanged
- weekly quiz threshold remains 80
- lesson progression remains unchanged
- Hall of Legends unlocks remain unchanged
- Gems remain unchanged
- Pets and economy inventory remain unchanged

## 12. Rollout Plan

### Phase R1 - complete with this document

- audit current rewards and progression
- audit assets
- define canonical catalogue
- define database, API, RLS and unlock architecture
- identify blockers

### Phase R2 - complete

- add tables and indexes
- seed exactly 18 active standard definitions with explicit missing-asset state
- add secure reads and commands
- integrate atomic post-test grants
- add idempotent backfill
- add focused SQL tests

### Phase R3 - student experience

- add approved transparent figure assets (production candidates complete)
- build `/my-realmies`
- build collection filters and detail view
- build favourites and six display slots
- integrate My Home
- add live and grouped backfill celebrations
- add accessibility and responsive validation

### Phase R4 - trial measurement

- add product telemetry
- add internal trial reporting
- evaluate engagement before variants, physical products or commerce

## 13. Blockers and Review Decisions

### R3 artwork status

All 18 standard Realmies now have standalone transparent production-candidate
renders registered through `20260731102000_register_realmie_production_assets.sql`.
The existing card assets remain Hall of Legends assets and are not used as
Realmie figures.

Production students can collect and view Number Nexus and Measurelands
Realmies. Starpath remains a locked `Coming Soon` collection until the realm is
launched. Artwork readiness never implies student availability.

### Decisions applied in Phase R2

1. The 18 stable keys and rarity distribution are canonical.
2. Only Years 1-6 receive standard Realmies; Ground Level receives none.
3. Definitions are active for canonical completion while missing artwork is
   represented by null asset paths and `metadata.asset_status = "missing"`.
4. Trial, event, villain, Pet and Datara Realmies remain deferred.

### Non-blocking future items

- villain figure approval and unlock rules
- streak figure approval and thresholds
- event/season availability rules
- 3D model format and renderer
- parent read-only collection access
- physical product linking

## 14. Phase R2 Outcome

The secure collection foundation is implemented by:

- `20260731100000_realmies_secure_data_foundation.sql`
- `20260731101000_integrate_realmie_posttest_unlocks.sql`

Focused pgTAP and static contract coverage live in:

- `supabase/tests/realmies_r2.sql`
- `scripts/realmies-r2-audit.mjs`

The detailed implementation, security, backfill and rollback record is in
`docs/REALMIES_PHASE_R2_IMPLEMENTATION.md`.

The final collection UI can now use the registered transparent figure paths.
Existing Hall of Legends card artwork remains out of scope.
