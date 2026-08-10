# Platform Admin Phase PA2: School Lifecycle

## Purpose

PA2 gives the canonical `platform_owner` one controlled path to provision, edit, pause, archive and restore schools. It extends PA1 and does not change student identity, progression, assessment, reward, parent or school/home architecture.

## Status Model

The school row records operational state:

- `active`: normal school access is available. Both Trial and Active licences use this operational state.
- `suspended`: the school is current but temporarily paused.
- `archived`: the school is historical and unavailable for ordinary operation.

The licence independently records `trial`, `active`, `paused`, `archived` or `expired`. Only a canonical lifecycle command changes both records.

## Provisioning

`platform_owner_provision_school` atomically creates the school, explicit academic year, licence, optional initial administrator assignment or invitation, command receipt and audit event. School codes are strictly unique. Similar names are reported for review but do not block creation.

The command never creates, accepts, stores or displays a password. An existing active adult profile receives an active `school_admin` membership without losing other memberships. A new email receives a pending record in the existing `school_invitations` table. Until email delivery is connected the UI reports `Invitation created; email delivery unavailable`.

## Editing And Seats

Ordinary school details and licence access are separate commands. Changing a school code requires a reason and creates a dedicated audit event. Seat limits cannot be reduced below active school entitlement usage; no students are removed automatically.

## Pause

Pause retains identities, memberships, enrolments, history and licence details. The school becomes operationally suspended and active school student entitlements are placed on a reversible lifecycle hold. Normal school access, enrolments and invitations are blocked. Home access is unchanged.

## Archive

Archive requires a reason. It:

- marks the school and licence archived;
- places school access entitlements on a reversible hold;
- makes only that school's active staff memberships inactive;
- revokes pending invitations;
- blocks new enrolments, invitations and normal school access;
- hides the school from the default All Current list.

Archive never deletes students, adult accounts, enrolments, attempts, progression, assessments, Explorer Codes, parent links, home entitlements or audit history. A student with active Home access remains Home Only while school access is archived. Staff memberships at other schools are untouched.

Archived schools remain available through the dedicated Archived filter and their read-only detail view, but never appear in the default All Current list.

## Restore

Restore requires confirmation, a Trial or Active licence state, and valid current dates. It reactivates only records held by the lifecycle command, preserves canonical IDs, and does not insert duplicate students or memberships. Restoration is blocked when held school usage exceeds the seat limit.

## Administrator Management

Platform Owner can add an existing administrator, create a pending invitation, resend or revoke an invitation, deactivate a membership and restore it. Deactivating the final active administrator requires explicit confirmation and produces an attention warning.

## Security And Audit

All PA2 commands are `SECURITY DEFINER`, use a fixed `search_path`, and re-check `is_platform_owner()`. Direct frontend table mutation is not used. Lifecycle guards enforce school state at enrolment and invitation boundaries.

Immutable Platform Admin audit events include school creation and edits, code changes, seat changes, pause/reactivation, archive/restore, and administrator invitation/membership changes.

## Deployment

Apply `20260811130000_platform_admin_pa2_school_lifecycle.sql`, then deploy the application. Run `npm run qa:platform-admin-pa2`, TypeScript, ESLint and the production build before promoting PA2.
