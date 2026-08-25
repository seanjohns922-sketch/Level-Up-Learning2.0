# Starpath 3D Art Bible

## Scope

Starpath is a celestial observatory realm for spatial reasoning, mapping, transformations, and position. The shared 3D world now supports Ground through Level 6 while retaining canonical progression and one common runtime.

## Source Of Truth

- The existing 2D level artwork is the forward view of each 3D level.
- A complementary rear image completes the 360-degree panorama. Never stretch one flat image around the full cylinder.
- Level 3 uses `starpath-panorama-y3-front.jpg` and `starpath-panorama-y3-rear.jpg`.
- Levels 4 and 5 share the calmer `starpath-panorama-y45-front-4k.jpg`, `starpath-panorama-y45-rear-4k.jpg`, and `starpath-y45-crystal-floor-2k.jpg` environment. The artwork uses Level 5's palette and materials as inspiration while leaving the portal plaza visually quiet.
- Level 6 uses `starpath-panorama-y6-front-4k.jpg`, `starpath-panorama-y6-rear-4k.jpg`, and `starpath-y6-constellation-floor-2k.jpg`. It keeps the same playable layout while presenting a darker, more prestigious capstone observatory.
- The panorama must preserve the same celestial architecture, cloud horizon, crystalline materials, observatory language, colour temperature, and rendering style across both halves.
- The 2D Starpath route, curriculum, assessment, progression, and week artwork remain canonical.

## Level 3 World

The player arrives on a circular observatory platform above the clouds. Four isolated portals form a readable arc around the central celestial vista:

| District | Curriculum | Weeks |
| --- | --- | --- |
| Object Observatory | 3D objects | 1-2 |
| Mapmaker's Reach | maps | 3-4 |
| Transformation Crossing | transformations | 5-6 |
| Spatial Mission | position and spatial mission | 7-8 |

District order, week grouping, state, and route come from canonical progression. The environment never stores progress.

## Visual Language

- Deep indigo observatory structures with pale blue crystalline energy.
- Lavender and soft pink secondary energy distinguish districts without recolouring the whole realm.
- Circular star-map paths, orbital rings, floating observatories, telescopes, crystals, and suspended bridges.
- Open ground reads as layered blue-white cloud. Navigation uses narrow suspended glass-panel causeways with silver-blue rails and cross-joints; never use a solid dark plaza beneath the whole level.
- Portal geometry stays simple and readable at gameplay distance.
- `LOCKED`, `OPEN`, `CURRENT`, and `MASTERED` are communicated by both text and energy treatment.
- The world must feel open and celestial, not like a dark sci-fi corridor or a Number Nexus recolour.

## Shared Runtime Rules

- Use `SharedRealmWorld3D`, `SharedThirdPersonPlayer`, `WorldHUD`, `WorldMovePad`, and the shared interaction prompt.
- Use canonical `space` progress through `realm-world-state.ts`.
- Preserve Quick Start, Realm Teleport, Return to Tower, 2D View, touch controls, and transient lesson return context.
- Do not add `starpath3DProgress`, Starpath-specific movement, or a Starpath-specific camera engine.
- Normal 2D users must not download the Starpath 3D bundle or panorama.

## Performance

- Target at least 30 FPS on Chromebook and tablet hardware and 60 FPS on stronger devices.
- Keep the initial scene within the approved 3-8 MB compressed range.
- LOW, MEDIUM, and HIGH quality modes must preserve navigation, gates, and labels.
- Prefer compressed panorama pairs and procedural foreground geometry. Load future district detail only after entry.

## Level Structure

Ground-Level 2 use one guided `START YOUR VOYAGE` portal. Levels 3-6 use the same four-district geometry and interaction layout. Their identity changes through the matching 2D level artwork, complementary panorama half, sky, fog, light, and restrained dressing configured in `STARPATH_LEVEL_THEMES`.
