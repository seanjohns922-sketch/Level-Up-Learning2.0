# School Platform Phase 2B-1

Status: Implemented as a protected preview. Production educator entry remains
the current teacher dashboard.

Date: 29 July 2026

## Scope

Phase 2B-1 adds the first visible School Home at:

`/school/[schoolId]`

It is additive and remains behind development mode or
`SCHOOL_PLATFORM_PREVIEW_ENABLED=true`. It does not change student routes,
replace the educator landing route, implement imports or rollover, add parent
linking, introduce licensing, or invent whole-school analytics.

## Protection

Every School Home page load:

1. verifies the feature flag;
2. reads the short-lived HttpOnly school-preview access cookie;
3. verifies the Supabase user and active canonical adult profile;
4. resolves active school access through `get_school_access_context`;
5. records the school access in the immutable audit log;
6. loads the requested tenant through `get_school_home_snapshot`.

Editing a school identifier in the URL cannot grant access. Switching schools
uses a full tenant URL navigation so the previous School Home component and
its in-memory data are discarded.

## School Home

The preview contains:

- school identity, signed-in educator, canonical role and school switcher;
- current academic-year selector;
- unique active student, class, educator and invitation totals;
- My Classes from active `class_staff_memberships`;
- all active school classes;
- real school audit activity;
- functional Classes and Staff areas;
- a read-only Students entry point;
- an Insights placeholder;
- a role-controlled Administration placeholder.

Class and student counts come from canonical active enrolments. Academic-year
selection filters the visible classes but is not stored as progression or
browser authority.

## Commands

The client never inserts or updates school authorization tables directly.
`/api/school/[schoolId]/command` reauthorizes the school on the server and
dispatches only audited RPCs:

- `create_class`
- `assign_class_staff`
- `revoke_class_staff`
- `invite_school_staff_with_class`
- `resend_school_invitation`
- `revoke_school_invitation`
- `change_school_member_role`
- `deactivate_school_member`

Create Class accepts the academic year, year levels, lead teacher and optional
co-teachers. The class opens only through the protected compatibility route.
Invitation tokens remain server-side and are never returned to the School Home
client.

The current database command layer creates and renews one-time invitations.
Actual email delivery is not present in the repository and remains an external
integration requirement; the UI never exposes the token as a substitute.

## Class Compatibility

`/school/[schoolId]/classes/[classId]` reauthorizes both the school and class,
then opens the existing dashboard with a protected class scope. In this mode:

- the page heading is the class name;
- the requested class is loaded through tenant-aware RLS;
- unassigned class management remains denied by canonical permissions.

Opening `/teacher/dashboard` normally retains its existing lead-teacher class
query and remains the production default.

## Permission Behaviour

- School administrators can manage school staff and all classes.
- Principals have school-wide read access. Class creation remains controlled
  by the explicit `can_create_classes` capability.
- Teachers can view all active school classes, create classes under the
  current school policy, and manage assigned classes only.
- Support staff can see the school class directory but can open only class
  learning data granted by canonical assignments.
- Parents, students and revoked staff cannot load School Home.
- Cross-school identifiers are rejected.
- Platform administrator access remains explicit and audited.

## Validation

Automated checks:

- `npx tsc --noEmit`
- `npm run build`
- `npm run qa:school-platform-phase2a`
- `npm run qa:school-platform-phase2b1`
- `supabase/tests/phase2a_school_authorisation.sql`

The pgTAP role matrix now includes School Home snapshot isolation, unique
student totals, principal capabilities, support-class access, and denial for
cross-school, parent, student and revoked users.

## Phase 2B-2

The next phase may migrate the class dashboard into a clean class-specific
route and remove remaining generic Teacher Dashboard wording and lead-teacher
compatibility assumptions. It must not begin until this preview has been
deployed and manually reviewed with real school roles.
