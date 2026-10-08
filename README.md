# RELIQ

Maths learning platform from BrightUp Education, built with Next.js and Supabase.
Read [AGENTS.md](AGENTS.md) before changing student experiences or access controls.

## Development

Use Node 24 (see `.nvmrc`) and npm. `package-lock.json` is the dependency lockfile.
Run the app locally:

```bash
npm ci
npm run dev
```

Other useful commands:

```bash
npm run lint
npm run lint:qa
npm run typecheck
npm run qa:critical
npm run qa:security-source
npm run build
npm run qa:year2-smoke
npm run qa:level-aware-regression
```

`build` includes the existing prebuild release checks. Critical and security-source
groups write results to `.local-archive/qa/`. Source checks do not prove that live
permissions, student persistence or every activity work correctly.

Use an approved development environment for authenticated work; never commit
credentials or copy production student data into fixtures. CI needs no production
secrets. Public browser configuration must never contain privileged server keys.

## Code and progression

- `app/`: student, teacher, school and review routes.
- `components/`: lesson controls, dashboards and 3D worlds.
- `data/`: lesson and question content.
- `lib/`: shared access, progression, assessment and world helpers.
- `supabase/migrations/`: database changes; preserve historical migrations.
- `scripts/`: QA and maintenance commands. Inspect maintenance scripts before use.

Use `lib/assessment-rules.ts` for assessment thresholds and `lib/program-weeks.ts`
for realm/year week counts. Weekly quiz progression uses 80%; normal pre/post-test
advancement uses 85%. Diagnostic placement has separate rules: do not replace them
with normal assessment advancement. Preserve canonical saving and teacher reporting
when adding content, realms or levels.

Student RPC access uses Supabase's anonymous role with a validated
`x-student-session` header; adult authentication is separate. Test actual roles,
missing sessions and cross-student access. A successful database-owner call does
not establish student access. Explain migration effects and rollback before release;
the user applies migrations, and test session fixtures must be removed.

## Release status and evidence

See [engineering release checks](docs/ENGINEERING_RELEASE.md), the
[G–6 reliability audit](docs/G6_RELIABILITY_AUDIT.md) and the
[security follow-up](docs/SECURITY_FOLLOW_UP.md). School-launch approval remains
pending. Application lint has known failures; these remain visible in CI.
GitHub checks alone do not configure branch protection or block hosting deployments.

Live screen sharing has been removed from the application; server containment
requires separate approval. See the [retirement plan](docs/SCREEN_SHARING_RETIREMENT.md) before changing it.
The remaining RELIQ visual rebrand and domain migration are deferred until the
user resumes them with final branding assets.

## Level Design Docs

Use these before building a new maths level:

- [Level Setup Checklist](docs/level-setup-checklist.md)
- [Level Setup Template](docs/level-setup-template.md)
- [Year 4 Engine Bank Spec](docs/year4-engine-bank-spec.md)
- [Weekly Quiz Contract](docs/weekly-quiz-contract.md)

Working rule:
- do not write the full level schedule until the checklist steps 1 to 7 are complete
- do not wire assessments until lesson intent and activity policy are locked
- do not ship a level until pre-build QA and post-build smoke QA are complete

## Current Engine Direction

The lesson engine is moving toward explicit level-aware generation and validation:

```ts
getDifficultyProfile(level, week)
getAllowedModes(level, activityType)
validateLessonActivityIntent(level, lesson, activity)
generateQuestion(level, lesson, activity)
```

Goal:
- generation, validation, lesson config, and assessments stay aligned across levels
- no stale Year 2 defaults leaking into Year 3 or later levels
