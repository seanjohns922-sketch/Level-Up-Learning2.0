import type {
  FractionNumberLineVisualData,
  IntegerContextVisualData,
  IntegerNumberLineVisualData,
} from "@/data/activities/year2/lessonEngine";

export type Year6WeeklyQuizAnswerType = "numeric" | "multipleChoice" | "ordering";

export type Year6WeeklyQuizVisual =
  | {
      kind: "numberLine";
      numberLine: IntegerNumberLineVisualData;
    }
  | {
      kind: "fractionNumberLine";
      fractionNumberLine: FractionNumberLineVisualData;
    }
  | {
      kind: "equivalentFractionYesNo";
      left: {
        numerator: number;
        denominator: number;
      };
      right: {
        numerator: number;
        denominator: number;
      };
    }
  | {
      kind: "integerContext";
      contextVisual: IntegerContextVisualData;
    };

export type Year6WeeklyQuizQuestion = {
  id: string;
  lessonTag: 1 | 2 | 3;
  questionText: string;
  answerType: Year6WeeklyQuizAnswerType;
  options?: string[];
  values?: string[];
  correctOrder?: string[];
  instructionText?: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  placeholder?: string;
  visual?: Year6WeeklyQuizVisual;
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
  if (
    question.answerType !== "numeric" &&
    question.answerType !== "multipleChoice" &&
    question.answerType !== "ordering"
  ) {
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

  if (question.answerType === "ordering") {
    if (!Array.isArray(question.values) || question.values.length < 2) {
      throw new Error(`[Year6WeeklyQuiz] ${label} must have values for ordering.`);
    }
    if (!Array.isArray(question.correctOrder) || question.correctOrder.length !== question.values.length) {
      throw new Error(`[Year6WeeklyQuiz] ${label} must have a valid correctOrder.`);
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
  2: {
    weekNumber: 2,
    quizTitle: "Week 2 Quiz — Number Properties",
    weeklyFocus: "Number Properties",
    lesson1Title: "Prime vs Composite Numbers",
    lesson2Title: "Factors & Multiples",
    lesson3Title: "Square Numbers & Patterns",
    questions: [
      {
        id: "y6w2q1",
        lessonTag: 1,
        questionText: "Which number is prime?",
        answerType: "multipleChoice",
        options: ["21", "23", "27"],
        correctAnswer: "23",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Check the factors.",
      },
      {
        id: "y6w2q2",
        lessonTag: 1,
        questionText: "Which number is NOT composite?",
        answerType: "multipleChoice",
        options: ["17", "21", "25"],
        correctAnswer: "17",
        feedbackCorrect: "Strong number sense.",
        feedbackIncorrect: "Think about divisibility.",
      },
      {
        id: "y6w2q3",
        lessonTag: 1,
        questionText: "Which statement is true?",
        answerType: "multipleChoice",
        options: ["All odd numbers are prime", "2 is the only even prime", "1 is prime"],
        correctAnswer: "2 is the only even prime",
        feedbackCorrect: "Good check.",
        feedbackIncorrect: "Look for the one rule that always works.",
      },
      {
        id: "y6w2q4",
        lessonTag: 1,
        questionText: "Which number is composite?",
        answerType: "multipleChoice",
        options: ["31", "37", "39"],
        correctAnswer: "39",
        feedbackCorrect: "Prime identified.",
        feedbackIncorrect: "Try a quick division check.",
      },
      {
        id: "y6w2q5",
        lessonTag: 1,
        questionText: "Which number cannot be prime?",
        answerType: "multipleChoice",
        options: ["41", "51", "53"],
        correctAnswer: "51",
        feedbackCorrect: "Clean thinking.",
        feedbackIncorrect: "Look for smaller factors.",
      },
      {
        id: "y6w2q6",
        lessonTag: 2,
        questionText: "Which is a common multiple of 4 and 6?",
        answerType: "multipleChoice",
        options: ["12", "16", "18"],
        correctAnswer: "12",
        feedbackCorrect: "Good connection.",
        feedbackIncorrect: "Think about multiples of both numbers.",
      },
      {
        id: "y6w2q7",
        lessonTag: 2,
        questionText: "Which is a common factor of 18 and 24?",
        answerType: "multipleChoice",
        options: ["3", "5", "7"],
        correctAnswer: "3",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Look for common factors.",
      },
      {
        id: "y6w2q8",
        lessonTag: 2,
        questionText: "Which number is a multiple of both 3 and 5?",
        answerType: "multipleChoice",
        options: ["15", "18", "20"],
        correctAnswer: "15",
        feedbackCorrect: "Pattern recognised.",
        feedbackIncorrect: "Think about multiples of both numbers.",
      },
      {
        id: "y6w2q9",
        lessonTag: 2,
        questionText: "Which number cannot be a multiple of 6?",
        answerType: "multipleChoice",
        options: ["42", "44", "48"],
        correctAnswer: "44",
        feedbackCorrect: "Strong number sense.",
        feedbackIncorrect: "Try a quicker pattern.",
      },
      {
        id: "y6w2q10",
        lessonTag: 2,
        questionText: "Two events happen every 4 and 10 minutes. When do they happen together?",
        answerType: "multipleChoice",
        options: ["10", "20", "40"],
        correctAnswer: "20",
        feedbackCorrect: "Good connection.",
        feedbackIncorrect: "Think about common multiples.",
      },
      {
        id: "y6w2q11",
        lessonTag: 3,
        questionText: "Which is a square number?",
        answerType: "multipleChoice",
        options: ["36", "38", "40"],
        correctAnswer: "36",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Think about square numbers.",
      },
      {
        id: "y6w2q12",
        lessonTag: 3,
        questionText: "What is 9²?",
        answerType: "multipleChoice",
        options: ["72", "81", "90"],
        correctAnswer: "81",
        feedbackCorrect: "Pattern recognised.",
        feedbackIncorrect: "Check nearby squares.",
      },
      {
        id: "y6w2q13",
        lessonTag: 3,
        questionText: "Which number is between 7² and 8²?",
        answerType: "multipleChoice",
        options: ["50", "55", "60"],
        correctAnswer: "55",
        feedbackCorrect: "Strong number sense.",
        feedbackIncorrect: "Look at the pattern.",
      },
      {
        id: "y6w2q14",
        lessonTag: 3,
        questionText: "Which square number is closest to 50?",
        answerType: "multipleChoice",
        options: ["36", "49", "64"],
        correctAnswer: "49",
        feedbackCorrect: "Quick thinking.",
        feedbackIncorrect: "Check nearby squares.",
      },
      {
        id: "y6w2q15",
        lessonTag: 3,
        questionText: "1 → 4 → 9 → 16\n+3 +5 +7\n\nWhat is the next difference?",
        answerType: "multipleChoice",
        options: ["+8", "+9", "+10"],
        correctAnswer: "+9",
        feedbackCorrect: "Pattern recognised.",
        feedbackIncorrect: "Try the next square pattern.",
      },
    ],
  },
  3: {
    weekNumber: 3,
    quizTitle: "Week 3 Quiz — Decimal Scaling & Application",
    weeklyFocus: "Decimal Scaling & Application",
    lesson1Title: "Multiply Decimals by 10, 100, 1000",
    lesson2Title: "Divide Decimals by 10, 100, 1000",
    lesson3Title: "Mixed Decimal Scaling Problems",
    questions: [
      {
        id: "y6w3q1",
        lessonTag: 1,
        questionText: "Fill in the blank: __ × 10 = 80.4",
        answerType: "numeric",
        correctAnswer: "8.04",
        feedbackCorrect: "Strong scaling.",
        feedbackIncorrect: "Think about what number becomes 80.4 when multiplied by 10.",
      },
      {
        id: "y6w3q2",
        lessonTag: 1,
        questionText: "What is 0.56 × 10?",
        answerType: "multipleChoice",
        options: ["5.6", "0.056", "56"],
        correctAnswer: "5.6",
        feedbackCorrect: "Clean shift.",
        feedbackIncorrect: "Multiplying by 10 makes the number larger.",
      },
      {
        id: "y6w3q3",
        lessonTag: 1,
        questionText: "What is 7.21 × 100?",
        answerType: "multipleChoice",
        options: ["72.1", "721", "7.21"],
        correctAnswer: "721",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Multiplying by 100 scales the number up two places.",
      },
      {
        id: "y6w3q4",
        lessonTag: 1,
        questionText: "Which is correct?",
        answerType: "multipleChoice",
        options: ["0.09 × 100 = 9", "0.09 × 100 = 0.9", "0.09 × 100 = 90"],
        correctAnswer: "0.09 × 100 = 9",
        feedbackCorrect: "Good place value thinking.",
        feedbackIncorrect: "Check how the value changes when multiplying by 100.",
      },
      {
        id: "y6w3q5",
        lessonTag: 1,
        questionText: "Which is larger?",
        answerType: "multipleChoice",
        options: ["0.45", "0.45 × 10"],
        correctAnswer: "0.45 × 10",
        feedbackCorrect: "Correct — multiplying by 10 increases the value.",
        feedbackIncorrect: "Multiplying by 10 makes the number larger.",
      },
      {
        id: "y6w3q6",
        lessonTag: 2,
        questionText: "Fill in the blank: __ ÷ 100 = 3.2",
        answerType: "numeric",
        correctAnswer: "320",
        feedbackCorrect: "Strong reverse scaling.",
        feedbackIncorrect: "Think about what number becomes 3.2 when divided by 100.",
      },
      {
        id: "y6w3q7",
        lessonTag: 2,
        questionText: "What is 5.6 ÷ 10?",
        answerType: "multipleChoice",
        options: ["0.56", "5.06", "56"],
        correctAnswer: "0.56",
        feedbackCorrect: "Clean scaling down.",
        feedbackIncorrect: "Dividing by 10 makes the number smaller.",
      },
      {
        id: "y6w3q8",
        lessonTag: 2,
        questionText: "What is 78 ÷ 100?",
        answerType: "multipleChoice",
        options: ["0.78", "7.8", "78"],
        correctAnswer: "0.78",
        feedbackCorrect: "Nice work.",
        feedbackIncorrect: "Dividing by 100 scales the number down two places.",
      },
      {
        id: "y6w3q9",
        lessonTag: 2,
        questionText: "Which is correct?",
        answerType: "multipleChoice",
        options: ["6700 ÷ 1000 = 6.7", "6700 ÷ 1000 = 67", "6700 ÷ 1000 = 0.67"],
        correctAnswer: "6700 ÷ 1000 = 6.7",
        feedbackCorrect: "Strong place value control.",
        feedbackIncorrect: "Check the size after dividing by 1000.",
      },
      {
        id: "y6w3q10",
        lessonTag: 2,
        questionText: "Which is smaller?",
        answerType: "multipleChoice",
        options: ["0.45", "0.45 ÷ 10"],
        correctAnswer: "0.45 ÷ 10",
        feedbackCorrect: "Correct — dividing by 10 makes the value smaller.",
        feedbackIncorrect: "Dividing by 10 scales the number down.",
      },
      {
        id: "y6w3q11",
        lessonTag: 3,
        questionText: "What operation changes 3.4 to 340?",
        answerType: "multipleChoice",
        options: ["×10", "×100", "÷10"],
        correctAnswer: "×100",
        feedbackCorrect: "Good decision.",
        feedbackIncorrect: "3.4 becomes 340 by scaling up two places.",
      },
      {
        id: "y6w3q12",
        lessonTag: 3,
        questionText: "What operation changes 5.6 to 0.056?",
        answerType: "multipleChoice",
        options: ["×10", "÷10", "÷100"],
        correctAnswer: "÷100",
        feedbackCorrect: "Nice scaling choice.",
        feedbackIncorrect: "The number becomes smaller by two places.",
      },
      {
        id: "y6w3q13",
        lessonTag: 3,
        questionText: "Which is correct?",
        answerType: "multipleChoice",
        options: ["0.78 × 100 = 7.8", "0.78 × 100 = 78", "0.78 × 100 = 0.078"],
        correctAnswer: "0.78 × 100 = 78",
        feedbackCorrect: "Strong scaling.",
        feedbackIncorrect: "Multiplying by 100 scales the number up two places.",
      },
      {
        id: "y6w3q14",
        lessonTag: 3,
        questionText: "Is this reasonable? 6.7 ÷ 10 = 67",
        answerType: "multipleChoice",
        options: ["Yes", "No"],
        correctAnswer: "No",
        feedbackCorrect: "Nice catch.",
        feedbackIncorrect: "Dividing by 10 should make the number smaller.",
      },
      {
        id: "y6w3q15",
        lessonTag: 3,
        questionText: "Which equals 78?",
        answerType: "multipleChoice",
        options: ["0.078 × 100", "0.078 × 1000", "0.78 × 10"],
        correctAnswer: "0.078 × 1000",
        feedbackCorrect: "Correct — strong place value thinking.",
        feedbackIncorrect: "Check which option scales 0.078 up to 78.",
      },
    ],
  },
  4: {
    weekNumber: 4,
    quizTitle: "Week 4 Quiz — Integers & Number Lines",
    weeklyFocus: "Integers & Number Lines",
    lesson1Title: "Integers on Number Lines",
    lesson2Title: "Operations with Integers",
    lesson3Title: "Integer Contexts",
    questions: [
      {
        id: "y6w4q1",
        lessonTag: 1,
        questionText: "Which integer is marked on the number line?",
        answerType: "multipleChoice",
        options: ["-6", "6", "-4", "4"],
        correctAnswer: "-6",
        feedbackCorrect: "Strong positioning.",
        feedbackIncorrect: "Check the tick mark carefully.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -10,
            max: 10,
            markerValue: -6,
            emphasis: "position",
          },
        },
      },
      {
        id: "y6w4q2",
        lessonTag: 1,
        questionText: "Which integer is greater?",
        answerType: "multipleChoice",
        options: ["-8", "-3"],
        correctAnswer: "-3",
        feedbackCorrect: "Correct — it sits further right.",
        feedbackIncorrect: "Further right means greater.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -10,
            max: 10,
            highlightedValues: [-8, -3],
            emphasis: "compare",
          },
        },
      },
      {
        id: "y6w4q3",
        lessonTag: 1,
        questionText: "Order from smallest to largest.",
        answerType: "ordering",
        values: ["0", "-4", "3"],
        correctOrder: ["-4", "0", "3"],
        instructionText: "Read the number line from left to right.",
        correctAnswer: "-4,0,3",
        feedbackCorrect: "Locked in from left to right.",
        feedbackIncorrect: "Use the number line and read from left to right.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -6,
            max: 6,
            highlightedValues: [-4, 0, 3],
            emphasis: "compare",
          },
        },
      },
      {
        id: "y6w4q4",
        lessonTag: 1,
        questionText: "Which integer is closer to zero?",
        answerType: "multipleChoice",
        options: ["-2", "-8"],
        correctAnswer: "-2",
        feedbackCorrect: "Nice distance thinking.",
        feedbackIncorrect: "Closer to zero means fewer spaces away.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -10,
            max: 10,
            highlightedValues: [-2, -8],
            emphasis: "distance",
          },
        },
      },
      {
        id: "y6w4q5",
        lessonTag: 1,
        questionText: "You start at 5 and move 8 spaces left. Where are you?",
        answerType: "numeric",
        correctAnswer: "-3",
        placeholder: "Type the integer",
        feedbackCorrect: "Nice integer movement.",
        feedbackIncorrect: "Start at 5 and move 8 spaces left.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -10,
            max: 10,
            startValue: 5,
            movement: -8,
            showArrow: true,
            emphasis: "movement",
          },
        },
      },
      {
        id: "y6w4q6",
        lessonTag: 2,
        questionText: "-3 + 8 = ?",
        answerType: "numeric",
        correctAnswer: "5",
        placeholder: "Type the integer",
        feedbackCorrect: "Clean movement across zero.",
        feedbackIncorrect: "Start at -3 and move 8 spaces right.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -12,
            max: 12,
            startValue: -3,
            movement: 8,
            showArrow: true,
            emphasis: "movement",
          },
        },
      },
      {
        id: "y6w4q7",
        lessonTag: 2,
        questionText: "7 - 12 = ?",
        answerType: "numeric",
        correctAnswer: "-5",
        placeholder: "Type the integer",
        feedbackCorrect: "Strong number line thinking.",
        feedbackIncorrect: "Subtracting 12 means move 12 spaces left.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -12,
            max: 12,
            startValue: 7,
            movement: -12,
            showArrow: true,
            emphasis: "movement",
          },
        },
      },
      {
        id: "y6w4q8",
        lessonTag: 2,
        questionText: "Which movement matches -4 + 9?",
        answerType: "multipleChoice",
        options: [
          "Start at -4 and move 9 right",
          "Start at -4 and move 9 left",
          "Start at 9 and move 4 left",
        ],
        correctAnswer: "Start at -4 and move 9 right",
        feedbackCorrect: "Good direction control.",
        feedbackIncorrect: "Adding a positive moves right.",
      },
      {
        id: "y6w4q9",
        lessonTag: 2,
        questionText: "-6 + 9 = ?",
        answerType: "numeric",
        correctAnswer: "3",
        placeholder: "Type the integer",
        feedbackCorrect: "Nice work crossing zero.",
        feedbackIncorrect: "Start at -6 and move 9 spaces right.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -12,
            max: 12,
            startValue: -6,
            movement: 9,
            showArrow: true,
            emphasis: "movement",
          },
        },
      },
      {
        id: "y6w4q10",
        lessonTag: 2,
        questionText: "4 - 11 = ?",
        answerType: "numeric",
        correctAnswer: "-7",
        placeholder: "Type the integer",
        feedbackCorrect: "Locked in.",
        feedbackIncorrect: "Moving left makes the value smaller.",
        visual: {
          kind: "numberLine",
          numberLine: {
            type: "integer_number_line",
            min: -12,
            max: 12,
            startValue: 4,
            movement: -11,
            showArrow: true,
            emphasis: "movement",
          },
        },
      },
      {
        id: "y6w4q11",
        lessonTag: 3,
        questionText: "A temperature changes from -4°C to 3°C. What happened?",
        answerType: "multipleChoice",
        options: ["It rose 7°C", "It dropped 7°C", "It rose 1°C", "It dropped 1°C"],
        correctAnswer: "It rose 7°C",
        feedbackCorrect: "Strong interpretation.",
        feedbackIncorrect: "Track the movement from -4 to 3.",
        visual: {
          kind: "integerContext",
          contextVisual: {
            type: "integer_context",
            context: "temperature",
            title: "Temperature change",
            currentValue: -4,
            change: 7,
            endValue: 3,
            currentLabel: "Start",
            endLabel: "End",
            hidePrimaryChange: true,
            unitSuffix: "°C",
            noteText: "Read the start and end, then decide what changed.",
            numberLine: {
              type: "integer_number_line",
              min: -10,
              max: 10,
              highlightedValues: [-4, 3],
              emphasis: "compare",
            },
          },
        },
      },
      {
        id: "y6w4q12",
        lessonTag: 3,
        questionText: "A player's score goes from -11 to -1. What is the change?",
        answerType: "numeric",
        correctAnswer: "10",
        acceptedAnswers: ["+10"],
        placeholder: "Type the integer",
        feedbackCorrect: "Nice reasoning.",
        feedbackIncorrect: "Find how far the score moved from -11 to -1.",
        visual: {
          kind: "integerContext",
          contextVisual: {
            type: "integer_context",
            context: "score",
            title: "Score change",
            currentValue: -11,
            change: 10,
            endValue: -1,
            currentLabel: "From",
            endLabel: "To",
            hidePrimaryChange: true,
            noteText: "Interpret the score change before you calculate it.",
            numberLine: {
              type: "integer_number_line",
              min: -15,
              max: 5,
              highlightedValues: [-11, -1],
              emphasis: "distance",
            },
          },
        },
      },
      {
        id: "y6w4q13",
        lessonTag: 3,
        questionText: "A temperature ends at 3°C after rising 8°C. What was the starting temperature?",
        answerType: "numeric",
        correctAnswer: "-5",
        placeholder: "Type the integer",
        feedbackCorrect: "Strong inverse thinking.",
        feedbackIncorrect: "Work backwards from 3°C.",
        visual: {
          kind: "integerContext",
          contextVisual: {
            type: "integer_context",
            context: "temperature",
            title: "Temperature reverse",
            currentValue: 3,
            change: 8,
            currentLabel: "End",
            changeLabel: "Rise",
            unitSuffix: "°C",
            noteText: "Use the ending temperature, then reverse the rise.",
            numberLine: {
              type: "integer_number_line",
              min: -10,
              max: 10,
              markerValue: 3,
              emphasis: "position",
            },
          },
        },
      },
      {
        id: "y6w4q14",
        lessonTag: 3,
        questionText: "You start on floor -5. You go up 12 floors, then down 9 floors. Where are you now?",
        answerType: "numeric",
        correctAnswer: "-2",
        placeholder: "Type the integer",
        feedbackCorrect: "You tracked both steps well.",
        feedbackIncorrect: "Track each movement in order.",
        visual: {
          kind: "integerContext",
          contextVisual: {
            type: "integer_context",
            context: "elevator",
            title: "Lift journey",
            currentValue: -5,
            change: 12,
            secondaryChange: -9,
            currentLabel: "Start",
            changeLabel: "Up",
            secondaryChangeLabel: "Then down",
            noteText: "Track each movement in order.",
            numberLine: {
              type: "integer_number_line",
              min: -12,
              max: 12,
              markerValue: -5,
              emphasis: "movement",
            },
          },
        },
      },
      {
        id: "y6w4q15",
        lessonTag: 3,
        questionText: "A bank balance is -$20. You deposit $15, then spend $12. What is the final balance?",
        answerType: "numeric",
        correctAnswer: "-17",
        placeholder: "Type the integer",
        feedbackCorrect: "Good multi-step thinking.",
        feedbackIncorrect: "Deposit moves up; spending moves down.",
        visual: {
          kind: "integerContext",
          contextVisual: {
            type: "integer_context",
            context: "balance",
            title: "Balance tracker",
            currentValue: -20,
            change: 15,
            secondaryChange: -12,
            currentLabel: "Start",
            changeLabel: "Deposit",
            secondaryChangeLabel: "Then spend",
            unitPrefix: "$",
            noteText: "Apply both money changes in order.",
            numberLine: {
              type: "integer_number_line",
              min: -25,
              max: 25,
              markerValue: -20,
              emphasis: "movement",
            },
          },
        },
      },
    ],
  },
  5: {
    weekNumber: 5,
    quizTitle: "Week 5 Quiz — Fractions & Equivalence",
    weeklyFocus: "Fractions & Equivalence",
    lesson1Title: "Using Equivalent Fractions",
    lesson2Title: "Ordering Fractions",
    lesson3Title: "Mixed & Improper Fractions",
    questions: [
      {
        id: "y6w5q1",
        lessonTag: 1,
        questionText: "Which is equivalent to 3/4?",
        answerType: "multipleChoice",
        options: ["6/8", "9/16", "3/8"],
        correctAnswer: "6/8",
        feedbackCorrect: "Nice equivalence check.",
        feedbackIncorrect: "Scale both parts by the same number.",
      },
      {
        id: "y6w5q2",
        lessonTag: 1,
        questionText: "5/6 = ? / 18",
        answerType: "numeric",
        correctAnswer: "15",
        placeholder: "Type the integer",
        feedbackCorrect: "Strong scaling.",
        feedbackIncorrect: "Multiply both parts by the same number.",
      },
      {
        id: "y6w5q3",
        lessonTag: 1,
        questionText: "Simplify 12/18.",
        answerType: "numeric",
        correctAnswer: "2/3",
        placeholder: "Type the fraction",
        feedbackCorrect: "Clean simplification.",
        feedbackIncorrect: "Divide numerator and denominator by the same number.",
      },
      {
        id: "y6w5q4",
        lessonTag: 1,
        questionText: "Which is equivalent to 5/8?",
        answerType: "multipleChoice",
        options: ["10/16", "15/16", "5/16"],
        correctAnswer: "10/16",
        feedbackCorrect: "Good equivalence thinking.",
        feedbackIncorrect: "Scale both parts equally.",
      },
      {
        id: "y6w5q5",
        lessonTag: 1,
        questionText: "Do these represent the same value?",
        answerType: "multipleChoice",
        options: ["Yes", "No"],
        correctAnswer: "Yes",
        feedbackCorrect: "Matched perfectly.",
        feedbackIncorrect: "Look at how much of each bar is shaded.",
        visual: {
          kind: "equivalentFractionYesNo",
          left: { numerator: 1, denominator: 2 },
          right: { numerator: 3, denominator: 6 },
        },
      },
      {
        id: "y6w5q6",
        lessonTag: 2,
        questionText: "Which is larger?",
        answerType: "multipleChoice",
        options: ["4/5", "9/10", "Equal"],
        correctAnswer: "9/10",
        feedbackCorrect: "Smart strategy.",
        feedbackIncorrect: "Try scaling one fraction.",
      },
      {
        id: "y6w5q7",
        lessonTag: 2,
        questionText: "Which is greater: 5/6 or 7/9?",
        answerType: "numeric",
        correctAnswer: "5/6",
        placeholder: "Type the fraction",
        feedbackCorrect: "Strong comparison.",
        feedbackIncorrect: "Think about distance from 1.",
      },
      {
        id: "y6w5q8",
        lessonTag: 2,
        questionText: "Which fraction is closest to 1?",
        answerType: "multipleChoice",
        options: ["7/8", "5/8", "3/8"],
        correctAnswer: "7/8",
        feedbackCorrect: "Good benchmark thinking.",
        feedbackIncorrect: "Check which fraction is nearest to a whole.",
      },
      {
        id: "y6w5q9",
        lessonTag: 2,
        questionText: "Order from smallest to largest.",
        answerType: "ordering",
        values: ["9/10", "13/15", "11/12"],
        correctOrder: ["13/15", "9/10", "11/12"],
        instructionText: "Place them from left to right on the number line.",
        correctAnswer: "13/15,9/10,11/12",
        feedbackCorrect: "Nice reasoning.",
        feedbackIncorrect: "Use the number line position.",
        visual: {
          kind: "fractionNumberLine",
          fractionNumberLine: {
            type: "fraction_number_line",
            title: "Fractions near 1",
            min: 0,
            max: 1,
            subdivisions: 12,
            leftLabel: "13/15",
            rightLabel: "11/12",
            leftPosition: 13 / 15,
            rightPosition: 11 / 12,
            markers: [
              { label: "9/10", value: 9 / 10, position: 9 / 10, tone: "sky" },
              { label: "13/15", value: 13 / 15, position: 13 / 15, tone: "emerald" },
              { label: "11/12", value: 11 / 12, position: 11 / 12, tone: "violet" },
            ],
          },
        },
      },
      {
        id: "y6w5q10",
        lessonTag: 2,
        questionText: "Order from smallest to largest.",
        answerType: "ordering",
        values: ["3/5", "7/10", "2/3"],
        correctOrder: ["3/5", "2/3", "7/10"],
        instructionText: "Use the line to compare their positions.",
        correctAnswer: "3/5,2/3,7/10",
        feedbackCorrect: "Efficient choice.",
        feedbackIncorrect: "Check the benchmark positions carefully.",
        visual: {
          kind: "fractionNumberLine",
          fractionNumberLine: {
            type: "fraction_number_line",
            title: "Fractions between 1/2 and 1",
            min: 0,
            max: 1,
            subdivisions: 10,
            leftLabel: "3/5",
            rightLabel: "7/10",
            leftPosition: 3 / 5,
            rightPosition: 7 / 10,
            markers: [
              { label: "3/5", value: 3 / 5, position: 3 / 5, tone: "sky" },
              { label: "7/10", value: 7 / 10, position: 7 / 10, tone: "emerald" },
              { label: "2/3", value: 2 / 3, position: 2 / 3, tone: "violet" },
            ],
          },
        },
      },
      {
        id: "y6w5q11",
        lessonTag: 3,
        questionText: "Write 11/4 as a mixed number.",
        answerType: "numeric",
        correctAnswer: "2 3/4",
        placeholder: "Type the mixed number",
        feedbackCorrect: "Good use of mixed numbers.",
        feedbackIncorrect: "How many wholes and what fraction remain?",
      },
      {
        id: "y6w5q12",
        lessonTag: 3,
        questionText: "Convert 1 2/3 to an improper fraction.",
        answerType: "numeric",
        correctAnswer: "5/3",
        placeholder: "Type the fraction",
        feedbackCorrect: "Nice conversion.",
        feedbackIncorrect: "Convert the whole to thirds, then add the extra part.",
      },
      {
        id: "y6w5q13",
        lessonTag: 3,
        questionText: "Which value is closest to 2?",
        answerType: "multipleChoice",
        options: ["7/3", "9/5", "11/6"],
        correctAnswer: "11/6",
        feedbackCorrect: "Strong number sense.",
        feedbackIncorrect: "Think about the distance from 2.",
      },
      {
        id: "y6w5q14",
        lessonTag: 3,
        questionText: "A student says: “5/8 is bigger than 3/4 because 5 > 3”. Is this correct?",
        answerType: "multipleChoice",
        options: ["Yes", "No"],
        correctAnswer: "No",
        feedbackCorrect: "Nice reasoning.",
        feedbackIncorrect: "Compare the fraction values, not just the numbers.",
      },
      {
        id: "y6w5q15",
        lessonTag: 3,
        questionText: "A tank is 3/4 full. Another tank is 5/6 full. Which tank has more water?",
        answerType: "numeric",
        correctAnswer: "5/6",
        placeholder: "Type the fraction",
        feedbackCorrect: "Strong comparison.",
        feedbackIncorrect: "Compare the sizes of the two fractions.",
      },
    ],
  },
};

export function getYear6WeeklyQuiz(weekNumber: number): Year6WeeklyQuizWeek | null {
  const quiz = year6WeeklyQuizWeeks[weekNumber] ?? null;
  if (quiz) validateYear6WeeklyQuizWeek(quiz);
  return quiz;
}
