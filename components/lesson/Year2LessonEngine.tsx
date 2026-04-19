"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { LessonHUDRail } from "@/components/lesson/LessonHUDRail";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import {
  buildLessonActivityPool,
  generateQuestion,
  getLessonQuestionFingerprint,
  getLevelForLesson,
  type SupportedMathLevel,
  type Year2QuestionData,
} from "@/data/activities/year2/lessonEngine";
import { pickWeightedIndex } from "@/lib/weightedRandom";
import type { Lesson } from "@/data/programs/year1";

function buildInitialTurn(lesson: Lesson, activities: Lesson["activities"] = []) {
  const level = getLevelForLesson(lesson);
  return chooseNextLessonTurn(level, lesson, activities, [], null, [], 0);
}

function chooseNextLessonTurn(
  level: SupportedMathLevel,
  lesson: Lesson,
  activities: Lesson["activities"],
  currentBag: number[],
  lastIndex: number | null,
  history: QuestionHistoryEntry[],
  questionOrder: number
) {
  if (!activities || activities.length === 0) {
    return {
      bag: [] as number[],
      lastIndex: null as number | null,
      activityIndex: 0,
      question: null as Year2QuestionData | null,
      fingerprint: null as ReturnType<typeof getLessonQuestionFingerprint> | null,
      reused: false,
      fallbackReason: "",
    };
  }

  const weighted = pickWeightedIndex(activities, currentBag, lastIndex);
  const candidateIndexes = Array.from(
    new Set([weighted.index, ...activities.map((_, index) => index)].filter((index) => index >= 0))
  );

  let best:
    | {
        activityIndex: number;
        question: Year2QuestionData;
        fingerprint: ReturnType<typeof getLessonQuestionFingerprint>;
        score: number;
        reused: boolean;
        fallbackReason: string;
      }
    | null = null;

  for (const activityIndex of candidateIndexes) {
    const baseActivity = activities[activityIndex];
    if (!baseActivity) continue;
    const boardIndex =
      level === 4 && lesson.week === 8 ? Math.floor(questionOrder / 3) % 5 : null;
    const activity =
      boardIndex === null
        ? baseActivity
        : {
            ...baseActivity,
            config: { ...baseActivity.config, boardIndex },
          };

    for (let attempt = 0; attempt < CANDIDATES_PER_ACTIVITY; attempt += 1) {
      const question = generateQuestion(level, lesson, activity);
      const fingerprint = getLessonQuestionFingerprint(activity, question);
      const candidateScore = scoreQuestionCandidate(fingerprint, history, questionOrder);
      const candidate = {
        activityIndex,
        question,
        fingerprint,
        score: candidateScore.score,
        reused: candidateScore.reused,
        fallbackReason: candidateScore.fallbackReason,
      };

      if (!best || candidate.score < best.score) {
        best = candidate;
      }

      if (candidate.score === 0) {
        break;
      }
    }

    if (best?.score === 0) {
      break;
    }
  }

  const chosenActivityIndex = best?.activityIndex ?? weighted.index;
  let nextBag = currentBag.length > 0 ? [...currentBag] : [...weighted.bag];
  if (chosenActivityIndex === weighted.index) {
    nextBag = weighted.bag;
  } else {
    const bagIndex = nextBag.lastIndexOf(chosenActivityIndex);
    if (bagIndex >= 0) {
      nextBag.splice(bagIndex, 1);
    } else if (nextBag.length === 0) {
      nextBag = weighted.bag;
    }
  }

  return {
    bag: nextBag,
    lastIndex: chosenActivityIndex,
    activityIndex: chosenActivityIndex,
    question:
      best?.question ??
      generateQuestion(
        level,
        lesson,
        level === 4 && lesson.week === 8
          ? {
              ...activities[chosenActivityIndex]!,
              config: {
                ...activities[chosenActivityIndex]!.config,
                boardIndex: Math.floor(questionOrder / 3) % 5,
              },
            }
          : activities[chosenActivityIndex]!
      ),
    fingerprint: best?.fingerprint ?? null,
    reused: best?.reused ?? false,
    fallbackReason: best?.fallbackReason ?? "",
  };
}

const XP_TARGET = 5; // target questions per session for XP bar scaling
const QUESTION_COOLDOWN = 6;
const CANDIDATES_PER_ACTIVITY = 4;

type QuestionHistoryEntry = {
  fingerprint: string;
  templateFingerprint: string;
  order: number;
};

function scoreQuestionCandidate(
  fingerprint: ReturnType<typeof getLessonQuestionFingerprint>,
  history: QuestionHistoryEntry[],
  order: number
) {
  const exactSeen = history.find((entry) => entry.fingerprint === fingerprint.fingerprint);
  const templateSeen = history.find((entry) => entry.templateFingerprint === fingerprint.templateFingerprint);
  const recentExact = history.find(
    (entry) => entry.fingerprint === fingerprint.fingerprint && order - entry.order <= QUESTION_COOLDOWN
  );
  const recentTemplate = history.find(
    (entry) => entry.templateFingerprint === fingerprint.templateFingerprint && order - entry.order <= QUESTION_COOLDOWN
  );
  const lastExactOrder = exactSeen?.order ?? -1;
  const lastTemplateOrder = templateSeen?.order ?? -1;

  let score = 0;
  let reused = false;
  let fallbackReason = "";

  if (exactSeen) {
    reused = true;
    score += 100000;
    fallbackReason = "exact_fingerprint_seen";
  }
  if (recentExact) score += 50000;
  if (templateSeen) score += 500;
  if (recentTemplate) score += 200;
  if (lastExactOrder >= 0) score += Math.max(0, QUESTION_COOLDOWN - (order - lastExactOrder));
  if (lastTemplateOrder >= 0) score += Math.max(0, QUESTION_COOLDOWN - (order - lastTemplateOrder));

  return {
    score,
    reused,
    fallbackReason,
  };
}

export function Year2LessonEngine({
  lesson,
  onTimedComplete,
  onExit,
}: {
  lesson: Lesson;
  onTimedComplete: () => void;
  onExit: () => void;
}) {
  const totalSeconds = 8 * 60;
  const level = useMemo(() => getLevelForLesson(lesson), [lesson]);
  const lessonPool = useMemo(() => buildLessonActivityPool(level, lesson), [level, lesson]);
  const activities = lessonPool.activities;
  const initialTurn = useMemo(() => buildInitialTurn(lesson, activities), [activities, lesson]);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(initialTurn.activityIndex);
  const [currentQuestion, setCurrentQuestion] = useState<Year2QuestionData | null>(initialTurn.question);
  const [questionKey, setQuestionKey] = useState(0);
  const bagRef = useRef<number[]>(initialTurn.bag);
  const lastIndexRef = useRef<number | null>(initialTurn.lastIndex);
  const questionHistoryRef = useRef<QuestionHistoryEntry[]>(
    initialTurn.fingerprint
      ? [
          {
            fingerprint: initialTurn.fingerprint.fingerprint,
            templateFingerprint: initialTurn.fingerprint.templateFingerprint,
            order: 0,
          },
        ]
      : []
  );
  const questionOrderRef = useRef(initialTurn.question ? 1 : 0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markedCompleteRef = useRef(false);
  const scoredThisTurnRef = useRef(false);
  const finished = secondsLeft <= 0;
  const currentActivity = activities[currentActivityIndex] ?? null;
  const questionsAnsweredRef = useRef(0);

  const accuracy =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;

  function clearPendingTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function loadNextQuestion() {
    clearPendingTimeout();
    if (activities.length === 0) return;

    const nextTurn = chooseNextLessonTurn(
      level,
      lesson,
      activities,
      bagRef.current,
      lastIndexRef.current,
      questionHistoryRef.current,
      questionOrderRef.current
    );

    bagRef.current = nextTurn.bag;
    lastIndexRef.current = nextTurn.lastIndex;
    if (nextTurn.fingerprint) {
      questionHistoryRef.current = [
        ...questionHistoryRef.current,
        {
          fingerprint: nextTurn.fingerprint.fingerprint,
          templateFingerprint: nextTurn.fingerprint.templateFingerprint,
          order: questionOrderRef.current,
        },
      ];
      questionOrderRef.current += 1;
      if (process.env.NODE_ENV !== "production") {
        console.info("[LessonQuestionRepeatGuard]", {
          lessonId: lesson.id,
          fingerprint: nextTurn.fingerprint.fingerprint,
          templateFingerprint: nextTurn.fingerprint.templateFingerprint,
          reused: nextTurn.reused,
          fallbackReason: nextTurn.fallbackReason || null,
        });
      }
    }

    setCurrentActivityIndex(nextTurn.activityIndex);
    setCurrentQuestion(nextTurn.question);
    setQuestionKey((v) => v + 1);
    setStatus("idle");
    scoredThisTurnRef.current = false;
  }

  useEffect(() => {
    if (lessonPool.violations.length === 0) return;
    const summary = lessonPool.violations
      .map((v) => `${v.reason}: ${v.message}`)
      .join(" | ");
    console.error(`[Year2LessonPool] ${lesson.title}: ${summary}`);
  }, [lesson.title, lessonPool.violations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((c) => c - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      clearPendingTimeout();
    };
  }, []);

  useEffect(() => {
    if (!finished) return;
    if (!markedCompleteRef.current) {
      markedCompleteRef.current = true;
      onTimedComplete();
    }
  }, [finished, onTimedComplete]);

  function handleCorrect() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    clearPendingTimeout();
    setStatus("correct");
    questionsAnsweredRef.current += 1;
    setQuestionsAnswered((v) => v + 1);
    setCorrectAnswers((v) => v + 1);
    timeoutRef.current = setTimeout(() => loadNextQuestion(), 1000);
  }

  function handleWrong() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    clearPendingTimeout();
    setStatus("wrong");
    questionsAnsweredRef.current += 1;
    setQuestionsAnswered((v) => v + 1);
    timeoutRef.current = setTimeout(() => loadNextQuestion(), 1200);
  }

  const hint = currentQuestion
    ? (currentQuestion as Record<string, unknown>).helper as string | undefined ?? null
    : null;

  const activityLabel = currentActivity
    ? currentActivity.activityType.replace(/_/g, " ").toUpperCase()
    : "PRACTISE";

  // ── Finished state ──
  if (finished) {
    return (
      <LessonCompleteCard
        lessonTitle={lesson.title}
        questionsAnswered={questionsAnswered}
        correctAnswers={correctAnswers}
        accuracy={accuracy}
        onExit={onExit}
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

      <div className="grid gap-3 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-5">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <LessonHUDRail
            lessonTitle={lesson.title}
            correctAnswers={correctAnswers}
            questionsAnswered={questionsAnswered}
            accuracy={accuracy}
            secondsLeft={Math.max(0, secondsLeft)}
            totalSeconds={totalSeconds}
            xpTarget={Math.max(XP_TARGET, questionsAnswered + 2)}
            hint={hint}
          />
        </aside>

        <div className="min-w-0 space-y-3">
          {status !== "idle" && (
            <div
              className={`rounded-xl px-4 py-2.5 text-center text-sm font-extrabold shadow-sm transition-all ${
                status === "correct"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {status === "correct" ? "✓ Correct! +10 XP" : "✗ Not quite — keep going!"}
            </div>
          )}

          {currentActivity && currentQuestion ? (
            <div
              className={`rounded-[1.75rem] border-2 bg-card p-5 shadow-lg transition-all duration-300 ${statusBorder} ${statusMotion}`}
            >
              <div className="mb-3">
                <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {activityLabel}
                </span>
              </div>

              <LessonRenderer
                key={questionKey}
                activity={currentActivity}
                prompt={lesson.title}
                questionData={currentQuestion}
                renderMode="lesson"
                onCorrect={handleCorrect}
                onWrong={handleWrong}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              This lesson has no valid activities for the current policy. Check the lesson config or
              source activity pool.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
