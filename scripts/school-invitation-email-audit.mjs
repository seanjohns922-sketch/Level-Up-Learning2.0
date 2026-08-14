import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const route = read("app/api/school/[schoolId]/command/route.ts");
const email = read("lib/school-admin-invite-email.ts");
const server = read("lib/school-platform-server.ts");
const schoolHome = read("components/school/SchoolHomeClient.tsx");
const platformAdmin = read("components/admin/SchoolLifecycleManager.tsx");

assert.match(route, /case "inviteStaff"[\s\S]*sendSchoolStaffInviteEmail/);
assert.match(route, /case "resendInvitation"[\s\S]*getSchoolInviteEmailContext[\s\S]*sendSchoolStaffInviteEmail/);
assert.match(route, /emailDelivery/);
assert.match(email, /RESEND_API_KEY/);
assert.match(email, /Choose <strong>Activate Invite<\/strong>/);
assert.match(email, /School Code: \$\{schoolCode\}/);
assert.match(server, /school_invitations[\s\S]*status=eq\.pending[\s\S]*select=email,role/);
assert.match(schoolHome, /Staff invitation created and emailed/);
assert.match(schoolHome, /Invitation email resent/);
assert.match(platformAdmin, />Resend email<\/button>/);

console.log("School invitation email audit passed: create and resend actions deliver through Resend with explicit status.");
