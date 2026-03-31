export type Question = {
  id: string;
  type?: string;
  prompt: string;
  options: any[];
  correctAnswer: string;
  answer?: any;
  answerOptionId?: string;
  skillId?: string;
  skillLabel?: string;
  linkedWeeks?: number[];
  linkedLessons?: number[];
  strand?: string;
  difficultyBand?: string;
  visual?: any;
};

export type PostTest = {
  yearLabel: string;
  questions: Question[];
};

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

export const POSTTESTS: Record<string, PostTest> = {
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
};
