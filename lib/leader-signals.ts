import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";

/** "Where to look" for school leaders: a short ranked list of plain-English
 * signals built only from the canonical analytics snapshot and the on-level
 * cells the dashboard already derives (working level vs school year). Every
 * signal compares groups within the same reporting window, so none depends
 * on a week that is still in progress. */

export type LevelCell = { strand: string; strandLabel: string; year: string; below: number; total: number };

export type LeaderSignal = {
  key: string;
  tone: "concern" | "watch" | "strength";
  headline: string;
  detail: string;
  value: string;
  target: "intervention" | "curriculum" | "classes" | "overview";
  filter?: { yearLevel?: string; strand?: string; classId?: string };
};

/** Groups smaller than this are too noisy to call out. */
const MIN_GROUP = 5;
/** Topics need this much evidence before they are named. */
const MIN_EVIDENCE = 5;
const WEAK_TOPIC_ACCURACY = 60;
const BELOW_LEVEL_SHARE = 0.4;
const CLASS_GAP_POINTS = 15;
const LOW_PARTICIPATION = 0.5;
const MAX_SIGNALS = 5;

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

export function buildLeaderSignals(snapshot: SchoolAnalyticsSnapshot, cells: LevelCell[]): LeaderSignal[] {
  const concerns: LeaderSignal[] = [];
  const strengths: LeaderSignal[] = [];

  // 1. Year level × strand where the most students sit below their school year.
  const placed = cells.filter((cell) => cell.total >= MIN_GROUP && cell.year !== "Not recorded");
  [...placed]
    .filter((cell) => cell.below / cell.total >= BELOW_LEVEL_SHARE)
    .sort((a, b) => b.below / b.total - a.below / a.total || b.below - a.below)
    .slice(0, 2)
    .forEach((cell) =>
      concerns.push({
        key: `below-${cell.strand}-${cell.year}`,
        tone: "concern",
        headline: `${cell.year} ${cell.strandLabel}: ${pct(cell.below, cell.total)}% below their year level`,
        detail: `${cell.below} of ${cell.total} students are working below ${cell.year}.`,
        value: `${pct(cell.below, cell.total)}%`,
        target: "intervention",
        filter: { yearLevel: cell.year, strand: cell.strand },
      }),
    );

  // 2. Weakest curriculum topic with enough evidence.
  const weakTopic = [...snapshot.curriculum]
    .filter((topic) => topic.averageAccuracy !== null && topic.evidenceCount >= MIN_EVIDENCE && (topic.averageAccuracy ?? 100) < WEAK_TOPIC_ACCURACY)
    .sort((a, b) => (a.averageAccuracy ?? 0) - (b.averageAccuracy ?? 0))[0];
  if (weakTopic) {
    concerns.push({
      key: `topic-${weakTopic.topic}-${weakTopic.yearLevel}`,
      tone: "watch",
      headline: `${weakTopic.yearLevel ? `${weakTopic.yearLevel} · ` : ""}${weakTopic.topic}: ${weakTopic.averageAccuracy}% accuracy`,
      detail: `The weakest topic with enough evidence (${weakTopic.students} ${weakTopic.students === 1 ? "student" : "students"}).`,
      value: `${weakTopic.averageAccuracy}%`,
      target: "curriculum",
      filter: weakTopic.yearLevel ? { yearLevel: weakTopic.yearLevel } : undefined,
    });
  }

  // 3. Class furthest behind the school on the weekly target.
  const classes = snapshot.classes.filter((item) => item.students >= MIN_GROUP);
  const schoolTarget = pct(snapshot.overview.weeklyTargetMet, snapshot.overview.students);
  const laggingClass = classes
    .map((item) => ({ item, rate: pct(item.weeklyTargetMet, item.students) }))
    .filter(({ rate }) => schoolTarget - rate >= CLASS_GAP_POINTS)
    .sort((a, b) => a.rate - b.rate)[0];
  if (laggingClass) {
    concerns.push({
      key: `class-${laggingClass.item.id ?? laggingClass.item.name}`,
      tone: "watch",
      headline: `${laggingClass.item.name}: ${laggingClass.rate}% met the weekly target`,
      detail: `The school average is ${schoolTarget}%.`,
      value: `${laggingClass.rate}%`,
      target: "classes",
      filter: laggingClass.item.id ? { classId: laggingClass.item.id } : undefined,
    });
  }

  // 4. Participation across the school in the last 7 days.
  const activeShare = snapshot.overview.students ? snapshot.overview.activeThisWeek / snapshot.overview.students : 1;
  if (snapshot.overview.students >= MIN_GROUP && activeShare < LOW_PARTICIPATION) {
    concerns.push({
      key: "participation",
      tone: "watch",
      headline: `${pct(snapshot.overview.activeThisWeek, snapshot.overview.students)}% of students used RELIQ in the last 7 days`,
      detail: `${snapshot.overview.activeThisWeek} of ${snapshot.overview.students} students had a lesson, quiz or test.`,
      value: `${pct(snapshot.overview.activeThisWeek, snapshot.overview.students)}%`,
      target: "classes",
    });
  }

  // 5. Strongest result, so leaders also see what is working.
  const strongestCell = [...placed]
    .filter((cell) => cell.below === 0 || cell.below / cell.total <= 0.1)
    .sort((a, b) => b.total - a.total)[0];
  const strongTopic = [...snapshot.curriculum]
    .filter((topic) => topic.averageAccuracy !== null && topic.evidenceCount >= MIN_EVIDENCE && (topic.averageAccuracy ?? 0) >= ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent)
    .sort((a, b) => (b.averageAccuracy ?? 0) - (a.averageAccuracy ?? 0))[0];
  if (strongestCell) {
    strengths.push({
      key: `strong-${strongestCell.strand}-${strongestCell.year}`,
      tone: "strength",
      headline: `${strongestCell.year} ${strongestCell.strandLabel}: ${pct(strongestCell.total - strongestCell.below, strongestCell.total)}% at or above level`,
      detail: `${strongestCell.total - strongestCell.below} of ${strongestCell.total} students.`,
      value: `${pct(strongestCell.total - strongestCell.below, strongestCell.total)}%`,
      target: "intervention",
      filter: { yearLevel: strongestCell.year, strand: strongestCell.strand },
    });
  } else if (strongTopic) {
    strengths.push({
      key: `strong-topic-${strongTopic.topic}-${strongTopic.yearLevel}`,
      tone: "strength",
      headline: `${strongTopic.yearLevel ? `${strongTopic.yearLevel} · ` : ""}${strongTopic.topic}: ${strongTopic.averageAccuracy}% accuracy`,
      detail: "The strongest topic with enough evidence.",
      value: `${strongTopic.averageAccuracy}%`,
      target: "curriculum",
    });
  }

  return [...concerns.slice(0, MAX_SIGNALS - strengths.length), ...strengths];
}

/** Activities per week (weeks start Monday) for the usage chart, oldest
 * first, with empty weeks filled in. A week the reporting window only partly
 * covers is flagged: the newest while it is still running, and the oldest when
 * the window starts after its Monday. Dates are the RPC's UTC dates. */
export function weeklyUsage(trend: SchoolAnalyticsSnapshot["engagementTrend"], generatedAt: string, windowDays: number) {
  const DAY = 86400000;
  const toDay = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  const weekStart = (day: number) => day - ((new Date(day).getUTCDay() + 6) % 7) * DAY;
  const reportingDay = toDay(generatedAt);
  const windowStart = reportingDay - windowDays * DAY;
  const totals = new Map<number, { activities: number; activeStudentDays: number }>();
  for (const point of trend) {
    const start = weekStart(toDay(point.date));
    const week = totals.get(start) ?? { activities: 0, activeStudentDays: 0 };
    week.activities += point.activities;
    week.activeStudentDays += point.activeStudents;
    totals.set(start, week);
  }
  const lastWeek = weekStart(reportingDay);
  const firstWeek = weekStart(windowStart);
  const weeks = [];
  for (let start = firstWeek; start <= lastWeek; start += 7 * DAY) {
    const week = totals.get(start) ?? { activities: 0, activeStudentDays: 0 };
    weeks.push({
      weekStart: new Date(start).toISOString().slice(0, 10),
      ...week,
      partial: (start === lastWeek && new Date(reportingDay).getUTCDay() !== 0) || (start === firstWeek && windowStart > start),
    });
  }
  return weeks;
}
