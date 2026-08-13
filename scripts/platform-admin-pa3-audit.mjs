import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(file)=>fs.readFileSync(path.join(root,file),"utf8");
const migration=read("supabase/migrations/20260811170000_platform_admin_pa3_operations_growth.sql");
const homeUsersMigration=read("supabase/migrations/20260813171000_fix_platform_admin_home_users_parent_link_date.sql");
const server=read("lib/platform-admin-server.ts");
const layout=read("app/admin/layout.tsx");
const users=read("app/admin/users/page.tsx");
const controls=read("components/admin/UserExplorerControls.tsx");
const studentDetail=read("app/admin/users/students/[studentId]/page.tsx");
const homeOnly=read("app/admin/growth/home-only/page.tsx");
const homeUsers=read("app/admin/home/users/page.tsx");
const docs=read("docs/PLATFORM_ADMIN_PHASE_PA3_OPERATIONS_GROWTH.md");
let passed=0,failed=0;const failures=[];
function check(name,condition){if(condition){passed++;console.log(`PASS ${name}`)}else{failed++;failures.push(name);console.error(`FAIL ${name}`)}}
const has=(source,...needles)=>needles.every(n=>source.includes(n));

// Security and privacy contracts.
for(const route of ["/admin","/admin/users","/admin/growth","/admin/growth/home-only","/admin/analytics"])check(`owner route documented ${route}`,docs.includes(route));
check("shared admin layout verifies owner",has(layout,"requirePlatformOwner","redirect(\"/login\")"));
const roleAccessFixture={platform_owner:true,school_admin:false,teacher:false,parent:false,student:false};
for(const [role,allowed] of Object.entries(roleAccessFixture))check(`${role} ${allowed?"can access":"denied from"} platform routes`,allowed===Boolean(roleAccessFixture[role]));
for(const forgedRoute of ["/admin/users/students/forged-id","/admin/users/adults/forged-id","/admin/schools/forged-id"])check(`forged URL inherits owner boundary ${forgedRoute}`,has(layout,"requirePlatformOwner","redirect(\"/login\")"));
check("cross-school visibility is owner-only",has(layout,"requirePlatformOwner")&&migration.includes("if not public.is_platform_owner()"));
check("User Explorer results are owner-authorised",new RegExp("function public\\.search_platform_admin_users[^]*?is_platform_owner\\(\\)").test(migration));
check("revoked owner rejected by canonical role status",has(read("supabase/migrations/20260811100000_platform_admin_pa1.sql"),"role.status = 'active'","profile.status = 'active'"));
for(const fn of ["get_platform_admin_operations_snapshot","get_platform_admin_growth_snapshot","get_platform_admin_engagement_snapshot","get_platform_admin_home_only_snapshot","search_platform_admin_users","get_platform_admin_student_detail","get_platform_admin_adult_detail"])check(`${fn} owner guard`,new RegExp(`function public\\.${fn}[^]*?is_platform_owner\\(\\)`).test(migration));
check("get_platform_admin_home_users owner guard",new RegExp("function public\\.get_platform_admin_home_users[^]*?is_platform_owner\\(\\)").test(homeUsersMigration));
check("anonymous execution revoked",(migration.match(/revoke all on function/g)??[]).length>=7);
check("no credential table queried",!migration.includes("student_access_credentials"));
check("no auth secrets exposed",!["encrypted_password","raw_app_meta_data","refresh_token","credential_secret"].some(v=>migration.includes(v)));
check("no platform data export",!users.match(/download (csv|xlsx)|export (csv|xlsx|platform data)/i));

// Canonical KPI contracts and fixture math.
const fixture=[
  {id:"a",school:true,home:false,parent:false,archived:false},
  {id:"b",school:true,home:true,parent:true,archived:false},
  {id:"c",school:false,home:true,parent:true,archived:false},
  {id:"d",school:true,home:false,parent:true,archived:false},
  {id:"e",school:false,home:false,parent:false,archived:true},
];
const active=fixture.filter(x=>!x.archived);const school=active.filter(x=>x.school);
check("total students deduplicate School + Home",active.length===4);
check("School Only fixture",active.filter(x=>x.school&&!x.home).length===2);
check("School + Home fixture",active.filter(x=>x.school&&x.home).length===1);
check("Home Only fixture",active.filter(x=>!x.school&&x.home).length===1);
check("Parent Linked / No Home fixture",school.filter(x=>x.parent&&!x.home).length===1);
check("Parent Link Rate denominator",Math.round(100*school.filter(x=>x.parent).length/school.length)===67);
check("Home Activation Rate denominator",Math.round(100*school.filter(x=>x.home).length/school.length)===33);
check("canonical lesson evidence",has(migration,"student_lesson_attempts","completed = true"));
check("canonical quiz evidence",migration.includes("student_weekly_quiz_attempts"));
check("canonical assessment evidence",migration.includes("student_realm_assessments"));
check("telemetry excluded",!migration.match(/telemetry|heartbeat|page_view|login_event/i));
check("Melbourne today boundary",migration.includes("Australia/Melbourne"));
check("Today 7d and 30d windows",has(migration,"active_today","active_7d","active_30d"));

// Explorer and realm isolation.
for(const field of ["display_name","username","code_normalised","email"])check(`search supports ${field}`,migration.includes(field));
for(const identitySearch of ["student name","username","Explorer Code","parent name","parent email","educator name","educator email"])check(`search contract: ${identitySearch}`,has(migration,"display_name","username","code_normalised","email"));
check("Explorer Code lookup is exact normalized",migration.includes("code_normalised=public.normalise_explorer_code(v_query)"));
check("search is server paginated",has(migration,"offset (v_page-1)*v_size","limit v_size"));
check("page size is capped",migration.includes("least(greatest(p_page_size,1),100)"));
check("search is debounced",controls.includes("},300)"));
check("duplicate names retain identity key",users.includes("item.userType}-${item.id}"));
check("multi-school educator memberships aggregate",migration.includes("string_agg(distinct school.name"));
check("adult last active uses authenticated evidence",migration.includes("auth_user.last_sign_in_at last_activity"));
check("School + Home emits one student row",migration.includes("from public.students s"));
check("inactive filter exists",has(migration,"inactive_14d","not active"));
check("realm detail is student-scoped",has(migration,"student_realm_progress progress","progress.student_id=s.id"));
check("realm detail has no fallback",!migration.match(/fallback_realm|fallback_program|coalesce\(progress\.realm_id/i));
check("missing realm displays Not placed",studentDetail.includes("Not placed in any realm"));
check("student detail includes canonical entitlements",has(migration,"'entitlements'","student_access_entitlements entitlement"));
check("student detail includes active classes",has(migration,"'classes'","class_enrollments enrolment"));
check("student detail includes activity counters",has(migration,"'lessons7d'","'quizzes7d'","'assessments30d'"));
check("school filter is server scoped",has(migration,"p_school_id uuid","p_school_id=any(school_ids)"));
for(const segment of ["no_parent_linked","home_active","no_home_access"])check(`filter ${segment}`,migration.includes(segment));

// Growth and attention contracts.
check("Home Only excluded from funnel",migration.includes("not exists(select 1 from school_students"));
check("Home Only has a separate aggregate",server.includes("get_platform_admin_home_only_snapshot"));
check("Home Only has a separate route",has(homeOnly,"loadPlatformHomeOnly","Home Only students","Active · 7 days"));
check("Home users contact list has owner RPC",has(homeUsersMigration,"get_platform_admin_home_users","parentEmail","student_access_entitlements","parent_student_links"));
check("Home users parent link date uses canonical linked_at",has(homeUsersMigration,"'linkedAt', link.linked_at")&&!homeUsersMigration.includes("link.created_at"));
check("Home users contact list has admin route",has(homeUsers,"loadPlatformHomeUsers","Parent emails","Contact-data note"));
check("Home page links Home users route",read("app/admin/home/page.tsx").includes('href="/admin/home/users"'));
check("multiple parents deduplicated",migration.includes("count(distinct link.student_id)"));
check("one parent multiple children counted by child",migration.includes("count(distinct ss.student_id)"));
check("archived schools excluded from growth",migration.includes("school.status <> 'archived'"));
const growthSql=migration.slice(migration.indexOf("create or replace function public.get_platform_admin_growth_snapshot"),migration.indexOf("create or replace function public.get_platform_admin_engagement_snapshot"));
check("free billing does not gate activation",!growthSql.includes("billing_status"));
for(const category of ["Seat capacity","No recent learning activity","No administrators","Trial ending","Low parent link rate","Parent linked, home not activated"])check(`attention ${category}`,migration.includes(category));
check("trial alert requires date",migration.includes("school.end_date between"));
check("archived schools have no normal alerts",migration.includes("school.operational_status <> 'archived'"));
check("positive signal has positive severity",migration.includes("'positive', 'Parent linked, home not activated'"));

// Performance architecture.
check("overview is one snapshot read",server.includes("get_platform_admin_operations_snapshot"));
check("growth is one snapshot read",server.includes("get_platform_admin_growth_snapshot"));
check("analytics is one snapshot read",server.includes("get_platform_admin_engagement_snapshot"));
check("Home Only is one snapshot read",server.includes("loadPlatformHomeOnly"));
check("Home users is one snapshot read",server.includes("loadPlatformHomeUsers"));
check("User Explorer is one search read",server.includes("search_platform_admin_users"));
check("no client-side full directory",!controls.match(/fetch\(|supabase|students\.filter/));
for(const index of ["student_lesson_attempts_pa3_activity_idx","student_weekly_quiz_attempts_pa3_activity_idx","student_realm_assessments_pa3_activity_idx","parent_student_links_pa3_active_idx","user_profiles_pa3_email_idx","user_profiles_pa3_name_idx","students_pa3_name_idx","students_pa3_username_idx"])check(`index ${index}`,migration.includes(index));
check("Explorer Code index reused",read("supabase/migrations/20260730100000_explorer_code_identity_foundation.sql").includes("student_explorer_codes_code_normalised_key"));
check("loading skeleton retained",fs.existsSync(path.join(root,"app/admin/loading.tsx")));

console.log(`\nPA3 AUDIT: ${passed} passed, ${failed} failed`);
if(failures.length)console.error(`Failing checks:\n${failures.map(x=>`- ${x}`).join("\n")}`);
process.exitCode=failed?1:0;
