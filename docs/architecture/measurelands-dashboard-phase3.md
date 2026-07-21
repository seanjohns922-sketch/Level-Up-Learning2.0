# Measurelands Dashboard Phase 3

## Canonical architecture

Measurelands now renders through `RealmDashboardShell`. The Measurelands adapter contains only:

- level backgrounds
- guided-zone and district definitions
- realm labels
- theme values
- avatar presentation values

The shared dashboard owns:

- level selection and review-mode routing
- district state resolution
- Continue and district routing
- current-path rendering
- top navigation
- global XP and class-best widgets
- side navigation
- fog/tower progress
- avatar positioning
- loading and error presentation
- launch transitions
- desktop and tablet geometry

Number Nexus remains on its existing dashboard and was not migrated in this phase.

## Approved selector change

The former dropdown was replaced by a persistent horizontal strip directly below the top navigation. It displays Ground Level through Level 6 from left to right. Locked levels remain visible but disabled. The strip never opens over a district card.

## Visual parity

Production screenshots were captured at 1440 x 900 and 1024 x 768 for the Year 3 district dashboard, plus 1024 x 768 for the Ground Level guided dashboard.

| Area | Result |
| --- | --- |
| Top bar geometry | Identical, excluding the approved selector relocation |
| District positions and dimensions | Identical |
| District locked/current styling | Identical |
| Avatar anchor and size | Identical |
| Current Path | Identical |
| Tower/fog widget | Identical |
| Right-side navigation and best-chain widget | Identical |
| Guided Start Adventure action | Identical |
| Desktop containment | Passed |
| iPad landscape containment | Passed |

Below the approved top-navigation/selector region, the desktop raw-image comparison reported a mean channel delta of `0.2964` and `0.1799%` of pixels over a 20-point threshold. Those pixels are the animated procedural particle canvas. Static component geometry had no observed movement.

## Validation

- TypeScript: passed
- Production build: passed
- Measurelands Phase 3 architecture audit: passed
- Realm dashboard framework audit: passed
- Realm dashboard navigation audit: 6/6
- Measurelands progression audit: 9/9
- Measurelands iPad render audit: 9/9 across 46 components and 55 SVGs
- Targeted ESLint: passed
