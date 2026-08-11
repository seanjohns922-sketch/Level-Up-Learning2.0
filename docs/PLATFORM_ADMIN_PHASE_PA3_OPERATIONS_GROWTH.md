# Platform Admin Phase PA3: Operations and Growth

## Scope

PA3 upgrades `/admin`, `/admin/users`, `/admin/growth`, `/admin/growth/home-only`, and `/admin/analytics`. It is read-only operational intelligence built on PA1 identity/entitlement/licence records and PA2 school lifecycle controls. It adds no billing, marketing, progression, reward or impersonation pathway.

## Snapshot architecture

- `/admin` performs one `get_platform_admin_operations_snapshot` aggregate read.
- `/admin/growth` performs one `get_platform_admin_growth_snapshot` aggregate read.
- `/admin/growth/home-only` performs one `get_platform_admin_home_only_snapshot` aggregate read and remains separate from the school conversion funnel.
- `/admin/analytics` performs one `get_platform_admin_engagement_snapshot` aggregate read.
- `/admin/users` performs one filtered, server-paginated `search_platform_admin_users` read. Search is debounced by 300 ms and capped at 100 records per page; the UI requests 25.
- Detail routes lazily request one student or adult snapshot. Student progression is realm scoped and never falls back across realms.

All platform RPCs are `SECURITY DEFINER`, use a fixed `public` search path, require `is_platform_owner()`, revoke anonymous/public execution and expose no authentication secrets.

## Canonical activity

A student is active in a period when at least one of these canonical records exists in the period:

1. `student_lesson_attempts` with `completed = true`.
2. `student_weekly_quiz_attempts` completion/attempt.
3. `student_realm_assessments` attempt.

Heartbeats, telemetry, page views, logins and educator profile views never count. Today, 7-day and 30-day boundaries use `Australia/Melbourne`, including the next local midnight rather than UTC dates.

## KPI contracts

- Canonical Students: unique active student identities.
- School Only: active school entitlement and no active home entitlement.
- School + Home: both active entitlements; still one student.
- Home Only: active home entitlement and no active school entitlement.
- Inactive/Historical: no current active identity/access representation, surfaced separately.
- Parent Link Rate: school students with at least one active parent link divided by active school students.
- Home Activation Rate: school students with active Home access divided by active school students. Home Only students are excluded.
- Parent Linked / No Home: school students with an active parent relationship and no active Home entitlement.

`billing_status = free` is normal for the 2026 rollout and never represents delinquency or paid conversion.

## User Explorer

The explorer searches student names, usernames, exact normalized Explorer Codes, parent names/emails and educator names/emails. Server-side filters cover user type, access or parent-link state, school and activity. Results retain canonical IDs so duplicate names are safe. Educator school memberships are not collapsed. Student detail shows identity, access context, linked parents, last meaningful activity and each canonical realm progress row. Missing realm data displays `Not placed`; it is never inferred as Week 1 or copied from another realm.

No password, PIN, credential secret, token, payment field, export or progression control is exposed.

## School engagement

The engagement table reports active students and active percentage over 7 days, lessons and quizzes over 7 days, assessments over 30 days, lessons per active student and last meaningful activity.

Initial configurable contract values returned with the snapshot:

- Strong: at least 60% active in 7 days.
- Healthy: at least 30% active in 7 days.
- Low: recent activity below 30%.
- Inactive: no meaningful activity for 30 days.

These are operational starting thresholds, not claims of educational impact. They can be revised centrally in the snapshot contract after real usage evidence is reviewed.

## Attention Centre

Signals are derived server-side for seat use above 90%, no meaningful activity for 14 days, zero active administrators, a dated trial ending within 30 days, low parent linking and Parent Linked / No Home opportunity. Archived schools are excluded from normal alerts. Positive opportunity is labelled Positive, not rendered as a warning. Missing data does not manufacture alerts.

Recent Changes combines platform audit records, active parent links and Home activations. Raw learning telemetry is excluded.

## Performance and indexes

PA3 never downloads all students to calculate a dashboard and never executes a per-school request loop. Aggregate pages have one data RPC each; the user directory has one paginated RPC; detail is lazy.

Added indexes are query-backed:

- Canonical lesson completion timestamp + student, partial on completed rows.
- Weekly quiz completion timestamp + student.
- Assessment completion timestamp + student.
- Active parent link student + linked timestamp.
- Trigram profile email and display-name indexes for user lookup.
- Trigram student display-name and username indexes for user lookup.

The existing unique normalized Explorer Code index, school membership indexes and entitlement segment/school indexes are reused. Cross-request caching is intentionally disabled because snapshots contain restricted platform-wide information. Each private dashboard makes one aggregate RPC, and route skeletons improve perceived performance without serving one owner's data to another session.

### Performance audit status

| Route | Server reads | Sequential waterfall | N+1 risk | Pagination |
| --- | ---: | --- | --- | --- |
| `/admin` | 1 aggregate RPC | None | None | Not applicable |
| `/admin/users` | 1 search RPC | None | None | Server-side, 25 rows in the UI, 100 maximum |
| `/admin/growth` | 1 aggregate RPC | None | None | Not applicable |
| `/admin/analytics` | 1 aggregate RPC | None | None | Not applicable |

Runtime payload bytes and database execution times must be measured after the migration is applied against production-like data. They are not invented from source inspection. The PA3 audit rejects client-side directory downloads and verifies the aggregate-read, pagination and query-backed index contracts.

Home Only school association is not displayed because the current canonical schema has no voluntarily supplied school-association field for those learners. PA3 does not infer one from location, IP address, surname or email domain.

## Future boundaries

PA3 preserves identity → entitlement → billing readiness for 2027 but does not build Home Trial, Paid Home, checkout, subscriptions, MRR, ARR, churn, outreach or CRM. Future school-hours entitlement enforcement is documented only and is not active.

## Deployment

1. Apply `20260811170000_platform_admin_pa3_operations_growth.sql`.
2. Run `npm run qa:platform-admin-pa3`, PA1/PA2 audits and the frozen-system regressions.
3. Deploy the application.
4. Verify `/admin`, `/admin/users`, `/admin/growth`, `/admin/growth/home-only`, `/admin/analytics` with a platform owner and confirm school roles are denied.
