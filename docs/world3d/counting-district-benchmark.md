> REVERTED: The user requested the original realm appearance be restored. The visual changes described below are no longer active.

# Counting District visual benchmark — first playable review

Local review:
http://localhost:3000/world/number-nexus?teacher_preview=1&level=Year%203&district=counting-district

The first Number Nexus district now has a physical civic square: six workshop
facades with recessed windows, mullions, stone courses, cornices and roof detail;
a stepped counting hall with an arcade, bronze crown and clock; inset avenue
lighting, stone paving, planted edges and three architectural week entrances.
It retains the approved teal city panorama as distant scenery.

Architecture is procedural native Three.js geometry. Repeated blocks, window
panels, pavers, lamps, entrance details and clock ticks are instanced by finish.
Small generated grain textures add surface detail. Low keeps the same buildings
and destinations, reduces optional facade/paving detail and disables shadows.
Medium/high use directional shadows. No generated images or third-party art
downloads were introduced.

The existing Counting District component is shared by exploration levels; this
is a district replacement, not a rollout into other districts or realms.
The Year 3 route above is the visual approval specimen. Younger guided worlds
and the Number Nexus city scene retain their existing presentation.

## Interaction and routing

Canonical week positions and gate progression remain unchanged. Solid doorway
walls now block avatar movement with wall sliding and substeps. A camera ray
against simplified doorway boxes prevents clipping through those walls.
This is a bounded district collision implementation, not a new global physics
system. Large decorative building masses remain outside walkable bounds.

The existing Week 1 entrance was opened in Safari teacher preview. It navigated
to /program?year=Year%203&week=1&legacy=1&teacher_preview=1. Back to Map returned
to the same Counting District entrance with spawn=number-l3-w1-week-gate.
That check exposed loss of the quality query; the return URL now carries the
resolved low/medium/high quality too. The quality-preservation change has code
checks; its round-trip still needs a repeat browser check.

## Validation

- TypeScript noEmit: passed.
- Targeted ESLint and diff whitespace checks: passed.
- world3d-art, navigation, return and level-mode audits: passed.
- counting-district-space-test.mjs: unchanged gate coordinates, each doorway
  reachable, blocked wall traversal, wall sliding, arrival avenue and camera
  clearance passed.
- Safari gameplay screenshots inspected at arrival and the Week 1 entrance,
  including the Low tier. First hot reload lost the canvas; a full reload
  restored rendering. Do not interpret hot-reload behaviour as device QA.
- Final observed Low-tier arrival sample: 60 FPS, 85 draws, 16,966 triangles,
  10 textures. Before batching: 120 draws and 18 textures. These are local Mac
  Safari observations, not sustained school-device measurements. Texture count
  is not a measurement of memory in MB.
- Optional ?metrics=1 exposes the existing telemetry as a small review overlay.

## Still required before rollout approval

Owner visual acceptance from normal gameplay; school Chromebook/iPad sustained
performance and touch controls; high-tier final visual inspection; authenticated
student lesson round-trip; complete camera-orbit and doorway collision traversal.
This is a playable review build, not a claim of final visual acceptance or a
deployed release. No database changes were required.
