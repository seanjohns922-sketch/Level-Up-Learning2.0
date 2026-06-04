"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { LessonHUDRail } from "@/components/lesson/LessonHUDRail";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import { ComboMilestonePop } from "@/components/lesson/ComboMilestonePop";
import SurgeAmbience from "@/components/lesson/SurgeAmbience";
import NexusActivation from "@/components/lesson/NexusActivation";
import ComboActivation from "@/components/lesson/ComboActivation";
import LessonReflection from "@/components/lesson/LessonReflection";
import BrainBreak from "@/components/lesson/BrainBreak";
import { pickVillain, BRAIN_BREAK_AT_SECONDS_LEFT, type Villain } from "@/lib/brain-break";
import { clearIdleLiveEventTimer, scheduleIdleLiveEvent, trackLiveLearningEvent } from "@/lib/live-class-client";
import { readBestChain, writeBestChain } from "@/lib/best-chain";
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

function getWorkingLevelForLesson(lesson: Lesson) {
  const yearMatch = lesson.id.match(/^y(\d+)-/);
  const yearNumber = yearMatch ? Number(yearMatch[1]) : 2;
  return yearNumber === 0 ? "Prep" : `Year ${yearNumber}`;
}

function buildInitialTurn(lesson: Lesson, activities: Lesson["activities"] = []) {
  const level = getLevelForLesson(lesson);
  return chooseNextLessonTurn(level, lesson, activities, [], null, [], 0);
}

function isOrderedStrategyFluencyLesson(level: SupportedMathLevel, lesson: Lesson) {
  return level === 5 && lesson.week === 11 && lesson.lesson === 2;
}

function isEstimateReasoningLesson(level: SupportedMathLevel, lesson: Lesson) {
  return level === 5 && lesson.week === 11 && lesson.lesson === 3;
}

function isMultiStepCalculationLesson(level: SupportedMathLevel, lesson: Lesson) {
  return level === 5 && lesson.week === 12 && lesson.lesson === 2;
}

function isYear6RealWorldModellingLesson(level: SupportedMathLevel, lesson: Lesson) {
  void level;
  return lesson.week === 12 && (lesson.lesson === 2 || lesson.lesson === 3);
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

  const orderedActivityIndex = isOrderedStrategyFluencyLesson(level, lesson)
    ? questionOrder % activities.length
    : isYear6RealWorldModellingLesson(level, lesson)
    ? questionOrder % activities.length
    : null;
  const weighted =
    orderedActivityIndex === null
      ? pickWeightedIndex(activities, currentBag, lastIndex)
      : { index: orderedActivityIndex, bag: currentBag };
  const candidateIndexes =
    orderedActivityIndex === null
      ? Array.from(
          new Set([weighted.index, ...activities.map((_, index) => index)].filter((index) => index >= 0))
        )
      : [orderedActivityIndex];

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
    const activityMode =
      typeof activity.config?.mode === "string" ? activity.config.mode : undefined;
    const activityUseCount = activityMode
      ? history.filter((entry) => entry.mode === activityMode).length
      : 0;
    const activityWithTemplateIndex = isYear6RealWorldModellingLesson(level, lesson)
      ? {
          ...activity,
          config: {
            ...activity.config,
            templateIndex: activityUseCount,
          },
        }
      : activity;

    for (let attempt = 0; attempt < CANDIDATES_PER_ACTIVITY; attempt += 1) {
      const question = generateQuestion(level, lesson, activityWithTemplateIndex);
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
          : isYear6RealWorldModellingLesson(level, lesson)
          ? {
              ...activities[chosenActivityIndex]!,
              config: {
                ...activities[chosenActivityIndex]!.config,
                templateIndex:
                  typeof activities[chosenActivityIndex]!.config?.mode === "string"
                    ? history.filter(
                        (entry) => entry.mode === activities[chosenActivityIndex]!.config.mode
                      ).length
                    : 0,
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
  numberSetFingerprint: string;
  mode: string;
  contextType: string;
  order: number;
};

type LessonAttemptEntry = {
  mode: string;
  topicLabel: string;
  questionType: string;
  correct: boolean;
  timeSpentSeconds: number;
};

export type LessonPerformanceTopicSummary = {
  label: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSpentSeconds: number;
};

export type LessonPerformanceSummary = {
  lessonTitle: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timeSpentSeconds: number;
  bestChain: number;
  topicSummaries: LessonPerformanceTopicSummary[];
  strengths: LessonPerformanceTopicSummary[];
  areasToImprove: LessonPerformanceTopicSummary[];
  struggledQuestionTypes: string[];
};

type LiveLessonContext = {
  level: string;
  strand: string;
  week: number;
  lessonId: string;
  lessonTitle: string;
};

function titleCaseWords(value: string) {
  return value
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatLessonTopicLabel(mode: string) {
  const byMode: Record<string, string> = {
    number_line: "Number Line",
    arrays: "Arrays",
    division_groups: "Division Groups",
    fact_family: "Fact Families",
    addition_strategy: "Addition",
    subtraction_strategy: "Subtraction",
    mixed_ops_addition: "Addition",
    mixed_ops_subtraction: "Subtraction",
    mixed_ops_multiplication: "Multiplication",
    mixed_ops_division: "Division",
    multi_step_calc_add_sub: "Add & Subtract",
    multi_step_calc_mult_div: "Multiply & Divide",
    multi_step_calc_mixed: "Mixed Steps",
  };

  return byMode[mode] ?? titleCaseWords(mode);
}

function getQuestionCorrectAnswer(question: Year2QuestionData | null) {
  if (!question) return null;
  if ("answer" in question && question.answer !== undefined && question.answer !== null) {
    return String(question.answer);
  }
  if ("answers" in question && Array.isArray(question.answers)) {
    return question.answers.join(" | ");
  }
  return null;
}

function getQuestionOptions(question: Year2QuestionData | null) {
  if (!question || !("options" in question) || !Array.isArray(question.options)) return [];
  return question.options
    .map((option) => String(option ?? "").trim())
    .filter((option) => option.length > 0);
}

function buildLessonPerformanceSummary({
  lessonTitle,
  attempts,
  questionsAnswered,
  correctAnswers,
  accuracy,
  timeSpentSeconds,
  bestChain,
}: {
  lessonTitle: string;
  attempts: LessonAttemptEntry[];
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timeSpentSeconds: number;
  bestChain: number;
}): LessonPerformanceSummary {
  const topicMap = new Map<string, LessonPerformanceTopicSummary>();
  const struggleMap = new Map<string, number>();

  for (const attempt of attempts) {
    const current = topicMap.get(attempt.topicLabel) ?? {
      label: attempt.topicLabel,
      correct: 0,
      total: 0,
      accuracy: 0,
      timeSpentSeconds: 0,
    };

    current.total += 1;
    current.timeSpentSeconds += attempt.timeSpentSeconds;
    if (attempt.correct) {
      current.correct += 1;
    } else {
      struggleMap.set(attempt.topicLabel, (struggleMap.get(attempt.topicLabel) ?? 0) + 1);
    }

    current.accuracy = current.total > 0 ? Math.round((current.correct / current.total) * 100) : 0;
    topicMap.set(attempt.topicLabel, current);
  }

  const topicSummaries = Array.from(topicMap.values()).sort((left, right) => right.total - left.total);
  const strengths = [...topicSummaries]
    .filter((item) => item.total > 0 && item.accuracy >= 75)
    .sort((left, right) => right.accuracy - left.accuracy || right.total - left.total)
    .slice(0, 3);
  const areasToImprove = [...topicSummaries]
    .filter((item) => item.total > 0 && item.accuracy < 75)
    .sort((left, right) => left.accuracy - right.accuracy || right.total - left.total)
    .slice(0, 3);
  const struggledQuestionTypes = Array.from(struggleMap.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([label]) => label)
    .slice(0, 4);

  return {
    lessonTitle,
    questionsAnswered,
    correctAnswers,
    accuracy,
    timeSpentSeconds,
    bestChain,
    topicSummaries,
    strengths,
    areasToImprove,
    struggledQuestionTypes,
  };
}

function scoreQuestionCandidate(
  fingerprint: ReturnType<typeof getLessonQuestionFingerprint>,
  history: QuestionHistoryEntry[],
  order: number
) {
  const exactSeen = history.find((entry) => entry.fingerprint === fingerprint.fingerprint);
  const templateSeen = history.find((entry) => entry.templateFingerprint === fingerprint.templateFingerprint);
  const numberSetSeen = history.find(
    (entry) => entry.numberSetFingerprint !== "" && entry.numberSetFingerprint === fingerprint.numberSetFingerprint
  );
  const contextSeen = history.find(
    (entry) => entry.contextType !== "none" && entry.contextType === fingerprint.contextType
  );
  const recentExact = history.find(
    (entry) => entry.fingerprint === fingerprint.fingerprint && order - entry.order <= QUESTION_COOLDOWN
  );
  const recentTemplate = history.find(
    (entry) => entry.templateFingerprint === fingerprint.templateFingerprint && order - entry.order <= QUESTION_COOLDOWN
  );
  const recentNumberSet = history.find(
    (entry) =>
      entry.numberSetFingerprint !== "" &&
      entry.numberSetFingerprint === fingerprint.numberSetFingerprint &&
      order - entry.order <= QUESTION_COOLDOWN
  );
  const recentContext = history.find(
    (entry) => entry.contextType !== "none" && entry.contextType === fingerprint.contextType && order - entry.order <= 3
  );
  const lastExactOrder = exactSeen?.order ?? -1;
  const lastTemplateOrder = templateSeen?.order ?? -1;
  const lastNumberSetOrder = numberSetSeen?.order ?? -1;
  const lastContextOrder = contextSeen?.order ?? -1;

  let score = 0;
  let reused = false;
  let fallbackReason = "";

  if (exactSeen) {
    reused = true;
    score += 100000;
    fallbackReason = "exact_fingerprint_seen";
  }
  if (recentExact) score += 50000;
  if (numberSetSeen) score += 2000;
  if (recentNumberSet) {
    reused = true;
    score += 75000;
    if (!fallbackReason) fallbackReason = "number_set_on_cooldown";
  }
  if (templateSeen) score += 500;
  if (recentTemplate) score += 200;
  if (contextSeen) score += 120;
  if (recentContext) score += 600;
  if (fingerprint.contextType !== "none") {
    const recentModeForNumberSet = history.find(
      (entry) =>
        entry.numberSetFingerprint !== "" &&
        entry.numberSetFingerprint === fingerprint.numberSetFingerprint &&
        entry.mode !== fingerprint.mode
    );
    if (recentModeForNumberSet) {
      score += 2500;
      if (!fallbackReason) fallbackReason = "number_set_used_in_other_mode";
    }
  }
  if (lastExactOrder >= 0) score += Math.max(0, QUESTION_COOLDOWN - (order - lastExactOrder));
  if (lastTemplateOrder >= 0) score += Math.max(0, QUESTION_COOLDOWN - (order - lastTemplateOrder));
  if (lastNumberSetOrder >= 0) {
    score += Math.max(0, QUESTION_COOLDOWN - (order - lastNumberSetOrder)) * 25;
  }
  if (lastContextOrder >= 0) {
    score += Math.max(0, 3 - (order - lastContextOrder)) * 15;
  }

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
  renderCompletionCard,
  onPerformanceSummary,
  liveContext,
  realmId,
  levelNumber,
}: {
  lesson: Lesson;
  onTimedComplete: () => void;
  onExit: () => void;
  renderCompletionCard?: (summary: LessonPerformanceSummary) => ReactNode;
  onPerformanceSummary?: (summary: LessonPerformanceSummary) => void;
  liveContext?: LiveLessonContext;
  realmId?: string;
  levelNumber?: number;
}) {
  const isMeasurement = realmId === "measurement";
  const totalSeconds = 9 * 60;
  const level = useMemo(() => getLevelForLesson(lesson), [lesson]);
  const workingLevel = useMemo(() => getWorkingLevelForLesson(lesson), [lesson]);
  const lessonPool = useMemo(() => buildLessonActivityPool(level, lesson), [level, lesson]);
  const activities = lessonPool.activities;
  const initialTurn = useMemo(() => buildInitialTurn(lesson, activities), [activities, lesson]);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [brainBreakVillain, setBrainBreakVillain] = useState<Villain | null>(null);
  const brainBreakDoneRef = useRef(false);
  const brainBreakActiveRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [reflectionDone, setReflectionDone] = useState(false);
  const bestChainRef = useRef(0);
  useEffect(() => {
    bestChainRef.current = readBestChain("number", workingLevel);
  }, [workingLevel]);
  function saveBestChain(chain: number) {
    if (chain > bestChainRef.current) {
      bestChainRef.current = chain;
      writeBestChain("number", workingLevel, chain);
    }
  }
  const [currentActivityIndex, setCurrentActivityIndex] = useState(initialTurn.activityIndex);
  const [currentQuestion, setCurrentQuestion] = useState<Year2QuestionData | null>(initialTurn.question);
  const [questionKey, setQuestionKey] = useState(0);
  const [currentQuestionSequence, setCurrentQuestionSequence] = useState(initialTurn.question ? 1 : 0);
  const bagRef = useRef<number[]>(initialTurn.bag);
  const lastIndexRef = useRef<number | null>(initialTurn.lastIndex);
  const questionHistoryRef = useRef<QuestionHistoryEntry[]>(
    initialTurn.fingerprint
      ? [
        {
          fingerprint: initialTurn.fingerprint.fingerprint,
          templateFingerprint: initialTurn.fingerprint.templateFingerprint,
          numberSetFingerprint: initialTurn.fingerprint.numberSetFingerprint,
          mode: initialTurn.fingerprint.mode,
          contextType: initialTurn.fingerprint.contextType,
          order: 0,
        },
      ]
      : []
  );
  const questionOrderRef = useRef(initialTurn.question ? 1 : 0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markedCompleteRef = useRef(false);
  const scoredThisTurnRef = useRef(false);
  const [attemptLog, setAttemptLog] = useState<LessonAttemptEntry[]>([]);
  const questionStartedAtElapsedRef = useRef(0);
  const finished = secondsLeft <= 0;
  const currentActivity = activities[currentActivityIndex] ?? null;
  const questionsAnsweredRef = useRef(0);
  const showMultiStepCalculationFeedback = isMultiStepCalculationLesson(level, lesson);
  const lastLoggedActivityIdRef = useRef<string | null>(null);

  const accuracy =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;
  const summary = useMemo(
    () =>
      buildLessonPerformanceSummary({
        lessonTitle: lesson.title,
        attempts: attemptLog,
        questionsAnswered,
        correctAnswers,
        accuracy,
        timeSpentSeconds: Math.max(0, totalSeconds - Math.max(0, secondsLeft)),
        bestChain: Math.max(bestChainRef.current, comboCount),
      }),
    [accuracy, attemptLog, comboCount, correctAnswers, lesson.title, questionsAnswered, secondsLeft, totalSeconds]
  );
  const emittedSummaryRef = useRef(false);

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
          numberSetFingerprint: nextTurn.fingerprint.numberSetFingerprint,
          mode: nextTurn.fingerprint.mode,
          contextType: nextTurn.fingerprint.contextType,
          order: questionOrderRef.current,
        },
      ];
      questionOrderRef.current += 1;
      if (process.env.NODE_ENV !== "production") {
        console.info("[LessonQuestionRepeatGuard]", {
          lessonId: lesson.id,
          fingerprint: nextTurn.fingerprint.fingerprint,
          templateFingerprint: nextTurn.fingerprint.templateFingerprint,
          numberSetFingerprint: nextTurn.fingerprint.numberSetFingerprint,
          mode: nextTurn.fingerprint.mode,
          contextType: nextTurn.fingerprint.contextType,
          reused: nextTurn.reused,
          fallbackReason: nextTurn.fallbackReason || null,
        });
      }
    }

    setCurrentActivityIndex(nextTurn.activityIndex);
    setCurrentQuestion(nextTurn.question);
    setCurrentQuestionSequence(questionOrderRef.current);
    setQuestionKey((v) => v + 1);
    setStatus("idle");
    scoredThisTurnRef.current = false;
    questionStartedAtElapsedRef.current = totalSeconds - secondsLeft;
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
      setSecondsLeft((c) => (brainBreakActiveRef.current ? c : c - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearPendingTimeout();
    };
  }, []);

  // Fire the brain break once at the 4:30 mark — pauses the lesson clock.
  useEffect(() => {
    if (finished || brainBreakDoneRef.current) return;
    if (secondsLeft <= BRAIN_BREAK_AT_SECONDS_LEFT && secondsLeft > 0) {
      brainBreakDoneRef.current = true;
      brainBreakActiveRef.current = true;
      setBrainBreakVillain(pickVillain(levelNumber ?? 2));
    }
  }, [secondsLeft, finished]);

  useEffect(() => {
    if (!finished || emittedSummaryRef.current) return;
    emittedSummaryRef.current = true;
    onPerformanceSummary?.(summary);
  }, [finished, onPerformanceSummary, summary]);

  useEffect(() => {
    if (!finished) return;
    if (!markedCompleteRef.current) {
      markedCompleteRef.current = true;
      onTimedComplete();
    }
  }, [finished, onTimedComplete]);

  useEffect(() => {
    if (!liveContext || !currentActivity || !currentQuestion) return;

    const mode =
      questionHistoryRef.current[questionHistoryRef.current.length - 1]?.mode ??
      ((currentActivity.config ?? {}) as { mode?: string }).mode ??
      currentActivity.activityType ??
      "practice";
    const activityLabel = formatLessonTopicLabel(mode);
    const activityId = `${liveContext.lessonId}:${currentActivity.activityType}:${currentActivityIndex}`;
    const questionId = `${liveContext.lessonId}-q${currentQuestionSequence}`;
    const progressPercent = Math.max(0, Math.min(100, Math.round((questionsAnsweredRef.current / 10) * 100)));
    if (lastLoggedActivityIdRef.current !== activityId) {
      lastLoggedActivityIdRef.current = activityId;
      void trackLiveLearningEvent({
        eventType: "activity_started",
        level: liveContext.level,
        strand: liveContext.strand,
        week: liveContext.week,
        lessonId: liveContext.lessonId,
        lessonTitle: liveContext.lessonTitle,
        activityId,
        activityLabel,
        questionId,
        questionText: currentQuestion.prompt,
        questionType: currentQuestion.kind,
        questionOptions: getQuestionOptions(currentQuestion),
        correctAnswer: getQuestionCorrectAnswer(currentQuestion),
        progressPercent,
        progressLabel: `Question ${currentQuestionSequence}`,
        skillTag: mode,
      });
    }
    void trackLiveLearningEvent({
      eventType: "question_loaded",
      level: liveContext.level,
      strand: liveContext.strand,
      week: liveContext.week,
      lessonId: liveContext.lessonId,
      lessonTitle: liveContext.lessonTitle,
      activityId,
      activityLabel,
      questionId,
      questionText: currentQuestion.prompt,
      questionType: currentQuestion.kind,
      questionOptions: getQuestionOptions(currentQuestion),
      correctAnswer: getQuestionCorrectAnswer(currentQuestion),
      progressPercent,
      progressLabel: `Question ${currentQuestionSequence}`,
      skillTag: mode,
    });
    scheduleIdleLiveEvent({
      level: liveContext.level,
      strand: liveContext.strand,
      week: liveContext.week,
      lessonId: liveContext.lessonId,
      lessonTitle: liveContext.lessonTitle,
      activityId,
      activityLabel,
      questionId,
      questionText: currentQuestion.prompt,
      questionType: currentQuestion.kind,
      progressPercent,
      progressLabel: `Question ${currentQuestionSequence}`,
      skillTag: mode,
    });
    return () => {
      clearIdleLiveEventTimer();
    };
  }, [currentActivity, currentActivityIndex, currentQuestion, currentQuestionSequence, liveContext]);

  function handleCorrect() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    const mode =
      questionHistoryRef.current[questionHistoryRef.current.length - 1]?.mode ??
      ((currentActivity?.config ?? {}) as { mode?: string }).mode ??
      currentActivity?.activityType ??
      "practice";
    setAttemptLog((current) => [...current, {
      mode,
      topicLabel: formatLessonTopicLabel(mode),
      questionType: currentQuestion?.kind ?? currentActivity?.activityType ?? "unknown",
      correct: true,
      timeSpentSeconds: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
    }]);
    clearPendingTimeout();
    setStatus("correct");
    if (liveContext) {
      const activityId = `${liveContext.lessonId}:${currentActivity?.activityType ?? "activity"}:${currentActivityIndex}`;
      void trackLiveLearningEvent({
        eventType: "answer_correct",
        level: liveContext.level,
        strand: liveContext.strand,
        week: liveContext.week,
        lessonId: liveContext.lessonId,
        lessonTitle: liveContext.lessonTitle,
        activityId,
        activityLabel: formatLessonTopicLabel(mode),
        questionId: `${liveContext.lessonId}-q${currentQuestionSequence}`,
        questionText: currentQuestion?.prompt,
        questionType: currentQuestion?.kind,
        questionOptions: getQuestionOptions(currentQuestion),
        correctAnswer: getQuestionCorrectAnswer(currentQuestion),
        isCorrect: true,
        timeOnQuestion: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
        attemptNumber: (questionsAnsweredRef.current ?? 0) + 1,
        progressPercent: Math.max(0, Math.min(100, Math.round((questionsAnsweredRef.current / 10) * 100))),
        progressLabel: `Question ${currentQuestionSequence}`,
        skillTag: mode,
      });
    }
    questionsAnsweredRef.current += 1;
    setQuestionsAnswered((v) => v + 1);
    setCorrectAnswers((v) => v + 1);
    const newChain = comboCount + 1;
    saveBestChain(newChain);
    setComboCount(newChain);
    timeoutRef.current = setTimeout(() => loadNextQuestion(), 1000);
  }

  function handleWrong() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    const mode =
      questionHistoryRef.current[questionHistoryRef.current.length - 1]?.mode ??
      ((currentActivity?.config ?? {}) as { mode?: string }).mode ??
      currentActivity?.activityType ??
      "practice";
    setAttemptLog((current) => [...current, {
      mode,
      topicLabel: formatLessonTopicLabel(mode),
      questionType: currentQuestion?.kind ?? currentActivity?.activityType ?? "unknown",
      correct: false,
      timeSpentSeconds: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
    }]);
    clearPendingTimeout();
    setStatus("wrong");
    if (liveContext) {
      const activityId = `${liveContext.lessonId}:${currentActivity?.activityType ?? "activity"}:${currentActivityIndex}`;
      void trackLiveLearningEvent({
        eventType: "answer_incorrect",
        level: liveContext.level,
        strand: liveContext.strand,
        week: liveContext.week,
        lessonId: liveContext.lessonId,
        lessonTitle: liveContext.lessonTitle,
        activityId,
        activityLabel: formatLessonTopicLabel(mode),
        questionId: `${liveContext.lessonId}-q${currentQuestionSequence}`,
        questionText: currentQuestion?.prompt,
        questionType: currentQuestion?.kind,
        questionOptions: getQuestionOptions(currentQuestion),
        correctAnswer: getQuestionCorrectAnswer(currentQuestion),
        isCorrect: false,
        timeOnQuestion: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
        attemptNumber: (questionsAnsweredRef.current ?? 0) + 1,
        progressPercent: Math.max(0, Math.min(100, Math.round((questionsAnsweredRef.current / 10) * 100))),
        progressLabel: `Question ${currentQuestionSequence}`,
        skillTag: mode,
      });
    }
    questionsAnsweredRef.current += 1;
    setQuestionsAnswered((v) => v + 1);
    saveBestChain(comboCount);
    setComboCount(0);
    timeoutRef.current = setTimeout(() => loadNextQuestion(), 1200);
  }

  const hint = currentQuestion
    ? (currentQuestion as Record<string, unknown>).helper as string | undefined ?? null
    : null;

  const activityLabel = currentActivity
    ? currentActivity.activityType.replace(/_/g, " ").toUpperCase()
    : "PRACTISE";
  const showStrategySwitchPrompt =
    isOrderedStrategyFluencyLesson(level, lesson) && questionsAnswered === 4 && status === "idle";
  const showEstimatePrompt =
    isEstimateReasoningLesson(level, lesson) && questionsAnswered === 4 && status === "idle";

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
      progressLabel: `Completed ${questionsAnswered} questions`,
    });
  }, [finished, liveContext, questionsAnswered]);

  // ── Finished state ──
  if (finished) {
    if (!reflectionDone) {
      return (
        <LessonReflection
          lessonId={liveContext?.lessonId ?? lesson.id}
          lessonTitle={lesson.title}
          level={liveContext?.level ?? ""}
          week={liveContext?.week ?? 0}
          accuracy={accuracy}
          questionsAnswered={questionsAnswered}
          onComplete={() => setReflectionDone(true)}
        />
      );
    }

    if (renderCompletionCard) {
      return <>{renderCompletionCard(summary)}</>;
    }

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
  function getComboBorder(count: number) {
    if (isMeasurement) {
      if (count >= 10) return "border-amber-400/60 ring-2 ring-amber-300/40 ring-offset-2 ring-offset-amber-950 nexus-card-glow";
      if (count >= 8)  return "border-orange-300/70 shadow-[0_0_22px_rgba(251,146,60,0.35)]";
      if (count >= 5)  return "border-amber-400/60 shadow-[0_0_22px_rgba(200,160,48,0.35)]";
      if (count >= 3)  return "border-amber-600/40 shadow-[0_0_18px_rgba(180,120,20,0.28)]";
      return "border-amber-800/20";
    }
    if (count >= 10) return "border-teal-300 ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-slate-950 nexus-card-glow";
    if (count >= 8)  return "border-orange-300/80 shadow-[0_0_22px_rgba(251,146,60,0.4)]";
    if (count >= 5)  return "border-yellow-300/80 shadow-[0_0_22px_rgba(253,224,71,0.4)]";
    if (count >= 3)  return "border-teal-300/70 shadow-[0_0_22px_rgba(94,234,212,0.35)]";
    return "border-border/50";
  }

  const isNexus = comboCount >= 10;

  const statusBorder =
    status === "correct" && isNexus
      ? isMeasurement
        ? "border-amber-400/60 nexus-correct-pulse ring-2 ring-amber-300/40 ring-offset-2 ring-offset-amber-950"
        : "border-teal-300 nexus-correct-pulse ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-slate-950"
      : status === "correct"
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
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        @keyframes nexusCardGlow {
          0%, 100% { box-shadow: 0 0 38px rgba(45,212,191,0.65), 0 0 70px rgba(45,212,191,0.3), inset 0 0 20px rgba(45,212,191,0.07); }
          50% { box-shadow: 0 0 64px rgba(45,212,191,0.95), 0 0 120px rgba(45,212,191,0.5), inset 0 0 32px rgba(45,212,191,0.12); }
        }
        @keyframes nexusCorrectPulse {
          0% { box-shadow: 0 0 0 0 rgba(45,212,191,0.8); }
          70% { box-shadow: 0 0 0 20px rgba(45,212,191,0); }
          100% { box-shadow: 0 0 0 0 rgba(45,212,191,0); }
        }
        @keyframes nexusBadgePulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        .nexus-card-glow {
          animation: nexusCardGlow 2s ease-in-out infinite;
        }
        .nexus-correct-pulse {
          animation: nexusCorrectPulse 0.6s ease-out forwards;
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
            comboCount={comboCount}
            realmId={realmId}
          />
        </aside>

        <div className="min-w-0 space-y-3">
          {showStrategySwitchPrompt ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-800 shadow-sm">
              Try a different strategy for the next question.
            </div>
          ) : null}
          {showEstimatePrompt ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-800 shadow-sm">
              Estimate first — then decide.
            </div>
          ) : null}

          {status !== "idle" && (
            <div
              className={`rounded-xl px-4 py-2.5 text-center text-sm font-extrabold shadow-sm transition-all ${
                status === "correct"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {status === "correct"
                ? showMultiStepCalculationFeedback
                  ? "Nice — well worked."
                  : "✓ Correct! +10 XP"
                : showMultiStepCalculationFeedback
                ? "Check each step carefully."
                : "✗ Not quite — keep going!"}
            </div>
          )}

          {currentActivity && currentQuestion ? (
            <ComboMilestonePop comboCount={comboCount}>
              <div
                className={`rounded-[1.75rem] border-2 p-5 shadow-lg transition-all duration-500 ${statusBorder} ${statusMotion}`}
                style={isMeasurement ? { background: "#fdf6e8" } : undefined}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
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
                    {activityLabel}
                  </span>
                  {isNexus && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                      style={isMeasurement ? {
                        background: "rgba(44,15,5,0.85)",
                        border: "1px solid rgba(200,160,48,0.45)",
                        color: "rgba(240,210,150,1)",
                        textShadow: "0 0 10px rgba(200,160,48,0.7)",
                        boxShadow: "0 0 12px rgba(200,160,48,0.25)",
                        animation: "nexusBadgePulse 2s ease-in-out infinite",
                      } : {
                        background: "rgba(4,47,46,0.85)",
                        border: "1px solid rgba(45,212,191,0.5)",
                        color: "rgba(94,234,212,1)",
                        textShadow: "0 0 10px rgba(45,212,191,0.8)",
                        boxShadow: "0 0 12px rgba(45,212,191,0.3)",
                        animation: "nexusBadgePulse 2s ease-in-out infinite",
                      }}
                    >
                      {isMeasurement ? "✦ Surge State" : "⚡ Nexus State"}
                    </span>
                  )}
                </div>

                <LessonRenderer
                  key={questionKey}
                  activity={currentActivity}
                  prompt={lesson.title}
                  questionData={currentQuestion}
                  renderMode="lesson"
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                  realmId={realmId}
                />
              </div>
            </ComboMilestonePop>
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
