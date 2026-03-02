export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

export type PostTest = {
  yearLabel: string;
  questions: Question[];
};

export const POSTTESTS: Record<string, PostTest> = {
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
