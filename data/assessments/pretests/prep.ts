export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export const PREP_PRETEST: Question[] = [
  // Paste your real Qs here
  {
    type: "mcq",
    id: "prep-q1",
    prompt: "Which number is the largest?",
    options: ["4", "8", "2", "5"],
    answer: "8",
  },
];
