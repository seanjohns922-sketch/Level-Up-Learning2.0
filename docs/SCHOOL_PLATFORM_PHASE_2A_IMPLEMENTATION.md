# School Platform Phase 2A Implementation

Status: Implemented locally; migrations require deployment and database-level
verification.

Date: 29 July 2026

## Scope

Phase 2A establishes the authorization and tenancy foundation required by the
future School Home. It does not replace the current teacher dashboard, build
parent subscriptions, implement spreadsheet onboarding, or add whole-school
analytics.

## Deployed-Schema Verification

The linked Supabase project is `dqncplrxjxvjqbmwcyia`.

The deployed PostgREST OpenAPI schema was fetched with a read-only request on
29 July 2026. It confirmed these deployed tenant-related tables:

- `schools`
- `school_memberships`
- `classes`
- `students`

It did not expose:

- `user_profiles`
- `platform_roles`
- `academic_years`
- `class_staff_memberships`
- `school_invitations`
- `class_enrollments`

The deployed `school_memberships` surface contained only `school_id`,
`user_id`, `role`, `status`, and `created_at`. The deployed RPC surface still
included `create_class_for_teacher`.

The linked direct PostgreSQL connection repeatedly timed out while
initialising the login role. Consequently, deployed `pg_policy`,
`information_schema.role_table_grants`, and function-definition rows could not
be enumerated directly. Migration history and the deployed OpenAPI surface
agree on the material drift, but policy/grant parity must be checked against
the deployed catalogs after these migrations are applied. This limitation is
recorded rather than treating migration files as proof of production state.

## RLS Drift

Repository migration history contained these unsafe or obsolete patterns:

- parents could insert and update legacy `progress`;
- authenticated users could self-insert a legacy `user_roles` row;
- `teachers` had previously been left without RLS and broadly granted;
- an all-readable class policy exposed classes rather than requiring a secure
  lookup command;
- class and student access primarily depended on `classes.teacher_id` and
  `students.class_id`;
- `create_class_for_teacher` could create an active school from unmatched free
  text and promote the educator to `school_admin`.

Phase 2A removes or supersedes those paths.

## Migrations

### `20260729110000_school_authorisation_tenancy_foundation.sql`

Creates or hardens:

- `user_profiles`
- `platform_roles`
- `schools`
- `school_memberships`
- `school_invitations`
- `academic_years`
- `classes.academic_year_id`
- `students.school_id`
- `class_enrollments`
- `class_staff_memberships`
- `student_staff_assignments`
- `school_audit_log`

It removes parent insert/update policies on `progress`, removes self-service
legacy role insertion, enables RLS on `teachers`, and replaces broad class and
student policies with school-scoped policies.

### `20260729111000_school_authorisation_commands.sql`

Creates:

- `school_command_receipts`
- `platform_command_receipts`
- immutable command audit writes
- school access audit writes
- protected school creation and activation
- protected staff invitation and invitation acceptance
- protected school role changes
- protected class creation
- protected class staff assignment and revocation

## Permission Helpers

The following `SECURITY DEFINER` helpers use `set search_path = public`, have
explicit grants, require active membership, and avoid querying through their
own policies:

- `is_platform_admin()`
- `has_school_role(uuid, text[])`
- `can_view_school(uuid)`
- `can_manage_school(uuid)`
- `can_view_class(uuid)`
- `can_manage_class(uuid)`
- `can_view_student(uuid)`
- `can_manage_student(uuid)`
- `can_view_student_learning(uuid)`
- `can_override_student_progress(uuid)`

Additional compatibility/capability helpers:

- `can_create_school_student(uuid)`
- `is_school_member(uuid)`
- `can_manage_student_progress(uuid)`
- `get_school_access_context(uuid)`

Role behavior:

- school administrators manage all school resources;
- principals receive whole-school read access but no implicit technical
  administration;
- teachers see all active school classes but manage only assigned classes;
- support staff see only assigned classes and/or students;
- revoked staff fail active-membership checks;
- parents and students receive no school route access;
- platform owner/admin access comes only from active `platform_roles`;
- platform school-page access writes an immutable audit row.

## Command Boundary

Protected commands:

- `create_school`
- `activate_school`
- `invite_school_staff`
- `accept_school_invitation`
- `change_school_member_role`
- `create_class`
- `assign_class_staff`
- `revoke_class_staff`

Class creation and invitations use idempotency receipts. Commands validate
tenant membership and resource status, prevent removing the final school
administrator or final class lead, and append immutable audit records.

The compatibility `create_class_for_teacher` RPC remains available to the
current dashboard. It now requires an exact active school membership and a
configured academic year. It cannot create a school.

## Compatibility

Retained temporarily:

- `classes.teacher_id` as the current lead-teacher projection;
- `classes.academic_year` beside canonical `academic_year_id`;
- `students.class_id` as the primary-homeroom projection;
- existing teacher dashboard routes and components;
- the compatibility class-creation RPC.

Educator signup no longer creates an unscoped class. New educators receive an
identity/profile and must be invited into a platform-created school.

## Route Protection

`/school/[schoolId]` is a server component protected by:

1. `SCHOOL_PLATFORM_PREVIEW_ENABLED=true` or development mode;
2. a verified Supabase access token held in an HttpOnly, same-site cookie;
3. an active canonical `user_profiles` adult account;
4. `get_school_access_context` for the requested school;
5. an immutable access audit record.

`/api/school-preview-session` exchanges an already authenticated browser
Bearer token for the short-lived HttpOnly preview cookie. The current
`/teacher/dashboard` remains the default educator destination.

## Security Tests

`supabase/tests/phase2a_school_authorisation.sql` covers:

- school administrator access;
- principal whole-school read/no technical management;
- teacher school-class visibility and assigned-class management;
- cross-school denial;
- support staff class and student assignment boundaries;
- parent denial;
- student denial;
- revoked staff denial;
- explicit platform administrator access and access auditing;
- removal of parent progression writes;
- denial of direct authenticated school creation.

`scripts/school-platform-phase2a-audit.mjs` statically verifies the migration,
command, route-guard, feature-flag, and signup invariants.

## Validation Results

Local implementation validation completed on 29 July 2026:

- Phase 2A static audit: 21/21 checks passed.
- TypeScript (`npx tsc --noEmit`): passed.
- Production build (`npm run build`): passed.
- Teacher week-tally regression: 13/13 checks passed.
- Teacher progress-override regression: 16/16 checks passed.
- Class-creation pgcrypto regression: passed.
- Pre-test pathway regression: passed.
- Canonical progression audit: 22/23 checks passed. The remaining failure is
  the existing Number Nexus source assertion that expects
  `restoreStudentStateFromServer(studentId, "number")` in
  `app/number-nexus/page.tsx`; Phase 2A does not modify that production route.
- SQL role matrix: authored but not executed locally because Docker is not
  available and the linked PostgreSQL connection timed out while initialising
  the login role.
- Deployed policy/grant/function verification: required after migration
  deployment for the same connectivity reason.

## Deployment Requirements

1. Apply both Phase 2A migrations in timestamp order.
2. Seed the first `platform_owner` through a service-role/admin operation.
   Ordinary authenticated users cannot bootstrap platform privilege.
3. Run `supabase/tests/phase2a_school_authorisation.sql` against a disposable
   environment.
4. Inspect deployed `pg_policies`, grants, and function definitions.
5. Exercise every command with two schools before enabling the preview flag.
6. Enable `SCHOOL_PLATFORM_PREVIEW_ENABLED` only for approved reviewers.

## Recommended Phase 2B

Phase 2B should build the Educator Platform on this foundation:

1. read-only School Home shell using the protected route;
2. school switcher for adults with multiple memberships;
3. staff directory and invitation acceptance;
4. role/permission management through the audited commands;
5. academic-year selection;
6. class list and class creation through `create_class`;
7. class staffing through assign/revoke commands;
8. controlled migration of teacher-dashboard reads to canonical memberships;
9. deployed command/RLS validation before removing compatibility fallbacks.

Student import, school student pool workflows, rollover, parent linking UI,
licences, subscriptions, and whole-school analytics remain outside Phase 2B
unless separately approved.
