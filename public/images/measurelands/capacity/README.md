# Measurelands — Capacity container images

See also:

- `public/images/measurelands/ART_SPEC.md`

That file is the top-level production spec for all Measurelands visuals and the
source of truth for style, naming, QA, and replacement rules.

## Canonical live set
The shipped Week 3 capacity art lives in:

- `public/images/measurelands/containers/`

That flat container set is the **current canonical set** for live Measurelands
Week 3 lessons and quizzes.

The Week 3 lesson data is wired through:

- `data/activities/prepMeasurelands/week3Containers.ts`

using paths like:

- `imageSrc: "/images/measurelands/containers/bucket.png"`

## Important: do not overwrite the live set in place
If you are experimenting with a different style, do **not** replace files in
`containers/` directly.

Use a separate folder instead, for example:

- `public/images/measurelands/containers-3d/`

Then switch the registry/data source intentionally in one place if the new set
is approved.

This avoids silent regressions where a sync, branch merge, or asset drop
changes the live Week 3 art without anyone noticing.

## Current Week 3 set (filename -> container, capacity)

| filename              | container      | capacity |
|-----------------------|----------------|----------|
| `cup.png`             | Cup            | 1        |
| `mug.png`             | Mug            | 2        |
| `bottle.png`          | Bottle         | 3        |
| `lunchbox.png`        | Lunchbox       | 4        |
| `jug.png`             | Jug            | 5        |
| `kettle.png`          | Kettle         | 6        |
| `watering-can.png`    | Watering Can   | 7        |
| `bucket.png`          | Bucket         | 8        |
| `fish-tank.png`       | Fish Tank      | 9        |
| `bathtub.png`         | Bathtub        | 10       |

## Asset guidance
- Transparent background only.
- Keep one consistent art style per set.
- Keep all objects on a consistent canvas footprint and baseline.
- Do not rely on raw image dimensions to teach capacity ordering.

For Week 3, the lesson logic compares **familiar real-world objects**, not
whatever happened to be rendered bigger on the canvas.
