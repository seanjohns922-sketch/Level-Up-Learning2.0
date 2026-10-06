import type { CompatProgressRow } from "./realm-progress-compat";
import { getProgramWeekCount } from "./program-weeks";
import { isWeekCompleteForRealm } from "./program-progress";
import { resolveRealmEntryRoute } from "./realm-entry";
import { getRealmDefinition, type LiveRealmId } from "./realms/realm-registry";

export function profileRealmSummary(realm: LiveRealmId, rows: CompatProgressRow[]) {
  const row = rows.filter(row => row.realm_id === realm && row.is_current === true)
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))[0];
  if (!row) return null;
  const totalWeeks = getProgramWeekCount(realm, row.year);
  const ids = new Set(Array.isArray(row.completed_lesson_ids) ? row.completed_lesson_ids : []);
  const quizzes = (row.quiz_scores ?? {}) as Record<string, { percent?: number; attempts?: { percent?: number }[] }>;
  let completedLessons = 0;
  let weeksCompleted = 0;
  for (let week = 1; week <= totalWeeks; week++) {
    const lessonsCompleted = [1, 2, 3].map(lesson => [...ids].some(id => typeof id === "string" && id.endsWith(`-w${week}-l${lesson}`)));
    completedLessons += lessonsCompleted.filter(Boolean).length;
    const quiz = quizzes[String(week)];
    const quizBestScore = Math.max(0, Number(quiz?.percent ?? 0), ...(quiz?.attempts ?? []).map(attempt => Number(attempt.percent ?? 0)));
    if (row.teacher_advanced_weeks?.includes(week) || isWeekCompleteForRealm({ lessonsCompleted, quizCompleted: !!quiz, quizBestScore }, realm, week, row.year)) weeksCompleted++;
  }
  const route = resolveRealmEntryRoute({ realmId: realm, introSeen: true, fallbackYear: row.year, progress: {
    year: row.year, scorePercent: row.pretest_score ?? 0, status: row.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
    placementComplete: row.placement_complete === true || row.status === "PASSED", unlockedLegends: [],
  } });
  return { name: getRealmDefinition(realm).name, year: row.year, route, completedLessons, weeksCompleted, totalWeeks, percent: Math.round(100 * weeksCompleted / totalWeeks) };
}
