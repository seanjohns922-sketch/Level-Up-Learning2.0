# Engineering checks and release gates

## First hardening pass — 8 October 2026

The GitHub workflow `.github/workflows/quality.yml` runs on PRs, main pushes and
manual dispatch. It uses read-only repository permissions, pinned official actions,
Node 24/npm, lockfile installs and no production secrets or live student mutations.

Checks are intentionally separate:

- **Critical QA and types:** QA infrastructure lint, generated route types,
  TypeScript and `qa:critical`.
- **Application lint:** the existing full application lint. The initial baseline
  has 65 errors and 319 warnings; this job is expected to remain red until the
  actual defects are addressed. No rules are suppressed or failures ignored.
- **Production build and release QA:** `npm run build`, including every existing
  prebuild assertion. The CI build exercises Level 7 on and demo/admin mode off.

`qa:critical` and `qa:security-source` group existing scripts without relocating or
rewriting their assertions. Per-check logs and results are saved under
`.local-archive/qa/`; critical CI artifacts are retained for seven days. Security
source checks are not live RLS, penetration or signed-in journey tests.

QA infrastructure lint starts with the runner, screen suspension check, marking
regressions and their harness. The other scripts remain outside that lint surface
until migrated. Existing `prebuild` protections remain intact.

Local validation for this patch: critical QA 10/10, security-source QA 4/4,
QA infrastructure lint, changed application-file lint, generated route types and
TypeScript passed. The lockfile install dry run and workflow YAML parse passed.
The complete prebuild suite passed; sandboxed compilation stalled, then production
compilation, type validation and page generation passed outside that sandbox.
This is local evidence, not a recorded GitHub-hosted workflow result or a fresh
signed-in browser journey. Existing application lint failures remain unresolved.

## GitHub settings still required

Adding a workflow does **not** configure branch protection or prevent direct pushes.
After its first run and remediation of existing lint failures, require the three
named checks on main, require PRs and apply protection to administrators as appropriate.
Review bypass access. Verify these settings in GitHub; they are not enforced by this
file. Hosting auto-deploys are a separate gate and may run despite a failing GitHub
check until release settings are explicitly aligned.

## School-launch decision remains pending

Follow `G6_RELIABILITY_AUDIT.md` and `SECURITY_FOLLOW_UP.md`. Record signed-in
student/teacher persistence, placement/reset, quiz fail/pass, unlock and reload
results, remaining independent maths/control coverage, physical iPad/accessibility,
advancement reporting and deployed security boundaries. Do not substitute build or
source checks for those results.

## Safe contribution sequence

1. Inspect root cause, affected callers and canonical helpers.
2. Scope a small patch; identify schema/access/progression impacts and rollback.
3. Add meaningful regression coverage and run affected suites.
4. Run types, relevant lint and build for release-affecting changes.
5. Review the diff, preserve other work, commit only scoped files and report gaps.

Use npm only. Historical SQL migrations, old stored question IDs and compatibility
routes are not removed for tidiness. Heavy asset hosting and subsystem consolidation
are subsequent projects; no Git history rewrite belongs in this pass.
