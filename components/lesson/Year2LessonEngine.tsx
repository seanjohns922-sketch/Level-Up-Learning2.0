"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkle, Zap } from "lucide-react";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { LessonHUDRail } from "@/components/lesson/LessonHUDRail";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import { ComboMilestonePop } from "@/components/lesson/ComboMilestonePop";
import SurgeAmbience from "@/components/lesson/SurgeAmbience";
import NexusActivation from "@/components/lesson/NexusActivation";
import ComboActivation from "@/components/lesson/ComboActivation";
import LessonReflection from "@/components/lesson/LessonReflection";
import LessonCoachReview from "@/components/lesson/LessonCoachReview";
import MistakeReviewPanel, { type MistakeReviewItem } from "@/components/review/MistakeReviewPanel";
import { buildCoachReview } from "@/lib/lesson-coach";
import LessonResumeGate from "@/components/lesson/LessonResumeGate";
import {
  clearLessonResume,
  getOrCreateLessonSessionId,
  loadLessonResume,
  lessonResumeHasProgress,
  saveLessonResume,
  startNewLessonSession,
} from "@/lib/resume-state";
import BrainBreak from "@/components/lesson/BrainBreak";
import { pickVillain, type Villain } from "@/lib/brain-break";
import { getBrainBreakSchedule, type BrainBreakFrequency } from "@/lib/brain-break-settings";
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
import { isLessonQuestionSafe } from "@/lib/task-safety";

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
      if (!isLessonQuestionSafe(activityWithTemplateIndex, question)) {
        continue;
      }
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

type LessonTurnState =
  | "answering"
  | "feedback_correct"
  | "feedback_incorrect"
  | "advancing"
  | "advance_error";

type GuidedWrongFeedback = {
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
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
  if ("correctAnswers" in question && Array.isArray(question.correctAnswers)) {
    return question.correctAnswers.join(", ");
  }
  if ("correctOrder" in question && Array.isArray(question.correctOrder)) {
    return question.correctOrder.join(" → ");
  }
  if ("expected" in question && typeof question.expected === "number") {
    return String(question.expected);
  }
  if ("answer" in question && question.answer !== undefined && question.answer !== null) {
    return String(question.answer);
  }
  if ("answers" in question && Array.isArray(question.answers)) {
    return question.answers.join(" | ");
  }
  const data = question as unknown as Record<string, unknown>;
  if (Array.isArray(data.sets)) {
    const matches = data.sets
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const set = entry as Record<string, unknown>;
        const values = [set.fraction, set.decimal, set.percent].filter(
          (value): value is string => typeof value === "string"
        );
        return values.length > 0 ? values.join(" = ") : null;
      })
      .filter((value): value is string => Boolean(value));
    if (matches.length > 0) return matches.join("; ");
  }
  if (Array.isArray(data.values)) {
    const placements = data.values
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const value = entry as Record<string, unknown>;
        return typeof value.label === "string" && typeof value.category === "string"
          ? `${value.label} → ${value.category}`
          : null;
      })
      .filter((value): value is string => Boolean(value));
    if (placements.length > 0) return placements.join(", ");
  }
  for (const key of [
    "correctAnswer",
    "correctOptionId",
    "correctChoiceId",
    "correctModelId",
    "correctLabel",
    "correctOperation",
    "correctReason",
    "targetNumber",
  ]) {
    const value = data[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }
  return null;
}

function getQuestionExplanation(question: Year2QuestionData | null, correctAnswer: string) {
  if (!question) return `The correct answer is ${correctAnswer}.`;
  const questionRecord = question as unknown as Record<string, unknown>;
  const mabVisual =
    question.kind === "typed_response" && question.visual?.type === "mab"
      ? question.visual as typeof question.visual & { placeValues?: string[] }
      : question.kind === "place_value_builder"
        ? questionRecord as {
            placeValues?: string[];
            hundredThousands?: number;
            tenThousands?: number;
            thousands?: number;
            hundreds?: number;
            tens?: number;
            ones?: number;
          }
        : null;
  if (mabVisual) {
    const places = [
      ["hundred_thousands", mabVisual.hundredThousands, 100000, "hundred thousand"],
      ["ten_thousands", mabVisual.tenThousands, 10000, "ten thousand"],
      ["thousands", mabVisual.thousands, 1000, "thousand"],
      ["hundreds", mabVisual.hundreds, 100, "hundred"],
      ["tens", mabVisual.tens, 10, "ten"],
      ["ones", mabVisual.ones, 1, "one"],
    ] as const;
    const shown = places.filter(
      ([place, count]) =>
        (!mabVisual.placeValues || mabVisual.placeValues.includes(place)) &&
        typeof count === "number" &&
        count > 0
    );
    if (shown.length > 0) {
      const expanded = shown
        .map(([, count, multiplier]) => ((count ?? 0) * multiplier).toLocaleString("en-AU"))
        .join(" + ");
      const working = shown
        .map(([, count, multiplier, label]) =>
          `${count} ${count === 1 ? label : `${label}s`} = ${((count ?? 0) * multiplier).toLocaleString("en-AU")}`
        )
        .join("\n");
      return `${working}\n\n${expanded} = ${correctAnswer}.`;
    }
  }
  if ("helper" in question && typeof question.helper === "string" && question.helper.trim()) {
    return question.helper;
  }
  return `The correct answer is ${correctAnswer}. Check the model and the value of each part.`;
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
  sessionScopeKey,
  realmId,
  levelNumber,
  practisedSkills,
  nextUpLabel,
  brainBreakFrequency = "normal",
}: {
  lesson: Lesson;
  onTimedComplete: () => void;
  onExit: () => void;
  renderCompletionCard?: (summary: LessonPerformanceSummary) => ReactNode;
  onPerformanceSummary?: (summary: LessonPerformanceSummary) => void;
  liveContext?: LiveLessonContext;
  sessionScopeKey?: string;
  realmId?: string;
  levelNumber?: number;
  practisedSkills?: string[];
  nextUpLabel?: string;
  brainBreakFrequency?: BrainBreakFrequency;
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
  const brainBreakSchedule = useMemo(
    () => getBrainBreakSchedule(levelNumber, brainBreakFrequency),
    [levelNumber, brainBreakFrequency]
  );
  const nextBreakIdxRef = useRef(0);
  const lastVillainIdRef = useRef<string | null>(null);
  const lastVillainGameRef = useRef<Villain["game"] | null>(null);
  const brainBreakActiveRef = useRef(false);
  const [turnState, setTurnState] = useState<LessonTurnState>("answering");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [coachDone, setCoachDone] = useState(false);
  const [lessonMistakeReviewDone, setLessonMistakeReviewDone] = useState(false);
  const [showLessonMistakeReview, setShowLessonMistakeReview] = useState(false);
  const [lessonMistakes, setLessonMistakes] = useState<MistakeReviewItem[]>([]);
  const [wrongFeedback, setWrongFeedback] = useState<GuidedWrongFeedback | null>(null);
  const [reflectionDone, setReflectionDone] = useState(false);
  // ── Lesson save & resume ──
  const resumeLessonKey = liveContext?.lessonId ?? lesson.id;
  const completionSessionKey = sessionScopeKey ?? resumeLessonKey;
  const lessonSessionIdRef = useRef(getOrCreateLessonSessionId(completionSessionKey));
  const [showLessonResume, setShowLessonResume] = useState(false);
  const resumeResolvedRef = useRef(false);
  const showLessonResumeRef = useRef(false);
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
  const feedbackLockRef = useRef<"idle" | "correct" | "incorrect">("idle");
  const markedCompleteRef = useRef(false);
  const scoredThisTurnRef = useRef(false);
  const advanceRequestedRef = useRef(false);
  const [attemptLog, setAttemptLog] = useState<LessonAttemptEntry[]>([]);
  const questionStartedAtElapsedRef = useRef(0);
  const finished = secondsLeft <= 0;
  const currentActivity = activities[currentActivityIndex] ?? null;
  const currentTurnSafe =
    currentActivity !== null &&
    currentQuestion !== null &&
    isLessonQuestionSafe(currentActivity, currentQuestion);
  const questionsAnsweredRef = useRef(0);
  const invalidRecoveryCountRef = useRef(0);
  const showMultiStepCalculationFeedback = isMultiStepCalculationLesson(level, lesson);
  const lastLoggedActivityIdRef = useRef<string | null>(null);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const status: "idle" | "correct" | "wrong" =
    turnState === "feedback_correct" ||
    (turnState === "advance_error" && feedbackLockRef.current === "correct")
      ? "correct"
      : turnState === "feedback_incorrect" ||
          (turnState === "advance_error" && feedbackLockRef.current === "incorrect")
        ? "wrong"
        : "idle";
  const taskLocked = turnState !== "answering";

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

  function loadNextQuestion({ fromFeedbackButton = false }: { fromFeedbackButton?: boolean } = {}) {
    if (feedbackLockRef.current !== "idle" && !fromFeedbackButton) return false;

    try {
      if (activities.length === 0) {
        throw new Error("Lesson activity pool is empty");
      }
      const nextTurn = chooseNextLessonTurn(
        level,
        lesson,
        activities,
        bagRef.current,
        lastIndexRef.current,
        questionHistoryRef.current,
        questionOrderRef.current
      );
      const nextActivity = activities[nextTurn.activityIndex];
      if (!nextActivity || !nextTurn.question || !isLessonQuestionSafe(nextActivity, nextTurn.question)) {
        throw new Error("Generated lesson turn failed safety validation");
      }

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
      feedbackLockRef.current = "idle";
      scoredThisTurnRef.current = false;
      advanceRequestedRef.current = false;
      setTurnState("answering");
      setAdvanceError(null);
      setWrongFeedback(null);
      questionStartedAtElapsedRef.current = totalSeconds - secondsLeft;
      return true;
    } catch (error) {
      advanceRequestedRef.current = false;
      setTurnState("advance_error");
      setAdvanceError("Something went wrong loading the next question.");
      console.error("[LessonTurnAdvanceFailed]", {
        realmId,
        lessonId: lesson.id,
        level,
        week: lesson.week,
        lesson: lesson.lesson,
        taskType: currentActivity?.activityType ?? "unknown",
        taskId: `${lesson.id}:${currentActivity?.activityType ?? "unknown"}:${currentActivityIndex}`,
        sessionId: lessonSessionIdRef.current,
        turnId: currentQuestionSequence,
        error: error instanceof Error ? error.message : "Unknown generation error",
      });
      return false;
    }
  }

  useEffect(() => {
    if (lessonPool.violations.length === 0) return;
    const summary = lessonPool.violations
      .map((v) => `${v.reason}: ${v.message}`)
      .join(" | ");
    console.error(`[Year2LessonPool] ${lesson.title}: ${summary}`);
  }, [lesson.title, lessonPool.violations]);

  useEffect(() => {
    if (finished || activities.length === 0) return;
    if (showLessonResumeRef.current || brainBreakActiveRef.current) return;
    if (currentTurnSafe) {
      invalidRecoveryCountRef.current = 0;
      return;
    }
    if (invalidRecoveryCountRef.current >= 3) {
      return;
    }
    invalidRecoveryCountRef.current += 1;
    const timeout = window.setTimeout(() => loadNextQuestion(), 0);
    return () => window.clearTimeout(timeout);
    // loadNextQuestion intentionally reads the latest generated-turn refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities.length, currentTurnSafe, finished]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((c) =>
        brainBreakActiveRef.current || showLessonResumeRef.current ? c : c - 1
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Resume gate: load a saved snapshot once and offer to continue ──
  useEffect(() => {
    const snap = loadLessonResume(resumeLessonKey);
    if (lessonResumeHasProgress(snap)) {
      setShowLessonResume(true);
      showLessonResumeRef.current = true;
    } else {
      resumeResolvedRef.current = true;
    }
  }, [resumeLessonKey]);

  function resumeLesson() {
    const snap = loadLessonResume(resumeLessonKey);
    if (snap) {
      setSecondsLeft(snap.secondsLeft);
      setQuestionsAnswered(snap.questionsAnswered);
      questionsAnsweredRef.current = snap.questionsAnswered;
      setCorrectAnswers(snap.correctAnswers);
      setComboCount(snap.comboCount);
      setLessonMistakes(snap.lessonMistakes ?? []);
      setAttemptLog(
        (snap.attemptLog ?? []).map((entry) => ({
          mode: entry.topicLabel,
          topicLabel: entry.topicLabel,
          questionType: "resumed",
          correct: entry.correct,
          timeSpentSeconds: entry.timeSpentSeconds,
        }))
      );
      if (typeof snap.activityIndex === "number" && activities[snap.activityIndex]) {
        setCurrentActivityIndex(snap.activityIndex);
      }
      if (snap.sessionId) lessonSessionIdRef.current = snap.sessionId;
      if (snap.currentQuestion) setCurrentQuestion(snap.currentQuestion as Year2QuestionData);
      if (Array.isArray(snap.questionBag)) bagRef.current = snap.questionBag;
      if (typeof snap.lastActivityIndex === "number" || snap.lastActivityIndex === null) {
        lastIndexRef.current = snap.lastActivityIndex;
      }
      if (Array.isArray(snap.questionHistory)) {
        questionHistoryRef.current = snap.questionHistory as QuestionHistoryEntry[];
      }
      if (typeof snap.questionOrder === "number") questionOrderRef.current = snap.questionOrder;
      if (typeof snap.questionSequence === "number") setCurrentQuestionSequence(snap.questionSequence);
      if (typeof snap.questionKey === "number") setQuestionKey(snap.questionKey);
      setTurnState(
        snap.feedbackStatus === "wrong"
          ? "feedback_incorrect"
          : snap.feedbackStatus === "correct"
            ? "feedback_correct"
            : "answering"
      );
      if (snap.wrongFeedback) setWrongFeedback(snap.wrongFeedback);
      feedbackLockRef.current =
        snap.feedbackStatus === "wrong"
          ? "incorrect"
          : snap.feedbackStatus === "correct"
            ? "correct"
            : "idle";
      scoredThisTurnRef.current = snap.scoredCurrentTurn === true;
      advanceRequestedRef.current = false;
      setCoachDone(snap.coachDone === true);
      setLessonMistakeReviewDone(snap.mistakeReviewDone === true);
      setShowLessonMistakeReview(snap.showMistakeReview === true);
      nextBreakIdxRef.current = brainBreakSchedule.filter((t) => snap.secondsLeft <= t).length;
    }
    setShowLessonResume(false);
    showLessonResumeRef.current = false;
    resumeResolvedRef.current = true;
  }

  function restartLesson() {
    clearLessonResume(resumeLessonKey);
    lessonSessionIdRef.current = startNewLessonSession(completionSessionKey);
    const nextTurn = buildInitialTurn(lesson, activities);
    setSecondsLeft(totalSeconds);
    setQuestionsAnswered(0);
    questionsAnsweredRef.current = 0;
    setCorrectAnswers(0);
    setComboCount(0);
    setCoachDone(false);
    setReflectionDone(false);
    feedbackLockRef.current = "idle";
    setTurnState("answering");
    setAdvanceError(null);
    setWrongFeedback(null);
    scoredThisTurnRef.current = false;
    advanceRequestedRef.current = false;
    setCurrentActivityIndex(nextTurn.activityIndex);
    setCurrentQuestion(nextTurn.question);
    setQuestionKey((current) => current + 1);
    setCurrentQuestionSequence(nextTurn.question ? 1 : 0);
    bagRef.current = nextTurn.bag;
    lastIndexRef.current = nextTurn.lastIndex;
    questionHistoryRef.current = nextTurn.fingerprint ? [{
      fingerprint: nextTurn.fingerprint.fingerprint,
      templateFingerprint: nextTurn.fingerprint.templateFingerprint,
      numberSetFingerprint: nextTurn.fingerprint.numberSetFingerprint,
      mode: nextTurn.fingerprint.mode,
      contextType: nextTurn.fingerprint.contextType,
      order: 0,
    }] : [];
    questionOrderRef.current = nextTurn.question ? 1 : 0;
    setLessonMistakes([]);
    setLessonMistakeReviewDone(false);
    setShowLessonMistakeReview(false);
    setAttemptLog([]);
    setShowLessonResume(false);
    showLessonResumeRef.current = false;
    resumeResolvedRef.current = true;
  }

  // Auto-save a snapshot as the clock ticks (after the resume gate resolves).
  useEffect(() => {
    if (!resumeResolvedRef.current || finished || brainBreakActiveRef.current) return;
    saveLessonResume({
      lessonKey: resumeLessonKey,
      secondsLeft,
      questionsAnswered,
      correctAnswers,
      comboCount,
      lessonMistakes,
      attemptLog,
      activityIndex: currentActivityIndex,
      sessionId: lessonSessionIdRef.current,
      currentQuestion,
      questionBag: bagRef.current,
      lastActivityIndex: lastIndexRef.current,
      questionHistory: questionHistoryRef.current,
      questionOrder: questionOrderRef.current,
      questionSequence: currentQuestionSequence,
      questionKey,
      feedbackStatus: status,
      wrongFeedback,
      scoredCurrentTurn: scoredThisTurnRef.current,
      coachDone,
      mistakeReviewDone: lessonMistakeReviewDone,
      showMistakeReview: showLessonMistakeReview,
      updatedAt: Date.now(),
    });
  }, [resumeLessonKey, secondsLeft, finished, questionsAnswered, correctAnswers, comboCount, lessonMistakes, attemptLog, currentActivityIndex, currentQuestion, currentQuestionSequence, questionKey, status, wrongFeedback, coachDone, lessonMistakeReviewDone, showLessonMistakeReview]);

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
      const villain = pickVillain(levelNumber ?? 2, {
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
    if (!finished) return;
    if (!markedCompleteRef.current) {
      markedCompleteRef.current = true;
      onTimedComplete();
    }
  }, [finished, onTimedComplete, resumeLessonKey]);

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
    const progressPercent = Math.max(0, Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)));
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
    if (finished || turnState !== "answering" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    feedbackLockRef.current = "correct";
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
    setTurnState("feedback_correct");
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
        progressPercent: Math.max(0, Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))),
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
  }

  function handleWrong(studentAnswer?: string) {
    if (finished || turnState !== "answering" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    const mode =
      questionHistoryRef.current[questionHistoryRef.current.length - 1]?.mode ??
      ((currentActivity?.config ?? {}) as { mode?: string }).mode ??
      currentActivity?.activityType ??
      "practice";
    const topicLabel = formatLessonTopicLabel(mode);
    const questionNumber = questionsAnsweredRef.current + 1;
    const submittedAnswer = studentAnswer?.trim() || "Submitted response";
    const correctAnswer = getQuestionCorrectAnswer(currentQuestion) ?? "See the worked correction";
    const explanation = getQuestionExplanation(currentQuestion, correctAnswer);
    feedbackLockRef.current = "incorrect";
    setWrongFeedback({ studentAnswer: submittedAnswer, correctAnswer, explanation });
    setLessonMistakes((current) => [
      ...current,
      {
        id: `${resumeLessonKey}-mistake-${questionNumber}`,
        questionNumber,
        prompt: currentQuestion?.prompt ?? topicLabel,
        studentAnswer: submittedAnswer,
        correctAnswer,
        explanation,
        taskId: `${resumeLessonKey}-q${currentQuestionSequence}`,
        taskData: currentQuestion,
        week: liveContext?.week ?? lesson.week ?? null,
        lesson: lesson.lesson ?? null,
        lessonTitle: lesson.title,
        skillLabel: topicLabel,
      },
    ]);
    setAttemptLog((current) => [...current, {
      mode,
      topicLabel,
      questionType: currentQuestion?.kind ?? currentActivity?.activityType ?? "unknown",
      correct: false,
      timeSpentSeconds: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
    }]);
    setTurnState("feedback_incorrect");
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
        selectedAnswer: submittedAnswer,
        correctAnswer: getQuestionCorrectAnswer(currentQuestion),
        isCorrect: false,
        timeOnQuestion: Math.max(1, totalSeconds - secondsLeft - questionStartedAtElapsedRef.current),
        attemptNumber: (questionsAnsweredRef.current ?? 0) + 1,
        progressPercent: Math.max(0, Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))),
        progressLabel: `Question ${currentQuestionSequence}`,
        skillTag: mode,
      });
    }
    saveBestChain(comboCount);
    setComboCount(0);
  }

  function handleNextQuestion() {
    const acceptedResult = feedbackLockRef.current;
    if (acceptedResult === "idle" || advanceRequestedRef.current) return;
    advanceRequestedRef.current = true;
    setTurnState("advancing");
    const advanced = loadNextQuestion({ fromFeedbackButton: true });
    if (advanced && acceptedResult === "incorrect") {
      questionsAnsweredRef.current += 1;
      setQuestionsAnswered((value) => value + 1);
    }
  }

  function handleRetryQuestion() {
    if (feedbackLockRef.current !== "idle") {
      handleNextQuestion();
      return;
    }
    if (advanceRequestedRef.current) return;
    advanceRequestedRef.current = true;
    setTurnState("advancing");
    loadNextQuestion();
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
      questionsAnswered,
      totalQuestions: questionsAnswered,
      correctCount: correctAnswers,
      correctAnswers,
    });
  }, [correctAnswers, finished, liveContext, questionsAnswered]);

  // ── Finished state ──
  if (finished) {
    // Coach Review (performance guidance) shows first for every lesson, then
    // the Reflection (celebration + confidence) or a bespoke completion card.
    if (!coachDone) {
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
            lessonId: liveContext?.lessonId ?? lesson.id,
          })}
          levelNumber={levelNumber}
          realmId={realmId}
          onContinue={() => setCoachDone(true)}
        />
      );
    }
    if (showLessonMistakeReview) {
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
    if (lessonMistakes.length > 0 && !lessonMistakeReviewDone) {
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
    if (!renderCompletionCard && !reflectionDone) {
      return (
        <LessonReflection
          lessonId={liveContext?.lessonId ?? lesson.id}
          lessonTitle={lesson.title}
          level={liveContext?.level ?? ""}
          levelNumber={levelNumber}
          week={liveContext?.week ?? 0}
          accuracy={accuracy}
          questionsAnswered={questionsAnswered}
          correctAnswers={correctAnswers}
          bestChain={Math.max(bestChainRef.current, comboCount)}
          practisedSkills={practisedSkills}
          nextUpLabel={nextUpLabel}
          realmId={realmId}
          onComplete={() => {
            setReflectionDone(true);
            onExit(); // returns to the week page (lesson already finalised)
          }}
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
        realmId={realmId}
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
      {showLessonResume && (
        <LessonResumeGate
          lessonTitle={liveContext?.lessonTitle ?? lesson.title}
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

          {(status !== "idle" || advanceError) && (
            <div
              className={`flex flex-wrap items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-center text-sm font-extrabold shadow-sm transition-all ${
                status === "correct"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span>
                {advanceError
                  ? advanceError
                  : status === "correct"
                    ? showMultiStepCalculationFeedback
                      ? "Nice — well worked."
                      : "✓ Correct! +10 XP"
                    : showMultiStepCalculationFeedback
                      ? "Check each step carefully."
                      : "✗ Not quite — keep going!"}
              </span>
              {status === "correct" ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={turnState === "advancing"}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-black text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {turnState === "advancing" ? "Loading..." : advanceError ? "Try Again" : "Next Question"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
              {status === "idle" && advanceError ? (
                <button
                  type="button"
                  onClick={handleRetryQuestion}
                  disabled={turnState === "advancing"}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 font-black text-white transition hover:bg-amber-800 disabled:cursor-wait disabled:opacity-70"
                >
                  {turnState === "advancing" ? "Loading..." : "Try Again"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
              {advanceError ? (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-lg border border-current px-4 py-2 font-black transition hover:bg-white/60"
                >
                  Reload Lesson
                </button>
              ) : null}
            </div>
          )}

          {currentTurnSafe && currentActivity && currentQuestion ? (
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
                      <span className="inline-flex items-center gap-1">
                        {isMeasurement ? <Sparkle className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                        {isMeasurement ? "Surge State" : "Nexus State"}
                      </span>
                    </span>
                  )}
                </div>

                <fieldset
                  disabled={taskLocked}
                  className={taskLocked ? "pointer-events-none min-w-0 border-0 p-0" : "min-w-0 border-0 p-0"}
                  aria-disabled={taskLocked}
                >
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
                </fieldset>
                {status === "wrong" && wrongFeedback ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-slate-900" role="status">
                    <div className="text-lg font-black text-red-800">Not quite.</div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-800">
                        <span className="font-black">You entered:</span> {wrongFeedback.studentAnswer}
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-800">
                        <span className="font-black">Correct answer:</span> {wrongFeedback.correctAnswer}
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-700">{wrongFeedback.explanation}</p>
                    {advanceError ? (
                      <p className="mt-3 text-sm font-bold text-red-800">{advanceError}</p>
                    ) : null}
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        disabled={turnState === "advancing"}
                        className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-trust-blue px-5 py-3 font-black text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
                      >
                        {turnState === "advancing" ? "Loading..." : advanceError ? "Try Again" : "Next Question"}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </ComboMilestonePop>
          ) : activities.length > 0 && invalidRecoveryCountRef.current < 3 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              Loading the next challenge…
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              This lesson could not load a safe challenge right now.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-xl bg-amber-700 px-4 py-2 font-black text-white hover:bg-amber-600"
                >
                  Return to Week
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
