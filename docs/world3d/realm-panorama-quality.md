# Realm panorama rendering review

Local review: `/demo-review/realm-panoramas`.

The existing six realm identities, source images, level assignments, landmark
centres, panorama dimensions, orientation and gameplay objects are retained.

## Rendering changes

- Measurelands, Starpath and Chance Hollow now sample front and rear artwork on
  one opaque cylinder. There are no overlapping transparent background meshes.
- Complete single-image backgrounds in Number Nexus, Statistica and Pattern Peaks
  use the same renderer, including the repeated Number Nexus wrap.
- Joins blend in a narrow band with complementary weights. The outer 2.5% of each
  source is reserved for this transition; central landmarks stay in place.
- Source textures remain at their original resolution, without a canvas copy.
  Trilinear mipmaps and device-supported anisotropy reduce shimmer while turning.
- The sky transition is confined to the upper 18% of the image. The circular mesh
  has 192 segments to reduce faceting.
- Backgrounds render before scene geometry without writing depth. Foreground
  paths, gates, props and progression are unchanged.

## Verification

TypeScript, targeted ESLint, the world art audit, and the Measurelands, Starpath
and Chance Hollow world audits pass. The local review route returns HTTP 200.
Number Nexus and Measurelands were visually observed in Chrome. Full visual
sign-off across all levels and off-centre views remains outstanding.

## Artwork limitations

These are mostly perspective illustrations, not authored panoramic projections.
A narrow join can eliminate a hard pixel boundary but cannot make unrelated
paths, slopes or buildings physically connect. Number Nexus also retains its
existing repeated landmarks. This change is a renderer improvement, not new
higher-resolution artwork or a completed geographic continuity pass.

For the next artwork pass, use each level's existing source as a locked landmark
reference. Author matched left/right boundaries with a shared horizon, light
source and terrain height; reserve the joins for open sky and landscape rather
than structures. Inspect the front, rear, both joins and wrap from the centre
and playable perimeter before replacing source art. Do not use wider blending
to hide mismatched geometry. Keep source masters separate from app exports.

## Number Nexus Levels 5 and 6 clarity follow-up

Both existing sources are 3840 × 2160. Their `crispPanorama` theme flag now
selects native linear sampling through the Number Nexus wrapper and the review
page; other levels retain their prior filtering. A bounded shadow-lift curve
with strength 0.4 makes the dark architecture easier to distinguish while
preserving black, white and cyan highlights. Source files, landmarks and joins
are unchanged. Both updated levels were visually checked in Chrome; targeted
ESLint and the world art audit pass.

## Measurelands Level 3 artwork follow-up

The former 3840 × 1920 runtime image carried detail from a 1774 × 887 original.
The four new native 887 × 1774 sections provide a combined 3548 × 1774 detail
budget: twice the linear density, four times the source pixels, without
artificial enlargement. WebP transfers total 2,349,508 bytes, below the former
2,429,380-byte JPEG. One opaque shader samples all four textures, with native
linear filtering. Other realms retain their existing sampling paths.

The village, clock tower, armillary, viaduct, garden measurement plots, surveying
tripods, sheds and construction area remain in their original regions. Generated
fine details are reconstructed, not an exact restoration of historical pixels.
The source masters and final prompts are in
`output/imagegen/measurelands-level3/`; app exports are in
`public/images/measurelands-level3-detail/`.

The review page offers **Compare old background** for this level. Chrome checks
covered the front village and the joins near 0°, 90°, 180° and 270°. The original
rear landscape still has a geographic discontinuity where its two source ends
meet; the renderer blends the colour boundary but does not reconstruct that
terrain. This follow-up addresses the reported blur, not that separate layout
limitation. Both source art and former runtime image remain available.

## Starpath Levels 4–6 artwork follow-up

Levels 4 and 5 share the restored `y45` set; Level 6 uses the restored `y6` set.
Each set comprises four native 1254 × 1254 tiles: front left/right and rear
left/right. These replace the hazy source imagery in the 3D background only.
The improvement is reconstructed architectural definition and reduced excess
haze, not an increase in pixels over the previous 2752 × 1376 JPEG halves.
The telescope observatories, rear instruments, floating platforms, crystal
railings, constellation floors and celestial palette remain recognisable.
Small generated details are not pixel-identical to the original illustrations.

Quarter order is rear-right, front-left, front-right, rear-left. This preserves
the original paired backdrop orientation with no added rotation. Panorama height,
position, floor art and gameplay objects remain unchanged. One opaque ring
renders the tiles with native linear sampling and narrow joins. Independent
illustrations still have small geometric differences at some floor/sky joins;
this is not an exact continuous geometric reconstruction of the environment.

Runtime assets: `public/images/starpath-detail/` (1,659,472 bytes for `y45`,
1,814,126 bytes for `y6`). PNG masters, generation manifest and exact final prompt:
`output/imagegen/starpath-detail/`. Tool: built-in image generation.

The review page enables **Compare old background** for all three levels.
Browser checks covered Levels 4, 5 and 6, front observatories, rear instruments,
side transitions and an off-centre Level 6 view. TypeScript, targeted ESLint,
Starpath detail dimensions/transfer budget, Measurelands and world art audits
pass. Earlier panorama work was pushed as `ea9d0535`.
