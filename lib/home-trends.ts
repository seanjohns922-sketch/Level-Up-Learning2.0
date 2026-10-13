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

function sumActivities(
  trend: SchoolAnalyticsSnapshot["engagementTrend"],
  fromDaysAgo: number,
  toDaysAgo: number,
  now: number,
) {
  const day = 24 * 60 * 60 * 1000;
  return trend.reduce((total, point) => {
    const age = (now - new Date(point.date).getTime()) / day;
    return age >= toDaysAgo && age < fromDaysAgo ? total + point.activities : total;
  }, 0);
}

export function buildHomeTrendRows(
  snapshot: SchoolAnalyticsSnapshot,
  scope: "school" | "class",
  now = Date.now(),
): TrendRow[] {
  const rows: TrendRow[] = [];

  const thisWeek = sumActivities(snapshot.engagementTrend, 7, 0, now);
  const lastWeek = sumActivities(snapshot.engagementTrend, 14, 7, now);
  if (lastWeek >= 10) {
    const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    if (Math.abs(change) >= 10) {
      rows.push({
        key: "activity",
        tone: change < 0 ? "down" : "up",
        title: "Learning activity",
        detail: `${thisWeek} lessons and quizzes this week, ${lastWeek} last week`,
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
