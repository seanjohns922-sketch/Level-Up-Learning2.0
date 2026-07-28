export type AssessmentReplayStatus = "correct" | "incorrect" | "skipped" | "dont_know";

export type AssessmentLessonMapping = {
  week: number;
  lesson: number;
  label: string;
};

export type AssessmentQuestionSnapshot = {
  schema_version: 1;
  question_id: string;
  question_version: string;
  question_number: number;
  question_text: string;
  question_type: string;
  options: unknown[];
  visual: unknown;
  task_snapshot: unknown;
  correct_answer: unknown;
  student_answer: unknown;
  correct: boolean;
  response_status: AssessmentReplayStatus;
  explanation: string;
  curriculum_skill: {
    id: string | null;
    label: string;
    strand: string | null;
  };
  curriculum_codes?: string[];
  lesson_mapping: AssessmentLessonMapping[];
  answered_at: string;
};

export type ReplayQuestionSource = {
  id: string;
  prompt: string;
  type?: string;
  options?: unknown[];
  answer?: unknown;
  answerIndex?: number;
  answerOptionId?: string;
  correctAnswer?: unknown;
  skillId?: string;
  skillLabel?: string;
  strand?: string;
  curriculumCodes?: string[];
  linkedWeeks?: number[];
  linkedLessons?: number[];
  reviewFeedback?: string;
  explanation?: string;
  visual?: unknown;
  practiceTask?: unknown;
};

function cloneJsonValue(value: unknown): unknown {
  if (value === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function optionValue(option: unknown): unknown {
  if (!option || typeof option !== "object" || Array.isArray(option)) return option;
  const record = option as Record<string, unknown>;
  return record.value ?? record.id ?? record.label ?? option;
}

export function correctAnswerForReplay(question: ReplayQuestionSource): unknown {
  if (question.correctAnswer !== undefined && question.correctAnswer !== null) {
    return cloneJsonValue(question.correctAnswer);
  }
  if (question.answerOptionId !== undefined) return question.answerOptionId;
  if (question.answerIndex !== undefined) {
    return optionValue(question.options?.[question.answerIndex]);
  }
  return cloneJsonValue(question.answer);
}

function lessonMappings(question: ReplayQuestionSource): AssessmentLessonMapping[] {
  const weeks = question.linkedWeeks?.filter(Number.isFinite) ?? [];
  const lessons = question.linkedLessons?.filter(Number.isFinite) ?? [];
  if (weeks.length === 0 || lessons.length === 0) return [];

  if (weeks.length === lessons.length && weeks.length > 1) {
    return weeks.map((week, index) => ({
      week,
      lesson: lessons[index],
      label: `Week ${week}, Lesson ${lessons[index]}`,
    }));
  }

  return weeks.flatMap((week) =>
    lessons.map((lesson) => ({
      week,
      lesson,
      label: `Week ${week}, Lesson ${lesson}`,
    })),
  );
}

function responseStatus(answer: unknown, correct: boolean): AssessmentReplayStatus {
  if (typeof answer === "string" && answer.trim().toLowerCase() === "idk") return "dont_know";
  if (answer === null || answer === undefined || answer === "") return "skipped";
  return correct ? "correct" : "incorrect";
}

export function buildAssessmentQuestionSnapshots(
  questions: ReplayQuestionSource[],
  answerForQuestion: (question: ReplayQuestionSource, index: number) => unknown,
  isCorrect: (question: ReplayQuestionSource, answer: unknown) => boolean,
  completedAt: string,
): AssessmentQuestionSnapshot[] {
  return questions.map((question, index) => {
    const studentAnswer = answerForQuestion(question, index);
    const correct = isCorrect(question, studentAnswer);
    return {
      schema_version: 1,
      question_id: question.id,
      question_version: "1",
      question_number: index + 1,
      question_text: question.prompt,
      question_type: question.type ?? "mcq",
      options: (cloneJsonValue(question.options ?? []) as unknown[]) ?? [],
      visual: cloneJsonValue(question.visual),
      task_snapshot: cloneJsonValue(question.practiceTask),
      correct_answer: correctAnswerForReplay(question),
      student_answer: cloneJsonValue(studentAnswer),
      correct,
      response_status: responseStatus(studentAnswer, correct),
      explanation:
        question.reviewFeedback ??
        question.explanation ??
        (correct ? "This answer shows the assessed skill." : "Review the linked lesson and try a similar question."),
      curriculum_skill: {
        id: question.skillId ?? null,
        label: question.skillLabel ?? "Assessment skill",
        strand: question.strand ?? null,
      },
      curriculum_codes: Array.from(
        new Set((question.curriculumCodes ?? []).filter((code) => typeof code === "string" && code.trim())),
      ),
      lesson_mapping: lessonMappings(question),
      answered_at: completedAt,
    };
  });
}

export function isAssessmentQuestionSnapshot(value: unknown): value is AssessmentQuestionSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    record.schema_version === 1 &&
    typeof record.question_id === "string" &&
    typeof record.question_text === "string" &&
    typeof record.response_status === "string"
  );
}
