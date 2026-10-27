# P0 Largest Contentful Paint Audit

Scope: Teacher Dashboard, School Home, and Student Home. Functionality, canonical saving, progression, and permissions remain unchanged.

## Teacher Dashboard

### Critical first render

- Supabase auth session resolution.
- Teacher class list (or the requested school-preview class access check and class row).

The route now server-renders a dashboard-shaped skeleton while these complete. Once the class list is known, the full dashboard shell renders immediately.

### Deferred hydration

- Selected-class roster.
- Number Nexus canonical progress.
- Measurelands canonical progress.
- Live student activity.
- Historical live activity events.
- School name and logo selection.

The roster is published as soon as its query completes. Progress and activity requests remain parallel and hydrate their existing panels afterward.

### Cache policy

Authenticated class, progress, and live-activity data must not be shared across users or cached as static route data. Existing 30-second live refresh behavior remains unchanged. Bundled curriculum and realm configuration require no network request.

## School Home

### Critical first render

- Preview cookie and adult session validation.
- School access context.
- School home snapshot RPC.
- School switcher context and administration permission.
- Mandatory access audit write.

The access audit write now overlaps the snapshot requests instead of creating a separate network waterfall. The existing route skeleton streams while the server snapshot resolves.

### Deferred hydration

- The canonical school-wide student directory is fetched only when the Students tab opens.

The directory has a dedicated table skeleton and refreshes after student creation or Explorer Code reset. Class and school overview data still server-render.

### Cache policy

School snapshots and directories are permission-sensitive and mutable, so they remain `no-store`. The small school logo uses `next/image` with priority. A shared cross-user cache is not appropriate for these records.

## Student Home

### Critical first render

- No data request blocks the visual shell.
- Canonical realm progress and secure student runtime context still load in parallel and continue to control the destination.

The branded backdrop and a stable journey skeleton render immediately. The previous 1.4 MB, 3840-pixel JPEG has been replaced on this route by a 124 KB, 1920-pixel WebP delivered through `next/image` with high fetch priority and responsive sizing.

### Cache policy

The visual asset can be cached by the image pipeline. Canonical student progress remains uncached because it determines placement and routing.

## Measurement

The code changes remove known LCP blockers, but a field LCP below 2.5 seconds must be confirmed after deployment using the same route and device percentile in Vercel Speed Insights. Field metrics aggregate real visits and will not update immediately after release.


## Follow-up investigation — 28 October 2026

Read-only inspection of Vercel Speed Insights and local application/build output.
No application, database or deployment change was made during this investigation.

### Field evidence

Production, Desktop, P75, Last 7 Days (21–28 October), inspected through the
signed-in Vercel dashboard. These are route-filtered field aggregates, not a
single-session trace or measurements of only the latest deployment.

| Route | RES | FCP | LCP | INP | CLS | TTFB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| /login | 60 | 4.09 s | 6.59 s | 80 ms | 0 | 1.58 s |
| /pretest | 51 | 1.90 s | 4.14 s | 400 ms | 0.47 | 0.16 s |
| /world | 51 | 1.58 s | 6.42 s | 640 ms | 0 | 0.39 s |

The overall CLS of 0.35 must not be attributed to login or world: both show zero
at the selected percentile. Pretest is a confirmed layout-stability priority.
Metric percentiles describe different event distributions; subtracting them does
not produce a valid per-session waterfall.

### Code and build findings

- **Login:** `app/login/page.tsx` renders a full-screen plain `img` using
  `/images/Gemini_Generated_Image_1fyweu1fyweu1fyw.png` (6,672,074 bytes).
  It has no responsive source set or image optimisation. This is a confirmed
  large critical visual, but no LCP element trace was captured to prove that it
  accounts for the full field delay. The login TTFB also needs separate review.
- **Pretest:** its initial production HTML references 40 JavaScript files,
  totalling 8,536,518 bytes uncompressed (1,470,082 bytes when independently
  gzipped). Login references 13 files, totalling 902,412 bytes uncompressed
  (266,993 independently gzipped). These are local build asset totals, not actual
  network transfer measurements; browser caching and server compression vary.
  The inspected HTML was built on 27 October at 09:19 UTC. Its deployment identity
  has not been verified. The current pretest source statically imports all six
  extension assessment components and a broad assessment API that imports many
  banks. Loading is represented by a centred text placeholder before the full
  assessment screen. A trace is still required to locate the actual CLS sources
  and long interaction tasks; these are candidates, not proven attribution.
- **World:** `CentralWorld3DEntry` awaits the diagnostic check, then
  `restoreCanonicalWorldState`, then mounts the dynamically imported scene.
  The canonical bootstrap awaits each live realm in a sequential loop. Each
  realm restore includes a runtime-context request. This creates a confirmed
  serial data dependency before the scene can mount. Rendering also uses an
  animated Three.js canvas with quality-dependent shadows and pixel ratio.
  A CPU/GPU interaction trace is required before attributing the 640 ms INP to
  any particular scene component.

### Recommended scoped repairs

1. Serve the same login artwork through responsive image optimisation and
   prioritise its loading; preserve the existing visual and demo hotspot geometry.
   Investigate login document TTFB separately using deployment/request evidence.
2. Split pretest by realm/level so unrelated extension UI and question banks are
   loaded on demand. Preserve question IDs, release versions, resume state,
   scoring, read-aloud and canonical saving. Trace the loading-to-question
   transition and reserve space for identified shifting elements.
3. Overlap safe world asset loading with canonical restoration, and investigate
   duplicate context reads and serial realm reads. Do not parallelise storage
   writes blindly or bypass identity, diagnostics or progression checks.
   Profile scene interactions before changing render quality.
4. Compare controlled before/after traces, then verify route-specific field
   metrics for a post-deployment date window, including Mobile separately.

Reference implementation guidance: [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)
and [Chrome layout-shift diagnosis](https://web.dev/articles/optimize-cls).

No claim is made that Realmies retirement caused these metrics, that the exact
October 26 regression is identified, or that a performance repair has shipped.


## Implemented performance pass — 28 October 2026

Local changes, not yet deployed:

- Login now uses `next/image` with `fill`, `sizes="100vw"` and priority loading
  for the same artwork. The local production image endpoint returned HTTP 200,
  `image/webp`, 89,620 bytes at width 1920 / quality 75 (original: 6,672,074 bytes).
  Chrome visual inspection confirmed the backdrop, logo and login controls render.
  This is an image-size comparison, not a measured field LCP improvement.
- Pretest loads each extension assessment on demand instead of importing every
  extension UI eagerly. Lesson-native assessment questions load the large
  TaskRenderer only when needed. The existing question selection, version/resume
  logic, marking, read-aloud, saving and question IDs are unchanged.
- Pretest now has an assessment-sized loading surface, with realm tokens when
  the realm is known. The exact field CLS sources have not yet been traced;
  this placeholder is not a claim that the measured CLS is fixed.
- World overlaps scene-code loading with restoration, after the diagnostic gate.
  Canonical realm requests now overlap instead of running sequentially. Each
  existing restore retains its active-student guards and synchronous realm-scoped
  cache merge. The world still waits for all restores to succeed before proceeding.
  No shared cross-student cache or database permission change was added.

### Local production-build comparison

Initial JavaScript files referenced by the static pretest HTML:

| Measurement | Previous build | Updated build |
| --- | ---: | ---: |
| Uncompressed bytes | 8,536,518 | 6,858,136 |
| Independently gzipped bytes | 1,470,082 | 1,121,877 |

That is about 20% less initial JavaScript by uncompressed size and 24% less by
independent gzip size. Deferred chunks can still be requested when their features
are used; these numbers are not a browser network trace. The broad legacy question
bank API still contributes to the remaining payload and needs a separate,
version-preserving split if further reduction is required.

### Validation and limits

- Complete prebuild suite and production build passed.
- Standalone typecheck, focused application lint and QA infrastructure lint passed.
- Critical QA: 13/13 passed, including new actual-function tests with deferred
  network fixtures for concurrent realm restore, reversed completion ordering,
  preservation of all realm caches, rejection without a ready event and student
  identity changes while requests are pending.
- World 3D production parity passed.
- `qa:central-world3d` fails the pre-existing `maxZ: 54` meadow-size source assertion.
  Both the assertion script and the world configuration are unchanged from HEAD;
  it was not suppressed or altered for this patch.
- No signed-in production journey, physical iPad, GPU interaction trace or fresh
  field RES/CLS/INP validation was performed. Login TTFB and the world's measured
  interaction latency are not established as fixed by these startup changes.

Rollback is an application-code revert; no schema/data migration is involved.
