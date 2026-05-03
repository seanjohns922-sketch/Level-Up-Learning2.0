export type TeacherInsightStatus =
  | "On Track"
  | "Quick Check-in Recommended"
  | "Needs Support"
  | "Ready to Move On";

export type TeacherInsight = {
  status: TeacherInsightStatus;
  strength: string;
  gap: string;
  likelyMisconception: string;
  teacherAction: string;
  recommendedRevisit: string;
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

function toSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function formatRevisitLabel(input: TeacherInsightInput) {
  if (input.lessonId) {
    const lessonMatch = input.lessonId.match(/l(\d+)$/i);
    const lessonNumber = lessonMatch ? lessonMatch[1] : "1";
    return `Week ${input.week} Lesson ${lessonNumber}.`;
  }
  if (input.quizId) return `Week ${input.week} Weekly Quiz review.`;
  return `Week ${input.week} current activity.`;
}

function getWeakestTopic(input: TeacherInsightInput) {
  const topics = input.topicSummaries ?? [];
  return [...topics].sort((left, right) => {
    if (left.accuracy !== right.accuracy) return left.accuracy - right.accuracy;
    return (right.total ?? 0) - (left.total ?? 0);
  })[0];
}

function getStrongestTopic(input: TeacherInsightInput) {
  const topics = input.topicSummaries ?? [];
  return [...topics].sort((left, right) => {
    if (left.accuracy !== right.accuracy) return right.accuracy - left.accuracy;
    return (right.total ?? 0) - (left.total ?? 0);
  })[0];
}

function inferMisconceptionFromQuestion(question: TeacherAttemptQuestion | undefined) {
  if (!question) return "";
  const prompt = question.prompt.toLowerCase();
  if (prompt.includes("percent") || prompt.includes("%")) {
    return "They may not yet choose a benchmark percent before calculating.";
  }
  if (prompt.includes("fraction")) {
    return "They may be focusing on the numbers in the fraction instead of the fraction value.";
  }
  if (prompt.includes("common denominator")) {
    return "They may not yet spot the lowest shared multiple efficiently.";
  }
  return "They may need a clearer strategy check before solving independently.";
}

export function buildHeuristicTeacherInsight(input: TeacherInsightInput): TeacherInsight {
  const weakestTopic = getWeakestTopic(input);
  const strongestTopic = getStrongestTopic(input);
  const incorrectQuestions = (input.questionResults ?? []).filter((item) => !item.correct);
  const weakestQuestion = incorrectQuestions[0];
  const breakdownWeakest = [...(input.lessonBreakdown ?? [])].sort((left, right) => left.percent - right.percent)[0];

  let status: TeacherInsightStatus = "On Track";
  if (input.accuracy >= 90) status = "Ready to Move On";
  else if (input.accuracy >= 75) status = "On Track";
  else if (input.accuracy >= 55) status = "Quick Check-in Recommended";
  else status = "Needs Support";

  const strength =
    strongestTopic && strongestTopic.accuracy >= 75
      ? `The student showed their strongest understanding in ${strongestTopic.label.toLowerCase()}.`
      : input.accuracy >= 80
      ? "The student solved most questions accurately and used a reliable method."
      : "The student could access some parts of the task, especially the more direct questions.";

  const gap =
    weakestTopic
      ? `They were least secure in ${weakestTopic.label.toLowerCase()}, where accuracy dropped.`
      : breakdownWeakest
      ? `They struggled most on Lesson ${breakdownWeakest.lessonNumber} quiz questions.`
      : "They need more consistency when choosing the right strategy independently.";

  const likelyMisconception =
    weakestQuestion
      ? inferMisconceptionFromQuestion(weakestQuestion)
      : weakestTopic
      ? `They may not yet have a secure strategy for ${weakestTopic.label.toLowerCase()}.`
      : "A quick verbal check would help confirm whether the method is understood.";

  const teacherAction =
    weakestTopic
      ? `Give one short worked example on ${weakestTopic.label.toLowerCase()}, then ask the student to complete a similar item aloud.`
      : breakdownWeakest
      ? `Revisit one problem from Lesson ${breakdownWeakest.lessonNumber} and ask the student to explain the method before solving.`
      : "Ask the student to talk through one similar problem before moving on.";

  const recommendedRevisit =
    weakestTopic
      ? `Week ${input.week} ${input.lessonId ? "Lesson" : "Quiz"} revisit: ${weakestTopic.label}.`
      : formatRevisitLabel(input);

  return {
    status,
    strength: toSentence(strength),
    gap: toSentence(gap),
    likelyMisconception: toSentence(likelyMisconception),
    teacherAction: toSentence(teacherAction),
    recommendedRevisit: toSentence(recommendedRevisit),
  };
}
