# Level 4 Measurelands: five matched forms

Status: manual review, not a replacement of student assessment banks.

Source: supplied Australian Curriculum v9 F–6 Mathematics content document, Year 4 Measurement, pages 43–44 (AC9M4M01–04). Existing Year 4 independent pre/post banks and weekly lesson components were inspected before authoring.

All five forms have 20 questions in the same skill order, with the same response format and intended end-of-Year-4 demand. Examples vary. Six accessible, nine moderate and five challenging items per form. These are author judgements, not empirical calibration.

## Changes from existing banks

- Retain partial-unit ruler, mass and capacity readings; add an explicit thermometer reading.
- Perimeter diagrams close correctly and display every side length. Area uses equal square units, including irregular shapes with six half squares.
- Time conversion, elapsed time and finishing time retain progressively increasing demand. Finish-time entry uses separate hour/minute boxes and AM/PM rather than requiring four-digit 24-hour notation.
- Replace numerical degree subtraction with reflex-angle recognition. Purple shading identifies the assessed opening; unequal arm lengths test the size of the opening rather than the arms.
- Short prompts, read-aloud diagrams and a nearby answer-choice voice button reduce reading demand.

## Lesson reuse and mathematical accuracy

Reuse `RulerWithObject` with its precise pencil and millimetre ticks, `MeasurelandsScale`, `MeasurelandsJug`, `MeasurelandsThermometer`, and the existing lesson `Tiles` renderer (export only; lesson behaviour unchanged). Perimeter polygons use dimensions directly. Angles use a mathematically calculated sector, including the larger reflex sector. All perimeter dimensions sit outside their edges. Mass scales use the lesson book artwork. Review time answers display in the same AM/PM notation as the answer widget. Scale narration reads labels without disclosing unlabelled readings. Instrument answer-bearing lesson aria labels are hidden within a descriptive assessment image wrapper.

Measurement theme, IDK, free review navigation, form switching and exit-to-review use the shared assessment review shell. Review is reached through the normal realm and level dropdown.

## Validation

`qa:year4-measurement-five-forms` checks 100 answers, exact marking and rejection of IDK/blank/wrong responses, aligned skill/difficulty/format, independent perimeter edge sums, area with half squares, time arithmetic and hour/minute/AM-PM conversion including noon and invalid partial input. All 100 visuals are server-rendered for invalid geometry. Selected diagrams receive hidden local screenshot checks. TypeScript and the production build are required before handover.

The generated authoring inventory includes every prompt, answer, descriptor and visual parameter for manual review.

Q19 review revision: irregular grid outlines replace the two-row rectangle. Six half squares and whole squares must be combined without a strategy hint; all forms retain the same task structure and intended challenge.
