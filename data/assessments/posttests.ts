export type Question = {
  id: string;
  type?: string;
  prompt: string;
  options: unknown[];
  correctAnswer: string;
  answer?: unknown;
  answerOptionId?: string;
  skillId?: string;
  skillLabel?: string;
  linkedWeeks?: number[];
  linkedLessons?: number[];
  strand?: string;
  difficultyBand?: string;
  visual?: unknown;
};

export type PostTest = {
  yearLabel: string;
  questions: Question[];
};

const YEAR1_POSTTEST_QUESTIONS: Question[] = [
  {
    id: "y1-pt-01",
    prompt: "Which number is 48?",
    options: ["38", "48", "58", "84"],
    correctAnswer: "48",
  },
  {
    id: "y1-pt-02",
    prompt: "What number comes after 79?",
    options: ["78", "80", "81", "89"],
    correctAnswer: "80",
  },
  {
    id: "y1-pt-03",
    prompt: "Put these numbers in order from smallest to largest: 23, 17, 41",
    options: ["17, 23, 41", "23, 17, 41", "41, 23, 17", "17, 41, 23"],
    correctAnswer: "17, 23, 41",
  },
  {
    id: "y1-pt-04",
    prompt: "Which is the largest number?",
    options: ["64", "46", "56", "36"],
    correctAnswer: "64",
  },
  {
    id: "y1-pt-05",
    prompt: "How many tens and ones are in 73?",
    options: ["7 tens and 3 ones", "3 tens and 7 ones", "73 tens and 0 ones", "6 tens and 13 ones"],
    correctAnswer: "7 tens and 3 ones",
  },
  {
    id: "y1-pt-06",
    prompt: "Which shows 45 in expanded form?",
    options: ["40 + 5", "4 + 5", "30 + 15", "50 - 10"],
    correctAnswer: "40 + 5",
  },
  {
    id: "y1-pt-07",
    prompt: "Skip count by 2s: 2, 4, 6, __, 10",
    options: ["7", "8", "9", "12"],
    correctAnswer: "8",
  },
  {
    id: "y1-pt-08",
    prompt: "Skip count by 5s: 5, 10, 15, __",
    options: ["18", "20", "25", "30"],
    correctAnswer: "20",
  },
  {
    id: "y1-pt-09",
    prompt: "Which number is odd?",
    options: ["24", "36", "51", "68"],
    correctAnswer: "51",
  },
  {
    id: "y1-pt-10",
    prompt: "What is 9 + 6?",
    options: ["14", "15", "16", "17"],
    correctAnswer: "15",
  },
  {
    id: "y1-pt-11",
    prompt: "What is 13 + 5?",
    options: ["17", "18", "19", "20"],
    correctAnswer: "18",
  },
  {
    id: "y1-pt-12",
    prompt: "What is 16 - 7?",
    options: ["8", "9", "10", "11"],
    correctAnswer: "9",
  },
  {
    id: "y1-pt-13",
    prompt: "What number makes this true: 6 + __ = 14?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
  },
  {
    id: "y1-pt-14",
    prompt: "You have $5. You spend $2. How much money is left?",
    options: ["$1", "$2", "$3", "$7"],
    correctAnswer: "$3",
  },
  {
    id: "y1-pt-15",
    prompt: "Which coins make $1.00 exactly?",
    options: [
      "50c + 20c + 20c + 10c",
      "50c + 20c + 20c + 5c",
      "20c + 20c + 20c + 20c",
      "50c + 50c + 20c",
    ],
    correctAnswer: "50c + 20c + 20c + 10c",
  },
  {
    id: "y1-pt-16",
    prompt: "What multiplication sentence matches 3 groups of 2?",
    options: ["3 + 2", "2 + 2 + 2", "3 × 2", "2 × 2"],
    correctAnswer: "3 × 2",
  },
  {
    id: "y1-pt-17",
    prompt: "What is 4 × 2?",
    options: ["6", "8", "10", "12"],
    correctAnswer: "8",
  },
  {
    id: "y1-pt-18",
    prompt: "Share 12 counters between 3 friends. How many does each friend get?",
    options: ["2", "3", "4", "6"],
    correctAnswer: "4",
  },
  {
    id: "y1-pt-19",
    prompt: "How many groups of 5 are in 15?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
  },
  {
    id: "y1-pt-20",
    prompt: "Which number sentence matches this story: There are 7 birds in one tree and 5 birds in another tree. How many birds altogether?",
    options: ["7 - 5", "7 + 5", "5 + 5", "12 - 7"],
    correctAnswer: "7 + 5",
  },
];

const YEAR2_POSTTEST_QUESTIONS: Question[] = [
  { id: "y2-pt-01", prompt: "Write this number in digits: Seven hundred and thirty-two", options: ["723", "732", "372", "237"], correctAnswer: "732" },
  { id: "y2-pt-02", prompt: "What is the value of 4 in 546?", options: ["4", "40", "400", "46"], correctAnswer: "40" },
  { id: "y2-pt-03", prompt: "Expand this number: 382", options: ["300 + 80 + 2", "380 + 2", "3 + 8 + 2", "30 + 80 + 2"], correctAnswer: "300 + 80 + 2" },
  { id: "y2-pt-04", prompt: "What number comes before 600?", options: ["601", "599", "500", "610"], correctAnswer: "599" },
  { id: "y2-pt-05", prompt: "What number is 10 more than 215?", options: ["216", "220", "225", "315"], correctAnswer: "225" },
  { id: "y2-pt-06", prompt: "Is 274 odd or even?", options: ["Odd", "Even"], correctAnswer: "Even" },
  { id: "y2-pt-07", prompt: "Circle the odd number: 108, 207, 402", options: ["108", "207", "402"], correctAnswer: "207" },
  { id: "y2-pt-08", prompt: "Put in order from smallest to largest: 145, 451, 154", options: ["145, 154, 451", "154, 145, 451", "451, 154, 145", "145, 451, 154"], correctAnswer: "145, 154, 451" },
  { id: "y2-pt-09", prompt: "What is halfway between 100 and 200?", options: ["125", "140", "150", "175"], correctAnswer: "150" },
  { id: "y2-pt-10", prompt: "Round 178 to the nearest 10", options: ["170", "180", "200", "175"], correctAnswer: "180" },
  { id: "y2-pt-11", prompt: "Solve: 54 + 29", options: ["73", "83", "93", "82"], correctAnswer: "83" },
  { id: "y2-pt-12", prompt: "Solve: 47 + 30", options: ["50", "67", "77", "80"], correctAnswer: "77" },
  { id: "y2-pt-13", prompt: "Which is a related fact to 6 + 3 = 9?", options: ["6 − 3 = 3", "9 − 6 = 3", "3 + 9 = 12", "9 + 3 = 12"], correctAnswer: "9 − 6 = 3" },
  { id: "y2-pt-14", prompt: "Solve: 83 − 40", options: ["40", "43", "53", "33"], correctAnswer: "43" },
  { id: "y2-pt-15", prompt: "What multiplication sentence matches 3 groups of 5?", options: ["5 × 3", "3 × 5", "3 + 5", "5 + 5 + 5"], correctAnswer: "3 × 5" },
  { id: "y2-pt-16", prompt: "Solve: 4 × 2", options: ["6", "8", "10", "2"], correctAnswer: "8" },
  { id: "y2-pt-17", prompt: "What is 5 more than 3 tens?", options: ["15", "35", "53", "8"], correctAnswer: "35" },
  { id: "y2-pt-18", prompt: "What is 60 + 30?", options: ["80", "90", "93", "63"], correctAnswer: "90" },
  { id: "y2-pt-19", prompt: "Solve: 12 ÷ 3", options: ["3", "4", "6", "9"], correctAnswer: "4" },
  { id: "y2-pt-20", prompt: "Solve: 10 ÷ 2", options: ["2", "3", "5", "8"], correctAnswer: "5" },
];

const YEAR4_POSTTEST_QUESTIONS: Question[] = [
  {
    id: "y4-pt-01",
    type: "mcq",
    prompt: "What is 8 × 6?",
    options: ["42", "46", "48", "54"],
    correctAnswer: "48",
    answer: "48",
    skillId: "multiplication_facts",
    skillLabel: "Multiplication Facts",
    strand: "Number",
    difficultyBand: "year4",
  },
];

const YEAR5_POSTTEST_QUESTIONS: Question[] = [
  {
    id: "y5-pt-01",
    type: "mcq",
    prompt: "What is 144 ÷ 6?",
    options: ["18", "24", "26", "36"],
    correctAnswer: "24",
    answer: "24",
    skillId: "division_fluency",
    skillLabel: "Division Fluency",
    strand: "Number",
    difficultyBand: "year5",
  },
];

export const POSTTESTS: Record<string, PostTest> = {
  "Year 1": {
    yearLabel: "Year 1",
    questions: YEAR1_POSTTEST_QUESTIONS,
  },
  "Year 2": {
    yearLabel: "Year 2",
    questions: YEAR2_POSTTEST_QUESTIONS,
  },
  "Year 3": {
    yearLabel: "Year 3",
    questions: [
      {
        id: "y3-pt-01",
        prompt: "What is 400 + 300?",
        options: ["500", "600", "700", "800"],
        correctAnswer: "700",
      },
      {
        id: "y3-pt-02",
        prompt: "What is 12 × 3?",
        options: ["24", "36", "48", "60"],
        correctAnswer: "36",
      },
    ],
  },
  "Year 4": {
    yearLabel: "Year 4",
    questions: YEAR4_POSTTEST_QUESTIONS,
  },
  "Year 5": {
    yearLabel: "Year 5",
    questions: YEAR5_POSTTEST_QUESTIONS,
  },
};
