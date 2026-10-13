/** Teacher home: a class compared with its class group (or the whole school
 * when the class has no group), from get_class_group_dashboard. Averages are
 * combined from sums and counts, so group figures are exact rather than
 * averages of averages. Pure functions; titles and realm names are passed in. */

export type ClassGroupDashboard = {
  generatedAt: string;
  scope: "group" | "school";
  group: { id: string; name: string } | null;
  classIds: string[];
  periods: { recentStart: string; recentEnd: string; previousStart: string; previousEnd: string };
  classes: Array<{
    classId: string;
    students: number;
    active7d: number;
    atTarget: number;
    quizAverageSum: number;
    quizStudents: number;
    lessonAverageSum: number;
    lessonStudents: number;
  }>;
  realmPeriods: Array<{
    classId: string;
    realmId: string;
    period: "recent" | "previous";
    accuracySum: number | null;
    accuracyCount: number;
    students: number;
    lessons: number;
  }>;
  weekTopics: Array<{
    classId: string;
    realmId: string;
    workingLevel: string;
    week: number;
    accuracySum: number | null;
    accuracyCount: number;
    students: number;
  }>;
};

export type CardStat = { label: string; value: string; compare: string };

export type TrendTag = "whole" | "class" | "ahead";
export type TrendRow = {
  key: string;
  direction: "down" | "up";
  title: string;
  detail: string;
  classValue: string;
  groupValue: string;
  tag: TrendTag | null;
};

export type PeerCard = { classId: string; active7d: number; students: number; quizAverage: number | null };

/** Change smaller than this (points or %) is not called a trend. */
const MIN_CHANGE = 5;
/** Accuracy needs this many results in each period, per class and per group. */
const MIN_CLASS_EVIDENCE = 5;
const MIN_GROUP_EVIDENCE = 5;
/** A topic needs this many results before it is named. */
const MIN_TOPIC_EVIDENCE = 3;
const WEAK_TOPIC = 60;
const TOPIC_GAP = 10;
const MAX_ROWS = 4;

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const signed = (value: number, unit: string) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value)}${unit}`;

export function comparisonLabel(dashboard: ClassGroupDashboard) {
  return dashboard.scope === "group" && dashboard.group ? dashboard.group.name : "School";
}

export function buildCards(dashboard: ClassGroupDashboard, classId: string): CardStat[] | null {
  const mine = dashboard.classes.find((item) => item.classId === classId);
  if (!mine) return null;
  const all = dashboard.classes;
  const sum = (key: keyof (typeof all)[number]) => all.reduce((total, item) => total + Number(item[key]), 0);
  const label = comparisonLabel(dashboard);
  const average = (sumValue: number, count: number) => (count ? `${Math.round(sumValue / count)}%` : "—");
  return [
    { label: "Active this week", value: `${mine.active7d} of ${mine.students}`, compare: `${label}: ${sum("active7d")} of ${sum("students")}` },
    { label: "At target this week", value: `${pct(mine.atTarget, mine.students)}%`, compare: `${label}: ${pct(sum("atTarget"), sum("students"))}%` },
    { label: "Quiz average", value: average(mine.quizAverageSum, mine.quizStudents), compare: `${label}: ${average(sum("quizAverageSum"), sum("quizStudents"))}` },
    { label: "Lesson average", value: average(mine.lessonAverageSum, mine.lessonStudents), compare: `${label}: ${average(sum("lessonAverageSum"), sum("lessonStudents"))}` },
  ];
}

export function buildPeerCards(dashboard: ClassGroupDashboard): PeerCard[] {
  return dashboard.classes.map((item) => ({
    classId: item.classId,
    active7d: item.active7d,
    students: item.students,
    quizAverage: item.quizStudents ? Math.round(item.quizAverageSum / item.quizStudents) : null,
  }));
}

function tagFor(classChange: number, groupChange: number): TrendTag | null {
  if (classChange <= -MIN_CHANGE && groupChange <= -MIN_CHANGE) return "whole";
  if (classChange <= -MIN_CHANGE) return "class";
  if (classChange >= MIN_CHANGE && classChange - groupChange >= MIN_CHANGE) return "ahead";
  return null;
}

export function buildTrendRows(
  dashboard: ClassGroupDashboard,
  classId: string,
  realmName: (realmId: string) => string,
  topicTitle: (realmId: string, workingLevel: string, week: number) => string | null,
): TrendRow[] {
  const rows: TrendRow[] = [];
  const lowerLabel = dashboard.scope === "group" ? "the group" : "the school";

  // 1. Accuracy per realm: last two school weeks vs the two before.
  // "Group" in trends means the other classes, so a class's own change can't
  // make the rest of the group look the same.
  const accuracy = (period: "recent" | "previous", realmId: string, onlyClass: boolean) => {
    const parts = dashboard.realmPeriods.filter((row) => row.realmId === realmId && row.period === period && (onlyClass ? row.classId === classId : row.classId !== classId));
    const count = parts.reduce((total, row) => total + row.accuracyCount, 0);
    const total = parts.reduce((sum, row) => sum + (row.accuracySum ?? 0), 0);
    return { count, average: count ? total / count : null };
  };
  const realms = [...new Set(dashboard.realmPeriods.filter((row) => row.classId === classId).map((row) => row.realmId))];
  for (const realmId of realms) {
    const classRecent = accuracy("recent", realmId, true);
    const classPrevious = accuracy("previous", realmId, true);
    const groupRecent = accuracy("recent", realmId, false);
    const groupPrevious = accuracy("previous", realmId, false);
    if (classRecent.count < MIN_CLASS_EVIDENCE || classPrevious.count < MIN_CLASS_EVIDENCE) continue;
    if (groupRecent.count < MIN_GROUP_EVIDENCE || groupPrevious.count < MIN_GROUP_EVIDENCE) continue;
    const classChange = Math.round(classRecent.average! - classPrevious.average!);
    const groupChange = Math.round(groupRecent.average! - groupPrevious.average!);
    const tag = tagFor(classChange, groupChange);
    if (!tag) continue;
    rows.push({
      key: `realm-${realmId}`,
      direction: classChange < 0 ? "down" : "up",
      title: `${realmName(realmId)} accuracy`,
      detail:
        tag === "whole"
          ? `Down in the other classes in ${lowerLabel} too. Worth re-teaching together.`
          : `Lessons and quizzes: ${Math.round(classPrevious.average!)}% → ${Math.round(classRecent.average!)}% over the last two school weeks.`,
      classValue: signed(classChange, " pts"),
      groupValue: signed(groupChange, " pts"),
      tag,
    });
  }

  // 2. Lessons completed per student: last two school weeks vs the two before.
  const students = (onlyClass: boolean) =>
    dashboard.classes.filter((row) => (onlyClass ? row.classId === classId : row.classId !== classId)).reduce((total, row) => total + row.students, 0);
  const lessons = (period: "recent" | "previous", onlyClass: boolean) =>
    dashboard.realmPeriods.filter((row) => row.period === period && (onlyClass ? row.classId === classId : row.classId !== classId)).reduce((total, row) => total + row.lessons, 0);
  const classPreviousLessons = lessons("previous", true);
  const groupPreviousLessons = lessons("previous", false);
  if (classPreviousLessons >= 10 && groupPreviousLessons >= 10 && students(true) > 0 && students(false) > 0) {
    const classChange = Math.round(((lessons("recent", true) - classPreviousLessons) / classPreviousLessons) * 100);
    const groupChange = Math.round(((lessons("recent", false) - groupPreviousLessons) / groupPreviousLessons) * 100);
    const tag = tagFor(classChange, groupChange);
    if (tag) {
      rows.push({
        key: "lessons",
        direction: classChange < 0 ? "down" : "up",
        title: "Lessons completed",
        detail: `${lessons("recent", true)} lessons in the last two school weeks, ${classPreviousLessons} in the two before.`,
        classValue: signed(classChange, "%"),
        groupValue: signed(groupChange, "%"),
        tag,
      });
    }
  }

  // 3. Weakest topic this fortnight, beside the same topic in the other classes.
  const topicAverage = (row: { accuracySum: number | null; accuracyCount: number }) =>
    row.accuracyCount ? (row.accuracySum ?? 0) / row.accuracyCount : null;
  const weakest = dashboard.weekTopics
    .filter((row) => row.classId === classId && row.accuracyCount >= MIN_TOPIC_EVIDENCE)
    .map((row) => {
      const others = dashboard.weekTopics.filter(
        (other) => other.classId !== classId && other.realmId === row.realmId && other.workingLevel === row.workingLevel && other.week === row.week,
      );
      const otherCount = others.reduce((total, other) => total + other.accuracyCount, 0);
      const otherAverage = otherCount >= MIN_TOPIC_EVIDENCE ? others.reduce((sum, other) => sum + (other.accuracySum ?? 0), 0) / otherCount : null;
      return { row, average: topicAverage(row)!, otherAverage };
    })
    .filter(({ average, otherAverage }) => average < WEAK_TOPIC || (otherAverage !== null && otherAverage - average >= TOPIC_GAP))
    .sort((a, b) => a.average - b.average)[0];
  if (weakest) {
    const { row, average, otherAverage } = weakest;
    const both = otherAverage !== null && otherAverage < WEAK_TOPIC;
    const title = topicTitle(row.realmId, row.workingLevel, row.week);
    rows.push({
      key: `topic-${row.realmId}-${row.workingLevel}-${row.week}`,
      direction: "down",
      title: title ?? `${realmName(row.realmId)} · ${row.workingLevel} week ${row.week}`,
      detail: `${realmName(row.realmId)} · ${row.workingLevel.replace("Year ", "Level ")} · Week ${row.week} · last two school weeks`,
      classValue: `${Math.round(average)}%`,
      groupValue: otherAverage === null ? "—" : `${Math.round(otherAverage)}%`,
      tag: both ? "whole" : otherAverage !== null && otherAverage - average >= TOPIC_GAP ? "class" : null,
    });
  }

  return rows.slice(0, MAX_ROWS);
}
