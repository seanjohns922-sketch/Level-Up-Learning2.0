"use client";

import { Volume2 } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
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
import LessonCoachReview from "@/components/lesson/LessonCoachReview";
import { buildCoachReview } from "@/lib/lesson-coach";
import LessonResumeGate from "@/components/lesson/LessonResumeGate";
import MistakeReviewPanel, { type MistakeReviewItem } from "@/components/review/MistakeReviewPanel";
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
import { pickVillain, type Villain } from "@/lib/brain-break";
import { getBrainBreakSchedule, type BrainBreakFrequency } from "@/lib/brain-break-settings";
import { isPracticeTaskSafe } from "@/lib/task-safety";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";

type McqTask = Extract<PracticeTask, { kind: "mcq" }>;
type CountTask = Extract<PracticeTask, { kind: "count" }>;
type OrderTask = Extract<PracticeTask, { kind: "order3" }>;
type AudioPickTask = Extract<PracticeTask, { kind: "audioPick" }>;
type NumberHuntTask = Extract<PracticeTask, { kind: "numberHunt" }>;
type GroupCountVisualTask = Extract<PracticeTask, { kind: "groupCountVisual" }>;

type Scalar = string | number | boolean | null;

const DEFAULT_LESSON_SCORE_TARGET = 10;
const RECENT_TASK_WINDOW = 6;
const NEXT_TASK_REROLLS = 8;

type MeasurelandsLessonStage =
  | "intro"
  | "activity"
  | "feedback_correct"
  | "feedback_incorrect"
  | "transition_error";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPracticeTopicLabel(kind: PracticeTask["kind"]) {
  if (kind === "measurementCompare") return "Length Explorer";
  if (kind === "measurePath") return "Path Measurer";
  if (kind === "measureValidity") return "Measure Check";
  if (kind === "massMeasure") return "Mass Measurer";
  if (kind === "capacityMeasure") return "Cup Counter";
  if (kind === "durationUnit") return "Time Explorer";
  if (kind === "weekCycle") return "Calendar Keeper";
  if (kind === "calendarFind") return "Calendar Quest";
  if (kind === "balanceScale") return "Balance Master";
  if (kind === "analogClock") return "Clock Builder";
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
  if (kind === "starpathShapeIntro") return "Meet the Shapes";
  if (kind === "starpathShapeMatch") return "Match the Cosmic Shapes";
  if (kind === "starpathShapeSort") return "Shape Sorter";
  if (kind === "starpathShapeScene") return "Shapes Hidden in Starpath";
  if (kind === "starpathObjectShape") return "Space Object Match";
  if (kind === "starpathShapeName") return "Name the Shape";
  if (kind === "starpathShapeTapAll") return "Shape Detective Hunt";
  if (kind === "starpathOddOneOut") return "Which One Doesn't Belong?";
  if (kind === "starpathCollectMission") return "Cosmic Shape Mission";
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
  if (task.kind === "starpathShapeMatch") return task.targetShape;
  if (task.kind === "starpathShapeSort") return `${task.shape} planet`;
  if (task.kind === "starpathShapeScene") return task.correctObjectId;
  if (task.kind === "starpathObjectShape") return task.targetShape;
  if (task.kind === "starpathShapeName") return task.shape;
  if (task.kind === "starpathShapeTapAll") return `every ${task.targetShape}`;
  if (task.kind === "starpathOddOneOut") {
    return task.options.find((option) => option.id === task.oddOptionId)?.shape ?? "the odd shape";
  }
  if (task.kind === "starpathCollectMission") {
    return task.requests.map((request) => `${request.count} ${request.shape}`).join(", ");
  }
  if (task.kind === "measurementCompare") {
    return task.objects.find((item) => item.id === task.correctOptionId)?.label ?? task.correctOptionId;
  }
  if (task.kind === "measurePath") {
    if (task.scene === "estimateLonger") {
      return task.estimatePair?.find((item) => item.id === task.correctItemId)?.label ?? task.correctItemId ?? null;
    }
    if (typeof task.correctAnswer === "number") return `${task.correctAnswer} small blocks`;
    if (task.correctPathId) return task.correctPathId;
  }
  if (task.kind === "toolChoice") {
    if (task.correctToolId) {
      return task.tools?.find((item) => item.id === task.correctToolId)?.label ?? task.correctToolId;
    }
    if (task.correctReason) return task.correctReason;
    if (typeof task.correctCount === "number") return String(task.correctCount);
  }
  if (task.kind === "analogClock") {
    const option = task.options?.find((item) => item.id === task.correctOptionId);
    if (option) return option.label;
    if (task.targetMinute === 0) return `${task.targetHour} o'clock`;
    if (task.targetMinute === 30) return `Half past ${task.targetHour}`;
    if (task.targetMinute === 15) return `Quarter past ${task.targetHour}`;
    return `Quarter to ${task.targetHour === 12 ? 1 : task.targetHour + 1}`;
  }
  const genericTask = task as Record<string, unknown>;
  for (const key of ["correctAnswer", "answer", "correctOption", "correctLabel", "correctReason", "targetNumber", "targetDeg"]) {
    const value = genericTask[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return key === "targetDeg" ? `${value}°` : String(value);
    }
  }
  return null;
}

function getPracticeTaskWrongExplanation(task: PracticeTask) {
  if ("feedback" in task && task.feedback && typeof task.feedback === "object" && "wrong" in task.feedback) {
    const wrong = task.feedback.wrong;
    if (typeof wrong === "string" && wrong.trim()) return wrong;
  }
  return "Compare your answer with the correct one and focus on the key clue in the question.";
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
  const scene = (task as Record<string, unknown>).scene;
  if (typeof scene === "string" && scene.trim()) {
    parts.push(`scene:${scene}`);
  }
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

export type PracticeTaskTransition = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type LessonExperienceCopy = {
  reflectionTitle?: string;
  reflectionPrompt?: string;
  reflectionOptions?: string[];
  completionEyebrow?: string;
  completionTitle?: string;
  completionMessage?: string;
  exitLabel?: string;
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
  scoreCap = DEFAULT_LESSON_SCORE_TARGET,
  renderCompletionCard,
  onPerformanceSummary,
  liveContext,
  realmId,
  levelNumber,
  practisedSkills,
  nextUpLabel,
  brainBreakFrequency = "normal",
  getTaskTransition,
  taskTransitionComponent: TaskTransitionComponent,
  showResultsAfterReflection = false,
  experienceCopy,
  showCoachReview = true,
  showMistakeReview = true,
  activityNoun = "Question",
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
  nextUpLabel?: string;
  brainBreakFrequency?: BrainBreakFrequency;
  getTaskTransition?: (task: PracticeTask) => PracticeTaskTransition | null;
  taskTransitionComponent?: ComponentType<{
    transition: PracticeTaskTransition;
    onBegin: () => void;
  }>;
  showResultsAfterReflection?: boolean;
  experienceCopy?: LessonExperienceCopy;
  showCoachReview?: boolean;
  showMistakeReview?: boolean;
  activityNoun?: string;
}) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStructuredRealm = isMeasurement || realmId === "space";
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoredThisTurnRef = useRef(false);
  const advancingTaskRef = useRef(false);

  // ── Brain breaks (teacher-configurable frequency → 0/1/2 mid-lesson villains) ──
  const [brainBreakVillain, setBrainBreakVillain] = useState<Villain | null>(null);
  const brainBreakSchedule = useMemo(
    () => getBrainBreakSchedule(levelNumber, brainBreakFrequency),
    [levelNumber, brainBreakFrequency]
  );
  const nextBreakIdxRef = useRef(0);
  const lastVillainIdRef = useRef<string | null>(null);
  const lastVillainGameRef = useRef<Villain["game"] | null>(null);
  const brainBreakActiveRef = useRef(false);

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [coachDone, setCoachDone] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [lessonMistakeReviewDone, setLessonMistakeReviewDone] = useState(false);
  const [showLessonMistakeReview, setShowLessonMistakeReview] = useState(false);
  const [lessonMistakes, setLessonMistakes] = useState<MistakeReviewItem[]>([]);
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
      if (!isPracticeTaskSafe(candidate)) {
        continue;
      }
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
    const emergency = fallbackTask ?? getTask(ctx);
    return isPracticeTaskSafe(emergency) ? emergency : null;
  }, [getTask]);

  // The initializer intentionally seeds the repetition refs before first paint.
  // eslint-disable-next-line react-hooks/refs
  const [task, setTask] = useState<PracticeTask>(() => {
    const ctx = { secondsLeft: totalSeconds, totalSeconds, elapsedSeconds: 0, difficulty: "easy" as Difficulty };
    const initialTask = generateLessonTask(ctx);
    const safeTask = initialTask ?? getTask(ctx);
    safeTask.difficulty = ctx.difficulty;
    return safeTask;
  });
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const pauseLessonClockRef = useRef(false);
  const [isAdvancingTask, setIsAdvancingTask] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [pendingTaskTransition, setPendingTaskTransition] = useState<{
    task: PracticeTask;
    transition: PracticeTaskTransition;
  } | null>(null);
  const [awaitingWrongNext, setAwaitingWrongNext] = useState(false);
  const [currentWrongFeedback, setCurrentWrongFeedback] = useState<MistakeReviewItem | null>(null);
  const [typed, setTyped] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [taskNonce, setTaskNonce] = useState(0);
  const elapsedSeconds = totalSeconds - secondsLeft;
  const finished = secondsLeft <= 0;
  const { autoReadEnabled } = useAutoReadSetting();
  const speechInteractionReady = useSpeechInteractionReady();
  const lastAutoReadTaskKeyRef = useRef<string | null>(null);
  const autoReadPrompt = getPracticeTaskSpeechText(task);
  const isIntroTask = isStructuredRealm && "scene" in task && task.scene === "intro";
  const lessonStage: MeasurelandsLessonStage = transitionError
    ? "transition_error"
    : isIntroTask
      ? "intro"
      : status === "correct"
        ? "feedback_correct"
        : status === "wrong"
          ? "feedback_incorrect"
          : "activity";

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
    ? (isMeasurement ? "Explorer Progress" : isStarpath ? "Mission Progress" : "Session Progress")
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
    pauseLessonClockRef.current =
      isIntroTask || Boolean(transitionError) || Boolean(pendingTaskTransition);
  }, [isIntroTask, pendingTaskTransition, transitionError]);

  useEffect(() => {
    const t = setInterval(
      () =>
        setSecondsLeft((s) =>
          brainBreakActiveRef.current || showLessonResumeRef.current || pauseLessonClockRef.current ? s : s - 1
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
      setLessonMistakes(snap.lessonMistakes ?? []);
      setAttemptLog(snap.attemptLog ?? []);
      bestChainRef.current = Math.max(bestChainRef.current, snap.comboCount);
      // Don't replay brain breaks the student already passed before exiting.
      nextBreakIdxRef.current = brainBreakSchedule.filter((t) => snap.secondsLeft <= t).length;
    }
    setShowLessonResume(false);
    showLessonResumeRef.current = false;
    resumeResolvedRef.current = true;
  }

  function restartLesson() {
    if (resumeLessonKey) clearLessonResume(resumeLessonKey);
    setLessonMistakes([]);
    setAttemptLog([]);
    setLessonMistakeReviewDone(false);
    setShowLessonMistakeReview(false);
    setAwaitingWrongNext(false);
    setCurrentWrongFeedback(null);
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
      lessonMistakes,
      attemptLog,
      updatedAt: Date.now(),
    });
  }, [resumeLessonKey, secondsLeft, finished, questionsAnswered, correctAnswers, comboCount, lessonMistakes, attemptLog]);

  // Brain breaks fire at the scheduled seconds-left thresholds (count + timing
  // come from the teacher-set frequency × level). Each pauses the clock and uses
  // a different villain than the last.
  useEffect(() => {
    if (finished || brainBreakActiveRef.current) return;
    const idx = nextBreakIdxRef.current;
    if (idx >= brainBreakSchedule.length) return;
    const threshold = brainBreakSchedule[idx]!;
    if (secondsLeft <= threshold && secondsLeft > 0) {
      nextBreakIdxRef.current = idx + 1;
      brainBreakActiveRef.current = true;
      const villain = pickVillain(levelNumber ?? 1, {
        excludeId: lastVillainIdRef.current ?? undefined,
        excludeGame: lastVillainGameRef.current ?? undefined,
      });
      lastVillainIdRef.current = villain.id;
      lastVillainGameRef.current = villain.game;
      setBrainBreakVillain(villain);
    }
  }, [secondsLeft, finished, levelNumber, brainBreakSchedule]);

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
      progressPercent: Math.round((elapsedSeconds / totalSeconds) * 100),
      progressLabel: `${activityNoun} ${questionNumber}`,
    };
  }, [activityNoun, completionMode, elapsedSeconds, totalSeconds]);

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
    if (finished || advancingTaskRef.current) return;
    advancingTaskRef.current = true;
    setIsAdvancingTask(true);
    const currentRepeatKey = buildPracticeTaskRepeatKey(task);
    const currentTargetKey = buildPracticeTaskTargetKey(task);
    recentTaskKeysRef.current = [currentRepeatKey, ...recentTaskKeysRef.current].slice(0, RECENT_TASK_WINDOW);
    recentTargetKeysRef.current = [currentTargetKey, ...recentTargetKeysRef.current].slice(0, RECENT_TASK_WINDOW);

    const ctx = makeCtx();
    const generated = generateLessonTask(ctx);
    if (!generated) {
      console.error("[MeasurelandsLesson] Next challenge generation failed", {
        stage: lessonStage,
        taskKind: task.kind,
        lessonId: liveContext?.lessonId ?? resumeLessonKey,
        level: liveContext?.level,
        week: liveContext?.week,
      });
      setTransitionError("The next challenge did not load. Please try again.");
      advancingTaskRef.current = false;
      setIsAdvancingTask(false);
      return;
    }
    generated.difficulty = ctx.difficulty;
    const currentTransition = getTaskTransition?.(task) ?? null;
    const generatedTransition = getTaskTransition?.(generated) ?? null;
    setTransitionError(null);
    setStatus("idle");
    setAwaitingWrongNext(false);
    setCurrentWrongFeedback(null);
    setTyped("");
    setOrder([]);
    setHasPlayed(false);
    scoredThisTurnRef.current = false;
    if (generatedTransition && generatedTransition.key !== currentTransition?.key) {
      pauseLessonClockRef.current = true;
      setPendingTaskTransition({ task: generated, transition: generatedTransition });
      advancingTaskRef.current = false;
      setIsAdvancingTask(false);
      return;
    }
    setTask(generated);
    setTaskNonce((n) => n + 1);
    questionStartedAtElapsedRef.current = totalSeconds - secondsLeft;
  }

  function beginPendingTask() {
    if (!pendingTaskTransition) return;
    pauseLessonClockRef.current = false;
    setTask(pendingTaskTransition.task);
    setPendingTaskTransition(null);
    setTaskNonce((n) => n + 1);
    questionStartedAtElapsedRef.current = totalSeconds - secondsLeft;
  }

  useEffect(() => {
    advancingTaskRef.current = false;
    setIsAdvancingTask(false);
  }, [taskNonce]);

  function advanceIntro() {
    if (!isIntroTask || status !== "idle" || scoredThisTurnRef.current) return;
    clearPendingTimeout();
    nextTask();
  }

  function continueAfterCorrect() {
    if (status !== "correct") return;
    clearPendingTimeout();
    nextTask();
  }

  function continueAfterWrong() {
    clearPendingTimeout();
    setAwaitingWrongNext(false);
    setCurrentWrongFeedback(null);
    nextTask();
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

  function markWrong(studentAnswer?: string | number | null) {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    const topicLabel = formatPracticeTopicLabel(task.kind);
    const questionNumber = questionsAnsweredRef.current + 1;
    const mistake: MistakeReviewItem = {
      id: `${resumeLessonKey ?? "lesson"}-mistake-${questionNumber}`,
      questionNumber,
      prompt: getPracticeTaskPrompt(task) || topicLabel,
      studentAnswer:
        studentAnswer === undefined || studentAnswer === null || studentAnswer === ""
          ? "Incorrect attempt"
          : String(studentAnswer),
      correctAnswer: getPracticeTaskCorrectAnswer(task),
      explanation: getPracticeTaskWrongExplanation(task),
      taskId: `${resumeLessonKey ?? "lesson"}-q${questionNumber}`,
      taskData: task,
      week: liveContext?.week ?? null,
      lessonTitle: liveContext?.lessonTitle ?? lessonTitle ?? null,
      skillLabel: topicLabel,
    };
    setLessonMistakes((current) => [...current, mistake]);
    setCurrentWrongFeedback(mistake);
    setAwaitingWrongNext(true);
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
    bumpSessionCounters(false);
    setComboCount(0);
    clearPendingTimeout();
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
    bumpSessionCounters(true);
    clearPendingTimeout();
    if (!isStructuredRealm) {
      timeoutRef.current = setTimeout(() => nextTask(), 600);
    }
  }

  function markCorrectSoft() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    setStatus("correct");
    clearPendingTimeout();
    timeoutRef.current = setTimeout(() => setStatus("idle"), 500);
  }

  const callbacks = { markCorrect, markCorrectSoft, markWrong, advanceIntro };

  function check() {
    if (task.kind === "mcq") return;
    if (task.kind === "count") {
      const n = Number(typed);
      if (!Number.isFinite(n)) return markWrong(typed);
      return n === task.count ? markCorrect() : markWrong(typed);
    }
    if (task.kind === "order3") {
      if (order.length !== task.numbers.length) return markWrong(order.length ? order.join(", ") : "Incomplete order");
      const ok = order.every((v, i) => v === correctOrder[i]);
      return ok ? markCorrect() : markWrong(order.join(", "));
    }
  }

  const isBuiltinKind = ["mcq", "count", "order3", "audioPick", "numberHunt", "groupCountVisual"].includes(task.kind);

  const hasGroundFeedback =
    task.kind === "measurementCompare" ||
    task.kind === "measurePath" ||
    task.kind === "measureValidity" ||
    task.kind === "massMeasure" ||
    task.kind === "capacityMeasure" ||
    task.kind === "durationUnit" ||
    task.kind === "weekCycle" ||
    task.kind === "calendarFind" ||
    task.kind === "routineSequence" ||
    task.kind === "balanceScale" ||
    task.kind === "analogClock" ||
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
    task.kind === "groundSoundCount" ||
    task.kind === "starpathShapeMatch" ||
    task.kind === "starpathShapeSort" ||
    task.kind === "starpathShapeScene" ||
    task.kind === "starpathObjectShape" ||
    task.kind === "starpathShapeName" ||
    task.kind === "starpathShapeTapAll" ||
    task.kind === "starpathOddOneOut" ||
    task.kind === "starpathCollectMission";
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
    if (!finished || !liveContext) return;
    void trackLiveLearningEvent({
      eventType: "lesson_completed",
      level: liveContext.level,
      strand: liveContext.strand,
      week: liveContext.week,
      lessonId: liveContext.lessonId,
      lessonTitle: liveContext.lessonTitle,
      progressPercent: 100,
      progressLabel: `Completed ${safeQuestionsAnswered} questions`,
      questionsAnswered: safeQuestionsAnswered,
      totalQuestions: safeQuestionsAnswered,
      correctCount: correctAnswers,
      correctAnswers,
    });
  }, [completionMode, correctAnswers, finished, liveContext, minutes, safeQuestionsAnswered]);

  // ── Finished state ──
  if (finished) {
    // Coach Review (performance guidance) shows first for every lesson —
    // including ones with a bespoke completion card (Prep celebration) — then
    // the Reflection (celebration + confidence) or that bespoke card follows.
    if (liveContext && showCoachReview && !coachDone) {
      return (
        <LessonCoachReview
          review={buildCoachReview({
            levelNumber,
            accuracy,
            topicSummaries: summary.topicSummaries,
            strengths: summary.strengths,
            areasToImprove: summary.areasToImprove,
            practisedSkills,
            nextUpLabel,
            lessonId: liveContext.lessonId,
          })}
          levelNumber={levelNumber}
          realmId={realmId}
          onContinue={() => setCoachDone(true)}
        />
      );
    }
    if (showMistakeReview && showLessonMistakeReview) {
      return (
        <MistakeReviewPanel
          mode="lesson"
          realmId={realmId}
          items={lessonMistakes}
          onFinish={() => {
            setShowLessonMistakeReview(false);
            setLessonMistakeReviewDone(true);
          }}
        />
      );
    }
    if (liveContext && showMistakeReview && lessonMistakes.length > 0 && !lessonMistakeReviewDone) {
      return (
        <main className="min-h-screen bg-slate-950 px-4 py-8">
          <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
            <div className="w-full rounded-3xl border border-white/10 bg-white p-6 text-center shadow-xl">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Lesson Complete
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-950">Review My Mistakes</h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                You have {lessonMistakes.length} question{lessonMistakes.length === 1 ? "" : "s"} to review. This will not change XP or your score.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setShowLessonMistakeReview(true)}
                  className="rounded-2xl bg-trust-blue px-5 py-3 font-black text-white transition hover:opacity-90"
                >
                  Review My Mistakes
                </button>
                <button
                  type="button"
                  onClick={() => setLessonMistakeReviewDone(true)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-100"
                >
                  Finish Lesson
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    }
    if (liveContext && !renderCompletionCard && !reflectionDone) {
      // Completion is terminal, so reading the final accumulated chain is stable.
      // eslint-disable-next-line react-hooks/refs
      const completedBestChain = bestChainRef.current;
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
          bestChain={completedBestChain}
          practisedSkills={practisedSkills}
          nextUpLabel={nextUpLabel}
          realmId={realmId}
          copy={experienceCopy}
          onComplete={() => {
            setReflectionDone(true);
            if (!showResultsAfterReflection) {
              onComplete(); // legacy flow returns directly after reflection
            }
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
        realmId={realmId}
        eyebrow={experienceCopy?.completionEyebrow}
        completionTitle={experienceCopy?.completionTitle}
        completionMessage={experienceCopy?.completionMessage}
        exitLabel={experienceCopy?.exitLabel}
        onExit={onComplete}
      />
    );
  }

  // ── Active state ──
  if (pendingTaskTransition) {
    if (TaskTransitionComponent) {
      return <TaskTransitionComponent transition={pendingTaskTransition.transition} onBegin={beginPendingTask} />;
    }
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          {pendingTaskTransition.transition.eyebrow}
        </div>
        <h2 className="mt-2 text-3xl font-black text-slate-950">{pendingTaskTransition.transition.title}</h2>
        <p className="mt-2 text-slate-600">{pendingTaskTransition.transition.description}</p>
        <button type="button" onClick={beginPendingTask} className="mt-5 rounded-xl bg-teal-700 px-6 py-3 font-black text-white">
          Begin
        </button>
      </div>
    );
  }

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
  const currentCorrectAnswer = currentWrongFeedback?.correctAnswer ?? getPracticeTaskCorrectAnswer(task);
  const currentWrongExplanation = currentWrongFeedback?.explanation ?? getPracticeTaskWrongExplanation(task);
  const hudLessonNumber = Number(liveContext?.lessonId.match(/-l(\d+)$/)?.[1] ?? NaN);
  const taskSurfaceStyle = isMeasurement
    ? {
        background: "linear-gradient(180deg, #fffdf7 0%, #fff7e6 100%)",
        boxShadow: "0 18px 45px rgba(92,56,10,0.10)",
      }
    : isStarpath
      ? {
          background: "linear-gradient(180deg, #fbfaff 0%, #effcff 100%)",
          boxShadow: "0 18px 45px rgba(76,29,149,0.10)",
        }
      : {
          background: "linear-gradient(180deg, #fbfffe 0%, #effcf9 100%)",
          boxShadow: "0 18px 45px rgba(4,78,70,0.10)",
        };

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

      <SurgeAmbience comboCount={comboCount} realmId={realmId} dimmed={status !== "correct"} />
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
            levelNumber={levelNumber}
            week={liveContext?.week}
            lessonNumber={Number.isFinite(hudLessonNumber) ? hudLessonNumber : undefined}
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
                  ? isMeasurement
                    ? "bg-[#fff7e5] text-[#7c5a20] border border-[#d6b86c]"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {awaitingWrongNext && currentWrongFeedback ? (
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 shadow-sm">
              <div>Not quite.</div>
              <div className="mt-1">
                Your answer: <span className="font-black">{currentWrongFeedback.studentAnswer || "Incorrect attempt"}</span>
              </div>
              {currentCorrectAnswer ? (
                <div className="mt-1 text-emerald-800">
                  Correct answer: <span className="font-black">{currentCorrectAnswer}</span>
                </div>
              ) : null}
              <div className="mt-1 text-red-900">{currentWrongExplanation}</div>
            </div>
          ) : null}

          {transitionError ? (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-4 text-center text-amber-950 shadow-sm">
              <p className="font-black">{transitionError}</p>
              <button
                type="button"
                onClick={nextTask}
                disabled={isAdvancingTask}
                className="mt-3 rounded-2xl bg-[#8a6422] px-5 py-3 text-base font-black text-white transition hover:bg-[#a2732e] disabled:cursor-wait disabled:opacity-60"
              >
                {isAdvancingTask ? "Loading..." : "Try Again"}
              </button>
            </div>
          ) : null}

          {/* Main task card */}
          <div
            className={`rounded-[1.75rem] border-2 p-4 shadow-lg transition-all duration-300 sm:p-6 ${statusBorder} ${statusMotion}`}
            style={taskSurfaceStyle}
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
            {`${isStarpath ? activityNoun : "Activity"}: ${formatPracticeTopicLabel(task.kind)}`}
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
                onClick={() => opt === (task as McqTask).answer ? markCorrect() : markWrong(opt)}
                className={[
                  "w-full text-left px-5 py-4 rounded-2xl border transition text-xl font-bold",
                  awaitingWrongNext && opt === currentWrongFeedback?.studentAnswer
                    ? "border-red-400 bg-red-50 text-red-800"
                    : awaitingWrongNext && opt === (task as McqTask).answer
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-border bg-card hover:bg-muted",
                ].join(" ")}
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
                  <button key={`${opt}-${idx}`} onClick={() => opt === t.answer ? markCorrect() : markWrong(opt)} className={[
                    "w-full text-left px-5 py-4 rounded-2xl border transition text-xl font-bold",
                    awaitingWrongNext && opt === currentWrongFeedback?.studentAnswer
                      ? "border-red-400 bg-red-50 text-red-800"
                      : awaitingWrongNext && opt === t.answer
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : isMeasurement
                          ? "border-amber-900/20 bg-[#fffaf0] hover:bg-[#fff4dd]"
                          : "border-border bg-card hover:bg-muted",
                  ].join(" ")}>
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
              <button onClick={check} className={`px-5 py-3 rounded-2xl text-white font-extrabold text-xl transition ${isMeasurement ? "bg-[#8a6422] hover:bg-[#a2732e]" : "bg-teal-600 hover:bg-teal-700"}`}>Check</button>
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
                <button onClick={check} className={`flex-1 px-5 py-3 rounded-2xl text-white font-extrabold text-xl transition ${isMeasurement ? "bg-[#8a6422] hover:bg-[#a2732e]" : "bg-teal-600 hover:bg-teal-700"}`}>Check</button>
              </div>
            </div>
          );
        })()}

        {task.kind === "audioPick" && (() => {
          const t = task as AudioPickTask;
          return (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => { speak(t.speechText ?? String(t.targetNumber)); setHasPlayed(true); }} className={`px-5 py-3 rounded-2xl text-white font-extrabold text-xl transition ${isMeasurement ? "bg-[#8a6422] hover:bg-[#a2732e]" : "bg-teal-600 hover:bg-teal-700"}`}><span className="inline-flex items-center gap-1.5"><Volume2 className="h-4 w-4" /> Listen</span></button>
                <div className="text-sm font-bold text-muted-foreground">{hasPlayed ? "Now tap the number." : "Tap Listen first."}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {t.cards.map((n: number) => (
                  <button key={n} type="button" onClick={() => { if (!hasPlayed) return; if (n === t.targetNumber) { markCorrect(); } else { markWrong(n); } }} className="px-4 py-6 rounded-2xl border border-border bg-card hover:bg-muted transition text-3xl font-extrabold">{n}</button>
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
                <button type="button" onClick={() => speak(String(t.targetNumber))} className={`px-3 py-2 rounded-xl text-white font-bold transition ${isMeasurement ? "bg-[#8a6422] hover:bg-[#a2732e]" : "bg-teal-600 hover:bg-teal-700"}`}><span className="inline-flex items-center gap-1.5"><Volume2 className="h-4 w-4" /> Hear number</span></button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {t.tiles.map((n: number) => (
                  <button key={n} type="button" onClick={() => n === t.targetNumber ? markCorrect() : markWrong(n)} className="rounded-2xl border border-border bg-card hover:bg-muted transition text-lg sm:text-xl font-extrabold py-4 sm:py-5">{n}</button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Delegate to TaskRenderer for complex component-based task kinds */}
        {!isBuiltinKind && (
          <TaskRenderer task={task} taskNonce={taskNonce} callbacks={callbacks} />
        )}
        {awaitingWrongNext ? (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={continueAfterWrong}
              className={`rounded-2xl px-5 py-3 text-lg font-black text-white transition hover:brightness-105 ${
                isMeasurement ? "bg-[#8a6422]" : realmId === "space" ? "bg-violet-700" : "bg-teal-700"
              }`}
            >
              Next Question
            </button>
          </div>
        ) : null}
        {isStructuredRealm && status === "correct" && !transitionError ? (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={continueAfterCorrect}
              disabled={isAdvancingTask}
              className={`rounded-2xl px-5 py-3 text-lg font-black text-white transition disabled:cursor-wait disabled:opacity-60 ${
                isMeasurement ? "bg-[#8a6422] hover:bg-[#a2732e]" : "bg-violet-700 hover:bg-violet-600"
              }`}
            >
              {isAdvancingTask ? "Loading..." : "Next Challenge"}
            </button>
          </div>
        ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
