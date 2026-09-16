# Level 5 Measurelands: five matched assessment forms

Status: approved for student release. Frozen v4 forms serve new pre/post attempts and newly pinned diagnostic cycles; existing v3 attempts and cycles remain unchanged.

Source: supplied Australian Curriculum v9 F–6 Mathematics content document, Year 5 Measurement, page 54, AC9M5M01–04. Existing `year5MeasurelandsIndependentBanks` and the Year 5 lesson common files for precision, area, time, angles and the capstone were inspected before authoring.

Each form has 20 questions with aligned skills, response modes and intended end-of-level demand: five easy, ten moderate, five challenging. Examples differ across Pre, Post, Start, Mid and End. Difficulty is an author judgement, not empirical calibration.

## Coverage and improvements

- Metric units: two millimetre contexts (screw length and coin thickness), two centimetre contexts (pencil length and book width), one metre context (classroom length), mixed length/capacity and mixed-mass comparisons. Q1 asks for the most suitable everyday unit, rather than implying only millimetres can be precise.
- Practical perimeter and area: gate allowance, irregular boundaries, length × width for rectangular floors, dimensioned L-shaped floors, combined areas of two rectangular gardens and paving around a garden bed. Following manual feedback, Q6, Q12 and Q16 require calculation rather than tile counting. Dimensions are outside the shapes.
- Time: 12-/24-hour conversion both ways, midnight and a practical timetable. Unlike Level 4, 24-hour time is explicit Year 5 content. Separate hour/minute inputs indicate which system is required; review answers use the matching notation.
- Angles: estimation, both protractor baselines, measurement/classification and genuine construction. The existing lesson protractor is reused with snapping, correct-answer feedback and the live numeric reading disabled. Pointer interaction and one-degree keyboard movement update the response; blank remains unanswered until the student moves the arm.

## Visual reuse

Reuse lesson `MeasurelandsProtractor`, `MeasurelandsAngle`, and inspected pencil, book, classroom, plank, parcel and bottle artwork. Library and train scenes replace generic icons. The shared protractor handle sits inside the numbered scales; a thin ray reaches the degree marks and scale text remains legible above it. Reuse the corrected Level 4 perimeter/area renderer. All mathematical information is covered by prompt/diagram/choice read-aloud; target readings are not narrated. Measurement styling, IDK, free review navigation and return-to-review follow the shared review shell and normal realm/level dropdown.

## Verification

The audit independently recomputes 100 answers, grid areas, boundary sums, gate allowance, unit comparisons and time conversions. It checks unique examples, aligned form metadata, valid/incorrect/blank/IDK scoring and absence of construction hints. All 100 visuals are rendered and representative diagrams inspected. TypeScript and the production build are required before publishing for review.

The authoring inventory records every item for manual review.
