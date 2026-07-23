"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { getLastRealm } from "@/lib/last-realm";
import { getWeekProgress, isWeekComplete, readProgramStore } from "@/lib/program-progress";
import { useAutoReadSetting } from "@/lib/speak";
import { fetchStudentActivityDaily, type StudentActivityDailyRow } from "@/lib/student-activity";
import { fetchNumberCompatProgressForStudent } from "@/lib/realm-progress-compat";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { resolveStudentNameParts } from "@/lib/studentName";
import { supabase } from "@/lib/supabase";
import { fetchGlobalXp, getExplorerRank } from "@/lib/economy";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  LogOut,
  Medal,
  Search,
  Settings,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  BookOpen,
  House,
  ShoppingBag,
} from "lucide-react";

const MELBOURNE_TIME_ZONE = "Australia/Melbourne";

const REALMS = [
  { name: "Number Nexus", icon: BookOpen, status: "active" as const },
  { name: "Measurelands", icon: BookOpen, status: "active" as const },
  { name: "Reading Ridge", icon: BookOpen, status: "coming-soon" as const },
  { name: "Inkwell Wilds", icon: BookOpen, status: "locked" as const },
  { name: "Runehaven Peaks", icon: BookOpen, status: "locked" as const },
  { name: "Starpath Realm", icon: BookOpen, status: "locked" as const },
  { name: "Statistica", icon: BookOpen, status: "locked" as const },
  { name: "Chance Hollow", icon: BookOpen, status: "locked" as const },
  { name: "Pattern Peaks", icon: BookOpen, status: "locked" as const },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Realm-first: the dashboard "Continue" offers the realm the student last played.
const REALM_LABELS: Record<string, string> = {
  "number-nexus": "Number Nexus",
  measurelands: "Measurelands",
};
const REALM_ROUTES: Record<string, string> = {
  "number-nexus": "/number-nexus",
  measurelands: "/measurelands",
};

const SOCIAL_TEASERS = [
  {
    icon: Users,
    label: "Friends",
    copy: "Coming soon: add classmates, celebrate progress, and cheer each other on.",
  },
  {
    icon: Swords,
    label: "Battles",
    copy: "Coming soon: friendly skill battles where students can challenge others using maths questions.",
  },
  {
    icon: Medal,
    label: "Rankings",
    copy: "Coming soon: class and school leaderboards based on effort, streaks and learning progress.",
  },
];

type SnapshotRow = {
  lesson_attempts?: Record<
    string,
    {
      attempts?: Array<Record<string, unknown>>;
      latestSummary?: Record<string, unknown> | null;
    }
  > | null;
};

function readStudentNameFromStorage() {
  if (typeof window === "undefined") return "Adventurer";
  const profile = getActiveStudentProfile();
  if (profile?.displayName?.trim()) return profile.displayName.trim();

  try {
    const active = localStorage.getItem("lul_active_student_v1");
    if (!active) return "Adventurer";
    const parsed = JSON.parse(active);
    if (parsed?.display_name) return parsed.display_name as string;
    if (typeof active === "string" && active.length < 40) return active;
  } catch {
    // ignore
  }

  return "Adventurer";
}

async function fetchStudentDisplayName(studentId: string) {
  const { data, error } = await supabase
    .rpc("get_student_runtime_context_secure", {
      p_student_id: studentId,
    });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;

  const resolved = resolveStudentNameParts(row);
  return resolved.displayName?.trim() || row.display_name?.trim() || null;
}

function getMelbourneDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: MELBOURNE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
  };
}

function getMelbourneDateKey(date = new Date()) {
  const parts = getMelbourneDateParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function getMonthGrid() {
  const parts = getMelbourneDateParts();
  const year = parts.year;
  const monthIndex = parts.month - 1;
  const today = parts.day;
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const monthName = new Intl.DateTimeFormat("en-AU", {
    timeZone: MELBOURNE_TIME_ZONE,
    month: "long",
  }).format(new Date(year, monthIndex, 1));

  return { offset, daysInMonth, today, monthName, year, monthIndex };
}

function formatDurationCompact(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return safeSeconds > 0 ? "<1m" : "0m";
}

function toSafeNumber(value: unknown) {
  const next = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function computeOverallLessonAccuracy(rows: SnapshotRow[]) {
  let totalCorrect = 0;
  let totalQuestions = 0;

  rows.forEach((row) => {
    const attemptsByLesson = row.lesson_attempts ?? {};
    Object.values(attemptsByLesson).forEach((entry) => {
      const attempts = Array.isArray(entry?.attempts)
        ? entry.attempts
        : entry?.latestSummary && typeof entry.latestSummary === "object"
          ? [entry.latestSummary]
          : [];

      attempts.forEach((attempt) => {
        if (typeof attempt?.completedAt !== "string" && typeof attempt?.at !== "string") return;
        const total = toSafeNumber(attempt?.totalQuestions ?? attempt?.questionsAnswered);
        const correct = toSafeNumber(attempt?.correctCount ?? attempt?.correctAnswers);
        if (total <= 0) return;
        totalQuestions += total;
        totalCorrect += Math.min(correct, total);
      });
    });
  });

  if (totalQuestions <= 0) return null;
  return Math.round((totalCorrect / totalQuestions) * 100);
}

function calculateDayStreak(activityKeys: Set<string>) {
  if (activityKeys.size === 0) return 0;

  const today = new Date();
  const todayKey = getMelbourneDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getMelbourneDateKey(yesterday);

  if (!activityKeys.has(todayKey) && !activityKeys.has(yesterdayKey)) return 0;

  const anchor = activityKeys.has(todayKey) ? new Date(today) : yesterday;
  let streak = 0;
  const cursor = new Date(anchor);

  while (activityKeys.has(getMelbourneDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function formatActivityDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function formatActivitySummary(row: StudentActivityDailyRow) {
  const details: string[] = [];
  if (row.seconds_active > 0) details.push(`${formatDurationCompact(row.seconds_active)} active`);
  if (row.lessons_completed > 0) {
    details.push(`${row.lessons_completed} lesson${row.lessons_completed === 1 ? "" : "s"} completed`);
  }
  if (row.questions_answered > 0) {
    details.push(`${Math.round((row.correct_answers / row.questions_answered) * 100)}% accuracy`);
  }
  return details.length > 0 ? details.join(" • ") : "Started learning";
}

export default function ProfilePage() {
  const router = useRouter();
  const { autoReadEnabled, setAutoReadEnabled } = useAutoReadSetting();
  const [progress] = useState<ReturnType<typeof readProgress>>(() => readProgress());
  const [store] = useState<ReturnType<typeof readProgramStore>>(() => readProgramStore());
  const [studentName, setStudentName] = useState(readStudentNameFromStorage);
  const [activityRows, setActivityRows] = useState<StudentActivityDailyRow[]>([]);
  const [persistedAccuracy, setPersistedAccuracy] = useState<number | null>(null);
  const [globalXp, setGlobalXp] = useState<{ balance: number; lifetime: number } | null>(null);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  // Resolved after mount to avoid an SSR/client hydration mismatch on localStorage.
  const [lastRealm, setLastRealmState] = useState("number-nexus");

  useEffect(() => {
    setLastRealmState(getLastRealm() ?? "number-nexus");
  }, []);

  useEffect(() => {
    const studentId = getActiveStudentProfile()?.studentId;
    if (!studentId) return;
    let cancelled = false;
    void fetchGlobalXp(studentId).then((next) => {
      if (!cancelled) setGlobalXp(next);
    }).catch((error) => console.warn("[Profile] Failed to load global XP", error));
    return () => { cancelled = true; };
  }, []);
  const lastRealmLabel = REALM_LABELS[lastRealm] ?? "Number Nexus";
  const lastRealmRoute = REALM_ROUTES[lastRealm] ?? "/number-nexus";

  const year = progress?.year ?? "Year 1";
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;

  useEffect(() => {
    const profile = getActiveStudentProfile();
    if (!profile?.studentId) return;

    let cancelled = false;

    void (async () => {
      try {
        const fullName = await fetchStudentDisplayName(profile.studentId);
        if (!cancelled && fullName) {
          setStudentName(fullName);
        }
      } catch (error) {
        console.warn("[Profile] Failed to load student name:", error);
      }
    })();

    void (async () => {
      try {
        const [daily, snapshotResponse] = await Promise.all([
          fetchStudentActivityDaily(profile.studentId),
          fetchNumberCompatProgressForStudent(profile.studentId),
        ]);

        if (cancelled) return;

        setActivityRows(daily);
        setPersistedAccuracy(computeOverallLessonAccuracy((snapshotResponse ?? []) as SnapshotRow[]));
      } catch (error) {
        console.warn("[Profile] Failed to load activity stats:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    let completedLessons = 0;
    let weeksCompleted = 0;
    let quizCount = 0;
    let quizTotal = 0;

    for (let week = 1; week <= 12; week += 1) {
      const weekProgress = getWeekProgress(store, year, week);
      const done = weekProgress.lessonsCompleted.filter(Boolean).length;
      completedLessons += done;
      if (weekProgress.quizScore !== undefined) {
        quizCount += 1;
        quizTotal += weekProgress.quizScore;
      }
      if (isWeekComplete(weekProgress)) weeksCompleted += 1;
    }

    const accuracy =
      quizCount > 0 ? Math.round(quizTotal / quizCount) : (progress?.scorePercent ?? 0);
    const realmProgress = Math.round((weeksCompleted / 12) * 100);
    const xp = globalXp?.balance ?? 0;
    const lifetimeXp = globalXp?.lifetime ?? 0;

    return { xp, lifetimeXp, completedLessons, accuracy, weeksCompleted, realmProgress };
  }, [globalXp, progress, store, year]);

  const initials = studentName.charAt(0).toUpperCase();
  const explorerRank = useMemo(() => getExplorerRank(stats.lifetimeXp), [stats.lifetimeXp]);
  const { offset, daysInMonth, today, monthName, year: calendarYear, monthIndex } = useMemo(
    () => getMonthGrid(),
    []
  );

  const activityByDate = useMemo(
    () => new Map(activityRows.map((row) => [row.activity_date, row])),
    [activityRows]
  );
  const activityKeys = useMemo(() => new Set(activityRows.map((row) => row.activity_date)), [activityRows]);
  const totalActiveSeconds = useMemo(
    () => activityRows.reduce((sum, row) => sum + Math.max(0, row.seconds_active ?? 0), 0),
    [activityRows]
  );
  const displayedActiveSeconds = useMemo(
    () => Math.max(totalActiveSeconds, stats.completedLessons * 9 * 60),
    [stats.completedLessons, totalActiveSeconds]
  );
  const dayStreak = useMemo(() => calculateDayStreak(activityKeys), [activityKeys]);
  const dashboardAccuracy = persistedAccuracy ?? (stats.completedLessons > 0 ? stats.accuracy : null);

  const recentActivity = useMemo(() => {
    const items: { icon: typeof Star; text: string; color: string }[] = [];
    if (stats.completedLessons > 0) {
      items.push({
        icon: BookOpen,
        text: `Completed ${stats.completedLessons} lesson${stats.completedLessons !== 1 ? "s" : ""}`,
        color: "text-[#0EA5A4]",
      });
    }
    if (dashboardAccuracy != null) {
      items.push({
        icon: Target,
        text: `Accuracy at ${dashboardAccuracy}%`,
        color: "text-[#0EA5A4]",
      });
    }
    if (stats.weeksCompleted > 0) {
      items.push({
        icon: Trophy,
        text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`,
        color: "text-[#F59E0B]",
      });
    }
    if (items.length === 0) {
      items.push({ icon: Star, text: "Start your first lesson!", color: "text-[#94A3B8]" });
    }
    return items;
  }, [dashboardAccuracy, stats.completedLessons, stats.weeksCompleted]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#E6E8EC] bg-white text-[#0F172A] transition-all hover:bg-[#F1F5F9]"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-[#E6E8EC] bg-white px-4 py-2.5 md:flex">
              <Search className="h-4 w-4 text-[#94A3B8]" />
              <span className="text-sm text-[#94A3B8]">Search your journey…</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/home-base")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E8EC] bg-white text-[#64748B] transition-all hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              aria-label="Home Base"
              title="Home Base"
            >
              <House className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => router.push("/marketplace")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E8EC] bg-white text-[#64748B] transition-all hover:bg-[#FFF7ED] hover:text-[#B45309]"
              aria-label="Marketplace"
              title="Marketplace"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
            </button>
            <div className="flex items-center gap-3 rounded-xl border border-[#E6E8EC] bg-white px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F172A] text-sm font-black text-white">
                {initials}
              </div>
              <div className="hidden pr-1 sm:block">
                <h2 className="text-sm font-bold leading-tight text-[#0F172A]">{studentName}</h2>
                <p className="text-[10px] font-semibold text-[#64748B]">
                  {explorerRank.title} · Rank {explorerRank.level}
                </p>
              </div>
              <div title="Global XP available in every realm" className="flex items-center gap-1 rounded-md border border-[#FDE68A] bg-[#FEF3C7] px-2.5 py-1">
                <Zap className="h-3 w-3 text-[#F59E0B]" />
                <span className="text-xs font-extrabold text-[#B45309]">{globalXp == null ? "—" : stats.xp.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/profile")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E8EC] bg-white text-[#64748B] transition-all hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E8EC] bg-white text-[#64748B] transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#0EA5A4]/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                {new Date().toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <h1 className="text-2xl font-black leading-tight text-white md:text-3xl">
                Welcome back, {studentName}!
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-[#CBD5E1]">
                Your {lastRealmLabel} journey continues. {stats.realmProgress}% through Level {levelNum}.
              </p>
              <button
                onClick={() => router.push(lastRealmRoute)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-extrabold text-[#0F172A] transition-all hover:bg-[#FBBF24] active:scale-95"
              >
                Continue {lastRealmLabel} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">Your Stats</h3>
            <button className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]">See all</button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Flame, value: String(dayStreak), label: "Day Streak", accent: "#F59E0B" },
              { icon: Calendar, value: String(activityRows.length), label: "Days Active", accent: "#0EA5A4" },
              { icon: Clock, value: formatDurationCompact(displayedActiveSeconds), label: "Time", accent: "#0EA5A4" },
              {
                icon: Target,
                value: dashboardAccuracy == null ? "—" : `${dashboardAccuracy}%`,
                label: "Accuracy",
                accent: "#0EA5A4",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="cursor-pointer rounded-xl border border-[#E6E8EC] bg-white p-4 transition-all duration-200 hover:border-[#CBD5E1]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1F5F9]">
                    <card.icon className="h-5 w-5" style={{ color: card.accent }} />
                  </div>
                </div>
                <div className="text-2xl font-black leading-none text-[#0F172A]">{card.value}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-0.5 w-5 rounded-full" style={{ backgroundColor: card.accent }} />
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-xl border border-[#E6E8EC] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Auto Read</h3>
                <p className="mt-1 text-sm text-[#64748B]">Automatically read new questions aloud</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoReadEnabled}
                aria-label="Auto Read"
                onClick={() => setAutoReadEnabled(!autoReadEnabled)}
                className={[
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                  autoReadEnabled ? "bg-[#0EA5A4]" : "bg-[#CBD5E1]",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                    autoReadEnabled ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-xl border border-[#E6E8EC] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
                  <BookOpen className="h-4 w-4 text-[#0EA5A4]" />
                  Enrolled Realms
                </h3>
                <button
                  onClick={() => router.push("/realms")}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  See all
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {REALMS.map((realm) => {
                  const isActive = realm.status === "active";
                  const isComingSoon = realm.status === "coming-soon";
                  const realmRoute = realm.name === "Measurelands" ? "/measurelands" : "/number-nexus";
                  return (
                    <div
                      key={realm.name}
                      onClick={() => isActive && router.push(realmRoute)}
                      className={`relative flex items-center gap-3 rounded-lg border p-2.5 transition-all duration-200 ${
                        isActive
                          ? "cursor-pointer border-[#E6E8EC] bg-white hover:border-[#0EA5A4]"
                          : "border-[#E6E8EC] bg-[#F7F8FA] opacity-70"
                      }`}
                    >
                      {isActive ? (
                        <div
                          className="h-9 w-9 flex-shrink-0 rounded-md border border-[#E6E8EC] bg-cover bg-center"
                          style={{ backgroundImage: `url('${realm.name === "Measurelands" ? "/images/measurelands-home-bg.png" : "/images/number-nexus-tile.jpg"}')` }}
                        />
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[#E6E8EC] bg-[#F1F5F9]">
                          <realm.icon className="h-4 w-4 text-[#94A3B8]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-xs font-bold ${isActive ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
                          {realm.name}
                        </div>
                        {isActive ? (
                          <div className="mt-1 flex items-center gap-1.5">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                              <div
                                className="h-full rounded-full bg-[#0EA5A4] transition-all duration-700"
                                style={{ width: `${stats.realmProgress}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-extrabold text-[#0EA5A4]">{stats.realmProgress}%</span>
                          </div>
                        ) : (
                          <div className="mt-0.5 inline-flex items-center gap-1">
                            {isComingSoon ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                                Coming Soon
                              </span>
                            ) : (
                              <>
                                <Lock className="h-2.5 w-2.5 text-[#94A3B8]" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                  Locked
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#E6E8EC] bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#0F172A]">
                <Star className="h-4 w-4 text-[#F59E0B]" />
                Your Wins
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentActivity.map((item, index) => (
                  <div
                    key={`${item.text}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-[#E6E8EC] bg-[#F7F8FA] px-3 py-2"
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-semibold text-[#0F172A]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-[#E6E8EC] bg-white px-6 py-4">
              {SOCIAL_TEASERS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  title={item.copy}
                  onClick={() => setOpenTooltip((current) => (current === item.label ? null : item.label))}
                  className="group relative flex items-center gap-1.5 opacity-60 transition hover:opacity-100 focus:opacity-100"
                >
                  <item.icon className="h-4 w-4 text-[#64748B]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">{item.label}</span>
                  <div
                    className={`absolute bottom-full left-1/2 z-10 mb-3 w-60 -translate-x-1/2 rounded-lg bg-[#0F172A] px-3 py-2 text-left text-[11px] font-semibold text-white shadow-xl transition ${
                      openTooltip === item.label
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
                    }`}
                  >
                    {item.copy}
                  </div>
                </button>
              ))}
              <div className="flex items-center gap-1.5 border-l border-[#E6E8EC] pl-3">
                <Lock className="h-3 w-3 text-[#94A3B8]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-[#E6E8EC] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                  <Calendar className="h-4 w-4 text-[#0EA5A4]" />
                  Activity
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {monthName}
                </span>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-[9px] font-bold text-[#94A3B8]">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dateKey = `${calendarYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const row = activityByDate.get(dateKey);
                  const isToday = day === today;
                  const isActive = Boolean(row);
                  const isPast = day < today;

                  return (
                    <div
                      key={dateKey}
                      title={`${formatActivityDateLabel(dateKey)} • ${row ? formatActivitySummary(row) : "No learning activity yet"}`}
                      className={`relative flex aspect-square items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                        isToday
                          ? "bg-[#0F172A] text-white"
                          : isActive
                            ? "bg-[#CCFBF1] font-extrabold text-[#0F766E]"
                            : isPast
                              ? "text-[#64748B]"
                              : "text-[#CBD5E1]"
                      }`}
                    >
                      {day}
                      {isActive && !isToday ? (
                        <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-[#0EA5A4]" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-[#1E293B] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5 text-white">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#0EA5A4]/15 blur-2xl" />
              <div className="relative">
                <h4 className="mb-1 text-base font-bold">Daily Challenge</h4>
                <p className="mb-4 text-xs leading-snug text-[#CBD5E1]">A quick sprint for bonus XP</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#F59E0B]">+50 XP</span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Soon
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E6E8EC] bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                <TrendingUp className="h-4 w-4 text-[#0EA5A4]" />
                Level Progress
              </h4>
              <div className="flex items-center gap-3">
                <div className="relative h-[68px] w-[68px] flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#0EA5A4"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${dashboardAccuracy ?? 0} ${100 - (dashboardAccuracy ?? 0)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black leading-none text-[#0F172A]">
                      {dashboardAccuracy == null ? "—" : `${dashboardAccuracy}%`}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">Lessons</span>
                    <span className="font-extrabold text-[#0F172A]">{stats.completedLessons}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">Weeks</span>
                    <span className="font-extrabold text-[#0F172A]">{stats.weeksCompleted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
