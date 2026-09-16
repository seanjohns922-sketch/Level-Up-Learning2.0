# Level 5 Measurelands: five matched assessment forms

Status: manual review only. No student bank or diagnostic release is included.

Source: supplied Australian Curriculum v9 F–6 Mathematics content document, Year 5 Measurement, page 54, AC9M5M01–04. Existing `year5MeasurelandsIndependentBanks` and the Year 5 lesson common files for precision, area, time, angles and the capstone were inspected before authoring.

Each form has 20 questions with aligned skills, response modes and intended end-of-level demand: five easy, ten moderate, five challenging. Examples differ across Pre, Post, Start, Mid and End. Difficulty is an author judgement, not empirical calibration.

## Coverage and improvements

- Metric units: precision, mixed length/capacity and mixed-mass comparisons.
- Practical perimeter and area: gate allowance, irregular boundaries, grid-based irregular spaces, same-perimeter/different-area comparisons and paving around a garden bed. Labels are outside the perimeter. Grids support reasoning without requiring the Year 6 rectangle formula.
- Time: 12-/24-hour conversion both ways, midnight and a practical timetable. Unlike Level 4, 24-hour time is explicit Year 5 content. Separate hour/minute inputs indicate which system is required; review answers use the matching notation.
- Angles: estimation, both protractor baselines, measurement/classification and genuine construction. The existing lesson protractor is reused with snapping, correct-answer feedback and the live numeric reading disabled. Pointer interaction and one-degree keyboard movement update the response; blank remains unanswered until the student moves the arm.

## Visual reuse

Reuse lesson `MeasurelandsProtractor`, `MeasurelandsAngle`, `Tiles`, and inspected plank, parcel and bottle artwork. Reuse the corrected Level 4 perimeter/area renderer. All mathematical information is covered by prompt/diagram/choice read-aloud; target readings are not narrated. Measurement styling, IDK, free review navigation and return-to-review follow the shared review shell and normal realm/level dropdown.

## Verification

The audit independently recomputes 100 answers, grid areas, boundary sums, gate allowance, unit comparisons and time conversions. It checks unique examples, aligned form metadata, valid/incorrect/blank/IDK scoring and absence of construction hints. All 100 visuals are rendered and representative diagrams inspected. TypeScript and the production build are required before publishing for review.

The authoring inventory records every item for manual review.
