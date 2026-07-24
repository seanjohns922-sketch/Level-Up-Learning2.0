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
  getPrepMeasurelandsLessonMeta,
  getPrepMeasurelandsPractisedSkills,
  isPrepMeasurelandsLessonId,
  resetPrepMeasurelandsLessonSessionState,
  resolvePrepMeasurelandsLessonTask,
} from "@/data/activities/prepMeasurelands/registry";
import {
  getY1MeasurelandsLessonMeta,
  getY1MeasurelandsPractisedSkills,
  resetY1MeasurelandsLessonSessionState,
  resolveY1MeasurelandsLessonTask,
} from "@/data/activities/year1Measurelands/registry";
import {
  getY2MeasurelandsLessonMeta,
  getY2MeasurelandsPractisedSkills,
  isY2MeasurelandsLessonId,
  resetY2MeasurelandsLessonSessionState,
  resolveY2MeasurelandsLessonTask,
} from "@/data/activities/year2Measurelands/registry";
import {
  getY3MeasurelandsLessonMeta,
  getY3MeasurelandsPractisedSkills,
  isY3MeasurelandsLessonId,
  resetY3MeasurelandsLessonSessionState,
  resolveY3MeasurelandsLessonTask,
} from "@/data/activities/year3Measurelands/registry";
import {
  getY4MeasurelandsLessonMeta,
  getY4MeasurelandsPractisedSkills,
  isY4MeasurelandsLessonId,
  isY4MeasurelandsPlaceholderLesson,
  resetY4MeasurelandsLessonSessionState,
  resolveY4MeasurelandsLessonTask,
} from "@/data/activities/year4Measurelands/registry";
import {
  getY5MeasurelandsLessonMeta,
  getY5MeasurelandsPractisedSkills,
  isY5MeasurelandsLessonId,
  isY5MeasurelandsPlaceholderLesson,
  resetY5MeasurelandsLessonSessionState,
  resolveY5MeasurelandsLessonTask,
} from "@/data/activities/year5Measurelands/registry";
import {
  getY6MeasurelandsLessonMeta,
  getY6MeasurelandsPractisedSkills,
  isY6MeasurelandsLessonId,
  isY6MeasurelandsPlaceholderLesson,
  resetY6MeasurelandsLessonSessionState,
  resolveY6MeasurelandsLessonTask,
} from "@/data/activities/year6Measurelands/registry";
import { getProgramForYear } from "@/data/programs";
import { getCurriculumPlan } from "@/data/programs/genres";
import { DEMO_MODE } from "@/data/config";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress, updateProgress } from "@/data/progress";
import { resolveBrainBreakFrequency, type BrainBreakFrequency } from "@/lib/brain-break-settings";
import { trackLiveLearningEvent } from "@/lib/live-class-client";
import { RealmLessonHome } from "@/components/lesson/RealmLessonHome";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";
import { markLessonComplete } from "@/lib/program-progress";
import { getRecommendedAssignedWeek, isWeekPlayable, readProgramStore, getWeekProgress } from "@/lib/program-progress";
import { getLessonChrome } from "@/lib/levelTheme";
import { LessonPageHero } from "@/components/lesson/LessonPageHero";
import { ActiveLearningTracker } from "@/components/student/ActiveLearningTracker";
import { supabase } from "@/lib/supabase";
import type { TeacherInsight, TeacherInsightInput } from "@/lib/teacher-insights";
import { restoreStudentStateFromServer, saveRealmLessonAttempt } from "@/lib/student-progress-sync";
import { buildLessonRoute, normalizeStudentYearLabel } from "@/lib/lesson-routing";
import {
  buildLessonCompletionActivityKey,
  clearLessonResume,
  clearLessonSession,
  getOrCreateLessonSessionId,
} from "@/lib/resume-state";

export default function LessonPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><LessonPage /></Suspense>;
}

function isPrepGroundCustomLesson(lessonId: string, realmId: string) {
  if (realmId === "measurement") {
    return isPrepMeasurelandsLessonId(lessonId);
  }
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
    lessonId === "y0-w12-l3"
  );
}

function buildMissingMeasurelandsLessonTask(lessonId: string) {
  return {
    kind: "measurementCompare" as const,
    scene: "intro" as const,
    prompt: "This Measurelands lesson is not ready yet.",
    speakText: "This Measurelands lesson is not ready yet. Please go back to the week page.",
    badgeLabel: "Measurelands",
    introIcon: "🧭",
    introBody: [
      `Lesson id: ${lessonId}`,
      "Please go back to the week page.",
      "This lesson should not fall back to Number Nexus.",
    ],
    objects: [],
    correctOptionId: "continue",
    feedback: { correct: "Back to week.", wrong: "Back to week." },
  };
}

function getPrepGroundTask(
  lessonId: string,
  difficulty: "easy" | "medium" | "hard",
  realmId: string,
) {
  if (realmId === "measurement") {
    const measurelandsTask = resolvePrepMeasurelandsLessonTask(lessonId, difficulty);
    return measurelandsTask ?? buildMissingMeasurelandsLessonTask(lessonId);
  }

  if (lessonId.startsWith("y0-w12-")) return generatePrepWeek12Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w11-")) return generatePrepWeek11Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w10-")) return generatePrepWeek10Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w9-")) return generatePrepWeek9Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w8-")) return generatePrepWeek8Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w7-")) return generatePrepWeek7Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w6-")) return generatePrepWeek6Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w5-")) return generatePrepWeek5Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w4-")) return generatePrepWeek4Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w3-")) return generatePrepWeek3Task(lessonId, difficulty);
  if (lessonId.startsWith("y0-w2-")) return generatePrepWeek2Task(lessonId, difficulty);
  return generatePrepWeek1Task(lessonId, difficulty);
}

// Optional per-lesson reflection bullets ("Today you practised: ...").
// Lessons not listed here fall back to the single "Today you practised <title>" line.
function getLessonPractisedSkills(lessonId: string): string[] | undefined {
  return (
    getPrepMeasurelandsPractisedSkills(lessonId) ??
    getY1MeasurelandsPractisedSkills(lessonId) ??
    getY2MeasurelandsPractisedSkills(lessonId) ??
    getY3MeasurelandsPractisedSkills(lessonId) ??
    getY4MeasurelandsPractisedSkills(lessonId) ??
    getY5MeasurelandsPractisedSkills(lessonId) ??
    getY6MeasurelandsPractisedSkills(lessonId)
  );
}

function LessonPage() {
  const router = useRouter();
  const params = useSearchParams();

  const year = normalizeStudentYearLabel(params.get("year") ?? "Year 1");
  const realmId = params.get("realm_id") ?? "number";
  if (realmId !== "number" && realmId !== "measurement") {
    throw new Error(`Unsupported shared lesson realm: ${realmId}`);
  }
  const week = Number(params.get("week") ?? "1");
  const yearNumber = year === "Prep" ? 0 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelNumber = year === "Prep" ? 1 : yearNumber;
  const levelLabel = year === "Prep" ? "Ground Level" : `Level ${levelNumber}`;
  const defaultLessonId =
    realmId === "measurement"
      ? `y${yearNumber}-measurement-w${week}-l1`
      : `y${yearNumber}-w${week}-l1`;
  const lessonId = params.get("lessonId") ?? defaultLessonId;
  const expectedPrefix =
    realmId === "measurement"
      ? `y${yearNumber}-measurement-w${week}-`
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
  const mapRoute = realmId === "measurement"
    ? `/measurelands?level=${encodeURIComponent(year)}`
    : "/number-nexus";
  const isMeasurement = realmId === "measurement";
  const lessonRealmId = isMeasurement ? "measurement" : "number";
  const lessonStrand = isMeasurement ? "Measurement" : "Number";
  const lessonCompletionActivityKey = buildLessonCompletionActivityKey({
    realmId: lessonRealmId,
    workingLevel: year,
    week,
    lessonNumber,
    lessonId: effectiveLessonId,
  });
  const [canonicalStatus, setCanonicalStatus] = useState<"loading" | "ready" | "error">(
    previewMode || DEMO_MODE ? "ready" : "loading",
  );

  const lessonProgram = useMemo(
    () => (realmId === "measurement" ? getCurriculumPlan(year, "measurement") : getProgramForYear(year)),
    [realmId, year]
  );

  // "What's next" after this lesson: next lesson → weekly quiz → post-test.
  const nextUpLabel = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weeks = (lessonProgram as any) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weekPlan = Array.isArray(weeks) ? weeks.find((w: any) => w?.week === week) : null;
    const lessons = weekPlan?.lessons ?? [];
    if (lessonNumber < 3) {
      const next = lessons[lessonNumber];
      const title = next?.displayTitle ?? next?.title;
      return title ? `Lesson ${lessonNumber + 1}: ${title}` : `Lesson ${lessonNumber + 1}`;
    }
    const lastWeek = Array.isArray(weeks) && weeks.length ? weeks.length : 12;
    return week >= lastWeek ? "the Post-Test" : "this week's Quiz";
  }, [lessonProgram, week, lessonNumber]);

  const [startedLessonId, setStartedLessonId] = useState<string | null>(null);

  // Teacher-set brain-break frequency (per-student override → class default →
  // "normal"). Fetched fresh each lesson so teacher changes apply next session.
  const [brainBreakFrequency, setBrainBreakFrequency] = useState<BrainBreakFrequency>("normal");
  useEffect(() => {
    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_student_runtime_context_secure", { p_student_id: studentId });
        if (error || cancelled) return;
        const row = Array.isArray(data) ? data[0] : null;
        if (!row) return;
        setBrainBreakFrequency(
          resolveBrainBreakFrequency(row.brain_break_frequency, row.class_brain_break_frequency)
        );
      } catch {
        /* keep default "normal" */
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const lessonMeta = useMemo(() => {
    const weekPlan = lessonProgram.find((w) => w.week === week);
    return weekPlan?.lessons.find((l) => l.id === effectiveLessonId) ?? null;
  }, [effectiveLessonId, lessonProgram, week]);
  const measurelandsMeta = useMemo(
    () =>
      realmId === "measurement"
        ? getPrepMeasurelandsLessonMeta(effectiveLessonId) ??
          getY1MeasurelandsLessonMeta(effectiveLessonId) ??
          getY2MeasurelandsLessonMeta(effectiveLessonId) ??
          getY3MeasurelandsLessonMeta(effectiveLessonId) ??
          getY4MeasurelandsLessonMeta(effectiveLessonId) ??
          getY5MeasurelandsLessonMeta(effectiveLessonId) ??
          getY6MeasurelandsLessonMeta(effectiveLessonId)
        : null,
    [effectiveLessonId, realmId]
  );
  const started = startedLessonId === effectiveLessonId;
  const safeLessonTitle = lessonMeta?.displayTitle ?? lessonMeta?.title ?? null;
  const safeLessonFocus = lessonMeta?.focus ?? null;
  // Number Nexus only — the embedded lesson video is not part of Measurelands.
  const hasEmbeddedLessonVideo =
    realmId !== "measurement" && year === "Year 4" && week === 2 && lessonNumber === 1;
  const isGroundCustomLesson =
    year === "Prep" && isPrepGroundCustomLesson(effectiveLessonId, realmId);
  const isYear2Measurelands =
    realmId === "measurement" &&
    year === "Year 2" &&
    isY2MeasurelandsLessonId(effectiveLessonId);
  const isYear3Measurelands =
    realmId === "measurement" &&
    year === "Year 3" &&
    isY3MeasurelandsLessonId(effectiveLessonId);
  const isYear4Measurelands =
    realmId === "measurement" &&
    year === "Year 4" &&
    isY4MeasurelandsLessonId(effectiveLessonId);
  const isYear5Measurelands =
    realmId === "measurement" &&
    year === "Year 5" &&
    isY5MeasurelandsLessonId(effectiveLessonId);
  const isYear6Measurelands =
    realmId === "measurement" &&
    year === "Year 6" &&
    isY6MeasurelandsLessonId(effectiveLessonId);
  const invalidMeasurelandsLesson =
    (year === "Prep" || year === "Year 2" || year === "Year 3" || year === "Year 4" || year === "Year 5" || year === "Year 6") &&
    realmId === "measurement" &&
    !measurelandsMeta;
  // Unbuilt scaffold lessons (e.g. Level 4 placeholders) render a "Coming Soon"
  // screen and are never runnable — no XP, save, completion, unlocks, teacher
  // data or quiz progression until a real generator replaces the placeholder.
  const isPlaceholderMeasurelandsLesson =
    realmId === "measurement" &&
    (isY4MeasurelandsPlaceholderLesson(effectiveLessonId) ||
      isY5MeasurelandsPlaceholderLesson(effectiveLessonId) ||
      isY6MeasurelandsPlaceholderLesson(effectiveLessonId));

  useEffect(() => {
    if (previewMode || DEMO_MODE) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      Promise.resolve().then(() => setCanonicalStatus("error"));
      return;
    }
    let cancelled = false;
    void restoreStudentStateFromServer(studentId, lessonRealmId)
      .then(() => {
        if (!cancelled) setCanonicalStatus("ready");
      })
      .catch((error) => {
        console.error("[Lesson] Canonical progression bootstrap failed", error);
        if (!cancelled) setCanonicalStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [lessonRealmId, previewMode]);

  useEffect(() => {
    if (canonicalStatus !== "ready") return;
    const p = readProgress(lessonRealmId);
    if (!previewMode && !isPlacementComplete(p)) {
      router.replace(`/home`);
      return;
    }
    if (!DEMO_MODE && !previewMode && p?.year && p.year !== year) {
      router.replace(mapRoute);
    }
  }, [canonicalStatus, lessonRealmId, mapRoute, previewMode, router, year]);

  useEffect(() => {
    if (canonicalStatus !== "ready" || !previewMode) return;
    const p = readProgress(lessonRealmId);
    if (!p || p.status !== "ASSIGNED_PROGRAM") return;
    if (p.requiredWeeks?.length) return;
    const nextWeek = Math.max(p.assignedWeek ?? 1, week);
    if (nextWeek !== p.assignedWeek) updateProgress({ assignedWeek: nextWeek }, lessonRealmId);
  }, [canonicalStatus, lessonRealmId, previewMode, week]);

  useEffect(() => {
    if (canonicalStatus !== "ready") return;
    const p = readProgress(lessonRealmId);
    if (previewMode || !p || p.status !== "ASSIGNED_PROGRAM" || p.year !== year) return;

    const store = readProgramStore();
    const weekPlayable = isWeekPlayable(
      store,
      year,
      week,
      p.requiredWeeks,
      p.optionalWeeks,
      lessonRealmId,
      p.teacherAdvancedWeeks,
      p.assignedWeek,
    );
    if (!weekPlayable) {
      router.replace(mapRoute);
      return;
    }

    const weekProgress = getWeekProgress(store, year, week, lessonRealmId);
    if (lessonNumber > 1 && !weekProgress.lessonsCompleted[lessonNumber - 2]) {
      return;
    }
  }, [canonicalStatus, lessonNumber, lessonRealmId, mapRoute, previewMode, router, week, year]);

  const blockedPreviousLesson = useMemo(() => {
    if (DEMO_MODE || previewMode) return null;
    const p = readProgress(lessonRealmId);
    if (!p || p.status !== "ASSIGNED_PROGRAM" || p.year !== year) return null;
    const store = readProgramStore();
    if (!isWeekPlayable(
      store,
      year,
      week,
      p.requiredWeeks,
      p.optionalWeeks,
      lessonRealmId,
      p.teacherAdvancedWeeks,
      p.assignedWeek,
    )) return null;
    const weekProgress = getWeekProgress(store, year, week, lessonRealmId);
    if (lessonNumber > 1 && !weekProgress.lessonsCompleted[lessonNumber - 2]) {
      return lessonNumber - 1;
    }
    return null;
  }, [lessonNumber, lessonRealmId, previewMode, week, year]);

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

    const progress = readProgress(lessonRealmId);
    let nextAssignedWeek = progress?.assignedWeek;

    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
    if (!studentId && !previewMode) {
      lessonFinalizedRef.current = false;
      window.alert("Your student session has expired. Please log in again.");
      return;
    }
    if (studentId) {
      try {
        if (latestLessonSummaryRef.current) {
          await persistLessonPerformanceSummary(latestLessonSummaryRef.current);
        } else {
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

          await saveRealmLessonAttempt(
            studentId, year, week, lessonNumber, effectiveLessonId, fallbackAttempt,
            getOrCreateLessonSessionId(lessonCompletionActivityKey), lessonRealmId
          );
        }

        if (previewMode) {
          markLessonComplete(year, week, lessonNumber, lessonRealmId);
        } else {
          await restoreStudentStateFromServer(studentId, lessonRealmId);
        }
        if (previewMode && progress?.status === "ASSIGNED_PROGRAM" && progress.requiredWeeks?.length) {
          nextAssignedWeek = getRecommendedAssignedWeek(
            readProgramStore(), year, progress.assignedWeek, progress.requiredWeeks, lessonRealmId, progress.teacherAdvancedWeeks
          );
        }
        if (previewMode && nextAssignedWeek !== progress?.assignedWeek) {
          updateProgress({ assignedWeek: nextAssignedWeek }, lessonRealmId);
        }
        const completedSummary = latestLessonSummaryRef.current;
        void trackLiveLearningEvent({
          eventType: "lesson_completed",
          level: liveLessonContext.level,
          strand: liveLessonContext.strand,
          week: liveLessonContext.week,
          lessonId: liveLessonContext.lessonId,
          lessonTitle: liveLessonContext.lessonTitle,
          progressPercent: 100,
          progressLabel: completedSummary
            ? `Completed ${completedSummary.questionsAnswered} questions`
            : "Lesson completed",
          questionsAnswered: completedSummary?.questionsAnswered ?? 0,
          totalQuestions: completedSummary?.questionsAnswered ?? 0,
          correctCount: completedSummary?.correctAnswers ?? 0,
          correctAnswers: completedSummary?.correctAnswers ?? 0,
          accuracyPercent: completedSummary?.accuracy ?? 0,
        });
        clearLessonResume(effectiveLessonId);
        clearLessonSession(lessonCompletionActivityKey);
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
    strand: lessonStrand,
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
        strand: lessonStrand,
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

      await saveRealmLessonAttempt(
        studentId, year, week, lessonNumber, effectiveLessonId, attempt,
        getOrCreateLessonSessionId(lessonCompletionActivityKey), lessonRealmId
      );
    } catch (error) {
      savedLessonSummaryKeysRef.current.delete(summaryKey);
      console.warn("[Lesson] Persist summary failed:", error);
      throw error;
    }
  }

  function captureLessonPerformanceSummary(summary: LessonPerformanceSummary) {
    latestLessonSummaryRef.current = summary;
  }

  function startPostTest() {
    // Preserve the realm so a Measurelands student never lands on the Number
    // post-test (the resolver defaults to Number when realm_id is absent).
    router.push(`/posttest?year=${encodeURIComponent(year)}${realmId === "measurement" ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`);
  }

  function practiseWeakAreas() {
    router.push(
      buildLessonRoute({
        yearLabel: year,
        week,
        lessonNumber: 3,
        realmId,
      })
    );
  }

  function renderPrepCompletionCard(summary: LessonPerformanceSummary) {
    const prepSuccessTitle =
      measurelandsMeta?.completionTitle
        ? measurelandsMeta.completionTitle
        : effectiveLessonId === "y0-w1-l3"
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
      measurelandsMeta?.unlockMessage
        ? measurelandsMeta.unlockMessage
        : effectiveLessonId === "y0-w1-l3" || effectiveLessonId === "y0-w2-l3"
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

  if (canonicalStatus === "loading") {
    return <main className="min-h-screen grid place-items-center bg-background font-semibold text-slate-600">Loading saved progress...</main>;
  }
  if (canonicalStatus === "error") {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-900">Saved progress could not be loaded</h1>
          <p className="mt-2 text-slate-600">Return to the Tower and try entering the lesson again.</p>
          <button type="button" onClick={() => router.push("/home")} className="mt-5 rounded-md bg-teal-700 px-5 py-3 font-bold text-white">
            Return to Tower
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen flex items-start justify-center px-3 py-3 sm:px-5 sm:py-5 ${started ? "bg-transparent" : "bg-background"}`}>
      <ActiveLearningTracker context="lesson" />
      <div className={`w-full ${started ? "max-w-[1500px]" : "max-w-6xl"}`}>
        {blockedPreviousLesson || invalidMeasurelandsLesson || isPlaceholderMeasurelandsLesson ? (
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
        ) : null}

        {blockedPreviousLesson ? (
          <div className="rounded-[24px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)] border border-border/40 bg-card">
            <LessonPageHero
              levelNumber={levelNumber}
              levelLabel={levelLabel}
              year={year}
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
                          buildLessonRoute({
                            yearLabel: year,
                            week,
                            lessonNumber: blockedPreviousLesson,
                            realmId,
                          })
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
        ) : invalidMeasurelandsLesson ? (
          <div className="rounded-[24px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)] border border-border/40 bg-card">
            <LessonPageHero
              levelNumber={levelNumber}
              levelLabel={levelLabel}
              year={year}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber} Practise`}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              focus="This Measurelands lesson is missing from the registry."
              heroClass={lessonChrome.heroClass}
              realmId={realmId}
            />
            <div className="bg-background px-6 py-8">
              <div className="mx-auto max-w-2xl rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-[0_12px_30px_rgba(180,120,20,0.12)]">
                <div className="text-center">
                  <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">
                    Measurelands Registry Error
                  </div>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">
                    This lesson is not registered yet
                  </h2>
                  <p className="mt-2 text-base text-slate-700">
                    Lesson id: <span className="font-mono">{effectiveLessonId}</span>
                  </p>
                  <p className="mt-2 text-lg font-semibold text-amber-900">
                    Measurelands lessons will not fall back to Number Nexus content.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1&realm_id=${encodeURIComponent(realmId)}`)
                    }
                    className="mt-6 w-full rounded-[22px] bg-gradient-to-r from-amber-700 to-orange-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_24px_rgba(180,120,20,0.22)] transition hover:brightness-110"
                  >
                    Back to Week →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : isPlaceholderMeasurelandsLesson ? (
          <div className="rounded-[24px] overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)] border border-border/40 bg-card">
            <LessonPageHero
              levelNumber={levelNumber}
              levelLabel={levelLabel}
              year={year}
              week={week}
              lessonNumber={lessonNumber}
              pageTitle={`Lesson ${lessonNumber}`}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              focus={`This ${levelLabel} Measurelands lesson is still being built.`}
              heroClass={lessonChrome.heroClass}
              realmId={realmId}
            />
            <div className="bg-background px-6 py-8">
              <div className="mx-auto max-w-2xl rounded-[28px] border border-amber-200 bg-amber-50 p-8 shadow-[0_12px_30px_rgba(180,120,20,0.12)]">
                <div className="text-center">
                  <div className="text-6xl">🚧</div>
                  <div className="mt-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">
                    Coming Soon
                  </div>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">
                    This lesson is still being built
                  </h2>
                  <p className="mt-2 text-base text-slate-700">
                    {levelLabel} Measurelands is on its way. There’s nothing to complete here
                    yet — no progress is recorded.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1&realm_id=${encodeURIComponent(realmId)}`)
                    }
                    className="mt-6 w-full rounded-[22px] bg-gradient-to-r from-amber-700 to-orange-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_24px_rgba(180,120,20,0.22)] transition hover:brightness-110"
                  >
                    Back to Program →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : !started ? (
          <RealmLessonHome
            realm={lessonRealmId}
            levelNumber={levelNumber}
            levelLabel={levelLabel}
            year={year}
            week={week}
            lessonNumber={lessonNumber}
            lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
            focus={safeLessonFocus ?? "practise today’s lesson skill"}
            successCriteria={lessonMeta?.activityIdeas ?? getLessonPractisedSkills(effectiveLessonId) ?? []}
            embeddedVideoSrc={
              hasEmbeddedLessonVideo
                ? "https://player.vimeo.com/video/1183966051?h=ff99ab69f7"
                : undefined
            }
            onBack={() =>
              router.push(
                `/program?year=${encodeURIComponent(year)}&week=${week}&legacy=1${realmId === "measurement" ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`
              )
            }
            onStart={() => {
              void trackLiveLearningEvent({
                eventType: "lesson_started",
                level: liveLessonContext.level,
                strand: liveLessonContext.strand,
                week: liveLessonContext.week,
                lessonId: liveLessonContext.lessonId,
                lessonTitle: liveLessonContext.lessonTitle,
                progressPercent: 0,
                progressLabel: "Lesson started",
              });
              if (year === "Year 1") resetYear1SessionTaskState();
              if (isGroundCustomLesson) resetPrepSessionTaskState();
              if (realmId === "measurement") {
                resetY1MeasurelandsLessonSessionState();
                resetY2MeasurelandsLessonSessionState();
                resetY3MeasurelandsLessonSessionState();
                resetY4MeasurelandsLessonSessionState();
                resetY5MeasurelandsLessonSessionState();
                resetY6MeasurelandsLessonSessionState();
                resetPrepMeasurelandsLessonSessionState();
              }
              setStartedLessonId(effectiveLessonId);
            }}
          />
        ) : year === "Year 1" || isGroundCustomLesson || isYear2Measurelands || isYear3Measurelands || isYear4Measurelands || isYear5Measurelands || isYear6Measurelands ? (
          <RealmActiveLessonShell
            realm={lessonRealmId}
            levelNumber={levelNumber}
            levelLabel={levelLabel}
            year={year}
            week={week}
            lessonNumber={lessonNumber}
            lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
            focus={safeLessonFocus}
            demoMode={previewMode || DEMO_MODE}
            onBack={goBackToProgram}
          >
            <PracticeRunner
              key={`${year}-${week}-${effectiveLessonId}`}
              minutes={9}
              lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
              completionMode={year === "Year 1" || isGroundCustomLesson || isYear2Measurelands || isYear3Measurelands || isYear4Measurelands || isYear5Measurelands || isYear6Measurelands ? "time_only" : "question_or_time"}
              scoreCap={10}
              liveContext={liveLessonContext}
              realmId={realmId}
              levelNumber={levelNumber}
              practisedSkills={getLessonPractisedSkills(effectiveLessonId)}
              nextUpLabel={nextUpLabel}
              brainBreakFrequency={brainBreakFrequency}
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
                  return getPrepGroundTask(effectiveLessonId, d, realmId);
                }
                if (realmId === "measurement") {
                  return (
                    resolveY6MeasurelandsLessonTask(effectiveLessonId, d) ??
                    resolveY5MeasurelandsLessonTask(effectiveLessonId, d) ??
                    resolveY4MeasurelandsLessonTask(effectiveLessonId, d) ??
                    resolveY3MeasurelandsLessonTask(effectiveLessonId, d) ??
                    resolveY2MeasurelandsLessonTask(effectiveLessonId, d) ??
                    resolveY1MeasurelandsLessonTask(effectiveLessonId, d) ??
                    resolvePrepMeasurelandsLessonTask(effectiveLessonId, d) ??
                    buildMissingMeasurelandsLessonTask(effectiveLessonId)
                  );
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
              onPerformanceSummary={captureLessonPerformanceSummary}
            />
          </RealmActiveLessonShell>
        ) : (
          <RealmActiveLessonShell
            realm={lessonRealmId}
            levelNumber={levelNumber}
            levelLabel={levelLabel}
            year={year}
            week={week}
            lessonNumber={lessonNumber}
            lessonTitle={safeLessonTitle ?? `Week ${week} Lesson ${lessonNumber}`}
            focus={safeLessonFocus}
            demoMode={previewMode || DEMO_MODE}
            onBack={goBackToProgram}
          >
              {lessonMeta?.activities?.length ? (
                <Year2LessonEngine
                  key={lessonMeta.id}
                  lesson={lessonMeta}
                  onTimedComplete={completeLesson}
                  onExit={goBackToProgram}
                  liveContext={liveLessonContext}
                  sessionScopeKey={lessonCompletionActivityKey}
                  realmId={realmId}
                  levelNumber={levelNumber}
                  practisedSkills={getLessonPractisedSkills(lessonMeta.id)}
                  nextUpLabel={nextUpLabel}
                  brainBreakFrequency={brainBreakFrequency}
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
                  onPerformanceSummary={captureLessonPerformanceSummary}
                />
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-bold text-gray-900">
                    Activity configuration missing for this lesson.
                  </div>
                  </div>
              )}
          </RealmActiveLessonShell>
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
    resetPrepMeasurelandsLessonSessionState();
  }
