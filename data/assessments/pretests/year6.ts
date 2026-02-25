export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export const YEAR6_PRETEST: Question[] = [
  // Paste your real Qs here
  {
    type: "mcq",
    id: "y6-q1",
    prompt: "What is 3/4 of 24?",
    options: ["12", "16", "18", "20"],
    answer: "18",
  },
];
