"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readProgress, updateProgress } from "@/data/progress";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";
import { supabase } from "@/lib/supabase";
import { getProgramForYear } from "@/data/programs";
import { getYear6WeeklyQuiz, type Year6WeeklyQuizQuestion } from "@/data/quizzes/year6";
import PostTestTransition from "@/components/PostTestTransition";
import {
  buildQuizActivityPool,
  generateQuestionForLevelLessonActivity,
  getLevelForLesson,
  type MultipleChoiceQuestion as Year2MultipleChoiceQuestion,
  type IntegerContextVisualData,
  type IntegerNumberLineVisualData,
  type PlaceValueBuilderQuestion as Year2PlaceValueBuilderQuestion,
  type PartitionExpandQuestion as Year2PartitionExpandQuestion,
  type TypedResponseQuestion as Year2TypedResponseQuestion,
  type Year2PolicyViolation,
  type Year2QuestionData,
} from "@/data/activities/year2/lessonEngine";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import NumberLineTap from "@/components/NumberLineTap";
import NumberLineJump from "@/components/NumberLineJump";
import NumberChartFill from "@/components/NumberChartFill";
import MoneyMakeAmount from "@/components/week7/MoneyMakeAmount";
import MoneyChange from "@/components/week7/MoneyChange";
import MoneyEnough from "@/components/week7/MoneyEnough";
import { MathFormattedText } from "@/components/FractionText";
import { prepareSpeechText, speak, useAutoReadSetting, useSpeakState } from "@/lib/speak";
import type { TeacherAttemptQuestion, TeacherInsight, TeacherInsightInput } from "@/lib/teacher-insights";
import { ClickableDotGrid, ClickableDotRows } from "@/components/ClickableDots";
import { StaticDotGrid, StaticDotRow, StaticDotRows } from "@/components/StaticDots";
import {
  YEAR1_LESSON_CONFIG,
  YEAR1_WEEKLY_QUIZZES,
  getLessonConfig,
  getWeeklyQuizConfig,
  getDifficultyFromTime,
  type Difficulty,
  type LessonConfig,
} from "@/app/config/lesson-config";
import type { Lesson, WeekPlan } from "@/data/programs/year1";
import type { LessonActivity } from "@/data/programs/types";

type WeekProgress = {
  lessonsCompleted: boolean[]; // [L1, L2, L3]
  quizCompleted: boolean;
  quizScore?: number;
};

type ProgramProgressStore = Record<string, WeekProgress>; // key = `${year}|${week}`

// ACTIVE_STUDENT_KEY imported from @/data/progress

function getScopedSessionStoreKey() {
  if (typeof window === "undefined") return "lul:server:session_program_progress_v1";
  const active = localStorage.getItem(ACTIVE_STUDENT_KEY);
  const scope = active && active.trim()
    ? active.trim()
    : (new URLSearchParams(window.location.search).get("demo") === "1" ? "demo" : "anon");
  return `lul:${scope}:session_program_progress_v1`;
}

function makeKey(year: string, week: string) {
  return `${year}|${week}`;
}

function readStore(): ProgramProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getScopedSessionStoreKey());
    if (!raw) return {};
    return JSON.parse(raw) as ProgramProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProgramProgressStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getScopedSessionStoreKey(), JSON.stringify(store));
}

function getWeekProgress(
  store: ProgramProgressStore,
  year: string,
  week: string
): WeekProgress {
  const key = makeKey(year, week);
  return (
    store[key] ?? {
      lessonsCompleted: [false, false, false],
      quizCompleted: false,
    }
  );
}

function setLessonComplete(
  store: ProgramProgressStore,
  year: string,
  week: string,
  lessonNumber: number
) {
  const key = makeKey(year, week);
  const current = getWeekProgress(store, year, week);
  const nextLessons = [...current.lessonsCompleted];
  nextLessons[lessonNumber - 1] = true;
  store[key] = { ...current, lessonsCompleted: nextLessons };
}

function setQuizComplete(store: ProgramProgressStore, year: string, week: string) {
  const key = makeKey(year, week);
  const current = getWeekProgress(store, year, week);
  store[key] = { ...current, quizCompleted: true };
}

function setQuizScore(store: ProgramProgressStore, year: string, week: string, score: number) {
  const key = makeKey(year, week);
  const current = getWeekProgress(store, year, week);
  store[key] = { ...current, quizScore: score, quizCompleted: true };
}

type QuizQuestion = {
  id: string;
  lessonNumber?: number;
  lessonTag?: 1 | 2 | 3;
  skill?: string;
  activityType?: LessonActivity["activityType"];
  kind:
    | "lessonActivity"
    | "ordering"
    | "mcq"
    | "typed"
    | "audio"
    | "numberLineTap"
    | "numberLineJump"
    | "chartFill"
    | "mab"
    | "moneyMake"
    | "moneyChange"
    | "moneyEnough";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctValue?: string;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  responseType?: "number";
  acceptedValues?: string[];
  placeholder?: string;
  audioText?: string;
  visual?: {
    type: "dots";
    count: number;
    cols: number;
    rows: number;
    dotSize: number;
    gap: number;
  } | {
    type: "rows";
    rows: number[];
    dotSize: number;
    gap: number;
    rowGap: number;
    highlightRow?: number;
    highlightClassName?: string;
  } | {
    type: "money";
    items: {
      value: number;
      label: string;
      image: string;
      kind: "coin" | "note";
    }[];
  };
  line?: {
    min: number;
    max: number;
    target: number;
    start?: number;
    steps?: number[];
    showTargetLabel?: boolean;
  };
  chart?: {
    min: number;
    max: number;
    missing: number[];
  };
  mab?: {
    target: number;
    maxTens: number;
    maxOnes: number;
  };
  moneyMake?: {
    target: number;
  };
  moneyChange?: {
    paid: number;
    cost: number;
    options: string[];
    answer: number;
  };
  moneyEnough?: {
    have: number;
    cost: number;
    answer: "YES" | "NO";
  };
  activity?: LessonActivity;
  questionData?: Year2QuestionData;
  quizMeta?: {
    type: string;
    operation?: "add" | "subtract";
    denominatorPair?: string;
    difficulty?: "early" | "middle" | "late";
  };
};

type LessonBreakdown = {
  lessonNumber: number;
  lessonTitle?: string;
  correct: number;
  total: number;
  percent: number;
  skill?: string;
};

function getLessonFeedback(correct: number, total: number) {
  if (total <= 0) return "Needs more practice.";
  if (correct === total) return "Skill mastered.";
  if (correct >= Math.ceil(total * 0.6)) return "Good progress.";
  return "Needs more practice.";
}

function toYear2QuizQuestion(
  question: Year2MultipleChoiceQuestion | Year2TypedResponseQuestion,
  lessonNumber: number,
  skill: string,
  index: number
): QuizQuestion {
  if (question.kind === "multiple_choice") {
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: "mcq",
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.options.findIndex((option) => option === question.answer),
    };
  }

  return {
    id: `q${index}`,
    lessonNumber,
    skill,
    kind: "typed",
    prompt: question.prompt,
    correctValue: question.answer,
  };
}

function toAssessmentTypedQuizQuestion(
  questionData: Year2QuestionData,
  lessonNumber: 1 | 2 | 3,
  skill: string,
  index: number,
  quizMeta: NonNullable<QuizQuestion["quizMeta"]>
): QuizQuestion | null {
  if (questionData.kind === "multiple_choice") {
    return {
      id: `q${index}`,
      lessonNumber,
      lessonTag: lessonNumber,
      skill,
      activityType: "multiple_choice",
      kind: "lessonActivity",
      prompt: questionData.prompt,
      activity: {
        activityType: "multiple_choice",
        weight: 1,
        config: {},
      },
      questionData,
      quizMeta,
    };
  }

  if (questionData.kind === "typed_response" && typeof questionData.answer === "string") {
    return {
      id: `q${index}`,
      lessonNumber,
      lessonTag: lessonNumber,
      skill,
      activityType: "typed_response",
      kind: "lessonActivity",
      prompt: questionData.prompt,
      activity: {
        activityType: "typed_response",
        weight: 1,
        config: {},
      },
      questionData,
      quizMeta,
    };
  }

  return null;
}

function toExplicitWeeklyQuizQuestion(
  question: Year6WeeklyQuizQuestion,
  index: number
): QuizQuestion {
  const prompt = String(question.questionText ?? "").trim();
  const correctAnswer = String(question.correctAnswer ?? "").trim();
  const inputType = question.inputType;
  const typedInputType =
    inputType === "integer" ||
    inputType === "fraction" ||
    inputType === "mixed" ||
    inputType === "flexible_fraction"
      ? inputType
      : undefined;

  const lessonMeta = {
    id: question.id || `q${index}`,
    lessonNumber: question.lessonTag,
    lessonTag: question.lessonTag,
    skill: `lesson${question.lessonTag}`,
    quizMeta: {
      type: "explicit_year6_quiz",
      difficulty: "middle" as const,
    },
  };

  if (question.answerType === "ordering") {
    const values = (question.values ?? []).map((value) => String(value).trim());
    const isFractionOrdering = values.some((value) => value.includes("/"));
    const visual =
      question.visual?.kind === "numberLine"
        ? question.visual.numberLine
        : question.visual?.kind === "fractionNumberLine"
          ? question.visual.fractionNumberLine
          : undefined;
    return {
      ...lessonMeta,
      activityType: "number_order",
      kind: "lessonActivity",
      prompt,
      questionData: {
        kind: "number_order",
        prompt,
        numbers: isFractionOrdering ? [] : values.map((value) => Number(value)),
        fractions: isFractionOrdering ? values : undefined,
        ascending: true,
        helper: question.instructionText,
        visual,
        correctOrder: question.correctOrder,
      },
      activity: {
        activityType: "number_order",
        weight: 1,
        config: {},
      },
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
    };
  }

  const mappedVisual =
    question.visual?.kind === "numberLine"
      ? question.visual.numberLine
      : question.visual?.kind === "fractionNumberLine"
        ? question.visual.fractionNumberLine
      : question.visual?.kind === "fractionContext"
        ? question.visual.fractionContext
      : question.visual?.kind === "integerContext"
        ? question.visual.contextVisual
      : question.visual?.kind === "bestBuyCardComparison"
        ? question.visual.bestBuy
      : question.visual?.kind === "patternSequenceStrip"
        ? question.visual.patternSequence
      : question.visual?.kind === "termPredictorCard"
        ? question.visual.termPredictor
      : question.visual?.kind === "reversePatternCard"
        ? question.visual.reversePattern
      : undefined;

  const isFractionTypedAnswer = /\/|\d+\s+\d+\/\d+/.test(correctAnswer);

  if (question.visual?.kind === "equivalentFractionYesNo") {
    return {
      ...lessonMeta,
      activityType: "equivalent_fraction_yes_no",
      kind: "lessonActivity",
      prompt,
      questionData: {
        kind: "equivalent_fraction_yes_no",
        prompt,
        left: { id: "left", ...question.visual.left },
        right: { id: "right", ...question.visual.right },
        answer: correctAnswer.toLowerCase() === "yes" ? "yes" : "no",
      },
      activity: {
        activityType: "equivalent_fraction_yes_no",
        weight: 1,
        config: {},
      },
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
    };
  }

  if (mappedVisual) {
    if (question.answerType === "numeric" || question.answerType === "typedShort") {
      return {
        ...lessonMeta,
        activityType: "typed_response",
        kind: "lessonActivity",
        prompt,
        questionData: {
          kind: "typed_response",
          prompt,
          answer: correctAnswer,
          acceptedAnswers: question.acceptedAnswers,
          helper: question.feedbackIncorrect,
          placeholder: question.placeholder ?? "Type the answer",
          inputType: typedInputType,
          visual: mappedVisual,
        },
        activity: {
          activityType: "typed_response",
          weight: 1,
          config: {},
        },
        feedbackCorrect: question.feedbackCorrect,
        feedbackIncorrect: question.feedbackIncorrect,
      };
    }

    return {
      ...lessonMeta,
      activityType: "multiple_choice",
      kind: "lessonActivity",
      prompt,
      questionData: {
        kind: "multiple_choice",
        prompt,
        options: (question.options ?? []).map((option) => String(option ?? "").trim()),
        answer: correctAnswer,
        helper: question.feedbackIncorrect,
        visual: mappedVisual,
      },
      activity: {
        activityType: "multiple_choice",
        weight: 1,
        config: {},
      },
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
    };
  }

  if (question.answerType === "numeric") {
    if (typedInputType || isFractionTypedAnswer) {
      return {
        ...lessonMeta,
        activityType: "typed_response",
        kind: "lessonActivity",
        prompt,
        questionData: {
          kind: "typed_response",
          prompt,
          answer: correctAnswer,
          helper: question.feedbackIncorrect,
          placeholder:
            question.placeholder ??
            (typedInputType === "integer"
              ? "Type the integer"
              : typedInputType === "mixed"
                ? "Type the mixed number"
                : "Type the fraction"),
          inputType: typedInputType ?? (isFractionTypedAnswer ? "fraction" : undefined),
        },
        activity: {
          activityType: "typed_response",
          weight: 1,
          config: {},
        },
        feedbackCorrect: question.feedbackCorrect,
        feedbackIncorrect: question.feedbackIncorrect,
      };
    }
    return {
      ...lessonMeta,
      activityType: "typed_response",
      kind: "typed",
      prompt,
      correctValue: correctAnswer,
      acceptedValues: question.acceptedAnswers,
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
      responseType:
        typedInputType === "integer" || (!typedInputType && !isFractionTypedAnswer) ? "number" : undefined,
      placeholder: question.placeholder ?? "Type the integer",
    };
  }

  if (question.answerType === "typedShort") {
    return {
      ...lessonMeta,
      activityType: "typed_response",
      kind: "lessonActivity",
      prompt,
      questionData: {
        kind: "typed_response",
        prompt,
        answer: correctAnswer,
        acceptedAnswers: question.acceptedAnswers,
        helper: question.feedbackIncorrect,
        placeholder: question.placeholder ?? "Type a short explanation",
      },
      activity: {
        activityType: "typed_response",
        weight: 1,
        config: {},
      },
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
    };
  }

  const options = (question.options ?? []).map((option) => String(option ?? "").trim());
  return {
    ...lessonMeta,
    activityType: "multiple_choice",
    kind: "mcq",
    prompt,
    options,
    correctIndex: options.findIndex((option) => option === correctAnswer),
    feedbackCorrect: question.feedbackCorrect,
    feedbackIncorrect: question.feedbackIncorrect,
  };
}

function buildYear6ExplicitWeeklyQuizQuestions(
  weekNumber: number,
  questionsPerLesson: number
): QuizQuestion[] | null {
  const quiz = getYear6WeeklyQuiz(weekNumber);
  if (!quiz) return null;

  const expectedTotal = questionsPerLesson * 3;
  if (quiz.questions.length !== expectedTotal) {
    throw new Error(
      `[Year6WeeklyQuiz] Week ${weekNumber} expected ${expectedTotal} questions, received ${quiz.questions.length}.`
    );
  }

  ([1, 2, 3] as const).forEach((lessonTag) => {
    const count = quiz.questions.filter((question) => question.lessonTag === lessonTag).length;
    if (count !== questionsPerLesson) {
      throw new Error(
        `[Year6WeeklyQuiz] Week ${weekNumber} Lesson ${lessonTag} expected ${questionsPerLesson} questions, received ${count}.`
      );
    }
  });

  return quiz.questions.map((question, index) => toExplicitWeeklyQuizQuestion(question, index + 1));
}

function numericOptionStrings(answer: number, spread: number, min = 0) {
  const lower = Math.max(min, answer - spread);
  const upper = Math.max(lower + 6, answer + spread);
  return shuffle(uniqueInts(3, lower, upper, [answer]).concat([answer]).map(String));
}

function placeValueSummary(question: Year2PlaceValueBuilderQuestion) {
  const hundreds = question.hundreds === null ? "? hundreds" : `${question.hundreds} hundreds`;
  const tens = question.tens === null ? "? tens" : `${question.tens} tens`;
  const ones = question.ones === null ? "? ones" : `${question.ones} ones`;
  return `${hundreds}, ${tens}, ${ones}`;
}

function buildAlternativePartition(question: Year2PartitionExpandQuestion) {
  const { standard } = question;
  if (standard.hundreds >= 100) {
    return {
      hundreds: standard.hundreds - 100,
      tens: standard.tens + 100,
      ones: standard.ones,
    };
  }

  return {
    hundreds: standard.hundreds,
    tens: Math.max(0, standard.tens - 10),
    ones: standard.ones + 10,
  };
}

function buildStructuredQuizSources(lesson: Lesson): LessonActivity[] {
  const level = getLevelForLesson(lesson);
  const { activities, violations } = buildQuizActivityPool(level, lesson, {
    allowGenericFallback: true,
  });
  if (violations.length > 0) {
    const summary = violations
      .map((violation: Year2PolicyViolation) => `${violation.reason}: ${violation.message}`)
      .join(" | ");
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`[StructuredQuizPolicy] ${lesson.title}: ${summary}`);
    }
    console.error(`[StructuredQuizPolicy] ${lesson.title}: ${summary}`);
  }
  const isClearlyPracticeOnly = (activity: LessonActivity) => {
    const mode = typeof activity.config?.mode === "string" ? String(activity.config.mode) : "";
    return mode.includes("whos_right") || mode.includes("spot_pattern_reasoning");
  };

  const quizSafeReasoningModes = new Set([
    "equivalent_fraction_reasoning",
    "equivalent_to_compare",
    "identify_fraction_point",
    "same_denominator_true_false",
    "related_denominator_quick_apply",
    "real_world_fraction_decision",
    "fdp_which_correct",
  ]);

  const filtered = activities.filter((activity) => {
    const rotationRole =
      typeof activity.config?.rotationRole === "string" ? String(activity.config.rotationRole) : "";
    const mode = typeof activity.config?.mode === "string" ? String(activity.config.mode) : "";
    if (
      rotationRole === "reasoning" &&
      !mode.includes("reasoning_check") &&
      !quizSafeReasoningModes.has(mode)
    ) {
      return false;
    }
    if (isClearlyPracticeOnly(activity)) {
      return false;
    }
    return true;
  });

  return filtered.length > 0 ? filtered : activities.filter((activity) => !isClearlyPracticeOnly(activity));
}

function isQuizSafeGeneratedQuestion(questionData: Year2QuestionData) {
  if (questionData.kind === "multiple_choice" || questionData.kind === "typed_response") {
    const visualType = questionData.visual?.type ?? "";
    if (visualType === "rule_box") {
      return false;
    }

    const prompt = typeof questionData.prompt === "string" ? questionData.prompt.toLowerCase() : "";
    if (
      prompt.includes("who used a helpful strategy") ||
      prompt.includes("which method is most efficient") ||
      prompt.includes("who is correct") ||
      prompt.includes("good friendly-number question")
    ) {
      return false;
    }
  }

  return true;
}

function getStructuredQuestionFingerprint(questionData: Year2QuestionData) {
  if (questionData.kind === "multiple_choice") {
    return [
      questionData.kind,
      questionData.prompt,
      questionData.answer,
      questionData.options.join("|"),
      questionData.visual?.type ?? "",
    ].join("::");
  }

  if (questionData.kind === "typed_response") {
    return [
      questionData.kind,
      questionData.prompt,
      questionData.answer,
      questionData.visual?.type ?? "",
    ].join("::");
  }

  return JSON.stringify(questionData);
}

function getStructuredQuizQuestionId(
  questionData: Year2QuestionData,
  activity: LessonActivity,
  fallbackFingerprint: string
) {
  const mode = typeof activity.config?.mode === "string" ? String(activity.config.mode) : activity.activityType;
  const text =
    questionData.kind === "multiple_choice" || questionData.kind === "typed_response"
      ? `${questionData.prompt} ${questionData.answer ?? ""}`
      : JSON.stringify(questionData);
  const normalizedText = String(text ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const symbolMatch = normalizedText.match(/[+×÷-]/);
  const operation =
    symbolMatch?.[0] === "+"
      ? "add"
      : symbolMatch?.[0] === "-"
      ? "subtract"
      : symbolMatch?.[0] === "×"
      ? "multiply"
      : symbolMatch?.[0] === "÷"
      ? "divide"
      : mode;
  const numbers = [...normalizedText.matchAll(/-?\d[\d,]*(?:\.\d+)?(?:\/\d+)?/g)]
    .map((match) => match[0].replace(/,/g, ""))
    .slice(0, 2);

  if (numbers.length >= 2) {
    return `${operation}-${numbers[0]}-${numbers[1]}`;
  }

  return `${operation}-${fallbackFingerprint}`;
}

type NumericQuizCandidate = {
  id: string;
  operation: "add" | "subtract" | "multiply" | "divide";
  prompt: string;
  answer: string;
  type: string;
};

function formatQuizNumber(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : String(Number(value.toFixed(3))).replace(/\.0+$/, "");
}

function numericQuizCandidate(
  operation: NumericQuizCandidate["operation"],
  left: number,
  right: number
): NumericQuizCandidate {
  const symbol =
    operation === "add" ? "+" : operation === "subtract" ? "-" : operation === "multiply" ? "×" : "÷";
  const answer =
    operation === "add"
      ? left + right
      : operation === "subtract"
      ? left - right
      : operation === "multiply"
      ? left * right
      : left / right;
  return {
    id: `${operation}-${left}-${right}`,
    operation,
    prompt: `${formatQuizNumber(left)} ${symbol} ${formatQuizNumber(right)}`,
    answer: formatQuizNumber(answer),
    type: `numeric_${operation}`,
  };
}

function buildNumericOnlyWeeklyQuizQuestions(
  weekPlan: WeekPlan,
  questionsPerLesson: number
): QuizQuestion[] {
  const candidates = shuffle([
    numericQuizCandidate("add", 199, 38),
    numericQuizCandidate("add", 398, 47),
    numericQuizCandidate("add", 999, 246),
    numericQuizCandidate("add", 1250, 375),
    numericQuizCandidate("add", 2499, 518),
    numericQuizCandidate("add", 3.75, 1.2),
    numericQuizCandidate("add", 5.98, 2.4),
    numericQuizCandidate("add", 12.5, 0.75),
    numericQuizCandidate("add", 4.099, 0.901),
    numericQuizCandidate("subtract", 602, 198),
    numericQuizCandidate("subtract", 1000, 376),
    numericQuizCandidate("subtract", 1204, 399),
    numericQuizCandidate("subtract", 3005, 998),
    numericQuizCandidate("subtract", 6.02, 1.98),
    numericQuizCandidate("subtract", 10.5, 2.75),
    numericQuizCandidate("subtract", 8, 3.125),
    numericQuizCandidate("subtract", 12.4, 0.99),
    numericQuizCandidate("multiply", 49, 6),
    numericQuizCandidate("multiply", 25, 16),
    numericQuizCandidate("multiply", 50, 18),
    numericQuizCandidate("multiply", 125, 8),
    numericQuizCandidate("multiply", 99, 11),
    numericQuizCandidate("multiply", 24, 15),
    numericQuizCandidate("multiply", 48, 25),
    numericQuizCandidate("divide", 1200, 6),
    numericQuizCandidate("divide", 450, 6),
    numericQuizCandidate("divide", 1000, 8),
    numericQuizCandidate("divide", 900, 12),
    numericQuizCandidate("divide", 1250, 5),
    numericQuizCandidate("divide", 864, 9),
    numericQuizCandidate("divide", 2400, 50),
  ]);
  const total = questionsPerLesson * 3;
  const seenQuestions = new Set<string>();
  const selected: NumericQuizCandidate[] = [];

  for (const candidate of candidates) {
    if (selected.length >= total) break;
    if (seenQuestions.has(candidate.id)) continue;
    seenQuestions.add(candidate.id);
    selected.push(candidate);
  }

  if (selected.length < total) {
    throw new Error(
      `[StructuredWeeklyQuiz] Year ${weekPlan.id} Week ${weekPlan.week} could not build ${total} unique numeric questions.`
    );
  }

  return selected.map((candidate, index) => {
    const lessonNumber = ((index % 3) + 1) as 1 | 2 | 3;
    return {
      id: `q${index + 1}`,
      lessonNumber,
      lessonTag: lessonNumber,
      skill: candidate.type,
      activityType: "typed_response",
      kind: "typed",
      prompt: candidate.prompt,
      correctValue: candidate.answer,
      responseType: "number",
      quizMeta: {
        type: candidate.type,
        operation: candidate.operation === "add" || candidate.operation === "subtract" ? candidate.operation : undefined,
        difficulty: index < total / 3 ? "early" : index < (total * 2) / 3 ? "middle" : "late",
      },
    };
  });
}

function operationFromSymbol(symbol?: string): "add" | "subtract" | undefined {
  if (symbol === "+") return "add";
  if (symbol === "-") return "subtract";
  return undefined;
}

function quizMetaFromGeneratedQuestion(
  questionData: Year2QuestionData,
  activity: LessonActivity,
  questionNumber: number,
  totalQuestions: number
): NonNullable<QuizQuestion["quizMeta"]> {
  const mode = typeof activity.config?.mode === "string" ? String(activity.config.mode) : activity.activityType;
  const text = questionData.kind === "multiple_choice" || questionData.kind === "typed_response"
    ? `${questionData.prompt} ${questionData.answer ?? ""}`
    : JSON.stringify(questionData);
  const visual =
    (questionData.kind === "multiple_choice" || questionData.kind === "typed_response") &&
    questionData.visual?.type === "same_denominator_operation"
      ? questionData.visual
      : null;
  const fractionMatches = [...text.matchAll(/(\d+)\/(\d+)/g)];
  const denominatorsFromText = fractionMatches.map((match) => Number(match[2])).filter(Number.isFinite);
  const denominators = visual
    ? [
        visual.originalDenominatorA ?? visual.denominator,
        visual.originalDenominatorB ?? visual.denominator,
      ]
    : denominatorsFromText.slice(0, 2);
  const denominatorPair =
    denominators.length >= 2
      ? [...denominators.slice(0, 2)].sort((a, b) => a - b).join("-")
      : undefined;
  const operation =
    visual
      ? operationFromSymbol(visual.operation)
      : text.includes("+")
      ? "add"
      : text.includes("-")
      ? "subtract"
      : undefined;
  const progress = questionNumber / Math.max(1, totalQuestions - 1);

  return {
    type: mode,
    operation,
    denominatorPair,
    difficulty: progress < 0.34 ? "early" : progress < 0.67 ? "middle" : "late",
  };
}

function violatesQuizVarietyRules(
  metadata: NonNullable<QuizQuestion["quizMeta"]>,
  selected: QuizQuestion[],
  totalQuestions: number
) {
  if (
    metadata.denominatorPair &&
    selected.some((question) => question.quizMeta?.denominatorPair === metadata.denominatorPair)
  ) {
    return true;
  }

  const typeCount = selected.filter((question) => question.quizMeta?.type === metadata.type).length;
  if (typeCount >= 2) {
    return true;
  }

  if (metadata.operation && selected.length >= 2) {
    const recent = selected.slice(-2);
    if (recent.every((question) => question.quizMeta?.operation === metadata.operation)) {
      return true;
    }
  }

  const additionCount = selected.filter((question) => question.quizMeta?.operation === "add").length;
  const subtractionCount = selected.filter((question) => question.quizMeta?.operation === "subtract").length;
  const nextAdditionCount = additionCount + (metadata.operation === "add" ? 1 : 0);
  const nextSubtractionCount = subtractionCount + (metadata.operation === "subtract" ? 1 : 0);
  const remainingAfterThisQuestion = totalQuestions - selected.length - 1;

  if (nextAdditionCount + remainingAfterThisQuestion < 4) {
    return true;
  }

  if (nextSubtractionCount + remainingAfterThisQuestion < 4) {
    return true;
  }

  return false;
}

function validateStructuredWeeklyQuizQuestions(
  weekPlan: WeekPlan,
  questions: QuizQuestion[],
  questionsPerLesson: number
) {
  const expectedTotal = questionsPerLesson * 3;
  const counts = new Map<number, number>();

  for (const question of questions) {
    const lessonNumber = question.lessonNumber ?? 0;
    counts.set(lessonNumber, (counts.get(lessonNumber) ?? 0) + 1);
  }

  const issues: string[] = [];
  if (questions.length !== expectedTotal) {
    issues.push(`Expected ${expectedTotal} quiz questions, received ${questions.length}.`);
  }

  for (const lessonNumber of [1, 2, 3] as const) {
    const count = counts.get(lessonNumber) ?? 0;
    if (count !== questionsPerLesson) {
      issues.push(`Lesson ${lessonNumber} expected ${questionsPerLesson} questions, received ${count}.`);
    }
  }

  if (questions.some((question) => (question.lessonNumber ?? 0) < 1 || (question.lessonNumber ?? 0) > 3)) {
    issues.push(`Quiz contains questions outside lessons 1-3 for week ${weekPlan.week}.`);
  }

  if (issues.length > 0) {
    const message = `[StructuredWeeklyQuiz] Week ${weekPlan.week}: ${issues.join(" | ")}`;
    if (process.env.NODE_ENV !== "production") {
      throw new Error(message);
    }
    console.error(message);
  }
}

function buildStructuredWeeklyQuizQuestions(
  weekPlan: WeekPlan,
  questionsPerLesson: number
): QuizQuestion[] {
  const yearMatch = weekPlan.id.match(/^y(\d+)-/);
  const yearNumber = yearMatch ? Number(yearMatch[1]) : 1;
  if (yearNumber === 6) {
    const explicitQuestions = buildYear6ExplicitWeeklyQuizQuestions(weekPlan.week, questionsPerLesson);
    if (explicitQuestions) return explicitQuestions;
  }
  const quizLessons = weekPlan.lessons.slice(0, 3);

  if (yearNumber === 5 && weekPlan.week === 11) {
    return buildNumericOnlyWeeklyQuizQuestions(weekPlan, questionsPerLesson);
  }

  if (yearNumber === 4 && weekPlan.week === 12) {
    throw new Error(
      `[StructuredWeeklyQuiz] Year 4 Week 12 does not use the standard weekly quiz path.`
    );
  }

  const questions: QuizQuestion[] = [];
  const seenQuestions = new Set<string>();
  const debugCounts: Array<{ lesson: 1 | 2 | 3; availableActivities: number; selectedActivityTypes: string[] }> = [];

  quizLessons.forEach((lesson, lessonIndex) => {
    const lessonNumber = (lessonIndex + 1) as 1 | 2 | 3;
    if (lesson.quizSafe === false) {
      throw new Error(
        `[StructuredWeeklyQuiz] Year ${yearNumber} Week ${weekPlan.week} Lesson ${lessonNumber} is marked quizSafe=false and cannot be included in the standard weekly quiz.`
      );
    }

    const level = getLevelForLesson(lesson);
    const sourceActivities = buildStructuredQuizSources(lesson);

    if (!sourceActivities.length) {
      throw new Error(
        `[StructuredWeeklyQuiz] Year ${yearNumber} Week ${weekPlan.week} Lesson ${lessonNumber} has no validated quiz-safe activities available.`
      );
    }

    const selectedActivityTypes: string[] = [];
    const candidatePool: Array<{
      questionId: string;
      sourceActivity: LessonActivity;
      questionData: Year2QuestionData;
      quizMeta: NonNullable<QuizQuestion["quizMeta"]>;
    }> = [];
    const candidateIds = new Set<string>();
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const sourceActivity = sourceActivities[attempt % sourceActivities.length];
      const questionData = generateQuestionForLevelLessonActivity(level, lesson, sourceActivity);
      if (!isQuizSafeGeneratedQuestion(questionData)) continue;

      const fingerprint = getStructuredQuestionFingerprint(questionData);
      const questionId = getStructuredQuizQuestionId(questionData, sourceActivity, fingerprint);
      if (seenQuestions.has(questionId) || candidateIds.has(questionId)) continue;

      const quizMeta = quizMetaFromGeneratedQuestion(
        questionData,
        sourceActivity,
        questions.length + candidatePool.length,
        questionsPerLesson * 3
      );

      candidateIds.add(questionId);
      candidatePool.push({
        questionId,
        sourceActivity,
        questionData,
        quizMeta,
      });

      if (candidatePool.length >= Math.max(questionsPerLesson * 6, 30)) break;
    }

    const selectedCandidates: typeof candidatePool = [];
    const shuffledCandidates = shuffle(candidatePool);
    for (const candidate of shuffledCandidates) {
      if (selectedCandidates.length >= questionsPerLesson) break;
      if (violatesQuizVarietyRules(candidate.quizMeta, [...questions, ...selectedCandidates.map((item, offset) => ({
        id: `candidate-${offset}`,
        lessonNumber,
        skill: item.sourceActivity.activityType,
        kind: "typed" as const,
        prompt: item.questionData.kind === "multiple_choice" || item.questionData.kind === "typed_response" ? item.questionData.prompt : "",
        correctValue: item.questionData.kind === "multiple_choice" || item.questionData.kind === "typed_response" ? item.questionData.answer : undefined,
        quizMeta: item.quizMeta,
      }))], questionsPerLesson * 3)) {
        continue;
      }
      selectedCandidates.push(candidate);
    }

    for (const candidate of shuffledCandidates) {
      if (selectedCandidates.length >= questionsPerLesson) break;
      if (selectedCandidates.some((item) => item.questionId === candidate.questionId)) continue;
      selectedCandidates.push(candidate);
    }

    if (selectedCandidates.length < questionsPerLesson) {
      throw new Error(
        `[StructuredWeeklyQuiz] Year ${yearNumber} Week ${weekPlan.week} Lesson ${lessonNumber} could not generate ${questionsPerLesson} unique quiz questions after ${maxAttempts} attempts.`
      );
    }

    for (const candidate of selectedCandidates) {
      seenQuestions.add(candidate.questionId);
      selectedActivityTypes.push(candidate.sourceActivity.activityType);
      const assessmentQuestion = toAssessmentTypedQuizQuestion(
        candidate.questionData,
        lessonNumber,
        candidate.sourceActivity.activityType,
        questions.length + 1,
        candidate.quizMeta
      );
      questions.push(
        assessmentQuestion ?? {
          id: `q${questions.length + 1}`,
          lessonNumber,
          lessonTag: lessonNumber,
          skill: candidate.sourceActivity.activityType,
          activityType: candidate.sourceActivity.activityType,
          kind: "lessonActivity",
          prompt: candidate.questionData.prompt,
          activity: candidate.sourceActivity,
          questionData: candidate.questionData,
          quizMeta: candidate.quizMeta,
        }
      );
    }

    debugCounts.push({
      lesson: lessonNumber,
      availableActivities: sourceActivities.length,
      selectedActivityTypes,
    });
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("[StructuredWeeklyQuiz]", {
      year: yearNumber,
      week: weekPlan.week,
      counts: debugCounts.map((item) => ({
        lesson: item.lesson,
        availableActivities: item.availableActivities,
      })),
      selectedPerLesson: debugCounts.map((item) => ({
        lesson: item.lesson,
        selectedActivityTypes: item.selectedActivityTypes,
      })),
    });
  }

  validateStructuredWeeklyQuizQuestions(weekPlan, questions, questionsPerLesson);
  return questions;
}

function buildLessonBucketQuizQuestions(
  lessonNumber: 1 | 2 | 3,
  questionsPerLesson: number,
  generators: Array<() => QuizQuestion>
) {
  const questions: QuizQuestion[] = [];
  const selectedKinds: string[] = [];

  for (let i = 0; i < questionsPerLesson; i += 1) {
    const generator = generators[randInt(0, generators.length - 1)];
    const question = generator();
    selectedKinds.push(question.kind);
    questions.push({
      ...question,
      lessonNumber,
      lessonTag: lessonNumber,
    });
  }

  return { questions, selectedKinds };
}

function toQuizQuestionFromYear2Data(
  questionData: Year2QuestionData,
  lessonNumber: number,
  skill: string,
  index: number,
  questionIndexInLesson: number
): QuizQuestion | null {
  const useTyped = questionIndexInLesson === 4;

  if (questionData.kind === "multiple_choice" || questionData.kind === "typed_response") {
    return toYear2QuizQuestion(
      questionData as Year2MultipleChoiceQuestion | Year2TypedResponseQuestion,
      lessonNumber,
      skill,
      index
    );
  }

  if (questionData.kind === "place_value_builder") {
    const prompt =
      questionData.mode === "missing_mab_part"
        ? `The number is ${questionData.targetNumber}. The MAB shows ${placeValueSummary(questionData)}. What is the missing value?`
        : questionData.mode === "identify_place"
        ? `The MAB shows ${placeValueSummary(questionData)}. How many ${questionData.place ?? "ones"} are shown?`
        : `The MAB shows ${placeValueSummary(questionData)}. What number is shown?`;
    const options = numericOptionStrings(
      questionData.answer,
      Math.max(10, questionData.answer > 99 ? 100 : 10)
    );

    return useTyped
      ? {
          id: `q${index}`,
          lessonNumber,
          skill,
          kind: "typed",
          prompt,
          correctValue: String(questionData.answer),
        }
      : {
          id: `q${index}`,
          lessonNumber,
          skill,
          kind: "mcq",
          prompt,
          options,
          correctIndex: options.findIndex((option) => option === String(questionData.answer)),
        };
  }

  if (questionData.kind === "partition_expand") {
    if (questionData.mode === "partition" || questionData.mode === "expand") {
      const target =
        questionData.standard.hundreds + questionData.standard.tens + questionData.standard.ones;
      const answerText = `${questionData.standard.hundreds} + ${questionData.standard.tens} + ${questionData.standard.ones}`;
      const options = shuffle([
        answerText,
        `${questionData.standard.hundreds + 100} + ${Math.max(0, questionData.standard.tens - 100)} + ${questionData.standard.ones}`,
        `${target - 10} + 10 + 0`,
        `${questionData.standard.hundreds} + ${questionData.standard.tens + 10} + ${Math.max(0, questionData.standard.ones - 10)}`,
      ]);
      return useTyped
        ? {
            id: `q${index}`,
            lessonNumber,
            skill,
            kind: "typed",
            prompt: `How many tens are in ${target}?`,
            correctValue: String(questionData.standard.tens / 10),
          }
        : {
            id: `q${index}`,
            lessonNumber,
            skill,
            kind: "mcq",
            prompt: `Which expanded form matches ${target}?`,
            options,
            correctIndex: options.findIndex((option) => option === answerText),
          };
    }

    if (questionData.mode === "flexible_partition") {
      const alternative = buildAlternativePartition(questionData);
      const answer = `${alternative.hundreds} + ${alternative.tens} + ${alternative.ones}`;
      const options = shuffle([
        answer,
        `${questionData.standard.hundreds} + ${questionData.standard.tens} + ${questionData.standard.ones}`,
        `${questionData.target - 10} + 10 + 0`,
        `${questionData.target - 1} + 0 + 1`,
      ]);
      return {
        id: `q${index}`,
        lessonNumber,
        skill,
        kind: "mcq",
        prompt: `Which is a different way to partition ${questionData.target}?`,
        options,
        correctIndex: options.findIndex((option) => option === answer),
      };
    }
  }

  if (questionData.kind === "number_order") {
    const askSmallest = questionIndexInLesson % 2 === 0;
    const answer = String(askSmallest ? Math.min(...questionData.numbers) : Math.max(...questionData.numbers));
    const options = shuffle(questionData.numbers.map(String));
    return useTyped
      ? {
          id: `q${index}`,
          lessonNumber,
          skill,
          kind: "typed",
          prompt: `${askSmallest ? "Type the smallest" : "Type the largest"} number: ${questionData.numbers.join(", ")}`,
          correctValue: answer,
        }
      : {
          id: `q${index}`,
          lessonNumber,
          skill,
          kind: "mcq",
          prompt: `${askSmallest ? "Which number is the smallest" : "Which number is the largest"}: ${questionData.numbers.join(", ")}?`,
          options,
          correctIndex: options.findIndex((option) => option === answer),
        };
  }

  if (questionData.kind === "number_line") {
    const rangePadding = Math.max(questionData.step * 2, 20);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: "numberLineTap",
      prompt: questionData.prompt,
      line: {
        min:
          questionData.mode === "rounding"
            ? Math.max(0, questionData.expected - rangePadding)
            : questionData.min,
        max:
          questionData.mode === "rounding"
            ? questionData.expected + rangePadding
            : questionData.max,
        target: questionData.expected,
        showTargetLabel: false,
      },
    };
  }

  if (questionData.kind === "equal_groups") {
    const options = questionData.options.map(String);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: useTyped ? "typed" : "mcq",
      prompt: questionData.prompt,
      correctValue: useTyped ? String(questionData.answer) : undefined,
      options: useTyped ? undefined : options,
      correctIndex: useTyped ? undefined : options.findIndex((option) => option === String(questionData.answer)),
      visual: {
        type: "rows",
        rows: Array.from({ length: questionData.groups }, () => questionData.itemsPerGroup),
        dotSize: 16,
        gap: 8,
        rowGap: 12,
      },
    };
  }

  if (questionData.kind === "arrays") {
    const visual = {
      type: "dots" as const,
      count: questionData.rows * questionData.columns,
      cols: questionData.columns,
      rows: questionData.rows,
      dotSize: 16,
      gap: 8,
    };

    if (questionData.mode === "repeated_addition" && questionData.repeatedAddition) {
      const options = questionData.options.map(String);
      return {
        id: `q${index}`,
        lessonNumber,
        skill,
        kind: "mcq",
        prompt: questionData.prompt,
        options,
        correctIndex: options.findIndex((option) => option === questionData.repeatedAddition),
        visual,
      };
    }

    const options = questionData.options.map(String);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: useTyped ? "typed" : "mcq",
      prompt: questionData.prompt,
      correctValue: useTyped ? String(questionData.answer) : undefined,
      options: useTyped ? undefined : options,
      correctIndex: useTyped ? undefined : options.findIndex((option) => option === String(questionData.answer)),
      visual,
    };
  }

  if (questionData.kind === "division_groups") {
    const options = questionData.options.map(String);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: useTyped ? "typed" : "mcq",
      prompt: questionData.prompt,
      correctValue: useTyped ? String(questionData.answer) : undefined,
      options: useTyped ? undefined : options,
      correctIndex: useTyped ? undefined : options.findIndex((option) => option === String(questionData.answer)),
      visual: {
        type: "rows",
        rows: Array.from({ length: questionData.groups }, () => questionData.groupSize),
        dotSize: 16,
        gap: 8,
        rowGap: 12,
      },
    };
  }

  if (questionData.kind === "fact_family") {
    if (questionData.mode === "write_sentences") {
      return {
        id: `q${index}`,
        lessonNumber,
        skill,
        kind: "typed",
        prompt: questionData.prompt,
        correctValue: questionData.answers.join(" | "),
        visual: questionData.visual
          ? {
              type: "dots",
              count: questionData.visual.rows * questionData.visual.columns,
              cols: questionData.visual.columns,
              rows: questionData.visual.rows,
              dotSize: 16,
              gap: 8,
            }
          : undefined,
      };
    }

    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: "mcq",
      prompt: questionData.prompt,
      options: questionData.options,
      correctIndex: questionData.options.findIndex((option) => option === questionData.answers[0]),
      visual: questionData.visual
        ? {
            type: "dots",
            count: questionData.visual.rows * questionData.visual.columns,
            cols: questionData.visual.columns,
            rows: questionData.visual.rows,
            dotSize: 16,
            gap: 8,
          }
        : undefined,
    };
  }

  if (questionData.kind === "skip_count") {
    const options = questionData.options.map(String);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: useTyped ? "typed" : "mcq",
      prompt: questionData.prompt,
      correctValue: useTyped ? String(questionData.answer) : undefined,
      options: useTyped ? undefined : options,
      correctIndex: useTyped ? undefined : options.findIndex((option) => option === String(questionData.answer)),
      visual: questionData.visualGroups?.length
        ? {
            type: "rows",
            rows: questionData.visualGroups,
            dotSize: 16,
            gap: 8,
            rowGap: 12,
          }
        : undefined,
    };
  }

  if (questionData.kind === "mixed_word_problem") {
    const options = questionData.options.map(String);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: useTyped ? "typed" : "mcq",
      prompt: questionData.prompt,
      correctValue: useTyped ? String(questionData.answer) : undefined,
      options: useTyped ? undefined : options,
      correctIndex: useTyped ? undefined : options.findIndex((option) => option === String(questionData.answer)),
    };
  }

  if (questionData.kind === "odd_even_sort") {
    if (questionData.mode === "pattern" && questionData.patternOptions && questionData.patternAnswer) {
      return {
        id: `q${index}`,
        lessonNumber,
        skill,
        kind: "mcq",
        prompt: "What pattern do you notice?",
        options: questionData.patternOptions,
        correctIndex: questionData.patternOptions.findIndex(
          (option) => option === questionData.patternAnswer
        ),
      };
    }

    const targetBucket = questionIndexInLesson % 2 === 0 ? "even" : "odd";
    const candidates = questionData.numbers
      .map((value, itemIndex) => ({
        value,
        label: questionData.labels?.[itemIndex] ?? String(value),
      }))
      .filter(({ value }) => (targetBucket === "even" ? value % 2 === 0 : value % 2 !== 0));
    const answer = candidates[0]?.label ?? (questionData.labels?.[0] ?? String(questionData.numbers[0]));
    const options = shuffle(
      questionData.numbers
        .map((value, itemIndex) => questionData.labels?.[itemIndex] ?? String(value))
        .slice(0, 4)
    );
    if (!options.includes(answer)) options[0] = answer;
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: "mcq",
      prompt:
        questionData.mode === "odd_even_sums"
          ? `Which sum has a ${targetBucket} answer?`
          : `Which number is ${targetBucket}?`,
      options,
      correctIndex: options.findIndex((option) => option === answer),
    };
  }

  if (questionData.kind === "review_quiz") {
    return toQuizQuestionFromYear2Data(
      questionData.question,
      lessonNumber,
      questionData.activityType,
      index,
      questionIndexInLesson
    );
  }

  if ("options" in questionData && Array.isArray(questionData.options) && "answer" in questionData) {
    const options = questionData.options.map(String);
    return {
      id: `q${index}`,
      lessonNumber,
      skill,
      kind: useTyped ? "typed" : "mcq",
      prompt: questionData.prompt,
      correctValue: useTyped ? String(questionData.answer) : undefined,
      options: useTyped ? undefined : options,
      correctIndex: useTyped ? undefined : options.findIndex((option) => option === String(questionData.answer)),
    };
  }

  return null;
}

function buildYear2WeeklyQuizQuestions(
  weekPlan: WeekPlan,
  questionsPerLesson: number
): QuizQuestion[] {
  return buildStructuredWeeklyQuizQuestions(weekPlan, questionsPerLesson);
}

function isQuizQuestionCorrect(
  q: QuizQuestion,
  quizAnswers: Record<string, number>,
  quizTyped: Record<string, string>,
  quizLineAnswers: Record<string, number>,
  quizChartDone: Record<string, boolean>,
  quizMabAnswers: Record<string, { tens: number; ones: number; touched: boolean }>,
  quizMoneyAnswers: Record<string, { attempted: boolean; correct: boolean }>,
  quizLessonActivityResults: Record<string, { attempted: boolean; correct: boolean }>
) {
  if (q.kind === "lessonActivity") {
    return quizLessonActivityResults[q.id]?.correct === true;
  }
  if (q.kind === "typed") {
    return isTypedAnswerCorrectAgainstAccepted(
      quizTyped[q.id] ?? "",
      q.correctValue,
      q.acceptedValues
    );
  }
  if (q.kind === "numberLineTap" || q.kind === "numberLineJump") {
    const picked = quizLineAnswers[q.id];
    const target = q.line?.target;
    return typeof picked === "number" && picked === target;
  }
  if (q.kind === "chartFill") {
    return quizChartDone[q.id] === true;
  }
  if (q.kind === "mab") {
    const ans = quizMabAnswers[q.id];
    const target = q.mab?.target ?? 0;
    return !!ans && ans.tens * 10 + ans.ones === target;
  }
  if (q.kind === "moneyMake" || q.kind === "moneyChange" || q.kind === "moneyEnough") {
    return quizMoneyAnswers[q.id]?.correct === true;
  }
  const chosen = quizAnswers[q.id];
  return chosen === q.correctIndex;
}

function buildLessonBreakdown(
  questions: QuizQuestion[],
  quizAnswers: Record<string, number>,
  quizTyped: Record<string, string>,
  quizLineAnswers: Record<string, number>,
  quizChartDone: Record<string, boolean>,
  quizMabAnswers: Record<string, { tens: number; ones: number; touched: boolean }>,
  quizMoneyAnswers: Record<string, { attempted: boolean; correct: boolean }>,
  quizLessonActivityResults: Record<string, { attempted: boolean; correct: boolean }>,
  questionsPerLesson: number,
  lessonTitleLookup?: Record<number, string>
): LessonBreakdown[] {
  const breakdown = new Map<number, LessonBreakdown>();

  questions.forEach((q, index) => {
    const lessonNumber = q.lessonNumber ?? Math.floor(index / questionsPerLesson) + 1;
    const current = breakdown.get(lessonNumber) ?? {
      lessonNumber,
      lessonTitle: lessonTitleLookup?.[lessonNumber],
      correct: 0,
      total: 0,
      percent: 0,
      skill: q.skill,
    };
    current.total += 1;
    if (isQuizQuestionCorrect(
      q,
      quizAnswers,
      quizTyped,
      quizLineAnswers,
      quizChartDone,
      quizMabAnswers,
      quizMoneyAnswers,
      quizLessonActivityResults
    )) {
      current.correct += 1;
    }
    if (!current.skill && q.skill) current.skill = q.skill;
    if (!current.lessonTitle && lessonTitleLookup?.[lessonNumber]) {
      current.lessonTitle = lessonTitleLookup[lessonNumber];
    }
    breakdown.set(lessonNumber, current);
  });

  return Array.from(breakdown.values())
    .sort((a, b) => a.lessonNumber - b.lessonNumber)
    .map((item) => ({
      ...item,
      percent: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
    }));
}

function buildQuizQuestionResults(
  questions: QuizQuestion[],
  quizAnswers: Record<string, number>,
  quizTyped: Record<string, string>,
  quizLineAnswers: Record<string, number>,
  quizChartDone: Record<string, boolean>,
  quizMabAnswers: Record<string, { tens: number; ones: number; touched: boolean }>,
  quizMoneyAnswers: Record<string, { attempted: boolean; correct: boolean }>,
  quizLessonActivityResults: Record<string, { attempted: boolean; correct: boolean }>
): TeacherAttemptQuestion[] {
  return questions.map((q) => {
    let selectedAnswer: string | null = null;
    let correctAnswer: string | null = null;

    if (q.kind === "typed") {
      selectedAnswer = (quizTyped[q.id] ?? "").trim() || null;
      correctAnswer = q.correctValue ?? q.acceptedValues?.[0] ?? null;
    } else if (q.kind === "mcq" || q.kind === "ordering" || q.kind === "audio") {
      const selectedIndex = quizAnswers[q.id];
      selectedAnswer =
        typeof selectedIndex === "number" && Array.isArray(q.options) ? q.options[selectedIndex] ?? null : null;
      correctAnswer =
        typeof q.correctIndex === "number" && Array.isArray(q.options) ? q.options[q.correctIndex] ?? null : null;
    } else if (q.kind === "numberLineTap" || q.kind === "numberLineJump") {
      selectedAnswer = typeof quizLineAnswers[q.id] === "number" ? String(quizLineAnswers[q.id]) : null;
      correctAnswer = typeof q.line?.target === "number" ? String(q.line.target) : null;
    } else if (q.kind === "chartFill") {
      selectedAnswer = quizChartDone[q.id] ? "completed" : null;
      correctAnswer = "completed";
    } else if (q.kind === "mab") {
      const answer = quizMabAnswers[q.id];
      selectedAnswer = answer ? String(answer.tens * 10 + answer.ones) : null;
      correctAnswer = typeof q.mab?.target === "number" ? String(q.mab.target) : null;
    } else if (q.kind === "moneyMake") {
      const result = quizMoneyAnswers[q.id];
      selectedAnswer = result?.attempted ? (result.correct ? "correct" : "incorrect") : null;
      correctAnswer = "correct";
    } else if (q.kind === "moneyChange") {
      const result = quizMoneyAnswers[q.id];
      selectedAnswer = result?.attempted ? (result.correct ? "correct" : "incorrect") : null;
      correctAnswer = typeof q.moneyChange?.answer === "number" ? String(q.moneyChange.answer) : "correct";
    } else if (q.kind === "moneyEnough") {
      const result = quizMoneyAnswers[q.id];
      selectedAnswer = result?.attempted ? (result.correct ? "correct" : "incorrect") : null;
      correctAnswer = q.moneyEnough?.answer ?? "correct";
    } else if (q.kind === "lessonActivity") {
      const result = quizLessonActivityResults[q.id];
      selectedAnswer = result?.attempted ? (result.correct ? "correct" : "incorrect") : null;
      correctAnswer = "correct";
    }

    return {
      questionId: q.id,
      prompt: q.prompt,
      lessonTag: q.lessonTag != null ? String(q.lessonTag) : null,
      skillTag: q.skill ?? q.quizMeta?.type ?? null,
      selectedAnswer,
      correctAnswer,
      correct: isQuizQuestionCorrect(
        q,
        quizAnswers,
        quizTyped,
        quizLineAnswers,
        quizChartDone,
        quizMabAnswers,
        quizMoneyAnswers,
        quizLessonActivityResults
      ),
    };
  });
}

function getWeakestLessonBreakdown(items: LessonBreakdown[]): LessonBreakdown | null {
  if (items.length === 0) return null;
  return [...items].sort((a, b) => {
    if (a.percent !== b.percent) return a.percent - b.percent;
    if (a.correct !== b.correct) return a.correct - b.correct;
    return a.lessonNumber - b.lessonNumber;
  })[0] ?? null;
}

function getLowestLessonBreakdowns(items: LessonBreakdown[]): LessonBreakdown[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => {
    if (a.percent !== b.percent) return a.percent - b.percent;
    if (a.correct !== b.correct) return a.correct - b.correct;
    return a.lessonNumber - b.lessonNumber;
  });
  const lowest = sorted[0];
  if (!lowest) return [];
  return sorted.filter(
    (item) => item.percent === lowest.percent && item.correct === lowest.correct
  );
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueInts(n: number, min: number, max: number, avoid: number[] = []) {
  const set = new Set<number>();
  const avoidSet = new Set(avoid);
  while (set.size < n) {
    const x = randInt(min, max);
    if (!avoidSet.has(x)) set.add(x);
  }
  return Array.from(set);
}

const WORDS_0_20 = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

function toWord(n: number) {
  if (n <= 20) return WORDS_0_20[n];
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  const tensWord: Record<number, string> = {
    30: "thirty",
    40: "forty",
    50: "fifty",
  };
  if (n < 30) return ones === 0 ? "twenty" : `twenty-${WORDS_0_20[ones]}`;
  if (n % 10 === 0) return tensWord[tens] ?? String(n);
  if (tensWord[tens]) return `${tensWord[tens]}-${WORDS_0_20[ones]}`;
  return String(n);
}

function normalizeWord(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, "");
}

function numberToWords(n: number): string {
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  if (!Number.isFinite(n)) return String(n);
  if (n < 0) return `minus ${numberToWords(Math.abs(n))}`;
  if (n < 20) return ones[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const remainder = n % 10;
    return remainder === 0 ? tens[ten] : `${tens[ten]} ${ones[remainder]}`;
  }
  if (n < 1000) {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return remainder === 0
      ? `${ones[hundred]} hundred`
      : `${ones[hundred]} hundred ${numberToWords(remainder)}`;
  }

  return String(n);
}

function normalizeAnswerText(input?: string | number | null) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function isTypedAnswerCorrect(
  rawTyped?: string | number | null,
  rawCorrect?: string | number | null
) {
  const typed = normalizeAnswerText(rawTyped);
  if (typed === "") return false;

  const correctText = String(rawCorrect ?? "");
  if (typed === normalizeAnswerText(correctText)) return true;

  const typedNumber = Number(String(rawTyped).replace(/,/g, "").trim());
  const correctNumber = Number(correctText.replace(/,/g, "").trim());
  if (
    Number.isFinite(typedNumber) &&
    Number.isFinite(correctNumber) &&
    Math.abs(typedNumber - correctNumber) < 0.000001
  ) {
    return true;
  }

  const numericCorrect = Number(correctText);
  if (!Number.isNaN(numericCorrect)) {
    return typed === normalizeAnswerText(numberToWords(numericCorrect));
  }

  return false;
}

function isTypedAnswerCorrectAgainstAccepted(
  rawTyped: string | number | null | undefined,
  rawCorrect: string | number | null | undefined,
  acceptedValues?: string[]
) {
  if (isTypedAnswerCorrect(rawTyped, rawCorrect)) return true;
  if (!acceptedValues || acceptedValues.length === 0) return false;
  return acceptedValues.some((value) => isTypedAnswerCorrect(rawTyped, value));
}

function makeFindNumberQuestion(min: number, max: number): QuizQuestion {
  const answer = randInt(min, max);
  const distractors = uniqueInts(3, min, max, [answer]);
  const options = shuffle([answer, ...distractors]).map(String);
  const correctIndex = options.indexOf(String(answer));
  return {
    id: "",
    kind: "audio",
    prompt: "Tap Listen, then choose the number you hear.",
    options,
    correctIndex,
    audioText: String(answer),
  };
}

function makeAudioPickQuestion(min: number, max: number): QuizQuestion {
  const answer = randInt(min, max);
  const distractors = uniqueInts(3, min, max, [answer]);
  const options = shuffle([answer, ...distractors]).map(String);
  const correctIndex = options.indexOf(String(answer));
  return {
    id: "",
    kind: "audio",
    prompt: "Tap Listen, then choose the number you hear.",
    options,
    correctIndex,
    audioText: String(answer),
  };
}

function makeBeforeAfterQuestion(min: number, max: number): QuizQuestion {
  const target = randInt(min + 1, max - 1);
  const askAfter = Math.random() < 0.5;
  const answer = askAfter ? target + 1 : target - 1;
  const distractors = uniqueInts(3, min, max, [answer]);
  const options = shuffle([answer, ...distractors]).map(String);
  const correctIndex = options.indexOf(String(answer));
  return {
    id: "",
    kind: "mcq",
    prompt: askAfter
      ? `What number comes after ${target}?`
      : `What number comes before ${target}?`,
    options,
    correctIndex,
  };
}

function makeTensOnesQuestion(min: number, max: number): QuizQuestion {
  const target = randInt(min, max);
  const tens = Math.floor(target / 10);
  const ones = target % 10;
  const correct = `${tens} tens, ${ones} ones`;
  const options = new Set<string>([correct]);
  while (options.size < 4) {
    const dt = randInt(1, 9);
    const do1 = randInt(0, 9);
    options.add(`${dt} tens, ${do1} ones`);
  }
  const list = shuffle(Array.from(options));
  const correctIndex = list.indexOf(correct);
  return {
    id: "",
    kind: "mcq",
    prompt: `${target} = ?`,
    options: list,
    correctIndex,
  };
}

function makePartitionTensOnesQuestion(min: number, max: number): QuizQuestion {
  const target = randInt(min, max);
  const tens = Math.floor(target / 10) * 10;
  const ones = target - tens;
  const correct = `${tens} + ${ones}`;
  const options = new Set<string>([correct]);
  while (options.size < 4) {
    const a = randInt(10, target - 1);
    const b = randInt(1, target - 1);
    if (a + b === target) continue;
    options.add(`${a} + ${b}`);
  }
  const list = shuffle(Array.from(options));
  const correctIndex = list.indexOf(correct);
  return {
    id: "",
    kind: "mcq",
    prompt: `Partition ${target}`,
    options: list,
    correctIndex,
  };
}

function makeMatchRepresentationQuestion(min: number, max: number): QuizQuestion {
  const target = randInt(min, max);
  const tens = Math.floor(target / 10);
  const ones = target % 10;
  const distractors = uniqueInts(3, min, max, [target]);
  const options = shuffle([target, ...distractors]).map(String);
  const correctIndex = options.indexOf(String(target));
  return {
    id: "",
    kind: "mcq",
    prompt: `${tens} tens and ${ones} ones is:`,
    options,
    correctIndex,
  };
}

function makeMabBuildQuestion(min: number, max: number): QuizQuestion {
  const target = randInt(min, max);
  return {
    id: "",
    kind: "mab",
    prompt: "Build the number.",
    mab: {
      target,
      maxTens: 10,
      maxOnes: 10,
    },
  };
}

function makeCountDotsQuestion(minCount: number, maxCount: number): QuizQuestion {
  const count = randInt(minCount, maxCount);
  const layout = makeDotsLayout(maxCount);
  const set = new Set<number>([count]);
  while (set.size < 4) {
    set.add(randInt(minCount, maxCount));
  }
  const options = shuffle(Array.from(set)).map(String);
  const correctIndex = options.indexOf(String(count));
  return {
    id: "",
    kind: "mcq",
    prompt: "How many counters?",
    options,
    correctIndex,
    visual: {
      type: "dots",
      count,
      cols: layout.cols,
      rows: layout.rows,
      dotSize: layout.dotSize,
      gap: layout.gap,
    },
  };
}

function makeLargestQuestion(min: number, max: number): QuizQuestion {
  const nums = uniqueInts(4, min, max);
  const answer = Math.max(...nums);
  const options = shuffle(nums).map(String);
  const correctIndex = options.indexOf(String(answer));
  return {
    id: "",
    kind: "mcq",
    prompt: "Which number is the largest?",
    options,
    correctIndex,
  };
}

function makeOrderQuestion(min: number, max: number): QuizQuestion {
  const nums = uniqueInts(3, min, max);
  const sorted = [...nums].sort((a, b) => a - b);
  const correct = sorted.join(", ");
  const wrong1 = shuffle(nums).join(", ");
  const wrong2 = shuffle(nums).join(", ");
  const wrong3 = shuffle(nums).join(", ");
  const options = shuffle([correct, wrong1, wrong2, wrong3]);
  const correctIndex = options.indexOf(correct);
  return {
    id: "",
    kind: "mcq",
    prompt: "Which list is in order (smallest → largest)?",
    options,
    correctIndex,
  };
}

function makeSequenceQuestion(min: number, max: number): QuizQuestion {
  const start = randInt(min, max - 3);
  const answer = start + 2;
  const distractors = uniqueInts(3, min, max, [answer]);
  const options = shuffle([answer, ...distractors]).map(String);
  const correctIndex = options.indexOf(String(answer));
  return {
    id: "",
    kind: "mcq",
    prompt: `What number comes next? ${start}, ${start + 1}, __, ${start + 3}`,
    options,
    correctIndex,
  };
}

function makeTypeNumberQuestion(min: number, max: number): QuizQuestion {
  const answer = randInt(min, max);
  return {
    id: "",
    kind: "typed",
    prompt: `Write the word for ${answer}.`,
    correctValue: toWord(answer),
  };
}

function makeNumberLineTapQuestion(min: number, max: number): QuizQuestion {
  const target = randInt(min, max);
  return {
    id: "",
    kind: "numberLineTap",
    prompt: "Tap where the number belongs.",
    line: { min, max, target },
  };
}

function makeNumberLineJumpQuestion(min: number, max: number): QuizQuestion {
  const start = randInt(min, max - 10);
  const up = Math.random() < 0.5;
  const step = Math.random() < 0.5 ? 1 : 10;
  const jumps = randInt(2, 6);
  const target = Math.min(max, Math.max(min, start + (up ? 1 : -1) * step * jumps));
  return {
    id: "",
    kind: "numberLineJump",
    prompt: `Jump ${up ? "forward" : "back"} ${step}s.`,
    line: { min, max, target, start, steps: [step, -step] },
  };
}

function makeChartFillQuestion(min: number, max: number): QuizQuestion {
  const missing = uniqueInts(6, min, max);
  return {
    id: "",
    kind: "chartFill",
    prompt: "Fill the missing numbers.",
    chart: { min, max, missing },
  };
}

function pickStartForStep(step: number, min: number, max: number) {
  if (step === 2) {
    const first = min % 2 === 0 ? min : min + 1;
    const count = Math.max(1, Math.floor((max - first) / 2) + 1);
    return first + 2 * randInt(0, count - 1);
  }
  if (step === 5) {
    let first = min;
    if (first % 10 !== 5) first += (15 - (first % 10)) % 10;
    const count = Math.max(1, Math.floor((max - first) / 10) + 1);
    return first + 10 * randInt(0, count - 1);
  }
  if (step === 10) {
    let first = min + ((10 - (min % 10)) % 10);
    const count = Math.max(1, Math.floor((max - first) / 10) + 1);
    return first + 10 * randInt(0, count - 1);
  }
  return randInt(min, max);
}

function makeGroupRowsQuestion({
  groupsMin = 3,
  groupsMax = 6,
  perMin = 2,
  perMax = 6,
  ask = "total",
}: {
  groupsMin?: number;
  groupsMax?: number;
  perMin?: number;
  perMax?: number;
  ask?: "total" | "groups";
}): QuizQuestion {
  const groups = randInt(groupsMin, groupsMax);
  const perGroup = randInt(perMin, perMax);
  const total = groups * perGroup;
  const correct = ask === "groups" ? groups : total;
  const options = shuffle(
    uniqueInts(3, Math.max(1, correct - 4), correct + 4, [correct]).concat([
      correct,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: ask === "groups" ? "How many groups?" : "How many altogether?",
    options,
    correctIndex: options.findIndex((o) => o === String(correct)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 16,
      gap: 6,
      rowGap: 8,
    },
  };
}

function makeMissingGroupSizeQuestion(): QuizQuestion {
  const groups = randInt(2, 5);
  const perGroup = randInt(2, 6);
  const total = groups * perGroup;
  const options = shuffle([2, 3, 4, 5, 6]).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `${groups} groups of __ makes ${total}`,
    options,
    correctIndex: options.findIndex((o) => o === String(perGroup)),
  };
}

function makeGroupingEstimateQuestion(): QuizQuestion {
  const tensGroups = randInt(2, 6);
  const ones = randInt(1, 9);
  const total = tensGroups * 10 + ones;
  const options = shuffle(
    uniqueInts(3, Math.max(10, total - 8), total + 8, [total]).concat([total])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: "What number is shown?",
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "rows",
      rows: [...Array.from({ length: tensGroups }, () => 10), ones],
      dotSize: 14,
      gap: 5,
      rowGap: 6,
    },
  };
}

function makeSkipCountMissingQuestion(): QuizQuestion {
  const steps = [2, 5, 10];
  const step = steps[randInt(0, steps.length - 1)];
  const length = 5;
  const start = pickStartForStep(step, 0, 50);
  const blankIndex = randInt(1, length - 1);
  const seq = Array.from({ length }, (_, i) => start + i * step);
  const answer = seq[blankIndex];
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - step * 2), answer + step * 2, [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Fill the missing number: ${seq
      .map((v, i) => (i === blankIndex ? "__" : v))
      .join(", ")}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeSkipCountTrackQuestion(): QuizQuestion {
  const steps = [2, 5, 10];
  const step = steps[randInt(0, steps.length - 1)];
  const current = pickStartForStep(step, 0, 50);
  const answer = current + step;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - step * 2), answer + step * 2, [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Tap the next number. Start at ${current}, count by ${step}s.`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeCountGroupsQuestion(): QuizQuestion {
  const groups = randInt(4, 6);
  const perGroup = randInt(2, 5);
  const total = groups * perGroup;
  const options = shuffle(
    uniqueInts(3, Math.max(1, total - 6), total + 6, [total]).concat([total])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: "How many altogether?",
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 16,
      gap: 6,
      rowGap: 8,
    },
  };
}

function makeAdditionQuestion(sumMax = 20): QuizQuestion {
  let a = 0;
  let b = 0;
  for (let i = 0; i < 20; i += 1) {
    a = randInt(0, 10);
    b = randInt(0, 10);
    if (a + b <= sumMax) break;
  }
  const answer = a + b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), answer + 5, [answer]).concat([answer])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `What is ${a} + ${b}?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeMissingWholeQuestion(): QuizQuestion {
  let a = 0;
  let b = 0;
  for (let i = 0; i < 20; i += 1) {
    a = randInt(0, 10);
    b = randInt(0, 10);
    if (a + b <= 20 && !(a === 0 && b === 0)) break;
  }
  const answer = a + b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), answer + 5, [answer]).concat([answer])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `What is the whole? ${a} + ${b} = ?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeMissingPartQuestion(): QuizQuestion {
  let a = 0;
  let b = 0;
  let whole = 0;
  for (let i = 0; i < 20; i += 1) {
    a = randInt(0, 10);
    b = randInt(0, 10);
    whole = a + b;
    if (whole <= 20 && !(a === 0 && b === 0)) break;
  }
  const missingA = Math.random() < 0.5;
  const answer = missingA ? a : b;
  const known = missingA ? b : a;
  const options = shuffle(
    uniqueInts(3, 0, 10, [answer]).concat([answer])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `What is the missing part? ? + ${known} = ${whole}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeMake10Question(): QuizQuestion {
  let a = 8;
  let b = 7;
  for (let i = 0; i < 20; i += 1) {
    a = randInt(6, 9);
    const need = 10 - a;
    b = randInt(Math.max(6, need), 9);
    if (b >= need) break;
  }
  const answer = a + b;
  const options = shuffle(
    uniqueInts(3, Math.max(10, answer - 5), answer + 5, [answer]).concat([answer])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Make 10, then add the rest: ${a} + ${b}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeDoublesQuestion(): QuizQuestion {
  const n = randInt(2, 10);
  const answer = n + n;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 6), answer + 6, [answer]).concat([answer])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Doubles: ${n} + ${n} = ?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeNearDoublesQuestion(): QuizQuestion {
  const n = randInt(2, 9);
  const plusOne = Math.random() < 0.5;
  const a = n;
  const b = plusOne ? n + 1 : n - 1;
  const answer = a + b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 6), answer + 6, [answer]).concat([answer])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Near doubles: ${a} + ${b} = ?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeOpChoiceStoryQuestion(): QuizQuestion {
  const isAdd = Math.random() < 0.5;
  const a = randInt(3, 12);
  const b = randInt(1, Math.min(8, isAdd ? 20 - a : a));
  const name = Math.random() < 0.5 ? "Tom" : "Mia";
  const story = isAdd
    ? `${name} had ${a} stickers. ${name} got ${b} more. How many altogether?`
    : `${name} had ${a} stickers. ${name} gave away ${b}. How many left?`;
  const options = ["Add", "Subtract"];
  const correctIndex = isAdd ? 0 : 1;
  return {
    id: "",
    kind: "mcq",
    prompt: `Choose the operation: ${story}`,
    options,
    correctIndex,
  };
}

function makeStorySolveQuestion(): QuizQuestion {
  const isAdd = Math.random() < 0.5;
  const a = randInt(4, 14);
  const b = randInt(1, Math.min(8, isAdd ? 20 - a : a));
  const story = isAdd
    ? `There were ${a} kids on the playground. ${b} more came. How many altogether?`
    : `There were ${a} birds in a tree. ${b} flew away. How many left?`;
  const answer = isAdd ? a + b : a - b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: story,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeMoneyMakeQuestion(): QuizQuestion {
  const target = randInt(5, 9);
  const options = shuffle(
    uniqueInts(3, 3, 12, [target]).concat([target])
  ).map(String);
  return {
    id: "",
    kind: "moneyMake",
    prompt: `Show me $${target} using the money below.`,
    options,
    correctIndex: options.findIndex((o) => o === String(target)),
    moneyMake: { target },
  };
}

function makeMoneyChangeQuestion(): QuizQuestion {
  const cost = randInt(2, 9);
  const paid = 10;
  const answer = paid - cost;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 4), Math.min(10, answer + 4), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "moneyChange",
    prompt: `You pay $10 for a $${cost} toy. How much change?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
    moneyChange: { paid, cost, options, answer },
  };
}

function makeMoneyEnoughQuestion(): QuizQuestion {
  const have = randInt(4, 10);
  const cost = randInt(5, 11);
  const options = ["YES", "NO"];
  const correctIndex = have >= cost ? 0 : 1;
  return {
    id: "",
    kind: "moneyEnough",
    prompt: `You have $${have}. The toy costs $${cost}. Do you have enough?`,
    options,
    correctIndex,
    moneyEnough: { have, cost, answer: have >= cost ? "YES" : "NO" },
  };
}

function makeWeek8StoryQuestion(): QuizQuestion {
  const isAdd = Math.random() < 0.5;
  const a = randInt(3, 12);
  const b = randInt(2, Math.min(8, isAdd ? 20 - a : a));
  const name = Math.random() < 0.5 ? "Liam" : "Ava";
  const story = isAdd
    ? `${name} has ${a} apples. ${name} gets ${b} more. How many now?`
    : `${name} has ${a} apples. ${name} eats ${b}. How many left?`;
  const answer = isAdd ? a + b : a - b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: story,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeWeek8BarModelQuestion(): QuizQuestion {
  const total = randInt(12, 20);
  const part = randInt(3, Math.min(10, total - 3));
  const answer = total - part;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `${part} + ? = ${total}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeWeek8CompareQuestion(): QuizQuestion {
  const a = randInt(10, 18);
  const b = randInt(4, Math.min(12, a - 1));
  const answer = a - b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 4), Math.min(20, answer + 4), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Tom has ${a} stickers. Mia has ${b}. How many more does Tom have?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeWeek8MoneyAddQuestion(): QuizQuestion {
  let a = randInt(4, 10);
  let b = randInt(4, 10);
  for (let i = 0; i < 10; i += 1) {
    if (a + b <= 20) break;
    a = randInt(4, 10);
    b = randInt(4, 10);
  }
  const answer = a + b;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Juice $${a}, Chips $${b}. How much altogether?`,
    options: options.map((o) => `$${o}`),
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeWeek8MoneyMoreQuestion(): QuizQuestion {
  const have = randInt(9, 16);
  const cost = randInt(have + 2, 20);
  const answer = cost - have;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 3), Math.min(10, answer + 3), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `You only have $${have} and the cost is $${cost}. How much more do you need?`,
    options: options.map((o) => `$${o}`),
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeWeek8MoneyChangeQuestion(): QuizQuestion {
  const paid = 20;
  const cost = randInt(10, 18);
  const answer = paid - cost;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 3), Math.min(10, answer + 3), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `You pay $${paid} for a $${cost} toy. How much change will you get?`,
    options: options.map((o) => `$${o}`),
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeWeek9ShareEachQuestion(): QuizQuestion {
  let total = 12;
  let groups = 3;
  for (let i = 0; i < 50; i += 1) {
    groups = randInt(2, 5);
    total = randInt(6, 20);
    if (total % groups === 0) break;
  }
  const answer = total / groups;
  const options = shuffle(
    uniqueInts(3, Math.max(1, answer - 3), Math.min(10, answer + 3), [answer]).concat([
      answer,
    ])
  ).map(String);
  const layout = makeDotsLayout(20);
  return {
    id: "",
    kind: "mcq",
    prompt: `Share ${total} counters between ${groups} children. How many in each?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
    visual: {
      type: "dots",
      count: total,
      cols: layout.cols,
      rows: layout.rows,
      dotSize: layout.dotSize,
      gap: layout.gap,
    },
  };
}

function makeWeek9DealQuestion(): QuizQuestion {
  let total = 12;
  let groups = 3;
  for (let i = 0; i < 50; i += 1) {
    groups = randInt(2, 5);
    total = randInt(6, 20);
    if (total % groups === 0) break;
  }
  const answer = total / groups;
  const options = shuffle(
    uniqueInts(3, Math.max(1, answer - 3), Math.min(10, answer + 3), [answer]).concat([
      answer,
    ])
  ).map(String);
  const layout = makeDotsLayout(20);
  return {
    id: "",
    kind: "mcq",
    prompt: `Deal ${total} counters into ${groups} equal groups. How many in each?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
    visual: {
      type: "dots",
      count: total,
      cols: layout.cols,
      rows: layout.rows,
      dotSize: layout.dotSize,
      gap: layout.gap,
    },
  };
}

function makeWeek9FairQuestion(): QuizQuestion {
  const groups = randInt(2, 5);
  const per = randInt(1, 4);
  const isFair = Math.random() < 0.5;
  let rows = Array.from({ length: groups }, () => per);
  if (!isFair) {
    const idx = randInt(0, groups - 1);
    const delta = Math.random() < 0.5 && per > 1 ? -1 : 1;
    rows = rows.map((v, i) => (i === idx ? v + delta : v));
  }
  return {
    id: "",
    kind: "mcq",
    prompt: "Is this shared equally?",
    options: ["YES", "NO"],
    correctIndex: isFair ? 0 : 1,
    visual: {
      type: "rows",
      rows,
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek9DiagramEachQuestion(): QuizQuestion {
  let total = 12;
  let groups = 3;
  for (let i = 0; i < 50; i += 1) {
    groups = randInt(2, 5);
    total = randInt(6, 20);
    if (total % groups === 0) break;
  }
  const per = total / groups;
  const options = shuffle(
    uniqueInts(3, Math.max(1, per - 3), Math.min(10, per + 3), [per]).concat([
      per,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Diagram: ${total} shared into ${groups} groups. How many in each?`,
    options,
    correctIndex: options.findIndex((o) => o === String(per)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => per),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek9DiagramGroupsQuestion(): QuizQuestion {
  let total = 12;
  let groups = 3;
  for (let i = 0; i < 50; i += 1) {
    groups = randInt(2, 5);
    total = randInt(6, 20);
    if (total % groups === 0) break;
  }
  const per = total / groups;
  const options = shuffle(
    uniqueInts(3, 2, 5, [groups]).concat([groups])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: "Each row is one group. How many groups are shown?",
    options,
    correctIndex: options.findIndex((o) => o === String(groups)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => per),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
      highlightRow: 0,
    },
  };
}

function makeWeek9MissingGroupSizeQuestion(): QuizQuestion {
  let total = 12;
  let groups = 3;
  for (let i = 0; i < 50; i += 1) {
    groups = randInt(2, 5);
    total = randInt(6, 20);
    if (total % groups === 0) break;
  }
  const per = total / groups;
  const options = shuffle(
    uniqueInts(3, Math.max(1, per - 3), Math.min(10, per + 3), [per]).concat([
      per,
    ])
  ).map(String);
  const layout = makeDotsLayout(20);
  return {
    id: "",
    kind: "mcq",
    prompt: `${total} shared into ${groups} groups. Each group has ___.`,
    options,
    correctIndex: options.findIndex((o) => o === String(per)),
    visual: {
      type: "dots",
      count: total,
      cols: layout.cols,
      rows: layout.rows,
      dotSize: layout.dotSize,
      gap: layout.gap,
    },
  };
}

function makeWeek9PackBoxesQuestion(): QuizQuestion {
  let total = 12;
  let size = 3;
  for (let i = 0; i < 50; i += 1) {
    size = randInt(2, 5);
    total = randInt(6, 20);
    if (total % size === 0) break;
  }
  const groups = total / size;
  const options = shuffle(
    uniqueInts(3, Math.max(1, groups - 3), Math.min(10, groups + 3), [groups]).concat([
      groups,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Pack ${total} apples into boxes of ${size}. How many boxes?`,
    options,
    correctIndex: options.findIndex((o) => o === String(groups)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => size),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek9GroupGrabQuestion(): QuizQuestion {
  let total = 12;
  let size = 3;
  for (let i = 0; i < 50; i += 1) {
    size = randInt(2, 5);
    total = randInt(6, 20);
    if (total % size === 0) break;
  }
  const groups = total / size;
  const options = shuffle(
    uniqueInts(3, Math.max(1, groups - 3), Math.min(10, groups + 3), [groups]).concat([
      groups,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Make equal groups of ${size} from ${total} counters. How many groups?`,
    options,
    correctIndex: options.findIndex((o) => o === String(groups)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => size),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10TapGroupsQuestion(): QuizQuestion {
  const groups = randInt(2, 4);
  const perGroup = randInt(2, 5);
  const total = groups * perGroup;
  const options = shuffle(
    uniqueInts(3, Math.max(4, total - 6), Math.min(20, total + 6), [total]).concat([
      total,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Tap the groups to skip count. How many altogether?`,
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10BuildGroupsQuestion(): QuizQuestion {
  const perGroup = randInt(3, 5);
  const groups = randInt(2, 4);
  const total = groups * perGroup;
  const options = shuffle(
    uniqueInts(3, Math.max(4, total - 6), Math.min(20, total + 6), [total]).concat([
      total,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Make groups of ${perGroup}. How many altogether?`,
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10ChooseSkipCountQuestion(): QuizQuestion {
  const perGroup = [2, 5, 10][randInt(0, 2)];
  const groups = perGroup === 10 ? 2 : randInt(2, 4);
  const options = ["Count by 2s", "Count by 5s", "Count by 10s"];
  const answer =
    perGroup === 2 ? "Count by 2s" : perGroup === 5 ? "Count by 5s" : "Count by 10s";
  return {
    id: "",
    kind: "mcq",
    prompt: `Choose the skip count for ${groups} groups of ${perGroup}.`,
    options,
    correctIndex: options.findIndex((o) => o === answer),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10ArrayQuestion(): QuizQuestion {
  let rows = randInt(2, 4);
  let cols = randInt(2, 5);
  while (rows * cols > 20) {
    rows = randInt(2, 4);
    cols = randInt(2, 5);
  }
  const total = rows * cols;
  const options = shuffle(
    uniqueInts(3, Math.max(4, total - 6), Math.min(20, total + 6), [total]).concat([
      total,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Array: ${rows} rows and ${cols} columns. How many dots?`,
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "dots",
      count: total,
      cols,
      rows,
      dotSize: 14,
      gap: 8,
    },
  };
}

function makeWeek10BarGroupQuestion(): QuizQuestion {
  const groups = randInt(2, 4);
  const perGroup = randInt(3, 5);
  const total = groups * perGroup;
  const equation = Array.from({ length: groups }, () => perGroup).join(" + ");
  const options = shuffle(
    uniqueInts(3, Math.max(4, total - 6), Math.min(20, total + 6), [total]).concat([
      total,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `${equation} = ? How many altogether?`,
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10MissingGroupCountQuestion(): QuizQuestion {
  const perGroup = randInt(2, 4);
  const groups = randInt(2, 5);
  const total = perGroup * groups;
  const options = shuffle(
    uniqueInts(3, 2, 6, [groups]).concat([groups])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `___ groups of ${perGroup} = ${total}`,
    options,
    correctIndex: options.findIndex((o) => o === String(groups)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10StoryTotalQuestion(): QuizQuestion {
  const groups = randInt(3, 5);
  const perGroup = randInt(2, 4);
  const total = groups * perGroup;
  const options = shuffle(
    uniqueInts(3, Math.max(4, total - 6), Math.min(20, total + 6), [total]).concat([
      total,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `There are ${groups} baskets with ${perGroup} apples each. How many apples?`,
    options,
    correctIndex: options.findIndex((o) => o === String(total)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10HowManyGroupsStoryQuestion(): QuizQuestion {
  const perGroup = randInt(2, 4);
  const groups = randInt(3, 5);
  const total = perGroup * groups;
  const options = shuffle(
    uniqueInts(3, 2, 6, [groups]).concat([groups])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `${total} cookies. ${perGroup} in each bag. How many bags?`,
    options,
    correctIndex: options.findIndex((o) => o === String(groups)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeWeek10TwoStepQuestion(): QuizQuestion {
  const groups = randInt(4, 5);
  const perGroup = randInt(2, 3);
  const total = groups * perGroup;
  const broken = randInt(1, Math.min(4, total - 1));
  const answer = total - broken;
  const options = shuffle(
    uniqueInts(3, Math.max(2, answer - 6), Math.min(20, answer + 6), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `${groups} boxes with ${perGroup} toys each. ${broken} toys break. How many left?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
    visual: {
      type: "rows",
      rows: Array.from({ length: groups }, () => perGroup),
      dotSize: 14,
      gap: 8,
      rowGap: 10,
    },
  };
}

function makeDotsLayout(max: number) {
  if (max <= 20) return { cols: 5, rows: 4, dotSize: 18, gap: 10 };
  if (max <= 30) return { cols: 6, rows: 5, dotSize: 16, gap: 10 };
  return { cols: 10, rows: 5, dotSize: 14, gap: 9 };
}

function makeSubtractionQuestion(max = 20): QuizQuestion {
  let total = 10;
  let remove = 4;
  for (let i = 0; i < 20; i += 1) {
    total = randInt(6, max);
    remove = randInt(1, Math.min(10, total - 1));
    if (total - remove >= 0) break;
  }
  const answer = total - remove;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(max, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `What is ${total} - ${remove}?`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeSubtractionMissingPartQuestion(): QuizQuestion {
  let total = 12;
  let part = 5;
  for (let i = 0; i < 20; i += 1) {
    total = randInt(8, 20);
    part = randInt(1, Math.min(10, total - 1));
    if (total - part >= 0) break;
  }
  const answer = total - part;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Missing part: ${part} + ? = ${total}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeSubtractionMake10Question(): QuizQuestion {
  let total = 12;
  let remove = 8;
  for (let i = 0; i < 20; i += 1) {
    total = randInt(11, 20);
    const jumpToTen = total - 10;
    remove = randInt(Math.max(2, jumpToTen), 9);
    if (total - remove >= 0) break;
  }
  const answer = total - remove;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Make 10, then subtract: ${total} - ${remove}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

function makeSubtractionCountUpQuestion(): QuizQuestion {
  let total = 15;
  let remove = 8;
  for (let i = 0; i < 20; i += 1) {
    total = randInt(10, 20);
    remove = randInt(4, 10);
    if (total - remove >= 0) break;
  }
  const answer = total - remove;
  const options = shuffle(
    uniqueInts(3, Math.max(0, answer - 5), Math.min(20, answer + 5), [answer]).concat([
      answer,
    ])
  ).map(String);
  return {
    id: "",
    kind: "mcq",
    prompt: `Count up to solve: ${total} - ${remove}`,
    options,
    correctIndex: options.findIndex((o) => o === String(answer)),
  };
}

export default function SessionPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><SessionPage /></Suspense>;
}

function SessionPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = sp.get("year") ?? "Year 3";
  const week = sp.get("week") ?? "1";
  const type = sp.get("type") ?? "lesson"; // "lesson" | "quiz"
  const n = Number(sp.get("n") ?? "1"); // lesson number 1-3 or quiz number

  const isLesson = type === "lesson";
  const title = isLesson ? `Lesson ${n}` : "Weekly Quiz";

  function backToWeek() {
    router.push(
      `/program?year=${encodeURIComponent(year)}&week=${encodeURIComponent(week)}`
    );
  }

  // ---------------------------
  // LESSON CONFIG + DIFFICULTY GATING
  // ---------------------------
  const lessonConfig = useMemo(
    () => getLessonConfig(Number(week), n),
    [week, n]
  );
  const quizConfig = useMemo(
    () => getWeeklyQuizConfig(Number(week)),
    [week]
  );

  // Session-stable start time (persists across re-renders)
  const sessionKeyRef = useRef(`lul_session_${year}_w${week}_${type}_${n}`);
  const [sessionStartTime] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now();
    const stored = sessionStorage.getItem(sessionKeyRef.current);
    if (stored) return Number(stored);
    const now = Date.now();
    sessionStorage.setItem(sessionKeyRef.current, String(now));
    return now;
  });

  // Elapsed seconds + current difficulty gate
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const currentDifficulty = getDifficultyFromTime(elapsedSeconds);

  useEffect(() => {
    if (!isLesson) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      setElapsedSeconds(Math.min(elapsed, 540)); // cap at 9 mins
    }, 1000);
    return () => clearInterval(timer);
  }, [isLesson, sessionStartTime]);

  // Activity rotation within lesson's allowed pool
  const activityBagRef = useRef<string[]>([]);
  function getNextActivityId(): string {
    if (!lessonConfig) return "fallback";
    if (activityBagRef.current.length === 0) {
      // Reshuffle the bag
      activityBagRef.current = shuffle([...lessonConfig.allowedActivityIds]);
    }
    return activityBagRef.current.pop()!;
  }

  // ---------------------------
  // LESSON: Intro screen -> Begin Practice -> Complete
  // ---------------------------
  const [lessonStarted, setLessonStarted] = useState(false);

  const [showPostTestTransition, setShowPostTestTransition] = useState(false);
  const hasEmbeddedLessonVideo =
    year === "Year 4" && Number(week) === 2 && n === 1;
  const quizWeekPlan = useMemo(
    () => getProgramForYear(year).find((plan) => plan.week === Number(week)),
    [year, week]
  );
  const lessonTitleLookup = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        (quizWeekPlan?.lessons ?? []).map((lesson) => [lesson.lesson, lesson.title])
      ),
    [quizWeekPlan]
  );

  function completeLesson() {
    const store = readStore();
    setLessonComplete(store, year, week, n);
    writeStore(store);

    // After Week 12 Lesson 3, route to post-test transition
    if (Number(week) === 12 && n === 3) {
      setShowPostTestTransition(true);
      return;
    }

    backToWeek();
  }

  // ---------------------------
  // QUIZ: 15-question mix from 3 lessons
  // Uses YEAR1_WEEKLY_QUIZZES config: 5 questions per lesson, 80% pass
  // ---------------------------
  function buildQuizQuestions() {
    const qConfig = quizConfig;
    const questionsPerLesson = qConfig?.questionsPerLesson ?? 5;
    const weekPlan = quizWeekPlan;

    if (
      year === "Year 2" ||
      year === "Year 3" ||
      year === "Year 4" ||
      year === "Year 5" ||
      year === "Year 6"
    ) {
      if (weekPlan) {
        return buildStructuredWeeklyQuizQuestions(weekPlan, questionsPerLesson);
      }
    }

    const questions: QuizQuestion[] = [];
    const weekNum = Number(week);
    const isWeek7 = weekNum === 7;
    const isWeek8 = weekNum === 8;
    const isWeek9 = weekNum === 9;
    const isWeek10 = weekNum === 10;
    const isWeek11 = weekNum === 11;
    const isWeek2 = weekNum === 2;
    const isWeek3 = weekNum === 3;
    const isWeek4 = weekNum === 4;
    const isWeek5 = weekNum === 5;
    const isWeek6 = weekNum === 6;
    const rangeMax = isWeek2 ? 120 : 50;
    const lesson1Generators = isWeek11
      ? [
          () => makeAdditionQuestion(20),
          () => makeSubtractionQuestion(20),
          () => makeMake10Question(),
        ]
      : isWeek10
      ? [
          () => makeWeek10TapGroupsQuestion(),
          () => makeWeek10BuildGroupsQuestion(),
          () => makeWeek10ChooseSkipCountQuestion(),
        ]
      : isWeek9
      ? [
          () => makeWeek9ShareEachQuestion(),
          () => makeWeek9DealQuestion(),
          () => makeWeek9FairQuestion(),
        ]
      : isWeek8
      ? [
          () => makeWeek8StoryQuestion(),
          () => makeWeek8StoryQuestion(),
          () => makeWeek8StoryQuestion(),
        ]
      : isWeek7
      ? [
          () => makeOpChoiceStoryQuestion(),
          () => makeOpChoiceStoryQuestion(),
          () => makeOpChoiceStoryQuestion(),
        ]
      : isWeek6
      ? [
          () => makeSubtractionQuestion(20),
          () => makeSubtractionQuestion(20),
          () => makeSubtractionQuestion(20),
        ]
      : isWeek5
      ? [
          () => makeAdditionQuestion(20),
          () => makeAdditionQuestion(20),
          () => makeAdditionQuestion(20),
        ]
      : isWeek4
      ? [
          () => makeGroupRowsQuestion({ ask: "groups" }),
          () => makeGroupRowsQuestion({ ask: "total" }),
          () => makeMissingGroupSizeQuestion(),
        ]
      : isWeek3
      ? [
          () => makeTensOnesQuestion(10, 99),
          () => makeMatchRepresentationQuestion(10, 99),
          () => makeTensOnesQuestion(10, 99),
        ]
      : [
          () => makeFindNumberQuestion(0, rangeMax),
          () => makeBeforeAfterQuestion(0, rangeMax),
          () => makeLargestQuestion(0, rangeMax),
        ];
    const lesson2Generators = isWeek11
      ? [
          () => makeDoublesQuestion(),
          () => makeNearDoublesQuestion(),
          () => makeDoublesQuestion(),
        ]
      : isWeek10
      ? [
          () => makeWeek10ArrayQuestion(),
          () => makeWeek10BarGroupQuestion(),
          () => makeWeek10MissingGroupCountQuestion(),
        ]
      : isWeek9
      ? [
          () => makeWeek9DiagramEachQuestion(),
          () => makeWeek9DiagramGroupsQuestion(),
          () => makeWeek9MissingGroupSizeQuestion(),
        ]
      : isWeek8
      ? [
          () => makeWeek8BarModelQuestion(),
          () => makeWeek8CompareQuestion(),
          () => makeWeek8BarModelQuestion(),
        ]
      : isWeek7
      ? [
          () => makeStorySolveQuestion(),
          () => makeStorySolveQuestion(),
          () => makeStorySolveQuestion(),
        ]
      : isWeek6
      ? [
          () => makeSubtractionMissingPartQuestion(),
          () => makeSubtractionMissingPartQuestion(),
          () => makeSubtractionQuestion(20),
        ]
      : isWeek5
      ? [
          () => makeMissingWholeQuestion(),
          () => makeMissingPartQuestion(),
          () => makeMissingPartQuestion(),
        ]
      : isWeek4
      ? [
          () => makeSkipCountMissingQuestion(),
          () => makeSkipCountTrackQuestion(),
          () => makeCountGroupsQuestion(),
        ]
      : isWeek3
      ? [
          () => makePartitionTensOnesQuestion(20, 99),
          () => makePartitionTensOnesQuestion(20, 99),
          () => makePartitionTensOnesQuestion(20, 99),
        ]
      : isWeek2
      ? [
          () => makeCountDotsQuestion(10, 24),
          () => makeCountDotsQuestion(15, 30),
          () => makeCountDotsQuestion(20, 40),
        ]
      : [
          () => makeCountDotsQuestion(5, 12),
          () => makeCountDotsQuestion(10, 20),
          () => makeCountDotsQuestion(15, 25),
        ];
    const lesson3Generators = isWeek11
      ? [
          () => makeAdditionQuestion(20),
          () => makeSubtractionQuestion(20),
          () => makeNearDoublesQuestion(),
        ]
      : isWeek10
      ? [
          () => makeWeek10StoryTotalQuestion(),
          () => makeWeek10HowManyGroupsStoryQuestion(),
          () => makeWeek10TwoStepQuestion(),
        ]
      : isWeek9
      ? [
          () => makeWeek9PackBoxesQuestion(),
          () => makeWeek9GroupGrabQuestion(),
          () => makeWeek9GroupGrabQuestion(),
        ]
      : isWeek8
      ? [
          () => makeWeek8MoneyAddQuestion(),
          () => makeWeek8MoneyMoreQuestion(),
          () => makeWeek8MoneyChangeQuestion(),
        ]
      : isWeek7
      ? [
          () => makeMoneyMakeQuestion(),
          () => makeMoneyEnoughQuestion(),
        ]
      : isWeek6
      ? [
          () => makeSubtractionMake10Question(),
          () => makeSubtractionCountUpQuestion(),
          () => makeSubtractionMissingPartQuestion(),
        ]
      : isWeek5
      ? [
          () => makeMake10Question(),
          () => makeDoublesQuestion(),
          () => makeNearDoublesQuestion(),
        ]
      : isWeek4
      ? [
          () => makeGroupingEstimateQuestion(),
          () => makeGroupRowsQuestion({ ask: "groups" }),
          () => makeGroupRowsQuestion({ ask: "total" }),
        ]
      : isWeek3
      ? [
          () => makeMatchRepresentationQuestion(10, 99),
          () => makeMabBuildQuestion(10, 99),
          () => makeTensOnesQuestion(10, 99),
        ]
      : isWeek2
      ? [
          () => makeNumberLineTapQuestion(0, rangeMax),
          () => makeNumberLineJumpQuestion(0, rangeMax),
          () => makeChartFillQuestion(1, rangeMax),
        ]
      : [
          () => makeOrderQuestion(0, rangeMax),
          () => makeSequenceQuestion(0, rangeMax),
          () => makeTypeNumberQuestion(0, rangeMax),
        ];

    const lesson1Bucket = buildLessonBucketQuizQuestions(1, questionsPerLesson, lesson1Generators);
    const lesson2Bucket = buildLessonBucketQuizQuestions(2, questionsPerLesson, lesson2Generators);
    const lesson3Bucket = buildLessonBucketQuizQuestions(3, questionsPerLesson, lesson3Generators);

    questions.push(...lesson1Bucket.questions, ...lesson2Bucket.questions, ...lesson3Bucket.questions);

    const base = shuffle(questions).map((q, i) => ({ ...q, id: `q${i + 1}` }));
    if (base.length >= 13 && isWeek2) {
      base[11] = {
        ...base[11],
        ...makeAudioPickQuestion(0, rangeMax),
        id: base[11].id,
      };
      base[12] = {
        ...base[12],
        ...makeAudioPickQuestion(0, rangeMax),
        id: base[12].id,
      };
    }

    if (weekPlan) {
      validateStructuredWeeklyQuizQuestions(weekPlan, base, questionsPerLesson);
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[StructuredWeeklyQuiz]", {
        year,
        week: Number(week),
        counts: [
          { lesson: 1, availableActivities: lesson1Generators.length },
          { lesson: 2, availableActivities: lesson2Generators.length },
          { lesson: 3, availableActivities: lesson3Generators.length },
        ],
        selectedPerLesson: [
          { lesson: 1, selectedActivityTypes: lesson1Bucket.selectedKinds },
          { lesson: 2, selectedActivityTypes: lesson2Bucket.selectedKinds },
          { lesson: 3, selectedActivityTypes: lesson3Bucket.selectedKinds },
        ],
      });
    }

    return base;
  }

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  useEffect(() => {
    setQuizQuestions(buildQuizQuestions());
  }, [year, week, quizWeekPlan]);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizTyped, setQuizTyped] = useState<Record<string, string>>({});
  const [quizLineAnswers, setQuizLineAnswers] = useState<Record<string, number>>(
    {}
  );
  const [quizChartDone, setQuizChartDone] = useState<Record<string, boolean>>({});
  const [quizMabAnswers, setQuizMabAnswers] = useState<
    Record<string, { tens: number; ones: number; touched: boolean }>
  >({});
  const [quizMoneyAnswers, setQuizMoneyAnswers] = useState<
    Record<string, { attempted: boolean; correct: boolean }>
  >({});
  const [quizLessonActivityResults, setQuizLessonActivityResults] = useState<
    Record<string, { attempted: boolean; correct: boolean }>
  >({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizGroupTaps, setQuizGroupTaps] = useState<Record<string, boolean[]>>(
    {}
  );
  const speakState = useSpeakState();
  const isWeek9 = Number(week) === 9;
  const isWeek10 = Number(week) === 10;

  useEffect(() => {
    setQuizAnswers({});
    setQuizTyped({});
    setQuizLineAnswers({});
    setQuizChartDone({});
    setQuizMabAnswers({});
    setQuizMoneyAnswers({});
    setQuizLessonActivityResults({});
    setQuizGroupTaps({});
    setQuizSubmitted(false);
    setFinalScore(0);
    setQuizIndex(0);
  }, [quizQuestions]);

  function chooseQuiz(qIndex: number, optIndex: number) {
    if (quizSubmitted) return;
    const q = quizQuestions[qIndex];
    if (!q) return;
    setQuizAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
  }

  const quizComplete = quizQuestions.every((q) => {
    if (q.kind === "lessonActivity") return quizLessonActivityResults[q.id]?.attempted === true;
    if (q.kind === "typed") return (quizTyped[q.id] ?? "").trim().length > 0;
    if (q.kind === "numberLineTap" || q.kind === "numberLineJump") {
      return typeof quizLineAnswers[q.id] === "number";
    }
    if (q.kind === "chartFill") return quizChartDone[q.id] === true;
    if (q.kind === "mab") return quizMabAnswers[q.id]?.touched === true;
    if (q.kind === "moneyMake" || q.kind === "moneyChange" || q.kind === "moneyEnough") {
      return quizMoneyAnswers[q.id]?.attempted === true;
    }
    return typeof quizAnswers[q.id] === "number";
  });

  const quizScore = useMemo(() => {
    return quizQuestions.reduce((acc, q) => {
      return acc + (isQuizQuestionCorrect(
        q,
        quizAnswers,
        quizTyped,
        quizLineAnswers,
        quizChartDone,
        quizMabAnswers,
        quizMoneyAnswers,
        quizLessonActivityResults
      ) ? 1 : 0);
    }, 0);
  }, [
    quizAnswers,
    quizQuestions,
    quizTyped,
    quizLineAnswers,
    quizChartDone,
    quizMabAnswers,
    quizMoneyAnswers,
    quizLessonActivityResults,
  ]);
  const lessonBreakdown = useMemo(
    () =>
      buildLessonBreakdown(
        quizQuestions,
        quizAnswers,
        quizTyped,
        quizLineAnswers,
        quizChartDone,
        quizMabAnswers,
        quizMoneyAnswers,
        quizLessonActivityResults,
        quizConfig?.questionsPerLesson ?? 5,
        lessonTitleLookup
      ),
    [
      quizAnswers,
      quizChartDone,
      quizConfig?.questionsPerLesson,
      quizLineAnswers,
      quizMabAnswers,
      quizMoneyAnswers,
      quizLessonActivityResults,
      quizQuestions,
      quizTyped,
      lessonTitleLookup,
    ]
  );
  const weakestLessonBreakdown = useMemo(
    () => getWeakestLessonBreakdown(lessonBreakdown),
    [lessonBreakdown]
  );
  const weakestLessonBreakdowns = useMemo(
    () => getLowestLessonBreakdowns(lessonBreakdown),
    [lessonBreakdown]
  );

  function completeWeek(currentWeek: number) {
    const p = readProgress();
    if (!p || p.status !== "ASSIGNED_PROGRAM") return;
    const nextWeek = Math.min(12, currentWeek + 1);
    updateProgress({ assignedWeek: nextWeek });
  }

  function submitQuiz() {
    const score = quizScore;
    const total = quizQuestions.length;
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const passRate = percent;
    const passThreshold = (quizConfig?.passPercent ?? 80) / 100;
    const passed = score >= Math.ceil(total * passThreshold);

    setFinalScore(score);
    setQuizSubmitted(true);

    const questionResults = buildQuizQuestionResults(
      quizQuestions,
      quizAnswers,
      quizTyped,
      quizLineAnswers,
      quizChartDone,
      quizMabAnswers,
      quizMoneyAnswers,
      quizLessonActivityResults
    );

    const store = readStore();
    setQuizScore(store, year, week, score);
    writeStore(store);

    if (passed) {
      completeWeek(Number(week));
    }

    // Persist quiz score to DB
    (async () => {
      try {
        const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
        if (!studentId) { console.warn("[Quiz] No active student ID, skipping DB save"); return; }
        const yearLabel = year; // e.g. "Year 1"
        const weekNum = week; // e.g. "1"

        // Read existing quiz_scores for this progress snapshot row
        const { data: existing } = await supabase
          .from("progress_snapshot")
          .select("quiz_scores")
          .eq("student_id", studentId)
          .eq("year", yearLabel)
          .maybeSingle();

        const prevScores: Record<string, any> = (existing?.quiz_scores as any) ?? {};
        const weekKey = String(weekNum);
        const prevAttempts: any[] = prevScores[weekKey]?.attempts ?? [];
        let insight: TeacherInsight | null = null;

        try {
          const insightInput: TeacherInsightInput = {
            studentId,
            level: yearLabel,
            strand: "Number",
            week: Number(weekNum),
            quizId: `${yearLabel}-w${weekNum}-weekly-quiz`,
            title: "Weekly Quiz",
            score,
            accuracy: percent,
            timeSpent: null,
            attempts: prevAttempts.length + 1,
            questionsAnswered: total,
            questionResults,
            lessonBreakdown: lessonBreakdown.map((item) => ({
              lessonNumber: item.lessonNumber,
              title: item.lessonTitle,
              correct: item.correct,
              total: item.total,
              percent: item.percent,
            })),
            topicSummaries: lessonBreakdown.map((item) => ({
              label: item.lessonTitle ?? `Lesson ${item.lessonNumber}`,
              correct: item.correct,
              total: item.total,
              accuracy: item.percent,
            })),
          };

          const insightResponse = await fetch("/api/teacher-insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(insightInput),
          });
          if (insightResponse.ok) {
            const payload = (await insightResponse.json()) as { insight?: TeacherInsight };
            insight = payload.insight ?? null;
          }
        } catch (error) {
          console.warn("[Quiz] Insight generation failed:", error);
        }

        const attempt = {
          score,
          total,
          percent,
          passRate,
          passed,
          lessonBreakdown,
          questionResults,
          insight,
          at: new Date().toISOString(),
        };
        const updatedWeek = {
          score,
          total,
          percent,
          passRate,
          passed,
          lessonBreakdown,
          latestInsight: insight,
          attempts: [...prevAttempts, attempt],
        };
        const updatedScores = { ...prevScores, [weekKey]: updatedWeek };

        const { error } = await supabase
          .from("progress_snapshot")
          .upsert(
            {
              student_id: studentId,
              year: yearLabel,
              quiz_scores: updatedScores,
              week: passed ? Math.min(12, Number(weekNum) + 1) : Number(weekNum),
            },
            { onConflict: "student_id,year" }
          );
        if (error) console.warn("[Quiz] DB save error:", error);
        else console.log("[Quiz] Quiz score saved to DB:", updatedWeek);
      } catch (e) {
        console.warn("[Quiz] DB save failed:", e);
      }
    })();
  }

  const currentQuiz = quizQuestions[quizIndex];
  const currentQuizPrompt = currentQuiz?.prompt ?? "";
  const currentQuizId = currentQuiz?.id ?? null;
  const { autoReadEnabled } = useAutoReadSetting();
  const isCurrentQuizReading =
    speakState.isSpeaking &&
    speakState.currentText !== null &&
    currentQuizPrompt.length > 0 &&
    speakState.currentText === prepareSpeechText(currentQuizPrompt);

  const lastAutoReadQuizIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!autoReadEnabled) return;
    if (!currentQuizId || !currentQuizPrompt) return;
    if (lastAutoReadQuizIdRef.current === currentQuizId) return;

    lastAutoReadQuizIdRef.current = currentQuizId;
    void speak(currentQuizPrompt);
  }, [autoReadEnabled, currentQuizId, currentQuizPrompt]);
  const isMoneyQuiz =
    currentQuiz?.kind === "moneyMake" ||
    currentQuiz?.kind === "moneyChange" ||
    currentQuiz?.kind === "moneyEnough";
  const isTapSkipQuiz =
    currentQuiz?.visual?.type === "rows" &&
    currentQuiz?.prompt?.toLowerCase().startsWith("tap the groups");

  useEffect(() => {
    if (!currentQuiz || !isTapSkipQuiz) return;
    if (!quizGroupTaps[currentQuiz.id]) {
      setQuizGroupTaps((prev) => ({
        ...prev,
        [currentQuiz.id]: Array.from(
          { length: (currentQuiz.visual?.type === "rows" ? currentQuiz.visual.rows.length : 0) },
          () => false
        ),
      }));
    }
  }, [currentQuiz, isTapSkipQuiz, quizGroupTaps]);
  const currentAnswered =
    currentQuiz?.kind === "lessonActivity"
      ? quizLessonActivityResults[currentQuiz.id]?.attempted === true
      : currentQuiz?.kind === "typed"
      ? (quizTyped[currentQuiz.id] ?? "").trim().length > 0
      : currentQuiz?.kind === "numberLineTap" ||
        currentQuiz?.kind === "numberLineJump"
      ? typeof quizLineAnswers[currentQuiz.id] === "number"
      : currentQuiz?.kind === "chartFill"
      ? quizChartDone[currentQuiz.id] === true
      : currentQuiz?.kind === "mab"
      ? quizMabAnswers[currentQuiz.id]?.touched === true
      : currentQuiz?.kind === "moneyMake" ||
        currentQuiz?.kind === "moneyChange" ||
        currentQuiz?.kind === "moneyEnough"
      ? quizMoneyAnswers[currentQuiz.id]?.attempted === true
      : typeof quizAnswers[currentQuiz?.id ?? ""] === "number";

  // Live XP / correct counter for the quiz HUD
  const liveCorrectCount = quizQuestions.reduce(
    (acc, q) =>
      acc +
      (isQuizQuestionCorrect(
        q,
        quizAnswers,
        quizTyped,
        quizLineAnswers,
        quizChartDone,
        quizMabAnswers,
        quizMoneyAnswers,
        quizLessonActivityResults
      )
        ? 1
        : 0),
    0
  );
  const progressPct = quizQuestions.length
    ? Math.round(((quizIndex + 1) / quizQuestions.length) * 100)
    : 0;

  // ---------------------------
  // UI
  // ---------------------------
  if (showPostTestTransition) {
    return <PostTestTransition year={year} />;
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-4">
          <button
            onClick={backToWeek}
            className={[
              "text-sm font-bold transition",
              isLesson
                ? "text-primary hover:underline"
                : "text-teal-300 hover:text-teal-200",
            ].join(" ")}
          >
            ← Back to Week {week}
          </button>
        </div>

        {/* Wrapper card */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-border/50 bg-card">
          {/* Hero gradient header */}
          {isLesson ? (
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 py-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold mb-3">
                {year} • Week {week}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display">{title}</h1>
              <p className="text-white/80 text-sm mt-1">
                {lessonStarted ? "Complete the timed practice" : "Watch the video and begin practice"}
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden text-white" style={{ background: "#021716" }}>
              {/* Number Nexus city artwork */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <img
                  src="/images/lesson-hero-number-nexus.jpg"
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: "78% center",
                    transform: "scale(1.02)",
                    filter: "contrast(1.18) saturate(1.08) brightness(1.06) hue-rotate(-4deg)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #021716 0%, rgba(2,23,22,0.98) 20%, rgba(2,23,22,0.9) 35%, rgba(2,23,22,0.65) 52%, rgba(2,23,22,0.3) 70%, rgba(2,23,22,0.1) 86%, rgba(2,23,22,0) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 w-[35%]"
                  style={{
                    background:
                      "radial-gradient(ellipse at 80% 35%, rgba(94,234,212,0.16), transparent 60%)",
                  }}
                />
              </div>

              {/* Floating numbers overlay */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[30%] select-none font-mono text-[10px] leading-[16px] tracking-widest text-cyan-200/[0.18] mix-blend-screen"
                style={{
                  maskImage:
                    "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 80%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 80%, transparent 100%)",
                }}
                aria-hidden
              >
                <div className="flex flex-wrap gap-x-3 p-3">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <span key={i}>{(i * 53 + 7) % 1000}</span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 px-5 py-4 md:px-7 md:py-5 max-w-[58%]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:text-xs">
                  {year} • Week {week}
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] md:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm font-medium text-white/85 md:text-base">
                  15 questions · Show what you know
                </p>
              </div>
            </div>
          )}

          <div className="bg-background px-6 py-8">

        {isLesson ? (
          <>
            {!lessonStarted ? (
              <>
                {/* Video section */}
                <div className="bg-card rounded-3xl border border-border shadow-sm p-6 mb-8">
                  <div className="flex items-center gap-2 text-foreground font-bold mb-5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-trust-blue-light text-trust-blue">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    Lesson Video
                  </div>
                  {hasEmbeddedLessonVideo ? (
                    <>
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}
                      >
                        <iframe
                          src="https://player.vimeo.com/video/1183966051?h=ff99ab69f7"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="absolute left-0 top-0 h-full w-full"
                          title="Lesson video"
                        />
                      </div>
                      <div className="mt-3 text-sm text-foreground/80">
                        Watch this first, then start the lesson.
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video rounded-2xl border-2 border-dashed border-border bg-card flex items-center justify-center text-muted-foreground" />
                  )}
                </div>

                {/* Motivation banner */}
                <div className="rounded-2xl border border-primary/20 bg-primary-light p-6 mb-8">
                  <div className="flex items-center gap-2 font-bold text-primary mb-2">✨ Keep going!</div>
                  <div className="text-sm text-foreground/80">Keep working to unlock your Level Up Legend.</div>
                </div>

                <button
                  onClick={() => setLessonStarted(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-extrabold text-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                >
                  Begin Practise
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-sm text-muted-foreground">Timed practice — complete questions to finish the lesson</div>
                </div>
                <button
                  onClick={completeLesson}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-extrabold text-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                >
                  Complete Lesson
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {/* Game-style HUD */}
            {quizQuestions.length ? (
              <div
                className="-mx-6 -mt-8 mb-6 border-t border-teal-300/15 px-6 pt-3 pb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #021716 0%, #042925 55%, #053b35 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(94,234,212,0.12), 0 8px 20px -12px rgba(0,0,0,0.55)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,0.9)]" />
                      Q {quizIndex + 1}<span className="opacity-60">/{quizQuestions.length}</span>
                    </span>
                    {currentQuiz?.lessonTag ? (
                      <span className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-emerald-100">
                        Lesson {currentQuiz.lessonTag}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-amber-100">
                      ✦ {liveCorrectCount} XP
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(currentQuiz?.prompt ?? "")}
                      aria-label="Read question aloud"
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] font-bold transition",
                        isCurrentQuizReading
                          ? "border-teal-300/60 bg-teal-400/20 text-teal-100"
                          : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
                      ].join(" ")}
                    >
                      🔊 Read
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        "linear-gradient(90deg, #00C2A8 0%, #00E5C3 100%)",
                      boxShadow: "0 0 12px rgba(0,229,195,0.55)",
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 mb-6">

              {quizQuestions.length ? (
                <div className="rounded-2xl border border-border/60 p-5 bg-background">
                  {!isMoneyQuiz && currentQuiz?.kind !== "lessonActivity" ? (
                    <div
                      className={[
                        "mb-4 rounded-xl px-3 py-3 transition-all",
                        isCurrentQuizReading
                          ? "bg-primary/5 ring-2 ring-primary/20"
                          : "",
                      ].join(" ")}
                    >
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-700/80 mb-1">
                        Prompt
                      </div>
                      <div className="text-[1.05rem] md:text-[1.15rem] font-semibold leading-snug text-foreground">
                        <MathFormattedText text={currentQuiz?.prompt ?? ""} compactFractions />
                      </div>
                    </div>
                  ) : null}

                  {currentQuiz?.kind === "moneyMake" && currentQuiz.moneyMake ? (
                    <MoneyMakeAmount
                      key={`quiz-money-${currentQuiz.id}`}
                      target={currentQuiz.moneyMake.target}
                      hideCheck={true}
                      hideTotal={true}
                      onAttempt={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: prev[currentQuiz.id]?.correct ?? false },
                        }))
                      }
                      onCorrect={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: true },
                        }))
                      }
                      onWrong={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: false },
                        }))
                      }
                    />
                  ) : null}

                  {currentQuiz?.kind === "moneyChange" && currentQuiz.moneyChange ? (
                    <MoneyChange
                      paid={currentQuiz.moneyChange.paid}
                      cost={currentQuiz.moneyChange.cost}
                      options={currentQuiz.moneyChange.options}
                      answer={currentQuiz.moneyChange.answer}
                      onCorrect={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: true },
                        }))
                      }
                      onWrong={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: false },
                        }))
                      }
                    />
                  ) : null}

                  {currentQuiz?.kind === "moneyEnough" && currentQuiz.moneyEnough ? (
                    <MoneyEnough
                      have={currentQuiz.moneyEnough.have}
                      cost={currentQuiz.moneyEnough.cost}
                      answer={currentQuiz.moneyEnough.answer}
                      showExplanation={false}
                      onCorrect={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: true },
                        }))
                      }
                      onWrong={() =>
                        setQuizMoneyAnswers((prev) => ({
                          ...prev,
                          [currentQuiz.id]: { attempted: true, correct: false },
                        }))
                      }
                    />
                  ) : null}

                  {currentQuiz?.kind === "lessonActivity" && currentQuiz.activity && currentQuiz.questionData ? (
                    <div>
                      <LessonRenderer
                        activity={currentQuiz.activity}
                        prompt={currentQuiz.prompt}
                        questionData={currentQuiz.questionData}
                        renderMode="quiz"
                        onCorrect={() =>
                          setQuizLessonActivityResults((prev) =>
                            ({
                              ...prev,
                              [currentQuiz.id]: { attempted: true, correct: true },
                            })
                          )
                        }
                        onWrong={() =>
                          setQuizLessonActivityResults((prev) =>
                            ({
                              ...prev,
                              [currentQuiz.id]: { attempted: true, correct: false },
                            })
                          )
                        }
                      />
                    </div>
                  ) : null}

                  {currentQuiz?.visual?.type === "dots" ? (
                    <div className="rounded-2xl border bg-white p-4 mb-3">
                      {isWeek9 ? (
                        <ClickableDotGrid
                          key={`quiz-dots-${currentQuiz.id}`}
                          count={currentQuiz.visual.count}
                          cols={currentQuiz.visual.cols}
                          rows={currentQuiz.visual.rows}
                          dotSize={currentQuiz.visual.dotSize}
                          gap={currentQuiz.visual.gap}
                        />
                      ) : (
                        <StaticDotGrid
                          key={`quiz-dots-${currentQuiz.id}`}
                          count={currentQuiz.visual.count}
                          cols={currentQuiz.visual.cols}
                          rows={currentQuiz.visual.rows}
                          dotSize={currentQuiz.visual.dotSize}
                          gap={currentQuiz.visual.gap}
                        />
                      )}
                    </div>
                  ) : null}
                  {currentQuiz?.visual?.type === "rows" ? (
                    <div className="rounded-2xl border bg-white p-4 mb-3">
                      <div className="mx-auto" style={{ maxWidth: 520 }}>
                        {isTapSkipQuiz ? (
                          <div className="grid" style={{ rowGap: currentQuiz.visual.rowGap }}>
                            {currentQuiz.visual.rows.map((count, ri) => {
                              const tapped = quizGroupTaps[currentQuiz.id]?.[ri] ?? false;
                              return (
                                <div
                                  key={ri}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() =>
                                    setQuizGroupTaps((prev) => ({
                                      ...prev,
                                      [currentQuiz.id]: (prev[currentQuiz.id] ?? []).map(
                                        (v, idx) => (idx === ri ? !v : v)
                                      ),
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      setQuizGroupTaps((prev) => ({
                                        ...prev,
                                        [currentQuiz.id]: (prev[currentQuiz.id] ?? []).map(
                                          (v, idx) => (idx === ri ? !v : v)
                                        ),
                                      }));
                                    }
                                  }}
                                  className={[
                                    "inline-flex cursor-pointer",
                                    tapped ? "bg-emerald-50" : "bg-transparent",
                                  ].join(" ")}
                                  style={{ gap: currentQuiz.visual?.type === "rows" ? currentQuiz.visual.gap : 0 }}
                                >
                                  <StaticDotRow
                                    count={count}
                                    dotSize={currentQuiz.visual?.type === "rows" ? currentQuiz.visual.dotSize : 14}
                                    gap={currentQuiz.visual?.type === "rows" ? currentQuiz.visual.gap : 8}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : isWeek9 ? (
                          <ClickableDotRows
                            key={`quiz-rows-${currentQuiz.id}`}
                            rows={currentQuiz.visual.rows}
                            dotSize={currentQuiz.visual.dotSize}
                            gap={currentQuiz.visual.gap}
                            rowGap={currentQuiz.visual.rowGap}
                            highlightAllRows={true}
                            highlightRowClassName="border-2 border-amber-500 rounded-xl px-2 py-1"
                          />
                        ) : (
                          <StaticDotRows
                            key={`quiz-rows-${currentQuiz.id}`}
                            rows={currentQuiz.visual.rows}
                            dotSize={currentQuiz.visual.dotSize}
                            gap={currentQuiz.visual.gap}
                            rowGap={currentQuiz.visual.rowGap}
                            highlightAllRows={false}
                            highlightRowClassName="border-2 border-amber-500 rounded-xl px-2 py-1"
                          />
                        )}
                        {isTapSkipQuiz ? (
                          <div className="mt-3 text-sm font-bold text-gray-700">
                            Skip count:{" "}
                            {(() => {
                              const taps = quizGroupTaps[currentQuiz.id] ?? [];
                              const count = taps.filter(Boolean).length;
                              const per = currentQuiz.visual.rows[0] ?? 0;
                              return count
                                ? Array.from({ length: count }, (_, i) => (i + 1) * per).join(" → ")
                                : "—";
                            })()}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs font-bold text-gray-500">
                            Each row is one group.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {currentQuiz?.kind === "numberLineTap" && currentQuiz.line ? (
                    <div className="rounded-2xl border bg-white p-4 mb-3">
                      {currentQuiz.line.showTargetLabel !== false ? (
                        <div className="text-2xl font-extrabold text-gray-900 mb-3">
                          {currentQuiz.line.target}
                        </div>
                      ) : null}
                      <NumberLineTap
                        min={currentQuiz.line.min}
                        max={currentQuiz.line.max}
                        target={currentQuiz.line.target}
                        onAttempt={(val) =>
                          setQuizLineAnswers((prev) => ({
                            ...prev,
                            [currentQuiz.id]: val,
                          }))
                        }
                        onComplete={() => {}}
                      />
                    </div>
                  ) : null}

                  {currentQuiz?.kind === "numberLineJump" && currentQuiz.line ? (
                    <div className="rounded-2xl border bg-white p-4 mb-3">
                      <div className="text-sm text-gray-600 mb-2">
                        Start at {currentQuiz.line.start}. Land exactly on{" "}
                        <span className="font-bold">{currentQuiz.line.target}</span>.
                      </div>
                      <NumberLineJump
                        min={currentQuiz.line.min}
                        max={currentQuiz.line.max}
                        start={currentQuiz.line.start ?? currentQuiz.line.min}
                        target={currentQuiz.line.target}
                        steps={currentQuiz.line.steps ?? [1, -1]}
                        onMove={(val) =>
                          setQuizLineAnswers((prev) => ({
                            ...prev,
                            [currentQuiz.id]: val,
                          }))
                        }
                        onComplete={() => {}}
                      />
                    </div>
                  ) : null}

                  {currentQuiz?.kind === "chartFill" && currentQuiz.chart ? (
                    <div className="rounded-2xl border bg-white p-4 mb-3">
                      <NumberChartFill
                        min={currentQuiz.chart.min}
                        max={currentQuiz.chart.max}
                        missing={currentQuiz.chart.missing}
                        onComplete={() =>
                          setQuizChartDone((prev) => ({
                            ...prev,
                            [currentQuiz.id]: true,
                          }))
                        }
                      />
                    </div>
                  ) : null}

                  {currentQuiz?.kind === "mab" && currentQuiz.mab ? (
                    <div className="rounded-2xl border bg-white p-4 mb-3">
                      <div className="text-2xl font-extrabold text-gray-900 mb-3">
                        Make {currentQuiz.mab.target}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-gray-200 p-4">
                          <div className="font-bold mb-2">Tens</div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setQuizMabAnswers((prev) => {
                                  const cur = prev[currentQuiz.id] ?? {
                                    tens: 0,
                                    ones: 0,
                                    touched: false,
                                  };
                                  return {
                                    ...prev,
                                    [currentQuiz.id]: {
                                      ...cur,
                                      tens: Math.max(0, cur.tens - 1),
                                      touched: true,
                                    },
                                  };
                                })
                              }
                              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
                            >
                              –
                            </button>
                            <div className="text-2xl font-extrabold w-10 text-center">
                              {quizMabAnswers[currentQuiz.id]?.tens ?? 0}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setQuizMabAnswers((prev) => {
                                  const cur = prev[currentQuiz.id] ?? {
                                    tens: 0,
                                    ones: 0,
                                    touched: false,
                                  };
                                  return {
                                    ...prev,
                                    [currentQuiz.id]: {
                                      ...cur,
                                      tens: Math.min(
                                        currentQuiz.mab?.maxTens ?? 10,
                                        cur.tens + 1
                                      ),
                                      touched: true,
                                    },
                                  };
                                })
                              }
                              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <div className="font-bold mb-2">Ones</div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setQuizMabAnswers((prev) => {
                                  const cur = prev[currentQuiz.id] ?? {
                                    tens: 0,
                                    ones: 0,
                                    touched: false,
                                  };
                                  return {
                                    ...prev,
                                    [currentQuiz.id]: {
                                      ...cur,
                                      ones: Math.max(0, cur.ones - 1),
                                      touched: true,
                                    },
                                  };
                                })
                              }
                              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
                            >
                              –
                            </button>
                            <div className="text-2xl font-extrabold w-10 text-center">
                              {quizMabAnswers[currentQuiz.id]?.ones ?? 0}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setQuizMabAnswers((prev) => {
                                  const cur = prev[currentQuiz.id] ?? {
                                    tens: 0,
                                    ones: 0,
                                    touched: false,
                                  };
                                  return {
                                    ...prev,
                                    [currentQuiz.id]: {
                                      ...cur,
                                      ones: Math.min(
                                        currentQuiz.mab?.maxOnes ?? 10,
                                        cur.ones + 1
                                      ),
                                      touched: true,
                                    },
                                  };
                                })
                              }
                              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {currentQuiz?.kind === "typed" ? (
                    <input
                      value={quizTyped[currentQuiz.id] ?? ""}
                      onChange={(e) =>
                        setQuizTyped((prev) => ({
                          ...prev,
                          [currentQuiz.id]:
                            currentQuiz.responseType === "number"
                              ? e.target.value.replace(/[^\d.,-]/g, "")
                              : e.target.value.replace(/[^a-zA-Z- ]/g, ""),
                        }))
                      }
                      inputMode={currentQuiz.responseType === "number" ? "decimal" : "text"}
                      className="w-full px-4 py-4 rounded-xl border text-xl font-bold"
                      placeholder={
                        currentQuiz.placeholder ??
                        (currentQuiz.responseType === "number" ? "Type the answer" : "Type the word")
                      }
                    />
                  ) : currentQuiz?.kind === "audio" ||
                    currentQuiz?.kind === "mcq" ? (
                    <div className="grid gap-2">
                      {currentQuiz.kind === "audio" ? (
                        <button
                          type="button"
                          onClick={() => speak(currentQuiz.audioText ?? "")}
                          className="mb-2 px-4 py-3 rounded-2xl bg-trust-blue text-white font-bold hover:opacity-90 transition w-full"
                        >
                          🔊 Listen
                        </button>
                      ) : null}

                      {currentQuiz.options?.map((opt, oi) => {
                        const selected = quizAnswers[currentQuiz.id] === oi;
                        return (
                          <button
                            key={`${currentQuiz.id}-${oi}`}
                            onClick={() => chooseQuiz(quizIndex, oi)}
                             className={[
                              "text-left px-4 py-3 rounded-2xl border-2 font-semibold transition-all",
                              selected
                                ? "border-trust-blue bg-trust-blue-light text-foreground shadow-sm"
                                : "border-border bg-card hover:border-trust-blue/40 text-foreground",
                            ].join(" ")}
                          >
                            <MathFormattedText text={opt} compactFractions />
                          </button>
                        );
                      })}
                      {typeof quizAnswers[currentQuiz.id] === "number" ? (
                        <button
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => {
                              const next = { ...prev };
                              delete next[currentQuiz.id];
                              return next;
                            })
                          }
                          className="justify-self-start rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-muted-foreground transition hover:border-trust-blue/40 hover:text-foreground"
                        >
                          Clear Answer
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between mb-4 gap-3 sticky bottom-2 z-10">
              <button
                onClick={() => setQuizIndex((i) => Math.max(0, i - 1))}
                disabled={quizIndex === 0}
                 className={[
                  "px-5 py-2.5 rounded-md font-extrabold tracking-[0.22em] text-sm transition active:scale-[0.97]",
                  quizIndex === 0
                    ? "text-white/30 border border-white/10 bg-[#0b1220]/60 cursor-not-allowed"
                    : "text-white border border-teal-300/40 bg-[#0b1220]/80 hover:border-teal-200/70 hover:bg-[#0e1830]/80 shadow-[inset_0_0_0_1px_rgba(94,234,212,0.08)]",
                ].join(" ")}
              >
                ← BACK
              </button>

              <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {quizSubmitted
                  ? `Score · ${finalScore}/${quizQuestions.length} (${Math.round(
                      (finalScore / Math.max(1, quizQuestions.length)) * 100
                    )}%)`
                  : `${liveCorrectCount} ✦ collected`}
              </div>

              {quizSubmitted ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={backToWeek}
                    className="px-5 py-3 rounded-2xl font-bold transition bg-secondary text-secondary-foreground hover:bg-muted"
                  >
                    Back to Week
                  </button>
                  {finalScore >= Math.ceil(quizQuestions.length * ((quizConfig?.passPercent ?? 80) / 100)) ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/program?year=${encodeURIComponent(year)}&week=${Math.min(
                            12,
                            Number(week) + 1
                          )}`
                        )
                      }
                      className="px-5 py-3 rounded-2xl font-bold transition bg-trust-blue text-white hover:opacity-90"
                    >
                      Go to Week {Math.min(12, Number(week) + 1)}
                    </button>
                  ) : null}
                </div>
              ) : quizIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={() =>
                    setQuizIndex((i) =>
                      Math.min(quizQuestions.length - 1, i + 1)
                    )
                  }
                  disabled={!currentAnswered}
                   className={[
                    "px-6 py-3 rounded-2xl font-extrabold transition active:scale-[0.97]",
                    currentAnswered
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-[0_8px_24px_-10px_rgba(0,229,195,0.7)] hover:brightness-110"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  ].join(" ")}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={!quizComplete}
                   className={[
                    "px-6 py-3 rounded-2xl font-extrabold transition active:scale-[0.97]",
                    quizComplete
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_8px_24px_-10px_rgba(251,191,36,0.7)] hover:brightness-110"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  ].join(" ")}
                >
                  Submit ✓
                </button>
              )}
            </div>

            

            {quizSubmitted && finalScore >= Math.ceil(quizQuestions.length * ((quizConfig?.passPercent ?? 80) / 100)) ? (
              <div className="relative mt-4">
                <div
                  aria-hidden
                  className="absolute -inset-[2px] pointer-events-none"
                  style={{
                    clipPath:
                      "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                    background:
                      "linear-gradient(135deg, rgba(251,191,36,0.45) 0%, rgba(94,234,212,0.25) 50%, rgba(251,191,36,0.4) 100%)",
                  }}
                />
                <div
                  className="relative px-4 py-3 text-sm font-bold text-amber-100"
                  style={{
                    clipPath:
                      "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
                    background:
                      "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(251,191,36,0.2), inset 0 -10px 20px rgba(0,0,0,0.45)",
                  }}
                >
                  🎉 Congratulations — you’re one step closer to unlocking your Level Up Legend!
                </div>
              </div>
            ) : null}

            {quizSubmitted ? (
              <div className="relative mt-4">
                <div
                  aria-hidden
                  className="absolute -inset-[2px] pointer-events-none"
                  style={{
                    clipPath:
                      "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                    background:
                      "linear-gradient(135deg, rgba(94,234,212,0.4) 0%, rgba(15,118,110,0.2) 50%, rgba(94,234,212,0.3) 100%)",
                  }}
                />
                <div
                  className="relative overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
                    background:
                      "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
                  }}
                >
                  {/* Hero */}
                  <div className="px-6 py-6 text-center border-b border-teal-300/15">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-500/10 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/90">
                      Quiz Results
                    </div>
                    <div className="mt-2 text-4xl font-black tracking-[-0.01em] text-white">
                      {finalScore}<span className="text-teal-300/70">/{quizQuestions.length}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-teal-100/80">
                      Pass Rate · {Math.round((finalScore / Math.max(1, quizQuestions.length)) * 100)}%
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Lesson breakdown */}
                    <div className="grid gap-2 sm:grid-cols-3">
                      {lessonBreakdown.map((item) => (
                        <div
                          key={item.lessonNumber}
                          className="rounded-lg border border-teal-300/20 bg-teal-500/5 px-3 py-3"
                          style={{ boxShadow: "inset 0 1px 0 rgba(94,234,212,0.12)" }}
                        >
                          <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/70">
                            Lesson {item.lessonNumber}
                          </div>
                          {item.lessonTitle ? (
                            <div className="mt-1 text-sm font-bold text-white leading-tight">
                              {item.lessonTitle}
                            </div>
                          ) : null}
                          <div className="mt-2 text-2xl font-black text-teal-100">
                            {item.correct}/{item.total}
                          </div>
                          <div className="text-xs font-semibold text-teal-200/80">{item.percent}%</div>
                          <div className="mt-1 text-xs font-semibold text-teal-50/85">
                            {getLessonFeedback(item.correct, item.total)}
                          </div>
                          {item.skill ? (
                            <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.15em] text-teal-200/55">
                              {item.skill.replace(/_/g, " ")}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {/* Recommended Practice */}
                    <div className="rounded-lg border border-emerald-300/25 bg-emerald-500/10 px-3 py-3">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-200/85">
                        Recommended Practice
                      </div>
                      <div className="mt-1 text-sm font-semibold text-emerald-50">
                        {weakestLessonBreakdowns.length > 1
                          ? `Go back and practise ${weakestLessonBreakdowns
                              .map((item) => `Lesson ${item.lessonNumber}${item.lessonTitle ? `: ${item.lessonTitle}` : ""}`)
                              .join(" and ")}.`
                          : weakestLessonBreakdown
                            ? `Go back and practise Lesson ${weakestLessonBreakdown.lessonNumber}${weakestLessonBreakdown.lessonTitle ? `: ${weakestLessonBreakdown.lessonTitle}` : ""}.`
                            : "Keep building across all three lessons."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {quizSubmitted && finalScore < Math.ceil(quizQuestions.length * ((quizConfig?.passPercent ?? 80) / 100)) ? (
              <div className="relative mt-4">
                <div
                  aria-hidden
                  className="absolute -inset-[2px] pointer-events-none"
                  style={{
                    clipPath:
                      "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                    background:
                      "linear-gradient(135deg, rgba(251,191,36,0.45) 0%, rgba(94,234,212,0.2) 50%, rgba(251,191,36,0.4) 100%)",
                  }}
                />
                <div
                  className="relative flex items-center justify-between gap-3 px-4 py-3"
                  style={{
                    clipPath:
                      "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
                    background:
                      "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(251,191,36,0.2), inset 0 -10px 20px rgba(0,0,0,0.45)",
                  }}
                >
                  <div className="text-sm font-semibold text-amber-50">
                    {weakestLessonBreakdown
                      ? `You’re close. Practise Lesson ${weakestLessonBreakdown.lessonNumber}${weakestLessonBreakdown.lessonTitle ? `: ${weakestLessonBreakdown.lessonTitle}` : ""} next. You scored ${weakestLessonBreakdown.correct}/${weakestLessonBreakdown.total} there.`
                      : "You’re close! Let’s try the lessons again to build confidence."}
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/lesson?year=${encodeURIComponent(year)}&week=${encodeURIComponent(
                          week
                        )}&lessonId=y${parseInt(year.replace(/\D/g, ""), 10) || 1}-w${week}-l${
                          weakestLessonBreakdown?.lessonNumber ?? 1
                        }`
                      )
                    }
                    className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition active:scale-[0.99]"
                    style={{
                      background:
                        "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(254,243,199,0.35), 0 0 18px rgba(251,191,36,0.25)",
                    }}
                  >
                    Practise Lesson {weakestLessonBreakdown?.lessonNumber ?? 1}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
          </div>{/* end bg-background px-6 py-8 */}
        </div>{/* end wrapper card */}
      </div>{/* end max-w-5xl */}
    </main>
  );
}
