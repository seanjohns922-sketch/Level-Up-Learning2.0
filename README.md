# RELIQ

Maths learning platform from BrightUp Education, built with Next.js and Supabase.
Read [AGENTS.md](AGENTS.md) before changing student experiences or access controls.

## Development

Use Node 24 (see `.nvmrc`) and npm. `package-lock.json` is the dependency lockfile.
Use an approved non-production Supabase project containing synthetic accounts.
Copy the template, fill in its URL and public anon/publishable key, then start:

```bash
npm ci
cp .env.example .env.local
# Edit .env.local with the approved test project's connection details.
npm run dev
```

Development fails before serving pages if either connection setting is missing
or the URL points to the current production project. Do not bypass this by
changing `NODE_ENV`. The template sets `NEXT_PUBLIC_APP_ENV=staging`, which also
protects local production builds and test deployments. Never use production
student data as test fixtures. `.env.local` is ignored; `.env.example` has no keys.

This is a connection safeguard, not a database provisioning command. A new
Supabase project needs the approved schema and synthetic fixtures before signed-in
journeys will work. The historical migrations alone are not a complete bootstrap:
the earliest migration assumes `public.students` already exists. Do not run a
reset against a hosted project or copy a production data export to get started.
Until the bootstrap is supplied, request access to an approved test environment.

For an already-provisioned isolated local fixture, `npm run staging:app` reads
`.local-archive/scale-local/status.env`, requires a localhost API on port 56521,
and starts the app on port 3100. It does not create the database. Its provisioning
service-role key is not passed to the app. See `scripts/staging/local-config.mjs`.

### Environment settings

| Setting | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_ENV=staging` | Require an explicit non-production destination, including during builds. |
| `NEXT_PUBLIC_SUPABASE_URL` | Approved test project URL (or provisioned local API). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | That project's public anon/publishable key; never a secret/service-role key. |
| `NEXT_PUBLIC_APP_URL` | Origin for application links; local default in the template is port 3000. |
| `NEXT_PUBLIC_VOICE_CLIP_BASE` | Optional public voice asset base; if omitted, existing public production clips remain available. |

All `NEXT_PUBLIC_*` values are visible in browser builds. Restart development
after edits, and rebuild deployed previews when these values change. For an
isolated hosting preview, set `NEXT_PUBLIC_APP_ENV=staging` and the test connection
settings in that deployment environment; Vercel previews are not automatically
isolated by this patch. Production deployment defaults are preserved. Do not copy
the local template into production deployment settings.

Email delivery is unnecessary for most local UI work. If explicitly testing
invitations, configure server-only `RESEND_API_KEY` and `EMAIL_FROM` for a test
sender and controlled recipients. Leave real production email credentials out of
local development. These guards cover the shared application connection, not
standalone maintenance scripts; inspect each script and its target before running.

Environment loading and browser inlining follow
[Next.js environment variable rules](https://nextjs.org/docs/app/guides/environment-variables).

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
pending. The 16 November 2026 baseline had zero application-lint errors and 323
warnings; historical failures in the release notes are not the current baseline.
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
