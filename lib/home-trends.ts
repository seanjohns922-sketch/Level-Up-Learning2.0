import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";

/** What the home-page trend panels show, built only from the canonical school
 * analytics snapshot (the same source as School Analytics). School scope labels
 * topics with the students' school year, so it works however a school arranges
 * its classes; class scope is filtered to one class by the caller. */

export const WINDOW_DAYS = 28;
/** A topic is worth watching below this average accuracy. */
const WATCH_ACCURACY = 60;
/** Ignore topics with too little evidence to mean anything. */
const MIN_EVIDENCE = 5;
const MAX_ROWS = 4;

export type Tone = "down" | "up" | "watch";

export type TrendRow = {
  key: string;
  tone: Tone;
  title: string;
  detail: string;
  value: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Activities on the UTC calendar days from `startDay` to `endDay` (inclusive),
 * counted back from the reporting day. The RPC groups activity by UTC date
 * (`activity_at::date`) and stamps `generatedAt` with the same clock. */
function sumActivities(
  trend: SchoolAnalyticsSnapshot["engagementTrend"],
  reportingDay: number,
  startDaysBack: number,
  endDaysBack: number,
) {
  return trend.reduce((total, point) => {
    const daysBack = Math.round((reportingDay - Date.parse(`${point.date.slice(0, 10)}T00:00:00Z`)) / DAY_MS);
    return daysBack >= endDaysBack && daysBack <= startDaysBack ? total + point.activities : total;
  }, 0);
}

export function buildHomeTrendRows(
  snapshot: SchoolAnalyticsSnapshot,
  scope: "school" | "class",
): TrendRow[] {
  const rows: TrendRow[] = [];

  // Compare two complete seven-day periods: the reporting day itself is still
  // in progress, so it is left out of both.
  const reportingDay = Date.parse(`${snapshot.generatedAt.slice(0, 10)}T00:00:00Z`);
  const recent = sumActivities(snapshot.engagementTrend, reportingDay, 7, 1);
  const previous = sumActivities(snapshot.engagementTrend, reportingDay, 14, 8);
  if (!Number.isNaN(reportingDay) && previous >= 10) {
    const change = Math.round(((recent - previous) / previous) * 100);
    if (Math.abs(change) >= 10) {
      rows.push({
        key: "activity",
        tone: change < 0 ? "down" : "up",
        title: "Learning activity",
        detail: `${recent} lessons and quizzes in the last 7 full days, ${previous} in the 7 days before`,
        value: `${change > 0 ? "+" : "−"}${Math.abs(change)}%`,
      });
    }
  }

  const topics = snapshot.curriculum.filter(
    (topic) => topic.averageAccuracy !== null && topic.evidenceCount >= MIN_EVIDENCE,
  );
  const label = (topic: SchoolAnalyticsSnapshot["curriculum"][number]) =>
    scope === "school" && topic.yearLevel ? `${topic.topic} · ${topic.yearLevel}` : topic.topic;

  [...topics]
    .filter((topic) => (topic.averageAccuracy ?? 100) < WATCH_ACCURACY)
    .sort((a, b) => (a.averageAccuracy ?? 0) - (b.averageAccuracy ?? 0))
    .slice(0, 2)
    .forEach((topic) =>
      rows.push({
        key: `watch-${topic.topic}-${topic.yearLevel}`,
        tone: "watch",
        title: label(topic),
        detail: `${topic.students} ${topic.students === 1 ? "student" : "students"} · average accuracy over the last ${WINDOW_DAYS} days`,
        value: `${topic.averageAccuracy}%`,
      }),
    );

  const strongest = [...topics]
    .filter((topic) => (topic.averageAccuracy ?? 0) >= ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent)
    .sort((a, b) => (b.averageAccuracy ?? 0) - (a.averageAccuracy ?? 0))[0];
  if (strongest) {
    rows.push({
      key: `strong-${strongest.topic}-${strongest.yearLevel}`,
      tone: "up",
      title: label(strongest),
      detail: `Strongest topic · ${strongest.students} ${strongest.students === 1 ? "student" : "students"}`,
      value: `${strongest.averageAccuracy}%`,
    });
  }

  return rows.slice(0, MAX_ROWS);
}
