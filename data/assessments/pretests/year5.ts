export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export const YEAR5_PRETEST: Question[] = [
  // Paste your real Qs here
  {
    type: "mcq",
    id: "y5-q1",
    prompt: "What is 125 ÷ 5?",
    options: ["20", "25", "30", "35"],
    answer: "25",
  },
];
