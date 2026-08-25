# Level Up Central World 3D Art Bible

## Purpose

The Central World is the universal Level Up Learning overworld. It sits above every curriculum realm and must never inherit one realm's dominant visual language. Its V1 journey is deliberately simple: arrive in Tower Valley, see the Tower of Knowledge, follow the path, and enter.

`public/images/login-bg.jpg` is the visual inspiration for the valley and Tower. It is not the final 3D asset and is not used as a flat environment wall.

## Scale And Composition

- Permanent scale: 1 world unit = 1 metre.
- Student avatar: approximately 1.8 metres.
- Placeholder Tower: approximately 52 metres to its crown.
- Spawn-to-entrance distance: approximately 45 metres, targeting 10–20 seconds at normal speed.
- The Tower remains centred and visible from spawn.
- The path widens into a clear plaza before the entrance.
- Playable terrain is compact; distant mountains establish horizon scale and are not explorable.

Semantic anchors live in `lib/world3d/central-world-config.ts`:

- `central-world-spawn`
- `tower-main-entrance`
- `tower-exit-spawn`
- future west, east, stream, and Tower-plaza zones

## Visual Identity

Palette:

- warm golden sunlight
- natural mid-value grass greens
- muted earth and stone
- bronze and sandstone Tower materials
- pale blue morning sky
- cool grey-green distant mountains

The scene should feel peaceful, optimistic, spacious and academically magical. Avoid Number Nexus teal dominance, Measurelands purple/gold dominance, cosmic space language, crystals, probability motifs and realm-specific symbols.

## Tower Of Knowledge

The Tower is the hero landmark and universal Level Up structure. Its production silhouette must preserve:

- tall central body
- pointed crown
- strong vertical buttresses
- monumental dark entrance
- large circular mechanical knowledge dial
- warm sandstone, bronze and restrained illuminated detail

The current Tower is composition geometry only. It proves scale, entrance size, camera framing and approach distance. Production work should become a separate GLB with distant, mid and near LOD states, a simple collision proxy and explicit entrance/exit anchors. Do not bake it permanently into terrain.

Suggested production budget:

- near LOD: 60k–100k triangles
- mid LOD: 20k–35k triangles
- distant LOD: 5k–10k triangles
- one 2K trim/material atlas plus one optional 1K dial/emissive atlas
- compressed Tower bundle target: under 3 MB where visual quality permits

## Terrain And Path

Terrain is broad, smooth and traversal-first. The playable valley should not become a platforming space. The earth/stone path gently bends from spawn to the Tower and remains the strongest ground-level directional cue.

Natural boundaries should eventually use hills, rocks, water and terrain slope. Collision remains broad: terrain, major Tower mass and major structures only. Grass, flowers and small stones are non-collidable.

## Vegetation

Grass density scales by quality tier. Richness should come from terrain colour variation, small hero clusters and lighting rather than high instance counts or transparent overdraw. Trees, when introduced, should remain sparse and frame paths or future expansion zones rather than turning the valley into a forest.

## Stream

The stream supports composition and atmosphere. It has no swimming or water physics. Use a low-cost opaque or lightly reflective animated material. A small stone bridge may be introduced later if it strengthens the path without complicating traversal.

## Mountains, Sky, Lighting And Fog

- Mountains are low-detail horizon silhouettes softened by fog.
- Sky is warm morning light: gold near the horizon, pale blue above.
- Use one warm directional key, soft sky/ground hemisphere fill and restrained cool bounce.
- Fog provides atmospheric depth without hiding the Tower.
- No day/night system in V1.

## Environmental Life

V1 life is subtle: grass variation, slow water pulse and slow Tower-dial movement. Future clouds, wind, birds, motes and audio hooks may be added only when their performance cost is measured. No NPCs, collectibles, quests or multiplayer systems belong in this phase.

## Quality Tiers

- Low: 70 grass tufts, DPR 1, no antialiasing.
- Medium: 150 grass tufts, DPR up to 1.25.
- High: 260 grass tufts, DPR up to 1.5.

All tiers share navigation, Tower scale and landmarks. Quality settings may reduce detail but must never change gameplay coordinates.

## Asset Boundaries

`/world` dynamically loads only the central-world client bundle. It must not import or preload realm environment assets. Future bundles remain separate: `central-world`, `tower`, `number-nexus`, `measurelands`, `starpath`, `statistica`, `pattern-peaks`, and `chance-hollow`.

## Future Zones

The west, east, stream and Tower-plaza anchors are intentionally empty. They reserve coherent expansion space for future Level Up systems without placing unfinished features in front of students.

## Approval Gate

Before production Tower modelling, approve:

- first spawn view
- Tower scale and dominance
- 10–20 second approach
- path and plaza composition
- entrance readability
- universal Level Up identity
- low/medium/high device performance

