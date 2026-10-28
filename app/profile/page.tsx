"use client";

import { Fragment, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { profileRealmSummary } from "@/lib/profile-realm-summary";
import { getLiveRealmDefinitions, tryCanonicalRealmId } from "@/lib/realms/realm-registry";
import RealmProgressPanel from "@/components/profile/RealmProgressPanel";
import { useAutoReadSetting } from "@/lib/speak";
import { fetchStudentActivityDaily, type StudentActivityDailyRow } from "@/lib/student-activity";
import { fetchRealmCompatProgressForStudent, type CompatProgressRow } from "@/lib/realm-progress-compat";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { resolveStudentNameParts } from "@/lib/studentName";
import { supabase } from "@/lib/supabase";
import { fetchGlobalXp, getExplorerRank } from "@/lib/economy";
import { Check, ChevronLeft, Copy, LogOut, Settings, Zap } from "lucide-react";
import GemIcon, { cutForGem, emblemForGem } from "@/components/gems/GemIcon";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { CHRONOROK_OPEN_DAYS, CRYSTALS_TO_AWAKEN, chronorokForGrade, chronorokProgress } from "@/lib/chronorok";
import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { fetchGemVault, type GemDefinition, type GemVault } from "@/lib/gems";
import { stoneForGem } from "@/lib/gem-stones";
import { collectedReliqsByRealm, type CollectedReliqs } from "@/lib/reliqs-collected";

const MELBOURNE_TIME_ZONE = "Australia/Melbourne";

const REALM_IMAGES: Record<string, string> = {
  number: "/images/number-nexus-tile.jpg", measurement: "/images/measurelands-home-bg.png",
  space: "/images/starpath-home-bg-y3.png", statistics: "/images/statistica-home-y3.png",
  pattern: "/images/patternpeaks-home-bg-y3.jpeg", chance: "/images/chancehollow-home-y3.jpeg",
};
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

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
    details.push(`${row.questions_answered} question${row.questions_answered === 1 ? "" : "s"}`);
  }
  return details.length > 0 ? details.join(" • ") : "Started learning";
}

export default function ProfilePage() {
  const router = useRouter();
  const { autoReadEnabled, setAutoReadEnabled } = useAutoReadSetting();
  const [realmRows, setRealmRows] = useState<CompatProgressRow[]>([]);
  const [studentName, setStudentName] = useState(readStudentNameFromStorage);
  const [activityRows, setActivityRows] = useState<StudentActivityDailyRow[]>([]);
  const [globalXp, setGlobalXp] = useState<{ balance: number; lifetime: number } | null>(null);
  const [explorerCode, setExplorerCode] = useState<string | null>(null);
  const [explorerCodeCopied, setExplorerCodeCopied] = useState(false);

  useEffect(() => {
    const studentId = getActiveStudentProfile()?.studentId;
    if (!studentId) return;
    let cancelled = false;
    void fetchGlobalXp(studentId).then((next) => {
      if (!cancelled) setGlobalXp(next);
    }).catch((error) => console.warn("[Profile] Failed to load global XP", error));
    return () => { cancelled = true; };
  }, []);
  const realmSummaries = useMemo(() => Object.fromEntries(getLiveRealmDefinitions().map(realm => [realm.realmId, profileRealmSummary(realm.realmId, realmRows)])), [realmRows]);

  useEffect(() => {
    const profile = getActiveStudentProfile();
    if (!profile?.studentId) return;

    let cancelled = false;

    void (async () => {
      try {
        const [fullName, explorerCodeResponse] = await Promise.all([
          fetchStudentDisplayName(profile.studentId),
          supabase.rpc("get_student_explorer_code_secure", {
            p_student_id: profile.studentId,
          }),
        ]);
        if (!cancelled && fullName) {
          setStudentName(fullName);
        }
        if (!cancelled && !explorerCodeResponse.error) {
          setExplorerCode(
            typeof explorerCodeResponse.data === "string"
              ? explorerCodeResponse.data
              : null
          );
        }
      } catch (error) {
        console.warn("[Profile] Failed to load student identity details:", error);
      }
    })();

    void (async () => {
      try {
        const [daily, snapshotResponse] = await Promise.all([
          fetchStudentActivityDaily(profile.studentId),
          Promise.all(getLiveRealmDefinitions().map(realm => fetchRealmCompatProgressForStudent(realm.realmId, profile.studentId))),
        ]);

        if (cancelled) return;

        setActivityRows(daily);
        setRealmRows(snapshotResponse.flat());
      } catch (error) {
        console.warn("[Profile] Failed to load activity stats:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => ({
    xp: globalXp?.balance ?? 0, lifetimeXp: globalXp?.lifetime ?? 0,
    completedLessons: Object.values(realmSummaries).reduce((sum, realm) => sum + (realm?.completedLessons ?? 0), 0),
    weeksCompleted: Object.values(realmSummaries).reduce((sum, realm) => sum + (realm?.weeksCompleted ?? 0), 0),
  }), [globalXp, realmSummaries]);

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
  const dayStreak = useMemo(() => calculateDayStreak(activityKeys), [activityKeys]);

  const bestStreak = useMemo(() => longestStreak(activityKeys), [activityKeys]);
  const weekDays = useMemo(() => currentWeekKeys(), []);
  const questionsAnswered = useMemo(() => activityRows.reduce((sum, row) => sum + Math.max(0, row.questions_answered ?? 0), 0), [activityRows]);
  const weekKeySet = useMemo(() => new Set(weekDays.map((day) => day.key)), [weekDays]);
  const thisWeek = useMemo(() => activityRows.filter((row) => weekKeySet.has(row.activity_date)).reduce(
    (sum, row) => ({ questions: sum.questions + Math.max(0, row.questions_answered ?? 0), seconds: sum.seconds + Math.max(0, row.seconds_active ?? 0) }),
    { questions: 0, seconds: 0 },
  ), [activityRows, weekKeySet]);
  const learningDaysThisMonth = useMemo(() => {
    const prefix = `${calendarYear}-${String(monthIndex + 1).padStart(2, "0")}-`;
    return activityRows.filter((row) => row.activity_date.startsWith(prefix)).length;
  }, [activityRows, calendarYear, monthIndex]);
  const demoPreviewMode = useDemoPreviewMode();
  const crystals = useMemo(() => (demoPreviewMode ? { crystals: 63, open: true, learningDays: 63 } : chronorokProgress(activityRows)), [activityRows, demoPreviewMode]);
  const [yearLevel] = useState(() => getActiveStudentProfile()?.yearLevel ?? null);
  const xpToNextRank = Math.max(0, explorerRank.nextLevelXp - explorerRank.currentXp);

  const demoPreview = useDemoPreviewMode();
  const [reliqs, setReliqs] = useState<CollectedReliqs[]>([]);
  useEffect(() => {
    // Progress lives in this browser's realm records; read it after mount.
    queueMicrotask(() => setReliqs(collectedReliqsByRealm(demoPreview)));
  }, [demoPreview]);
  const reliqsEarned = reliqs.reduce((sum, realm) => sum + realm.collected, 0);
  const reliqsTotal = reliqs.reduce((sum, realm) => sum + realm.total, 0);

  const [gemVault, setGemVault] = useState<GemVault | null>(null);
  useEffect(() => {
    const studentId = getActiveStudentProfile()?.studentId;
    if (!studentId) return;
    let cancelled = false;
    void fetchGemVault(studentId).then((vault) => { if (!cancelled) setGemVault(vault); })
      .catch((error) => console.warn("[Profile] Gem Vault could not be loaded", error));
    return () => { cancelled = true; };
  }, []);
  const gems = useMemo(() => {
    const definitions = gemVault?.definitions ?? [];
    const byId = new Map(definitions.map((gem) => [gem.id, gem]));
    const owned = [...(gemVault?.owned ?? [])].sort((a, b) => b.earned_at.localeCompare(a.earned_at));
    const ownedIds = new Set(owned.map((gem) => gem.gem_id));
    const latest = owned.map((gem) => ({ gem: byId.get(gem.gem_id), earnedAt: gem.earned_at })).filter((entry): entry is { gem: GemDefinition; earnedAt: string } => Boolean(entry.gem));
    // The gem they are closest to: the highest share of its target, not yet earned.
    const next = definitions
      .filter((gem) => gem.is_active && !ownedIds.has(gem.id) && gem.target > 0 && gem.current > 0 && gem.current < gem.target)
      .sort((a, b) => b.current / b.target - a.current / a.target)[0] ?? null;
    return { count: owned.length, latest, next };
  }, [gemVault]);

  const realmCards = useMemo(() => getLiveRealmDefinitions().map((realm) => {
    const summary = realmSummaries[realm.realmId];
    return {
      id: realm.realmId,
      name: realm.name,
      color: reliqRealmColor(realm.realmId),
      image: REALM_IMAGES[realm.realmId],
      route: summary?.route ?? `/${realm.slug}`,
      level: summary ? levelLabel(summary.year) : null,
      weeksCompleted: summary?.weeksCompleted ?? 0,
      totalWeeks: summary?.totalWeeks ?? 0,
      summary,
    };
  }), [realmSummaries]);

  // Tapping a realm opens its progress panel under that card's row.
  const [openRealm, setOpenRealm] = useState<string | null>(null);
  const columns = useGridColumns();
  const openIndex = realmCards.findIndex((realm) => realm.id === openRealm);
  const openCard = openIndex >= 0 ? realmCards[openIndex] : null;
  const panelAfter = openIndex >= 0 ? Math.min(realmCards.length - 1, Math.floor(openIndex / columns) * columns + columns - 1) : -1;
  const panelGems = useMemo(() => openCard
    ? gems.latest.map((entry) => entry.gem).filter((gem) => tryCanonicalRealmId(gem.realm_id) === openCard.id)
    : [], [gems.latest, openCard]);

  const wins = useMemo(() => {
    const items: Array<{ color: string; title: string; detail: string; when: string }> = [];
    for (const { gem, earnedAt } of gems.latest.slice(0, 3)) {
      items.push({ color: "#f5c451", title: "Gem earned", detail: gem.name, when: formatWhen(earnedAt) });
    }
    for (const realm of realmCards) {
      if (realm.level && realm.totalWeeks > 0 && realm.weeksCompleted >= realm.totalWeeks) {
        items.push({ color: realm.color, title: realm.name, detail: `Finished ${realm.level}`, when: "" });
      }
    }
    if (explorerRank.level > 1) items.push({ color: "#c94df2", title: "Rank up", detail: `${explorerRank.title} · Rank ${explorerRank.level}`, when: "" });
    if (bestStreak >= 2) items.push({ color: "#ff8a3d", title: "Best streak", detail: `${bestStreak} days in a row`, when: "" });
    return items.slice(0, 5);
  }, [bestStreak, explorerRank.level, explorerRank.title, gems.latest, realmCards]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#120e1c] font-sans text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[url('/images/central-world-valley-panorama.png')] bg-cover bg-[center_30%]" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120e1c]/40 to-[#120e1c]" />
      </div>
      <div className="relative mx-auto max-w-[1240px] px-4 pb-12 pt-5 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <button type="button" onClick={() => router.push("/world")} className={`${GLASS} inline-flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.04em] hover:bg-white/10`}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />BACK TO MY WORLD
            </button>
            <svg viewBox="0 0 279 79" role="img" aria-label="RELIQ" className="hidden h-auto w-[130px] sm:block">
              <path fill="#FFFFFF" d={RELIQ_LETTERS_PATH} />
              <path fill="#C94DF2" d={RELIQ_Q_PATH} />
            </svg>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen} aria-label="Settings" title="Settings" className={`${GLASS} grid h-12 w-12 place-items-center rounded-full hover:bg-white/10`}>
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
            {settingsOpen ? (
              <div className="absolute right-0 top-14 z-20 w-[300px] rounded-2xl bg-white p-2 text-[#16121f] shadow-2xl" role="dialog" aria-label="Settings">
                <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-3">
                  <div>
                    <p className="font-display text-sm font-black">Auto Read</p>
                    <p className="text-sm text-[#5f5670]">Read new questions aloud</p>
                  </div>
                  <button type="button" role="switch" aria-checked={autoReadEnabled} aria-label="Auto Read" onClick={() => setAutoReadEnabled(!autoReadEnabled)} className={`relative h-7 w-12 rounded-full transition ${autoReadEnabled ? "bg-[#C94DF2]" : "bg-[#d9d4e2]"}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${autoReadEnabled ? "left-6" : "left-1"}`} />
                  </button>
                </div>
                {explorerCode ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-3">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-black">Explorer Code</p>
                      <p className="truncate font-mono text-sm text-[#5f5670]">{explorerCode}</p>
                    </div>
                    <button type="button" onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(explorerCode);
                        setExplorerCodeCopied(true);
                        window.setTimeout(() => setExplorerCodeCopied(false), 1500);
                      } catch { /* clipboard unavailable */ }
                    }} aria-label="Copy Explorer Code" title={explorerCodeCopied ? "Copied" : "Copy Explorer Code"} className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-[#e6e0ee] hover:bg-[#f3eef8]">
                      {explorerCodeCopied ? <Check className="h-4 w-4 text-[#3D6600]" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                ) : null}
                <div className="my-1 border-t border-[#eee]" />
                <button type="button" onClick={() => router.push("/login")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-[#f3eef8]">
                  <LogOut className="h-4 w-4" aria-hidden="true" />Log out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr]" aria-label="About me">
          <div className={`${GLASS} flex items-center gap-4 rounded-3xl p-5 sm:gap-5 sm:p-6`}>
            <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-[20px] sm:h-24 sm:w-24 sm:rounded-[28px] bg-gradient-to-br from-[#D86BF7] to-[#8C2EAC] font-display text-4xl font-black shadow-[0_12px_30px_rgba(140,46,172,0.5)]">{initials}</div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-2xl font-black leading-tight sm:text-[30px]">{studentName}</h1>
              <p className="mt-1 font-bold text-[#e9d5ff]">{explorerRank.title} · Rank {explorerRank.level}</p>
              <div className="mt-3 h-3.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={`Progress to Rank ${explorerRank.level + 1}`} aria-valuenow={explorerRank.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#f5c451] to-[#ffdf7e]" style={{ width: `${Math.min(100, Math.max(0, explorerRank.progressPercent))}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between gap-2 text-sm font-bold text-[#d8d2e4]">
                <span><Zap className="mr-1 inline h-4 w-4 text-[#ffd76a]" aria-hidden="true" /><b className="text-[#ffd76a]">{stats.lifetimeXp} XP</b> earned</span>
                <span>{xpToNextRank} XP to Rank {explorerRank.level + 1}</span>
              </div>
            </div>
          </div>

          <div className={`${GLASS} flex flex-col justify-between rounded-3xl p-6`}>
            <div className="flex items-center gap-4">
              <StreakFlame />
              <div>
                <p className="font-display text-[42px] font-black leading-none">{dayStreak}</p>
                <p className="font-display text-xs font-black tracking-[0.08em] text-[#ffcf8a]">DAY STREAK</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label="This week">
              {weekDays.map((day) => {
                const active = activityKeys.has(day.key);
                return (
                  <span key={day.key} title={formatActivityDateLabel(day.key)} className={`grid h-10 place-items-center rounded-xl font-display text-xs font-black ${active ? "bg-gradient-to-br from-[#ffb347] to-[#ff7a3d] text-white" : "bg-white/[0.08] text-[#a59cb5]"} ${day.isToday ? "outline outline-2 outline-white" : ""}`}>{day.label}</span>
                );
              })}
            </div>
            <p className="mt-3 text-sm font-bold text-[#cfc7dc]">
              {bestStreak > 0 ? `Best streak: ${bestStreak} day${bestStreak === 1 ? "" : "s"}` : "Learn today to start a streak"}
              {dayStreak > 0 ? ` · Come back tomorrow to make it ${dayStreak + 1}!` : ""}
            </p>
          </div>

          <div className={`${GLASS} rounded-3xl p-6`}>
            <div className="flex items-baseline justify-between">
              <p className={SECTION}>Gems · {gems.count}</p>
              <button type="button" onClick={() => router.push("/gem-vault")} className="text-sm font-extrabold text-[#e2c6ff] hover:text-white">Gem Vault →</button>
            </div>
            <div className="flex gap-2.5">
              {gems.latest.slice(0, 3).map(({ gem }) => (
                <span key={gem.id} title={gem.name} className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.07]">
                  <GemIcon rarity={gem.rarity} cut={cutForGem(gem.id, gem.rarity)} emblem={emblemForGem(gem.realm_id, gem.milestone_type)} stone={stoneForGem(gem)} size={52} />
                </span>
              ))}
              {gems.count === 0 ? <p className="text-sm font-semibold text-[#cfc7dc]">Finish lessons, quizzes and streaks to earn gems.</p> : null}
            </div>
            {gems.next ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/[0.05] px-3 py-2.5">
                <span className="opacity-60"><GemIcon rarity={gems.next.rarity} cut={cutForGem(gems.next.id, gems.next.rarity)} emblem={emblemForGem(gems.next.realm_id, gems.next.milestone_type)} stone={stoneForGem(gems.next)} size={38} locked /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[13px] font-black">Next: {gems.next.name}</p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#D86BF7] to-[#f0b6ff]" style={{ width: `${Math.round((gems.next.current / gems.next.target) * 100)}%` }} /></div>
                  <p className="mt-1 text-[13px] font-bold text-[#cfc7dc]">{gems.next.current} of {gems.next.target}</p>
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={() => router.push(demoPreview ? "/world/chronorok?teacher_preview=1" : "/world/chronorok")} className={`${GLASS} rounded-3xl p-6 text-left`} aria-label="Chrono Crystals. Open Chronorok.">
            <div className="flex items-baseline justify-between">
              <p className={SECTION}>Chrono Crystals</p>
              <span className="whitespace-nowrap text-sm font-extrabold text-[#e2c6ff]">Open →</span>
            </div>
            <div className="flex items-center gap-3.5">
              <svg width="42" height="52" viewBox="0 0 80 100" aria-hidden="true" className="drop-shadow-[0_0_12px_rgba(255,190,70,0.8)]"><polygon points="40,2 66,30 56,94 24,94 14,30" fill="#ffc94a" /><polygon points="40,2 66,30 40,40" fill="#fff8e0" /><polygon points="40,40 66,30 56,94" fill="#d9770f" /><polygon points="40,40 14,30 24,94" fill="#ffd77a" /></svg>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[34px] font-black leading-none">{crystals.crystals}<span className="text-base text-[#f6e7c8]"> / {CRYSTALS_TO_AWAKEN}</span></p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#ffb347] to-[#ffe08a]" style={{ width: `${(crystals.crystals / CRYSTALS_TO_AWAKEN) * 100}%` }} /></div>
              </div>
            </div>
            <p className="mt-3 text-[13px] font-bold text-[#cfc7dc]">
              {crystals.open
                ? <>One for every day you learn · {Math.max(0, CRYSTALS_TO_AWAKEN - crystals.crystals)} more to awaken <b className="text-[#ffd76a]">{chronorokForGrade(demoPreviewMode ? "Year 3" : yearLevel).name}</b></>
                : <>Learn on {Math.max(0, CHRONOROK_OPEN_DAYS - crystals.learningDays)} more day{CHRONOROK_OPEN_DAYS - crystals.learningDays === 1 ? "" : "s"} to open Chronorok</>}
            </p>
          </button>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4" aria-label="My numbers">
          <StatCard value={String(stats.weeksCompleted)} label="Weeks completed" note="across all realms" />
          <StatCard value={questionsAnswered.toLocaleString("en-AU")} label="Questions answered" note={`${thisWeek.questions} this week`} />
          <StatCard value={formatDurationCompact(totalActiveSeconds)} label="Learning time" note={`${formatDurationCompact(thisWeek.seconds)} this week`} />
          <StatCard value={String(reliqsEarned)} label="RELIQS earned" note="cards in Hall of Legends" />
        </section>

        <section className="mt-8" aria-label="My realms">
          <div className="flex items-baseline justify-between">
            <p className={SECTION}>My realms · tap a realm to see your weeks</p>
            <button type="button" onClick={() => router.push("/world/tower")} className="text-sm font-extrabold text-[#e2c6ff] hover:text-white">Open the Tower →</button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {realmCards.map((realm, index) => {
              const done = realm.totalWeeks > 0 && realm.weeksCompleted >= realm.totalWeeks;
              const isOpen = realm.id === openRealm;
              return (
                <Fragment key={realm.id}>
                <button type="button" aria-expanded={realm.summary ? isOpen : undefined} onClick={() => realm.summary ? setOpenRealm(isOpen ? null : realm.id) : router.push(realm.route)} className={`overflow-hidden rounded-[22px] border-2 bg-[#161222]/80 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94DF2] ${isOpen ? "" : "border-white/10 hover:border-white/25"}`} style={isOpen ? { borderColor: realm.color, boxShadow: `0 0 0 4px ${realm.color}2e` } : undefined}>
                  <div className="relative flex h-[150px] flex-col justify-end bg-cover bg-center px-4 pb-3" style={{ backgroundImage: `linear-gradient(180deg, rgba(14,10,22,.05), rgba(14,10,22,.85)), url('${realm.image}')` }}>
                    <span className="absolute left-3.5 top-3 grid h-10 w-10 place-items-center rounded-xl bg-[#0e0a16]/60 backdrop-blur" aria-hidden="true">
                      <svg viewBox="236 0 44 79" className="h-7 w-auto"><path fill={realm.color} d={RELIQ_Q_PATH} /></svg>
                    </span>
                    <span className="font-display text-xl font-black">{realm.name}</span>
                    <span className="mt-0.5 font-display text-[13px] font-black uppercase tracking-[0.06em]" style={{ color: realm.color }}>
                      {realm.level ? (done ? `${realm.level} · complete` : `${realm.level} · Week ${realm.weeksCompleted + 1}`) : "Not started yet"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 pb-3.5 pt-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${realm.totalWeeks ? Math.round((realm.weeksCompleted / realm.totalWeeks) * 100) : 0}%`, background: realm.color }} /></div>
                    <span className="whitespace-nowrap text-[13px] font-extrabold text-[#d8d2e4]">{done ? "Level done!" : realm.totalWeeks ? `${realm.weeksCompleted} of ${realm.totalWeeks} weeks` : "Tap to begin"}</span>
                  </div>
                </button>
                {index === panelAfter && openCard?.summary && openCard.level ? (
                  <RealmProgressPanel
                    realm={{ id: openCard.id, name: openCard.name, color: openCard.color, route: openCard.route, year: openCard.summary.year, levelLabel: openCard.level, weeksCompleted: openCard.weeksCompleted, totalWeeks: openCard.totalWeeks, weeks: openCard.summary.weeks, pretest: openCard.summary.pretest, posttest: openCard.summary.posttest, levelPassed: openCard.summary.levelPassed }}
                    gems={panelGems}
                    onContinue={() => router.push(openCard.route)}
                    onClose={() => setOpenRealm(null)}
                  />
                ) : null}
                </Fragment>
              );
            })}
          </div>
        </section>

        <FriendsAndBattlesPreview initial={initials} />

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className={`${GLASS} rounded-3xl p-6`} aria-label="My wins">
            <p className={SECTION}>My wins</p>
            {wins.length ? wins.map((win, index) => (
              <div key={`${win.title}-${index}`} className={`flex items-center gap-3.5 py-3 ${index ? "border-t border-white/[0.08]" : ""}`}>
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-[5px]" style={{ background: win.color }} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-black">{win.title}</p>
                  <p className="font-semibold text-[#d8d2e4]">{win.detail}</p>
                </div>
                {win.when ? <span className="whitespace-nowrap text-[13px] font-bold text-[#a99fba]">{win.when}</span> : null}
              </div>
            )) : null}
            {wins.length < 3 ? (
              <div className={wins.length ? "mt-2 border-t border-white/[0.08] pt-3" : ""}>
                <p className="mb-1 text-sm font-bold text-[#a99fba]">{wins.length ? "Wins to go for" : "Your first win is one lesson away. Wins to go for:"}</p>
                {WIN_GOALS.slice(0, 4 - wins.length).map((goal) => (
                  <div key={goal.title} className="flex items-center gap-3.5 py-2 opacity-60">
                    <span className="h-3.5 w-3.5 flex-shrink-0 rounded-[5px] border-2 border-dashed border-white/40" />
                    <div><p className="font-display text-[15px] font-black">{goal.title}</p><p className="font-semibold text-[#d8d2e4]">{goal.detail}</p></div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={`${GLASS} rounded-3xl p-6`} aria-label="Learning calendar">
            <div className="flex items-baseline justify-between">
              <p className={SECTION}>{monthName}</p>
              <span className="text-sm font-bold text-[#bdb3cc]">{learningDaysThisMonth} learning day{learningDaysThisMonth === 1 ? "" : "s"}</span>
            </div>
            <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center font-display text-[11px] font-black text-[#8d84a0]">
              {DAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: offset }).map((_, index) => <span key={`empty-${index}`} />)}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateKey = `${calendarYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const row = activityByDate.get(dateKey);
                const isToday = day === today;
                return (
                  <span key={dateKey} title={`${formatActivityDateLabel(dateKey)} • ${row ? formatActivitySummary(row) : "No learning yet"}`} className={`grid h-[34px] place-items-center rounded-[10px] text-[13px] font-extrabold ${isToday ? "bg-gradient-to-br from-[#D86BF7] to-[#8C2EAC] text-white" : row ? "bg-[#C94DF2]/30 text-white shadow-[inset_0_0_0_1px_rgba(216,107,247,0.6)]" : day < today ? "bg-white/[0.04] text-[#9a90ab]" : "text-[#5f5670]"}`}>{day}</span>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] font-bold text-[#bdb3cc]"><span className="mr-1.5 inline-block h-[11px] w-[11px] rounded-[4px] bg-[#C94DF2]/45 align-[-1px]" />Learned that day</p>
          </div>
        </section>

        <section className={`${GLASS} mt-4 rounded-3xl p-6`} aria-label="Hall of Legends">
          <div className="flex items-baseline justify-between">
            <p className={SECTION}>Hall of Legends · {reliqsEarned} of {reliqsTotal} RELIQS</p>
            <button type="button" onClick={() => router.push("/legends")} className="text-sm font-extrabold text-[#e2c6ff] hover:text-white">Visit Hall of Legends →</button>
          </div>
          <p className="-mt-1 mb-3.5 font-semibold text-[#cfc7dc]">Finish a level in a realm to earn its RELIQ card.</p>
          <div className="grid gap-2.5 md:grid-cols-2">
            {reliqs.map((realm) => {
              const color = reliqRealmColor(realm.legendRealm);
              return (
                <div key={realm.legendRealm} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.05] px-3.5 py-2.5">
                  <span className="min-w-0 font-display text-sm font-black sm:text-[15px]">{realm.name}</span>
                  <span className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1" aria-label={`${realm.collected} of ${realm.total} RELIQS`}>
                    {Array.from({ length: realm.total }).map((_, index) => (
                      <svg key={index} viewBox="236 0 44 79" className="h-5 w-auto sm:h-7" aria-hidden="true"><path fill={index < realm.collected ? color : "#4a4258"} d={RELIQ_Q_PATH} /></svg>
                    ))}
                    <span className="ml-1.5 w-9 text-right text-[13px] font-extrabold text-[#d8d2e4] sm:ml-2 sm:w-12">{realm.collected}/{realm.total}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

const WIN_GOALS = [
  { title: "Finish a week", detail: "Complete the lessons and quiz for a week" },
  { title: "Earn a gem", detail: "Lessons, perfect scores and streaks earn gems" },
  { title: "Start a streak", detail: "Learn two days in a row" },
  { title: "Rank up", detail: "Earn XP to reach the next Explorer rank" },
];

const GLASS = "border border-white/[0.12] bg-[#161222]/70 shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl";
const SECTION = "mb-3 font-display text-xs font-black uppercase tracking-[0.14em] text-[#d9b8ff]";

function StatCard({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className={`${GLASS} rounded-3xl px-5 py-4`}>
      <p className="font-display text-[30px] font-black leading-tight">{value}</p>
      <p className="font-display text-[11px] font-black uppercase tracking-[0.1em] text-[#cbb6e6]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[#a99fba]">{note}</p>
    </div>
  );
}

function StreakFlame() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" aria-hidden="true" className="drop-shadow-[0_6px_14px_rgba(255,140,40,0.45)]">
      <defs><linearGradient id="profile-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff5a1f" /><stop offset="1" stopColor="#ffc94a" /></linearGradient></defs>
      <path fill="url(#profile-flame)" d="M12 2c1 3.5-2.5 5-2.5 8.5 0 1.3.7 2.3 1.6 2.8-.2-1.8.9-3.2 2.4-4.3.4 2.6 3 3.6 3 6.5A4.5 4.5 0 0 1 12 20a5.5 5.5 0 0 1-5.5-5.5C6.5 9 12 7 12 2z" />
      <path fill="#fff3c4" d="M12 20a2.4 2.4 0 0 1-2.4-2.4c0-1.6 1.4-2.3 2-3.8.9 1.1 2.8 1.9 2.8 3.8A2.4 2.4 0 0 1 12 20z" />
    </svg>
  );
}

// A preview of what is coming, so learners know it is on the way. Nothing here
// is live: the names and results are examples and the button does nothing yet.
const PREVIEW_FRIENDS = [
  { initial: "L", name: "Lily", color: "#f472b6", streak: 6 },
  { initial: "M", name: "Mason", color: "#38bdf8", streak: 3 },
  { initial: "A", name: "Ava", color: "#a3e635", streak: 9 },
  { initial: "J", name: "Jack", color: "#fbbf24", streak: 2 },
];

function FriendsAndBattlesPreview({ initial }: { initial: string }) {
  return (
    <section className="relative mt-8 overflow-hidden rounded-3xl border border-[#D86BF7]/35 bg-gradient-to-br from-[#8C2EAC]/45 via-[#161222]/85 to-[#161222]/85 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.28)]" aria-label="Friends and Battles, coming soon">
      <span className="absolute right-6 top-5 rounded-full bg-[#ffd76a] px-3.5 py-1.5 font-display text-xs font-black tracking-[0.1em] text-[#2a1a00]">COMING SOON</span>
      <p className="font-display text-xs font-black uppercase tracking-[0.14em] text-[#ffd76a]">Friends &amp; Battles</p>
      <h2 className="mt-2 font-display text-[26px] font-black">Challenge your friends!</h2>
      <p className="mt-1 max-w-[640px] font-semibold text-[#e3dbef]">Add friends from your school, cheer each other on, and battle with maths questions at your own level to win bonus XP.</p>
      <div className="mt-5 grid gap-3.5 md:grid-cols-[1.2fr_1fr_1fr]" aria-hidden="true">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
          <p className="mb-3 font-display text-[11px] font-black tracking-[0.14em] text-[#cbb6e6]">MY FRIENDS</p>
          <div className="flex flex-wrap gap-3">
            {PREVIEW_FRIENDS.map((friend) => (
              <div key={friend.name} className="flex w-16 flex-col items-center gap-1">
                <span className="relative grid h-[52px] w-[52px] place-items-center rounded-full font-display text-xl font-black text-[#1a1026]" style={{ background: friend.color }}>
                  {friend.initial}<span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#1a1426] bg-[#4ade80]" />
                </span>
                <span className="text-[13px] font-extrabold">{friend.name}</span>
                <span className="text-xs font-bold text-[#ffcf8a]">🔥 {friend.streak}</span>
              </div>
            ))}
            <div className="flex w-16 flex-col items-center gap-1">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-dashed border-white/35 bg-white/10 text-xl font-black">+</span>
              <span className="text-[13px] font-extrabold">Add friend</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
          <p className="mb-3 font-display text-[11px] font-black tracking-[0.14em] text-[#cbb6e6]">BATTLE</p>
          <div className="flex items-center justify-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#D86BF7] to-[#8C2EAC] font-display text-2xl font-black">{initial}</span>
            <span className="font-display text-xl font-black text-[#ffd76a]">VS</span>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f472b6] font-display text-2xl font-black">L</span>
          </div>
          <div className="mt-3.5 rounded-full bg-gradient-to-br from-[#D86BF7] to-[#8C2EAC] py-3 text-center font-display text-[13px] font-black tracking-[0.05em] opacity-70">⚔️ CHALLENGE A FRIEND</div>
          <p className="mt-2 text-center text-[13px] font-semibold text-[#bdb3cc]">Same number of questions · each at your own level</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
          <p className="mb-2 font-display text-[11px] font-black tracking-[0.14em] text-[#cbb6e6]">RECENT BATTLES</p>
          {[["You beat Lily", "8 – 6", "+20 XP"], ["Ava beat you", "7 – 9", "+5 XP"], ["You beat Mason", "10 – 4", "+20 XP"]].map(([who, score, xp], index) => (
            <div key={who} className={`flex items-center gap-2.5 py-2 ${index ? "border-t border-white/[0.07]" : ""}`}>
              <span className="flex-1 text-sm font-extrabold">{who}</span>
              <span className="font-display text-[13px] font-black text-[#d8d2e4]">{score}</span>
              <span className="w-14 text-right font-display text-xs font-black text-[#ffd76a]">{xp}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How many realm cards sit in a row (matches the grid's sm/lg breakpoints).
function subscribeToResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}
function useGridColumns() {
  return useSyncExternalStore(
    subscribeToResize,
    () => (window.matchMedia("(min-width: 1024px)").matches ? 3 : window.matchMedia("(min-width: 640px)").matches ? 2 : 1),
    () => 3,
  );
}

function levelLabel(year: string) {
  return year === "Prep" ? "Ground Level" : year.replace("Year", "Level");
}

function formatWhen(iso: string) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return then.toLocaleDateString("en-AU", { weekday: "short", timeZone: MELBOURNE_TIME_ZONE });
  return then.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: MELBOURNE_TIME_ZONE });
}

// Monday-to-Sunday of the current Melbourne week.
function currentWeekKeys() {
  const todayKey = getMelbourneDateKey();
  const [year, month, day] = todayKey.split("-").map(Number);
  const today = new Date(year, month - 1, day);
  const mondayOffset = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(year, month - 1, day - mondayOffset + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { key, label: DAYS[index], isToday: key === todayKey };
  });
}

function longestStreak(activityKeys: Set<string>) {
  let best = 0;
  for (const key of activityKeys) {
    const [year, month, day] = key.split("-").map(Number);
    const previous = new Date(year, month - 1, day - 1);
    const previousKey = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}-${String(previous.getDate()).padStart(2, "0")}`;
    if (activityKeys.has(previousKey)) continue; // only count from the start of each run
    let run = 0;
    const cursor = new Date(year, month - 1, day);
    for (;;) {
      const cursorKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (!activityKeys.has(cursorKey)) break;
      run += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    best = Math.max(best, run);
  }
  return best;
}
