export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export const YEAR2_PRETEST: Question[] = [
  // Paste your real Qs here
  {
    type: "mcq",
    id: "y2-q1",
    prompt: "What is 27 + 15?",
    options: ["32", "42", "52", "45"],
    answer: "42",
  },
];
