# Personalisation art direction

Updated 24 September 2026 following the request for reference-led appearance,
consistent theme, believable size and a longer catalogue.

## Collection

63 free scenery items (39 existing + 24 additions), and 21 Australian-themed
purchasable rewards. Existing item IDs, prices, ownership and saved placement
coordinates remain unchanged. Free individual animals and garden pieces belong
to the everyday construction kit; the rewards are Australian landmarks,
wildlife habitats, neighbourhood places and outdoor experiences.

The visual direction is a crafted explorer world: weathered timber, warm
sandstone, cream painted joinery, muted eucalyptus greens, slate/galvanised roofs,
blue-green water, small brass accents. Original procedural models use physical
parts and silhouettes. Reference photographs are researched, not copied into
assets. This is cohesive stylised 3D, not a claim of photorealism.

## Reference research

Web and image searches covered the collection's object families and species.
The following sources guide recognisable features; they are not texture licences.

- [Queenslander character — Queensland Government QDesign](https://www.hpw.qld.gov.au/__data/assets/pdf_file/0022/4837/qdesignmanual.pdf):
  raised timber construction, deep verandahs, repeated posts, balustrades and stairs.
- [Woongarra — Brisbane Heritage](https://heritage.brisbane.qld.gov.au/heritage-places/182):
  verandah proportions and corrugated roofing.
- [Australian Museum mammal collection](https://australian.museum/learn/animals/mammals/),
  [platypus](https://australian.museum/learn/animals/mammals/platypus/),
  [emu](https://australian.museum/learn/animals/birds/emu/),
  [Australian birds](https://australian.museum/publications/birds-storybox/bird-species/),
  [cockatoo](https://australian.museum/learn/animals/birds/sulphur-crested-cockatoo/):
  body silhouettes, beaks, ears, feathers and distinguishing colours.
- [Bilby photographs — UniSA](https://giving.unisa.edu.au/news/saving-australias-native-animals-from-extinction/):
  long ears, narrow snout and long tail; distinguish from the free rabbit.
- [Blue heeler photographs — ABC](https://www.abc.net.au/news/2023-07-11/clancy-blue-heeler-found-a-week-after-coral-bay-wa-car-rollover/102588384):
  upright ears, longer legs, blue-grey coat and canine muzzle.
- [RHS birch](https://www.rhs.org.uk/plants/birch/how-to-grow-birch),
  [RHS lavender](https://www.rhs.org.uk/plants/lavender/growing-guide/),
  [National Arboretum species](https://www.nationalarboretum.act.gov.au/living-collections/step/list-of-species-in-step):
  different tree crowns, pale marked birch bark, branching gums and upright lavender spikes.
- [Outdoor structures — Bunnings](https://www.bunnings.com.au/products/garden/outdoor-structures),
  [gazebos](https://www.bunnings.com.au/products/outdoor-living/outdoor-shade/gazebos/gazebos),
  [garden makeover references](https://www.workshop.bunnings.com.au/discussion/344461/front-garden-make-over-improved-street-appeal):
  timber construction, raised beds, roof proportions, letterboxes and birdbaths.
- [Bodiam Castle — National Trust](https://www.nationaltrust.org.uk/visit/sussex/bodiam-castle/exploring-bodiam-castle):
  masonry courses, crenellations, round towers and arched gateways.
- [Surf-club architecture — WA Museum](https://visit.museum.wa.gov.au/greatsouthern/tuesday-curatorial-albany-surf-club),
  [Maroubra — Randwick Council](https://www.randwick.nsw.gov.au/planning-and-building/council-works-and-upgrades/major-projects/maroubra-surf-life-saving-club-redevelopment):
  viewing balconies, functional storage and red/yellow rescue accents.
- [Sydney Tower Eye](https://www.sydneytowereye.com.au/explore/explore/the-view/):
  slim shaft, golden observation crown, glazed bands and antenna.
- [Milk-bar archive — NSW State Records](https://www.flickr.com/photos/state-records-nsw/7463952454):
  shopfront glazing, signage and awnings.
- [Drive-in archive — Parramatta Heritage](https://historyandheritage.cityofparramatta.nsw.gov.au/blog/2019/04/02/vanished-parramatta-lost-urban-landmarks):
  roadside cinema character, screen and parked cars.
- [Outdoor play — Visit Melbourne](https://www.visitmelbourne.com/regions/great-ocean-road/places-to-stay/retreats/araluen-lutheran-camp):
  timber play structures, slides, swings and trampolines.
- [AFL preferred facilities guide](https://play.afl/sites/default/files/2023-11/AFL_PFG-2024_DIGITAL%20%281%29.pdf):
  oval layout and paired taller goal posts/lower behind posts.
- Outback homestead image searches informed corrugated roofing, verandahs,
  rainwater tanks and a **vertical** windmill rotor.

## Scale and placement

One grid cell is 2 world metres; the existing avatar is about 2.2 m tall.
Every one of the 84 assets has an explicit target in
`lib/world3d/world-item-presentation.ts`. Small wildlife is slightly enlarged
for visibility. Landmarks/grounds use compressed game scale, not literal
full-size replicas. Furniture and garden objects use believable relative sizes.

`SizedWorldModel` measures actual geometry (including instances), uniformly
scales it, centres it in its footprint and grounds its lowest point. Reserved
width/depth are hard limits; saved worlds do not acquire new overlaps simply
because their art changed. Repeatable wall/fence pieces retain a 2 m span.
Sizing runs for the asset, not on every drawbridge animation or recolour.

## Paths and editing

Organic path geometry unions curved strokes into a continuous gravel surface.
It is still backed by the existing editable cell data: paint/erase, undo and
saved erased gaps remain functional. Other painted surfaces cut through the
path shoulders. Existing local-storage data is retained.

Category search ignores movement shortcuts while typing. Empty results are
announced. Moving the home and editing paths keep their existing behaviour.

## Review and checks

`/demo-review/world-art` offers every item, category comparison, individual
orbit views, a 2 m reference grid and an avatar-height marker. This review has
no inventory, purchase or saved-world mutations.

Run `npm run qa:world-scenery`, `npm run qa:central-world-home`,
`npm run qa:central-world3d`, `npm run qa:world3d-return`, targeted ESLint and
TypeScript. World art is local until separately deployed.

## Creative direction and collection expansion — 25 September 2026

Keep the tower as the recognisable magical/medieval centre. Students may mix every
collection freely; collection filters organise the catalogue, not placement zones.
Use natural timber, muted paint, sandstone, aged metal, soft foliage and consistent
human-scale proportions across both free pieces and rewards. Australian places,
wildlife and everyday life give the reward catalogue its identity.

The catalogue now has 89 free pieces and 33 Australian rewards (122 total).
The additional 26 free pieces complete Coastal Village, Bush Retreat, Country Town
and Castle Garden collections. Twelve rewards range from a 180 XP bush camp to
large harbour landmarks. These prices are design choices, not a promise about
time-to-unlock; validate them against actual classroom earning rates.

New landmark references:
- Sydney Opera House spherical roof construction: https://www.sydneyoperahouse.com/our-story/the-spherical-solution
- Harbour Bridge steel arch and sandstone pylons: https://apps.environment.nsw.gov.au/dpcheritageapp/ViewHeritageItemDetails.aspx?ID=5045703
- Brighton bathing boxes: https://www.visitvictoria.com/regions/melbourne/see-and-do/history-and-heritage/heritage-buildings/vv-brighton-bathing-boxes
- Cape Schanck lighthouse and keeper accommodation: https://www.parks.vic.gov.au/projects/statewide-projects/heritage-icons-projects/cape-schanck-lightstation---heritage-icons-project

New marketplace thumbnails are stylised SVG illustrations, not screenshots of
the 3D models. The world-art review route shows the actual geometry.
Release the additive migration 20260925090000_world_collection_expansion.sql
with the application changes for live purchases. No RPCs, grants, ownership or
existing catalogue rows are changed. The migration has not been applied live.

## Paintable water

Edit World → Ground → Water now offers Stream (one cell), River (three cells)
and Lake (rounded five-cell) brushes. Water shares the saved ground-tile format,
so existing water layouts upgrade automatically. A continuous curved surface
replaces separate blue boxes; ripples stop for prefers-reduced-motion.
Lakes fill fully, closed moats preserve islands, and stone/path paint cuts water.
Bridges and drawbridges retain their existing placement behaviour over water.
This is a decorative surface; it does not add swimming, excavation or fluid
simulation. Home/doorway checks apply independently to every brush cell.

The water tab in /demo-review/world-art contains river, lake and moat fixtures.
Geometry regression checks cover lake interiors, moat holes, erased gaps and
crossings. Browser visual review of this water pass remains pending because the
shared browser was being used for another preview.

## Builder connectivity and editing audit

Matching Fence, Picket Fence, Rope Fence, Garden Stone Wall and Castle Wall pieces
connect cardinally in neighbouring cells. The placed renderer derives straight,
corner, T and cross shapes from saved neighbours; moving or erasing a piece
recalculates those shapes. Different styles and diagonal-only pieces do not join.
Isolated pieces respect rotation. Gates and dedicated castle corners retain
their existing manually rotated models.

Roads now use the continuous union surface renderer, with asphalt and edging.
Paths, roads and water join within their own surface type; stone stays tiled.
Fast ground/boundary drags interpolate skipped cells into a cardinal route.
A drag records one undo snapshot. Free catalogue selections repeat; dropping a
moved item or owned reward ends placement. Cancel restores any held saved item.
New copies use UUIDs instead of a counter that resets on reload, preserving
previous saved copies. Persistence remains scoped to this browser and student.

Regression checks cover boundary topologies, rotation, style separation,
cardinal drag continuity, saved copy identity, rotation/colour persistence,
home access, collision, terrain and return navigation. TypeScript/lint checks
also run. Full end-to-end mouse and touch visual review remains pending:
native browser control stalled and another preview was active in Chrome.


## Scale correction — 25 September 2026

Following the owner’s screenshots, mature trees now target 14–18 m against the roughly 2.2 m avatar. Castle ramparts and corners target 26 m against the approximately 58 m Tower of Knowledge; gates target 28 m, turrets 32 m and keeps 34 m. Buildings, landmarks, plants, furniture, animals and all collection additions have revised individual heights.

The renderer previously capped broad models against their small legacy footprints. Placement and rendering now share expanded runtime footprints from the presentation catalogue, including items loaded from the live marketplace. Stored item keys, metadata, ownership and saved coordinates remain unchanged. No database migration is needed. Dense existing arrangements can overlap after enlargement and may need manual spacing; we do not relocate or delete student items automatically.

Connected boundaries keep a two-metre cell pitch. Their live renderer uses the same height targets as individual previews, and castle masonry is built at its taller height rather than simply stretching a small brick texture. Width-defined ground features and connectors apply their explicit vertical target independently. The inspection gallery spaces larger objects apart.

Validation: mature-tree proportion and footprint regression, wall/tower ratio, matching connector heights and grid pitch, all 122 sizing entries, home movement/entry protection and scenery geometry suites. Browser inspection of Silver Birch and Castle Wall against the avatar reference.


## Item-by-item footprint correction

The follow-up [122-item measured audit](item-scale-audit.md) supersedes the height-ratio footprint multiplier above. Every item now has explicit land dimensions; sites use width-led uniform sizing. The oval, drive-in, horse paddock and kangaroo sanctuary have enlarged site geometry with separately sized occupants/structures. The review page can measure all actual models sequentially and compare unlike objects under one camera. See the audit for per-item results and game-scale conventions.
