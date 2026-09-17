"use client";

import { supabase } from "@/lib/supabase";

/**
 * Parent dashboard data layer.
 *
 * Read-only: every call goes through a parent-scoped SECURITY DEFINER RPC that
 * checks an active parent_student_links row. Nothing here writes learning
 * evidence, progression or rewards.
 *
 * Activity is derived from student_activity_daily plus completed attempts, not
 * from live_student_activity: live telemetry is class-scoped, so it is empty
 * for home learners, who are most of the Parent audience.
 */

export type ParentActivityDay = {
  date: string;
  minutes: number;
  secondsActive: number;
  questions: number;
  correct: number;
  lessons: number;
  quizzes: number;
  xp: number;
};

export type ParentActivityFeedItem = {
  kind: "lesson" | "quiz" | "assessment";
  realmId: string;
  workingLevel: string;
  label: string;
  week: number | null;
  lesson: number | null;
  correct: number | null;
  attempted: number | null;
  accuracy: number | null;
  completedAt: string;
};

export type ParentActivity = {
  days: ParentActivityDay[];
  feed: ParentActivityFeedItem[];
};

export type ParentReportLevel = {
  realmId: string;
  workingLevel: string;
  isCurrent: boolean;
  currentWeek: number | null;
  status: string;
  pretestScore: number | null;
  posttestScore: number | null;
  posttestCompletedAt: string | null;
};

export type ParentProgressReport = {
  student: { id: string; name: string; yearLevel: string | null; schoolName: string | null };
  levels: ParentReportLevel[];
  lessonsCompleted: number;
  gemsEarned: number;
  learningDays: number;
  minutesLearning: number;
  passThreshold: number;
};

/** A level counts as mastered at the same threshold the learning program uses. */
export const PARENT_PASS_THRESHOLD = 85;

export const PARENT_LEVEL_LADDER: Array<{ workingLevel: string; label: string }> = [
  { workingLevel: "Prep", label: "Ground" },
  { workingLevel: "Year 1", label: "Level 1" },
  { workingLevel: "Year 2", label: "Level 2" },
  { workingLevel: "Year 3", label: "Level 3" },
  { workingLevel: "Year 4", label: "Level 4" },
  { workingLevel: "Year 5", label: "Level 5" },
  { workingLevel: "Year 6", label: "Level 6" },
];

/**
 * Light-surface realm palette for the Parent portal.
 *
 * The in-realm tokens in lib/useRealmTheme.ts are built for dark realm
 * surfaces, so they read wrong on the Parent portal's light ground. These keep
 * each realm's identity: Measurelands stays gold/amber with violet and never
 * borrows Number Nexus teal.
 */
export type ParentRealmPalette = {
  name: string;
  accent: string;
  accentDeep: string;
  soft: string;
  border: string;
  image: string;
  order: number;
};

const REALM_PALETTES: Record<string, ParentRealmPalette> = {
  number: {
    name: "Number Nexus",
    accent: "#0f9f88",
    accentDeep: "#0b6f5f",
    soft: "#e8fbf6",
    border: "#9fe3d5",
    image: "/images/number-nexus-home-bg-y4.jpg",
    order: 0,
  },
  measurement: {
    name: "Measurelands",
    accent: "#c98218",
    accentDeep: "#7c4f0c",
    soft: "#fff6e6",
    border: "#f0cf92",
    image: "/images/measurelands-home-bg.png",
    order: 1,
  },
  space: {
    name: "Starpath",
    accent: "#7255c7",
    accentDeep: "#4c3591",
    soft: "#f3f0ff",
    border: "#c8bbf2",
    image: "/images/starpath-home-bg-y4.png",
    order: 2,
  },
  statistics: {
    name: "Statistica",
    accent: "#c2557a",
    accentDeep: "#8e3341",
    soft: "#fff0f4",
    border: "#f2b9cc",
    image: "/images/statistica-home-y3.png",
    order: 3,
  },
  pattern: {
    name: "Pattern Peaks",
    accent: "#2f9e73",
    accentDeep: "#1f6b4e",
    soft: "#ecfbf4",
    border: "#a5e3c9",
    image: "/images/patternpeaks-home-bg-y4.jpeg",
    order: 4,
  },
  chance: {
    name: "Chance Hollow",
    accent: "#0f8ba8",
    accentDeep: "#0a6178",
    soft: "#eaf8fc",
    border: "#a3dcea",
    image: "/images/chancehollow-home-y4.jpeg",
    order: 5,
  },
};

/** Canonical realm id: progress rows and legends use a few historical aliases. */
export function canonicalParentRealmId(realmId: string) {
  if (realmId === "starpath") return "space";
  if (realmId === "statistica") return "statistics";
  if (realmId === "pattern-peaks" || realmId === "algebra") return "pattern";
  if (realmId === "chance-hollow" || realmId === "probability") return "chance";
  return realmId;
}

export function parentRealmPalette(realmId: string): ParentRealmPalette {
  return (
    REALM_PALETTES[canonicalParentRealmId(realmId)] ?? {
      name: realmId,
      accent: "#4b6068",
      accentDeep: "#2c3a40",
      soft: "#f1f5f6",
      border: "#cbd5d8",
      image: "/images/realm-select-bg.jpg",
      order: 99,
    }
  );
}

export function parentRealmName(realmId: string) {
  return parentRealmPalette(realmId).name;
}

export async function fetchParentChildActivity(studentId: string, days = 28): Promise<ParentActivity> {
  const { data, error } = await supabase.rpc("get_parent_child_activity", {
    p_student_id: studentId,
    p_days: days,
  });
  if (error) throw error;
  const result = (data ?? {}) as Partial<ParentActivity>;
  return { days: result.days ?? [], feed: result.feed ?? [] };
}

export async function fetchParentProgressReport(studentId: string): Promise<ParentProgressReport | null> {
  const { data, error } = await supabase.rpc("get_parent_child_progress_report", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return (data as ParentProgressReport | null) ?? null;
}

function activeDay(day: ParentActivityDay) {
  return day.questions > 0 || day.lessons > 0 || day.quizzes > 0 || day.secondsActive > 0;
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Consecutive active days ending today (or yesterday, so an evening learner
 * doesn't watch the streak vanish at midnight before they've played).
 */
export function activityStreak(days: ParentActivityDay[], today = new Date()) {
  const active = new Set(days.filter(activeDay).map((day) => day.date));
  if (active.size === 0) return 0;

  const cursor = new Date(today);
  if (!active.has(isoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!active.has(isoDate(cursor))) return 0;
  }

  let streak = 0;
  while (active.has(isoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** The last 7 calendar days, oldest first, with zero-filled gaps. */
export function lastSevenDays(days: ParentActivityDay[], today = new Date()) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const key = isoDate(date);
    const day = byDate.get(key);
    return {
      date: key,
      weekdayLabel: new Intl.DateTimeFormat("en-AU", { weekday: "narrow" }).format(date),
      minutes: day?.minutes ?? 0,
      questions: day?.questions ?? 0,
      lessons: day?.lessons ?? 0,
      quizzes: day?.quizzes ?? 0,
      active: day ? activeDay(day) : false,
      isToday: index === 6,
    };
  });
}

export function minutesInLastSevenDays(days: ParentActivityDay[], today = new Date()) {
  return lastSevenDays(days, today).reduce((total, day) => total + day.minutes, 0);
}

export type ParentRealmGrowth = {
  realmId: string;
  workingLevel: string;
  currentWeek: number | null;
  pretestScore: number | null;
  posttestScore: number | null;
  growth: number | null;
  mastered: boolean;
  masteredLevels: number;
};

/**
 * Per-realm growth from matched pre/post evidence on the same level, plus how
 * many levels in that realm have a passed post-test. Only the current level
 * reports growth, so a number here always refers to one comparable pair.
 */
export function realmGrowthFromReport(report: ParentProgressReport): ParentRealmGrowth[] {
  const byRealm = new Map<string, ParentReportLevel[]>();
  for (const level of report.levels) {
    const realmId = canonicalParentRealmId(level.realmId);
    const rows = byRealm.get(realmId) ?? [];
    rows.push(level);
    byRealm.set(realmId, rows);
  }

  const threshold = report.passThreshold ?? PARENT_PASS_THRESHOLD;
  return [...byRealm.entries()]
    .map(([realmId, rows]) => {
      const current = rows.find((row) => row.isCurrent) ?? rows[rows.length - 1];
      const masteredLevels = rows.filter(
        (row) => row.posttestScore !== null && row.posttestScore >= threshold,
      ).length;
      const growth =
        current?.pretestScore !== null && current?.pretestScore !== undefined &&
        current?.posttestScore !== null && current?.posttestScore !== undefined
          ? current.posttestScore - current.pretestScore
          : null;
      return {
        realmId,
        workingLevel: current?.workingLevel ?? "",
        currentWeek: current?.currentWeek ?? null,
        pretestScore: current?.pretestScore ?? null,
        posttestScore: current?.posttestScore ?? null,
        growth,
        mastered: Boolean(current?.posttestScore !== null && (current?.posttestScore ?? 0) >= threshold),
        masteredLevels,
      };
    })
    .sort((left, right) => parentRealmPalette(left.realmId).order - parentRealmPalette(right.realmId).order);
}

export function formatFeedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = Date.now();
  // Clamp to zero: a device clock running behind the server must not render a
  // completed activity as happening in the future.
  const diffMinutes = Math.max(0, Math.round((now - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(date);
}
