"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PracticeRunner } from "@/components/PracticeRunner";
import { PerformanceSummaryCard } from "@/components/lesson/PerformanceSummaryCard";
import { Year2LessonEngine, type LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";
import { generateWeek1Task } from "@/data/activities/year1/week1";
import { generateWeek2Task } from "@/data/activities/year1/week2";
import { generateWeek3Task } from "@/data/activities/year1/week3";
import { generateWeek4Task } from "@/data/activities/year1/week4";
import { generateWeek5Task } from "@/data/activities/year1/week5";
import { generateWeek6Task } from "@/data/activities/year1/week6";
import { generateWeek7Task } from "@/data/activities/year1/week7";
import { generateWeek8Task } from "@/data/activities/year1/week8";
import { generateWeek9Task } from "@/data/activities/year1/week9";
import { generateWeek10Task } from "@/data/activities/year1/week10";
import { generateWeek12Task } from "@/data/activities/year1/week12";
import { generateWeek11Task } from "@/data/activities/year1/week11";
import { resetWeek1TaskSessionState } from "@/data/activities/year1/week1";
import { resetWeek2TaskSessionState } from "@/data/activities/year1/week2";
import { resetWeek3TaskSessionState } from "@/data/activities/year1/week3";
import { resetWeek4TaskSessionState } from "@/data/activities/year1/week4";
import { generatePrepWeek1Task, resetPrepWeek1TaskSessionState } from "@/data/activities/prep/week1";
import { generatePrepWeek2Task, resetPrepWeek2TaskSessionState } from "@/data/activities/prep/week2";
import { generatePrepWeek3Task, resetPrepWeek3TaskSessionState } from "@/data/activities/prep/week3";
import { generatePrepWeek4Task, resetPrepWeek4TaskSessionState } from "@/data/activities/prep/week4";
import { generatePrepWeek5Task, resetPrepWeek5TaskSessionState } from "@/data/activities/prep/week5";
import { generatePrepWeek6Task, resetPrepWeek6TaskSessionState } from "@/data/activities/prep/week6";
import { generatePrepWeek7Task, resetPrepWeek7TaskSessionState } from "@/data/activities/prep/week7";
import { generatePrepWeek8Task, resetPrepWeek8TaskSessionState } from "@/data/activities/prep/week8";
import { generatePrepWeek9Task, resetPrepWeek9TaskSessionState } from "@/data/activities/prep/week9";
import { generatePrepWeek10Task, resetPrepWeek10TaskSessionState } from "@/data/activities/prep/week10";
import { generatePrepWeek11Task, resetPrepWeek11TaskSessionState } from "@/data/activities/prep/week11";
import { generatePrepWeek12Task, resetPrepWeek12TaskSessionState } from "@/data/activities/prep/week12";
import {
  generatePrepMeasurelandsWeek1Task,
  resetPrepMeasurelandsWeek1TaskSessionState,
} from "@/data/activities/prepMeasurelands/week1";
import {
  generatePrepMeasurelandsWeek1Lesson2Task,
  resetPrepMeasurelandsWeek1Lesson2TaskSessionState,
} from "@/data/activities/prepMeasurelands/week1Lesson2";
import { getProgramForYear } from "@/data/programs";
import { getCurriculumPlan } from "@/data/programs/genres";
import { DEMO_MODE } from "@/data/config";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress, updateProgress } from "@/data/progress";
import { trackLiveLearningEvent } from "@/lib/live-class-client";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { markLessonComplete } from "@/lib/program-progress";
import { getRecommendedAssignedWeek, isWeekPlayable, readProgramStore, getWeekProgress } from "@/lib/program-progress";
import { getLessonChrome } from "@/lib/levelTheme";
import { LessonPageHero } from "@/components/lesson/LessonPageHero";
import { ActiveLearningTracker } from "@/components/student/ActiveLearningTracker";
import { supabase } from "@/lib/supabase";
import { recordStudentActivityDelta } from "@/lib/student-activity";
import type { TeacherInsight, TeacherInsightInput } from "@/lib/teacher-insights";
import { saveNumberLessonAttempt, saveStudentProgressState } from "@/lib/student-progress-sync";

export default function LessonPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><LessonPage /></Suspense>;
}

function isPrepGroundCustomLesson(lessonId: string) {
  return (
    lessonId.startsWith("y0-w1-") ||
    lessonId.startsWith("y0-w2-") ||
    lessonId.startsWith("y0-w3-") ||
    lessonId.startsWith("y0-w4-") ||
    lessonId.startsWith("y0-w5-") ||
    lessonId.startsWith("y0-w6-") ||
    lessonId === "y0-w7-l1" ||
    lessonId === "y0-w7-l2" ||
    lessonId === "y0-w7-l3" ||
    lessonId === "y0-w8-l1" ||
    lessonId === "y0-w8-l2" ||
    lessonId === "y0-w8-l3" ||
    lessonId === "y0-w9-l1" ||
    lessonId === "y0-w9-l2" ||
    lessonId === "y0-w9-l3" ||
    lessonId === "y0-w10-l1" ||
    lessonId === "y0-w10-l2" ||
    lessonId === "y0-w10-l3" ||
    lessonId === "y0-w11-l1" ||
    lessonId === "y0-w11-l2" ||
    lessonId === "y0-w11-l3" ||
    lessonId === "y0-w12-l1" ||
    lessonId === "y0-w12-l2" ||
    lessonId === "y0-w12-l3" ||
    lessonId.startsWith("y0-measurement-w")
  );
}

function getPrepGroundTask(lessonId: string, difficulty: "easy" | "medium" | "hard") {
  if (lessonId.startsWith("y0-measurement-w1-l1")) {
    return generatePrepMeasurelandsWeek1Task(lessonId, difficulty);
  }
  if (lessonId.startsWith("y0-measurement-w1-l2")) {
    return generatePrepMeasurelandsWeek1Lesson2Task(lessonId, difficulty);
  }

  const normalizedLessonId = lessonId.startsWith("y0-measurement-")
    ? lessonId.replace("y0-measurement-", "y0-")
    : lessonId;

  if (normalizedLessonId.startsWith("y0-w12-")) return generatePrepWeek12Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w11-")) return generatePrepWeek11Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w10-")) return generatePrepWeek10Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w9-")) return generatePrepWeek9Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w8-")) return generatePrepWeek8Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w7-")) return generatePrepWeek7Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w6-")) return generatePrepWeek6Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w5-")) return generatePrepWeek5Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w4-")) return generatePrepWeek4Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w3-")) return generatePrepWeek3Task(normalizedLessonId, difficulty);
  if (normalizedLessonId.startsWith("y0-w2-")) return generatePrepWeek2Task(normalizedLessonId, difficulty);
  return generatePrepWeek1Task(normalizedLessonId, difficulty);
}

function LessonPage() {
  const router = useRouter();
  const params = useSearchParams();

  const year = params.get("year") ?? "Year 1";
  const realmId = params.get("realm_id") ?? "number";
  const week = Number(params.get("week") ?? "1");
  const yearNumber = year === "Prep" ? 0 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelNumber = year === "Prep" ? 1 : yearNumber;
  const levelLabel = year === "Prep" ? "Ground Level" : `Level ${levelNumber}`;
  const defaultLessonId =
    realmId === "measurement" && year === "Prep"
      ? `y0-measurement-w${week}-l1`
      : `y${yearNumber}-w${week}-l1`;
  const lessonId = params.get("lessonId") ?? defaultLessonId;
  const expectedPrefix =
    realmId === "measurement" && year === "Prep"
      ? `y0-measurement-w${week}-`
      : `y${yearNumber}-w${week}-`;
  const previewMode = isDemoPreviewMode();
  const effectiveLessonId = lessonId.startsWith(expectedPrefix)
    ? lessonId
    : defaultLessonId;

  // Extract lesson number from lessonId (e.g. "y1-w1-l2" → 2)
  const lessonNumber = useMemo(() => {
    const match = effectiveLessonId.match(/l(\d+)$/);
    return match ? Number(match[1]) : 1;
  }, [effectiveLessonId]);
  const lessonChrome = useMemo(() => getLessonChrome(levelNumber), [levelNumber]);
  const mapRoute = realmId === "measurement" ? "/measurelands" : "/number-nexus";
  const isMeasurement = realmId === "measurement";

  // ── Lesson page theme — add a new entry here for future realms ────────────
  const lt = isMeasurement ? {
    // outer wrapper
    outerBorder: "border-amber-900/35",
    // content area
    contentBg: "bg-[#faf3e4]",
    // card shared
    cardBorder: "border-amber-800/25",
    cardShadow: "0 2px 6px rgba(44,28,8,0.05), 0 8px 24px rgba(44,28,8,0.09)",
    // mission briefing
    missionBg: "#fdf6e8",
    missionBadgeBg: "rgba(75,40,100,0.08)",
    missionBadgeBorder: "rgba(139,92,246,0.35)",
    missionBadgeText: "#5b21b6",
    missionBadgeIconBg: "rgba(109,40,217,0.85)",
    missionFocusLabel: "#7c3aed",
    // corner decoration — ruler marks
    cornerDecoration: "ruler" as const,
    // video card
    videoBg: "linear-gradient(135deg, #1e1040 0%, #2d1b69 55%, #3c1f8a 100%)",
    videoGridColor: "rgba(139,92,246,0.22)",
    videoCornerColor: "rgba(167,139,250,0.55)",
    videoPlayBorder: "rgba(167,139,250,0.45)",
    videoPlayBg: "rgba(139,92,246,0.12)",
    videoPlayIcon: "#c4b5fd",
    videoPlayGlow: "0 0 24px rgba(109,40,217,0.3)",
    videoText: "rgba(196,181,253,0.85)",
    videoHeaderIconBg: "linear-gradient(135deg, #6d28d9, #4c1d95)",
    videoHeaderIconShadow: "0 2px 6px rgba(109,40,217,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
    videoLiveDot: "#c8a030",
    videoLiveText: "rgba(200,160,48,0.7)",
    // action strip
    stripBg: "#fdf6e8",
    stripBorder: "rgba(180,120,20,0.22)",
    // time widget
    timeBezel: "linear-gradient(135deg, rgba(214,184,108,0.52) 0%, rgba(120,82,24,0.18) 45%, rgba(168,122,40,0.42) 100%)",
    timeBg: "linear-gradient(145deg, #1b1106 0%, #32200c 52%, #4a3012 100%)",
    timeShadow: "inset 0 1px 0 rgba(234,211,166,0.22), inset 0 -10px 18px rgba(0,0,0,0.38), 0 10px 24px rgba(44,28,8,0.18)",
    timeIconBg: "radial-gradient(circle at 35% 30%, #e3c26c 0%, #8b5a18 55%, #241304 100%)",
    timeIconShadow: "inset 0 0 8px rgba(243,221,156,0.45), 0 0 12px rgba(109,40,217,0.12)",
    timeIconShape: "50%" as const,
    timeText: "#f8eed3",
    // xp widget (keep existing gold — works for both)
    xpBezel: "linear-gradient(135deg, rgba(214,184,108,0.48) 0%, rgba(121,92,38,0.2) 48%, rgba(109,40,217,0.18) 100%)",
    xpBg: "linear-gradient(145deg, #1f1407 0%, #3a2510 42%, #5a3a16 100%)",
    xpShadow: "inset 0 1px 0 rgba(234,211,166,0.24), inset 0 -10px 18px rgba(0,0,0,0.42), 0 10px 24px rgba(44,28,8,0.2)",
    // legend widget
    legendBezel: "linear-gradient(135deg, rgba(188,156,255,0.52) 0%, rgba(109,40,217,0.26) 48%, rgba(214,184,108,0.24) 100%)",
    legendBg: "linear-gradient(145deg, #1c0f35 0%, #3a216f 48%, #5b2ca2 100%)",
    legendShadow: "inset 0 1px 0 rgba(221,214,254,0.24), inset 0 -10px 18px rgba(0,0,0,0.42), 0 10px 24px rgba(61,30,100,0.22), 0 0 16px rgba(109,40,217,0.18)",
    legendIconBg: "radial-gradient(circle at 35% 30%, #d8b4fe 0%, #7c3aed 58%, #2e1065 100%)",
    legendIconShadow: "inset 0 0 8px rgba(216,180,254,0.42), 0 0 12px rgba(109,40,217,0.26)",
    legendIconShape: "50%" as const,
    legendText: "#e9d5ff",
    // begin practise button
    btnBezel: "linear-gradient(135deg, rgba(221,191,116,0.68) 0%, rgba(133,92,24,0.28) 50%, rgba(196,151,54,0.56) 100%)",
    btnBg: "linear-gradient(145deg, #2c1c07 0%, #5d3b12 38%, #866022 72%, #b58832 100%)",
    btnShadow: "inset 0 1px 0 rgba(245,229,188,0.24), inset 0 -12px 20px rgba(0,0,0,0.42), 0 10px 24px rgba(44,28,8,0.34), 0 0 18px rgba(109,40,217,0.08)",
    btnText: "#faf0d0",
    btnBorderRadius: 12 as number,
  } : {
    // Number Nexus — keep every existing value unchanged
    outerBorder: "border-border/40",
    contentBg: "bg-background",
    cardBorder: "border-teal-200/60",
    cardShadow: "0 2px 6px rgba(2,23,22,0.04), 0 8px 24px rgba(2,23,22,0.06)",
    missionBg: undefined,
    missionBadgeBg: undefined,
    missionBadgeBorder: undefined,
    missionBadgeText: undefined,
    missionBadgeIconBg: undefined,
    missionFocusLabel: undefined,
    cornerDecoration: "circuit" as const,
    videoBg: "linear-gradient(135deg, #021716 0%, #064e47 60%, #0d9488 100%)",
    videoGridColor: "rgba(94,234,212,1)",
    videoCornerColor: "rgba(94,234,212,0.7)",
    videoPlayBorder: "rgba(94,234,212,0.4)",
    videoPlayBg: "rgba(94,234,212,0.15)",
    videoPlayIcon: "#5eead4",
    videoPlayGlow: "0 0 24px rgba(94,234,212,0.35)",
    videoText: "rgba(255,255,255,0.8)",
    videoHeaderIconBg: "linear-gradient(135deg, #0d9488, #047857)",
    videoHeaderIconShadow: "0 2px 6px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
    videoLiveDot: "#10b981",
    videoLiveText: "rgba(13,148,136,0.7)",
    stripBg: undefined,
    stripBorder: undefined,
    timeBezel: "linear-gradient(135deg, rgba(94,234,212,0.55) 0%, rgba(15,118,110,0.25) 50%, rgba(94,234,212,0.45) 100%)",
    timeBg: "linear-gradient(135deg, #021a18 0%, #063d38 45%, #0a5048 100%)",
    timeShadow: "inset 0 1px 0 rgba(94,234,212,0.35), inset 0 -8px 16px rgba(0,0,0,0.4)",
    timeIconBg: "radial-gradient(circle at 35% 30%, #0d9488 0%, #064e47 60%, #021716 100%)",
    timeIconShadow: "inset 0 0 6px rgba(94,234,212,0.6), 0 0 8px rgba(94,234,212,0.3)",
    timeIconShape: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" as unknown as "50%",
    timeText: "#ecfeff",
    xpBezel: "linear-gradient(135deg, rgba(251,191,36,0.55) 0%, rgba(94,234,212,0.3) 50%, rgba(251,191,36,0.45) 100%)",
    xpBg: "linear-gradient(135deg, #021a18 0%, #0a3d36 45%, #154d3a 100%)",
    xpShadow: "inset 0 1px 0 rgba(251,191,36,0.3), inset 0 -8px 16px rgba(0,0,0,0.4), 0 0 18px rgba(251,191,36,0.18)",
    legendBezel: "linear-gradient(135deg, rgba(110,231,183,0.55) 0%, rgba(15,118,110,0.3) 50%, rgba(110,231,183,0.45) 100%)",
    legendBg: "linear-gradient(135deg, #021a18 0%, #063d38 45%, #0d6b50 100%)",
    legendShadow: "inset 0 1px 0 rgba(110,231,183,0.35), inset 0 -8px 16px rgba(0,0,0,0.4), 0 0 14px rgba(52,211,153,0.15)",
    legendIconBg: "radial-gradient(circle at 35% 30%, #34d399 0%, #065f46 60%, #021716 100%)",
    legendIconShadow: "inset 0 0 6px rgba(110,231,183,0.7), 0 0 10px rgba(52,211,153,0.4)",
    legendIconShape: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" as unknown as "50%",
    legendText: "#ecfdf5",
    btnBezel: "linear-gradient(135deg, rgba(94,234,212,0.7) 0%, rgba(15,118,110,0.35) 50%, rgba(94,234,212,0.6) 100%)",
    btnBg: "linear-gradient(135deg, #021a18 0%, #064e47 45%, #0d9488 100%)",
    btnShadow: "inset 0 1px 0 rgba(94,234,212,0.4), inset 0 -10px 20px rgba(0,0,0,0.45), 0 8px 22px rgba(2,23,22,0.5), 0 0 18px rgba(94,234,212,0.2)",
    btnText: "#ecfeff",
    btnBorderRadius: 0,
  };
  const lessonProgram = useMemo(
    () => (realmId === "measurement" ? getCurriculumPlan(year, "measurement") : getProgramForYear(year)),
    [realmId, year]
  );

  const [startedLessonId, setStartedLessonId] = useState<string | null>(null);
  const lessonMeta = useMemo(() => {
    const weekPlan = lessonProgram.find((w) => w.week === week);
    return weekPlan?.lessons.find((l) => l.id === effectiveLessonId) ?? null;
  }, [effectiveLessonId, lessonProgram, week]);
  const started = startedLessonId === effectiveLessonId;
  const safeLessonTitle = lessonMeta?.displayTitle ?? lessonMeta?.title ?? null;
  const safeLessonFocus = lessonMeta?.focus ?? null;
  const hasEmbeddedLessonVideo =
    year === "Year 4" && week === 2 && lessonNumber === 1;
  const isGroundCustomLesson =
    year === "Prep" && isPrepGroundCustomLesson(effectiveLessonId);

  useEffect(() => {
    const p = readProgress();
    if (!previewMode && !isPlacementComplete(p)) {
      router.replace(`/home`);
      return;
    }
    if (!DEMO_MODE && !previewMode && p?.year && p.year !== year) {
      router.replace(mapRoute);
    }
  }, [previewMode, router, year]);

  useEffect(() => {
    const p = readProgress();
    if (!p || p.status !== "ASSIGNED_PROGRAM") return;
    if (p.requiredWeeks?.length) return;
    const nextWeek = Math.max(p.assignedWeek ?? 1, week);
    if (nextWeek !== p.assignedWeek) updateProgress({ assignedWeek: nextWeek });
  }, [week]);

  useEffect(() => {
    const p = readProgress();
    if (previewMode || !p || p.status !== "ASSIGNED_PROGRAM" || p.year !== year) return;

    const store = readProgramStore();
    const weekPlayable = isWeekPlayable(store, year, week, p.requiredWeeks, p.optionalWeeks);
    if (!weekPlayable) {
      router.replace(mapRoute);
      return;
    }

    const weekProgress = getWeekProgress(store, year, week);
    if (lessonNumber > 1 && !weekProgress.lessonsCompleted[lessonNumber - 2]) {
      return;
    }
  }, [lessonNumber, previewMode, router, week, year]);

  const blockedPreviousLesson = useMemo(() => {
    if (DEMO_MODE || previewMode) return null;
    const p = readProgress();
    if (!p || p.status !== "ASSIGNED_PROGRAM" || p.year !== year) return null;
    const store = readProgramStore();
    if (!isWeekPlayable(store, year, week, p.requiredWeeks, p.optionalWeeks)) return null;
    const weekProgress = getWeekProgress(store, year, week);
    if (lessonNumber > 1 && !weekProgress.lessonsCompleted[lessonNumber - 2]) {
      return lessonNumber - 1;
    }
    return null;
  }, [lessonNumber, previewMode, week, year]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lul_lesson_start_time");
    }
    if (year === "Year 1") {
      resetYear1SessionTaskState();
    }
    if (isGroundCustomLesson) {
      resetPrepSessionTaskState();
    }
  }, [effectiveLessonId, isGroundCustomLesson, week, year]);
  const lessonFinalizedRef = useRef(false);

  async function completeLesson() {
    if (lessonFinalizedRef.current) {
      const realmParam = realmId === "measurement" ? `&realm_id=${encodeURIComponent(realmId)}` : "";
      router.push(`/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1${realmParam}`);
      return;
    }
    lessonFinalizedRef.current = true;

    markLessonComplete(year, week, lessonNumber);
    const progress = readProgress();
    let nextAssignedWeek = progress?.assignedWeek;
    if (progress?.status === "ASSIGNED_PROGRAM" && progress.requiredWeeks?.length) {
      nextAssignedWeek = getRecommendedAssignedWeek(
        readProgramStore(),
        year,
        progress.assignedWeek,
        progress.requiredWeeks
      );
      if (nextAssignedWeek !== progress.assignedWeek) {
        updateProgress({ assignedWeek: nextAssignedWeek });
      }
    }

    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
    if (studentId) {
      try {
        if (latestLessonSummaryRef.current) {
          await trackLiveLearningEvent({
            eventType: "lesson_completed",
            level: liveLessonContext.level,
            strand: liveLessonContext.strand,
            week: liveLessonContext.week,
            lessonId: liveLessonContext.lessonId,
            lessonTitle: liveLessonContext.lessonTitle,
            progressPercent: 100,
            progressLabel: `Completed ${latestLessonSummaryRef.current.questionsAnswered} questions`,
          });
          await persistLessonPerformanceSummary(latestLessonSummaryRef.current);
        } else {
          await trackLiveLearningEvent({
            eventType: "lesson_completed",
            level: liveLessonContext.level,
            strand: liveLessonContext.strand,
            week: liveLessonContext.week,
            lessonId: liveLessonContext.lessonId,
            lessonTitle: liveLessonContext.lessonTitle,
            progressPercent: 100,
            progressLabel: "Lesson completed",
          });

          const fallbackAttempt = {
            at: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            completed: true,
            lessonId: effectiveLessonId,
            lessonNumber,
            title: liveLessonContext.lessonTitle,
            questionsAnswered: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            correctCount: 0,
            accuracy: 0,
            accuracyPercent: 0,
            bestChain: 0,
            timeSpentSeconds: 0,
            topicSummaries: [],
            strengths: [],
            areasToImprove: [],
            struggledQuestionTypes: [],
            insight: null,
          };

          await saveNumberLessonAttempt(studentId, year, week, lessonNumber, effectiveLessonId, fallbackAttempt);
        }

        const latest = readProgress();
        await saveStudentProgressState(studentId, year, {
          status: latest?.status ?? progress?.status ?? "ASSIGNED_PROGRAM",
          week,
          placement_complete: latest?.placementComplete ?? progress?.placementComplete ?? false,
          assigned_week: nextAssignedWeek ?? latest?.assignedWeek ?? progress?.assignedWeek ?? null,
          required_weeks: latest?.requiredWeeks ?? progress?.requiredWeeks ?? [],
          optional_weeks: latest?.optionalWeeks ?? progress?.optionalWeeks ?? [],
          unlocked_legends: latest?.unlockedLegends ?? progress?.unlockedLegends ?? [],
        });
      } catch (error) {
        lessonFinalizedRef.current = false;
        console.warn("[Lesson] Final completion sync failed:", error);
        window.alert("We couldn't save this lesson yet. Please try again.");
        return;
      }
    }
    // First call only FINALISES the lesson (marks complete + persists) so XP /
    // progress are never lost — even if the student exits during the reflection
    // screen. Navigation to the week page happens on the explicit Continue /
    // "Back to Week" action (which re-enters this function with the ref set).
  }

  function goBackToProgram() {
    const realmParam = realmId === "measurement" ? `&realm_id=${encodeURIComponent(realmId)}` : "";
    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1${realmParam}`);
  }

  const showWeek12Lesson3Summary = week === 12 && lessonNumber === 3;
  const savedLessonSummaryKeysRef = useRef<Set<string>>(new Set());
  const latestLessonSummaryRef = useRef<LessonPerformanceSummary | null>(null);
  const liveLessonContext = {
    level: year,
    strand: "Number",
    week,
    lessonId: effectiveLessonId,
    lessonTitle: safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`,
  };

  async function persistLessonPerformanceSummary(summary: LessonPerformanceSummary) {
    latestLessonSummaryRef.current = summary;
    const summaryKey = `${effectiveLessonId}:${summary.questionsAnswered}:${summary.correctAnswers}:${summary.timeSpentSeconds}`;
    if (savedLessonSummaryKeysRef.current.has(summaryKey)) return;
    savedLessonSummaryKeysRef.current.add(summaryKey);

    try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
      if (!studentId) return;

      const input: TeacherInsightInput = {
        studentId,
        level: year,
        strand: "Number",
        week,
        lessonId: effectiveLessonId,
        title: summary.lessonTitle,
        score: summary.correctAnswers,
        accuracy: summary.accuracy,
        timeSpent: summary.timeSpentSeconds,
        questionsAnswered: summary.questionsAnswered,
        topicSummaries: summary.topicSummaries,
      };

      let insight: TeacherInsight | null = null;
      try {
        const insightResponse = await fetch("/api/teacher-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (insightResponse.ok) {
          const payload = (await insightResponse.json()) as { insight?: TeacherInsight };
          insight = payload.insight ?? null;
        }
      } catch (error) {
        console.warn("[Lesson] Insight generation failed:", error);
      }

      const completedAt = new Date().toISOString();
      const attempt = {
        at: completedAt,
        completedAt,
        completed: true,
        lessonId: effectiveLessonId,
        lessonNumber,
        title: summary.lessonTitle,
        questionsAnswered: summary.questionsAnswered,
        totalQuestions: summary.questionsAnswered,
        correctAnswers: summary.correctAnswers,
        correctCount: summary.correctAnswers,
        accuracy: summary.accuracy,
        accuracyPercent: summary.accuracy,
        bestChain: summary.bestChain,
        timeSpentSeconds: summary.timeSpentSeconds,
        topicSummaries: summary.topicSummaries,
        strengths: summary.strengths,
        areasToImprove: summary.areasToImprove,
        struggledQuestionTypes: summary.struggledQuestionTypes,
        insight,
      };

      await saveNumberLessonAttempt(studentId, year, week, lessonNumber, effectiveLessonId, attempt);

      void recordStudentActivityDelta({
        questionsAnswered: summary.questionsAnswered,
        correctAnswers: summary.correctAnswers,
        lessonsCompleted: 1,
        xpEarned: 40,
      });
    } catch (error) {
      console.warn("[Lesson] Persist summary failed:", error);
      throw error;
    }
  }

  function startPostTest() {
    router.push(`/posttest?year=${encodeURIComponent(year)}`);
  }

  function practiseWeakAreas() {
    router.push(
      `/lesson?year=${encodeURIComponent(year)}&week=${week}&lessonId=y${yearNumber}-w${week}-l3`
    );
  }

  function renderPrepCompletionCard(summary: LessonPerformanceSummary) {
    const prepSuccessTitle =
      effectiveLessonId === "y0-w1-l3"
        ? "You matched number names and numerals!"
        : effectiveLessonId === "y0-w2-l1"
          ? "You found numbers 6 to 10!"
          : effectiveLessonId === "y0-w2-l2"
            ? "You counted groups to 10!"
            : effectiveLessonId === "y0-w2-l3"
              ? "You matched numbers, words, and groups!"
              : effectiveLessonId === "y0-w3-l1"
                ? "Great Counting!"
                : effectiveLessonId === "y0-w3-l2"
                  ? "Blast Off Complete!"
                  : effectiveLessonId === "y0-w3-l3"
                    ? "Number Match Complete!"
                    : effectiveLessonId === "y0-w4-l1"
                      ? "Quick Number Eyes Complete!"
                      : effectiveLessonId === "y0-w4-l2"
                        ? "Quick Group Spotter Complete!"
                        : effectiveLessonId === "y0-w4-l3"
                          ? "Pattern Match Mission Complete!"
                          : effectiveLessonId === "y0-w5-l1"
                            ? "More or Less Mission Complete!"
                            : effectiveLessonId === "y0-w5-l2"
                              ? "Match the Groups Complete!"
                              : effectiveLessonId === "y0-w5-l3"
                                ? "Number Sort Challenge Complete!"
                                : effectiveLessonId === "y0-w7-l2"
                                  ? "Teen Number Mission Complete!"
                                  : effectiveLessonId === "y0-w7-l1"
                                    ? "Collection Counter Mission Complete!"
                                  : effectiveLessonId === "y0-w6-l1"
                                    ? "Number Builder Lab Complete!"
                                  : effectiveLessonId === "y0-w1-l2"
                                    ? "You counted collections to 5!"
                                    : "You recognised numbers 1 to 5!";
    const prepUnlockText =
      effectiveLessonId === "y0-w1-l3" || effectiveLessonId === "y0-w2-l3"
        ? "Weekly Quiz unlocked."
        : effectiveLessonId === "y0-w3-l1"
          ? "Lesson 2 unlocked."
          : effectiveLessonId === "y0-w3-l2"
            ? "Lesson 3 unlocked."
            : effectiveLessonId === "y0-w3-l3" || effectiveLessonId === "y0-w4-l3" || effectiveLessonId === "y0-w5-l3"
              ? "Weekly Quiz unlocked."
              : `Lesson ${lessonNumber + 1} unlocked.`;

    return (
      <div className="rounded-[28px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-6 shadow-[0_12px_30px_rgba(13,148,136,0.08)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-200 to-teal-300 text-3xl shadow-[0_0_20px_rgba(45,212,191,0.25)]">
          ☆
        </div>
        <div className="text-center">
          <div className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-800">
            Numbot Bouncer
          </div>
          <h2 className="mt-3 text-3xl font-black text-slate-900">{prepSuccessTitle}</h2>
          <p className="mt-2 text-lg font-semibold text-teal-800">{prepUnlockText}</p>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">XP Reward</div>
            <div className="mt-1 text-3xl font-black text-amber-900">10 XP</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-cyan-100 bg-white px-3 py-3">
              <div className="text-2xl font-black text-slate-900">{summary.questionsAnswered}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Questions</div>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white px-3 py-3">
              <div className="text-2xl font-black text-slate-900">{summary.correctAnswers}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Correct</div>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white px-3 py-3">
              <div className="text-2xl font-black text-slate-900">{summary.accuracy}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Accuracy</div>
            </div>
          </div>
          <button
            type="button"
            onClick={completeLesson}
            className="mt-6 w-full rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.22)] transition hover:brightness-110"
          >
            Back to Week →
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-6 bg-background">
      <ActiveLearningTracker context="lesson" />
      <div className="w-full max-w-6xl">
        <div className="mb-4">
          <button
            onClick={() =>
              router.push(`/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1${realmId === "measurement" ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`)
            }
            className="text-sm font-mono font-bold uppercase tracking-[0.18em] text-teal-700 hover:text-teal-600 transition-colors"
          >
            ← Back to Week {week}
          </button>
        </div>

        {blockedPreviousLesson ? (
          <div className="rounded-[24px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)] border border-border/40 bg-card">
            <LessonPageHero
              levelNumber={levelNumber}
              levelLabel={levelLabel}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle="Lesson Locked"
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              focus={`Complete Lesson ${blockedPreviousLesson} first to unlock this lesson.`}
              heroClass={lessonChrome.heroClass}
              realmId={realmId}
            />
            <div className="bg-background px-6 py-8">
              <div className="mx-auto max-w-2xl rounded-[28px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-6 shadow-[0_12px_30px_rgba(13,148,136,0.08)]">
                <div className="text-center">
                  <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">
                    Lesson Locked
                  </div>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">
                    Finish Lesson {blockedPreviousLesson} first
                  </h2>
                  <p className="mt-2 text-lg font-semibold text-teal-800">
                    Complete your current lesson to unlock this one.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/lesson?year=${encodeURIComponent(year)}&week=${week}&lessonId=y${yearNumber}-w${week}-l${blockedPreviousLesson}`
                        )
                      }
                      className="rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.22)] transition hover:brightness-110"
                    >
                      Go to Lesson {blockedPreviousLesson}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1${realmId === "measurement" ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`)}
                      className="rounded-[22px] border-2 border-cyan-200 bg-white px-6 py-4 text-lg font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      Back to Week
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !started ? (
          <div className="rounded-[24px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)] border border-border/40 bg-card">
            <LessonPageHero
              levelNumber={levelNumber}
              levelLabel={levelLabel}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              focus={safeLessonFocus ?? "Watch the video and complete activities"}
              heroClass={lessonChrome.heroClass}
              realmId={realmId}
            />

            <div className={`px-4 py-5 md:px-6 md:py-6 ${lt.contentBg}`}>
              {/* ROW 1: 2-column — left mission briefing / right video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                {/* LEFT: Mission briefing */}
                <div
                  className="relative overflow-hidden rounded-[20px] p-5 md:p-6 flex flex-col"
                  style={{
                    background: lt.missionBg ?? "var(--card)",
                    border: `1px solid ${lt.cardBorder.replace("border-", "").replace(/\/\d+$/, "")}`,
                    borderColor: isMeasurement ? "rgba(180,120,20,0.22)" : undefined,
                    boxShadow: lt.cardShadow,
                  }}
                >
                  {/* Corner decoration */}
                  {lt.cornerDecoration === "circuit" ? (
                    <>
                      <svg aria-hidden className="pointer-events-none absolute -top-px -left-px h-16 w-16 text-teal-500/25" viewBox="0 0 64 64" fill="none">
                        <path d="M0 16 H20 L28 24 H48" stroke="currentColor" strokeWidth="1" />
                        <path d="M0 28 H10 L16 34" stroke="currentColor" strokeWidth="1" />
                        <circle cx="48" cy="24" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="34" r="1.5" fill="currentColor" />
                      </svg>
                      <svg aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-20 w-20 text-emerald-500/20" viewBox="0 0 80 80" fill="none">
                        <path d="M80 50 H60 L52 58 H30" stroke="currentColor" strokeWidth="1" />
                        <path d="M80 64 H66 L60 70" stroke="currentColor" strokeWidth="1" />
                        <circle cx="30" cy="58" r="1.5" fill="currentColor" />
                        <circle cx="60" cy="70" r="1.5" fill="currentColor" />
                      </svg>
                      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: "linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }} />
                    </>
                  ) : (
                    /* Measurelands: ruler marks in corners */
                    <>
                      <div aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 flex" style={{ height: 3 }}>
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} style={{ flex: 1, borderRight: i % 5 === 4 ? "1.5px solid rgba(200,160,48,0.35)" : "1px solid rgba(200,160,48,0.15)", height: i % 5 === 4 ? 8 : 4, alignSelf: "flex-start", marginTop: 0 }} />
                        ))}
                      </div>
                      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
                        backgroundImage: "radial-gradient(circle at 80% 80%, rgba(109,40,217,1) 0%, transparent 60%)",
                      }} />
                    </>
                  )}

                  {/* Badge */}
                  <div
                    className="relative inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                    style={isMeasurement ? {
                      background: lt.missionBadgeBg,
                      border: `1px solid ${lt.missionBadgeBorder}`,
                      color: lt.missionBadgeText,
                    } : {
                      background: "linear-gradient(to right, #f0fdfa, #ecfdf5)",
                      border: "1px solid rgba(94,234,212,0.4)",
                      color: "#115e59",
                    }}
                  >
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-white shadow-sm"
                      style={{ background: isMeasurement ? lt.missionBadgeIconBg : "rgba(13,148,136,0.9)" }}
                    >
                      {isMeasurement ? (
                        /* Scroll / compass icon */
                        <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="currentColor">
                          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                          <path d="M8 3v1.5M8 11.5V13M3 8h1.5M11.5 8H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="currentColor"><path d="M8 1l6 3.5v7L8 15 2 11.5v-7L8 1zm0 2.3L4 5.6v4.8l4 2.3 4-2.3V5.6L8 3.3z"/></svg>
                      )}
                    </span>
                    {isMeasurement ? "Mission Journal" : "Mission Briefing"}
                  </div>

                  <div className="relative mt-3 flex items-start gap-2">
                    <h2 className="text-[1.35rem] md:text-2xl font-bold text-foreground leading-[1.15] tracking-[-0.02em]">
                      {safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
                    </h2>
                    <ReadAloudBtn
                      size="md"
                      className="shrink-0 mt-0.5"
                      text={
                        (safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`) +
                        (safeLessonFocus ? `. Focus: ${safeLessonFocus}` : "")
                      }
                    />
                  </div>
                  {safeLessonFocus ? (
                    <p className="relative mt-2 text-sm font-medium text-foreground/80 leading-relaxed">
                      <span className="font-semibold" style={{ color: isMeasurement ? lt.missionFocusLabel : "#115e59" }}>Focus:</span> {safeLessonFocus}
                    </p>
                  ) : null}
                  <p className="relative mt-2.5 text-sm font-normal text-muted-foreground leading-relaxed">
                    {isMeasurement
                      ? (year === "Prep"
                          ? "Watch the example, then set off on 9 minutes of magical measurement practice. Earn XP and unlock Meazurex."
                          : "Watch the lesson, then practise your measurement skills for 9 minutes. Earn XP for every correct answer and unlock your Measurelands Legend.")
                      : (year === "Prep"
                          ? "Meet the Ground Explorer, watch the short example, then jump into 9 minutes of easy number practice."
                          : "Watch the short lesson video, then jump into 9 minutes of practice. Earn XP for every correct answer and unlock your Level Up Legend.")}
                  </p>
                </div>

                {/* RIGHT: Video card */}
                <div
                  className="relative overflow-hidden rounded-[20px] p-3 md:p-4"
                  style={{
                    background: "var(--card)",
                    border: isMeasurement ? "1px solid rgba(109,40,217,0.2)" : "1px solid rgba(94,234,212,0.6) ",
                    borderColor: isMeasurement ? "rgba(109,40,217,0.2)" : undefined,
                    boxShadow: lt.cardShadow,
                  }}
                >
                  {!isMeasurement && (
                    <svg aria-hidden className="pointer-events-none absolute -top-px -right-px h-16 w-16 text-teal-500/25" viewBox="0 0 64 64" fill="none">
                      <path d="M64 16 H44 L36 24 H16" stroke="currentColor" strokeWidth="1" />
                      <path d="M64 28 H54 L48 34" stroke="currentColor" strokeWidth="1" />
                      <circle cx="16" cy="24" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                  <div className="relative flex items-center gap-2 text-foreground font-semibold mb-2.5 px-1 tracking-tight">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white"
                      style={{ background: lt.videoHeaderIconBg, boxShadow: lt.videoHeaderIconShadow }}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                    <span className="text-sm">{isMeasurement ? "Lesson Scroll" : "Lesson Video"}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: lt.videoLiveText }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: lt.videoLiveDot, boxShadow: `0 0 6px ${lt.videoLiveDot}` }} />
                      Live
                    </span>
                  </div>

                  {hasEmbeddedLessonVideo ? (
                    <div className="relative rounded-xl overflow-hidden bg-black shadow-inner" style={{ position: "relative", width: "100%", paddingTop: "56.25%", boxShadow: `inset 0 0 0 1px rgba(109,40,217,0.2)` }}>
                      <iframe src="https://player.vimeo.com/video/1183966051?h=ff99ab69f7" width="100%" height="100%" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="absolute left-0 top-0 h-full w-full" title="Lesson video" />
                    </div>
                  ) : (
                    <div
                      className="relative aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center text-xs gap-2 shadow-inner"
                      style={{ background: lt.videoBg, boxShadow: `inset 0 0 0 1px rgba(139,92,246,0.15)` }}
                    >
                      {/* Grid overlay */}
                      <div aria-hidden className="absolute inset-0 opacity-[0.16]" style={{
                        backgroundImage: `linear-gradient(${lt.videoGridColor} 1px, transparent 1px), linear-gradient(90deg, ${lt.videoGridColor} 1px, transparent 1px)`,
                        backgroundSize: "28px 28px",
                        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                      }} />
                      {/* Corner brackets */}
                      {(["top-2 left-2","top-2 right-2","bottom-2 left-2","bottom-2 right-2"] as const).map((pos, i) => (
                        <svg key={i} aria-hidden className={`absolute ${pos} h-5 w-5 pointer-events-none`} style={{ color: lt.videoCornerColor }} viewBox="0 0 20 20" fill="none">
                          {i === 0 && <path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
                          {i === 1 && <path d="M18 8V2h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
                          {i === 2 && <path d="M2 12v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
                          {i === 3 && <path d="M18 12v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
                        </svg>
                      ))}
                      <span
                        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm"
                        style={{ background: lt.videoPlayBg, border: `1px solid ${lt.videoPlayBorder}`, boxShadow: lt.videoPlayGlow }}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 ml-0.5" style={{ color: lt.videoPlayIcon }} fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      <span className="relative font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: lt.videoText }}>
                        {isMeasurement ? "Coming Soon" : "Video coming soon"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2: Action strip */}
              <div
                className="relative overflow-hidden mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-[20px] px-4 py-3 md:px-5 md:py-3.5"
                style={{
                  background: lt.stripBg ?? "var(--card)",
                  border: `1px solid ${isMeasurement ? "rgba(180,120,20,0.2)" : "rgba(94,234,212,0.6)"}`,
                  boxShadow: lt.cardShadow,
                }}
              >
                {!isMeasurement && (
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-[0.05]" style={{
                    backgroundImage: "linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    maskImage: "linear-gradient(90deg, transparent, black)",
                    WebkitMaskImage: "linear-gradient(90deg, transparent, black)",
                  }} />
                )}

                <div className="relative flex flex-wrap items-center gap-3">
                  {/* TIME widget */}
                  <div className="relative">
                    <div className="absolute -inset-[3px] pointer-events-none" style={{
                      background: lt.timeBezel,
                      clipPath: isMeasurement ? undefined : "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      borderRadius: isMeasurement ? 12 : undefined,
                    }} />
                    <div className="relative inline-flex items-center gap-2.5 pl-2 pr-4 py-2 overflow-hidden"
                      style={{
                        background: lt.timeBg,
                        clipPath: isMeasurement ? undefined : "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                        borderRadius: isMeasurement ? 10 : undefined,
                        boxShadow: lt.timeShadow,
                      }}
                    >
                      {!isMeasurement && <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.15) 0px, rgba(94,234,212,0.15) 1px, transparent 1px, transparent 3px)" }} />}
                      <span className="relative inline-flex h-7 w-7 items-center justify-center" style={{ background: lt.timeIconBg, clipPath: isMeasurement ? undefined : (lt.timeIconShape as string), borderRadius: isMeasurement ? "50%" : undefined, boxShadow: lt.timeIconShadow }}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 drop-shadow-[0_0_3px_rgba(200,160,48,0.8)]" style={{ color: isMeasurement ? "#fde68a" : "#e0f2fe" }} fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="13" r="7" /><path d="M12 9v4l2.5 1.5M9 2h6" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="relative text-[11px] font-mono font-bold uppercase tracking-[0.22em] drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]" style={{ color: lt.timeText }}>8 Min</span>
                    </div>
                  </div>

                  {/* XP widget (same structure, uses lt.xp*) */}
                  <div className="relative">
                    <div className="absolute -inset-[3px] pointer-events-none" style={{
                      background: lt.xpBezel,
                      clipPath: isMeasurement ? undefined : "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      borderRadius: isMeasurement ? 12 : undefined,
                    }} />
                    <div className="relative inline-flex items-center gap-2.5 pl-2 pr-4 py-2 overflow-hidden" style={{ background: lt.xpBg, clipPath: isMeasurement ? undefined : "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)", borderRadius: isMeasurement ? 10 : undefined, boxShadow: lt.xpShadow }}>
                      {!isMeasurement && <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(251,191,36,0.15) 0px, rgba(251,191,36,0.15) 1px, transparent 1px, transparent 3px)" }} />}
                      <div aria-hidden className="absolute left-0 top-0 h-full w-12 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 50%, rgba(251,191,36,0.45), transparent 70%)" }} />
                      <span className="relative inline-flex h-7 w-7 items-center justify-center" style={{ background: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #92400e 70%, #1c1917 100%)", clipPath: isMeasurement ? undefined : "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)", borderRadius: isMeasurement ? "50%" : undefined, boxShadow: "inset 0 0 6px rgba(253,224,71,0.7), 0 0 10px rgba(251,191,36,0.5)" }}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-50 drop-shadow-[0_0_4px_rgba(253,224,71,1)]" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
                      </span>
                      <span className="relative text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-amber-50 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">50 XP</span>
                    </div>
                  </div>

                  {/* LEGEND widget */}
                  <div className="relative">
                    <div className="absolute -inset-[3px] pointer-events-none" style={{
                      background: lt.legendBezel,
                      clipPath: isMeasurement ? undefined : "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      borderRadius: isMeasurement ? 12 : undefined,
                    }} />
                    <div className="relative inline-flex items-center gap-2.5 pl-2 pr-4 py-2 overflow-hidden" style={{ background: lt.legendBg, clipPath: isMeasurement ? undefined : "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)", borderRadius: isMeasurement ? 10 : undefined, boxShadow: lt.legendShadow }}>
                      {!isMeasurement && <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(110,231,183,0.15) 0px, rgba(110,231,183,0.15) 1px, transparent 1px, transparent 3px)" }} />}
                      <span className="relative inline-flex h-7 w-7 items-center justify-center" style={{ background: lt.legendIconBg, clipPath: isMeasurement ? undefined : "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)", borderRadius: isMeasurement ? "50%" : undefined, boxShadow: lt.legendIconShadow }}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 drop-shadow-[0_0_3px_rgba(167,139,250,0.9)]" style={{ color: isMeasurement ? "#e9d5ff" : "#ecfdf5" }} fill="none" stroke="currentColor" strokeWidth="1.8">
                          {isMeasurement ? (
                            /* Hourglass icon for Meazurex */
                            <path d="M6 2h12M6 22h12M8 2c0 4 8 5 8 10s-8 6-8 10M16 2c0 4-8 5-8 10s8 6 8 10" strokeLinecap="round" />
                          ) : (
                            <>
                              <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" strokeLinejoin="round" />
                              <path d="M12 7l5 2.8v5.4L12 18l-5-2.8V9.8L12 7z" strokeLinejoin="round" opacity="0.65" />
                            </>
                          )}
                        </svg>
                      </span>
                      <span className="relative text-[11px] font-mono font-bold uppercase tracking-[0.22em] drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]" style={{ color: lt.legendText }}>
                        {isMeasurement ? "Unlock Meazurex" : "Unlock Legend"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BEGIN PRACTISE button */}
                <div className="relative group">
                  <div
                    className="absolute -inset-[3px] pointer-events-none transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background: lt.btnBezel,
                      clipPath: lt.btnBorderRadius ? undefined : "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                      borderRadius: lt.btnBorderRadius ? lt.btnBorderRadius + 3 : undefined,
                    }}
                  />
                  <button
                    onClick={() => {
                      void trackLiveLearningEvent({ eventType: "lesson_started", level: liveLessonContext.level, strand: liveLessonContext.strand, week: liveLessonContext.week, lessonId: liveLessonContext.lessonId, lessonTitle: liveLessonContext.lessonTitle, progressPercent: 0, progressLabel: "Lesson started" });
                      if (year === "Year 1") resetYear1SessionTaskState();
                      if (isGroundCustomLesson) resetPrepSessionTaskState();
                      setStartedLessonId(effectiveLessonId);
                    }}
                    className="relative inline-flex items-center justify-center gap-2 font-bold tracking-tight px-7 py-3 text-sm md:text-base overflow-hidden hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                    style={{
                      background: lt.btnBg,
                      clipPath: lt.btnBorderRadius ? undefined : "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                      borderRadius: lt.btnBorderRadius ? lt.btnBorderRadius : undefined,
                      boxShadow: lt.btnShadow,
                      color: lt.btnText,
                    }}
                  >
                    {!isMeasurement && (
                      <>
                        <div aria-hidden className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.18) 0px, rgba(94,234,212,0.18) 1px, transparent 1px, transparent 3px)" }} />
                        <svg aria-hidden className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-10 text-teal-300/40 pointer-events-none" viewBox="0 0 40 28" fill="none"><path d="M0 14 H14 L18 10 H32" stroke="currentColor" strokeWidth="0.8" /><path d="M0 20 H10 L14 16 H28" stroke="currentColor" strokeWidth="0.8" /><circle cx="32" cy="10" r="1.2" fill="currentColor" /></svg>
                        <svg aria-hidden className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-10 text-teal-300/40 pointer-events-none" viewBox="0 0 40 28" fill="none"><path d="M40 14 H26 L22 10 H8" stroke="currentColor" strokeWidth="0.8" /><path d="M40 20 H30 L26 16 H12" stroke="currentColor" strokeWidth="0.8" /><circle cx="8" cy="10" r="1.2" fill="currentColor" /></svg>
                        <div aria-hidden className="absolute inset-y-0 left-1/4 right-1/4 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(94,234,212,0.25), transparent 70%)" }} />
                      </>
                    )}
                    {isMeasurement && (
                      /* Subtle gold sweep for Measurelands */
                      <div aria-hidden className="absolute inset-y-0 left-1/4 right-1/4 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(200,160,48,0.18), transparent 70%)" }} />
                    )}
                    <span className="relative font-mono uppercase tracking-[0.18em] drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">Begin Practise</span>
                    <span className="relative inline-flex h-5 w-5 items-center justify-center drop-shadow-[0_0_4px_rgba(200,160,48,0.7)]">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : year === "Year 1" || isGroundCustomLesson ? (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <LessonPageHero
                    levelNumber={levelNumber}
                    levelLabel={levelLabel}
                    week={week}
                    lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle}
              focus={safeLessonFocus}
              heroClass={lessonChrome.heroClass}
              realmId={realmId}
            />
            <div className="bg-background px-6 py-8">
            <PracticeRunner
              key={`${year}-${week}-${effectiveLessonId}`}
              minutes={9}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              completionMode={year === "Year 1" || isGroundCustomLesson ? "time_only" : "question_or_time"}
              scoreCap={10}
              liveContext={liveLessonContext}
              realmId={realmId}
              levelNumber={levelNumber}
              renderCompletionCard={
                isMeasurement
                  ? undefined // Measurelands uses the realm-aware Meazurex reflection screen
                  : isGroundCustomLesson
                  ? renderPrepCompletionCard
                  : showWeek12Lesson3Summary
                  ? (summary: LessonPerformanceSummary) => (
                      <PerformanceSummaryCard
                        summary={summary}
                        onStartPostTest={startPostTest}
                        onPractiseWeakAreas={practiseWeakAreas}
                      />
                    )
                  : undefined
              }
              getTask={(ctx) => {
                const d = ctx?.difficulty ?? "easy";
                if (isGroundCustomLesson) {
                  return getPrepGroundTask(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w2-")) {
                  return generateWeek2Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w3-")) {
                  return generateWeek3Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w4-")) {
                  return generateWeek4Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w5-")) {
                  return generateWeek5Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w6-")) {
                  return generateWeek6Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w7-")) {
                  return generateWeek7Task(effectiveLessonId, ctx, d);
                }
                if (effectiveLessonId.startsWith("y1-w8-")) {
                  return generateWeek8Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w9-")) {
                  return generateWeek9Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w10-")) {
                  return generateWeek10Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w11-")) {
                  return generateWeek11Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w12-")) {
                  return generateWeek12Task(effectiveLessonId, d);
                }
                if (effectiveLessonId.startsWith("y1-w1-")) {
                  return generateWeek1Task(effectiveLessonId, d);
                }
                return generateWeek1Task(effectiveLessonId, d);
              }}
              onComplete={completeLesson}
              onPerformanceSummary={persistLessonPerformanceSummary}
            />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <LessonPageHero
              levelNumber={levelNumber}
              levelLabel={levelLabel}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle}
              focus={safeLessonFocus}
              heroClass={lessonChrome.heroClass}
              realmId={realmId}
            />

            <div className="bg-background px-4 py-5">
              {lessonMeta?.activities?.length ? (
                <Year2LessonEngine
                  key={lessonMeta.id}
                  lesson={lessonMeta}
                  onTimedComplete={completeLesson}
                  onExit={goBackToProgram}
                  liveContext={liveLessonContext}
                  realmId={realmId}
                  levelNumber={levelNumber}
                  renderCompletionCard={
                    showWeek12Lesson3Summary
                      ? (summary: LessonPerformanceSummary) => (
                          <PerformanceSummaryCard
                            summary={summary}
                            onStartPostTest={startPostTest}
                            onPractiseWeakAreas={practiseWeakAreas}
                          />
                        )
                      : undefined
                  }
                  onPerformanceSummary={persistLessonPerformanceSummary}
                />
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-bold text-gray-900">
                    Activity configuration missing for this lesson.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
  function resetYear1SessionTaskState() {
    resetWeek1TaskSessionState();
    resetWeek2TaskSessionState();
    resetWeek3TaskSessionState();
    resetWeek4TaskSessionState();
  }

  function resetPrepSessionTaskState() {
    resetPrepWeek1TaskSessionState();
    resetPrepWeek2TaskSessionState();
    resetPrepWeek3TaskSessionState();
    resetPrepWeek4TaskSessionState();
    resetPrepWeek5TaskSessionState();
    resetPrepWeek6TaskSessionState();
    resetPrepWeek8TaskSessionState();
    resetPrepWeek9TaskSessionState();
    resetPrepWeek10TaskSessionState();
    resetPrepWeek11TaskSessionState();
    resetPrepWeek12TaskSessionState();
    resetPrepWeek7TaskSessionState();
    resetPrepMeasurelandsWeek1TaskSessionState();
    resetPrepMeasurelandsWeek1Lesson2TaskSessionState();
  }
