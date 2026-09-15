# Prep Number candidate implementation

Date: 2026-09-15. Status: **authoring and scorer draft; not release-ready**.

## Completed

- Five fixed 20-item candidate forms: pre, post, diagnostic Start, Mid and End.
- Same 20 skill slots, seven curriculum codes and one-point item maximums. No Prep Statistics.
- Source reviewed against the supplied Australian Curriculum v9 PDF, printed pages 5–7.
- Every form counts 20 and orders a set containing zero and 20. The earlier blueprint's “approaching 20” did not guarantee that boundary.
- Visual response component for all 20 slots: dot cards, collections, part–whole models, numeral ordering, construction, pairing, sharing, grouping and patterns.
- Construction stores each original object's destination. Objects cannot be duplicated or dropped from accepted evidence. Addition retains original objects; sharing and grouping conserve the collection.
- Partition rubrics accept multiple valid solutions. A different partition must change the unordered pair of part sizes; simply swapping trays does not pass.
- Composite items require both requested parts of the answer. A numeric answer alone cannot satisfy conservation reasoning, and a correct comparison alone cannot satisfy pairing evidence.
- Scoring checks item identity and version, retains raw response, and represents missing/unmatched evidence as `score: null`, not zero.
- Independent worked examples and negative scoring checks cover all 100 items. Audit additionally checks all two-part partitions for the authored totals.
- Protected review route: `/demo-review/assessment-candidates`, using the same server-side access check as Diagnostic Preview. The harness has no student identity or database, storage, progression or reward writes. Prep and Level 1 are selectable; the shared Number Nexus shell supplies the theme.

## Important limits and remaining work

1. **Parallel-form review is still required.** This is a bounded Prep domain, so quantities intentionally repeat. In particular, counting 20, recognising four/five dots and grouping eight objects in pairs repeat across forms with different materials or arrangements. These are not 100 distinct mathematical structures, and visual changes alone do not establish independent equivalent forms. Review memorisation risk and workload before approving the set. Other slots change operands, partitions, numeral sets and pattern units.
2. **Subitising is not proven by this interface.** Dot cards currently remain visible with no timer. This is consistent across all five forms and avoids silently penalising children who need more viewing time, but the results support quantity recognition only. Decide how observation/strategy evidence and any timed conditions will be recorded before reporting subitising mastery. The `quickLook` task flag identifies the intended skill, not measured speed.
3. **Rendered inspection has not passed.** Browser tooling stalled and then repeatedly reported concurrent user changes. No desktop, tablet, mobile or audio pass is claimed. The new interaction component is not yet wired into the real assessment card; its use in all live test entry points must be checked after candidate review.
4. **Production integration is not implemented.** Existing pre/post and diagnostic resolvers are unchanged. Pin candidate form/item versions at attempt start; preserve current in-progress and historical banks. Integrate first-submit locking, resume, idempotent save, cycles and version-compatible teacher reports, then run synthetic learner roundtrips.
5. **User review remains last**, after the assistant's content, rendered screen and persistence checks. No request for early manual checking.

## Validation commands

`node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/audit-prep-number-candidates.ts`

`npx tsc --noEmit`

`npx eslint data/assessments/candidates/prep-number components/assessment/PrepNumberCandidateCard.tsx components/demo/PrepNumberCandidateReview.tsx app/demo-review/assessment-candidates/page.tsx`

The scorer audit generates the [five-form matrix](prep-number-authoring-matrix.md) and [full inventory](prep-number-candidate-inventory.json). Current production data and assessment banks have not been changed, and no migration is required for this candidate-only draft.
