# Number Nexus 3D Art Bible

Status: Phase 3D-2A Counting District checkpoint

Scope: Number Nexus Level 3 only. Counting District is the reference slice. Number Bridge, Calculation Core, Mastery Sector, and Legend Tower production environments remain out of scope until owner approval.

## Source Of Truth Audit

The following approved repository artwork was reviewed:

- `public/images/number-nexus-bg-y3.png`: Level 3 city, layered bridges, circuit panels, dark structural towers, central cyan energy axis.
- `public/images/number-nexus-home-bg-y3.jpg`: teal night skyline, repeated vertical towers, warm amber windows, restrained floating infrastructure.
- `public/images/lesson-hero-number-nexus.jpg`: close city canyon, circuit borders, gears, controlled cyan energy and readable numeric panels.
- `public/images/number-nexus-tile.jpg`: monumental city and gold Number Nexus apex treatment.
- `public/images/number-nexus-bg-prep.png` and `number-nexus-bg-y1.png`: friendlier foundation-city progression.
- `public/images/number-nexus-bg-y5.png` and `number-nexus-bg-y6.png`: later-level scale and gold culmination.
- `public/images/tower-map-bg.jpg`: universal Tower silhouette and warm gold identity.
- `public/realmies/concepts/number-nexus-family-style-lock.png` and approved Number Nexus Realmie specifications: navy/cyan body language, lime and purple secondary accents, rounded child-friendly forms.
- Existing Number Nexus map configuration, lesson chrome, activation effects, district colours, and progression-state colours.

The approved visual identity is a mathematical civilisation, not generic cyberpunk. Its strongest recurring signals are dark teal metal, geometric megastructures, circuit-like inlays, bridges, controlled cyan energy, amber inhabited windows, and a central monumental axis.

## Palette

Operational colours are sampled from the approved art and aligned with existing Number Nexus UI tokens.

| Token | Hex | Use |
| --- | --- | --- |
| `NN_Void` | `#020B10` | Sky, deep recesses, portal interiors |
| `NN_Fog` | `#061B20` | Atmospheric depth |
| `NN_DarkMetal` | `#071C21` | Primary structures |
| `NN_RaisedMetal` | `#0D2B30` | Frames, pylons, gate structure |
| `NN_Panel` | `#12373A` | Circuit panels and plaza inserts |
| `NN_Stone` | `#163B3B` | Walkable architectural surfaces |
| `NN_CyanEnergy` | `#22D3C5` | Paths, active infrastructure |
| `NN_TealEnergy` | `#14B8A6` | Canonical Number Nexus energy |
| `NN_PaleEnergy` | `#99F6E4` | Current mission highlight |
| `NN_Amber` | `#F6C453` | Windows, quiz emphasis, Tower distinction |
| `NN_Completed` | `#34D399` | Stable completed state |
| `NN_Available` | `#38BDF8` | Available but non-current state |
| `NN_Locked` | `#52616B` | Inactive structures |
| `NN_White` | `#ECFEFF` | High-contrast signs |

Purple and lime belong mainly to Realmies and later specialist districts. They are not dominant Counting District environment colours.

## Architecture Language

- Structures grow from repeated numeric modules, octagonal bases, square diamonds, segmented panels, grids, and symmetrical vertical stacks.
- Important structures are axial and legible. Secondary structures form subdued layers.
- Circuit lines are architectural inlays, not surface-wide neon decoration.
- Bridges and conduits imply that all districts form one connected city.
- Counting District is open, welcoming, broad, and foundational. Later districts may become taller and denser.
- The universal Tower uses warm stone/gold and a distinct tapered silhouette. It must not read as another Number Nexus office tower.

## Scale And Layout

- One Three.js unit equals approximately one metre.
- The temporary child avatar is approximately 1.65 m tall.
- Primary paths are at least 4 m wide.
- Week portals are approximately 3.2 m tall: grand but readable at child scale.
- The Number Gate is approximately 8 m tall and anchors the district horizon.
- Distant skyline buildings range from approximately 4.5 m to 10 m in the procedural slice, with fog and layering extending perceived scale.
- The Tower vista is intentionally beyond the walkable boundary.

## Materials

The production material library is deliberately small:

| Material | Characteristics |
| --- | --- |
| `NN_DarkMetal` | Dark green/navy, medium metalness, broad roughness |
| `NN_RaisedMetal` | Slightly lighter structural frame material |
| `NN_Stone` | Matte, durable walkable plaza material |
| `NN_CyanEnergy` | Emissive path and infrastructure energy |
| `NN_TealGlass` | Future transparent portal and display treatment |
| `NN_AmberWindow` | Low-intensity inhabited-city light |
| `NN_Completed` | Stable green-teal completion energy |
| `NN_Locked` | Desaturated inactive metal and low emission |

Avoid unique materials per prop. Future GLBs should map to this library wherever practical.

## Lighting And Atmosphere

- Base environment: near-black teal sky and fog.
- Soft cool ambient light preserves readable silhouettes.
- One cool directional key light shapes architecture.
- Local teal light is reserved for the active plaza.
- Amber light belongs to windows, quiz emphasis, and the Tower.
- Fog begins beyond the playable plaza and suppresses distant detail competition.
- No continuous full-screen particles are required on LOW or MEDIUM.
- Glow communicates purpose. Background skyline emission remains weaker than paths, current gates, and landmarks.

## Counting District

The arrival view presents a broad central route, a three-way week plaza, the Number Gate, a distant city, a visible Tower, and a signed future connection toward Number Bridge.

The frozen product flow remains:

`Counting District -> Week portal -> existing week screen -> lesson/quiz`

The art brief's proposed three lesson entrances plus quiz entrance per week is not introduced in this phase because it would contradict the approved and frozen navigation flow. The existing week screen remains the canonical place for lesson and quiz choice.

### Number Gate

- Symmetrical twin pylons with a broad lintel.
- Diamond number-energy nodes and vertical circuit channels.
- Strong central silhouette visible from spawn and week portals.
- Normal state has restrained teal energy.
- Canonical district completion powers the gate to pale cyan without writing progress.
- This code-generated landmark is a composition prototype. A final hero-quality Number Gate is a candidate for professional modelling after visual approval.

### Week Portals

One shared model serves LOCKED, AVAILABLE, CURRENT, and COMPLETED:

| State | Material | Illumination | Physical mark | Environment response |
| --- | --- | --- | --- | --- |
| Locked | Desaturated dark metal | Nearly inactive | Cross bars | No path emphasis |
| Available | Blue-cyan energy | Moderate | Diamond node | Portal readable |
| Current | Pale cyan or quiz amber | Strongest controlled pulse | Diamond beacon | Canonical path energy points toward plaza |
| Completed | Stable green-teal | Steady, non-pulsing | Check mark | District energy remains stable |

State is never communicated by colour alone. Emission, symbol geometry, text, and pulse behaviour work together.

### Quiz Treatment

The 3D portal remains a week portal. When the canonical next activity is the weekly quiz, the same portal gains restrained amber energy and `QUIZ READY` signage. Lesson/quiz selection remains in the existing week screen.

## Paths And Wayfinding

- A wide main route runs from spawn to the plaza.
- A broad cross-route connects all three week portals.
- Thin teal edge conduits define walkable direction without becoming a giant arrow.
- The Number Gate remains centered beyond the week plaza.
- `COUNTING DISTRICT`, week labels, `THE NUMBER GATE`, and `NUMBER BRIDGE` use readable English signage.
- Quick Start remains permanently available in the existing HUD.

## Skyline And Tower Vista

- Distant city buildings are instanced boxes with low-cost amber window panels.
- Building count changes by art quality tier.
- Skyline structures sit at or beyond the navigation edge and require no detailed collision.
- The Tower is a separate warm, tapered landmark at the far right horizon.
- Number Bridge direction is established on the left, leaving geographic continuity for Phase 3D-2B.

## Props

Initial reusable library:

- octagonal counting pylon;
- diamond energy node;
- path conduit;
- geometric plaza module;
- framed world sign;
- instanced skyline tower;
- amber window panel;
- shared week portal;
- distant Tower silhouette.

Props stay outside the primary walking route. Realmies and NPCs are not populated in this phase.

## Collision

- Existing ground and world-bound movement remain unchanged.
- Primary routes are flat and require no jumping.
- Distant skyline and Tower assets remain outside the playable boundary.
- Decorative pylons are placed off the central route.
- The Number Gate is a visual landmark behind the current activity zone and does not block a required destination.
- Future hand-modelled assets must provide simplified box/capsule collision meshes named `COL_*`; visual meshes must not be used as collision geometry.

## Quality Tiers

Quality can be reviewed with `?quality=low`, `?quality=medium`, or `?quality=high`.

| Tier | Skyline instances | Props | Effects |
| --- | ---: | --- | --- |
| LOW | 12 | two counting pylons | no optional particle layer |
| MEDIUM | 20 | four counting pylons | standard lighting/fog |
| HIGH | 28 | four counting pylons | denser skyline; reserved for future restrained detail |

The same paths, signs, portals, state language, and landmark composition remain in every tier.

## Performance Budgets

- Initial Counting District external art assets: 0 bytes in this procedural checkpoint.
- Initial 3D route target after bundling: 3-8 MB compressed, measured independently from repository package size.
- Visible triangles target: below 25,000 on LOW, below 45,000 on MEDIUM, below 70,000 on HIGH.
- Draw-call target: below 90 on LOW, below 120 on MEDIUM, below 150 on HIGH.
- Texture memory target: below 32 MB on LOW, below 64 MB on MEDIUM, below 96 MB on HIGH.
- Minimum target: 30 FPS Chromebook/iPad; 60 FPS stronger devices.
- Future texture rules: tiling 512-1024 maps, one trim sheet per district, selective hero maps only, KTX2/Basis where supported.

## Asset Pipeline

### Code / Procedural

- plaza and paths;
- energy conduits;
- shared week portal and state marks;
- counting pylons;
- signs;
- low-detail skyline;
- temporary Number Gate composition;
- temporary Tower vista;
- fog and lighting.

### Hand-modelled GLB Candidates

- final Number Gate hero asset;
- final universal Tower exterior;
- district hero buildings;
- high-quality bridge connection;
- final student avatar;
- high-value close props after environment approval.

### GLB Handoff Rules

- GLB/GLTF 2.0, metres, Y-up, +Z forward.
- Origin at ground centre for architecture; hinge/interaction origin documented for moving parts.
- Names: `NN_CD_<Asset>_LOD0`, `LOD1`, `LOD2`; collision `COL_<Asset>`; anchors `ANCHOR_<Purpose>`.
- Reuse canonical material slots and avoid embedded duplicate materials.
- Apply transforms before export.
- Include no lights or cameras unless explicitly requested.
- Draco/Meshopt and KTX2 decisions happen in the web optimisation pass.

## Sound And Spawn Anchors

Reserved future anchors:

- district ambient loop;
- Number Gate hum;
- week portal activation;
- current mission conduit pulse;
- Tower ambience;
- future Realmie/NPC positions outside walk paths.

No sound or NPC behaviour is implemented in Phase 3D-2A.

## Approval Gate

Counting District must be reviewed from the actual gameplay camera for palette, architecture, scale, glow, signage, density, gate states, Number Gate, and Tower vista. Do not begin Number Bridge until the owner approves this visual DNA.
