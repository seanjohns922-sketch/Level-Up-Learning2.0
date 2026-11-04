> Superseded integration note (4 November 2026): the current character mapping uses the approved teal PNGs in `public/guides/numbot-teal-2026-11-04-v1`, copied unchanged from Downloads/Numbot_Teal_Avatars. The original sci-fi pack below is retained for recovery. Card fronts/backs now use the approved versioned artwork; existing videos remain unchanged. See `docs/artwork/APPROVED-ARTWORK-2026-11-04.md` for the current rollout report.

# Numbot sci-fi guide update

Seven transparent RGB WebP guides: Ground Bouncer; Level 1 Counter; Level 2
Builder; Level 3 Processor; Level 4 Solver; Level 5 Calculator; Level 6 Equationator.
Every stage has its own versioned asset in public/guides/numbot-sci-fi-v1.

## Program connections

- data/legends.ts assigns each Number Nexus legend its new character cutout.
- getLegendGuideImage resolves explicit guide paths and preserves legacy guide
  paths for the other five realms.
- RealmGuide uses this resolver for arrivals and the ongoing pop-up guide.
- The existing Ground program-page overlay uses the canonical Bouncer image.
- Review all seven at /demo-review/numbot-evolution.

No database, schema, grants, RLS, progression thresholds, unlock IDs, student
identity or reward rules change. Original guides and card files remain available.
To roll back, revert this commit; original assets are preserved.

## Checks

Run node --no-warnings --experimental-strip-types scripts/numbot-evolution-test.mjs.
It verifies all seven level mappings, distinct existing assets, actual alpha
transparency and near-opaque visible characters, Ground overlay and unchanged
legacy paths for the other realms. Generated images have near-opaque interiors
(alpha 240-255), so the visibility check intentionally measures that range.
Also run qa:critical, lint:qa, typecheck and the release build.

## Remaining artwork work

This guide update does not replace the card fronts/backs or the existing unlock
and showcase videos. Those need the new identities before the visual rollout is
complete. Existing lesson-specific robot icons and marketplace calculator props
are separate learning/cosmetic assets and are not silently replaced here.

Artwork was produced with built-in image generation from the approved sci-fi
Bouncer/Equationator concept. Each stage was prompted independently as a complete
transparent character, preserving the shared emerald/silver palette, geometric
chest core and level-specific proportions, armour and flight hardware.

## Validation in this workspace

- PASS: seven-stage asset and transparency checks.
- PASS: all 17 qa:critical checks and all 7 card-artwork checks.
- PASS: lint:qa, affected-file ESLint and TypeScript (Node heap 6144 MB).
- PASS: optimized production compilation, type checking and page generation
  via NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm exec next build.
- Full npm run build prebuild gate stopped at missing existing Chance Hollow
  public assets in this sparse checkout; that gate is not reported as passed.
- Browser interaction/screenshot testing was unavailable because the Chromium
  download failed. The generated characters were visually reviewed on light
  and dark backgrounds, and the compiled review page image references checked.
- No deployment or production update performed. GitHub source upload was
  rejected by automatic approval review; review pack is prepared locally.
