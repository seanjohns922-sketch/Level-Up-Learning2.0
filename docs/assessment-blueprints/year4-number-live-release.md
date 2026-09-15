# Level 4 Number student release

The owner-approved 100 questions now have production v3 identities. New pre-tests and matching post-tests use these forms. Existing v2 drafts and baseline pairs retain v2; growth requires the same bank and learning cycle. Start/Mid/End are pinned to v3 for new diagnostic cycles after the release migration. Existing cycles retain v2.

Validation: 100 answer/scoring checks, production snapshots, API routing, old-draft restoration, comparable and incompatible growth pairs, checkpoint routing, curriculum/form audit, TypeScript, lint and production build. SQL dry run confirms all existing sitting records unchanged, old/new cycle version pinning, and that adoption changes only the Level 4 version guard; transaction rolled back before deployment.

Migration: `20260915190000_number_level4_five_form_release.sql`, applied after web deployment. It relies on the already-present Level 2 released RPC. This release does not reset student progress or replace historical assessment evidence.

Difficulty labels are author judgements, not statistical calibration. The forms sample each Level 4 Number descriptor; they do not alone demonstrate every explanation, strategy or algorithm-creation component of the curriculum.

Production verification: web commit `2a4cdec2` reached Vercel success; migration applied and recorded on 2026-09-15. Read-only verification confirmed default v3, enabled pinning trigger, released RPC and adoption guard. The two existing diagnostic sittings remained v2.
