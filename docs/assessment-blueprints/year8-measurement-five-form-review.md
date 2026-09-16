# Level 8 Measurement — five-form review

Status: review only. Five matched forms (Pre-Test, Post-Test, Start, Mid, End), 30 questions each. Route: `/demo-review/measurement-level8`. No student-release manifest or login RPC changes.

Source: supplied `mathematics-curriculum-content-7-10-v9.docx`, Year 8 Measurement, Australian Curriculum v9. The blueprint samples all seven descriptors:

| Descriptor | Questions | Evidence |
| --- | --- | --- |
| AC9M8M01 | 1, 8, 15, 22 | Composite area, concave perimeter, rectangle plus triangle |
| AC9M8M02 | 2, 9, 16, 23 | Right-prism capacity, triangular prism, filling time, dimension-constrained tissue-box packing |
| AC9M8M03 | 3, 10, 17, 24, 29 | Circle area/circumference, semicircle boundary, annulus, reverse calculation |
| AC9M8M04 | 4, 11, 18, 25, 30 | Whole/half-hour offsets, elapsed flights, meeting windows, date rollover |
| AC9M8M05 | 5, 12, 19, 26 | Average speed, mixed units, fuel consumption, compound rates |
| AC9M8M06 | 6, 13, 20, 27 | Hypotenuse, shorter side, ladder, diagonal |
| AC9M8M07 | 7, 14, 21, 28 | Map scale, material planning, model assumptions, journey planning |

The user's no-money Measurement scope is preserved. Nonfinancial modelling is sampled; this does not claim complete coverage of every elaboration, including financial contexts. Fixed-response tasks assess model interpretation and review, not the full open-ended modelling process. Difficulty labels are intended author judgements, not empirical calibration.

Each form has six introductory, fifteen moderate and nine challenging questions. Twenty-five use numeric/time entry; five require choosing a result with reasoning or a day/time. Numbers, contexts and correct-option positions vary across forms while skill and intended difficulty match. Time-zone questions explicitly supply UTC offsets; they do not rely on current daylight-saving rules or live schedules.

Lesson reuse: inspected area, metric conversion and volume lesson components plus lesson image assets. Shared dimensioned area and travel scenes, the lesson-derived prism geometry, existing paint artwork and the verified car asset are reused. Precise native SVGs support circles, right triangles and concave shapes. All question instructions, given diagram labels and choices have shared read-aloud coverage without narrating hidden answers.

Shared compact assessment layout places answers beside suitable diagrams; time-zone panels retain full width. Mobile stacks the content without horizontal overflow.

Validation: `npm run qa:year8-measurement-five-forms` independently recomputes all 150 answers, checks geometry, time-zone/day rollover, option uniqueness, matched slots and correct/wrong/blank/IDK scoring. Inventory is generated beside this document. Production build and representative desktop/mobile visual checks supplement the bank audit.

## September 17 review revisions

Question 15 already assesses composite area with a triangle and rectangle; Question 9 uses a triangular prism. Question 23 now assesses practical packaging: whole tissue boxes inside a larger carton, with internal/external dimensions and a fixed orientation. It requires whole-box counts in each dimension; a volume quotient alone is insufficient. This strengthens AC9M8M02's packaging application while retaining 30 items per form.

The forms now mirror L-shapes, notches, right triangles, circle diagrams and diagonal diagrams with upright labels. Contextual walls/gables and ladders only reflect horizontally so they remain physically sensible. Numeric proportions also vary; equivalent mathematical skills and scoring are preserved.

Both map questions use a controlled 1 cm reference grid and labelled segments. Distances are lengths on the original map, not physical centimetres on a device screen. City cards have distinct illustrative landmarks, and water questions show a three-dimensional tank or bucket. City artwork is decorative and does not indicate the unknown time of day. All new given text is narrated.

Coverage remains a descriptor-level sample, not every elaboration: irregular-boundary approximation, cultural investigations and the full open-ended modelling process are not directly assessed by this bank. Financial elaborations remain excluded under the user's no-money scope.
