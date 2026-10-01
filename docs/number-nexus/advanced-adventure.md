# The Shattered Realms world preview

Current release: **demo mode only**. Design review: `/demo-review/number-adventure/3d`, available with an authorised demo session. The tower portal is visible only in demo mode. Saved `/world/expedition` links send authorised demo sessions to the preview and everyone else back to the tower.

## Shared journey

The central hub and tower lead to the expedition outpost. Six separate trails lead to six Level 7 weekly lesson gates. A realm’s Level 6 completion will unlock its trail. Number Nexus uses the same flow as Measurelands, Starpath, Statistica, Pattern Peaks and Chance Hollow: trail → gate → weekly lessons. There is no separate Number Nexus relay course or sample guardian quiz in this world.

Completing any realm’s Level 7 will open the route to The Final Battle. The volcano leads to six Level 8 strongholds, unlocked independently by their respective Level 7 completion. The intended final reward is rescuing each realm’s stolen Core through its weekly programme and final boss.

For the future student release, the retained eligibility logic qualifies a student when any completed Level 6 post-test has an exact score of 85% or above. Eligibility is read from the existing session-protected assessment-history RPC, across all six realms; pre-tests and other children’s results do not qualify. Earlier qualifying attempts remain valid after a later lower result. Each realm unlocks separately. An exact score of 85% or above on a completed Level 7 post-test opens that realm’s Level 8 stronghold and the shared volcano entrance. The legacy passed flag does not override that threshold.

Student entry is currently disabled regardless of assessment results. Re-enabling it requires an explicit release decision when the weekly programmes are ready. The eligibility helpers remain available for that future release. No new database functions or grants are required.

Level 7–8 weekly programmes, final bosses and Core rewards are still to be built. Demo lesson gates clearly say that lessons are coming soon; this release enables demo world exploration only. Neither exploration nor preview controls award results or rewards.

## Presentation and performance

Each trail becomes darker and more threatening near its gate. Ridges and bends separate the routes. Number Nexus ends at a crystal cavern entrance. No foundry or factory setting is used.

The outpost uses a single clearing with trimmed path ribbons, avoiding coplanar junction overlaps. Signs have independently oriented front and back text surfaces. Twelve irregular lava channels follow the volcano surface, with cooled crust, orange molten pools and slow downhill texture motion. The ascent remains a stone causeway across them. Lava uses one shared procedural texture and one draw call, without additional lights or particles.

Forest instancing, distance culling, capped pixel ratio, static mesh signs, simplified materials and disabled dynamic shadows keep the world lighter. Actual frame rate depends on device and browser.

## Verification

`node scripts/core-expedition-preview-test.mjs` checks six connected approaches, progressive trail atmosphere, sealed/open volcano traversal, continuous ascent, protected crater and six summit gates.

Browser checks exercise each realm’s Level 7 entrance, map and preview travel. Visual inspection covers the clearing, volcano approach, readable signs and Number Nexus gate. Scoped lint and TypeScript checks accompany changes.

A dark instanced storm cloud with irregular billows and a batched layer of soft smoke wisps sits above the crater. Branching local lightning fades in and out every 8–12 seconds, briefly illuminating the cloud material; it does not flash the whole scene. Reduced-motion preferences disable lightning and cloud drift. No extra lights or shadow maps are used.

`node scripts/expedition-access-test.mjs` checks the inclusive 85% boundary, unrounded scores, history, student isolation, realm-specific unlocks and Level 8 access. Historical browser fixtures covered the earned student entrance using mocks; those are not evidence of the current demo-only release. `node scripts/core-expedition-demo-release-test.mjs` verifies the demo-only route and tower guards.

## Shared Level 7 cavern journey (demo release)

Each Level 7 trail portal opens `/demo-review/shattered-realms/[realm]`, guarded by the existing server demo-session check. All six realms use one shared walkable cavern structure: twelve weekly doorways, Week 1 near the entrance, increasingly dark scenery, consistently lit labels, and a captive Core beyond the final doorway. Realm details vary: counting stones, measuring markers, constellations, grouped crystal records, repeating arches, and dice stones/water channels. Pattern Peaks uses the canonical `pattern` realm ID.

A doorway or “Continue your mission” opens the existing `/program` week-home component inside the server-authorised `/demo-review/shattered-realms/[realm]/week` route, with the same realm presentation and a Level 7 preview scaffold. The week selector stays within that preview, and Back returns to the matching cavern doorway. Only the last reviewed week is remembered in realm-specific demo session storage; this is not student learning progress. All lesson, quiz and post-test cards are unavailable until the actual Level 7 programme is authored. No lower-level curriculum is substituted, and exploring awards no XP, results, Cores or completion.

Student release remains disabled. When the programmes launch, progression must use canonical completed weeks rather than the demo resume pointer. The first qualifying Level 7 result opens the shared volcano; each realm’s Level 8 entrance unlocks separately at 85% or above. Core recovery belongs after the Level 8 final battle.

`node scripts/shattered-realms-cavern-test.mjs` covers all 72 week destinations and return links, corridor boundaries, progressive darkness, safe inputs and unavailable-content guards. Existing expedition terrain and demo-release tests still apply.
