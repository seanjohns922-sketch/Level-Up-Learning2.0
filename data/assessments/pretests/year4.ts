export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export const YEAR4_PRETEST: Question[] = [
  // Paste your real Qs here
  {
    type: "mcq",
    id: "y4-q1",
    prompt: "What is 6 × 7?",
    options: ["36", "40", "42", "48"],
    answer: "42",
  },
];
