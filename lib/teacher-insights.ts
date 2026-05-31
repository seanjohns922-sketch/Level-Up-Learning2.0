export type TeacherInsightStatus =
  | "On Track"
  | "Quick Check-in Recommended"
  | "Needs Support"
  | "Ready to Move On";

export type TeacherInsight = {
  status: TeacherInsightStatus;
  strongestSkill: string;
  needsSupport: string;
  teacherAction: string;
};

export type TeacherAttemptQuestion = {
  questionId: string;
  prompt: string;
  lessonTag?: string | null;
  skillTag?: string | null;
  selectedAnswer?: string | null;
  correctAnswer?: string | null;
  correct: boolean;
};

export type TeacherAttemptTopicSummary = {
  label: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSpentSeconds?: number;
};

export type TeacherInsightInput = {
  studentId: string;
  level: string;
  strand: string;
  week: number;
  lessonId?: string | null;
  quizId?: string | null;
  title?: string | null;
  score?: number | null;
  accuracy: number;
  timeSpent?: number | null;
  attempts?: number | null;
  questionsAnswered?: number | null;
  topicSummaries?: TeacherAttemptTopicSummary[];
  questionResults?: TeacherAttemptQuestion[];
  lessonBreakdown?: Array<{
    lessonNumber: number;
    title?: string;
    correct: number;
    total: number;
    percent: number;
  }>;
};

function getWeakestTopic(input: TeacherInsightInput) {
  const topics = input.topicSummaries ?? [];
  return [...topics].sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return (b.total ?? 0) - (a.total ?? 0);
  })[0] ?? null;
}

function getStrongestTopic(input: TeacherInsightInput) {
  const topics = input.topicSummaries ?? [];
  return [...topics].sort((a, b) => {
    if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
    return (b.total ?? 0) - (a.total ?? 0);
  })[0] ?? null;
}

export function buildHeuristicTeacherInsight(input: TeacherInsightInput): TeacherInsight {
  const weakestTopic = getWeakestTopic(input);
  const strongestTopic = getStrongestTopic(input);
  const breakdownWeakest = [...(input.lessonBreakdown ?? [])].sort((a, b) => a.percent - b.percent)[0] ?? null;

  let status: TeacherInsightStatus = "On Track";
  if (input.accuracy >= 90) status = "Ready to Move On";
  else if (input.accuracy >= 75) status = "On Track";
  else if (input.accuracy >= 55) status = "Quick Check-in Recommended";
  else status = "Needs Support";

  const strongestSkill =
    strongestTopic && strongestTopic.accuracy >= 75
      ? strongestTopic.label
      : input.accuracy >= 80
      ? "Applying strategies consistently"
      : "Accessing direct question formats";

  const needsSupport =
    weakestTopic
      ? weakestTopic.label
      : breakdownWeakest
      ? `Lesson ${breakdownWeakest.lessonNumber} questions`
      : "Choosing strategies independently";

  const teacherAction =
    weakestTopic
      ? `Show one worked example on ${weakestTopic.label.toLowerCase()}, then ask the student to solve a similar problem aloud.`
      : breakdownWeakest
      ? `Revisit one problem from Lesson ${breakdownWeakest.lessonNumber} and ask the student to explain their method before solving.`
      : "Ask the student to talk through their next problem before writing an answer.";

  return { status, strongestSkill, needsSupport, teacherAction };
}
