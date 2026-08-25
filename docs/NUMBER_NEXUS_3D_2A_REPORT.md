# Number Nexus 3D Phase 3D-2A Report

Status: Counting District visual checkpoint complete. Number Bridge has not been started.

Recommendation: **COUNTING DISTRICT VISUAL DNA READY FOR APPROVAL - NO**

The production pipeline, palette, gate language, performance budgets, lazy loading, and frozen learning flow are ready for review. The current code-generated environment is a strong composition prototype, but the Number Gate is not dominant enough, the Tower does not consistently read as a separate landmark from gameplay positions, and hero modelling quality needs owner/art direction before this becomes the reference for every district.

## Deliverables

- Art bible: [NUMBER_NEXUS_3D_ART_BIBLE.md](./NUMBER_NEXUS_3D_ART_BIBLE.md)
- World architecture: [LEVEL_UP_3D_WORLD_ARCHITECTURE.md](./LEVEL_UP_3D_WORLD_ARCHITECTURE.md)
- Existing approved Number Nexus artwork audited: realm backgrounds for Prep and Years 1, 3, 5, and 6; Year 3 home and lesson hero art; tile/legend art; Tower map art; Realmie family style lock; current map and progression UI.
- Exact operational palette: `#020B10`, `#061B20`, `#071C21`, `#0D2B30`, `#12373A`, `#163B3B`, `#22D3C5`, `#14B8A6`, `#99F6E4`, `#F6C453`, `#34D399`, `#38BDF8`, `#52616B`, `#ECFEFF`.
- Architecture language: symmetrical mathematical modules, octagonal bases, diamonds, segmented panels, grids, bridges, vertical stacks, and restrained circuit inlays.
- Material library: dark metal, raised metal, stone, cyan energy, teal glass, amber window, completed, and locked.
- Counting District: broad approach, three-week plaza, shared stateful week portals, Number Gate composition, counting pylons, conduits, future Number Bridge sign, instanced skyline, fog, lighting, and Tower silhouette.
- Navigation: flat routes at least 4 m wide, no jumping, no precision stairs, no dead ends on the required path, world-bound collision, and props kept outside the central route.
- Current Mission: travelling floor pulse on MEDIUM/HIGH, fixed destination ring on LOW, pale-energy current portal, readable HUD, and permanent Quick Start.
- Gate states: one mesh changes emission, physical symbol, signage, and pulse. Quiz-ready reuses the week portal with amber energy; lesson and quiz selection remain on the canonical week screen.

## Assets

Code-generated now:

- plaza, paths, conduits, Number Gate composition, week portal, state marks, counting pylons, signs, skyline, Tower silhouette, lighting, fog, and mission pulse;
- external Counting District model/texture download: **0 bytes**;
- scene renderer texture allocation: **1 texture**; estimated scene texture memory below **1 MB**, excluding browser framebuffers and font rasterisation.

Artist-required after visual approval:

- final Number Gate hero GLB;
- universal Tower exterior GLB;
- district hero buildings and Number Bridge connection;
- close-range prop set and trim/texture atlas;
- final student avatar.

## Runtime Evidence

Production build, 1440 x 813 headless Chrome isolated software/ANGLE profile:

| Tier | FPS | Draw calls | Visible triangles | Geometries |
| --- | ---: | ---: | ---: | ---: |
| LOW | 15 | 68 | 2,526 | 64 |
| MEDIUM | 14 | 72 | 2,726 | 68 |
| HIGH | 14 | 72 | 2,838 | 68 |

These FPS figures are diagnostic software-renderer results, not Chromebook or iPad claims. Physical Chromebook and iPad testing remains required against the 30 FPS floor; stronger-device 60 FPS verification also remains open.

- Lazy 3D chunks: **928,750 bytes raw / 245,514 bytes gzip**.
- Normal `/number-nexus` route manifest does not reference the 3D chunk.
- Cache-cleared load: **460 ms** navigation, **533,634 bytes** transferred across route resources.
- Cached repeat: **105 ms** navigation, **600 bytes** resource transfer reported.
- Cleanup: SPA exit marked telemetry `active: false` and reduced world canvas count from **1 to 0**.

## Captures

- [Realm entry](./captures/number-nexus-realm-entry.png)
- [Counting District wide / Current Mission](./captures/number-nexus-counting-medium.png)
- [Week 1 approach](./captures/number-nexus-week-1-approach.png)
- [Number Gate landmark test](./captures/number-nexus-number-gate.png)
- [Tower vista test](./captures/number-nexus-tower-vista.png)
- [Locked](./captures/number-nexus-gate-locked.png)
- [Available](./captures/number-nexus-gate-available.png)
- [Current](./captures/number-nexus-gate-current.png)
- [Completed](./captures/number-nexus-gate-completed.png)
- [Weekly quiz ready](./captures/number-nexus-weekly-quiz-ready.png)
- [LOW](./captures/number-nexus-counting-low.png)
- [MEDIUM](./captures/number-nexus-counting-medium.png)
- [HIGH](./captures/number-nexus-counting-high.png)

The four-state and quiz captures use teacher-preview visual overrides only. They do not change gate interaction, canonical unlocks, routes, or saved progress.

## Validation

Passed:

- TypeScript and targeted ESLint;
- production build and realm release gate;
- 3D return-context audit;
- canonical progression audit, 23/23;
- access, WebGL fallback, reduced-motion, and 2D isolation audit;
- art boundary and asset-size audit;
- renderer cleanup check;
- LOW/MEDIUM/HIGH comparison.

The production build still logs the pre-existing `/admin/home` dynamic-cookie static-render notice, but completes successfully and marks that route dynamic.

## Owner Decisions

1. Approve or revise the dark teal/cyan/amber palette and restrained glow level.
2. Decide whether the Number Gate should remain axial or move off-axis so it cannot visually merge with week portals.
3. Approve commissioning hero GLBs now versus one more code-generated composition pass.
4. Decide how strongly the warm universal Tower should contrast with the Number Nexus skyline.

Before Number Bridge: resolve the Number Gate and Tower landmark tests, approve architecture density and portal design, complete physical Chromebook/iPad profiling, and obtain explicit owner visual approval.
