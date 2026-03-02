export type Question = {
  type?: string;
  id: string;
  prompt: string;
  options?: any[];
  answer?: any;
  answerIndex?: number;
  answerOptionId?: string;
  visual?: any;
  min?: number;
  max?: number;
  target?: number;
  maxTens?: number;
  maxOnes?: number;
  numberLine?: {
    min: number;
    max: number;
    answer: number;
  };
};

export const PREP_PRETEST: Question[] = [
  {
    type: "mcq",
    id: "prep-q1",
    prompt: "Which number is the largest?",
    options: ["4", "8", "2", "5"],
    answer: "8",
  },
];
