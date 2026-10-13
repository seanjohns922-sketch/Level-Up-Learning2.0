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
const SCHOOL_WEEK_FORMATTER = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });

/** Activities on the five school days (Monday to Friday) starting at `monday`.
 * The RPC groups activity by UTC date (`activity_at::date`), so weeks are
 * matched on those dates; both weeks are bucketed the same way. */
function sumSchoolWeek(trend: SchoolAnalyticsSnapshot["engagementTrend"], monday: number) {
  return trend.reduce((total, point) => {
    const offset = Math.round((Date.parse(`${point.date.slice(0, 10)}T00:00:00Z`) - monday) / DAY_MS);
    return offset >= 0 && offset <= 4 ? total + point.activities : total;
  }, 0);
}

/** Monday of the latest school week that has fully finished by the reporting
 * day: this week once Friday is over (Saturday or Sunday), otherwise last week. */
function latestCompletedSchoolWeek(reportingDay: number) {
  const weekday = new Date(reportingDay).getUTCDay();
  const thisMonday = reportingDay - ((weekday + 6) % 7) * DAY_MS;
  return weekday === 6 || weekday === 0 ? thisMonday : thisMonday - 7 * DAY_MS;
}

export function buildHomeTrendRows(
  snapshot: SchoolAnalyticsSnapshot,
  scope: "school" | "class",
): TrendRow[] {
  const rows: TrendRow[] = [];

  // Compare the two most recent completed school weeks (Monday to Friday), so a
  // week in progress or a weekend never reads as a drop.
  const reportingDay = Date.parse(`${snapshot.generatedAt.slice(0, 10)}T00:00:00Z`);
  if (!Number.isNaN(reportingDay)) {
    const recentMonday = latestCompletedSchoolWeek(reportingDay);
    const recent = sumSchoolWeek(snapshot.engagementTrend, recentMonday);
    const previous = sumSchoolWeek(snapshot.engagementTrend, recentMonday - 7 * DAY_MS);
    const change = previous >= 10 ? Math.round(((recent - previous) / previous) * 100) : 0;
    if (Math.abs(change) >= 10) {
      rows.push({
        key: "activity",
        tone: change < 0 ? "down" : "up",
        title: "Learning activity",
        detail: `${recent} lessons and quizzes in the school week of ${SCHOOL_WEEK_FORMATTER.format(recentMonday)}, ${previous} the week before`,
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
