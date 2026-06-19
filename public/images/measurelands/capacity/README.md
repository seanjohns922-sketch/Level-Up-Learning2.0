# Measurelands — Capacity container images

Drop the Week 3 capacity container art in this folder. The lesson renderer
(`MeasurelandsCompareTaskCard`) reads an optional `imageSrc` on each
`measurementCompare` object and shows the image instead of the emoji `icon`
(the emoji stays as the automatic fallback until every image exists).

## File format
- **WebP**, with a real **transparent alpha background** (no green screen, no
  white box). The cards sit on a cream/gold surface — any background will show.
- **Square canvas** (e.g. 512x512 source).
- **Target under 100 KB each.** A lesson loads ~10 objects, so keep them light.
- Filename = the container `id` (kebab-case), e.g. `bucket.webp`.

## CRITICAL: do NOT pre-scale by capacity
The renderer scales each image box by the object's `compareValue`, so a
bigger-capacity container is automatically drawn larger. Therefore:
- Draw **every** object at a **consistent footprint** — the object fills a
  similar proportion of its canvas, with the **same padding** and sitting on a
  **common baseline** (bottom-aligned).
- Do **not** draw the cup tiny and the bathtub huge on the same canvas — that
  would double-scale (the code scales again) and the cup would vanish.
- Keep real proportions (a watering can is wide, a bottle is tall) — just keep
  the overall footprint/padding consistent across the set.

## Consistency
- One art style across the whole set (same line weight, palette, lighting,
  perspective). The Week 3 render style from the preview is good — keep it.
- Same soft drop shadow baked into all, or none. Do not mix.

## The Week 3 set (filename -> container, capacity)
Capacity is relative ordering only; the renderer uses it for sizing.

| filename            | container      | capacity |
|---------------------|----------------|----------|
| `cup.webp`          | Cup            | 1        |
| `mug.webp`          | Mug            | 2        |
| `bottle.webp`       | Bottle         | 3        |
| `lunchbox.webp`     | Lunchbox       | 4        |
| `jug.webp`          | Jug            | 5        |
| `kettle.webp`       | Kettle         | 6        |
| `watering-can.webp` | Watering Can   | 7        |
| `bucket.webp`       | Bucket         | 8        |
| `fish-tank.webp`    | Fish Tank      | 9        |
| `bathtub.webp`      | Bathtub        | 10       |

## Wiring (done by the renderer side)
Lesson data sets, per object:
`imageSrc: "/images/measurelands/capacity/bucket.webp"`
`alt` text comes from the existing `label`. Fill-state bins keep their
mini-container glyphs (level, not identity) and do not need images.
