# Pattern Peaks Level 1 — five-form review

20 questions × Pre-Test, Post-Test, Start, Mid, End = 100 items. Review route: `/demo-review/pattern-level1`. The main demo selector now includes Level 1 and links all five buttons to this bank. This is the review stage; no student diagnostic, placement, login or saved-assessment bank is changed.

## Curriculum evidence

Read page 14 of the owner's `mathematics-curriculum-content-f-6-v9 (4).pdf` (ACARA Version 9.0).

- **AC9M1A01:** recognise, continue and create sequences with numbers, symbols, shapes and objects formed by skip counting, initially by twos, fives and tens. Slots 13–20 use number sequences, genuinely constructed counting patterns, visual equal groups and connecting groups with a counting sequence. Objects are counters, drawn as counters. Values stay within 100.
- **AC9M1A02:** recognise, continue and create repeating patterns with numbers, symbols, shapes and objects, identifying the repeating unit. Slots 1–12 include AB, AAB, ABB and ABC sequences, missing parts, minimal units, copying, creating, number-pattern repair and transferring a structure to new symbols.

Existing lesson evidence inspected: `data/programs/year1.ts`, weeks 4, 10 and 11; `RepeatingPatternTaskCard`, `RepeatingPatternVisual`, `SkipCount` and `EqualGroups`. Reuses the actual lesson token artwork, with new assessment sequences and no immediate correctness coaching. These Level 1 lessons currently belong to Number Nexus; Pattern Peaks' separate weekly program still starts at Level 3. The review does not invent links to a Level 1 Pattern Peaks weekly program.

## Assessment design

Four distinct choices for each selected-response item; answer positions rotate. Six construction items per form include two tasks accepting multiple valid creations. No shown target answer in creation tasks. Undo/Clear allow editing, and answers record without a separate Done button. Questions have numbered navigation, Back/Next, skip, four-choice and palette narration, source narration and current-response narration.

Pattern Peaks theme tokens apply to the entire screen. Mathematical token colours remain consistent with lesson artwork. Five forms use the same skill order with different token palettes, starting numbers and group quantities; some simple group models recur because the valid Level 1 quantities are deliberately bounded.

## Verification

`npm run qa:pattern-peaks-level1-five-forms` independently solves all 100 items, checks one correct choice among four, accepts alternative valid creations and rejects incomplete/incorrect responses. The audit runs in prebuild. Browser verification covers all five complete forms, navigation, skip, editing, read-aloud controls, desktop/mobile overflow and visual inspection. Existing live student banks are untouched.
