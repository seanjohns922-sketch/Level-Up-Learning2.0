// Runs the real School Home command route against a fake PostgREST, so no
// database or network is needed. Covers class creation, removal, archive and
// restore, and void RPCs (which PostgREST answers with an empty body).
import assert from "node:assert/strict";
import fs from "node:fs";

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://postgrest.test";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
delete process.env.RESEND_API_KEY;

const SCHOOL = "11111111-1111-4111-8111-111111111111";
const ADMIN = "22222222-2222-4222-8222-222222222222";
const TEACHER = "33333333-3333-4333-8333-333333333333";
const CLASS = "44444444-4444-4444-8444-444444444444";

let handlers = {};
let calls = [];
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const empty = () => new Response(null, { status: 204 });
const pgError = (message, status = 400) => json({ message }, status);

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  assert.equal(url.origin, "http://postgrest.test", `unexpected network call to ${url.origin}`);
  const key = `${init.method ?? "GET"} ${url.pathname}`;
  calls.push({ key, url, body: init.body ? JSON.parse(init.body) : null });
  if (key === "GET /auth/v1/user") return json({ id: ADMIN, email: "admin@school.test" });
  if (key === "GET /rest/v1/user_profiles") return json([{ status: "active" }]);
  if (key === "POST /rest/v1/rpc/get_school_access_context") return json([{ school_id: SCHOOL, role: "school_admin" }]);
  if (key === "POST /rest/v1/rpc/record_school_access") return json(1);
  const handler = handlers[key];
  assert.ok(handler, `no fake response for ${key}`);
  return handler({ url, body: init.body ? JSON.parse(init.body) : null });
};

const { POST } = await import("../app/api/school/[schoolId]/command/route.ts");

async function run(payload, setup) {
  handlers = setup;
  calls = [];
  const response = await POST(
    new Request(`http://app.test/api/school/${SCHOOL}/command`, {
      method: "POST",
      headers: { Authorization: "Bearer test-token", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    { params: Promise.resolve({ schoolId: SCHOOL }) },
  );
  return { status: response.status, body: await response.json() };
}

const createPayload = {
  action: "createClass",
  name: "5B",
  classCode: "5BABC",
  academicYearId: "year-2026",
  leadTeacherId: TEACHER,
  coTeacherIds: [],
  idempotencyKey: "request-1",
};
const staffing = {
  "POST /rest/v1/rpc/create_class": () => json(CLASS),
  "POST /rest/v1/rpc/assign_class_staff": () => json("membership"),
  "POST /rest/v1/rpc/revoke_class_staff": () => empty(),
};

// 1. A class made for another teacher finishes cleanly even though the final
//    revoke_class_staff call returns void (an empty 204 body).
{
  const result = await run(createPayload, staffing);
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.deepEqual(result.body, { classId: CLASS });
  const createCall = calls.find((call) => call.key === "POST /rest/v1/rpc/create_class");
  assert.equal(createCall.body.p_idempotency_key, "request-1");
}

// 2. If staffing fails after the class exists, the route still returns the
//    class, so the admin is never invited to press Create again.
{
  const result = await run(createPayload, {
    ...staffing,
    "POST /rest/v1/rpc/revoke_class_staff": () => pgError("Active class staff assignment not found"),
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.classId, CLASS);
  assert.match(result.body.staffingError, /assignment not found/);
}

// 3. A code clash with an archived class gets a plain-English message.
{
  const result = await run(createPayload, {
    "POST /rest/v1/rpc/create_class": () => pgError('duplicate key value violates unique constraint "classes_class_code_unique"', 409),
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /class code belongs to another class/);
}

// 4. Void commands report success instead of a JSON parse failure.
for (const [action, rpc, extra] of [
  ["revokeInvitation", "revoke_school_invitation", { invitationId: "invite-1" }],
  ["changeMemberRole", "change_school_member_role", { userId: TEACHER, role: "teacher" }],
  ["deactivateMember", "deactivate_school_member", { userId: TEACHER }],
]) {
  const result = await run({ action, ...extra }, { [`POST /rest/v1/rpc/${rpc}`]: () => empty() });
  assert.equal(result.status, 200, `${action}: ${JSON.stringify(result.body)}`);
  assert.equal(result.body.success, true);
}

// 5. Remove goes through the guarded remove_empty_class RPC and surfaces its refusal.
{
  const removed = await run({ action: "removeClass", classId: CLASS }, {
    "POST /rest/v1/rpc/remove_empty_class": ({ body }) => json({ removed: true, classId: body.p_class_id, name: "5B" }),
  });
  assert.equal(removed.status, 200);
  assert.equal(removed.body.removed, true);
  const refused = await run({ action: "removeClass", classId: CLASS }, {
    "POST /rest/v1/rpc/remove_empty_class": () => pgError("Students have been enrolled in this class before, so it keeps their history. Archive it instead."),
  });
  assert.notEqual(refused.status, 200);
  assert.match(refused.body.error, /Archive it instead/);
}

// 6. Archive refuses a class with current students and never patches it.
{
  const result = await run({ action: "archiveClass", classId: CLASS }, {
    "GET /rest/v1/students": () => json([{ id: "student-1" }]),
    "GET /rest/v1/class_enrollments": () => json([]),
    "PATCH /rest/v1/classes": () => assert.fail("must not archive a class with students"),
  });
  assert.notEqual(result.status, 200);
  assert.match(result.body.error, /still has students/);
}

// 7. Archive and restore patch only this school's class, in the expected state.
{
  const archived = await run({ action: "archiveClass", classId: CLASS }, {
    "GET /rest/v1/students": () => json([]),
    "GET /rest/v1/class_enrollments": () => json([]),
    "PATCH /rest/v1/classes": ({ url, body }) => {
      assert.equal(url.searchParams.get("id"), `eq.${CLASS}`);
      assert.equal(url.searchParams.get("school_id"), `eq.${SCHOOL}`);
      assert.equal(url.searchParams.get("status"), "eq.active");
      assert.equal(body.status, "archived");
      assert.ok(body.archived_at);
      return json([{ id: CLASS }]);
    },
  });
  assert.equal(archived.status, 200);

  const restored = await run({ action: "restoreClass", classId: CLASS }, {
    "PATCH /rest/v1/classes": ({ url, body }) => {
      assert.equal(url.searchParams.get("status"), "eq.archived");
      assert.deepEqual(body, { status: "active", archived_at: null });
      return json([{ id: CLASS }]);
    },
  });
  assert.equal(restored.status, 200);

  const stale = await run({ action: "restoreClass", classId: CLASS }, { "PATCH /rest/v1/classes": () => json([]) });
  assert.notEqual(stale.status, 200);
  assert.match(stale.body.error, /already changed/);
}

// 8. Archived classes are listed for restore.
{
  const result = await run({ action: "listArchivedClasses" }, {
    "GET /rest/v1/classes": ({ url }) => {
      assert.equal(url.searchParams.get("status"), "eq.archived");
      return json([{ id: CLASS, name: "5B", class_code: "5BABC", academic_year_id: "year-2026", archived_at: "2026-11-20T00:00:00Z" }]);
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.archivedClasses, [
    { id: CLASS, name: "5B", code: "5BABC", academicYearId: "year-2026", archivedAt: "2026-11-20T00:00:00Z" },
  ]);
}

// 9. The School Home dialog keeps one request key per dialog, warns on a
//    duplicate class name, and repeats errors inside open dialogs.
{
  const schoolHome = fs.readFileSync("components/school/SchoolHomeClient.tsx", "utf8");
  const createDialog = schoolHome.slice(schoolHome.indexOf("function CreateClassModal("), schoolHome.indexOf("function InviteStaffModal("));
  assert.ok(createDialog.length > 0, "CreateClassModal not found");
  assert.match(createDialog, /const \[requestKey\] = useState\(\(\) => crypto\.randomUUID\(\)\)/);
  assert.match(createDialog, /idempotencyKey: requestKey/);
  assert.doesNotMatch(createDialog, /idempotencyKey: crypto\.randomUUID\(\)/);
  assert.match(createDialog, /createCode\(name, codeSuffix\)/);
  assert.match(createDialog, /Create another class with this name anyway/);
  assert.match(schoolHome, /const \{ error, clear \} = useContext\(ModalErrorContext\)/);
  assert.match(schoolHome, /<ModalErrorContext\.Provider value=\{modalError\}>/);
}

console.log("PASS school class management: retry-safe creation, void commands, remove/archive/restore guards and dialog errors.");
