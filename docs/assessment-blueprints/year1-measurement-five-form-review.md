# Measurelands Level 1: five matched review forms

Basis: supplied Australian Curriculum v9 F–6 PDF, Year 1 Measurement, page 15.
The existing Level 1 post-test supplies the core skills. Pre, Post, Start, Mid and
End use the same slot structure, curriculum codes, response modes and intended
difficulty, with changed values, examples and answer positions. Fixed facts such
as the order of hour/day/week remain the same. These are uncalibrated author
judgements, not an empirical guarantee of equal difficulty.

- AC9M1M01: direct and indirect comparison and ordering of length, mass, capacity
  and duration. A string comparison makes the indirect-comparison evidence explicit.
- AC9M1M02: equal informal length units, end-to-end placement, gaps/overlaps and
  why different unit sizes produce different counts.
- AC9M1M03: weekday/month sequencing, hours/days/weeks/years, month lengths and
  familiar daily-event ordering. No clock reading or metric units are added.

All 20 slots have visuals. The existing lesson artwork is reused for familiar
objects, activities, containers, growth and routines. Labels and instructions
have diagram narration; prompts and answer choices have their own audio.

Five easy, twelve moderate and three challenging items per form. Challenges
require indirect comparison or reasoning about units, not beyond-Year-1 arithmetic.
Independent audits recompute answers and check scoring, unknown responses, asset
paths, ordering and consistency across forms. Manual child-view review remains.

Review: Demo Review → Measurelands → Level 1 → Pre/Post or Start/Mid/End.
Approved for student release on 16 September 2026. The immutable v4 snapshot is in `data/assessments/releases/year1Measurement-v4.json`. New pre/post assessments and new diagnostic cycles use the five matched forms. Saved attempts, older baselines and already-started academic-year diagnostic cycles retain their prior version. Migration: `20260916123000_measurement_level1_release.sql`. Calendar totals are omitted visually and from narration; children use the displayed dates.

Manual-review refinements: child-friendly mass wording; the existing lesson pencil
image aligned with the equal blocks; clearer ribbon and box drawings; full trip
times in question narration plus per-trip audio; and 2026 calendar grids for the
month-length comparisons. All five forms share these refinements.

Object-visual standard for all realms and levels: show a recognisable depiction
of the named object rather than a labelled placeholder bar. Reuse lesson artwork
or a shared geometry-preserving renderer. Ribbons now use the shared
`MeasuredRibbon` fabric drawing in Ground, Level 1 and ribbon-labelled informal
measurement diagrams; endpoints and unit alignment remain unchanged.
