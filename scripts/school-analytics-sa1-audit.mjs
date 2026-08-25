import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read(
  "supabase/migrations/20260825110000_school_analytics_sa1.sql",
);
const dashboard = read("components/school/SchoolAnalyticsDashboard.tsx");
const schoolHome = read("components/school/SchoolHomeClient.tsx");
const route = read("app/api/school/[schoolId]/analytics/route.ts");
const server = read("lib/school-platform-server.ts");

const checks = [
  [
    "analytics remain under the existing School Analytics tab",
    /label: "School Analytics"/.test(schoolHome) &&
      /<SchoolAnalyticsDashboard/.test(schoolHome),
  ],
  [
    "all six analytics views are available",
    ["Overview", "Growth", "Curriculum", "Engagement", "Classes", "Students"].every(
      (label) => dashboard.includes(`label: "${label}"`),
    ),
  ],
  [
    "time, year, class and realm filters are implemented",
    ["setDays", "setYearLevel", "setClassId", "setRealmId"].every((value) =>
      dashboard.includes(value),
    ),
  ],
  [
    "school analytics render a loading skeleton",
    /function LoadingView/.test(dashboard) && /animate-pulse/.test(dashboard),
  ],
  [
    "charts expose keyboard-operable drill-down points",
    /onPointClick/.test(dashboard) &&
      /event\.key === "Enter"/.test(dashboard) &&
      /setTab\("students"\)/.test(dashboard),
  ],
  [
    "class summaries expose activity, target, mastery, accuracy and growth",
    [
      "activeStudents",
      "weeklyTargetMet",
      "masteredLevels",
      "averageAccuracy",
      "averageGrowth",
    ].every((value) => dashboard.includes(`item.${value}`)),
  ],
  [
    "student drill-down includes pathway and assessment evidence",
    [
      "pathwayStatus",
      "currentLevel",
      "currentWeek",
      "pretestScore",
      "posttestScore",
      "mastered",
      "growth",
    ].every((value) => dashboard.includes(`realm.${value}`)),
  ],
  [
    "student directory supports search and evidence sorting",
    /studentSearch/.test(dashboard) &&
      /studentSort/.test(dashboard) &&
      /Search/.test(dashboard),
  ],
  [
    "API requires an academic year and uses the secure server loader",
    /Academic year is required/.test(route) &&
      /loadSchoolAnalyticsSnapshot/.test(route),
  ],
  [
    "analytics responses use a private short-lived cache",
    /private, max-age=60, stale-while-revalidate=120/.test(route),
  ],
  [
    "server adapter resolves the canonical analytics RPC",
    /get_school_analytics_snapshot/.test(server) &&
      /SchoolAnalyticsSnapshot/.test(server),
  ],
  [
    "database function is school permission protected",
    /security definer/i.test(migration) &&
      /can_view_school_administration\(p_school_id\)/.test(migration),
  ],
  [
    "academic year must belong to the requested school",
    /ay\.school_id = p_school_id/.test(migration) &&
      /Academic year does not belong to this school/.test(migration),
  ],
  [
    "cohort includes active school entitlements only",
    /sae\.access_source = 'school'/.test(migration) &&
      /sae\.school_id = p_school_id/.test(migration) &&
      /sae\.status = 'active'/.test(migration),
  ],
  [
    "home-only access is excluded and school plus home is counted once",
    /select distinct on \(s\.id\)/.test(migration) &&
      !/sae\.access_source in \('school',\s*'home'\)/.test(migration),
  ],
  [
    "lesson evidence is canonically deduplicated",
    /distinct on \(a\.student_id, a\.realm_id, a\.working_level, a\.week, a\.lesson\)/.test(
      migration,
    ),
  ],
  [
    "weekly quiz evidence is canonically deduplicated",
    /distinct on \(a\.student_id, a\.realm_id, a\.working_level, a\.week\)/.test(
      migration,
    ),
  ],
  [
    "growth requires matched pre and post evidence at the same level",
    /post\.student_id = pre\.student_id/.test(migration) &&
      /post\.realm_id = pre\.realm_id/.test(migration) &&
      /post\.working_level = pre\.working_level/.test(migration) &&
      /post\.score_percent - pre\.score_percent as growth/.test(migration),
  ],
  [
    "mastery is based on latest post-test evidence at 85 percent",
    /latest_assessments/.test(migration) &&
      /la\.score_percent >= 85/.test(migration) &&
      /post-test score of 85% or higher/.test(migration),
  ],
  [
    "curriculum reporting uses completed canonical lesson evidence",
    /a\.completed/.test(migration) &&
      /topic_focus/.test(migration) &&
      /evidenceCount/.test(migration),
  ],
  [
    "anonymous callers cannot execute the analytics function",
    /revoke all on function public\.get_school_analytics_snapshot[\s\S]*from public, anon/.test(
      migration,
    ) &&
      /grant execute[\s\S]*to authenticated/.test(migration),
  ],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}

console.log(`\n${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) process.exitCode = 1;
