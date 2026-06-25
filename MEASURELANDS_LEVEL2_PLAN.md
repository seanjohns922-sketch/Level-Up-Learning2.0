# Measurelands Level 2 (Year 2) — Master Plan

**Status:** Approved 2026-06-25 (9.5/10). Single source of truth for Level 2, for both Claude and Codex. Read this alongside `public/images/measurelands/ART_SPEC.md`.

Build lessons **in order** (W1 → W8). The analog clock (W5) is built **after** the W1–W4 foundation is stable.

---

## Absolute rule

Number Nexus and the existing Measurelands builds are the reference implementation. **Do not redesign** the lesson engine, flow, navigation, progression, XP, streaks, chains, reflections, save/resume, brain breaks, quizzes, post-tests, legends, tower, fog, live tracking, or teacher analytics. Only change **curriculum content, lesson design, visuals, and activity data.**

No weekly quiz in Level 2. A **post-test is coded last**, once all levels are done. Registry entries therefore omit `quizContributionBuilder` (same as Level 1 Week 8). Keep `practisedSkills` tags accurate so the later post-test maps 1:1.

---

## The two governing design rules (every lesson must pass)

**Rule 1 — Name the new Year 2 *thinking*, not the new activity.** Each lesson states one sentence: *Ground did X → Level 1 did Y → Level 2 does Z.* If Z is not a genuine thinking shift, the lesson is rejected.

**Rule 2 — 30% repetition gate.** Before coding any lesson, compare it against Ground Level and Level 1. If more than 30% feels like repetition, redesign it before coding and write *why* it represents genuine Year 2 progression.

---

## Year 2 curriculum (AC v9 — only three content descriptions)

| Code | Focus |
|---|---|
| **AC9M2M01** | measure and compare objects based on **length, mass and capacity** using appropriate **uniform informal units**, *and smaller units for accuracy when necessary* |
| **AC9M2M02** | **recognise and read the time** on an **analog clock** to the **hour, half-hour and quarter-hour** |
| **AC9M2M03** | **identify the date and determine the number of days between events** using calendars |

Year 2 measurement does **not** include area, volume or temperature (Year 3+).

**Conceptual jumps from Year 1:** quantify with uniform units (count "how many", order 3+); use **smaller units for accuracy**; **read an analog clock**; **calculate day-intervals**.

---

## Per-week "Year 2 thinking"

| Week | Ground → Level 1 → **Level 2** |
|---|---|
| W1 Length | compare → measure → **count & order by units** |
| W2 Mass | heavy/light → balance → **count units & order "by how many"** |
| W3 Capacity | more/less → fill → **count & order by capacity** |
| **W4 Accuracy ★** | — → whole units → **smaller units for a closer count; choose the unit** |
| W5 Clock I | time words → sequence → **read the clock (o'clock / half past)** |
| W6 Clock II | — → — → **read to the quarter-hour; "quarter to" = next hour** |
| W7 Days Between | locate dates → navigate → **calculate intervals between events** |
| W8 Challenge | do a skill → **choose which skill** |

---

## 8-week plan

> Default arc: **L1 introduce → L2 apply & compare → L3 reason/justify**, unless the curriculum suggests a stronger sequence. Highly visual, low-reading, audio-supported throughout (visual = primary, text = support, audio = accessibility).

### W1 · Unit Count Canyon — Length (AC9M2M01)
*Year 2 thinking: measure → quantify & order by units.* **Wide, randomised object pool from day one.**
- **L1 Count the Units** — lay uniform units end-to-end, count "how many units long".
- **L2 Compare by Count** — measure and order 3 objects by unit count.
- **L3 Fair Units** — same object, different unit sizes → why the count changes; pick the fair measure.
- *Mechanics:* `measurePath`, `measurementCompare`, order/sort. *Art:* reuse `measure-objects-3d`. No new art.

### W2 · Balance Basin — Mass (AC9M2M01)
*Year 2 thinking: compare → count units & order by how many.*
- **L1 Count the Weights** — balance an object against uniform mass units; count to balance.
- **L2 By How Many?** — compare/order objects by unit count.
- **L3 Predict & Prove** — justify which is heavier; fix an unfair balance.
- *Mechanics:* `balanceScale`, `massMeasure`. *Art:* reuse. No new art.

### W3 · Capacity Springs — Capacity (AC9M2M01)
*Year 2 thinking: more/less → count & order by capacity.*
- **L1 Count the Cups** — fill a container with uniform scoops; count how many it holds.
- **L2 Holds More by How Many** — order containers by count.
- **L3 Choose & Reason** — which holds most; justify; fix a wrong fill.
- *Mechanics:* `capacityMeasure`, order. *Art:* reuse `containers-3d`. No new art.

### W4 · Closer Count — Smaller units & choosing the unit (AC9M2M01) ★ signature Year-2 week
*Year 2 thinking: whole units → smaller units for accuracy; choose the right unit.*
- **L1 In Between** — a measure that isn't a whole number ("between 4 and 5").
- **L2 Re-measure Smaller** — swap to smaller units for a closer count; compare accuracy.
- **L3 Right Tool, Right Unit** — pick the best unit for the job; justify.
- *Mechanics:* small extension of the measure cards (a "re-measure with smaller unit" step). *Art:* reuse. No new art.

### W5 · Clock Tower I — O'Clock & Half Past (AC9M2M02) ★ new mechanic
*Year 2 thinking: time words/sequence → read the clock face.*
- **L1 Read O'Clock** — hour hand; read o'clock.
- **L2 Half Past** — minute hand at 6; hour hand drifts between numbers.
- **L3 Match & Set** — analog ↔ digital/words; set the hands.
- *Mechanics:* **new `analogClock` card** (read-MCQ / set-hands / match). *Art:* **clock face = code-drawn SVG, no art asset** (hour hand gold, minute violet).

### W6 · Clock Tower II — Quarter Past & Quarter To (AC9M2M02)
*Year 2 thinking: read to the quarter-hour; "quarter to" names the next hour.*
- **L1 Quarter Past** — minute hand at 3.
- **L2 Quarter To** — minute hand at 9; hour hand nearly at next number.
- **L3 Time Master** — mix all four; set/match/sequence.
- *Mechanics:* reuse `analogClock`. No new art.

### W7 · Calendar Keep — Days Between (AC9M2M03)
*Year 2 thinking: locate/navigate dates → calculate intervals.* (No "read the date" lesson — that's Level 1.)
- **L1 Count Days Between** — interval between two marked events.
- **L2 How Many Days Until?** — countdown; weeks ↔ days; cross-month.
- **L3 Calendar Problem Solving** — multi-step "if… then how many days…" reasoning.
- *Mechanics:* reuse `calendarFind` / `calendarNavigate` + small "count interval" scene. *Art:* reuse calendar/months. No new art.

### W8 · Measurement Challenge Week — mixed attributes inside every lesson (all codes)
*Year 2 thinking: do a skill → choose which skill. "Which measuring skill should I use?" not "which week was this?"*
- **L1 Which Attribute?** — choose length / mass / capacity / time / calendar for the task.
- **L2 Which Unit?** — pick the right unit (and when to go smaller).
- **L3 Mixed Measurement Problems** — real-world problems spanning all five strands.
- *Mechanics:* remix of everything. No new art.

---

## Visual direction

Reuse the Meazurex gold/violet shell and existing art (`measure-objects-3d`, `containers-3d`, calendar, months). The only notable new visual is the **analog clock**, rendered in **code (SVG)** — colour-coded hands (hour = gold `#b4781e`, minute = violet `#7c3aed`), large tappable numerals, drag/tap to set hands. No Codex art for the clock. Any incidental new objects follow `ART_SPEC.md` (soft-3D, transparent PNG, 1254²). New art for Level 2 is essentially nil.

---

## Architecture — Level 2 reuses everything (mirror Level 1)

- **Program skeleton:** `data/programs/year2Measurelands.ts` mirroring `year1Measurelands.ts` (weeks/lessons via `buildLesson`, ids `y2-measurement-w{n}`); registered in `data/programs/genres.ts` + `data/programs/index.ts`.
- **Activities + registry:** `data/activities/year2Measurelands/` with `registry.ts` exporting `Y2_MEASURELANDS_LESSONS`, `resolveY2MeasurelandsLessonTask`, `isY2MeasurelandsLessonId`; lesson files `weekNLessonM.ts`; **prefix `y2-measurement-w{n}-l{m}`**.
- **Lesson resolution:** add the Y2 resolver in `app/lesson/page.tsx` alongside the Y1 one.
- **Rendering:** reuse `TaskRenderer`; add any new task kinds to `lib/task-safety.ts` allowlist (only `analogClock` + small scene extensions).
- **XP, streaks, chains, reflections, save/resume, brain breaks, completion cards, fog, legends, tower, live tracking, teacher analytics:** keyed off lesson IDs + registry metadata (`practisedSkills`, `completionTitle`, `unlockMessage`). Level 2 reuses them purely by populating those fields.
- **No new architecture.**

---

## Build order

1. Create Year 2 Measurelands scaffolding.
2. Register the new program + lesson registry + routing.
3. Build Week 1 Lesson 1, then validate the full Level 2 flow (routing, save/resume, XP, reflection, completion).
4. Continue sequentially through Weeks 1–4.
5. Build the analog clock (W5) once the Level 2 foundation is stable.
6. Review each lesson as completed before moving to the next.

## Risks
- Analog clock is the hardest mechanic (half-past / quarter-to hour-hand position) — build after the foundation is proven.
- 24 lessons — velocity depends on disciplined mechanic reuse.
- "Smaller units for accuracy" (W4) needs a genuinely concrete "leftover gap → smaller unit" visual.
- Post-test deferred — keep `practisedSkills` taxonomy consistent to avoid tag drift.

## Sources
- AC v9 Year 2 Mathematics (ACARA): AC9M2M01 / AC9M2M02 / AC9M2M03
- QCAA Year 2 v9 alignment (PDF); Mathematics Hub — Informal units Year 2; Twinkl Year 2 Measurement (pedagogy/progression/misconceptions only — not for copying activities).
