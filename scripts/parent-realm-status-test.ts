import assert from "node:assert/strict";
import fs from "node:fs";
import type { ParentActivityFeedItem, ParentReportLevel } from "@/lib/parent-insights";
import { parentCurriculumLessonCount, parentCurriculumWeeks, parentLevelLabel } from "@/lib/parent-curriculum";
import {
  realmSkipState,
  realmTests,
  scoreBand,
  startOfWeek,
  summariseRealmScores,
  summariseWeek,
  type ParentWeekSkips,
} from "@/lib/parent-realm-status";

let passed = 0;
function check(name: string, run: () => void) {
  run();
  passed += 1;
  console.log(`PASS ${name}`);
}

const now = new Date("2026-11-18T10:00:00+11:00"); // a Wednesday
const at = (daysAgo: number, hour = 16) => new Date(now.getTime() - daysAgo * 86_400_000 - (10 - hour) * 3_600_000).toISOString();
const work = (kind: ParentActivityFeedItem["kind"], realmId: string, workingLevel: string, accuracy: number | null, week: number | null, completedAt: string): ParentActivityFeedItem => ({
  kind, realmId, workingLevel, label: "x", week, lesson: kind === "lesson" ? 1 : null, correct: null, attempted: null, accuracy, completedAt,
});

check("score bands follow the 80% quiz mark and the 60% developing line", () => {
  assert.equal(scoreBand(80), "going-well");
  assert.equal(scoreBand(79), "getting-there");
  assert.equal(scoreBand(60), "getting-there");
  assert.equal(scoreBand(59), "needs-practice");
});

check("a realm band averages its three latest lessons and quizzes on the current level only", () => {
  const feed = [
    work("lesson", "number", "Year 2", 90, 5, at(0)),
    work("lesson", "number", "Year 2", 80, 5, at(1)),
    work("quiz", "number", "Year 2", 85, 4, at(2)),
    work("lesson", "number", "Year 2", 10, 4, at(3)), // older than the latest three
    work("lesson", "number", "Year 1", 10, 4, at(0)), // another level
    work("assessment", "number", "Year 2", 10, null, at(0)), // tests are not weekly work
  ];
  const summary = summariseRealmScores(feed, "number", "Year 2");
  assert.equal(summary.average, 85);
  assert.equal(summary.band, "going-well");
  assert.equal(summary.detail, "Week 4 quiz 85%");
});

check("a failed quiz names the tries and the pass mark", () => {
  const feed = [work("quiz", "statistics", "Year 1", 55, 5, at(0)), work("quiz", "statistics", "Year 1", 50, 5, at(2))];
  const summary = summariseRealmScores(feed, "statistics", "Year 1");
  assert.equal(summary.band, "needs-practice");
  assert.equal(summary.detail, "Week 5 quiz 55%, 2 tries · needs 80%");
});

check("a realm with no scored work has no band", () => {
  assert.deepEqual(summariseRealmScores([], "number", "Year 2"), { band: null, average: null, detail: null });
});

check("the week starts on Monday", () => {
  const monday = startOfWeek(now);
  assert.equal(monday.getDay(), 1);
  assert.ok(monday.getTime() <= now.getTime() && now.getTime() - monday.getTime() < 7 * 86_400_000);
});

check("the weekly summary counts only this week and names standout realms", () => {
  const feed = [
    work("lesson", "space", "Year 3", 100, 1, at(0)),
    work("lesson", "statistics", "Year 1", 50, 5, at(1)),
    work("quiz", "number", "Year 2", 90, 4, at(1)),
    work("lesson", "number", "Year 2", 20, 4, at(9)), // last week
  ];
  const week = summariseWeek(feed, now);
  assert.equal(week.finished, 3);
  assert.equal(week.average, 80);
  assert.equal(week.strongestRealmId, "space");
  assert.equal(week.needsPracticeRealmId, "statistics");
});

check("tests show the current level's pre-test and the last finished level", () => {
  const levels: ParentReportLevel[] = [
    { realmId: "space", workingLevel: "Year 2", isCurrent: false, currentWeek: null, status: "COMPLETE", pretestScore: 55, posttestScore: 90, posttestCompletedAt: at(6) },
    { realmId: "space", workingLevel: "Year 3", isCurrent: true, currentWeek: 2, status: "ASSIGNED_PROGRAM", pretestScore: 62, posttestScore: null, posttestCompletedAt: null },
  ];
  assert.deepEqual(realmTests(levels, "space", "Year 3"), {
    pretestScore: 62,
    posttestScore: null,
    finishedLevel: { workingLevel: "Year 2", pretestScore: 55, posttestScore: 90 },
  });
});

const skips: ParentWeekSkips = {
  canSkip: true,
  limit: 4,
  realms: [
    { realmId: "number", workingLevel: "Year 2", weekCount: 12, skippedWeeks: [{ week: 3, skippedAt: at(15) }], skipsLeft: 3 },
    { realmId: "statistics", workingLevel: "Year 1", weekCount: 6, skippedWeeks: [], skipsLeft: 0 },
  ],
};

check("skips are offered on a placed home realm with skips left", () => {
  const state = realmSkipState(skips, "number", "Year 2", 5);
  assert.equal(state.canSkipNow, true);
  assert.equal(state.skipsLeft, 3);
  assert.deepEqual(state.skippedWeeks.map((entry) => entry.week), [3]);
});

check("no skip on the last week, with none left, or before placement", () => {
  assert.equal(realmSkipState(skips, "number", "Year 2", 12).canSkipNow, false);
  assert.equal(realmSkipState(skips, "statistics", "Year 1", 3).canSkipNow, false);
  assert.equal(realmSkipState(skips, "number", "Year 2", null).canSkipNow, false);
});

check("school-managed children are never offered skips", () => {
  const state = realmSkipState({ ...skips, canSkip: false }, "number", "Year 2", 5);
  assert.equal(state.offered, false);
  assert.equal(state.canSkipNow, false);
});

check("parent curriculum resolves Pattern Peaks and Chance Hollow through their genres", () => {
  assert.equal(parentCurriculumWeeks("pattern", "Year 4").length, 8);
  assert.equal(parentCurriculumWeeks("chance", "Year 4").length, 6);
  assert.equal(parentCurriculumLessonCount("number", "Year 2"), 36);
  assert.equal(parentLevelLabel("Year 2"), "Level 2");
});

check("the skip migration enforces the rules on the server", () => {
  const sql = fs.readFileSync("supabase/migrations/20261117120000_parent_week_skips.sql", "utf8");
  for (const rule of [
    "parent_can_manage_home_student(p_student_id)",
    "Only the current week can be skipped",
    "The last week of a level cannot be skipped",
    "No skips left for this level",
    "pg_advisory_xact_lock",
    "and not public.is_parent_skipped_week(p_student_id, p_realm_id, p_working_level, p_week)",
    "reward_eligible := this_passed and not passed_before and not skipped_week",
    "case when first_attempt and not skipped_week then 1 else 0 end",
  ]) assert.ok(sql.includes(rule), `missing: ${rule}`);
  assert.ok(sql.includes("revoke all on function public.parent_skip_child_week(uuid, text, integer) from public, anon;"));
});

console.log(`\nParent realm status test passed (${passed}/${passed}).`);
