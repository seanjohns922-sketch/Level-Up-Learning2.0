# Measurelands Level 3 (Year 3) — Planning Review

**Status:** Planning only. Do not implement Week 1 Lesson 1 until this plan is approved.

This plan keeps Number Nexus and the completed Measurelands levels as the architecture reference. Level 3 should change curriculum content and reusable measurement mechanics only where the Year 3 curriculum requires it.

---

## Absolute Build Rule

Do not redesign:

- lesson engine
- navigation
- lesson flow
- XP, streaks, chains, reflections
- save/resume
- brain breaks
- completion cards
- weekly quizzes
- pre-tests or post-tests
- tower progression and fog
- legends
- teacher analytics and student insights
- live class tracking
- routing
- registry pattern

Only change:

- curriculum content
- lesson design
- visuals
- reusable mechanics required for formal measurement

---

## Curriculum Summary

Source checked: Australian Curriculum v9 Mathematics machine-readable ACARA data, Year 3 Measurement.

| Code | Year 3 Measurement focus | Product implication |
|---|---|---|
| `AC9M3M01` | Identify metric units used to measure everyday items; use familiar benchmarks and known units to estimate. | Students choose sensible metric units: cm/m, g/kg, mL/L, seconds/minutes/hours/days. |
| `AC9M3M02` | Measure and compare objects using familiar metric units of length, mass and capacity, and instruments with labelled markings. | Level 3 must introduce marked tools: ruler, measuring tape, scales, measuring jug. |
| `AC9M3M03` | Use relationships between formal units of time including days, hours, minutes and seconds to estimate and compare duration. | Time lessons should move beyond Year 2 clock reading into duration estimates and unit relationships. |
| `AC9M3M04` | Describe relationships between hours and minutes on analog/digital clocks and read time to the nearest minute. | Reuse the analog clock, but Level 3 should introduce five-minute and nearest-minute reading, not repeat only o'clock/half/quarter. |

Codes also present in Year 3:

- `AC9M3M05` covers angles as measures of turn. Because Starpath is the Space realm, this should not be placed in Measurelands without an explicit product decision.
- `AC9M3M06` covers dollars and cents. This should not be placed in Measurelands unless money becomes part of Measurelands by product decision.

---

## Progression Audit

Ground Level:

- compare and identify visible attributes
- use language such as longer, heavier, holds more, before/after

Level 1:

- measure using informal units
- count repeated units
- compare measured counts

Level 2:

- choose sensible informal units
- use smaller informal units for accuracy
- read o'clock, half past, quarter past, quarter to
- count calendar intervals

Level 3 must now feel different:

- formal metric units
- real measuring tools with markings
- benchmark estimates
- formal time units and clock minute reading
- stronger reasoning about why a unit or tool fits the situation

Any Level 3 lesson that only repeats "choose the best informal unit" or "read quarter past" fails the 30% repetition gate.

---

## Misconception Audit

Length:

- starting a ruler at the object edge instead of zero
- counting tick marks rather than spaces
- believing a longer-looking picture always has the larger measurement
- confusing centimetres and metres
- ignoring alignment with the ruler baseline

Mass:

- assuming bigger objects are always heavier
- confusing grams and kilograms
- treating the number alone as meaning mass without checking the unit
- reading marked scales incorrectly

Capacity:

- confusing capacity with height or container shape
- confusing millilitres and litres
- thinking a bigger number always means more without checking unit size
- reading marked measuring jugs from the wrong level

Time:

- reading the hour hand before the minute hand
- confusing "minutes past" and "minutes to"
- not understanding 60 minutes equals 1 hour
- treating duration as the same as clock time
- counting the start day as Day 1 in calendar intervals

---

## Architecture Confirmation

Level 3 should mirror Level 2.

Required scaffolding before Lesson 1:

- `data/programs/year3Measurelands.ts`
- `data/activities/year3Measurelands/registry.ts`
- lesson ids shaped as `y3-measurement-w{week}-l{lesson}`
- weekly quiz ids shaped as `y3-measurement-w{week}-quiz`, unless Week 8 is replaced by a post-test
- program registration in `data/programs/genres.ts` so Measurement exposes Level 3
- program routing in `data/programs/index.ts`
- lesson resolver wiring in `app/lesson/page.tsx`
- weekly quiz/session resolver wiring in `app/session/page.tsx`
- completion metadata supplied by the Level 3 registry
- `realm_id=measurement` preserved through launch, save, completion and return routes

Existing realm-aware P0 work should be preserved:

- local progress keys must remain realm-aware
- lesson attempts must save through realm-aware helpers
- teacher insight payloads must use `Measurement`, not `Number`
- Measurement dashboard/student insight read paths must continue to show attempts and quiz data
- Measurelands lessons must never silently fall back to Number Nexus

---

## Proposed 8-Week Structure Review

### Week 1 — Ruler Ridge

Recommended with adjustment.

- Lesson 1: Meet the Ruler
- Lesson 2: Measure in Centimetres
- Lesson 3: Compare Lengths in cm

This is the correct starting point. Build the reusable Measurelands Ruler here and keep it for Levels 3-6.

### Week 2 — Metre Mountain

Recommended.

- Lesson 1: Meet the Metre
- Lesson 2: Choose cm or m
- Lesson 3: Estimate then Measure

This fits `AC9M3M01` and `AC9M3M02`. It is a real progression from informal units to formal unit choice.

### Week 3 — Mass Works

Recommended.

- Lesson 1: Meet g and kg
- Lesson 2: Compare Mass
- Lesson 3: Choose g or kg

Use realistic benchmarks: paperclip/coin/fruit/book/backpack. Include big-light and small-heavy misconception busters.

### Week 4 — Capacity Lab

Recommended.

- Lesson 1: Meet mL and L
- Lesson 2: Compare Capacity
- Lesson 3: Choose mL or L

Use measuring jugs and labelled capacity, not water-bar guessing.

### Week 5 — Perimeter Path

Do not build as currently proposed.

Perimeter is not supported by the checked Year 3 Measurement content descriptions in the official v9 data used here. It may belong later, or in a different scope decision, but it should not replace required Year 3 formal time or metric measurement work.

Recommended replacement:

- Week 5 — Duration Lab
- Lesson 1: Minutes and Seconds
- Lesson 2: Estimate a Duration
- Lesson 3: Compare Durations

This directly covers `AC9M3M03`.

### Week 6 — Area Acres

Do not build as currently proposed.

Area using square units is not appearing as Year 3 Measurement in the checked curriculum data. It risks creating the wrong level progression.

Recommended replacement:

- Week 6 — Minute Clockworks
- Lesson 1: Five-Minute Time
- Lesson 2: Digital and Analog Time
- Lesson 3: Read to the Minute

This directly covers `AC9M3M04` and properly extends the Level 2 clock mechanic.

### Week 7 — Perimeter Preview

Approved as exposure only.

This is not a full Year 4 perimeter unit. It is a readiness week that introduces the idea of measuring around the edge.

Rules:

- use simple shapes and paths only
- use language such as "around the edge" and "boundary"
- no formulas
- no multiplication
- no complex composite shapes
- no expectation of perimeter mastery

Lessons:

- Lesson 1: Around the Edge
- Lesson 2: Trace the Boundary
- Lesson 3: Perimeter Explorer

This prepares students for Level 4, where perimeter is explicitly taught.

### Week 8 — Area Preview

Approved as exposure only.

This is not a full Year 4 area unit. It is a readiness week that introduces the idea of covering a space with equal squares.

Rules:

- use simple square-tile visuals
- students count covered squares
- no formulas
- no multiplication
- no rectangle area rules
- no irregular part-square reasoning yet

Lessons:

- Lesson 1: Cover the Space
- Lesson 2: Count the Squares
- Lesson 3: Area Explorer

This prepares students for Level 4, where area is explicitly taught.

---

## Recommended Level 3 Structure

| Week | Focus | Lessons |
|---|---|---|
| 1 | Ruler Ridge: centimetres | Meet the Ruler; Measure in Centimetres; Compare Lengths in cm |
| 2 | Metre Mountain: centimetres/metres | Meet the Metre; Choose cm or m; Estimate then Measure |
| 3 | Mass Works: grams/kilograms | Meet g and kg; Compare Mass; Choose g or kg |
| 4 | Capacity Lab: millilitres/litres | Meet mL and L; Compare Capacity; Choose mL or L |
| 5 | Duration Lab: seconds/minutes/hours/days | Minutes and Seconds; Estimate a Duration; Compare Durations |
| 6 | Minute Clockworks: analog/digital time | Five-Minute Time; Digital and Analog Time; Read to the Minute |
| 7 | Perimeter Preview: around the edge | Around the Edge; Trace the Boundary; Perimeter Explorer |
| 8 | Area Preview: cover the space | Cover the Space; Count the Squares; Area Explorer |

This keeps the original intent of "real measuring tools" while giving students light perimeter/area exposure before the Level 4 mastery units.

---

## New Reusable Mechanic: Measurelands Ruler

Build once in Week 1.

Requirements:

- code-rendered or asset-backed premium ruler with labelled centimetre ticks
- clear zero line
- visible spaces between tick marks
- object baseline aligned to ruler zero
- no fine-motor drag for early lessons unless snapped
- dev-only overlay showing object length, start offset, expected cm and rendered pixel scale
- read-aloud on question, answer choices, hints and feedback
- full-screen compact mode from day one

Suggested progression:

- Lesson 1: identify ruler parts and zero start
- Lesson 2: measure objects already aligned to zero
- Lesson 3: compare measurements and reason from the cm count

---

## Weekly Quiz Decision

The master prompt says every week has a 15-question weekly quiz.

Product consistency decision needed:

- Level 2 currently treats Week 8 as a post-test preparation week without a weekly quiz.
- Level 3 should follow that pattern: Week 1-7 weekly quizzes, then Week 8 lessons plus the Level 3 post-test.
- Week 8 should not duplicate the post-test with a weekly quiz.

Do not add a Week 8 weekly quiz for Level 3 unless the post-test model changes.

---

## Coach Tip Rule

Every Level 3 tip must name the strategy for that exact task.

Examples:

- Ruler: "Start measuring at zero, then count the centimetre spaces."
- Metres: "Use metres for bigger things like rooms, paths and people."
- Mass: "Check the unit first. Kilograms are for heavier objects."
- Capacity: "Use litres for larger containers and millilitres for smaller amounts."
- Duration: "Choose seconds, minutes or hours before you compare the time."
- Clock: "Read the minute hand first, then use the hour hand to finish the time."

No generic tips such as "measure carefully" or "take your time".

---

## Risks Before Implementation

- Perimeter and area are Year 4 mastery content, so Week 7/8 must remain exposure-only.
- Repeating Level 2 clock/calendar lessons would make Level 3 feel stale and fail the 30% repetition gate.
- The ruler component will become foundational. Build it carefully before creating many ruler lessons.
- Formal metric units require tighter visual accuracy than informal units. Scaling and tick alignment need dev overlays.
- Teacher dashboard and student insights must be checked with `realm_id=measurement` and Year 3 ids before pushing.
- Week 8 quiz vs post-test behavior needs a product decision before final scaffolding.

---

## Suggested Implementation Order After Approval

1. Add Level 3 Measurelands program scaffolding only.
2. Wire Level 3 Measurement into the program/tower flow.
3. Keep lesson generators unimplemented until each lesson is approved.
4. Build the reusable Measurelands Ruler.
5. Build Week 1 Lesson 1.
6. Validate launch, save/resume, completion, teacher insights and fullscreen layout.
7. Continue one lesson at a time.

Do not start Lesson 1 content until the scaffolded Level 3 flow is verified.
