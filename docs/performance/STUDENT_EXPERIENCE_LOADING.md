# Student experience loading — 19 November 2026

## Lesson engine loading

The shared lesson page previously imported both `PracticeRunner` and
`Year2LessonEngine` synchronously. It now uses module-level `next/dynamic` imports
and mounts only the engine selected by the existing lesson branch. A status
message appears within the existing lesson shell while the selected engine loads.
Engine implementations, props, lesson selection, questions, marking, completion,
rewards and canonical progress code are unchanged. No world artwork was edited.

Two fresh production builds provide the comparison below. Values are decimal MB
of minified JavaScript referenced by production HTML, excluding legacy `nomodule`
polyfills. Selected-engine totals also include that engine's loadable-manifest JS
chunks, deduplicated against the initial route scripts.

| Scenario | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Initial lesson route | 6.604 MB | 4.064 MB | 38.5% |
| Route plus PracticeRunner | 6.604 MB | 5.824 MB | 11.8% |
| Route plus Year2LessonEngine | 6.604 MB | 5.302 MB | 19.7% |

Estimated gzip totals for the two complete engine scenarios fall by 9.8% and
15.2%, respectively. Home Base and Program gain 585 uncompressed bytes each from
shared loading runtime changes. These are **build measurements**, not measured
network transfers or claims about seconds saved. CSS, media, later imports,
hydration, gameplay and device performance require separate measurements. The
new deferred request can add a network round trip on a cold cache; assess that
tradeoff on throttled devices before adding speculative preloads.

`scripts/student-route-bundles.mjs` reproduces the route and engine measurements
from `.next` after a successful build. It also reports newly referenced JS along
the Home Base → Program → Lesson sequence, assuming unchanged URLs stay cached.
Summary: `docs/performance/student-loading-2026-11-19.json`. Full chunk inventories:
`/Users/seanjohns/reliq-audits/2026-11-19/student-loading/`.

## Verification

- Full production build, including all required prebuild audits, passed.
- Standalone typecheck, 17/17 critical checks, QA lint, targeted audit-script lint,
  Node syntax and final whitespace checks passed.
- Real React completion checks passed for Prep–8 PracticeRunner and the timed
  Year2 engine: completion → coach review → completion card, completion once.
  The existing DOM harness lacked animation-frame APIs; added deterministic
  request/cancel callbacks and an explicitly layout-free scrolling stub. No
  product behaviour was changed to accommodate the test.
- Desktop Chrome against the local production build: Year 1 and Year 2 teacher
  previews opened their intros and guides, displayed the loading status, rendered
  the selected engine, accepted a correct answer, updated score/progress and
  advanced to the next question. No student account or school data was used.
  The test tab and temporary preview server were closed afterward.

The first sandboxed baseline compile could not fetch Google Fonts. Its prebuild
checks passed; the compile was retried successfully with network access. The
candidate's complete build subsequently passed with that access.

Windows/iPad, mobile layouts, slow-network/chunk-failure recovery, audible speech,
server persistence, world frame rates and 10,000-user load are not verified here.

## Next work

1. Measure cold and warm lesson entry on constrained devices, including the new
   deferred request. Several realms' question generators and guides are still
   imported by the shared entry point; profile the remaining dependency graph
   before splitting curriculum data.
2. Measure the world scene's assets and render frame times separately from its
   existing diagnostic/canonical-restore gates. Preserve those gates and the
   concurrent visual work.
3. Continue the scoped-attempt SQL prototype through actual HTTP permissions,
   legacy fallback, pagination and concurrent workloads; see
   `TEN_THOUSAND_CONCURRENT.md`. Its earlier SQL speedup remains a prototype,
   not a deployed capacity improvement.
