# Approved artwork integration — 4 November 2026

Release scope: approved card fronts/backs and seven teal Numbot cutouts. Hosting deployment status is tracked separately from the source commit.

## Imported card artwork

35 fronts and six shared realm backs in public/cards/approved-2026-11-04-v1:
- Number Nexus: Ground–6, latest Number_Nexus_Cards softer finish (7).
- Measurelands: Ground–6 (7).
- Starpath: Ground–6 (7).
- Pattern Peaks: 3–6, corrected v2 pack (4).
- Chance Hollow: 3–6 (4).
- Statistica: 1–6 (6).

Number Nexus uses supplied trimmed sRGB previews. Other realms render the PDFs' explicit 63 × 88 mm TrimBox in RGB at 400 DPI, then encode high-quality sRGB WebP at 1008 × 1408. Original PDFs and previous browser assets are preserved. This work makes no assertion about supplier print approval. Source/output SHA256s and TrimBoxes are in approved-2026-11-04-sources.json. Reproduce with scripts/artwork/import-approved-art.py using a temporary environment containing PyMuPDF and Pillow.

## Canonical mapping and screens

Data lives in data/legend-artwork.ts, keyed by exact realm and learning level. data/legends.ts consumes this mapping. Character art is distinct from card art; guides no longer derive paths from card filenames. Missing/unsupported levels show a neutral unavailable placeholder, never an adjacent character.

Consumers: realm guides and arrivals, Ground program overlay, Number collection, other realm collections, binder cards, detail/enlarged/flip modals, Hall of Legends, parent portal, profile realm progress, unlock reveals and their replay route, Pattern Peaks program preview. Reveal backs now use their actual supplied realm artwork and the 63:88 stage ratio.

Named Ground mascots in Numbot Says, Feed Numbot, Numbot Trail, position activities and lesson completion/reflection now use the canonical character renderer. Generic robot counting tokens, geometry diagrams and avatar equipment remain instructional/cosmetic objects, not character cutouts. Realm backgrounds are unchanged. No identity, name, stat, progression, unlock or database changes.

## Teal cutouts — installed

The supplied Numbot_Teal_Avatars pack is now installed for Ground Bouncer, L1 Counter, L2 Builder, L3 Processor, L4 Solver, L5 Calculator and L6 Equationator. The seven 1254 × 1254 RGBA PNGs were copied byte-for-byte into public/guides/numbot-teal-2026-11-04-v1. No cropping, resizing or recolouring: fins, rocket effects and transparency are preserved. The canonical mapping replaces the emerald sci-fi set everywhere it is consumed. Both original sets remain available for recovery.

Re-import only the avatars with scripts/artwork/teal_avatars.py. The full artwork importer also uses the same function. Seven source/output hashes are included in the provenance file (48 assets total). All seven local URLs returned the exact PNG bytes, and the new teal set was visually inspected in Chrome at /demo-review/numbot-evolution.

No supplied card front/back is missing. The current catalogue has no Pattern/Chance Ground–2, Statistica Ground, or level 7–8 collectible cards; no adjacent-level substitute was added.

## Videos retained, separate replacement required

All existing videos remain connected and unchanged. New still artwork cannot change frames already baked into video. These files are used by components/LegendUnlockReveal.tsx (unlock animation, including app/demo-review/reliq-reveal) and components/legends/LegendDetailModal.tsx (showcase/unlock replay). No approved replacement video pack was supplied; video frames were not individually re-audited during this still-art import.

| Realm | Level | Character | Existing video |
| --- | --- | --- | --- |
| number-nexus | Prep | Numbot Bouncer | `public/videos/legends/numbot-bouncer.mp4` |
| number-nexus | Year 1 | Numbot Counter | `public/videos/legends/numbot-counter.mp4` |
| number-nexus | Year 2 | Numbot Builder | `public/videos/legends/numbot-builder.mp4` |
| number-nexus | Year 3 | Numbot Processor | `public/videos/legends/numbot-processor.mp4` |
| number-nexus | Year 4 | Numbot Solver | `public/videos/legends/numbot-solver.mp4` |
| number-nexus | Year 5 | Numbot Calculator | `public/videos/legends/numbot-calculator.mp4` |
| number-nexus | Year 6 | Numbot Equationator | `public/videos/legends/numbot-equationator.mp4` |
| measurelands | Prep | Meazurex Pebble | `public/videos/legends/meazurex-pebble.mp4` |
| measurelands | Year 1 | Meazurex Ticklet | `public/videos/legends/meazurex-ticklet.mp4` |
| measurelands | Year 2 | Meazurex Measurer | `public/videos/legends/meazurex-measurer.mp4` |
| measurelands | Year 3 | Meazurex Tracker | `public/videos/legends/meazurex-tracker.mp4` |
| measurelands | Year 4 | Meazurex Balancer | `public/videos/legends/meazurex-balancer.mp4` |
| measurelands | Year 5 | Meazurex Calibrator | `public/videos/legends/meazurex-calibrator.mp4` |
| measurelands | Year 6 | Meazurex Timewielder | `public/videos/legends/meazurex-timewielder.mp4` |
| starpath | Prep | Geospin Explorer | `public/videos/legends/geospin-explorer.mp4` |
| starpath | Year 1 | Geospin Roller | `public/videos/legends/geospin-roller.mp4` |
| starpath | Year 2 | Geospin Mapper | `public/videos/legends/geospin-mapper.mp4` |
| starpath | Year 3 | Geospin Navigator | `public/videos/legends/geospin-navigator.mp4` |
| starpath | Year 4 | Geospin Shapeshifter | `public/videos/legends/geospin-shapeshifter.mp4` |
| starpath | Year 5 | Geospin Galaxycrafter | `public/videos/legends/geospin-galaxycrafter.mp4` |
| starpath | Year 6 | Geospin Starweaver | `public/videos/legends/geospin-starweaver.mp4` |
| pattern-peaks | Year 3 | Patternox Wigglecode | `public/videos/legends/patternox-wigglecode.mp4` |
| pattern-peaks | Year 4 | Patternox Sequencer | `public/videos/legends/patternox-sequencer.mp4` |
| pattern-peaks | Year 5 | Patternox Solver | `public/videos/legends/patternox-solver.mp4` |
| pattern-peaks | Year 6 | Patternox Codemaster | `public/videos/legends/patternox-codemaster.mp4` |
| chance-hollow | Year 3 | Chanzia Spin | `public/videos/legends/chanzia-spin.mp4` |
| chance-hollow | Year 4 | Chanzia Flick | `public/videos/legends/chanzia-flick.mp4` |
| chance-hollow | Year 5 | Chanzia Roller | `public/videos/legends/chanzia-roller.mp4` |
| chance-hollow | Year 6 | Master Chanzia | `public/videos/legends/chanzia-master.mp4` |
| statistica | Year 1 | Datara Picker | `public/videos/legends/datara-picker.mp4` |
| statistica | Year 2 | Datara Sorter | `public/videos/legends/datara-solver.mp4` |
| statistica | Year 3 | Datara Grapher | `public/videos/legends/datara-grapher.mp4` |
| statistica | Year 4 | Datara Analyst | `public/videos/legends/datara-analyst.mp4` |
| statistica | Year 5 | Datara Decoder | `public/videos/legends/datara-decoder.mp4` |
| statistica | Year 6 | Datara Insightkeeper | `public/videos/legends/datara-insightkeeper.mp4` |

## Validation

- approved-artwork-test: all 35 exact mappings, six realm backs, 48 output hashes, 63:88 sRGB dimensions, guide alpha, unavailable-level fallback, existing video files.
- Non-artwork legend metadata SHA256 matches pre-import snapshot (names, IDs, stats, descriptions, video metadata).
- numbot-evolution-test: seven installed stages, distinct cutouts and transparency; confirms the new teal versioned paths.
- legend-card-artwork-audit: 7/7, ratio updated to the newly supplied trim specification.
- Critical checks: 17/17; QA lint and TypeScript passed.
- Production build passed again after installing the teal cutouts (exit 0), including TypeScript and static page generation; log: /private/tmp/reliq-teal-build.log.
- All 76 unique mapped card/guide URLs returned HTTP 200 and image content types from the local app.
- All 41 exported cards visually reviewed on contact sheets. Desktop gallery inspected in Chrome with fronts, backs and cutouts loaded. Mobile and interactive reveal inspection could not be completed after native Chrome accessibility/screenshot access became unavailable; do not treat the gallery check as a full interaction pass.
- Re-search of app/components/lib/data found no superseded hardcoded card paths outside the canonical mapping. Originals remain for recovery and historical tooling.

Local gallery: http://localhost:3001/demo-review/approved-artwork
Reveal review: http://localhost:3001/demo-review/reliq-reveal
