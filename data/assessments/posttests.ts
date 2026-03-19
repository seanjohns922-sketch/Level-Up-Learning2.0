import { YEAR2_PRETEST } from "./pretests/year2";

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

/** Deterministic shuffle using a simple seed */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildYear2PostTest(): Question[] {
  const mcqs = YEAR2_PRETEST.filter((q) => q.options && q.answer);
  const shuffled = seededShuffle(mcqs, 42);
  return shuffled.map((q, i) => ({
    id: `y2-pt-${String(i + 1).padStart(2, "0")}`,
    prompt: q.prompt,
    options: q.options as string[],
    correctAnswer: String(q.answer),
  }));
}

export const POSTTESTS: Record<string, PostTest> = {
  "Year 2": {
    yearLabel: "Year 2",
    questions: buildYear2PostTest(),
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
