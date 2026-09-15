# Level 1 Number candidate review

Date: 2026-09-15. Status: **question specifications and candidate scorer; not release-ready**.

## Scope and source

Five fixed forms, each with 20 questions: pre, post, diagnostic Start, Mid and End. Source checked against the supplied Australian Curriculum v9 Mathematics F–6 PDF, pages 12–14. Descriptor allocation per form:

| Code | Questions |
| --- | ---: |
| AC9M1N01 | 3 |
| AC9M1N02 | 2 |
| AC9M1N03 | 2 |
| AC9M1N04 | 3 |
| AC9M1N05 | 3 |
| AC9M1N06 | 3 |
| AC9M1A01 | 2 |
| AC9M1A02 | 2 |

All forms reach 120 in ordering and collection quantification, contain both one-digit and two-digit partitions, and cover twos, fives and tens through sequence/grouping tasks. Repeating ABC patterns require identification or construction, not just guessing the next symbol.

## Completed

- 100 explicit task specifications, with numerical examples, prompts, visual requirements and evidence rubrics. See [five-form matrix](year1-number-authoring-matrix.md) and [complete inventory](year1-number-authoring-inventory.json).
- Candidate scoring checks raw models and answers together for practical problems. Numeric-only submissions cannot pass a required construction.
- Money tasks use only $1 and $2 denominations. The scorer reads denominations from the immutable wallet and rejects repeated coin identities. Every proposed payment has a valid exact solution.
- Missing-part and unequal-sharing tasks require a valid reason. Alternative positive partitions of the small total are accepted; the tens exchange is explicitly constrained.
- Item identity/version checks prevent a response from another item or an older version being scored. Missing or incompatible submissions return a null score.
- 1,350 checks cover independently calculated targets, code allocations, matched task kinds, model evidence, malformed/partial responses and serialized response roundtrips.

## Remaining release gates

1. **Matched-difficulty review:** grouping quantities range from 20–30, money wallets from $9–$13, and sharing totals from 12–18. Operations and response types match, but the variation in object count and interaction workload needs review. The blueprint now specifies comparable ordering gaps with the same hundred crossings, and explicitly requires a collection of 120 in every form. No calibrated equivalence claim.
2. **Renderers:** implement the specified tens rods, line, grouping, story, coin and pattern interfaces. The specs are not currently selectable in the Prep-only candidate review route. No screen inspection is claimed.
3. **Usability and audio:** inspect every rendered item at desktop/tablet/mobile sizes. Confirm grouping supports efficient selection, numerals/coin labels stay legible, and read-aloud does not reveal the answer. Verify the two-part partition question's workload is reasonable for Year 1.
4. **Real persistence:** candidate JSON serialization is not a Supabase save test. Integrate immutable form selection, raw evidence, submission locks, resume, idempotency, learning cycles and compatible teacher growth reports, preserving existing records and attempts.
5. **User manual review last**, after the assistant's content, screen and persistence audits. No production release or new migration yet.

Run:

`node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/audit-year1-number-authoring.ts`

The current live pre/post and diagnostic question resolvers are unchanged.
