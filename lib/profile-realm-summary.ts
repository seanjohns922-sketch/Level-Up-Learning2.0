import type { CompatProgressRow } from "./realm-progress-compat";
import { getProgramWeekCount } from "./program-weeks";
import { isWeekCompleteForRealm } from "./program-progress";
import { resolveRealmEntryRoute } from "./realm-entry";
import { getRealmDefinition, type LiveRealmId } from "./realms/realm-registry";

export type ProfileRealmWeek = { week: number; lessonsDone: number; quizBest: number | null; done: boolean };

export function profileRealmSummary(realm: LiveRealmId, rows: CompatProgressRow[]) {
  const row = rows.filter(row => row.realm_id === realm && row.is_current === true)
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))[0];
  if (!row) return null;
  const totalWeeks = getProgramWeekCount(realm, row.year);
  const ids = new Set(Array.isArray(row.completed_lesson_ids) ? row.completed_lesson_ids : []);
  const quizzes = (row.quiz_scores ?? {}) as Record<string, { percent?: number; attempts?: { percent?: number }[] }>;
  let completedLessons = 0;
  let weeksCompleted = 0;
  const weeks: ProfileRealmWeek[] = [];
  for (let week = 1; week <= totalWeeks; week++) {
    const lessonsCompleted = [1, 2, 3].map(lesson => [...ids].some(id => typeof id === "string" && id.endsWith(`-w${week}-l${lesson}`)));
    completedLessons += lessonsCompleted.filter(Boolean).length;
    const quiz = quizzes[String(week)];
    const quizBestScore = Math.max(0, Number(quiz?.percent ?? 0), ...(quiz?.attempts ?? []).map(attempt => Number(attempt.percent ?? 0)));
    const done = Boolean(row.teacher_advanced_weeks?.includes(week)) || isWeekCompleteForRealm({ lessonsCompleted, quizCompleted: !!quiz, quizBestScore }, realm, week, row.year);
    if (done) weeksCompleted++;
    weeks.push({ week, lessonsDone: lessonsCompleted.filter(Boolean).length, quizBest: quiz ? quizBestScore : null, done });
  }
  // The level's own pre-test and end-of-level (post) test, latest attempt of each.
  const attempts = (row.assessment_attempts ?? []).filter(attempt => attempt.workingLevel === row.year);
  const latest = (type: "pretest" | "posttest") => attempts.filter(attempt => attempt.assessmentType === type)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0] ?? null;
  const pretest = latest("pretest");
  const posttest = latest("posttest");
  const route = resolveRealmEntryRoute({ realmId: realm, introSeen: true, fallbackYear: row.year, progress: {
    year: row.year, scorePercent: row.pretest_score ?? 0, status: row.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
    placementComplete: row.placement_complete === true || row.status === "PASSED", unlockedLegends: [],
  } });
  return {
    name: getRealmDefinition(realm).name, year: row.year, route, completedLessons, weeksCompleted, totalWeeks,
    percent: Math.round(100 * weeksCompleted / totalWeeks), weeks,
    pretest: pretest ? { completedAt: pretest.completedAt } : row.placement_complete ? { completedAt: null } : null,
    posttest: posttest ? { completedAt: posttest.completedAt, passed: posttest.passed === true } : null,
    levelPassed: row.status === "PASSED",
  };
}
