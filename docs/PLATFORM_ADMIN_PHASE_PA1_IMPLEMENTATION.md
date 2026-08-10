# Platform Admin Phase PA1 Implementation

## Delivered

- Canonical, active `platform_owner` authorization helper.
- HTTP-only Platform Admin session and owner-first educator login routing.
- Protected `/admin` route group with Platform Admin navigation.
- Overview KPIs and School to Home snapshot.
- Filterable `/admin/schools` aggregate table.
- Owner-only school creation with current billing set to Free.
- Lazy `/admin/schools/[schoolId]` detail.
- Safe seat, access status, date, notes and billing classification editing.
- Lightweight Users, Home, Growth and Analytics sections.
- Immutable Audit section.
- School and home entitlement schema with future billing fields.
- Current-school and current-student free-access migration.
- PostgreSQL security, segmentation, seat and audit tests.
- Static PA1 repository audit.

## Data Migration

The migration adds missing current academic years, creates one current free school licence per existing school and materialises active school access from existing enrolments. It does not recreate or change schools, students, enrolments, parent links or Explorer Codes.

Home entitlements are not backfilled because the repository did not contain a canonical home-access source. Parent links are intentionally not treated as home access.

## Administrative Commands

`platform_owner_create_school` creates only the school, academic year and free licence entitlement. It does not create arbitrary teachers or classes.

`platform_owner_update_school_licence` locks the licence row, counts distinct active school students and rejects a seat reduction below current use. Successful changes update the compatible school status and write immutable audit history.

## Read Architecture

`get_platform_admin_overview` returns one platform aggregate.

`get_platform_admin_school_summaries` returns one aggregate school list, including seats, people, parent linking, home activation and last activity.

`get_platform_admin_school_detail` is called only for the selected school and adds weekly lesson, quiz and assessment activity.

No client-side student scan or N+1 school request is used.

## 2026 Behaviour

- Schools can be Trial, Active, Paused or Archived independently of payment.
- Existing and newly created school licences default to Free.
- Home entitlements can be active and Free without a subscription record.
- Paid metrics are visually marked `Not active yet`.
- No payment provider, checkout, webhook or fake subscription is included.

## Deployment Sequence

1. Apply `20260811100000_platform_admin_pa1.sql` to the target Supabase project.
2. Add at least one active `platform_owner` row through a protected database administration process. Do not add an owner role from client code.
3. Run `supabase/tests/platform_admin_pa1.sql` in the database test suite.
4. Deploy the application.
5. Sign in with the canonical Platform Owner account and verify redirect to `/admin`.
6. Create a test school, increase its seats, and confirm the audit record.
7. Confirm a school admin cannot access `/admin`.

The repository change does not automatically apply the migration to production.

## Verification

Run:

```bash
npm run qa:platform-admin-pa1
npx tsc --noEmit
npx eslint app/admin components/admin lib/platform-admin-server.ts app/api/admin app/api/admin-session
npm run build
```

Database tests require the Supabase test environment with all migrations applied.

## PA1 Boundary

PA1 does not implement delegated `platform_admin`, payment processing, checkout, webhooks, fake billing records, marketing automation, individual opportunity targeting or full user management. Those remain later phases built on the same canonical identity and entitlement foundation.
