"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PracticeTask, Difficulty } from "@/data/activities/year1/practice-task";
import { getDifficultyFromTime } from "@/data/activities/year1/practice-task";
import { TaskRenderer } from "@/components/TaskRenderer";
import { clearIdleLiveEventTimer, scheduleIdleLiveEvent, trackLiveLearningEvent } from "@/lib/live-class-client";
import { speak, useAutoReadSetting, useSpeechInteractionReady } from "@/lib/speak";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { LessonHUDRail } from "@/components/lesson/LessonHUDRail";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import LessonReflection from "@/components/lesson/LessonReflection";
import LessonResumeGate from "@/components/lesson/LessonResumeGate";
import {
  clearLessonResume,
  loadLessonResume,
  lessonResumeHasProgress,
  saveLessonResume,
} from "@/lib/resume-state";
import SurgeAmbience from "@/components/lesson/SurgeAmbience";
import NexusActivation from "@/components/lesson/NexusActivation";
import ComboActivation from "@/components/lesson/ComboActivation";
import BrainBreak from "@/components/lesson/BrainBreak";
import { pickVillain, BRAIN_BREAK_1_AT_SECONDS_LEFT, BRAIN_BREAK_2_AT_SECONDS_LEFT, type Villain } from "@/lib/brain-break";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";

type McqTask = Extract<PracticeTask, { kind: "mcq" }>;
type CountTask = Extract<PracticeTask, { kind: "count" }>;
type OrderTask = Extract<PracticeTask, { kind: "order3" }>;
type AudioPickTask = Extract<PracticeTask, { kind: "audioPick" }>;
type NumberHuntTask = Extract<PracticeTask, { kind: "numberHunt" }>;
type GroupCountVisualTask = Extract<PracticeTask, { kind: "groupCountVisual" }>;

type Scalar = string | number | boolean | null;

const MAX_LESSON_QUESTIONS = 10;
const RECENT_TASK_WINDOW = 6;
const NEXT_TASK_REROLLS = 8;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPracticeTopicLabel(kind: PracticeTask["kind"]) {
  if (kind === "measurementCompare") return "Length Explorer";
  if (kind === "groundMatch") return "Ground Match";
  if (kind === "groundCollect") return "Ground Collect";
  if (kind === "groundBuild") return "Ground Build";
  if (kind === "groundFlash") return "Ground Flash";
  if (kind === "groundGrowingCount") return "Rocket Count";
  if (kind === "groundHunt") return "Number Hunt";
  if (kind === "groundOrderTap") return "Number Path";
  if (kind === "groundSequence") return "Missing Number";
  if (kind === "groundTapCount") return "Tap Count";
  if (kind === "groundMoveCount") return "Move To Count";
  if (kind === "groundFeed") return "Feed Numbot";
  if (kind === "groundSoundCount") return "Sound Count";
  if (kind === "mcq") return "Multiple Choice";
  if (kind === "count") return "Number Input";
  if (kind === "order3") return "Ordering";
  if (kind === "audioPick") return "Audio Pick";
  if (kind === "numberHunt") return "Number Hunt";
  if (kind === "groupCountVisual") return "Visual Counting";
  return kind.replace(/([A-Z])/g, " $1").replace(/^./, (v) => v.toUpperCase());
}

function getPracticeTaskPrompt(task: PracticeTask) {
  return "prompt" in task && typeof task.prompt === "string" ? task.prompt : "";
}

function getPracticeTaskSpeechText(task: PracticeTask) {
  if ("speakText" in task && typeof task.speakText === "string" && task.speakText.trim()) {
    return task.speakText;
  }
  return getPracticeTaskPrompt(task);
}

function getPracticeTaskCorrectAnswer(task: PracticeTask) {
  if (task.kind === "mcq") return task.answer ?? null;
  if (task.kind === "count") return String(task.count);
  if (task.kind === "order3") return task.direction === "ASC"
    ? [...task.numbers].sort((a, b) => a - b).join(", ")
    : [...task.numbers].sort((a, b) => b - a).join(", ");
  if (task.kind === "audioPick") return String(task.targetNumber);
  if (task.kind === "numberHunt") return String(task.targetNumber);
  if (task.kind === "groupCountVisual") return String(task.answer);
  if (task.kind === "groundMatch") return String(task.targetNumber);
  if (task.kind === "groundCollect") return String(task.targetNumber);
  if (task.kind === "groundBuild") return String(task.targetNumber);
  if (task.kind === "groundFlash") return String(task.targetNumber);
  if (task.kind === "groundGrowingCount") return String(task.targetNumber);
  if (task.kind === "groundHunt") return String(task.targetNumber);
  if (task.kind === "groundOrderTap") return String(task.targetNumber);
  if (task.kind === "groundSequence") return String(task.targetNumber);
  if (task.kind === "groundTapCount") return String(task.targetNumber);
  if (task.kind === "groundMoveCount") return String(task.targetNumber);
  if (task.kind === "groundFeed") return String(task.targetNumber);
  if (task.kind === "groundSoundCount") return String(task.targetNumber);
  if (task.kind === "measurementCompare") {
    return task.objects.find((item) => item.id === task.correctOptionId)?.label ?? task.correctOptionId;
  }
  return null;
}

function normalizeScalar(value: unknown): Scalar | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value === null) return null;
  return undefined;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
      .map(([key, entry]) => `${key}:${stableSerialize(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function buildPracticeTaskRepeatKey(task: PracticeTask) {
  const keyData: Record<string, unknown> = { kind: task.kind };
  for (const [key, rawValue] of Object.entries(task as Record<string, unknown>)) {
    if (
      key === "feedback" ||
      key === "introPrompt" ||
      key === "speakText" ||
      key === "difficulty"
    ) {
      continue;
    }
    if (key === "prompt") {
      const promptValue = normalizeScalar(rawValue);
      if (promptValue !== undefined) keyData.prompt = promptValue;
      continue;
    }
    if (key === "config") {
      continue;
    }
    const scalarValue = normalizeScalar(rawValue);
    if (scalarValue !== undefined) {
      keyData[key] = scalarValue;
      continue;
    }
    if (Array.isArray(rawValue)) {
      keyData[key] = rawValue;
      continue;
    }
    if (rawValue && typeof rawValue === "object") {
      keyData[key] = rawValue;
    }
  }
  return stableSerialize(keyData);
}

function buildPracticeTaskTargetKey(task: PracticeTask) {
  const targetFields = [
    "targetNumber",
    "target",
    "count",
    "answer",
    "total",
    "start",
    "shownNumeral",
    "shownQuantity",
  ] as const;
  const parts: string[] = [task.kind];
  for (const field of targetFields) {
    const value = (task as Record<string, unknown>)[field];
    if (typeof value === "number") {
      parts.push(`${field}:${value}`);
    }
  }
  if (task.kind === "order3") {
    parts.push(`numbers:${[...task.numbers].sort((a, b) => a - b).join("-")}`);
    parts.push(`direction:${task.direction}`);
  }
  if (task.kind === "groundSequence") {
    parts.push(`sequence:${task.sequence.join("-")}`);
  }
  return parts.join("|");
}

type LiveLessonContext = {
  level: string;
  strand: string;
  week: number;
  lessonId: string;
  lessonTitle: string;
};

type GroundFeedbackTask = Extract<
  PracticeTask,
  { feedback?: { correct: string; wrong: string } }
>;

function Dots({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-card p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-6 w-6 rounded-full border border-gray-300 bg-gray-50"
          />
        ))}
      </div>
    </div>
  );
}

export function PracticeRunner({
  minutes = 9,
  getTask,
  onComplete,
  lessonTitle,
  completionMode = "question_or_time",
  scoreCap = MAX_LESSON_QUESTIONS,
  renderCompletionCard,
  onPerformanceSummary,
  liveContext,
  realmId,
  levelNumber,
  practisedSkills,
}: {
  minutes?: number;
  getTask: (ctx?: {
    secondsLeft: number;
    totalSeconds: number;
    elapsedSeconds: number;
    difficulty: Difficulty;
  }) => PracticeTask;
  onComplete: () => void;
  lessonTitle?: string;
  completionMode?: "question_or_time" | "time_only";
  scoreCap?: number;
  renderCompletionCard?: (summary: LessonPerformanceSummary) => ReactNode;
  onPerformanceSummary?: (summary: LessonPerformanceSummary) => void;
  liveContext?: LiveLessonContext;
  realmId?: string;
  levelNumber?: number;
  practisedSkills?: string[];
}) {
  const isMeasurement = realmId === "measurement";
  const totalSeconds = minutes * 60;
  const questionLimit =
    completionMode === "question_or_time" ? MAX_LESSON_QUESTIONS : Number.POSITIVE_INFINITY;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoredThisTurnRef = useRef(false);

  // ── Brain breaks (two mid-lesson villains) ──
  const [brainBreakVillain, setBrainBreakVillain] = useState<Villain | null>(null);
  const brainBreak1DoneRef = useRef(false);
  const brainBreak2DoneRef = useRef(false);
  const lastVillainIdRef = useRef<string | null>(null);
  const brainBreakActiveRef = useRef(false);

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [attemptLog, setAttemptLog] = useState<
    Array<{ topicLabel: string; correct: boolean; timeSpentSeconds: number }>
  >([]);
  const questionStartedAtElapsedRef = useRef(0);
  const questionsAnsweredRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const bestChainRef = useRef(0);

  // ── Lesson save & resume ──
  const resumeLessonKey = liveContext?.lessonId ?? null;
  const [showLessonResume, setShowLessonResume] = useState(false);
  const resumeResolvedRef = useRef(false);
  const showLessonResumeRef = useRef(false);

  function makeCtx() {
    const elapsed = totalSeconds - secondsLeft;
    const difficulty = getDifficultyFromTime(elapsed);
    return { secondsLeft, totalSeconds, elapsedSeconds: elapsed, difficulty };
  }

  const recentTaskKeysRef = useRef<string[]>([]);
  const recentTargetKeysRef = useRef<string[]>([]);

  const generateLessonTask = useCallback((ctx: {
    secondsLeft: number;
    totalSeconds: number;
    elapsedSeconds: number;
    difficulty: Difficulty;
  }) => {
    let fallbackTask: PracticeTask | null = null;
    for (let attempt = 0; attempt < NEXT_TASK_REROLLS; attempt += 1) {
      const candidate = getTask(ctx);
      candidate.difficulty = ctx.difficulty;
      const repeatKey = buildPracticeTaskRepeatKey(candidate);
      const targetKey = buildPracticeTaskTargetKey(candidate);
      if (!fallbackTask) fallbackTask = candidate;
      const repeatedTask = recentTaskKeysRef.current.includes(repeatKey);
      const repeatedTarget = recentTargetKeysRef.current.includes(targetKey);
      if (repeatedTask || repeatedTarget) {
        continue;
      }
      return candidate;
    }
    return fallbackTask ?? getTask(ctx);
  }, [getTask]);

  const [task, setTask] = useState<PracticeTask>(() => {
    const ctx = { secondsLeft: totalSeconds, totalSeconds, elapsedSeconds: 0, difficulty: "easy" as Difficulty };
    const initialTask = getTask(ctx);
    initialTask.difficulty = ctx.difficulty;
    return initialTask;
  });
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [typed, setTyped] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [taskNonce, setTaskNonce] = useState(0);
  const elapsedSeconds = totalSeconds - secondsLeft;
  const finished = secondsLeft <= 0 || questionsAnswered >= questionLimit;
  const { autoReadEnabled } = useAutoReadSetting();
  const speechInteractionReady = useSpeechInteractionReady();
  const lastAutoReadTaskKeyRef = useRef<string | null>(null);
  const autoReadPrompt = getPracticeTaskSpeechText(task);

  const safeQuestionsAnswered = Math.max(0, questionsAnswered);
  const safeCorrectAnswers = Math.max(0, correctAnswers);
  const cappedCorrectAnswers = clampNumber(correctAnswers, 0, scoreCap);
  const isTimeOnlySession = completionMode === "time_only";
  const elapsedWholeMinutes = Math.min(minutes, Math.floor(elapsedSeconds / 60));
  const hudXPMode = isTimeOnlySession ? "progress" : "xp";
  const hudXPValue = isTimeOnlySession ? elapsedWholeMinutes : undefined;
  const hudXPMax = isTimeOnlySession ? minutes : undefined;
  const hudXPLabel = isTimeOnlySession ? `${elapsedWholeMinutes} / ${minutes} MIN` : undefined;
  const hudXPRightLabel = isTimeOnlySession
    ? (isMeasurement ? "Explorer Progress" : "Session Progress")
    : undefined;
  const accuracy =
    safeQuestionsAnswered > 0
      ? Math.round((safeCorrectAnswers / safeQuestionsAnswered) * 100)
      : 0;
  const summary = useMemo<LessonPerformanceSummary>(() => {
    const topicMap = new Map<string, { label: string; correct: number; total: number; accuracy: number; timeSpentSeconds: number }>();
    for (const attempt of attemptLog) {
      const current = topicMap.get(attempt.topicLabel) ?? {
        label: attempt.topicLabel,
        correct: 0,
        total: 0,
        accuracy: 0,
        timeSpentSeconds: 0,
      };
      current.total += 1;
      current.timeSpentSeconds += attempt.timeSpentSeconds;
      if (attempt.correct) current.correct += 1;
      current.accuracy = current.total > 0 ? Math.round((current.correct / current.total) * 100) : 0;
      topicMap.set(attempt.topicLabel, current);
    }
    const topicSummaries = Array.from(topicMap.values()).sort((left, right) => right.total - left.total);
    const strengths = [...topicSummaries].filter((item) => item.accuracy >= 75).slice(0, 3);
    const areasToImprove = [...topicSummaries]
      .filter((item) => item.accuracy < 75)
      .sort((left, right) => left.accuracy - right.accuracy)
      .slice(0, 3);
    const struggledQuestionTypes = [...topicSummaries]
      .filter((item) => item.accuracy < 75)
      .map((item) => item.label)
      .slice(0, 4);

    return {
      lessonTitle: lessonTitle ?? "Practice Session",
      questionsAnswered: safeQuestionsAnswered,
      correctAnswers: safeCorrectAnswers,
      accuracy,
      timeSpentSeconds: Math.max(0, totalSeconds - Math.max(0, secondsLeft)),
      bestChain: 0,
      topicSummaries,
      strengths,
      areasToImprove,
      struggledQuestionTypes,
    };
  }, [accuracy, attemptLog, lessonTitle, safeCorrectAnswers, safeQuestionsAnswered, secondsLeft, totalSeconds]);
  const emittedSummaryRef = useRef(false);

  function clearPendingTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    const t = setInterval(
      () =>
        setSecondsLeft((s) =>
          brainBreakActiveRef.current || showLessonResumeRef.current ? s : s - 1
        ),
      1000
    );
    return () => {
      clearInterval(t);
      clearPendingTimeout();
    };
  }, []);

  // Track the best combo chain reached (for the reflection screen).
  useEffect(() => {
    if (comboCount > bestChainRef.current) bestChainRef.current = comboCount;
  }, [comboCount]);

  // ── Resume gate: load a saved snapshot once and offer to continue ──
  useEffect(() => {
    if (!resumeLessonKey) {
      resumeResolvedRef.current = true;
      return;
    }
    const snap = loadLessonResume(resumeLessonKey);
    if (lessonResumeHasProgress(snap)) {
      setShowLessonResume(true);
      showLessonResumeRef.current = true;
    } else {
      resumeResolvedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeLessonKey]);

  function resumeLesson() {
    const snap = resumeLessonKey ? loadLessonResume(resumeLessonKey) : null;
    if (snap) {
      setSecondsLeft(snap.secondsLeft);
      setQuestionsAnswered(snap.questionsAnswered);
      questionsAnsweredRef.current = snap.questionsAnswered;
      setCorrectAnswers(snap.correctAnswers);
      correctAnswersRef.current = snap.correctAnswers;
      setComboCount(snap.comboCount);
      bestChainRef.current = Math.max(bestChainRef.current, snap.comboCount);
      // Don't replay brain breaks the student already passed before exiting.
      if (snap.secondsLeft <= BRAIN_BREAK_1_AT_SECONDS_LEFT) brainBreak1DoneRef.current = true;
      if (snap.secondsLeft <= BRAIN_BREAK_2_AT_SECONDS_LEFT) brainBreak2DoneRef.current = true;
    }
    setShowLessonResume(false);
    showLessonResumeRef.current = false;
    resumeResolvedRef.current = true;
  }

  function restartLesson() {
    if (resumeLessonKey) clearLessonResume(resumeLessonKey);
    setShowLessonResume(false);
    showLessonResumeRef.current = false;
    resumeResolvedRef.current = true;
  }

  // Auto-save a snapshot as the clock ticks (after the resume gate resolves).
  useEffect(() => {
    if (!resumeLessonKey || !resumeResolvedRef.current || finished) return;
    if (brainBreakActiveRef.current) return;
    saveLessonResume({
      lessonKey: resumeLessonKey,
      secondsLeft,
      questionsAnswered,
      correctAnswers,
      comboCount,
      updatedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeLessonKey, secondsLeft, finished, questionsAnswered, correctAnswers, comboCount]);

  // Two brain breaks (~3 min and ~6 min in) — each pauses the lesson clock and
  // uses a different villain.
  useEffect(() => {
    if (finished || brainBreakActiveRef.current) return;
    if (!brainBreak1DoneRef.current && secondsLeft <= BRAIN_BREAK_1_AT_SECONDS_LEFT && secondsLeft > BRAIN_BREAK_2_AT_SECONDS_LEFT) {
      brainBreak1DoneRef.current = true;
      brainBreakActiveRef.current = true;
      const villain = pickVillain(levelNumber ?? 1);
      lastVillainIdRef.current = villain.id;
      setBrainBreakVillain(villain);
    } else if (!brainBreak2DoneRef.current && secondsLeft <= BRAIN_BREAK_2_AT_SECONDS_LEFT && secondsLeft > 0) {
      brainBreak1DoneRef.current = true; // in case break 1 was skipped (short lesson)
      brainBreak2DoneRef.current = true;
      brainBreakActiveRef.current = true;
      const villain = pickVillain(levelNumber ?? 1, lastVillainIdRef.current ?? undefined);
      lastVillainIdRef.current = villain.id;
      setBrainBreakVillain(villain);
    }
  }, [secondsLeft, finished, levelNumber]);

  useEffect(() => {
    if (!finished || emittedSummaryRef.current) return;
    emittedSummaryRef.current = true;
    onPerformanceSummary?.(summary);
  }, [finished, onPerformanceSummary, summary]);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      if (resumeLessonKey) clearLessonResume(resumeLessonKey);
      onComplete();
    }
  }, [finished, onComplete, resumeLessonKey]);

  useEffect(() => {
    if (task.kind !== "numberHunt") return;
    if (!speechInteractionReady) return;
    void speak(String(task.targetNumber), undefined, "auto");
  }, [speechInteractionReady, task]);

  const buildProgressMeta = useCallback((questionNumber: number) => {
    if (completionMode === "time_only") {
      return {
        progressPercent: Math.round((elapsedSeconds / totalSeconds) * 100),
        progressLabel: `Mini-game ${questionNumber}`,
      };
    }
    return {
      progressPercent: Math.round((questionsAnsweredRef.current / MAX_LESSON_QUESTIONS) * 100),
      progressLabel: `Question ${questionNumber} of ${MAX_LESSON_QUESTIONS}`,
    };
  }, [completionMode, elapsedSeconds, totalSeconds]);

  useEffect(() => {
    if (!autoReadEnabled || !speechInteractionReady) return;
    if (!autoReadPrompt) return;

    const currentTaskKey = `${task.kind}:${taskNonce}:${autoReadPrompt}`;
    if (lastAutoReadTaskKeyRef.current === currentTaskKey) return;

    lastAutoReadTaskKeyRef.current = currentTaskKey;
    void speak(autoReadPrompt, undefined, "auto");
  }, [autoReadEnabled, autoReadPrompt, speechInteractionReady, task.kind, taskNonce]);

  const correctOrder = useMemo(() => {
    if (task.kind !== "order3") return [];
    const sorted = [...task.numbers].sort((a: number, b: number) => a - b);
    return task.direction === "ASC" ? sorted : sorted.reverse();
  }, [task]);

  useEffect(() => {
    if (!liveContext) return;
    const prompt = getPracticeTaskPrompt(task);
    const questionNumber = questionsAnsweredRef.current + 1;
    const progressMeta = buildProgressMeta(questionNumber);
    if (questionNumber === 1) {
      void trackLiveLearningEvent({
        eventType: "activity_started",
        level: liveContext.level,
        strand: liveContext.strand,
        week: liveContext.week,
        lessonId: liveContext.lessonId,
        lessonTitle: liveContext.lessonTitle,
        activityId: task.kind,
        activityLabel: formatPracticeTopicLabel(task.kind),
        questionId: `${liveContext.lessonId}-q${questionNumber}`,
        questionText: prompt,
        questionType: task.kind,
        progressPercent: progressMeta.progressPercent,
        progressLabel: progressMeta.progressLabel,
        skillTag: task.kind,
      });
    }
    void trackLiveLearningEvent({
      eventType: "question_loaded",
      level: liveContext.level,
      strand: liveContext.strand,
      week: liveContext.week,
      lessonId: liveContext.lessonId,
      lessonTitle: liveContext.lessonTitle,
      activityId: task.kind,
      activityLabel: formatPracticeTopicLabel(task.kind),
      questionId: `${liveContext.lessonId}-q${questionNumber}`,
      questionText: prompt,
      questionType: task.kind,
      progressPercent: progressMeta.progressPercent,
      progressLabel: progressMeta.progressLabel,
      skillTag: task.kind,
    });
    scheduleIdleLiveEvent({
      level: liveContext.level,
      strand: liveContext.strand,
      week: liveContext.week,
      lessonId: liveContext.lessonId,
      lessonTitle: liveContext.lessonTitle,
      activityId: task.kind,
      activityLabel: formatPracticeTopicLabel(task.kind),
      questionId: `${liveContext.lessonId}-q${questionNumber}`,
      questionText: prompt,
      questionType: task.kind,
      progressPercent: progressMeta.progressPercent,
      progressLabel: progressMeta.progressLabel,
      skillTag: task.kind,
    });
    return () => {
      clearIdleLiveEventTimer();
    };
  }, [buildProgressMeta, completionMode, elapsedSeconds, liveContext, task, taskNonce, totalSeconds]);

  function nextTask() {
    if (finished) return;
    const currentRepeatKey = buildPracticeTaskRepeatKey(task);
    const currentTargetKey = buildPracticeTaskTargetKey(task);
    recentTaskKeysRef.current = [currentRepeatKey, ...recentTaskKeysRef.current].slice(0, RECENT_TASK_WINDOW);
    recentTargetKeysRef.current = [currentTargetKey, ...recentTargetKeysRef.current].slice(0, RECENT_TASK_WINDOW);

    const ctx = makeCtx();
    const generated = generateLessonTask(ctx);
    generated.difficulty = ctx.difficulty;
    setStatus("idle");
    setTyped("");
    setOrder([]);
    setHasPlayed(false);
    setTask(generated);
    setTaskNonce((n) => n + 1);
    scoredThisTurnRef.current = false;
    questionStartedAtElapsedRef.current = totalSeconds - secondsLeft;
  }

  function bumpSessionCounters(wasCorrect: boolean) {
    const nextQuestionsAnswered = questionsAnsweredRef.current + 1;
    questionsAnsweredRef.current = nextQuestionsAnswered;
    setQuestionsAnswered(nextQuestionsAnswered);

    if (wasCorrect) {
      const nextCorrectAnswers = correctAnswersRef.current + 1;
      correctAnswersRef.current = nextCorrectAnswers;
      setCorrectAnswers(nextCorrectAnswers);
      setComboCount((current) => current + 1);
    }

    return nextQuestionsAnswered;
  }

  function markWrong() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    const topicLabel = formatPracticeTopicLabel(task.kind);
    setAttemptLog((current) => [
      ...current,
      {
        topicLabel,
        correct: false,
        timeSpentSeconds: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
      },
    ]);
    setStatus("wrong");
    if (liveContext) {
      const questionNumber = questionsAnsweredRef.current + 1;
      const progressMeta = buildProgressMeta(questionNumber);
      void trackLiveLearningEvent({
        eventType: "answer_incorrect",
        level: liveContext.level,
        strand: liveContext.strand,
        week: liveContext.week,
        lessonId: liveContext.lessonId,
        lessonTitle: liveContext.lessonTitle,
        activityId: task.kind,
        activityLabel: formatPracticeTopicLabel(task.kind),
        questionId: `${liveContext.lessonId}-q${questionNumber}`,
        questionText: getPracticeTaskPrompt(task),
        questionType: task.kind,
        correctAnswer: getPracticeTaskCorrectAnswer(task),
        isCorrect: false,
        timeOnQuestion: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
        attemptNumber: 1,
        progressPercent: progressMeta.progressPercent,
        progressLabel: progressMeta.progressLabel,
        skillTag: task.kind,
      });
    }
    const nextQuestionsAnswered = bumpSessionCounters(false);
    setComboCount(0);
    clearPendingTimeout();
    if (nextQuestionsAnswered >= questionLimit) {
      return;
    }
    timeoutRef.current = setTimeout(() => nextTask(), 1200);
  }

  function markCorrect() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    const topicLabel = formatPracticeTopicLabel(task.kind);
    setAttemptLog((current) => [
      ...current,
      {
        topicLabel,
        correct: true,
        timeSpentSeconds: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
      },
    ]);
    setStatus("correct");
    if (liveContext) {
      const questionNumber = questionsAnsweredRef.current + 1;
      const progressMeta = buildProgressMeta(questionNumber);
      void trackLiveLearningEvent({
        eventType: "answer_correct",
        level: liveContext.level,
        strand: liveContext.strand,
        week: liveContext.week,
        lessonId: liveContext.lessonId,
        lessonTitle: liveContext.lessonTitle,
        activityId: task.kind,
        activityLabel: formatPracticeTopicLabel(task.kind),
        questionId: `${liveContext.lessonId}-q${questionNumber}`,
        questionText: getPracticeTaskPrompt(task),
        questionType: task.kind,
        correctAnswer: getPracticeTaskCorrectAnswer(task),
        isCorrect: true,
        timeOnQuestion: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
        attemptNumber: 1,
        progressPercent: progressMeta.progressPercent,
        progressLabel: progressMeta.progressLabel,
        skillTag: task.kind,
      });
    }
    const nextQuestionsAnswered = bumpSessionCounters(true);
    clearPendingTimeout();
    if (nextQuestionsAnswered >= questionLimit) {
      return;
    }
    timeoutRef.current = setTimeout(() => nextTask(), 600);
  }

  function markCorrectSoft() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    setStatus("correct");
    clearPendingTimeout();
    timeoutRef.current = setTimeout(() => setStatus("idle"), 500);
  }

  const callbacks = { markCorrect, markCorrectSoft, markWrong };

  function check() {
    if (task.kind === "mcq") return;
    if (task.kind === "count") {
      const n = Number(typed);
      if (!Number.isFinite(n)) return markWrong();
      return n === task.count ? markCorrect() : markWrong();
    }
    if (task.kind === "order3") {
      if (order.length !== task.numbers.length) return markWrong();
      const ok = order.every((v, i) => v === correctOrder[i]);
      return ok ? markCorrect() : markWrong();
    }
  }

  const isBuiltinKind = ["mcq", "count", "order3", "audioPick", "numberHunt", "groupCountVisual"].includes(task.kind);

  const hasGroundFeedback =
    task.kind === "measurementCompare" ||
    task.kind === "groundMatch" ||
    task.kind === "groundCollect" ||
    task.kind === "groundBuild" ||
    task.kind === "groundFlash" ||
    task.kind === "groundGrowingCount" ||
    task.kind === "groundHunt" ||
    task.kind === "groundOrderTap" ||
    task.kind === "groundSequence" ||
    task.kind === "groundTapCount" ||
    task.kind === "groundMoveCount" ||
    task.kind === "groundFeed" ||
    task.kind === "groundSoundCount";
  const hint =
    hasGroundFeedback
      ? status === "wrong"
        ? ((task as GroundFeedbackTask).feedback?.wrong ?? null)
        : ((task as GroundFeedbackTask).feedback?.correct ?? null)
      : task.kind === "mcq"
        ? status === "wrong"
          ? ((task as McqTask).feedback?.wrong ?? null)
          : ((task as McqTask).feedback?.correct ?? null)
        : null;
  const statusMessage =
    status === "correct"
      ? hint ?? (completionMode === "time_only" ? "✓ Correct! Keep going!" : "✓ Correct! +10 XP")
      : status === "wrong"
        ? hint ?? "✗ Not quite — keep going!"
        : null;

  useEffect(() => {
    if (
      completionMode === "question_or_time" &&
      (questionsAnswered > MAX_LESSON_QUESTIONS || correctAnswers > MAX_LESSON_QUESTIONS)
    ) {
      console.warn("[Level1LessonGuard] Session counters exceeded expected lesson limits.", {
        lessonTitle,
        questionsAnswered,
        correctAnswers,
        maxQuestions: MAX_LESSON_QUESTIONS,
      });
    }
    if (questionsAnswered > 100 || correctAnswers > 100) {
      console.warn("[Level1LessonGuard] Counter exceeded safety threshold.", {
        lessonTitle,
        questionsAnswered,
        correctAnswers,
      });
    }
  }, [completionMode, correctAnswers, lessonTitle, questionsAnswered]);

  useEffect(() => {
    if (!finished || !liveContext) return;
    void trackLiveLearningEvent({
      eventType: "lesson_completed",
      level: liveContext.level,
      strand: liveContext.strand,
      week: liveContext.week,
      lessonId: liveContext.lessonId,
      lessonTitle: liveContext.lessonTitle,
      progressPercent: 100,
      progressLabel:
        completionMode === "time_only"
          ? `Completed ${minutes}-minute Ground session`
          : `Completed ${safeQuestionsAnswered} of ${MAX_LESSON_QUESTIONS} questions`,
    });
  }, [completionMode, finished, liveContext, minutes, safeQuestionsAnswered]);

  // ── Finished state ──
  if (finished) {
    // Bespoke completion cards (Prep celebration, Week-12 summary) own their own
    // post-lesson screen. For every other lesson the reflection IS the
    // celebration / completion screen; its Continue returns to the week page.
    if (liveContext && !renderCompletionCard && !reflectionDone) {
      return (
        <LessonReflection
          lessonId={liveContext.lessonId}
          lessonTitle={lessonTitle ?? liveContext.lessonTitle ?? "Practice Session"}
          level={liveContext.level}
          levelNumber={levelNumber}
          week={liveContext.week}
          accuracy={accuracy}
          questionsAnswered={safeQuestionsAnswered}
          correctAnswers={safeCorrectAnswers}
          bestChain={bestChainRef.current}
          practisedSkills={practisedSkills}
          realmId={realmId}
          onComplete={() => {
            setReflectionDone(true);
            onComplete(); // returns to the week page (lesson already finalised)
          }}
        />
      );
    }

    if (renderCompletionCard) {
      return <>{renderCompletionCard(summary)}</>;
    }

    return (
      <LessonCompleteCard
        lessonTitle={lessonTitle ?? "Practice Session"}
        questionsAnswered={safeQuestionsAnswered}
        correctAnswers={safeCorrectAnswers}
        accuracy={accuracy}
        xpCorrectAnswers={cappedCorrectAnswers}
        onExit={onComplete}
      />
    );
  }

  // ── Active state ──
  function getComboBorder(count: number) {
    if (isMeasurement) {
      if (count >= 10) return "border-amber-400/60 ring-2 ring-amber-300/40 ring-offset-2 ring-offset-amber-950 nexus-card-glow";
      if (count >= 8)  return "border-orange-300/70 shadow-[0_0_22px_rgba(251,146,60,0.35)]";
      if (count >= 5)  return "border-amber-400/60 shadow-[0_0_22px_rgba(200,160,48,0.35)]";
      if (count >= 3)  return "border-amber-600/40 shadow-[0_0_18px_rgba(180,120,20,0.28)]";
      return "border-amber-800/20";
    }
    if (count >= 10) return "border-teal-300 shadow-[0_0_38px_rgba(45,212,191,0.65)] ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-950";
    if (count >= 8) return "border-orange-300/80 shadow-[0_0_22px_rgba(251,146,60,0.4)]";
    if (count >= 5) return "border-yellow-300/80 shadow-[0_0_22px_rgba(253,224,71,0.4)]";
    if (count >= 3) return "border-teal-300/70 shadow-[0_0_22px_rgba(94,234,212,0.35)]";
    return "border-border/50";
  }

  const statusBorder =
    status === "correct"
      ? "border-emerald-300 shadow-emerald-100/50"
      : status === "wrong"
      ? "border-red-300 shadow-red-100/50"
      : getComboBorder(comboCount);

  const feedbackOverlay =
    status === "correct"
      ? "bg-emerald-400/12"
      : status === "wrong"
      ? "bg-red-400/12"
      : "bg-transparent";

  const statusMotion = status === "wrong" ? "animate-[shake_0.35s_ease-in-out]" : "";

  return (
    <div className="relative">
      {showLessonResume && (
        <LessonResumeGate
          lessonTitle={lessonTitle ?? liveContext?.lessonTitle}
          onResume={resumeLesson}
          onRestart={restartLesson}
        />
      )}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-40 transition-all duration-500 ${feedbackOverlay} ${
          status === "correct" ? "animate-pulse" : ""
        }`}
      />

      <SurgeAmbience comboCount={comboCount} realmId={realmId} />
      <ComboActivation comboCount={comboCount} realmId={realmId} />
      <NexusActivation comboCount={comboCount} realmId={realmId} />
      {brainBreakVillain && (
        <BrainBreak
          villain={brainBreakVillain}
          onComplete={() => {
            brainBreakActiveRef.current = false;
            setBrainBreakVillain(null);
          }}
        />
      )}

      {/* Two-column landscape: sticky HUD rail + question workspace */}
      <div className="grid gap-3 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-5">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <LessonHUDRail
            lessonTitle={lessonTitle ?? null}
            correctAnswers={safeCorrectAnswers}
            xpCorrectAnswers={cappedCorrectAnswers}
            questionsAnswered={safeQuestionsAnswered}
            accuracy={accuracy}
            secondsLeft={Math.max(0, secondsLeft)}
            totalSeconds={totalSeconds}
            xpTarget={scoreCap}
            xpMode={hudXPMode}
            xpDisplayValue={hudXPValue}
            xpDisplayMax={hudXPMax}
            xpDisplayLabel={hudXPLabel}
            xpDisplayRightLabel={hudXPRightLabel}
            hint={hint}
            comboCount={comboCount}
            realmId={realmId}
          />
        </aside>

        <div className="min-w-0 space-y-3">
          {/* Status feedback pill */}
          {status !== "idle" && (
            <div
              className={`rounded-xl px-4 py-2.5 text-center text-sm font-extrabold shadow-sm transition-all ${
                status === "correct"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Main task card */}
          <div
            className={`rounded-[1.75rem] border-2 p-5 shadow-lg transition-all duration-300 ${statusBorder} ${statusMotion}`}
            style={isMeasurement ? { background: "#fdf6e8" } : undefined}
          >
        {/* Activity type label */}
        <div className="mb-3">
          <span
            className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={isMeasurement ? {
              background: "rgba(75,40,100,0.08)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#5b21b6",
            } : {
              background: "#f0fdf4",
              color: "#15803d",
            }}
          >
            {task.kind.replace(/([A-Z])/g, " $1").toUpperCase()}
          </span>
        </div>

        {/* Prompt with read-aloud for builtin kinds */}
        {isBuiltinKind && "prompt" in task && task.prompt && (
          <div className="mb-4 flex items-center gap-2">
            <div className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">
              {task.prompt}
            </div>
            <ReadAloudBtn text={task.prompt} />
          </div>
        )}

        {/* ── Builtin task renderers ── */}
        {task.kind === "mcq" && (
          <div className="grid gap-3">
            {(task as McqTask).options.map((opt: string, idx: number) => (
              <button
                key={`${opt}-${idx}`}
                onClick={() => opt === (task as McqTask).answer ? markCorrect() : markWrong()}
                className="w-full text-left px-5 py-4 rounded-2xl border border-border bg-card hover:bg-muted transition text-xl font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {task.kind === "groupCountVisual" && (() => {
          const t = task as GroupCountVisualTask;
          return (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="grid gap-3">
                  {Array.from({ length: t.groups }).map((_: unknown, gi: number) => (
                    <div key={gi} className="flex items-center gap-2">
                      {Array.from({ length: t.perGroup }).map((__: unknown, di: number) => (
                        <span key={di} className={`inline-block h-5 w-5 rounded-full ${isMeasurement ? "bg-amber-700" : "bg-teal-600"}`} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {t.options.map((opt: string, idx: number) => (
                  <button key={`${opt}-${idx}`} onClick={() => opt === t.answer ? markCorrect() : markWrong()} className="w-full text-left px-5 py-4 rounded-2xl border border-border bg-card hover:bg-muted transition text-xl font-bold">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {task.kind === "count" && (
          <div className="grid gap-4">
            <Dots count={(task as CountTask).count} />
            <div className="flex items-center gap-3">
              <input value={typed} onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Type your answer" className="flex-1 px-4 py-3 rounded-2xl border border-border text-xl font-bold bg-card" />
              <button onClick={check} className={`px-5 py-3 rounded-2xl text-white font-extrabold text-xl transition ${isMeasurement ? "bg-amber-700 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"}`}>Check</button>
            </div>
          </div>
        )}

        {task.kind === "order3" && (() => {
          const t = task as OrderTask;
          return (
            <div className="grid gap-4">
              <div className="flex gap-3 flex-wrap">
                {t.numbers.map((n: number) => {
                  const used = order.includes(n);
                  return (
                    <button key={n} onClick={() => !used && setOrder((prev) => [...prev, n])} className={["px-6 py-4 rounded-2xl border text-xl font-extrabold transition", used ? "border-border bg-muted text-muted-foreground" : "border-border bg-card hover:bg-muted"].join(" ")}>{n}</button>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-border bg-muted p-4">
                <div className="text-sm font-bold text-muted-foreground mb-2">Your order</div>
                <div className="text-2xl font-extrabold text-foreground">{order.length ? order.join(" , ") : "—"}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setOrder([])} className="px-5 py-3 rounded-2xl bg-muted text-foreground font-extrabold text-xl hover:bg-muted/80 transition">Reset</button>
                <button onClick={check} className="flex-1 px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xl hover:bg-teal-700 transition">Check</button>
              </div>
            </div>
          );
        })()}

        {task.kind === "audioPick" && (() => {
          const t = task as AudioPickTask;
          return (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => { speak(t.speechText ?? String(t.targetNumber)); setHasPlayed(true); }} className={`px-5 py-3 rounded-2xl text-white font-extrabold text-xl transition ${isMeasurement ? "bg-amber-700 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"}`}>🔊 Listen</button>
                <div className="text-sm font-bold text-muted-foreground">{hasPlayed ? "Now tap the number." : "Tap Listen first."}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {t.cards.map((n: number) => (
                  <button key={n} type="button" onClick={() => { if (!hasPlayed) return; if (n === t.targetNumber) { markCorrect(); } else { markWrong(); } }} className="px-4 py-6 rounded-2xl border border-border bg-card hover:bg-muted transition text-3xl font-extrabold">{n}</button>
                ))}
              </div>
              {!hasPlayed && <div className="text-sm text-muted-foreground">Tip: On iPads, audio will only play after a button tap (that&apos;s normal).</div>}
            </div>
          );
        })()}

        {task.kind === "numberHunt" && (() => {
          const t = task as NumberHuntTask;
          return (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">Tap the correct number tile.</div>
                <button type="button" onClick={() => speak(String(t.targetNumber))} className={`px-3 py-2 rounded-xl text-white font-bold transition ${isMeasurement ? "bg-amber-700 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"}`}>🔊 Hear number</button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {t.tiles.map((n: number) => (
                  <button key={n} type="button" onClick={() => n === t.targetNumber ? markCorrect() : markWrong()} className="rounded-2xl border border-border bg-card hover:bg-muted transition text-lg sm:text-xl font-extrabold py-4 sm:py-5">{n}</button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Delegate to TaskRenderer for complex component-based task kinds */}
        {!isBuiltinKind && (
          <TaskRenderer task={task} taskNonce={taskNonce} callbacks={callbacks} />
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
