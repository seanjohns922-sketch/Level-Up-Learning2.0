# Number Nexus Shared-Shell Preview Audit

Date: 22 July 2026

## Safety Boundary

The production route remains `app/number-nexus/page.tsx` and still dynamically renders `components/world/NumberNexusMap.tsx`. Neither file was changed for this preview. The internal comparison route is `/number-nexus/shared-preview` and redirects to the production dashboard in production unless the signed Demo Mode session is authorised.

The preview reads the canonical `number`-scoped student progress, program store, global XP RPC and lesson-attempt source. It contains no progression write, completion, save or upsert operation. Its Continue action uses the existing `/program` resolver.

## Behaviour Inventory

| Behaviour | Production Number Nexus | Shared preview | Status |
| --- | --- | --- | --- |
| Journey length | 12 weeks | `totalWeeks: 12` | PASS |
| Districts | Counting 1-3, Bridge 4-6, Core 7-9, Mastery 10-11, Tower 12 | Same ranges and positions | PASS |
| Current level | `review` query, otherwise number-scoped progress | explicit comparison level, otherwise number-scoped progress | PASS |
| Realm scope | implicit `number` defaults | explicit `storageRealmId: number` | PASS |
| Review mode | earlier level query plus global read-only marker | same marker set by shared level selector | PASS |
| District complete | all weeks complete | all weeks complete | PASS |
| District current/locked | any incomplete district whose start is at/before current week is `current` | only containing district is `current`; earlier incomplete district is `open` | DIFFERENT |
| Continue destination | first incomplete week in selected district | first incomplete week in selected district | PASS |
| Lesson resume | delegated to canonical `/program` state | delegated to the same `/program` state | PASS |
| Weekly quiz | `/program` unlocks after three lessons | same destination and gating | PASS |
| Pre-test | realm entry resolver sends incomplete placement to `/pretest?...realm_id=number` | preview assumes an already resolved dashboard level | NOT IN DASHBOARD |
| Post-test | Week 12 program substitutes post-test for quiz | same `/program` resolver | PASS |
| Final week | district is Week 12 only; program renders post-test | same district and resolver | PASS |
| Global XP | global wallet; local computed demo XP | same global wallet and demo calculation | PASS |
| Avatar | centred `StudentAvatar`, 196px | centred `StudentAvatar`, 196px | PASS |
| Tower widget | `FogOfForgetfulness`, 12-week completion input | same widget/input; badge placement differs | PARTIAL |
| My Home / Tower | legacy `RealmDashboardNav` | shared `RealmSideNavigation` | DESTINATIONS PASS |
| Loading | bespoke Number Nexus loader | route-level internal preview loader | PASS |
| Error | no explicit dashboard error state | no asynchronous restore error surface on preview | MISSING BOTH |
| Demo Mode | open level review, local progress and XP | same data; route also permitted by signed demo session | PASS |
| Live student | class-best and global-XP server reads | same reads; production access to preview remains demo-only | PARTIAL TESTABILITY |
| Responsive | full-viewport fixed map; top nav has narrow breakpoint | shared full-viewport map and same top nav; district cards use `29vw` cap | PARTIAL |

## Routing Trace

1. Login/Tower realm entry resolves `number` through `lib/realm-entry.ts`.
2. Students without completed placement go to the Number Nexus pre-test.
3. Placed students enter `/number-nexus` at number-scoped restored level/week.
4. A district or Continue action opens `/program?year=...&week=...&legacy=1` (the preview adds the explicit equivalent `realm_id=number`).
5. `/program` resumes the first eligible lesson, unlocks the weekly quiz after three lessons, and uses the post-test instead of a quiz in Week 12.
6. Lesson and assessment completion remain in the existing secure completion flow; the preview adds no alternate path.

## Unsupported or Non-Identical Shell Behaviour

1. **Past incomplete districts:** production calls every started district `current`; the shell marks only the containing district `current` and earlier incomplete districts `open`.
2. **Number-era scene system:** production varies particle density, vehicle traffic, pulse rings, filters, haze and beams by level. The shell supports per-level backgrounds but has one generic particle treatment.
3. **District presentation:** production uses unframed glowing labels. The shell uses framed district cards and different sizing.
4. **Current-path placement:** production uses a bottom navigation band. The shell uses an inline bottom-centre label.
5. **Tower badge placement:** both use the same fog progress, but the shared shell applies its canonical district-mode position.
6. **Responsive district layout:** neither implementation has a complete tablet-specific district reflow. The shell card width cap reduces overflow but does not establish visual parity.
7. **Error handling:** Number Nexus has no dashboard-level recovery state to carry across.
8. **Direct pre-test behavior:** entry placement remains outside `RealmDashboardShell`, by design.

## Parity Fixtures

The automated audit covers synthetic states for Ground and Levels 1-6, including a full path, targeted path, active resume, incomplete past district, Week 12, and completed journey. It verifies the stable production ownership boundary, canonical number scope, 12-week configuration, district ranges, and the known state mismatch.

Real-student parity remains a cutover blocker until authorised test profiles are exercised in both routes. The preview deliberately cannot bypass student-session isolation or query arbitrary students.

## Visual Differences

The following differences are expected in the first parallel preview and are not approved as cutover parity:

- framed shared district cards versus production label-only districts;
- generic particles versus Number Nexus era-specific traffic, streams and pulse density;
- shared atmospheric overlays versus per-era filters and haze;
- shared current-path position versus production bottom band;
- shared fog/tower badge placement;
- shared guided-mode guide panel, which production does not show;
- typography, card widths and district collision behavior at laptop/tablet sizes.

Screenshots should be captured at 1440x900, 1280x800 and 1180x820 once a Demo Mode browser session is available. Screenshot parity is intentionally not represented as passed by the source audit.

## Migration Risk and Blockers

**Risk rating: HIGH.** Data and route selection are substantially compatible, but scene rendering, district-state semantics and responsive composition are not at parity.

Cutover blockers:

1. Decide and test the intended past-incomplete-district rule.
2. Add configurable scene effects or approve their removal.
3. Reproduce the label-only district visual mode and bottom current-path band.
4. Complete tablet collision/reflow behavior.
5. Test signed Demo Mode and real student sessions with authorised fixtures.
6. Capture and approve desktop, laptop and tablet comparisons.
7. Add an explicit dashboard load-error recovery contract if server restoration becomes asynchronous.

## Rollback Strategy

No feature flag or cutover is needed yet. Keep `/number-nexus` mapped to `NumberNexusMap`; the preview is a separate route. If the preview causes any issue, remove its route, component and optional `internalPreview` configuration hook. No database rollback is required because this phase adds no migration or progression write.

## Eventual Duplication Removal

An eventual cutover can remove approximately 700-900 lines of Number Nexus-only dashboard layout, canvas, navigation, XP/class-best and district interaction code. Number-specific backgrounds, era effects, district metadata and theme tokens should remain as configuration or approved visual adapters.
