# Level 5 Number student release

Owner-approved Pre, Post, Start, Mid and End forms use production v3 identities. Existing v2 pre-test drafts, post-test drafts and baseline pairs retain their original banks. Comparison groups require matching question versions and learning cycles. New diagnostic cycles use v3 after the release migration; existing cycles retain v2 and later checkpoints inherit their cycle's version.

Only migration `20260915200000_number_level5_five_form_release.sql` belongs to this release. Older migration-audit issues remain untouched at the owner's request.

Verified: all 100 released questions match approved review content; scoring, snapshots, legacy routing/resume, compatible and incompatible growth, diagnostic checkpoint pinning, curriculum/form audits, TypeScript, targeted lint and production build. SQL dry run verified unchanged existing sitting records, old/new cycle pinning, and an adoption-function change limited to the Level 5 guard; rolled back before deployment.

Production verification: Vercel reported success for `21caba27`; migration `20260915200000` was applied and recorded. Read-only checks confirmed default v3, the enabled trigger, versioned RPC and adoption guard. Both existing diagnostic sittings retain v2.
