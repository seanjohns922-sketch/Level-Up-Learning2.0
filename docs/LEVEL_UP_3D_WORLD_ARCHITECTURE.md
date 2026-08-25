# Level Up 3D World Architecture

## Frozen Learning Contract

The 3D world is an optional presentation layer over the canonical learning system.

`3D world -> district -> week -> existing week screen -> lesson/quiz -> return to district`

The 2D world and Quick Start remain permanent. There is no separate 3D progression store.

## Runtime Boundaries

- `app/world/number-nexus/page.tsx` is the hidden, feature-controlled route.
- `app/world/measurelands/page.tsx` is the hidden Measurelands route and currently admits only the Level 3 approval slice.
- `app/world/starpath/page.tsx` is the hidden Starpath route and currently admits only the Level 3 approval slice.
- `NumberNexus3DEntry` handles preview/pilot/device access and lazy-loads the 3D bundle.
- `Measurelands3DEntry` consumes the same central access decision and preserves `/measurelands` as its fallback.
- `Starpath3DEntry` consumes the same central access decision and preserves `/starpath` as its fallback.
- `NumberNexusLevel3World` owns the proven movement, camera, interaction, teleport, and routing shell.
- `SharedThirdPersonPlayer`, `WorldMovePad`, `WorldHUD`, and `WorldInteractionPrompt` are the cross-realm runtime controls.
- `realm-world-state.ts` is the generic canonical progress-to-gate adapter. Realm files provide district definitions rather than progress logic.
- `return-context.ts` stores transient session navigation only.
- Existing `/program`, `/lesson`, and `/session` routes remain the learning engine.

Normal 2D users do not render the world route and do not intentionally load Three.js or district assets.

## Shared Realm Contract

Number Nexus, Measurelands, and Starpath use the shared realm architecture:

`shared controls + shared HUD + shared interaction + shared canonical state + realm presentation + active level theme`

Shared behaviour includes movement, camera, keyboard/touch input, prompts, HUD commands, feature access, quality selection, instrumentation, week routing, Tower routing, and transient return context. Configured presentation includes district definitions, spatial layout, materials, signs, monuments, background artwork, sky, fog, light colours, and accents.

Measurelands does not import Number Nexus environment components and does not copy its world engine. It composes the shared runtime controls with `MeasurelandsEnvironment`, `MEASURELANDS_LEVEL_THEMES`, and canonical Measurelands districts. Ground-Level 6 are theme/configuration variants over that shared engine.

Starpath is the first consumer of the neutral `SharedRealmWorld3D` orchestration component. `StarpathLevel3World` supplies canonical state, spatial configuration, and `StarpathEnvironment`; it does not own movement, camera, HUD, interaction, return context, or progression. Ground-Level 6 use paired front/rear panoramas and remain theme/configuration additions over the shared engine.

## Environment Pipeline

Production environments are modular visual layers rendered inside the frozen world shell.

1. Canonical state resolves the current district, week, and next activity.
2. The shell builds stable gate definitions and interaction coordinates.
3. A district environment renders paths, architecture, lighting, signs, and distant landmarks.
4. Shared visual gates receive canonical state as props.
5. Visual state may respond to progress but never writes progress.
6. Future district-specific GLBs load only when that district is entered.

Counting District is implemented procedurally in `CountingDistrictEnvironment.tsx`. Future hero GLBs must follow `docs/NUMBER_NEXUS_3D_ART_BIBLE.md`.

## Quality And Loading

- LOW, MEDIUM, and HIGH preserve identical navigation and signage.
- Detail tiers change background density and optional effects, not learning behaviour.
- Counting District currently adds no external runtime art asset download; it uses shared geometry and instancing.
- Future districts must be dynamically imported or loaded after entry.
- R3F owns renderer teardown; district components own and clean up any future listeners, timers, textures, and audio.

## Rollout Safety

Access remains layered across platform flags, pilot allowlists, preview/demo state, and device capability. Art phases do not alter rollout controls. If 3D is unavailable, students continue through the existing 2D experience.

## Live Realm Matrix

Production routing requires both a live canonical realm and an implemented 3D presentation.

| Canonical realm | 3D route | Status |
| --- | --- | --- |
| Number Nexus (`number`) | `/world/number-nexus` | Implemented |
| Measurelands (`measurement`) | `/world/measurelands` | Implemented |
| Starpath (`space`) | `/world/starpath` | Implemented |

Coming Soon realms remain visible but non-enterable. A future live 2D realm without approved 3D coverage must route through its canonical 2D entry instead of being blocked.

## World-First UX Contract

The 3D world replaces navigation widgets with places wherever practical.

- Places become places: Home is the physical My Home building, Tower is the Tower of Knowledge, realms are Tower portals, districts are district entrances, and weeks are week gates.
- Fast actions stay fast: Quick Start, Realm Teleport, Current Mission, Profile, compact XP, and the 2D fallback remain immediately available in the shared `WorldHUD`.
- Learning remains canonical: every physical and fast path delegates to the existing continuation, realm-entry, progression, and reward systems.
- 2D detail screens remain valuable: program screens own detailed lesson information, results, level history, and previous-level browsing.

Responsibility is deliberately split:

| Surface | Responsibility |
| --- | --- |
| Central World | universal identity, physical My Home, physical Tower |
| Tower | realm selection through physical portals |
| Realm World | exploration and physical progression navigation |
| 2D Program | detail, history, level browsing, accessibility fallback |
| Lesson / Quiz | learning |

`WorldHUD` is shared by Central World, Tower, and every realm. Context changes the available actions; it does not fork action logic. Current Mission and Quick Start share `resolveWorldJourney`, while physical Tower portals and Realm Teleport share `resolveTowerRealmEntry`.

## My Home Navigation

My Home V1 is a lightweight universal landmark near Central World spawn. Entering it opens the existing `/home-base` experience and records a transient session-only navigation context. `RETURN TO WORLD` appears only for that journey and returns to `/world?spawn=my-home-exit-spawn`. It is separate from lesson return context and never becomes progress.

Future Home customisation may represent canonical avatar, card, Realmie, achievement, reward, and collection ownership. It must not create parallel 3D inventories. `future-leaderboard-monument` and `future-collection-area` are reserved semantic anchors only. Any future class leaderboard requires separate school privacy and visibility approval.

## Level Browsing Finding

The existing 2D realm level selector already checks canonical unlock state, disables future levels, and enters older levels through explicit review navigation. Selection does not change placement or current progression. It remains the historical-level browser and was not materially changed in Phase 3D-3C. Returning to 3D continues to resolve the student's canonical current level. Ground-Level 2 use guided `START YOUR ADVENTURE`; Levels 3-6 use the shared district city and level-specific theme configuration.

## PRODUCTION CANONICAL PARITY CONTRACT

The 3D experience is a navigation layer over the existing learning engine. It does not own a second progress record.

- `restoreCanonicalWorldState(studentId)` restores Number Nexus, Measurelands, and Starpath through the existing server-backed progress boundary before a real student world renders.
- `resolveCanonicalNextActivity(...)` is the shared pure resolver for the next lesson, weekly quiz, post-test, or completed realm destination.
- Quick Start, Current Mission, and the 2D Continue Learning flow use that same resolver and therefore produce the same destination from the same canonical snapshot.
- Lesson, quiz, assessment, reward, XP, unlock, and placement writes remain in the existing 2D learning routes. World components contain no progress mutation or database write calls.
- World return context, intro state, media state, and spawn positions are transient session navigation only. They are not learning records.
- Window focus triggers a server restore and world-state rebuild. This reconciles a second tab or device after its canonical server writes are available; it does not merge local 3D state.
- Ground-Level 2 keep the single guided portal. Levels 3-6 keep district and week navigation. Both modes resolve from the student's canonical current level and assignment.

### Rollout Controls

Production 3D access requires all applicable layers to pass:

1. The platform capability is enabled by default. `NEXT_PUBLIC_ENABLE_REALM_3D=0`
   is the emergency global kill switch.
2. Optional `NEXT_PUBLIC_REALM_3D_SCHOOL_ALLOWLIST`, `NEXT_PUBLIC_REALM_3D_CLASS_ALLOWLIST`, and `NEXT_PUBLIC_REALM_3D_STUDENT_ALLOWLIST` constrain the pilot.
3. 3D is the post-login default when `NEXT_PUBLIC_REALM_3D_DEFAULT` is absent. Set `NEXT_PUBLIC_REALM_3D_DEFAULT=0` to restore `/realms` as the default 2D entry.
4. Unsupported realms, missing WebGL, and reduced-motion device fallback stay in 2D.

The global platform flag is evaluated before demo access. A local browser value cannot override it in production. Teacher preview remains an explicit preview route and does not write student progress.

### Fallback And Rollback

Quick Start and `2D VIEW` remain permanent escape routes. If 3D cannot initialize, the existing 2D experience remains authoritative and usable.

For the current build-time environment implementation, rollback is:

1. Set `NEXT_PUBLIC_REALM_3D_DEFAULT=0` to stop routing students into 3D by default.
2. Set `NEXT_PUBLIC_ENABLE_REALM_3D=0` to disable production 3D access.
3. Redeploy the environment configuration.

This is appropriate for a staged allowlisted pilot. A true instant platform-admin kill switch requires server/runtime feature evaluation and is a future production-control task; it must not be simulated with local storage.

### Verification

`npm run qa:world3d-production-parity` checks all three live realms against targeted assignments, lesson progression, quiz readiness, post-test readiness, realm completion, placement routing, forbidden 3D writes, canonical restore boundaries, and kill-switch ordering.
