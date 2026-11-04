# Chronorok release — 4 November 2026

Seven exact transparent PNG avatars from `Chronorok_Avatars.zip` and seven card
fronts plus shared amber-Q back from `RELIQ_Chronorok_Print_Pack 2/Chronorok`.
The other downloaded print-pack directory is byte-identical. Print masters are
unchanged; browser WebPs render each PDF TrimBox at 400 DPI to sRGB, 1008×1408.
Source/output hashes are in `chronorok-2026-11-04-sources.json`.

Canonical mapping: `data/chronorok-artwork.ts`. Spark/Prep, Ember/1, Pulse/2,
Current/3, Rift/4, Blaze/5, Eternal/6. Existing Grade 7–8 → Eternal rule retained.
No curriculum content, assessment thresholds, student records or schemas changed.

Live entry points: Tower chamber, realm carousel and RELIQS collection. Hub shows
the grade avatar and links to cards; Awakening Spire also opens the collection.
The 100-crystal milestone shows the correct front. All seven cards can be previewed
and flipped; earned status is explicitly this year's grade reward, derived from
saved daily activity. This does not introduce permanent cross-year award storage
or invent previous years' earned cards. The existing 5-learning-day entry and
100-current-year-crystal awakening rules remain. All game entry routes apply the
same saved-activity gate and existing scoped teacher preview mode.

Arrival/portal and each card's unlock/showcase video fields are null, reserved
for supplied videos. No blank players/autoplay requests. The old
`public/videos/realms/chronorok.mp4` is preserved on disk but intentionally no longer
played, per the user's request to leave video slots empty.

Validation: `scripts/chronorok-release-test.mjs` checks mappings, source hashes,
alpha, dimensions/colour, thresholds/year rollover, rendered collection flips,
preview and earned labels. Run with the TypeScript alias loader. Game QA, critical
QA, lint and TypeScript checks also run. All eight rendered card faces reviewed
on a contact sheet; browser collection confirmed to render all seven controls.
Desktop/mobile visual interaction review remains limited by the user's active
browser session. No real student's activity was modified for testing.
