# RELIQ security follow up after program completion

Saved on 5 October 2026 at the user's request. Revisit when the program is finished, expected in a few weeks. No exact date or automatic reminder has been scheduled. Security implementation is deferred; this document does not establish that the current production system is secure.

## Starting assessment

The October code review found adult authentication, student session checks, school and role permissions, parent linking checks, audit records and duplicate completion protections. It was not a penetration test or a verification of deployed settings.

The inspected school and home login functions compare stored PINs directly. Student login attempt limits were not found in those functions. Student session tokens expire after 30 days and are stored in browser localStorage. Production MFA enforcement, database permissions, backups, restore capability and monitoring remain unverified. Recheck these findings against the current code and production configuration when this work resumes.

## Recommended work in order

- [ ] Begin with a read-only production security audit. Inventory exposed tables, views, functions, storage, permissions and authentication settings without exporting unnecessary student information.
- [ ] Protect student login with server-side attempt limits, temporary cooldowns and monitoring. Ensure direct API calls cannot bypass controls. Improve PIN storage using an appropriate credential-hashing design; hashing alone is insufficient for short PINs. Preserve existing student access and prepare a migration and rollback plan.
- [ ] Verify and enforce appropriate MFA for platform owners and school administrators. Secure the GitHub, Vercel and Supabase owner accounts and review recovery access.
- [ ] Test anonymous, student, parent, teacher, school-admin and platform-owner access with controlled accounts. Verify rejection of cross-student and cross-school requests, including direct database/API requests that bypass the interface. Review parent linking and account recovery too.
- [ ] Review reports, exports, recordings, file storage, secrets, dependency vulnerabilities, browser protections and session handling. Verify that logs do not expose credentials or unnecessary student information.
- [ ] Verify backup coverage and retention, perform a safe restore test, configure suspicious-activity alerts and document incident-response steps.
- [ ] Arrange an independent penetration test before substantial expansion to more schools, after addressing known weaknesses.

## Release safeguards

Keep trial schools working. Do not reset student accounts, change IDs or Explorer Codes, erase progress, or make rushed production changes. Develop and test separately, then deploy with a reviewed rollback plan.

Student RPCs run as Supabase anon with a validated x-student-session header. Preserve explicit anon/authenticated EXECUTE grants and access guards. Test with an actual valid student session and reject missing or cross-student sessions. Roll back all test fixtures; postgres-role checks alone are insufficient.

Record evidence for each check, distinguish code inspection from live verification, and track unresolved findings. Do not describe RELIQ as fully secure or security audited without evidence supporting that claim.

## First deliverable when resumed

A read-only production security findings report and a tested student-login hardening patch, with compatibility checks and a rollback plan before production release.

## Reference guidance

- [OWASP authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Supabase data security guidance](https://supabase.com/docs/guides/database/secure-data)
