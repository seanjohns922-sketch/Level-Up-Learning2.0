import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read(
  "supabase/migrations/20260729120000_school_home_preview.sql",
);
const page = read("app/school/[schoolId]/page.tsx");
const classAdapter = read(
  "app/school/[schoolId]/classes/[classId]/page.tsx",
);
const client = read("components/school/SchoolHomeClient.tsx");
const commandRoute = read("app/api/school/[schoolId]/command/route.ts");
const classAccessRoute = read(
  "app/api/school/[schoolId]/class-access/route.ts",
);
const server = read("lib/school-platform-server.ts");
const teacherDashboard = read("app/teacher/dashboard/page.tsx");
const login = read("app/login/page.tsx");
const sessionRoute = read("app/api/school-preview-session/route.ts");
const finalLoginMigration = read(
  "supabase/migrations/20260729123000_final_school_login_admin_model.sql",
);
const teacherNavigation = client.slice(
  client.indexOf("const TEACHER_NAV_ITEMS"),
  client.indexOf("const ADMIN_NAV_ITEMS"),
);
const administratorNavigation = client.slice(
  client.indexOf("const ADMIN_NAV_ITEMS"),
  client.indexOf("const YEAR_LEVELS"),
);

const checks = [
  [
    "school route is server protected",
    /loadSchoolHomePreview/.test(page) &&
      /redirect\("\/teacher\/dashboard"\)/.test(page),
  ],
  [
    "preview remains feature flagged",
    /SCHOOL_PLATFORM_PREVIEW_ENABLED/.test(server),
  ],
  [
    "school switch changes tenant URL",
    /window\.location\.assign\(`\/school\/\$\{event\.target\.value\}`\)/.test(
      client,
    ),
  ],
  [
    "academic year controls class lists",
    /academicYearId/.test(client) &&
      /classRow\.academicYearId === academicYearId/.test(client),
  ],
  [
    "school home navigation is complete",
    ["Home", "Classes", "Students", "Staff", "Insights", "Administration"].every(
      (label) => client.includes(`label: "${label}"`),
    ),
  ],
  [
    "teacher navigation is class focused",
    ["Home", "Classes", "Insights", "Settings", "Support"].every((label) =>
      teacherNavigation.includes(`label: "${label}"`),
    ) &&
      !teacherNavigation.includes('label: "Students"') &&
      !teacherNavigation.includes('label: "Staff"') &&
      !teacherNavigation.includes('label: "Administration"'),
  ],
  [
    "administrator navigation retains school controls",
    ["Classes", "Staff", "Students", "School Analytics", "Administration"].every(
      (label) => administratorNavigation.includes(`label: "${label}"`),
    ),
  ],
  [
    "home reads canonical snapshot",
    /get_school_home_snapshot/.test(migration) &&
      /class_enrollments/.test(migration) &&
      /school_audit_log/.test(migration),
  ],
  [
    "unique academic-year student count",
    /count\(distinct enrolment\.student_id\)/i.test(migration),
  ],
  [
    "class creation uses audited RPC boundary",
    /runSchoolCommand<string>\([\s\S]*?"create_class"/.test(commandRoute) &&
      !/supabase\.from\(/.test(client),
  ],
  [
    "staff changes use audited RPC boundary",
    [
      "assign_class_staff",
      "invite_school_staff_with_class",
      "resend_school_invitation",
      "revoke_school_invitation",
      "change_school_member_role",
      "deactivate_school_member",
    ].every((rpc) => commandRoute.includes(`"${rpc}"`)),
  ],
  [
    "raw invitation token is not returned to UI",
    !/invitation_token/.test(client) &&
      /invitationId: result\[0\]\?\.invitation_id/.test(commandRoute),
  ],
  [
    "administration navigation is permission controlled",
    /canViewAdministration/.test(client),
  ],
  [
    "class adapter reauthorizes school and class",
    /loadSchoolHomePreview/.test(classAdapter) &&
      /classRow\?\.canOpen/.test(classAdapter),
  ],
  [
    "class adapter scopes compatibility dashboard",
    /schoolPreview/.test(classAdapter) &&
      /classId/.test(classAdapter) &&
      /requestedClassId/.test(teacherDashboard),
  ],
  [
    "compatibility scope requires server handshake",
    /loadSchoolHomePreview/.test(classAccessRoute) &&
      /classRow\?\.canOpen/.test(classAccessRoute) &&
      /\/class-access\?classId=/.test(teacherDashboard),
  ],
  [
    "ordinary teacher dashboard keeps lead-teacher default",
    /requestedClassId[\s\S]*?classQuery\.eq\("id", requestedClassId\)[\s\S]*?: classQuery\.eq\("teacher_id", teacherId\)/.test(
      teacherDashboard,
    ),
  ],
  [
    "every class dashboard heading uses class name",
    /\{selectedClass\?\.name \?\? "Class Dashboard"\}/.test(teacherDashboard),
  ],
  [
    "School Home refreshes the authenticated school session",
    /openSchoolPreview\(schoolHomeId\)/.test(teacherDashboard) &&
      /destinationSchoolId[\s\S]*?result\.schools\.find/.test(
        teacherDashboard,
      ),
  ],
  [
    "student identity directory and insights scope",
    /School Students/.test(client) &&
      /Explorer Code/.test(client) &&
      /SchoolAnalyticsDashboard/.test(client),
  ],
  [
    "administrators can assign a new student to an active school class",
    /Class \(optional\)/.test(client) &&
      /value=\{manualDraft\.classId\}/.test(client) &&
      /classRow\.status === "active"/.test(client) &&
      /p_class_id: stringValue\(student\.classId\) \|\| null/.test(commandRoute),
  ],
  [
    "snapshot and commands require school permission",
    /not public\.can_view_school\(p_school_id\)/i.test(migration) &&
      /public\.can_manage_school/.test(migration),
  ],
  [
    "educators land on School Home",
    /const destination = `\/school\/\$\{preferredSchool\.id\}`/.test(
      sessionRoute,
    ) &&
      /routeAuthenticatedEducator/.test(login),
  ],
  [
    "first association requires invitation and School Code",
    /activate_school_membership_with_code/.test(finalLoginMigration) &&
      /lower\(invitation\.email\) = v_email/.test(finalLoginMigration) &&
      /invitation\.status = 'pending'/.test(finalLoginMigration) &&
      /teacherSchoolCode/.test(login),
  ],
  [
    "open educator signup is replaced by invite activation",
    /Activate Invite/.test(login) &&
      !/m === "login" \? "Log In" : "Sign Up"/.test(login),
  ],
  [
    "Cobram trial administrator is canonical",
    /school_code = 'COB2026'/.test(finalLoginMigration) &&
      /role = 'school_admin'/.test(finalLoginMigration) &&
      /miranda\.johns/.test(finalLoginMigration),
  ],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

if (failures.length > 0) process.exitCode = 1;
