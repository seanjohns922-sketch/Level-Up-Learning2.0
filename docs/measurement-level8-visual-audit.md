# Level 8 Measurement visual audit

Reviewed all 12 weeks, 36 lessons and 179 question forms, with 40 data sets per form (7160 checks). 169 forms have a diagram or structured table; 10 reviewed text-only forms cover numerical conversions, notation or conceptual questions. All 36 teaching examples have visual support.

Each diagram is authored alongside its question quantities. Unknown dimensions are not supplied in labels or read-aloud. Geometry questions use diagrams; tables support rate comparisons and journey stages. Grid-count pictures rearrange the stated full/partial cells for counting rather than inventing a measured outline.

| Week | Lesson | Topic | Visual forms | Teaching visual |
| --- | --- | --- | --- | --- |
| 1 | 1 | Find missing boundary lengths | 5/5 | Yes |
| 1 | 2 | Find the perimeter of a composite shape | 5/5 | Yes |
| 1 | 3 | Split a shape to calculate its area | 5/5 | Yes |
| 2 | 1 | Estimate area using a grid | 4/5 | Yes |
| 2 | 2 | Improve an irregular-area estimate | 3/5 | Yes |
| 2 | 3 | Choose perimeter or area for a practical task | 4/5 | Yes |
| 3 | 1 | Connect cubic units with litres | 4/5 | Yes |
| 3 | 2 | Calculate the volume of a right prism | 5/5 | Yes |
| 3 | 3 | Find capacity and compare containers | 5/5 | Yes |
| 4 | 1 | Find a missing prism dimension | 5/5 | Yes |
| 4 | 2 | Work out how many boxes fit | 5/5 | Yes |
| 4 | 3 | Model filling a tank | 5/5 | Yes |
| 5 | 1 | Connect radius and diameter | 5/5 | Yes |
| 5 | 2 | Calculate circumference | 5/5 | Yes |
| 5 | 3 | Calculate the area of a circle | 5/5 | Yes |
| 6 | 1 | Find a radius from area or circumference | 5/5 | Yes |
| 6 | 2 | Measure semicircles and rings | 5/5 | Yes |
| 6 | 3 | Choose a formula for a circular design | 5/5 | Yes |
| 7 | 1 | Identify the hypotenuse | 4/5 | Yes |
| 7 | 2 | Explain the squares on a right triangle | 4/5 | Yes |
| 7 | 3 | Calculate the hypotenuse | 5/5 | Yes |
| 8 | 1 | Find a shorter side | 5/5 | Yes |
| 8 | 2 | Calculate a ladder length or diagonal | 5/5 | Yes |
| 8 | 3 | Recognise and check Pythagorean triples | 4/5 | Yes |
| 9 | 1 | Convert times using supplied UTC offsets | 4/5 | Yes |
| 9 | 2 | Calculate travel time across zones | 4/4 | Yes |
| 9 | 3 | Plan a meeting across dates and time zones | 5/5 | Yes |
| 10 | 1 | Read a rate and its units | 5/5 | Yes |
| 10 | 2 | Calculate speed, distance and time | 4/5 | Yes |
| 10 | 3 | Compare flow and consumption rates | 5/5 | Yes |
| 11 | 1 | Use a map scale | 5/5 | Yes |
| 11 | 2 | Scale a mixture or material plan | 5/5 | Yes |
| 11 | 3 | Build and check a ratio or rate model | 5/5 | Yes |
| 12 | 1 | Plan a shape or container design | 5/5 | Yes |
| 12 | 2 | Combine duration and rate calculations | 5/5 | Yes |
| 12 | 3 | Review a practical measurement model | 5/5 | Yes |

Regression check: run `NODE_ENV=test node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/measurement8-visuals-test.mjs --report`. It also writes a local HTML gallery to /tmp/measurement8-visual-review.html.

This records local source and render checks, not a production deployment.

Validation completed: 7,160 direct question-form checks; all 36 teaching examples; the broader Level 8 lesson and teaching-guide suites; 17/17 critical checks; lint:qa; affected-file lint; TypeScript; and the full production build including its release checks. SVG contact sheets were visually inspected. Live browser/mobile interaction and audible speech were not verified because no browser surface was available.

Also corrected whole-cube packing when the spare length fits additional cubes, constrained trapezium side lengths to valid geometry, normalised small-prism display scale without changing measurement labels, and advanced the lesson content revision so cached questions refresh after deployment.
