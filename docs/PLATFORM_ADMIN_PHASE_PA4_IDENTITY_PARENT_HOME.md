# Platform Admin Phase PA4: Identity, Parent and Home Access

## Identity invariant

PA4 makes one canonical child identity the permanent owner of learning history. School membership, class enrolment, parent relationships and Home access are independent relationships or entitlements attached to that identity.

```text
Canonical child identity
  -> school membership history
  -> class enrolments
  -> parent relationships
  -> school and Home entitlements
  -> progression, assessments and rewards
```

A school transfer, parent link or access change must not create a replacement child or move progress into a new identity.

## Parent linking

Parents preview an existing child through the permanent Explorer Code, then confirm the link with the child's current 4-digit access PIN. Preview responses reveal only the minimum confirmation details: first name, last initial, year level and school. Invalid codes, unknown codes and incorrect PINs use neutral responses, attempts are rate limited and audited, and clients cannot enumerate student records.

Verified links complete automatically. Manual queues are reserved for recovery or duplicate cases that cannot be resolved safely from the verified code.

Multiple parents can link to one child and one parent can link to multiple children. Every parent query rechecks the active relationship and cannot be widened by changing a route parameter.

## Home Access

Parent relationship and Home entitlement are separate facts. Free 2026 Home access is an active `student_access_entitlements` row with `access_source = home` and `billing_status = free`. No payment provider, checkout or subscription is implemented in PA4.

Ordinary parent learning access is read-only. It displays canonical progression, lesson attempts, weekly quizzes and assessments for each linked child. Number Nexus, Measurelands and Starpath use the same canonical data and 85% mastery threshold as the student program. Required weeks come from `student_realm_progress`; the parent UI does not hardcode realm lengths.

### New Home families

An authenticated parent can create a Home-only learner through one audited server transaction. The command creates one canonical student identity, the parent relationship, free 2026 Home entitlement, permanent Explorer Code, generated username, PIN credential and initial realm placement. The parent supplies the school year and a guided starting working level. Year 1-6 learners enter the pre-test; Prep learners enter Ground Level.

Home-only parents can view login details, reset the PIN, adjust a starting level before canonical learning begins and reopen a pre-test before lessons, quizzes or a post-test exist. PIN reset revokes existing student sessions. Pre-test reopening records an append-only event and preserves previous assessment snapshots; superseded attempts no longer control the active journey.

These management permissions end automatically when an active school entitlement, school membership or class enrolment exists. The authorised teacher or school then controls PIN resets, placement and assessment resets. The parent retains read access and the independent Home entitlement. Home students sign in with username and PIN without a class code; that Home login remains available after school linkage.

## School transfer

School operators must choose **Create new student** or **Link existing student**. New creation runs a duplicate preview. A plausible match blocks creation until the operator links the existing child or explicitly records that the child is different.

Linking an existing child records membership and transfer history while preserving:

- `students.id` and Explorer Code
- parent relationships and Home access
- lesson, quiz and assessment evidence
- current progression and targeted weeks
- XP, Gems, Cards, Realmies, inventory and avatar state

Historical reporting belongs to the school and class relationship active when the learning event occurred. A transfer changes current access; it does not rewrite prior class IDs, attempt timestamps or historical membership dates. Reporting resolves school ownership from the event's class enrolment or school membership dates, so the previous school retains its authorised history and cannot see learning completed under the new school.

## Duplicate handling

Similar names are never auto-merged. Only the platform owner can merge confirmed duplicate identities. The Identity Centre exposes pending parent/recovery links, potential duplicates, pending school links, pending merges, retired identities and recent transfers.

A merge requires a selected survivor, selected duplicate, reason, conflict preview and separate final review reason. Automatic approval is allowed only when each protected domain is populated on one identity at most. If both identities contain learning, economy, rewards, parent links, Home access, school access, school membership or class-enrolment state, the request fails closed until a Platform Owner resolves that domain explicitly. Successful one-sided merges revoke every duplicate student session and credential before the duplicate remains as an auditable retired record pointing to the survivor.

## Merge recovery

Merges are not reversible in the interface:

1. Stop writes to the affected identities.
2. Record the merge request and audit event IDs.
3. Restore a point-in-time backup into an isolated project.
4. Compare the survivor, duplicate and immutable audit records.
5. Apply a reviewed corrective migration if required.
6. Re-run PA1-PA4 audits and verify with the parent and school.

## Security Boundaries

- RLS remains enabled on identity and relationship tables.
- Direct authenticated table access is revoked for PA4 control tables.
- Narrow `SECURITY DEFINER` RPCs use a fixed search path and recheck role or relationship access.
- Parents cannot mutate learning evidence, progression or rewards.
- School operators cannot perform identity merges.
- Platform ownership is never inferred from an email address or client metadata.

## Release and Manual QA

Apply these migrations in order:

1. `supabase/migrations/20260812100000_platform_admin_pa4_identity_parent_home.sql`
2. `supabase/migrations/20260812110000_platform_admin_pa4_safety_hardening.sql`
3. `supabase/migrations/20260812120000_platform_admin_pa4_parent_read_write_boundary.sql`

Then run:

```bash
npx tsc --noEmit
npx eslint app/parent components/parent app/admin/identity components/admin/IdentityCentreClient.tsx
npm run qa:platform-admin-pa1
npm run qa:platform-admin-pa2
npm run qa:platform-admin-pa3
npm run qa:platform-admin-pa4
npx supabase test db supabase/tests/platform_admin_pa4_safety.sql
```

### Manual QA

| Scenario | Expected result |
| --- | --- |
| Home Only to School + Home | The student ID and Home entitlement remain unchanged after the school link. |
| School A to School B | Membership dates change while historical attempts and the Explorer Code remain intact. |
| Multiple parents | Both authorised parents independently see the same child. |
| Multiple children | A parent switches children without data crossing between them. |
| Duplicate prevention | A plausible match blocks silent creation and requires link-existing or explicit override. |
| Merge integrity | Protected-domain conflicts fail closed; an approved one-sided merge preserves canonical state and retires all duplicate access. |
| Conflicting duplicate | Approval is unavailable and the RPC rejects the merge without changing either identity. |
| One-sided duplicate | State moves to the survivor, all duplicate sessions and credentials are revoked, and the duplicate is retired. |
| Parent verification | Explorer Code preview alone does not link a child; the current 4-digit PIN is also required. |
| Mobile parent portal | Child cards and realm details fit at 375px and 768px without horizontal scrolling. |

Also verify parent route tampering, direct parent write denial and neutral empty states.
