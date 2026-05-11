"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PracticeTask, Difficulty } from "@/data/activities/year1/practice-task";
import { getDifficultyFromTime } from "@/data/activities/year1/practice-task";
import { TaskRenderer } from "@/components/TaskRenderer";
import { clearIdleLiveEventTimer, scheduleIdleLiveEvent, trackLiveLearningEvent } from "@/lib/live-class-client";
import { speak, useAutoReadSetting } from "@/lib/speak";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { LessonHUDRail } from "@/components/lesson/LessonHUDRail";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";

type McqTask = Extract<PracticeTask, { kind: "mcq" }>;
type CountTask = Extract<PracticeTask, { kind: "count" }>;
type OrderTask = Extract<PracticeTask, { kind: "order3" }>;
type AudioPickTask = Extract<PracticeTask, { kind: "audioPick" }>;
type NumberHuntTask = Extract<PracticeTask, { kind: "numberHunt" }>;
type GroupCountVisualTask = Extract<PracticeTask, { kind: "groupCountVisual" }>;

const MAX_LESSON_QUESTIONS = 10;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPracticeTopicLabel(kind: PracticeTask["kind"]) {
  if (kind === "groundMatch") return "Ground Match";
  if (kind === "groundCollect") return "Ground Collect";
  if (kind === "groundBuild") return "Ground Build";
  if (kind === "groundFlash") return "Ground Flash";
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
  return null;
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
  renderCompletionCard,
  onPerformanceSummary,
  liveContext,
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
  renderCompletionCard?: (summary: LessonPerformanceSummary) => ReactNode;
  onPerformanceSummary?: (summary: LessonPerformanceSummary) => void;
  liveContext?: LiveLessonContext;
}) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoredThisTurnRef = useRef(false);

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attemptLog, setAttemptLog] = useState<
    Array<{ topicLabel: string; correct: boolean; timeSpentSeconds: number }>
  >([]);
  const questionStartedAtElapsedRef = useRef(0);
  const questionsAnsweredRef = useRef(0);
  const correctAnswersRef = useRef(0);

  function makeCtx() {
    const elapsed = totalSeconds - secondsLeft;
    const difficulty = getDifficultyFromTime(elapsed);
    return { secondsLeft, totalSeconds, elapsedSeconds: elapsed, difficulty };
  }

  const [task, setTask] = useState<PracticeTask>(() => {
    const ctx = { secondsLeft: totalSeconds, totalSeconds, elapsedSeconds: 0, difficulty: "easy" as Difficulty };
    const t = getTask(ctx);
    t.difficulty = ctx.difficulty;
    return t;
  });
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [typed, setTyped] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [taskNonce, setTaskNonce] = useState(0);
  const finished = secondsLeft <= 0 || questionsAnswered >= MAX_LESSON_QUESTIONS;
  const { autoReadEnabled } = useAutoReadSetting();
  const lastAutoReadTaskKeyRef = useRef<string | null>(null);
  const autoReadPrompt = getPracticeTaskSpeechText(task);

  const safeQuestionsAnswered = clampNumber(questionsAnswered, 0, MAX_LESSON_QUESTIONS);
  const safeCorrectAnswers = clampNumber(correctAnswers, 0, Math.min(MAX_LESSON_QUESTIONS, safeQuestionsAnswered));
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
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => {
      clearInterval(t);
      clearPendingTimeout();
    };
  }, []);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  useEffect(() => {
    if (!finished || emittedSummaryRef.current) return;
    emittedSummaryRef.current = true;
    onPerformanceSummary?.(summary);
  }, [finished, onPerformanceSummary, summary]);

  useEffect(() => {
    if (task.kind !== "numberHunt") return;
    speak(String(task.targetNumber));
  }, [task]);

  useEffect(() => {
    if (!autoReadEnabled) return;
    if (!autoReadPrompt) return;

    const currentTaskKey = `${task.kind}:${taskNonce}:${autoReadPrompt}`;
    if (lastAutoReadTaskKeyRef.current === currentTaskKey) return;

    lastAutoReadTaskKeyRef.current = currentTaskKey;
    void speak(autoReadPrompt);
  }, [autoReadEnabled, autoReadPrompt, task.kind, taskNonce]);

  const correctOrder = useMemo(() => {
    if (task.kind !== "order3") return [];
    const sorted = [...task.numbers].sort((a: number, b: number) => a - b);
    return task.direction === "ASC" ? sorted : sorted.reverse();
  }, [task]);

  useEffect(() => {
    if (!liveContext) return;
    const prompt = getPracticeTaskPrompt(task);
    const questionNumber = questionsAnsweredRef.current + 1;
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
        progressPercent: 0,
        progressLabel: `Question ${questionNumber} of ${MAX_LESSON_QUESTIONS}`,
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
      progressPercent: Math.round((questionsAnsweredRef.current / MAX_LESSON_QUESTIONS) * 100),
      progressLabel: `Question ${questionNumber} of ${MAX_LESSON_QUESTIONS}`,
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
      progressPercent: Math.round((questionsAnsweredRef.current / MAX_LESSON_QUESTIONS) * 100),
      progressLabel: `Question ${questionNumber} of ${MAX_LESSON_QUESTIONS}`,
      skillTag: task.kind,
    });
    return () => {
      clearIdleLiveEventTimer();
    };
  }, [liveContext, task, taskNonce]);

  function nextTask() {
    if (finished) return;
    const ctx = makeCtx();
    const requiredDifficulty = ctx.difficulty;
    const generated = getTask(ctx);
    generated.difficulty = requiredDifficulty;
    if (requiredDifficulty === "easy" && generated.difficulty !== "easy") {
      generated.difficulty = "easy";
    }
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
    const nextQuestionsAnswered = clampNumber(questionsAnsweredRef.current + 1, 0, MAX_LESSON_QUESTIONS);
    questionsAnsweredRef.current = nextQuestionsAnswered;
    setQuestionsAnswered(nextQuestionsAnswered);

    if (wasCorrect) {
      const nextCorrectAnswers = clampNumber(correctAnswersRef.current + 1, 0, MAX_LESSON_QUESTIONS);
      correctAnswersRef.current = nextCorrectAnswers;
      setCorrectAnswers(nextCorrectAnswers);
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
        progressPercent: Math.round((questionsAnsweredRef.current / MAX_LESSON_QUESTIONS) * 100),
        progressLabel: `Question ${questionNumber} of ${MAX_LESSON_QUESTIONS}`,
        skillTag: task.kind,
      });
    }
    const nextQuestionsAnswered = bumpSessionCounters(false);
    clearPendingTimeout();
    if (nextQuestionsAnswered >= MAX_LESSON_QUESTIONS) {
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
        progressPercent: Math.round((questionsAnsweredRef.current / MAX_LESSON_QUESTIONS) * 100),
        progressLabel: `Question ${questionNumber} of ${MAX_LESSON_QUESTIONS}`,
        skillTag: task.kind,
      });
    }
    const nextQuestionsAnswered = bumpSessionCounters(true);
    clearPendingTimeout();
    if (nextQuestionsAnswered >= MAX_LESSON_QUESTIONS) {
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
    task.kind === "groundMatch" ||
    task.kind === "groundCollect" ||
    task.kind === "groundBuild" ||
    task.kind === "groundFlash";
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
      ? hint ?? "✓ Correct! +10 XP"
      : status === "wrong"
        ? hint ?? "✗ Not quite — keep going!"
        : null;

  useEffect(() => {
    if (questionsAnswered > MAX_LESSON_QUESTIONS || correctAnswers > MAX_LESSON_QUESTIONS) {
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
  }, [correctAnswers, lessonTitle, questionsAnswered]);

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
      progressLabel: `Completed ${safeQuestionsAnswered} of ${MAX_LESSON_QUESTIONS} questions`,
    });
  }, [finished, liveContext, safeQuestionsAnswered]);

  // ── Finished state ──
  if (finished) {
    if (renderCompletionCard) {
      return <>{renderCompletionCard(summary)}</>;
    }

    return (
      <LessonCompleteCard
        lessonTitle={lessonTitle ?? "Practice Session"}
        questionsAnswered={safeQuestionsAnswered}
        correctAnswers={safeCorrectAnswers}
        accuracy={accuracy}
        onExit={onComplete}
      />
    );
  }

  // ── Active state ──
  const statusBorder =
    status === "correct"
      ? "border-emerald-300 shadow-emerald-100/50"
      : status === "wrong"
      ? "border-red-300 shadow-red-100/50"
      : "border-border/50";

  const feedbackOverlay =
    status === "correct"
      ? "bg-emerald-400/12"
      : status === "wrong"
      ? "bg-red-400/12"
      : "bg-transparent";

  const statusMotion = status === "wrong" ? "animate-[shake_0.35s_ease-in-out]" : "";

  return (
    <div className="relative">
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

      {/* Two-column landscape: sticky HUD rail + question workspace */}
      <div className="grid gap-3 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-5">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <LessonHUDRail
            lessonTitle={lessonTitle ?? null}
            correctAnswers={safeCorrectAnswers}
            questionsAnswered={safeQuestionsAnswered}
            accuracy={accuracy}
            secondsLeft={Math.max(0, secondsLeft)}
            totalSeconds={totalSeconds}
            xpTarget={MAX_LESSON_QUESTIONS}
            hint={hint}
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
            className={`rounded-[1.75rem] border-2 bg-card p-5 shadow-lg transition-all duration-300 ${statusBorder} ${statusMotion}`}
          >
        {/* Activity type label */}
        <div className="mb-3">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
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
                        <span key={di} className="inline-block h-5 w-5 rounded-full bg-teal-600" />
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
              <button onClick={check} className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xl hover:bg-teal-700 transition">Check</button>
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
                <button type="button" onClick={() => { speak(t.speechText ?? String(t.targetNumber)); setHasPlayed(true); }} className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xl hover:bg-teal-700 transition">🔊 Listen</button>
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
                <button type="button" onClick={() => speak(String(t.targetNumber))} className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition">🔊 Hear number</button>
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
