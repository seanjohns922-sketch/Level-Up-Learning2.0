export type Year6WeeklyQuizAnswerType = "numeric" | "multipleChoice";

export type Year6WeeklyQuizQuestion = {
  id: string;
  lessonTag: 1 | 2 | 3;
  questionText: string;
  answerType: Year6WeeklyQuizAnswerType;
  options?: string[];
  correctAnswer: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

export type Year6WeeklyQuizWeek = {
  weekNumber: number;
  quizTitle: string;
  weeklyFocus: string;
  lesson1Title: string;
  lesson2Title: string;
  lesson3Title: string;
  questions: Year6WeeklyQuizQuestion[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateYear6WeeklyQuizQuestion(
  question: Year6WeeklyQuizQuestion,
  weekNumber: number,
  index: number
) {
  const label = `Year 6 Week ${weekNumber} quiz question ${index + 1}`;

  if (!isNonEmptyString(question.id)) {
    throw new Error(`[Year6WeeklyQuiz] ${label} is missing a valid id.`);
  }
  if (![1, 2, 3].includes(question.lessonTag)) {
    throw new Error(`[Year6WeeklyQuiz] ${label} has an invalid lessonTag.`);
  }
  if (!isNonEmptyString(question.questionText)) {
    throw new Error(`[Year6WeeklyQuiz] ${label} is missing questionText.`);
  }
  if (question.answerType !== "numeric" && question.answerType !== "multipleChoice") {
    throw new Error(`[Year6WeeklyQuiz] ${label} has an invalid answerType.`);
  }
  if (!isNonEmptyString(question.correctAnswer)) {
    throw new Error(`[Year6WeeklyQuiz] ${label} is missing correctAnswer.`);
  }
  if (!isNonEmptyString(question.feedbackCorrect)) {
    throw new Error(`[Year6WeeklyQuiz] ${label} is missing feedbackCorrect.`);
  }
  if (!isNonEmptyString(question.feedbackIncorrect)) {
    throw new Error(`[Year6WeeklyQuiz] ${label} is missing feedbackIncorrect.`);
  }

  if (question.answerType === "multipleChoice") {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`[Year6WeeklyQuiz] ${label} must have a valid options array.`);
    }
    if (!question.options.every((option) => isNonEmptyString(option))) {
      throw new Error(`[Year6WeeklyQuiz] ${label} has an empty option value.`);
    }
    if (!question.options.includes(question.correctAnswer)) {
      throw new Error(
        `[Year6WeeklyQuiz] ${label} correctAnswer must exactly match one of the option strings.`
      );
    }
  }
}

function validateYear6WeeklyQuizWeek(week: Year6WeeklyQuizWeek) {
  if (!isNonEmptyString(week.quizTitle) || !isNonEmptyString(week.weeklyFocus)) {
    throw new Error(`[Year6WeeklyQuiz] Week ${week.weekNumber} is missing quiz metadata.`);
  }
  if (
    !isNonEmptyString(week.lesson1Title) ||
    !isNonEmptyString(week.lesson2Title) ||
    !isNonEmptyString(week.lesson3Title)
  ) {
    throw new Error(`[Year6WeeklyQuiz] Week ${week.weekNumber} is missing lesson titles.`);
  }
  if (!Array.isArray(week.questions) || week.questions.length === 0) {
    throw new Error(`[Year6WeeklyQuiz] Week ${week.weekNumber} has no questions.`);
  }
  week.questions.forEach((question, index) =>
    validateYear6WeeklyQuizQuestion(question, week.weekNumber, index)
  );
}

const year6WeeklyQuizWeeks: Record<number, Year6WeeklyQuizWeek> = {
  1: {
    weekNumber: 1,
    quizTitle: "Week 1 Quiz — Decimal Foundations",
    weeklyFocus: "Decimal Foundations",
    lesson1Title: "Decimal Place Value to Thousandths",
    lesson2Title: "Add & Subtract Decimals",
    lesson3Title: "Estimate & Check with Decimals",
    questions: [
      {
        id: "y6w1q1",
        lessonTag: 1,
        questionText: "What is the value of the 6 in 3.264?",
        answerType: "numeric",
        correctAnswer: "0.06",
        feedbackCorrect: "Precision locked.",
        feedbackIncorrect: "Check the place value.",
      },
      {
        id: "y6w1q2",
        lessonTag: 1,
        questionText: "Which digit is in the thousandths place in 2.907?",
        answerType: "numeric",
        correctAnswer: "7",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Look closely at thousandths.",
      },
      {
        id: "y6w1q3",
        lessonTag: 1,
        questionText: "Expand 4.506.",
        answerType: "multipleChoice",
        options: ["4 + 0.5 + 0.006", "4 + 0.05 + 0.006", "4 + 0.5 + 0.06"],
        correctAnswer: "4 + 0.5 + 0.006",
        feedbackCorrect: "Clean decimal thinking.",
        feedbackIncorrect: "Break each place correctly.",
      },
      {
        id: "y6w1q4",
        lessonTag: 1,
        questionText: "Which is larger?",
        answerType: "multipleChoice",
        options: ["0.5", "0.45"],
        correctAnswer: "0.5",
        feedbackCorrect: "Good judgement.",
        feedbackIncorrect: "Compare the tenths first.",
      },
      {
        id: "y6w1q5",
        lessonTag: 1,
        questionText: "What is 0.809 in words?",
        answerType: "multipleChoice",
        options: [
          "eight hundred nine thousandths",
          "eighty-nine hundredths",
          "eight and nine thousandths",
        ],
        correctAnswer: "eight hundred nine thousandths",
        feedbackCorrect: "Strong place value.",
        feedbackIncorrect: "Read each place carefully.",
      },
      {
        id: "y6w1q6",
        lessonTag: 2,
        questionText: "3.456 + 5.678 = ?",
        answerType: "numeric",
        correctAnswer: "9.134",
        feedbackCorrect: "Accurate calculation.",
        feedbackIncorrect: "Line up the decimal places.",
      },
      {
        id: "y6w1q7",
        lessonTag: 2,
        questionText: "7.82 − 3.47 = ?",
        answerType: "numeric",
        correctAnswer: "4.35",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Watch the regrouping.",
      },
      {
        id: "y6w1q8",
        lessonTag: 2,
        questionText: "6.305 + 2.19 = ?",
        answerType: "numeric",
        correctAnswer: "8.495",
        feedbackCorrect: "Clean working.",
        feedbackIncorrect: "Check each place value.",
      },
      {
        id: "y6w1q9",
        lessonTag: 2,
        questionText: "10 − 3.456 = ?",
        answerType: "numeric",
        correctAnswer: "6.544",
        feedbackCorrect: "Strong thinking.",
        feedbackIncorrect: "Be careful subtracting across decimals.",
      },
      {
        id: "y6w1q10",
        lessonTag: 2,
        questionText: "9.5 − 4.275 = ?",
        answerType: "numeric",
        correctAnswer: "5.225",
        feedbackCorrect: "Precision locked.",
        feedbackIncorrect: "Check decimal alignment.",
      },
      {
        id: "y6w1q11",
        lessonTag: 3,
        questionText: "3.456 + 5.678 is closest to:",
        answerType: "multipleChoice",
        options: ["8", "9", "10"],
        correctAnswer: "9",
        feedbackCorrect: "Sharp estimate.",
        feedbackIncorrect: "Round and check the size.",
      },
      {
        id: "y6w1q12",
        lessonTag: 3,
        questionText: "Is this correct? 7.2 + 3.8 = 10.9",
        answerType: "multipleChoice",
        options: ["Correct", "Incorrect"],
        correctAnswer: "Incorrect",
        feedbackCorrect: "Nice catch.",
        feedbackIncorrect: "Check the size of the numbers.",
      },
      {
        id: "y6w1q13",
        lessonTag: 3,
        questionText: "Which is closest to 5?",
        answerType: "multipleChoice",
        options: ["4.89", "5.12", "5.01"],
        correctAnswer: "5.01",
        feedbackCorrect: "Good judgement.",
        feedbackIncorrect: "Compare the distance from 5.",
      },
      {
        id: "y6w1q14",
        lessonTag: 3,
        questionText: "What went wrong? 4.56 + 2.3 = 6.86",
        answerType: "multipleChoice",
        options: [
          "Decimal places were not aligned",
          "The numbers were multiplied",
          "Nothing went wrong",
        ],
        correctAnswer: "Decimal places were not aligned",
        feedbackCorrect: "Nice catch.",
        feedbackIncorrect: "Check how the decimals are lined up.",
      },
      {
        id: "y6w1q15",
        lessonTag: 3,
        questionText: "Is this correct? 6.78 − 2.91 = 3.87",
        answerType: "multipleChoice",
        options: ["Correct", "Incorrect"],
        correctAnswer: "Correct",
        feedbackCorrect: "Strong checking.",
        feedbackIncorrect: "Recheck the subtraction.",
      },
    ],
  },
};

export function getYear6WeeklyQuiz(weekNumber: number): Year6WeeklyQuizWeek | null {
  const quiz = year6WeeklyQuizWeeks[weekNumber] ?? null;
  if (quiz) validateYear6WeeklyQuizWeek(quiz);
  return quiz;
}
