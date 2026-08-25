# Measurelands 3D Art Bible

## Realm Identity

Measurelands is a warm fantasy civilisation built around measuring, timing, estimating, and understanding the physical world. It must feel like the student has stepped into the existing Measurelands paintings: timber-and-stone villages, observatories, workshops, clock towers, paths, and precision instruments. It must not read as a gold recolour of Number Nexus or as oversized classroom stationery.

Level 3 is the only implemented approval slice. Ground-Year 2 and Years 4-6 are discovered theme inputs, not released 3D worlds.

## Canonical Artwork

| Level | Active-theme artwork | Dimensions | File size | Status |
| --- | --- | ---: | ---: | --- |
| Ground / Prep | `/images/measurelands-home-bg.png` | 2754x1536 | 7,512,882 B | Candidate; optimise before 3D use |
| Year 1 | `/images/measurelands-home-bg-y1.png` | 1385x752 | 2,211,843 B | Candidate; resolution review required |
| Year 2 | `/images/measurelands-home-bg-y2.png` | 1385x752 | 2,198,604 B | Candidate; resolution review required |
| Year 3 | `/images/measurelands-home-bg-y3.jpg` | 2752x1536 | 901,719 B | Production-ready approval candidate |
| Year 4 | `/images/measurelands-home-bg-y4.jpg` | 2788x1536 | 1,146,418 B | Candidate; owner review after Level 3 |
| Year 5 | `/images/measurelands-home-bg-y5.png` | 2736x1536 | 8,431,451 B | Candidate; optimise before 3D use |
| Year 6 | `/images/measurelands-home-bg-y6.png` | 2770x1504 | 7,509,065 B | Candidate; optimise before 3D use |

The Level 3 matte is the current 2D realm artwork and is the visual continuity source for the M3D-1 slice. Only the active theme's image may load.

## Palette And Materials

- Ground: deep brown and charcoal foundations.
- Structure: warm stone, dark timber, aged bronze, restrained gold trim.
- Energy: amber and warm cream; purple only as a controlled district accent.
- Glow: local and soft. Current gates may guide strongly, while the environment remains non-fluorescent.
- Material set: warm stone, dark stone, timber, bronze, gold trim, amber energy, purple accent, measurement marking, and glass.

Code-built prototype materials should remain few and reusable. Production hero architecture may replace geometry without changing interaction coordinates or canonical gate state.

## Architecture And Motifs

Use ruler-edged paths, accurate tick marks, clocks, balance monuments, surveying forms, observatories, hourglasses, measuring arches, and workshop architecture. Motifs belong in buildings, paving, railings, and landmarks. Clearly readable scales and clocks must be mathematically coherent.

Level 3 districts are sourced from the current Measurelands map:

| District | Weeks | Identity |
| --- | --- | --- |
| Ruler District | 1-2 | Length and distance |
| Measure Lab | 3-4 | Mass and capacity |
| Timeworks | 5-6 | Duration and time |
| Explorer District | 7-8 | Perimeter and area |

## Gates And Signage

District and week gates preserve the shared states: `LOCKED`, `OPEN`, `CURRENT`, and `MASTERED`. Frames use timber/bronze and warm stone; energy colour communicates state. Labels must remain readable at gameplay camera distance and always include the district week range or week number.

The Level 3 district opens into two week gates. A week gate routes to the existing week screen, where lessons and the weekly quiz remain canonical. No lesson or quiz is rebuilt in 3D.

## Lighting, Fog, And Backgrounds

Use warm ambient light, a soft cream sun, restrained local amber lights, and brown atmospheric fog. The distant realm is a performant CSS matte behind a transparent WebGL canvas; foreground paths, gates, monuments, avatar, and collision remain real 3D geometry.

Background framing should preserve the artwork's horizon and village focal point. Do not place opaque scene backgrounds in front of the WebGL foreground. Level theme changes are configuration-driven and must retain shared geometry.

## Quality And Motion

- LOW: device-pixel ratio 1, no optional local point lights, static landmark detail.
- MEDIUM: standard antialiasing and capped pixel ratio.
- HIGH: capped higher pixel ratio and restrained local landmark lighting.
- Reduced motion: shared access policy can prefer the 2D experience; essential navigation remains available.

All tiers preserve identical routes, gate states, controls, and signage.

## Performance Limits

- Minimum target: 30 FPS on Chromebook/tablet profiles; 60 FPS on stronger devices.
- Target initial scene payload: 3-8 MB compressed.
- Keep the active Level 3 matte under its current 1 MB source size.
- Keep visible geometry moderate and dispose renderer-owned resources on route exit.
- Measurelands remains route-lazy so Number Nexus and normal 2D users do not download its scene.

M3D-1 desktop telemetry: 84 draw calls, 11,650 visible triangles, 84 geometries, and one texture at the realm entry. Ruler District: 54 draw calls and 5,262 triangles.

## Artist Boundary

Code is suitable for paths, signs, tick marks, simple gates, collision forms, state lighting, and prototype monuments. Artist-authored assets are recommended for production district landmarks, ornate clocks, observatories, workshops, hourglass structures, gate ornament, and the final realm entrance. Those assets must attach to the existing presentation layer rather than create new behaviour.

