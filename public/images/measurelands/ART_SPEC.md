# Measurelands Art Spec

This file is the production spec for all AI-generated Measurelands visuals.

Use it when generating or replacing any Measurelands asset so the realm stays
cohesive across:

- lessons
- weekly quizzes
- completion screens
- program cards

The goal is simple:

- premium-looking visuals
- consistent style
- non-reader friendly scenes
- drop-in replacement through existing `imageSrc` paths

## Core Principle

Measurelands art is part of the teaching system.

That means assets must be:

- visually clear for Foundation students
- consistent enough that one week does not look like a different product
- simple enough that the image supports the maths concept instead of distracting
- technically predictable so existing code can keep using the same filenames

## Visual Direction

Preferred style:

- soft 3D educational illustration
- child-friendly but not babyish
- polished, premium, modern
- bright and warm, not neon
- clean subject separation
- gentle realism, not flat clip art
- slightly storybook / toy-world feel

Reference feel:

- premium early years learning app
- soft rendered objects and scenes
- rounded forms
- warm shadows
- inviting lighting

Avoid:

- emoji look
- hard vector clip-art look
- stock-photo realism
- hyper-detailed photorealism
- harsh outlines
- dark moody lighting
- inconsistent perspective across sets
- text baked into the image

## Technical Output Rules

All generated assets must follow these rules.

Format:

- transparent PNG preferred for rendered assets
- SVG only if intentionally hand-built and approved as a placeholder

Background:

- transparent only
- no green screen
- no white background
- no box/background card baked into the asset

Canvas:

- consistent export size per asset family
- centered subject
- generous padding
- subject should not touch edges

Shadows:

- subtle contact shadow only
- keep shadow soft and consistent
- no dramatic cast shadows

Text:

- no labels
- no captions
- no day names
- no UI chrome inside the image

## Global Rendering Rules

These should stay stable across all Measurelands assets.

Camera:

- slight front or 3/4 view
- child-readable
- avoid extreme top-down or side-on perspective unless required

Lighting:

- soft warm studio lighting
- mild highlights
- gentle ambient fill

Colour:

- natural, cheerful colours
- readable on warm cream UI backgrounds
- avoid oversaturated neon tones

Edges:

- clean silhouette
- no messy cutout edges
- no fuzzy alpha fringe

## Realm-Specific Teaching Rules

The art is not decorative only. It must help children answer.

### 1. Length / Height

Week 1 assets should make size differences readable at a glance.

- shape differences should be obvious
- if ordering is taught, the image must support the comparison
- do not use visually confusing pairs with nearly equal size

### 2. Mass

Week 2 assets should feel familiar and intuitively heavy/light.

- rely on common real-world knowledge
- avoid fantasy or unfamiliar objects
- avoid pairs that need special knowledge to judge

### 3. Capacity

Week 3 has two different visual needs.

Compare / order:

- empty containers only
- no water
- no gauges
- the container form itself should suggest relative capacity

Fill-state:

- no container art needed if the lesson intentionally uses a shared gauge
- fill level is the teaching signal

### 4. Duration

Week 4 should use scene illustrations, not standalone objects.

- each activity should be readable by a non-reader
- scene must communicate the action
- text is support only

Examples:

- washing hands
- brushing teeth
- watching a movie
- sleeping

### 5. Days of the Week

Pretty scenes alone are not enough for non-readers.

The art may be premium, but the system still needs stable non-reader cues:

- color cue
- position cue
- route/order cue

Do not assume a scene like `school` automatically teaches `Monday`.

## Asset Family Rules

## Capacity Containers

Folder:

- `public/images/measurelands/containers/`

Current live filenames:

- `cup.png`
- `mug.png`
- `bottle.png`
- `jug.png`
- `kettle.png`
- `watering-can.png`
- `bucket.png`
- `fish-tank.png`
- `bathtub.png`

Generation rules:

- empty containers only
- centered subject
- similar baseline and framing
- same style across the full set
- visual capacity should be readable from shape and scale

Do not:

- include water
- include labels
- include backgrounds
- mix flat art and 3D renders in the same live folder

## Duration Scenes

Folder:

- `public/images/measurelands/duration/`

Live filenames:

- `wash-hands.svg`
- `shoes.svg`
- `brush-teeth.svg`
- `drawing.svg`
- `reading.svg`
- `lunch.svg`
- `sandcastle.svg`
- `travel.svg`
- `movie.svg`
- `sleeping.svg`

Premium replacement target:

- same filenames
- same action meanings
- transparent background
- one consistent scene style

Scene rules:

- one primary action per image
- no busy environment competing with the action
- child should identify the activity before reading

## Days Scenes

Folder:

- `public/images/measurelands/days/`

## Story Sequence Scenes

Folder:

- `public/images/measurelands/story-3d/`

Purpose:

- Year 1 Week 8 Lesson 3 uses short visual process stories
- the visible stage is the full teaching signal
- a child should be able to order the steps from the image alone

Story rules:

- each story uses the same character / props / color family across all steps
- only the stage of the process changes
- one clear action per image
- no arrows
- no text
- no extra characters unless the process genuinely needs one child actor

Current target filenames:

- `story-seed-1.png`
- `story-seed-2.png`
- `story-seed-3.png`
- `story-seed-4.png`
- `story-butterfly-1.png`
- `story-butterfly-2.png`
- `story-butterfly-3.png`
- `story-butterfly-4.png`
- `story-toast-1.png`
- `story-toast-2.png`
- `story-toast-3.png`
- `story-toast-4.png`
- `story-teeth-1.png`
- `story-teeth-2.png`
- `story-teeth-3.png`
- `story-teeth-4.png`

Generation rules:

- transparent PNG
- centered subject
- generous padding
- subtle contact shadow only
- slight front or 3/4 view
- every step must still read clearly at lesson-card size

Do not:

- change costume / props randomly between steps
- use decorative backgrounds
- make two consecutive steps look nearly identical
- hide the stage change in tiny details

Live filenames:

- `monday.svg`
- `tuesday.svg`
- `wednesday.svg`
- `thursday.svg`
- `friday.svg`
- `saturday.svg`
- `sunday.svg`

Premium replacement target:

- same filenames
- same transparent background rule
- scene must still work with external day cues in UI

## Naming and Replacement Rules

Use the existing filenames unless there is an intentional migration.

That is how art swaps without code changes.

Examples:

- `/images/measurelands/containers/bucket.png`
- `/images/measurelands/duration/movie.svg`
- `/images/measurelands/days/monday.svg`

If exploring an alternate style:

- never overwrite the live set in place
- create a sibling folder such as:
  - `containers-3d/`
  - `duration-3d/`
  - `days-3d/`

Only switch the live paths after approval.

## Prompt Template

Use this as the base prompt for AI generation:

`Create a premium children's educational illustration in a soft 3D rendered style, with warm natural lighting, clean silhouette, transparent background, centered subject, gentle contact shadow, and no text. The image should feel consistent with a high-quality early-years learning app.`

Then append the asset-specific instruction.

Examples:

- `A small empty cup, clearly readable, child-friendly, slight 3/4 front view.`
- `A child washing hands at a sink, action clearly readable, simple scene, transparent background.`
- `A child watching a movie, seated and clearly engaged with a screen, action obvious, simple scene, transparent background.`

## Negative Prompt Rules

When your generation system supports negatives, avoid:

- text
- watermark
- logo
- border
- background rectangle
- green screen
- photo backdrop
- cluttered scene
- multiple unrelated actions
- dark horror lighting
- hyperreal skin textures
- extra characters unless needed

## QA Checklist

Before replacing live assets, check:

- transparent background is clean
- silhouette reads clearly at lesson-card size
- style matches the rest of Measurelands
- no text baked in
- no stray props that change the meaning
- non-reader can identify the concept visually
- filenames match the current code paths

## Asset Manifest

This is the current priority replacement list.

### Priority 1 — Capacity Containers

- `public/images/measurelands/containers/cup.png`
- `public/images/measurelands/containers/mug.png`
- `public/images/measurelands/containers/bottle.png`
- `public/images/measurelands/containers/jug.png`
- `public/images/measurelands/containers/kettle.png`
- `public/images/measurelands/containers/watering-can.png`
- `public/images/measurelands/containers/bucket.png`
- `public/images/measurelands/containers/fish-tank.png`
- `public/images/measurelands/containers/bathtub.png`

### Priority 2 — Duration Scenes

- `public/images/measurelands/duration/wash-hands.svg`
- `public/images/measurelands/duration/shoes.svg`
- `public/images/measurelands/duration/brush-teeth.svg`
- `public/images/measurelands/duration/drawing.svg`
- `public/images/measurelands/duration/reading.svg`
- `public/images/measurelands/duration/lunch.svg`
- `public/images/measurelands/duration/sandcastle.svg`
- `public/images/measurelands/duration/travel.svg`
- `public/images/measurelands/duration/movie.svg`
- `public/images/measurelands/duration/sleeping.svg`

### Priority 3 — Days of the Week

- `public/images/measurelands/days/monday.svg`
- `public/images/measurelands/days/tuesday.svg`
- `public/images/measurelands/days/wednesday.svg`
- `public/images/measurelands/days/thursday.svg`
- `public/images/measurelands/days/friday.svg`
- `public/images/measurelands/days/saturday.svg`
- `public/images/measurelands/days/sunday.svg`

### Priority 7 — Calendar Cards (Week 7, Calendar Keep) — NEEDS 3D ART

Currently flat-SVG placeholders; generate premium 3D to match the realm and
drop into `public/images/measurelands/calendar-3d/` (then the registry base in
`data/activities/prepMeasurelands/week7Calendar.ts` flips from `/calendar` to
`/calendar-3d`, one line).

Each is a calendar page/card, same soft-3D style, transparent PNG, no baked
text. The cue must carry the meaning for a non-reader:

- `calendar-3d/today.png` — a calendar page with a big, warm **gold star** and a
  soft glow. Today is the bright, special, "now" card.
- `calendar-3d/yesterday.png` — a calendar page that is **faded / muted** with a
  **backward (anticlockwise) arrow**. The day that already happened (the past).
- `calendar-3d/tomorrow.png` — a calendar page, bright and fresh, with a
  **forward (clockwise) arrow**. The day that comes next (the future).

Keep the three unmistakably distinct: today = star + glow, yesterday = faded +
back arrow, tomorrow = forward arrow. No day names or numbers baked in.

## Recommended Rollout

1. Replace the capacity container set first
2. Replace duration scenes second
3. Replace days scenes third
4. QA each family in the actual lessons and weekly quizzes before moving on

Do not generate one random week in a new style while older weeks remain in a different look.

The realm should feel designed, not assembled.
