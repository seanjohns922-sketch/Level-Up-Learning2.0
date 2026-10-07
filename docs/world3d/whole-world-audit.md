# 3D world audit — 25 September 2026

## Verdict

The project has a useful foundation for expansion: canonical lesson progression,
six realm entry routes, shared controls, quality tiers, preview access, return
navigation and a substantially richer customisable hub. The next investment
should be a coherent world framework and one polished realm district before
replicating larger environments across all levels.

This is a repository and automated-contract audit. It covers all eight main
world routes plus the separate expedition preview. It is NOT visual approval of
every realm/level, a measured performance benchmark, or an authenticated
student-device acceptance run. Earlier browser control stalled while another
preview was active. Mouse/touch walkthroughs and hardware measurements remain
explicit release gates. Work in this shared checkout is still changing; this
report describes inspected source, not necessarily the deployed site.

## Inventory and proposed identity

| World | Current implementation / coverage | Upgrade direction |
|---|---|---|
| Central hub, home and tower exterior | /world; CentralWorld + CentralWorldEnvironment, shared player, editable browser-local layout | Keep the medieval/magical centre and freely mixable Australian collections. Finish collision, reliable saving feedback and dense-world performance before increasing catalogue complexity. |
| Tower interior | /world/tower; TowerRealmChamber + portal components, shared player | Strengthen a legible arrival, six realm destinations and clear return route. Preserve portal identities, reduced-motion handling and limited active video. Verify entrances from avatar eye level. |
| Number Nexus | /world/number-nexus; separate large world/controller; theme keys Ground–6 | Use its city/counting/guided variants as the first controlled upgrade candidate. Build one recognisable physical district with a clear destination and consistent scale. Retain a simple guided experience for younger learners. |
| Measurelands | /world/measurelands; separate orchestration, shared player; Ground–6 | A working landscape of workshops, bridges, measuring stations and construction. Move orchestration towards shared configuration before duplicating more levels. Any measured geometry must preserve mathematical evidence. |
| Starpath | /world/starpath; SharedRealmWorld3D; Ground–6 | Observatory/space identity with real foreground platforms and geometry structures. Keep panoramas as distant scenery. Preserve guided Ground–2 entry. |
| Statistica | /world/statistica; SharedRealmWorld3D; 1–6 | A data/research setting with recognisable stations and collection places. Preserve guided 1–2 entry; give later districts distinct physical landmarks. |
| Pattern Peaks | /world/pattern-peaks; SharedRealmWorld3D; 3–6 | Terraces, repeating architectural forms and routes that make its pattern identity physical. Reuse the realm palette and protect any learning diagrams from decorative distortion. |
| Chance Hollow | /world/chance-hollow; SharedRealmWorld3D; 3–6 | A probability-themed hollow with tactile coin/dice mechanisms, clear activity entrances and a coherent landscape. Existing front/rear panoramas and props provide a starting point. |
| Core Expedition / summit / crossroads / volcano preview | /demo-review/number-adventure/3d; NumberAdventure3DWorld, NumberSummitEnvironment/Player and terrain helpers | A separate design experiment with elevation, checkpoints and terrain-aware movement. Evaluate its best features for reuse; do not equate preview checkpoint storage or its other trails with six production learning worlds. |

Coverage is derived from the current entry allowlists and Number Nexus theme
keys, not from file names containing “Level3”. Those files serve multiple levels.
Level 7/8 lesson and assessment work elsewhere does not establish 3D support.
Do not extend allowlists until the corresponding theme, state, route and
return-flow coverage is verified.

## Findings, ordered by priority

### 1. Shared physical-world behaviour is the main scaling prerequisite

Evidence:
- SharedWorldPlayer.tsx: movement adds a vector then clamps rectangular/elliptic
  world bounds (around lines 213–230); the following camera code lerps to a
  target without scene obstacle queries.
- SharedRealmWorld3D.tsx: district/guided versus city bounds and camera distance
  are currently hard-coded (around lines 134–148).
- NumberNexusLevel3World.tsx contains another movement/controller path.
- NumberSummitPlayer.tsx uses summitFloor and a step-height check, demonstrating
  a different terrain-aware movement contract.

Impact: adding solid buildings, bridges, steep terrain or enclosed rooms does
not automatically make them behave as solid spaces. The decorative hub water
does not implement swimming or water blocking. Larger spaces also inherit
fixed camera and interaction assumptions.

Recommendation: define shared walkable surfaces, obstacle footprints, step/slope
rules, camera obstruction, spawn recovery and interaction range configuration.
Keep simplified colliders independent of decorative mesh complexity. Migrate
one world at a time; do not transplant preview checkpoint logic into progression.

Acceptance: walk every doorway/bridge, test walls and water policies, recover
from invalid spawn, keep the camera outside solid geometry, and verify the same
route with keyboard and touch.

### 2. Foreground depth will matter more than larger maps

Evidence:
- WorldPanorama.tsx draws images on cylindrical backdrops.
- StarpathEnvironment, MeasurelandsEnvironment, StatisticaEnvironment,
  PatternPeaksEnvironment and ChanceHollowEnvironment all use this component.
- Several realm environment quality branches primarily add a high-tier light.
- Pattern/Chance/Statistics share portal-oriented layouts with themed dressing.

Interpretation: these are useful navigable learning lobbies, but increasing map
size alone will not create an explorable landscape. This is a source-based
assessment of the construction technique; visual severity needs walkthroughs.

Recommendation: retain existing distant art; add a deliberate near/middle/far
composition, real terrain edges, one hero landmark per district, recognisable
doorways and a route that leads the child to the next activity. Give each realm
its own silhouette and materials while keeping human scale consistent.

### 3. Performance targets exist; current compliance is unmeasured

Evidence:
- NUMBER_NEXUS_3D_ART_BIBLE.md already sets 30 FPS on Chromebook/iPad, 60 FPS
  on stronger devices; low/medium/high draw-call targets below 90/120/150 and
  texture-memory targets below 32/64/96 MB.
- SharedRealmWorld3D and the dedicated worlds expose varying metrics.
- WorldPanorama creates a full-source-size canvas and CanvasTexture, while the
  loaded source image remains available; its props do not select reduced
  resolution for low quality.
- The expedition preview requests shadows, a 2048 shadow map, DPR up to 1.5 and
  high-performance rendering without the same low/medium/high contract.
- The hub permits repeated detailed objects; procedural instancing is present
  in some assets but is not a scene-wide placement budget.

These facts indicate risks to measure, not proof of poor frame rate.

Recommendation: one metrics format, quality-aware panorama resolution, reusable
geometry/materials, instancing for repeated scenery, distance-based detail and
a visible-object budget. Profile a heavily decorated hub as well as empty
realm entrances. Avoid enlarging the map until its current cost is known.

Acceptance: cold and warm load, sustained frame rate/frame-time spikes, draw
calls, triangles, texture memory, route round-trips and context-loss behaviour
on actual school Chromebook and iPad hardware. Use the existing art-bible
budgets as initial targets, revising them only with measured evidence.

### 4. Recovery needs a world-specific path back to learning

Evidence:
- Entry components check browser capability and offer fallback/restore states.
- app/layout.tsx has a global ErrorBoundary, so recovery is not entirely absent.
- That global boundary sends the child back to login.
- The expedition has its own error boundary; equivalent world-local boundaries
  and explicit context-loss recovery were not found across the main worlds.

Recommendation: a shared world boundary with Retry and Continue in 2D at the
correct realm/level, plus controlled WebGL context-loss handling. A rendering
failure should not require the child to rediscover their lesson.

### 5. Production coverage and checks need to grow together

Evidence:
- Five realm entry components explicitly cap allowed levels at Year 6; Number
  Nexus theme keys likewise stop at Year 6.
- world3d-production-parity-audit covers Number Nexus, Measurelands and Starpath,
  not all six realms.
- The architecture document’s live-realm matrix still lists only three realms
  and contains historical Level 3-only wording.
- The access audit incorrectly expected Chance Hollow to be unsupported.

Change made in this audit: corrected the obsolete Chance Hollow expectation,
retained an actual unsupported-realm test and added a supported-device check
for all six maths realms. No access policy or curriculum routing was changed.

Recommendation: a single realm/level capability registry consumed by entry,
navigation, previews and tests; expand parity tests to all six before increasing
coverage. Update the old architecture document when this contract is settled.

### 6. Persistence and interaction confidence precede more features

Evidence: central-world-layout.ts persists placements and ground in localStorage,
scoped by student/browser. Recent builder changes add automatic boundaries,
continuous terrain, per-stroke undo, cancel and UUID placement identities.

Recommendation: complete the interaction acceptance matrix below. For shared
school devices or switching devices, plan server-backed layout persistence with
a versioned schema, migration and conflict policy. Keep learning progression
separate. Any new student RPC must preserve and test the actual anon +
x-student-session access model required by AGENTS.md.

### 7. Accessibility needs a consistent world-wide contract

Existing strengths: shared voice controls, keyboard/touch movement, guided
younger-level modes, fallback navigation, reduced-motion handling in tower
portals and new hub water.

Gap: those safeguards are spread across components. The expedition’s automatic
overview camera and movement effects require a specific reduced-motion review.
Long labels, small screens, locked/completed states and colour-independent
wayfinding need rendered checks.

Acceptance: clear next action, readable labels at child/avatar viewpoint,
keyboard focus that does not move the avatar while editing controls,
read-aloud for directions, alternatives to motion-only cues, touch controls
that do not obscure the destination, and immediate Quick Start/2D access.

## Automated evidence

Ran 13 existing suites. Initially 12 passed and the access audit failed because
of its obsolete Chance Hollow expectation. After the bounded test correction,
the access suite passed too. Initial raw results are retained in
output/world3d-audit/checks.json, including the failure.

Passing suites: access (rerun), production parity, art, navigation, level mode,
tower, Measurelands, Starpath, Chance Hollow, return context, central world,
home/layout and scenery.

These mix source assertions, data contracts and geometry tests. A passing name
does not prove visual quality, authenticated browser behaviour or device FPS.
No live database writes, deployment or broad world redesign was performed.

## Recommended build order

1. Shared foundation: configurable movement/collision/camera, world-local
   recovery, quality/metrics contract, and completed hub builder acceptance.
2. One polished district: Number Nexus production route is the first candidate.
   Reuse the expedition’s terrain ideas only where they fit canonical learning.
   Deliver entrance, destination, lesson launch, return and low-quality version.
3. Reuse the proven framework across Measurelands, Starpath, Statistica,
   Pattern Peaks and Chance Hollow, preserving distinct art directions.
4. Add approved higher-level coverage and larger connected spaces only after
   the route, performance and recovery gates pass.
5. Add optional interactions and rewards in response to child usability tests.

## Manual acceptance matrix still to run

For each main route: initial arrival; identify the next activity; keyboard and
touch movement; camera extremes; current/locked/completed destinations; lesson
entry; lesson return; tower return; Quick Start/2D fallback; reload; low/medium/
high quality; reduced motion; narrow landscape and portrait layouts.

For the builder: adjacent straight/corner/T fences; mixed styles; path/road
transition; moat and bridge; rapid drag; rotate; move one of identical copies;
cancel; undo a whole drag; erase; leave/reload; separate student scopes; storage
failure feedback; dense decorations.

For level coverage: run every supported level, then deliberately request an
unsupported level and confirm the correct fallback. Use authenticated student
sessions in the eventual release check, not teacher preview alone.

Preview entry points (local development):
- /world?teacher_preview=1
- /world/tower?teacher_preview=1
- /world/number-nexus?teacher_preview=1&level=Year%203
- /world/measurelands?teacher_preview=1&level=Year%203
- /world/starpath?teacher_preview=1&level=Year%203
- /world/statistica?teacher_preview=1&level=Year%203
- /world/pattern-peaks?teacher_preview=1&level=Year%203
- /world/chance-hollow?teacher_preview=1&level=Year%203
- /demo-review/number-adventure/3d
