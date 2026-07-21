"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Check, Lock, LockOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProgramForYear } from "@/data/programs";
import { getCurriculumPlan } from "@/data/programs/genres";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { DEMO_MODE } from "@/data/config";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { isPlacementComplete, readProgress, updateProgress } from "@/data/progress";
import {
  getOptionalWeeks,
  getProgramWeeks,
  getPlayableWeeks,
  getRecommendedAssignedWeek,
  readProgramStore,
  getWeekProgress,
  hasCompletedRequiredWeeks,
  isWeekComplete,
  isWeekPlayable,
  isFullRequiredPath,
  normalizeWeekList,
  type ProgramProgressStore,
} from "@/lib/program-progress";
import { getHomeBg, getHomeBgFilter, getVignetteStyle } from "@/lib/levelBand";
import { buildLessonRoute, normalizeStudentYearLabel } from "@/lib/lesson-routing";
import { readStarpathDemoJourney, writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import { getStarpathLevelForYear, type StarpathLevelDefinition } from "@/lib/starpath-levels";
import {
  buildStarpathProgramHref,
  buildStarpathWeeklyQuizHref,
  buildStarpathWorldHref,
} from "@/lib/starpath-routes";
import { getStarpathBackground } from "@/lib/starpath-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import ReadAloudBtn from "@/components/ReadAloudBtn";

const TEACHER_MODE_KEY = "lul:hidden_teacher_mode";
const PATHWAY_JOURNAL_KEY_PREFIX = "lul:pathway-journal";

function getStarpathWeekProgram(year: string) {
  const definition = getStarpathLevelForYear(year as StarpathLevelDefinition["yearLabel"]);
  const starpath = getStarpathProgram(definition.id);
  return {
    definition,
    weeks: starpath.weeks.map((week) => ({
      week: week.week,
      topic: week.centralConcept,
      title: week.title,
      lessons: week.lessons.map((lesson) => ({
        title: lesson.title,
        displayTitle: lesson.title,
        focus: lesson.focus,
      })),
      quiz: week.quiz,
    })),
  };
}

export default function ProgramPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f2ec] flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}>
      <ProgramPage />
    </Suspense>
  );
}

function ProgramPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = normalizeStudentYearLabel(sp.get("year") ?? "Year 1");
  const realmId = sp.get("realm_id") ?? "number";
  if (realmId !== "number" && realmId !== "measurement" && realmId !== "space") {
    throw new Error(`Unsupported program realm: ${realmId}`);
  }
  const isStarpathRealm = realmId === "space";
  const starpathProgram = useMemo(
    () => (isStarpathRealm ? getStarpathWeekProgram(year) : null),
    [isStarpathRealm, year],
  );
  const weekNum = Number(sp.get("week") ?? "1");
  const week = String(weekNum);
  const program = useMemo(
    () => isStarpathRealm
      ? starpathProgram?.weeks ?? []
      : realmId === "measurement"
        ? getCurriculumPlan(year, "measurement")
        : getProgramForYear(year),
    [isStarpathRealm, realmId, starpathProgram, year]
  );
  const curriculumYear = useMemo(() => {
    const selected = program;
    return selected.length > 0 ? year : "Year 1";
  }, [program, year]);
  const programYearIndex =
    curriculumYear === "Prep" ? 0 : parseInt(curriculumYear.replace(/\D/g, ""), 10) || 1;
  const levelNum = year === "Prep" ? 1 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelLabel = curriculumYear === "Prep" ? "Ground Level" : `Level ${programYearIndex}`;
  const isPrep = curriculumYear === "Prep";
  const lastWeek = Math.max(program.length, 1);
  const isMeasurementRealm = realmId === "measurement";
  const activityCardVariant: "standard" | "portal-circle" = isStarpathRealm ? "portal-circle" : "standard";

  // ── Realm theme ── add a new entry here to support any future realm
  const rt = isStarpathRealm ? {
    rounded: true,
    scanline: false,
    cardClip: undefined as string | undefined,
    bezelClip: undefined as string | undefined,
    badgeClip: undefined as string | undefined,
    statusClip: undefined as string | undefined,
    actionClip: undefined as string | undefined,
    connClip: undefined as string | undefined,
    cardActiveBg: "radial-gradient(circle at 50% 18%, rgba(34,211,238,0.24), transparent 34%), linear-gradient(145deg, rgba(24,18,74,0.96), rgba(10,18,54,0.96) 58%, rgba(8,45,68,0.94))",
    cardCompletedBg: "radial-gradient(circle at 50% 14%, rgba(165,243,252,0.26), transparent 34%), linear-gradient(145deg, #312e81, #155e75)",
    cardLockedBg: "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(30,27,75,0.82))",
    bezelActiveBg: "linear-gradient(145deg, rgba(103,232,249,0.72), rgba(139,92,246,0.28) 48%, rgba(34,211,238,0.62))",
    bezelCompletedBg: "linear-gradient(145deg, rgba(196,181,253,0.72), rgba(34,211,238,0.62))",
    bezelLockedBg: "linear-gradient(145deg, rgba(148,163,184,0.24), rgba(76,29,149,0.18))",
    bezelPosttestBg: "linear-gradient(145deg, rgba(253,224,71,0.72), rgba(124,58,237,0.48))",
    cardActiveShadow: "0 14px 42px rgba(3,7,30,0.62), 0 0 28px rgba(34,211,238,0.22), inset 0 1px 0 rgba(207,250,254,0.2)",
    cardCompletedShadow: "0 14px 42px rgba(3,7,30,0.58), 0 0 34px rgba(139,92,246,0.28), inset 0 1px 0 rgba(207,250,254,0.28)",
    cardLockedShadow: "0 8px 26px rgba(3,7,30,0.5)",
    badgeActiveBg: "linear-gradient(135deg, #4c1d95, #0891b2)",
    badgeCompletedBg: "linear-gradient(135deg, #6d28d9, #0e7490)",
    badgeLockedBg: "linear-gradient(135deg, #1e293b, #312e81)",
    badgePosttestBg: "linear-gradient(135deg, #a16207, #6d28d9)",
    badgeShadow: "inset 0 1px 0 rgba(207,250,254,0.28), 0 0 12px rgba(34,211,238,0.25)",
    statusActiveBg: "linear-gradient(135deg, #312e81, #0e7490)",
    statusCompletedBg: "linear-gradient(135deg, #6d28d9, #0891b2)",
    statusLockedBg: "linear-gradient(135deg, #1e293b, #312e81)",
    statusPosttestBg: "linear-gradient(135deg, #a16207, #6d28d9)",
    statusShadow: "0 0 12px rgba(34,211,238,0.3)",
    dotClass: "bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.9)]",
    actionActiveBg: "linear-gradient(135deg, #6d28d9, #0891b2 58%, #22d3ee)",
    actionCompletedBg: "linear-gradient(135deg, #7c3aed, #0e7490)",
    actionPosttestBg: "linear-gradient(135deg, #a16207, #7c3aed)",
    actionShadow: "0 0 18px rgba(34,211,238,0.35), 0 6px 16px rgba(3,7,30,0.5), inset 0 1px 0 rgba(207,250,254,0.3)",
    connActiveBg: "radial-gradient(circle, #67e8f9, #6d28d9 72%)",
    connCompletedBg: "radial-gradient(circle, #c4b5fd, #0e7490 72%)",
    connShadow: "0 0 14px rgba(103,232,249,0.55)",
    xpBg: "linear-gradient(90deg, #7c3aed, #22d3ee 58%, #a5f3fc)",
    xpGlow: "0 0 14px rgba(34,211,238,0.62)",
    pillBg: "linear-gradient(135deg, rgba(30,27,75,0.96), rgba(76,29,149,0.92), rgba(8,47,73,0.94))",
    pillShadow: "inset 0 1px 0 rgba(207,250,254,0.25), 0 0 22px rgba(124,58,237,0.28)",
    pillDot: "bg-cyan-200 shadow-[0_0_9px_rgba(103,232,249,0.95)]",
    headingGlow: "drop-shadow-[0_2px_16px_rgba(34,211,238,0.35)]",
    focusColor: "text-cyan-200",
    dividerColor: "border-cyan-300/20",
    xpLabelColor: "text-cyan-100/90",
  } : isMeasurementRealm ? {
    rounded: true,
    scanline: false,
    // shapes
    cardClip:   undefined as string | undefined,
    bezelClip:  undefined as string | undefined,
    badgeClip:  undefined as string | undefined,
    statusClip: undefined as string | undefined,
    actionClip: undefined as string | undefined,
    connClip:   undefined as string | undefined,
    // colours — card body (aged parchment / dark leather)
    cardActiveBg:     "linear-gradient(135deg, rgba(22,14,4,0.95) 0%, rgba(40,26,6,0.92) 50%, rgba(58,38,10,0.88) 100%)",
    cardCompletedBg:  "linear-gradient(135deg, #261306 0%, #4a2410 45%, #6d28d9 100%)",
    cardLockedBg:     "linear-gradient(135deg, rgba(20,12,35,0.78) 0%, rgba(35,18,60,0.70) 100%)",
    // colours — bezel / border (aged brass — less saturated, more antique)
    bezelActiveBg:    "linear-gradient(135deg, rgba(200,160,48,0.48), rgba(120,90,15,0.16) 40%, rgba(200,160,48,0.42))",
    bezelCompletedBg: "linear-gradient(135deg, rgba(200,160,48,0.48), rgba(109,40,217,0.18) 45%, rgba(200,160,48,0.44))",
    bezelLockedBg:    "linear-gradient(135deg, rgba(109,40,217,0.22), rgba(76,29,149,0.10))",
    bezelPosttestBg:  "linear-gradient(135deg, rgba(139,92,246,0.52), rgba(109,40,217,0.22) 40%, rgba(139,92,246,0.46))",
    // box shadows (warm depth + subtle purple magical glow)
    cardActiveShadow:    "0 8px 28px rgba(22,14,4,0.55), 0 0 22px rgba(109,40,217,0.12), inset 0 1px 0 rgba(200,160,48,0.12)",
    cardCompletedShadow: "0 8px 28px rgba(109,40,217,0.22), 0 0 22px rgba(200,160,48,0.18), inset 0 1px 0 rgba(200,160,48,0.22)",
    cardLockedShadow:    "0 4px 16px rgba(0,0,0,0.4)",
    // badge (lesson label pill — bronze gradient)
    badgeActiveBg:    "linear-gradient(135deg, #2a1a04 0%, #5c3d0e 50%, #8b6520 100%)",
    badgeCompletedBg: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 60%, #c8a030 100%)",
    badgeLockedBg:    "linear-gradient(135deg, #2d1b69 0%, #4c1d95 100%)",
    badgePosttestBg:  "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
    badgeShadow:      "inset 0 1px 0 rgba(200,160,48,0.28), 0 0 8px rgba(120,90,15,0.3)",
    // status pill (ACTIVE — muted brass, not bright gold)
    statusActiveBg:    "linear-gradient(135deg, #3d2808 0%, #5c3d0e 50%, #7a5418 100%)",
    statusCompletedBg: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #c8a030 100%)",
    statusLockedBg:    "linear-gradient(135deg, #2d1b69 0%, #4c1d95 100%)",
    statusPosttestBg:  "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
    statusShadow:      "0 0 8px rgba(120,90,15,0.35)",
    dotClass:          "bg-yellow-200/80 shadow-[0_0_6px_rgba(200,160,48,0.55)]",
    // action button (START — soft brass, warm bronze glow on hover)
    actionActiveBg:    "linear-gradient(135deg, #2a1a04 0%, #5c3d0e 40%, #8b6520 75%, #c8a030 100%)",
    actionCompletedBg: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #c8a030 100%)",
    actionPosttestBg:  "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
    actionShadow:      "0 0 16px rgba(120,90,15,0.5), 0 4px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(200,160,48,0.3)",
    // connector between cards
    connActiveBg:    "radial-gradient(circle, #c8a030, #3d2808 70%)",
    connCompletedBg: "radial-gradient(circle, #c8a030, #6d28d9 72%)",
    connShadow:      "0 0 10px rgba(200,160,48,0.35), 0 0 14px rgba(109,40,217,0.18)",
    // XP bar — brass shimmer (light catches at 60%)
    xpBg:   "linear-gradient(90deg, #3d2808 0%, #7a5418 25%, #c8a030 55%, #e8d5a8 65%, #c8a030 75%, #7a5418 90%, #3d2808 100%)",
    xpGlow: "0 0 10px rgba(200,160,48,0.5)",
    // header / nav (antiqued dark + purple magical glow)
    pillBg:     "linear-gradient(135deg, #140e04 0%, #2a1a06 50%, #3d2808 100%)",
    pillShadow: "inset 0 1px 0 rgba(200,160,48,0.25), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 16px rgba(109,40,217,0.18)",
    pillDot:    "bg-yellow-200/80 shadow-[0_0_8px_rgba(200,160,48,0.5)]",
    headingGlow:  "drop-shadow-[0_2px_14px_rgba(109,40,217,0.3)]",
    focusColor:   "text-amber-200/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]",
    dividerColor: "border-yellow-900/25",
    xpLabelColor: "text-yellow-100/65",
  } : {
    rounded: false,
    scanline: true,
    cardClip:   "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
    bezelClip:  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    badgeClip:  "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
    statusClip: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
    actionClip: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
    connClip:   "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
    cardActiveBg:     "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
    cardCompletedBg:  "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)",
    cardLockedBg:     "linear-gradient(135deg, #021a18 0%, #052e2b 100%)",
    bezelActiveBg:    "linear-gradient(135deg, rgba(94,234,212,0.6), rgba(13,148,136,0.2) 40%, rgba(20,184,166,0.55))",
    bezelCompletedBg: "linear-gradient(135deg, rgba(16,185,129,0.5), rgba(13,148,136,0.2) 40%, rgba(16,185,129,0.45))",
    bezelLockedBg:    "linear-gradient(135deg, rgba(94,234,212,0.12), rgba(13,148,136,0.08))",
    bezelPosttestBg:  "linear-gradient(135deg, rgba(251,191,36,0.6), rgba(245,158,11,0.25) 40%, rgba(251,191,36,0.55))",
    cardActiveShadow:    "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -10px 24px rgba(0,0,0,0.45), 0 0 22px rgba(20,184,166,0.3)",
    cardCompletedShadow: "inset 0 1px 0 rgba(110,231,183,0.4), inset 0 -10px 24px rgba(0,0,0,0.4), 0 0 26px rgba(16,185,129,0.45)",
    cardLockedShadow:    "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.4), 0 0 14px rgba(20,184,166,0.15)",
    badgeActiveBg:    "linear-gradient(135deg, #064e47 0%, #14b8a6 100%)",
    badgeCompletedBg: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
    badgeLockedBg:    "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    badgePosttestBg:  "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)",
    badgeShadow:      "inset 0 1px 0 rgba(94,234,212,0.35)",
    statusActiveBg:    "linear-gradient(135deg, #064e47 0%, #14b8a6 100%)",
    statusCompletedBg: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
    statusLockedBg:    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    statusPosttestBg:  "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)",
    statusShadow:      "inset 0 1px 0 rgba(94,234,212,0.4)",
    dotClass:          "bg-teal-200 shadow-[0_0_6px_rgba(94,234,212,0.9)]",
    actionActiveBg:    "linear-gradient(135deg, #064e47 0%, #0d9488 50%, #14b8a6 100%)",
    actionCompletedBg: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
    actionPosttestBg:  "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)",
    actionShadow:      "inset 0 1px 0 rgba(94,234,212,0.4), 0 0 8px rgba(20,184,166,0.35)",
    connActiveBg:    "radial-gradient(circle, #14b8a6, #064e47 70%)",
    connCompletedBg: "radial-gradient(circle, #10b981, #064e3b 70%)",
    connShadow:      "0 0 10px rgba(94,234,212,0.5)",
    xpBg:   "linear-gradient(90deg, #5eead4 0%, #14b8a6 50%, #10b981 100%)",
    xpGlow: "0 0 10px rgba(94,234,212,0.7)",
    pillBg:     "linear-gradient(135deg, #021a18 0%, #064e47 50%, #0a5048 100%)",
    pillShadow: "inset 0 1px 0 rgba(94,234,212,0.35), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 18px rgba(20,184,166,0.25)",
    pillDot:    "bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]",
    headingGlow:  "drop-shadow-[0_2px_12px_rgba(20,184,166,0.35)]",
    focusColor:   "text-teal-300/80",
    dividerColor: "border-teal-400/15",
    xpLabelColor: "text-teal-100/90",
  };

  // Starpath nav widgets (Back button, Week selector, XP plate) — match the
  // Starpath realm's rounded indigo/cyan chip styling instead of the Nexus teal.
  const starpathNavPillStyle = {
    borderRadius: 999,
    border: "1px solid rgba(103,232,249,0.32)",
    background: "linear-gradient(135deg, rgba(30,27,75,0.88), rgba(76,29,149,0.55) 55%, rgba(8,47,73,0.85))",
    boxShadow: "inset 0 1px 0 rgba(207,250,254,0.22), 0 0 20px rgba(124,58,237,0.26)",
  } as const;

  const [store, setStore] = useState<ProgramProgressStore>(() =>
    typeof window !== "undefined" ? readProgramStore() : {}
  );
  const [studentProgress, setStudentProgress] = useState(() =>
    typeof window !== "undefined" && !isStarpathRealm ? readProgress() : null
  );
  const [teacherMode, setTeacherMode] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(TEACHER_MODE_KEY) === "true" : false
  );
  const [teacherToast, setTeacherToast] = useState("");
  const [starpathAccess, setStarpathAccess] = useState<"checking" | "allowed" | "denied">(
    isStarpathRealm ? "checking" : "allowed",
  );
  const secretTapCountRef = useRef(0);
  const [weekMenuOpen, setWeekMenuOpen] = useState(false);
  const weekMenuRef = useRef<HTMLDivElement | null>(null);
  const pathwayJournalStorageKey = `${PATHWAY_JOURNAL_KEY_PREFIX}:${realmId}:${curriculumYear}`;
  const [pathwayJournalOpen, setPathwayJournalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(pathwayJournalStorageKey) === "true";
  });

  const legacyProgramMode = sp.get("legacy") === "1";
  const previewMode = isDemoPreviewMode();
  const unrestrictedMode = DEMO_MODE || previewMode || teacherMode || isStarpathRealm;

  useEffect(() => {
    if (!isStarpathRealm) return;
    if (DEMO_MODE) {
      Promise.resolve().then(() => setStarpathAccess("allowed"));
      return;
    }

    let cancelled = false;
    void fetch("/api/demo-access", { method: "GET", cache: "no-store" })
      .then((response) => {
        if (!cancelled) setStarpathAccess(response.ok ? "allowed" : "denied");
      })
      .catch(() => {
        if (!cancelled) setStarpathAccess("denied");
      });
    return () => {
      cancelled = true;
    };
  }, [isStarpathRealm]);

  useEffect(() => {
    if (isStarpathRealm && starpathAccess === "denied") router.replace("/realms");
  }, [isStarpathRealm, router, starpathAccess]);

  useEffect(() => {
    if (isStarpathRealm) return;
    const progress = readProgress();
    if (!previewMode && !isPlacementComplete(progress)) {
      router.replace("/home");
    }
  }, [isStarpathRealm, previewMode, router]);

  useEffect(() => {
    if (isStarpathRealm) return;
    const progress = readProgress();
    if (!DEMO_MODE && !previewMode && progress?.year && progress.year !== year) {
      const targetWeek = Math.max(1, Math.min(lastWeek, progress.assignedWeek ?? 1));
      router.replace(`/program?year=${encodeURIComponent(progress.year)}&week=${targetWeek}&legacy=1`);
      return;
    }
  }, [isStarpathRealm, lastWeek, previewMode, router, year]);

  useEffect(() => {
    if (isStarpathRealm) return;
    const progress = readProgress();
    if (progress?.status === "ASSIGNED_PROGRAM" && progress.year === year) {
      const nextAssignedWeek = Math.max(1, Math.min(lastWeek, weekNum));
      if ((progress.assignedWeek ?? 1) !== nextAssignedWeek) {
        updateProgress({ assignedWeek: nextAssignedWeek });
      }
    }
  }, [isStarpathRealm, lastWeek, weekNum, year]);

  useEffect(() => {
    if (!isStarpathRealm || !starpathProgram) return;
    const current = readStarpathDemoJourney(starpathProgram.definition.yearLabel as RealmLevelId);
    writeStarpathDemoJourney(starpathProgram.definition.yearLabel as RealmLevelId, {
      ...current,
      currentWeek: weekNum,
    });
  }, [isStarpathRealm, starpathProgram, weekNum]);

  useEffect(() => {
    if (!weekMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (weekMenuRef.current && !weekMenuRef.current.contains(e.target as Node)) {
        setWeekMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setWeekMenuOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [weekMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(pathwayJournalStorageKey, pathwayJournalOpen ? "true" : "false");
  }, [pathwayJournalOpen, pathwayJournalStorageKey]);

  // Re-read store on window focus (in case lesson page updated it)
  useEffect(() => {
    function onFocus() {
      setStore(readProgramStore());
      setStudentProgress(isStarpathRealm ? null : readProgress());
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isStarpathRealm]);

  const assignedProgram =
    studentProgress?.status === "ASSIGNED_PROGRAM" && studentProgress.year === curriculumYear
      ? studentProgress
      : null;
  const requiredWeeks = useMemo(
    () => normalizeWeekList(assignedProgram?.requiredWeeks, realmId),
    [assignedProgram?.requiredWeeks, realmId]
  );
  const explicitOptionalWeeks = useMemo(
    () => normalizeWeekList(assignedProgram?.optionalWeeks, realmId),
    [assignedProgram?.optionalWeeks, realmId]
  );
  const optionalWeeks = useMemo(() => {
    return explicitOptionalWeeks.length > 0 ? explicitOptionalWeeks : getOptionalWeeks(requiredWeeks, realmId);
  }, [explicitOptionalWeeks, realmId, requiredWeeks]);
  const hasPersonalizedPlan = requiredWeeks.length > 0;
  const allRealmWeeks = useMemo(() => getProgramWeeks(realmId), [realmId]);
  const hasOpenPracticePlan =
    assignedProgram !== null &&
    requiredWeeks.length === 0 &&
    explicitOptionalWeeks.length === allRealmWeeks.length &&
    allRealmWeeks.every((week) => explicitOptionalWeeks.includes(week));
  const hasAssignedWeekAccess = hasPersonalizedPlan || hasOpenPracticePlan;
  const fullRequiredPath = useMemo(
    () => isFullRequiredPath(requiredWeeks, optionalWeeks, realmId),
    [optionalWeeks, realmId, requiredWeeks]
  );
  const requiredWeeksComplete = useMemo(
    () => hasCompletedRequiredWeeks(store, curriculumYear, requiredWeeks, realmId),
    [store, curriculumYear, requiredWeeks, realmId]
  );
  const canTakePostTestEarly = hasPersonalizedPlan && requiredWeeksComplete;
  const currentWeekIsRequired = requiredWeeks.includes(weekNum);
  const playableWeeks = useMemo(
    () => getPlayableWeeks(store, curriculumYear, requiredWeeks, optionalWeeks, realmId),
    [store, curriculumYear, requiredWeeks, optionalWeeks, realmId]
  );
  const weekIsPlayable = useMemo(
    () => isWeekPlayable(store, curriculumYear, weekNum, requiredWeeks, optionalWeeks, realmId),
    [store, curriculumYear, weekNum, requiredWeeks, optionalWeeks, realmId]
  );

  const prevProgress = getWeekProgress(store, year, Math.max(1, weekNum - 1), realmId);
  const weekUnlocked =
    unrestrictedMode ? true : hasAssignedWeekAccess ? weekIsPlayable : weekNum === 1 ? true : isWeekComplete(prevProgress);

  const lastAllowedWeek = useMemo(() => {
    if (unrestrictedMode || hasAssignedWeekAccess) return lastWeek;
    let allowed = 1;
    for (let w = 2; w <= lastWeek; w++) {
      if (isWeekComplete(getWeekProgress(store, year, w - 1, realmId))) allowed = w;
      else break;
    }
    return allowed;
  }, [hasAssignedWeekAccess, lastWeek, realmId, store, unrestrictedMode, year]);

  const progress = getWeekProgress(store, year, week, realmId);
  const pathwayChipBase = isMeasurementRealm
    ? "border border-yellow-900/30 bg-[#2a1a06]/85 text-yellow-100"
    : "border border-teal-300/25 bg-black/35 text-teal-50";
  const optionalChipBase = isMeasurementRealm
    ? "border border-white/10 bg-[#1f1407]/75 text-amber-50/90"
    : "border border-white/10 bg-white/5 text-white/85";

  type ProgramItem = { type: "lesson" | "quiz" | "posttest"; n: number; title: string; focus: string };
  const items: ProgramItem[] = useMemo(() => {
    const weekPlan = program.find((w) => w.week === weekNum);
    const starpathWeek = starpathProgram?.weeks.find((candidate) => candidate.week === weekNum);
    const lessons = weekPlan?.lessons ?? [];
    const base: ProgramItem[] = [
      { type: "lesson" as const, n: 1, title: lessons[0]?.displayTitle ?? lessons[0]?.title ?? "Lesson 1", focus: lessons[0]?.focus ?? "" },
      { type: "lesson" as const, n: 2, title: lessons[1]?.displayTitle ?? lessons[1]?.title ?? "Lesson 2", focus: lessons[1]?.focus ?? "" },
      { type: "lesson" as const, n: 3, title: lessons[2]?.displayTitle ?? lessons[2]?.title ?? "Lesson 3", focus: lessons[2]?.focus ?? "" },
    ];
    if (isStarpathRealm || weekNum !== lastWeek) {
      base.push({
        type: "quiz" as const,
        n: 1,
        title: isStarpathRealm ? `${starpathWeek?.title ?? `Week ${weekNum}`} Voyage Quiz` : "Weekly Quiz",
        focus: isStarpathRealm ? starpathWeek?.quiz?.coverage ?? "15 questions from all 3 missions" : "15 questions from all 3 lessons",
      });
    } else {
      base.push({ type: "posttest" as const, n: 1, title: "Post-Test", focus: "Score 85%+ to unlock your Legend" });
    }
    return base;
  }, [isStarpathRealm, lastWeek, program, starpathProgram, weekNum]);

  const currentWeekPlan = useMemo(() => {
    return program.find((w) => w.week === weekNum);
  }, [program, weekNum]);

  function openItem(item: (typeof items)[number]) {
    if (!weekUnlocked && !unrestrictedMode) return;

    if (!unrestrictedMode) {
      if (item.type === "lesson") {
        const lessonIdx = item.n - 1;
        if (lessonIdx > 0 && !progress.lessonsCompleted[lessonIdx - 1]) return;
      }
      if (item.type === "quiz") {
        if (progress.lessonsCompleted.filter(Boolean).length < 3) return;
      }
      if (item.type === "posttest") {
        if (hasPersonalizedPlan) {
          if (!requiredWeeksComplete) return;
        } else if (progress.lessonsCompleted.filter(Boolean).length < 3) {
          return;
        }
      }
    }

    const realmParam = isMeasurementRealm ? `&realm_id=${encodeURIComponent(realmId)}` : "";

    if (item.type === "lesson") {
      router.push(
        buildLessonRoute({
          yearLabel: curriculumYear,
          week: weekNum,
          lessonNumber: item.n,
          realmId,
        })
      );
      return;
    }
    if (isStarpathRealm && starpathProgram && item.type === "quiz") {
      router.push(buildStarpathWeeklyQuizHref({ selectedLevel: starpathProgram.definition.id }, weekNum));
      return;
    }
    if (item.type === "posttest") {
      router.push(`/posttest?year=${encodeURIComponent(curriculumYear)}${realmParam}`);
      return;
    }
    router.push(`/session?year=${encodeURIComponent(curriculumYear)}&week=${week}&type=${item.type}&n=${item.n}${realmParam}`);
  }

  function goToWeek(targetWeek: number) {
    const clamped = Math.max(1, Math.min(lastWeek, targetWeek));
    if (!unrestrictedMode && hasAssignedWeekAccess && !playableWeeks.includes(clamped)) return;
    if (isStarpathRealm && starpathProgram) {
      const level = starpathProgram.definition.yearLabel as RealmLevelId;
      const current = readStarpathDemoJourney(level);
      writeStarpathDemoJourney(level, { ...current, currentWeek: clamped });
      router.push(buildStarpathProgramHref({ selectedLevel: starpathProgram.definition.id }, clamped));
      return;
    }
    const realmParam = isMeasurementRealm ? `&realm_id=${encodeURIComponent(realmId)}` : "";
    router.push(`/program?year=${encodeURIComponent(year)}&week=${clamped}&legacy=1${realmParam}`);
  }

  function setTeacherModeState(next: boolean) {
    setTeacherMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEACHER_MODE_KEY, next ? "true" : "false");
    }
    setTeacherToast(next ? "Teacher mode enabled" : "Teacher mode disabled");
    window.setTimeout(() => setTeacherToast(""), 1800);
  }

  function handleSecretTeacherToggle() {
    secretTapCountRef.current += 1;
    const next = secretTapCountRef.current;
    if (next >= 6) {
      secretTapCountRef.current = 0;
      setTeacherModeState(!teacherMode);
      return;
    }
    window.setTimeout(() => {
      if (secretTapCountRef.current === next) {
        secretTapCountRef.current = 0;
      }
    }, 1500);
  }

  const lessonsDoneCount = progress.lessonsCompleted.filter(Boolean).length;
  const weekComplete = isWeekComplete(progress);

  useEffect(() => {
    if (isStarpathRealm) return;
    const student = readProgress();
    if (!student || student.status !== "ASSIGNED_PROGRAM" || student.year !== curriculumYear) return;
    const savedWeek = student.assignedWeek ?? 1;
    let nextWeek = savedWeek;
    if (hasPersonalizedPlan) {
      nextWeek = getRecommendedAssignedWeek(store, curriculumYear, savedWeek, student.requiredWeeks, realmId);
    } else {
      if (weekNum > savedWeek) nextWeek = weekNum;
      if (weekComplete) nextWeek = Math.max(nextWeek, Math.min(lastWeek, weekNum + 1));
    }
    if (nextWeek !== savedWeek) updateProgress({ assignedWeek: nextWeek });
  }, [curriculumYear, hasPersonalizedPlan, isStarpathRealm, lastWeek, realmId, store, weekComplete, weekNum]);

  const xp = lessonsDoneCount * 10 + (progress.quizCompleted ? 20 : 0);
  const totalXp = 50;
  const percent = Math.round((xp / totalXp) * 100);
  const realmHomeRoute = isStarpathRealm && starpathProgram
    ? buildStarpathWorldHref({ selectedLevel: starpathProgram.definition.id })
    : isMeasurementRealm
      ? `/measurelands?level=${encodeURIComponent(curriculumYear)}`
      : "/number-nexus";

  if (isStarpathRealm && starpathAccess !== "allowed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070a1b] text-cyan-100">
        <p>{starpathAccess === "denied" ? "Returning to the Tower…" : "Opening Starpath…"}</p>
      </main>
    );
  }

  if (!legacyProgramMode) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f2ec]">
        <p className="text-gray-400">Opening your adventure…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Realm background — same as student dashboard for this level */}
      <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            isStarpathRealm
              ? getStarpathBackground(curriculumYear as RealmLevelId)
              : isMeasurementRealm
              ? isPrep
                ? "/images/measurelands-home-bg.jpg"
                : levelNum === 1
                ? "/images/measurelands-home-bg-y1.jpg"
                : levelNum === 2
                ? "/images/measurelands-home-bg-y2.jpg"
                : levelNum === 3
                ? "/images/measurelands-home-bg-y3.jpg"
                : levelNum === 4
                ? "/images/measurelands-home-bg-y4.jpg"
                : levelNum === 5
                ? "/images/measurelands-home-bg-y5.png"
                : levelNum === 6
                ? "/images/measurelands-home-bg-y6.png"
                : "/images/measurelands-home-bg.jpg"
              : getHomeBg(levelNum, isPrep)
          }
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: isStarpathRealm
              ? "brightness(0.88) contrast(1.1) saturate(1.1)"
              : isMeasurementRealm
              ? levelNum === 4
                ? "brightness(0.90) contrast(1.16) saturate(1.05)"
                : "brightness(0.97) contrast(1.16) saturate(1.08)"
              : isPrep
              ? "brightness(1.22) contrast(1.05) saturate(1.18)"
              : getHomeBgFilter(levelNum),
            imageRendering: isMeasurementRealm || isStarpathRealm ? "auto" : undefined,
            WebkitBackfaceVisibility: isMeasurementRealm || isStarpathRealm ? "hidden" : undefined,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: getVignetteStyle(levelNum) }}
        />
        <div className={`absolute inset-0 ${isPrep ? "bg-black/10" : "bg-black/30"}`} />
        {isPrep && !isMeasurementRealm && !isStarpathRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 70%, rgba(94,234,212,0.22), transparent 65%), linear-gradient(180deg, rgba(186,230,253,0.10) 0%, transparent 40%)",
            }}
          />
        )}
        {isMeasurementRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                levelNum === 4
                  ? "radial-gradient(ellipse at 50% 70%, rgba(251,191,36,0.06), transparent 62%), linear-gradient(180deg, rgba(5,8,24,0.38) 0%, transparent 45%)"
                  : "radial-gradient(ellipse at 50% 70%, rgba(251,191,36,0.14), transparent 60%), linear-gradient(180deg, rgba(5,8,24,0.30) 0%, transparent 45%)",
            }}
          />
        )}
        {isStarpathRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(34,211,238,0.12), transparent 34%), linear-gradient(180deg, rgba(7,10,27,0.42), rgba(30,27,75,0.14) 45%, rgba(7,10,27,0.52))",
            }}
          />
        )}
        {/* Soft top glow for premium polish (dialled back on Level 4's brighter art) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              isStarpathRealm
                ? "radial-gradient(circle at top, rgba(165,243,252,0.12), transparent 58%)"
                : isMeasurementRealm && levelNum === 4
                ? "radial-gradient(circle at top, rgba(255,255,255,0.04), transparent 60%)"
                : "radial-gradient(circle at top, rgba(255,255,255,0.10), transparent 60%)",
          }}
        />
        {isPrep && !isMeasurementRealm && !isStarpathRealm && (
          <div className="absolute right-3 sm:right-6 md:right-10 top-[32%] pointer-events-none select-none hidden md:block">
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-[18vh] h-[4vh] rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(94,234,212,0.55) 0%, rgba(45,212,191,0.25) 40%, transparent 75%)",
                filter: "blur(8px)",
                animation: "nb-pulse 3.4s ease-in-out infinite",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[34vh] h-[34vh] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(45,212,191,0.18) 0%, transparent 60%)",
                filter: "blur(20px)",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/numbot-bouncer-overlay.png"
              alt=""
              className="relative h-[28vh] lg:h-[32vh] w-auto"
              style={{
                filter:
                  "drop-shadow(0 18px 22px rgba(0,0,0,0.55)) drop-shadow(0 0 28px rgba(94,234,212,0.35))",
                animation: "nb-float 5.2s ease-in-out infinite",
                transform: "scaleX(-1)",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Student avatar (shared component — appears on every Week page) ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-[5] hidden md:block"
        style={{ bottom: "1.5rem" }}
      >
        <StudentAvatar
          height={160}
          glowColor={
            isStarpathRealm
              ? "rgba(34,211,238,0.34)"
              : isMeasurementRealm
              ? "rgba(251,191,36,0.28)"
              : "rgba(94,234,212,0.30)"
          }
        />
      </div>

      {/* ── Hero header ── */}
      <div className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-6 pt-5 pb-10">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(realmHomeRoute)}
                className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] backdrop-blur-md transition focus:outline-none ${
                  isStarpathRealm
                    ? "text-cyan-50 hover:brightness-110 focus:ring-2 focus:ring-cyan-300/25"
                    : isMeasurementRealm
                    ? "text-yellow-100/85 hover:bg-yellow-950/30"
                    : "border border-teal-300/25 bg-black/25 text-teal-50 hover:border-teal-200/45 hover:bg-teal-950/45 focus:ring-2 focus:ring-teal-300/25"
                }`}
                style={isStarpathRealm ? starpathNavPillStyle : isMeasurementRealm ? {
                  borderRadius: 999,
                  border: "1px solid rgba(200,160,48,0.32)",
                  background: "rgba(22,14,4,0.65)",
                  boxShadow: "inset 0 1px 0 rgba(200,160,48,0.18), 0 0 12px rgba(109,40,217,0.08)",
                } : {
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                  boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2), 0 0 18px rgba(20,184,166,0.12)",
                }}
              >
                ← {isStarpathRealm ? "Back to Starpath" : "Back to Map"}
              </button>
              <div ref={weekMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setWeekMenuOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={weekMenuOpen}
                  className={`relative flex min-w-[170px] items-center justify-between gap-3 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] backdrop-blur-md transition focus:outline-none ${
                    isStarpathRealm
                      ? "text-cyan-50 hover:brightness-110 focus:ring-2 focus:ring-cyan-300/25"
                      : isMeasurementRealm
                      ? "text-yellow-100/85 hover:bg-yellow-950/30"
                      : "border border-teal-300/25 bg-black/25 text-teal-50 hover:border-teal-200/45 hover:bg-teal-950/45 focus:ring-2 focus:ring-teal-300/25"
                  }`}
                  style={isStarpathRealm ? starpathNavPillStyle : isMeasurementRealm ? {
                    borderRadius: 999,
                    border: "1px solid rgba(200,160,48,0.32)",
                    background: "rgba(22,14,4,0.65)",
                    boxShadow: "inset 0 1px 0 rgba(200,160,48,0.18), 0 0 12px rgba(109,40,217,0.08)",
                  } : {
                    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                    boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2), 0 0 18px rgba(20,184,166,0.12)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${isStarpathRealm ? "bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.9)]" : isMeasurementRealm ? "bg-yellow-200/80 shadow-[0_0_6px_rgba(200,160,48,0.6)]" : "bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]"}`} />
                    Week {weekNum}
                  </span>
                  <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${isStarpathRealm ? "text-cyan-100/80" : isMeasurementRealm ? "text-yellow-200/60" : "text-teal-100/80"} ${weekMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {weekMenuOpen && (
                  <div
                    role="listbox"
                    className={`absolute left-0 top-[calc(100%+6px)] z-50 max-h-[260px] w-[170px] overflow-y-auto backdrop-blur-xl ${
                      isStarpathRealm
                        ? "border border-cyan-300/30"
                        : isMeasurementRealm
                        ? "border border-yellow-900/40"
                        : "border border-teal-300/30"
                    }`}
                    style={isStarpathRealm ? {
                      borderRadius: 14,
                      background: "rgba(15,17,45,0.95)",
                      boxShadow: "inset 0 1px 0 rgba(207,250,254,0.2), 0 14px 40px rgba(0,0,0,0.6), 0 0 24px rgba(124,58,237,0.18)",
                    } : isMeasurementRealm ? {
                      borderRadius: 14,
                      background: "rgba(22,14,4,0.94)",
                      boxShadow: "inset 0 1px 0 rgba(200,160,48,0.18), 0 14px 40px rgba(0,0,0,0.6), 0 0 24px rgba(109,40,217,0.12)",
                    } : {
                      clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                      background: "rgba(2,18,18,0.92)",
                      boxShadow: "inset 0 1px 0 rgba(94,234,212,0.25), 0 14px 40px rgba(0,0,0,0.55), 0 0 28px rgba(20,184,166,0.18)",
                    }}
                  >
                    <div className={`px-3 py-1.5 border-b text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${
                      isStarpathRealm ? "border-cyan-300/15 text-cyan-300/80" : isMeasurementRealm ? "border-yellow-900/30 text-yellow-200/50" : "border-teal-300/15 text-teal-300/80"
                    }`}>
                      Select Week
                    </div>
                    <ul className="py-0.5">
                      {Array.from({ length: lastWeek }).map((_, index) => {
                        const targetWeek = index + 1;
                        const isUnlocked = unrestrictedMode || (hasAssignedWeekAccess ? playableWeeks.includes(targetWeek) : targetWeek <= lastAllowedWeek);
                        const isCurrent = targetWeek === weekNum;
                        const isRequiredWeek = requiredWeeks.includes(targetWeek);
                        const isDoneWeek = isWeekComplete(getWeekProgress(store, year, targetWeek, realmId));
                        const status = hasPersonalizedPlan
                          ? isCurrent ? "Current" : isRequiredWeek ? isDoneWeek ? "Required Done" : "Required" : isDoneWeek ? "Optional Done" : requiredWeeksComplete ? "Optional" : "Locked"
                          : isCurrent ? "Current" : isUnlocked ? "Open" : "Locked";
                        return (
                          <li key={targetWeek}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isCurrent}
                              onClick={() => { setWeekMenuOpen(false); goToWeek(targetWeek); }}
                              className={`group flex w-full items-center justify-between gap-2 px-3 py-1 text-left text-[10px] font-mono font-bold uppercase tracking-[0.12em] transition ${
                                isStarpathRealm
                                  ? isCurrent
                                    ? "bg-cyan-400/15 text-cyan-100"
                                    : isUnlocked
                                    ? "text-cyan-50/85 hover:bg-cyan-400/10 hover:text-cyan-50"
                                    : "text-cyan-50/30 hover:bg-white/5"
                                  : isMeasurementRealm
                                  ? isCurrent
                                    ? "bg-yellow-900/20 text-yellow-100"
                                    : isUnlocked
                                    ? "text-yellow-100/70 hover:bg-yellow-900/15 hover:text-yellow-100"
                                    : "text-yellow-100/25 hover:bg-white/5"
                                  : isCurrent
                                    ? "bg-teal-400/15 text-teal-100"
                                    : isUnlocked
                                    ? "text-teal-50/85 hover:bg-teal-400/10 hover:text-teal-50"
                                    : "text-teal-50/30 hover:bg-white/5"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {isCurrent ? (
                                  <svg viewBox="0 0 24 24" className={`h-2.5 w-2.5 ${isStarpathRealm ? "text-cyan-300" : isMeasurementRealm ? "text-yellow-300" : "text-teal-300"}`} fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 12l5 5L20 7" />
                                  </svg>
                                ) : (
                                  <span className={`h-1 w-1 rounded-full ${
                                    isStarpathRealm
                                      ? isUnlocked ? "bg-cyan-400/70" : "bg-white/20"
                                      : isMeasurementRealm
                                      ? isUnlocked ? "bg-yellow-600/60" : "bg-white/15"
                                      : isUnlocked ? "bg-teal-400/70" : "bg-white/20"
                                  }`} />
                                )}
                                Week {targetWeek}
                              </span>
                              <span className={`text-[8px] tracking-[0.16em] ${
                                isStarpathRealm
                                  ? isCurrent ? "text-cyan-300" : isUnlocked ? "text-cyan-200/60" : "text-white/30"
                                  : isMeasurementRealm
                                  ? isCurrent ? "text-yellow-300/80" : isUnlocked ? "text-yellow-200/45" : "text-white/25"
                                  : isCurrent ? "text-teal-300" : isUnlocked ? "text-teal-200/60" : "text-white/30"
                              }`}>
                                {status}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <span className="text-sm text-white/80 font-medium ml-1">{levelLabel}</span>
          </div>

          <div className="text-center">
            {/* Nexus level pill */}
            <button
              type="button"
              onClick={handleSecretTeacherToggle}
              className={`inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.18em] ${isMeasurementRealm ? "text-yellow-50/95" : "text-teal-50"}`}
              style={{
                background: rt.pillBg,
                clipPath: rt.rounded ? undefined : "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                borderRadius: rt.rounded ? 999 : undefined,
                boxShadow: rt.pillShadow,
              }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${rt.pillDot}`} />
              {levelLabel} · {isStarpathRealm ? "Starpath Voyage" : "Program"}
            </button>
            <h1 className={`text-4xl md:text-5xl font-black text-white mt-3 tracking-tight ${rt.headingGlow}`}>Week {weekNum}</h1>
            <p className={`text-base md:text-lg mt-2 font-semibold ${isMeasurementRealm ? "text-amber-50/95 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]" : "text-teal-50/95"}`}>
              <span className={`${rt.focusColor} font-mono text-xs uppercase tracking-[0.18em] mr-2`}>Focus</span>
              {currentWeekPlan?.topic ?? "Your current focus"}
            </p>
            {hasPersonalizedPlan ? (
              <p className={`mt-2 text-xs font-mono uppercase tracking-[0.16em] ${isMeasurementRealm ? "text-amber-100/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]" : "text-teal-200/80"}`}>
                {currentWeekIsRequired ? "◆ Required Week" : canTakePostTestEarly ? "◆ Optional Practice Week" : "◆ Locked Bonus Week"}
              </p>
            ) : null}
            <p className={`mt-2 text-xs font-mono uppercase tracking-[0.16em] ${isMeasurementRealm ? "text-amber-100/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]" : "text-teal-200/80"}`}>
              {weekUnlocked
                ? weekComplete
                  ? "◆ Completed"
                  : `${lessonsDoneCount}/3 ${isStarpathRealm ? "Missions" : "Lessons"} · ${progress.quizCompleted ? (weekComplete ? "Quiz Passed" : "Quiz Attempted") : isStarpathRealm ? "Voyage Quiz Pending" : "Quiz Pending"}`
                : "◆ Preview Locked"}
            </p>

            {teacherToast ? (
              <div className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.16em] ${isMeasurementRealm ? "border border-yellow-900/35 bg-[#2a1a06]/75 text-yellow-100/90" : "border border-teal-300/35 bg-black/30 text-teal-100"}`}>
                {teacherToast}
              </div>
            ) : null}

            {/* XP plate */}
            <div className="mt-5 mx-auto max-w-sm relative">
              <div
                className="absolute -inset-[2px] pointer-events-none"
                style={isStarpathRealm ? {
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(103,232,249,0.55), rgba(124,58,237,0.22) 45%, rgba(34,211,238,0.5))",
                } : isMeasurementRealm ? {
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(200,160,48,0.42), rgba(120,90,15,0.14) 40%, rgba(200,160,48,0.36))",
                } : {
                  clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                  background: "linear-gradient(135deg, rgba(94,234,212,0.55), rgba(20,184,166,0.15) 40%, rgba(13,148,136,0.5))",
                }}
              />
              <div
                className="relative px-5 py-3"
                style={isStarpathRealm ? {
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(30,27,75,0.96) 0%, rgba(15,23,42,0.9) 50%, rgba(8,47,73,0.92) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(207,250,254,0.2), inset 0 -8px 18px rgba(0,0,0,0.5), 0 0 18px rgba(124,58,237,0.15)",
                } : isMeasurementRealm ? {
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #140e04 0%, #1e1506 50%, #2a1e08 100%)",
                  boxShadow: "inset 0 1px 0 rgba(200,160,48,0.2), inset 0 -8px 18px rgba(0,0,0,0.5), 0 0 18px rgba(109,40,217,0.08)",
                } : {
                  clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                  background: "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
                  boxShadow: "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -8px 18px rgba(0,0,0,0.45)",
                }}
              >
                {!isMeasurementRealm && !isStarpathRealm && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.4) 0 1px, transparent 1px 3px)" }}
                  />
                )}
                <div className={`relative h-2 rounded-full bg-black/50 overflow-hidden ${isStarpathRealm ? "ring-1 ring-cyan-400/20" : isMeasurementRealm ? "ring-1 ring-yellow-900/40" : "ring-1 ring-teal-400/20"}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, background: rt.xpBg, boxShadow: rt.xpGlow }}
                  />
                </div>
                <p className={`relative text-[10px] mt-2 text-center font-mono font-bold tracking-[0.2em] ${rt.xpLabelColor ?? "text-teal-100/90"}`}>
                  {xp} / {totalXp} XP
                </p>
              </div>
            </div>

            {hasPersonalizedPlan ? (
              <div className="mt-4 mx-auto max-w-3xl">
                <div
                  className={`overflow-hidden backdrop-blur-md ${isMeasurementRealm ? "rounded-[22px]" : ""}`}
                  style={isMeasurementRealm ? {
                    background: "rgba(20,14,6,0.66)",
                    border: "1px solid rgba(200,160,48,0.24)",
                    boxShadow: "0 14px 34px rgba(0,0,0,0.24), inset 0 1px 0 rgba(200,160,48,0.12)",
                  } : {
                    clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                    background: "rgba(2,18,18,0.72)",
                    border: "1px solid rgba(94,234,212,0.18)",
                    boxShadow: "0 14px 34px rgba(0,0,0,0.22), inset 0 1px 0 rgba(94,234,212,0.08)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPathwayJournalOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className={`text-[11px] font-mono font-black uppercase tracking-[0.22em] ${isMeasurementRealm ? "text-amber-100/90" : "text-teal-300/85"}`}>
                        Pathway Journal
                      </div>
                      <div className={`mt-1 text-xs ${isMeasurementRealm ? "text-amber-50/75" : "text-white/70"}`}>
                        {requiredWeeks.length} required week{requiredWeeks.length === 1 ? "" : "s"}
                        {optionalWeeks.length > 0 ? ` · ${optionalWeeks.length} optional` : ""}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-mono font-black uppercase tracking-[0.18em] ${isMeasurementRealm ? "text-yellow-100/85" : "text-teal-100/85"}`}>
                      {pathwayJournalOpen ? "Hide" : "Show"}
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-3.5 w-3.5 transition-transform ${pathwayJournalOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {pathwayJournalOpen ? (
                    <div className={`border-t px-4 pb-4 pt-3 ${isMeasurementRealm ? "border-yellow-900/20" : "border-teal-400/15"}`}>
                      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                          <div className={`text-[11px] font-mono font-black uppercase tracking-[0.22em] ${isMeasurementRealm ? "text-yellow-100/90" : "text-teal-300/85"}`}>
                            Required Pathway
                          </div>
                          <div className={`mt-2 text-sm ${isMeasurementRealm ? "text-amber-50/80" : "text-teal-50/90"}`}>
                            {fullRequiredPath
                              ? "These weeks are needed to pass this level. Complete them in order."
                              : "These weeks are needed to pass this level."}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {requiredWeeks.map((requiredWeek) => {
                              const done = isWeekComplete(getWeekProgress(store, year, requiredWeek, realmId));
                              const unlocked = playableWeeks.includes(requiredWeek) || done || requiredWeek === weekNum;
                              return (
                                <button
                                  key={requiredWeek}
                                  type="button"
                                  onClick={() => goToWeek(requiredWeek)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5 ${pathwayChipBase}`}
                                  style={done
                                    ? {
                                        background: isMeasurementRealm
                                          ? "linear-gradient(135deg, #1d3b22 0%, #0f6b4c 100%)"
                                          : "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                                        boxShadow: isMeasurementRealm
                                          ? "inset 0 1px 0 rgba(167,243,208,0.18)"
                                          : "inset 0 1px 0 rgba(110,231,183,0.45), 0 0 16px rgba(16,185,129,0.28)",
                                      }
                                    : unlocked
                                      ? undefined
                                      : {
                                          opacity: 0.72,
                                          background: isMeasurementRealm ? "rgba(42,26,6,0.55)" : "rgba(15,23,42,0.72)",
                                        }}
                                >
                                  <span>{done ? <Check className="h-4 w-4" /> : unlocked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
                                  <span>Week {requiredWeek}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className={`text-[11px] font-mono font-black uppercase tracking-[0.22em] ${isMeasurementRealm ? "text-amber-200/90" : "text-amber-200/90"}`}>
                            Optional Practice
                          </div>
                          <div className={`mt-2 text-sm ${isMeasurementRealm ? "text-amber-50/80" : "text-white/80"}`}>
                            {canTakePostTestEarly
                              ? "You’ve completed your required pathway. You can take the post-test now or keep practising for extra XP."
                              : "Complete your required pathway to unlock these extra weeks for more XP, rewards, and practice."}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {optionalWeeks.length === 0 ? (
                              <div className={`rounded-full px-3 py-2 text-xs ${optionalChipBase}`}>
                                No optional weeks in this pathway.
                              </div>
                            ) : optionalWeeks.map((optionalWeek) => {
                              const done = isWeekComplete(getWeekProgress(store, year, optionalWeek, realmId));
                              const optionalPlayable = requiredWeeksComplete || done;
                              return (
                                <button
                                  key={optionalWeek}
                                  type="button"
                                  onClick={() => goToWeek(optionalWeek)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5 ${optionalChipBase}`}
                                  style={done
                                    ? {
                                        background: isMeasurementRealm
                                          ? "linear-gradient(135deg, #1d3b22 0%, #0f6b4c 100%)"
                                          : "linear-gradient(135deg, rgba(16,185,129,0.28), rgba(6,78,59,0.9))",
                                      }
                                    : optionalPlayable
                                      ? undefined
                                      : {
                                          opacity: 0.72,
                                          background: isMeasurementRealm ? "rgba(31,20,7,0.55)" : "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.92))",
                                        }}
                                >
                                  <span>{done ? <Check className="h-4 w-4" /> : optionalPlayable ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
                                  <span>Week {optionalWeek}</span>
                                </button>
                              );
                            })}
                          </div>

                          {requiredWeeksComplete ? (
                            <div className={`mt-4 rounded-2xl p-4 ${isMeasurementRealm ? "border border-yellow-900/30 bg-[#2a1a06]/70" : "border border-emerald-300/25 bg-emerald-400/10"}`}>
                              <div className={`text-[11px] font-mono font-black uppercase tracking-[0.18em] ${isMeasurementRealm ? "text-yellow-100/90" : "text-emerald-200"}`}>
                                Ready For Post-Test
                              </div>
                              <p className="mt-2 text-sm text-white/85">
                                All required weeks are complete. You can take the post-test now, or keep working through optional weeks first.
                              </p>
                              <button
                                type="button"
                                onClick={() => router.push(`/posttest?year=${encodeURIComponent(curriculumYear)}${isMeasurementRealm ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`)}
                                className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] text-white"
                                style={{
                                  background: isMeasurementRealm
                                    ? "linear-gradient(135deg, #7c5a20 0%, #b8893a 55%, #d6b86c 100%)"
                                    : "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                                  boxShadow: isMeasurementRealm
                                    ? "inset 0 1px 0 rgba(245,220,160,0.35), 0 0 16px rgba(184,137,58,0.22)"
                                    : "inset 0 1px 0 rgba(110,231,183,0.45), 0 0 16px rgba(16,185,129,0.22)",
                                }}
                              >
                                Take Post-Test
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Horizontal lesson dashboard ── */}
      <div
        className={`relative z-10 px-4 pb-16 md:px-6 ${
          isMeasurementRealm ? "pt-16 md:pt-24" : "pt-10 md:pt-16"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-stretch relative">
            {items.map((item, idx) => {
              const isLesson = item.type === "lesson";
              const isPostTest = item.type === "posttest";
              const completed = isLesson
                ? progress.lessonsCompleted[item.n - 1]
                : isPostTest
                  ? false
                  : progress.quizCompleted;

              let locked = false;
              if (!unrestrictedMode) {
                if (!weekUnlocked) {
                  locked = true;
                }
                if (isLesson && item.n > 1 && !progress.lessonsCompleted[item.n - 2]) locked = true;
                if (item.type === "quiz" && lessonsDoneCount < 3) locked = true;
                if (isPostTest) {
                  if (hasPersonalizedPlan) locked = !requiredWeeksComplete;
                  else if (lessonsDoneCount < 3) locked = true;
                }
              }

              const isActive = !locked && !completed;
              const postTestReady = isPostTest && !locked;
              const isLast = idx === items.length - 1;
              return (
                <div key={`${item.type}-${item.n}`} className="relative flex">
                  {/* Bezel / border frame */}
                  <div
                    className="absolute -inset-[2px] pointer-events-none"
                    style={{
                      clipPath: rt.bezelClip,
                      borderRadius: activityCardVariant === "portal-circle" ? 46 : rt.rounded ? 28 : undefined,
                      background: locked
                        ? rt.bezelLockedBg
                        : postTestReady
                          ? rt.bezelPosttestBg
                          : isActive
                            ? rt.bezelActiveBg
                            : rt.bezelCompletedBg,
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    aria-disabled={locked}
                    onClick={() => !locked && openItem(item)}
                    onKeyDown={(e) => {
                      if (!locked && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        openItem(item);
                      }
                    }}
                    className={[
                      "relative w-full text-left p-5 transition-all flex flex-col gap-3 group overflow-hidden",
                      activityCardVariant === "portal-circle" ? "rounded-[44px]" : rt.rounded ? "rounded-3xl" : "",
                      locked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1 cursor-pointer",
                    ].join(" ")}
                    style={{
                      clipPath: rt.cardClip,
                      background: locked
                        ? rt.cardLockedBg
                        : completed
                          ? rt.cardCompletedBg
                          : rt.cardActiveBg,
                      boxShadow: completed
                        ? rt.cardCompletedShadow
                        : isActive
                          ? rt.cardActiveShadow
                          : rt.cardLockedShadow,
                    }}
                  >
                    {/* Scanline texture — Nexus only */}
                    {rt.scanline && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-[0.06]"
                        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.6) 0 1px, transparent 1px 3px)" }}
                      />
                    )}
                    {/* Completed checkmark watermark */}
                    {completed && (
                      <svg
                        className={`absolute -right-4 -bottom-4 h-32 w-32 pointer-events-none ${isMeasurementRealm ? "text-yellow-200/10" : "text-emerald-400/10"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    {/* Completed top stripe */}
                    {completed && (
                      <div
                        className="absolute top-0 left-0 h-1 w-full pointer-events-none"
                        style={
                          isMeasurementRealm
                            ? {
                                background:
                                  "linear-gradient(90deg, #fcd34d, #c8a030 45%, #7c3aed 80%, transparent 100%)",
                                boxShadow:
                                  "0 0 12px rgba(200,160,48,0.55), 0 0 16px rgba(109,40,217,0.22)",
                              }
                            : {
                                background:
                                  "linear-gradient(90deg, #6ee7b7, #10b981 50%, transparent 100%)",
                                boxShadow: "0 0 12px rgba(110,231,183,0.7)",
                              }
                        }
                      />
                    )}

                    {/* Row 1: lesson label + status badge */}
                    <div className="relative flex items-center justify-between">
                      <span
                        className="inline-flex items-center px-3 py-1 text-[11px] font-mono font-extrabold uppercase tracking-[0.18em]"
                        style={{
                          clipPath: rt.badgeClip,
                          borderRadius: rt.rounded ? 999 : undefined,
                          background: locked
                            ? rt.badgeLockedBg
                            : postTestReady
                              ? rt.badgePosttestBg
                              : completed
                                ? rt.badgeCompletedBg
                                : rt.badgeActiveBg,
                          color: locked ? "#94a3b8" : "#ecfeff",
                          boxShadow: locked ? undefined : rt.badgeShadow,
                        }}
                      >
                        {isPostTest ? "Post Test" : item.type === "quiz" ? isStarpathRealm ? "Voyage Quiz" : "Weekly Quiz" : `${isStarpathRealm ? "Mission" : "Lesson"} ${item.n}`}
                      </span>

                      {completed ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-[0.14em] ${isMeasurementRealm ? "text-yellow-50" : "text-emerald-100"}`}
                          style={{
                            clipPath: rt.statusClip,
                            borderRadius: rt.rounded ? 999 : undefined,
                            background: rt.statusCompletedBg,
                            boxShadow: isMeasurementRealm
                              ? "inset 0 1px 0 rgba(252,211,77,0.32), 0 0 10px rgba(109,40,217,0.18)"
                              : "inset 0 1px 0 rgba(110,231,183,0.4)",
                          }}
                        >
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                          DONE
                        </span>
                      ) : locked ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-[0.14em] text-slate-400"
                          style={{
                            clipPath: rt.statusClip,
                            borderRadius: rt.rounded ? 999 : undefined,
                            background: rt.statusLockedBg,
                          }}
                        >
                          <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> LOCKED</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-[0.14em] text-white"
                          style={{
                            clipPath: rt.statusClip,
                            borderRadius: rt.rounded ? 999 : undefined,
                            background: postTestReady ? rt.statusPosttestBg : rt.statusActiveBg,
                            boxShadow: rt.statusShadow,
                          }}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${rt.dotClass} animate-pulse`} />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Row 2: title + focus */}
                    <div className="relative flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="font-extrabold text-white leading-tight line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                          {item.title}
                        </div>
                        <ReadAloudBtn
                          text={item.title}
                          className="shrink-0 mt-0.5 !bg-white/10 !border-white/25 !text-white hover:!text-white hover:!border-white/40"
                        />
                      </div>
                      <div className="mt-1.5 text-xs text-white/60 leading-snug line-clamp-2">
                        {!weekUnlocked
                          ? hasPersonalizedPlan
                            ? "Complete your current lesson to unlock this"
                            : "Complete previous weeks to unlock"
                          : locked && isPostTest
                            ? hasPersonalizedPlan
                              ? "Complete your required pathway to unlock"
                              : "Complete all lessons to unlock"
                            : item.focus}
                      </div>
                    </div>

                    {/* Row 3: XP + action button */}
                    <div className={`relative flex items-center justify-between pt-2 border-t ${rt.dividerColor ?? "border-teal-400/15"}`}>
                      <span className={`text-[10px] font-mono font-bold tracking-[0.14em] ${rt.xpLabelColor ?? "text-teal-200/70"}`}>
                        {isPostTest ? "MASTERY" : isLesson ? "10 XP" : "20 XP"}
                      </span>
                      {locked ? (
                        <span className="text-[10px] font-mono font-extrabold text-slate-400">
                          {weekUnlocked ? "—" : "LOCKED"}
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-mono font-extrabold tracking-[0.18em] px-4 py-1.5 text-white"
                          style={{
                            clipPath: rt.actionClip,
                            borderRadius: rt.rounded ? 999 : undefined,
                            background: postTestReady
                              ? rt.actionPosttestBg
                              : completed
                                ? rt.actionCompletedBg
                                : rt.actionActiveBg,
                            boxShadow: locked ? undefined : rt.actionShadow,
                          }}
                        >
                          {completed ? "REPLAY" : isStarpathRealm ? item.type === "quiz" ? "START QUIZ" : "START MISSION" : "START"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connector between cards */}
                  {!isLast && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 pointer-events-none">
                      <div
                        className="h-7 w-7 flex items-center justify-center"
                        style={{
                          clipPath: rt.connClip,
                          borderRadius: rt.rounded ? "50%" : undefined,
                          background: completed ? rt.connCompletedBg : rt.connActiveBg,
                          boxShadow: rt.connShadow,
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 6l6 6-6 6" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!weekUnlocked ? (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-6 text-center backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${isMeasurementRealm ? "bg-[#2a1a06]/85 text-yellow-100" : "bg-white/8 text-teal-100"}`}>
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Week {weekNum} Preview</h2>
              <p className={`mt-2 text-sm font-semibold ${isMeasurementRealm ? "text-amber-50/80" : "text-teal-100/75"}`}>
                Complete previous weeks to unlock
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => goToWeek(lastAllowedWeek)}
                  className={`rounded-2xl px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 ${isMeasurementRealm ? "" : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-950/30"}`}
                  style={isMeasurementRealm ? {
                    background: "linear-gradient(135deg, #7c5a20 0%, #b8893a 55%, #d6b86c 100%)",
                    boxShadow: "0 10px 24px rgba(80,45,8,0.32)",
                  } : undefined}
                >
                  Go to Week {lastAllowedWeek}
                </button>
                <button
                  onClick={() => router.push(realmHomeRoute)}
                  className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Back to Map
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
