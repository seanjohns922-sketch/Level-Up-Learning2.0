# Level Up Learning Platform Admin Master Architecture

## Purpose

Platform Admin is the business and platform control centre above school administration. It provides legitimate cross-school visibility without reusing a school role or weakening school tenancy rules.

The permanent model is:

```text
Identity
  -> Entitlement
    -> Billing classification
```

The model supports the free 2026 rollout and later paid access without migrating student identities.

## Role Hierarchy

- `platform_owner`: fully implemented in PA1. Cross-school access is granted only by an active row in `platform_roles` and an active `user_profiles` record.
- `platform_admin`: reserved for a future delegated platform role. It is deliberately denied from PA1 owner routes.
- `school_admin` and `principal`: remain school-scoped through existing memberships and permission helpers.
- `teacher`: remains restricted to authorised school, class and student relationships.
- `parent`: remains restricted to actively linked children.
- `student`: remains restricted to their own canonical session and learning data.

The owner role is never inferred from email, URL, query parameters, browser storage, editable user metadata or school membership. `/admin` uses an HTTP-only session token and every database read or command re-checks `is_platform_owner()`.

## Canonical Student Identity

`students.id` remains the single child identity. PA1 does not recreate students, alter IDs, replace enrolments, change Explorer Codes or duplicate parent relationships.

A child can have school access, home access or both through `student_access_entitlements`. Progression, assessment history, XP, Gems, Cards, Realmies, avatar, streaks and Explorer Code remain attached to the same student.

## Entitlements

### School

`school_licence_entitlements` defines annual school access:

- school and academic year
- access status
- seat limit
- start and end dates
- billing classification
- optional commercial values and internal notes

`student_access_entitlements` materialises school access from canonical active class enrolments. A trigger keeps entitlement state aligned when enrolments are created, ended or archived. Existing students are backfilled as `billing_status = free` for the current rollout.

Seat use counts distinct active student identities. Reducing a limit below active usage raises an error and never removes child access.

### Home

Home access is an explicit `student_access_entitlements` row with `access_source = home`. PA1 does not fabricate home access from a parent link. Free 2026 access is represented by:

```text
access_source = home
status = active
billing_status = free
```

### Parent Relationships

`parent_student_links` records relationships only. Parent linked, home entitled and paid are independent facts. A linked parent can exist without home access.

### Explorer Code Linking

Existing Explorer Codes remain the future linking mechanism. Linking must resolve an existing student first, create the parent or school relationship, then add the relevant entitlement. It must never create a second child identity when a canonical student already exists.

## Billing Readiness

Billing is a classification on entitlement, not an identity source. Supported classifications are `free`, `trial`, `paid`, `complimentary` and `expired`.

Nullable fields prepare home access for a later provider and subscription reference. No provider IDs, checkout, webhooks or payment records are fabricated in PA1. MRR, paid conversion and churn remain labelled `Not active yet`.

## Segmentation

Segments are derived from current active entitlements:

- School Only: active school, no active home.
- School + Home: active school and active home.
- Home Only: active home, no active school.
- Inactive / Historical: neither active school nor active home.

Counts group by `student_id`, so dual-access students count once in total students. Parent-linked/no-home is derived separately.

## School to Home Funnel

The 2026 funnel is:

```text
School students -> Parents linked -> Home access activated
```

It is called Home Activation, not paid conversion. Future home-to-school opportunity must remain aggregate, use only voluntarily supplied school associations and must not expose children as marketing leads.

## Audit History

`platform_admin_audit_log` records actor, action, entity, before/after state, optional reason and timestamp. Database triggers reject updates and deletes. Owner commands record school creation and licence changes, including seat, status, dates and billing classification.

## Performance

Platform overview and school list are separate server-side aggregate RPCs and load in parallel. They do not fetch student rows or progression payloads into the browser. School detail is lazy-loaded by route. Activity uses canonical attempt aggregates and avoids query-per-school requests.

## Privacy and Security

- RLS remains enabled on all new tables.
- Direct table access is revoked from authenticated clients.
- Only narrow `SECURITY DEFINER` RPCs are executable.
- Every RPC uses a fixed `search_path` and checks the owner role.
- School tenancy functions remain unchanged.
- Admin growth views are aggregate-only.

## Future Extension

The same identity and entitlement records support delegated platform admins, paid home subscriptions, paid school classifications, conversion reporting and aggregate home-to-school opportunities. These additions must not migrate student IDs or convert billing into an access identity.

## PA2 School Lifecycle

PA2 adds canonical school provisioning and lifecycle commands. Trial and Active are licence states on an operational school; Paused and Archived stop ordinary school access. Archive preserves all identities, history, parent relationships and Home access while placing only school entitlements and that school's memberships on reversible holds. Archived schools are hidden from the default Platform Admin list and remain available through the dedicated Archived filter and historical detail route.
# PA3 operational intelligence

PA3 is the read-only operational layer above PA1 access foundations and PA2 school lifecycle management. Its canonical activity definition, aggregate snapshot architecture, User Explorer, growth denominators, attention rules and performance boundaries are defined in `PLATFORM_ADMIN_PHASE_PA3_OPERATIONS_GROWTH.md`.

The PA3 layer must remain platform-owner only. It must not introduce billing, marketing automation, exports, impersonation, progression controls or reward mutation paths.

## PA4 Identity, Parent and Home Access

PA4 makes `students.id` the permanent child identity across Home access, parent relationships, school links and school transfers. Access and relationships may change; learning history, Explorer Code continuity, assessments and rewards remain attached to the canonical child.

Parents receive read-only access to actively linked children. Schools explicitly choose between creating a new identity and linking an existing identity. Duplicate candidates are blocked from silent creation, and only the platform owner can merge confirmed duplicates through a previewed and audited workflow.

Historical school reporting follows the school and class relationships active when each event occurred. Transfers preserve prior evidence and do not grant the previous school access to future learning.

The full identity invariant, Home entitlement rules, parent security boundary, transfer behavior, merge recovery process and release checks are defined in `PLATFORM_ADMIN_PHASE_PA4_IDENTITY_PARENT_HOME.md`.
