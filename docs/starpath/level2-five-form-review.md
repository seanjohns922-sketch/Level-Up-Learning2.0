# Starpath Level 2: five redesigned review forms

## Scope and curriculum

Pre-Test, Post-Test, Start, Mid and End each contain 20 questions: 100 new version-5 review items. Protected route: `/demo-review/starpath-level2`. The usual Level 2 review buttons open these forms. Answers remain in page-local state; this release does not replace existing student banks, diagnostic placement, attempts or login/session RPCs.

Source: supplied `mathematics-curriculum-content-f-6-v9 (4).pdf`, page 25.

- AC9M2SP01: recognise, compare and classify shapes using side counts and the terms opposite, parallel, curved and straight.
- AC9M2SP02: locate positions in two-dimensional representations of familiar spaces and follow directions/pathways to move positions.

Reviewed the Level 2 lesson index, `l2-shapes.ts`, `star-maps.ts`, the existing curriculum audit and map/direction renderers. Reused the exact Level 2 polygon geometry through `l2ShapeInner`, the approved assessment shape renderer and existing explorer artwork. Familiar-place maps use recognisable book, building, tree, water, ball and flag symbols with labels or an explicit key. The map interaction does not teach grid references; row/column descriptions are accessibility/reviewer descriptions only.

Physical shape sorting, actual movement in familiar spaces and practical classroom observations complement these digital items. Not every curriculum elaboration is independently scored here. Difficulty labels indicate intended demand, not empirical calibration.

## Blueprint in every form

| Slot | Skill | Week |
|---|---|---|
| 1 | Classify shapes with curved edges | 1 |
| 2 | Count sides of a rotated pentagon or hexagon | 2 |
| 3 | Select all shapes with a given side count | 2 |
| 4 | Recognise four-sided shapes including irregular examples | 2 |
| 5 | Tap the side opposite a highlighted side | 3 |
| 6 | Tap the side parallel to a highlighted side | 3 |
| 7 | Select a shape with exactly one parallel pair | 3 |
| 8 | Identify a shared property of different quadrilaterals | 4 |
| 9 | Identify an odd shape and explain its side-count difference | 4 |
| 10 | Classify by two parallel pairs and select a reason | 4 |
| 11 | Locate a place using a map key | 5 |
| 12 | Describe a place relative to another landmark | 5 |
| 13 | Locate a place satisfying two directly aligned position clues | 6 |
| 14 | Follow four ordered map movements | 6 |
| 15 | Follow a two-part instruction from a named landmark | 6 |
| 16 | Record a pictured six-move pathway | 7 |
| 17 | Select directions connecting named landmarks | 7 |
| 18 | Identify an incorrect instruction by comparing with a pathway | 7 |
| 19 | Give a route around a closed square | 7 |
| 20 | Visit a waypoint before the destination while avoiding a closure | 8 |

Ten items per descriptor. Contexts include school grounds, a riverside park, a campground, a sports centre and a community park. Form variation changes geometry/orientation, side counts, map orientation, landmark names, chosen places, direction sequences and incorrect step positions. Rotating/reflection of map geometry includes all directions and constraints. Names, symbols and positions stay consistent within each map.

## Interaction and scoring

Uses the approved compact Starpath layout, shared realm theme, 1–20 navigator, form tabs, read-aloud and direct Next behaviour. I don’t know records a skip and advances. There is no Done step. The final question uses Submit for Post-Test and Finish for other forms. Reviewer navigation can visit unanswered questions. Responses restore across question and form changes; correctness remains behind review details.

Edges can be selected directly on the diagram or via large Side A/B/C/D buttons. Direct SVG targets also support Enter/Space. The reference side is not selectable. Selection highlighting is separate from the teal reference line.

Map pathways accept all valid alternatives where the question allows them, reject off-map movement or closed squares, and require the waypoint before the first arrival at the destination. Recording a pictured path requires its actual order. Undo and Clear only edit the answer; they do not expose correctness. Empty answers never score as correct.

`qa:starpath-level2-five-forms` is part of prebuild. It independently counts polygon vertices and parallel edge pairs, checks edge relationships, checks map key uniqueness and route destinations, enumerates alternative routes and rejects constraint violations, and verifies all 100 items and matched form structure.

## Verification

All 100 items were answered in Chrome with five 20/20 review totals. Checked 1366px desktop and 390px mobile widths, no horizontal overflow or runtime errors, protected anonymous access, direct Next/Back, skip advancement, keyboard edge selection, Undo/Clear and form response isolation. Reviewed screenshots of side counting, parallel edges, multi-select reasoning, map keys and route planning. Larger reasoning tasks require a short desktop scroll; mobile tasks stack vertically. TypeScript and targeted ESLint passed.
