export type Question =
  | {
      type: "mcq";
      id: string;
      prompt: string;
      options: Array<string | { label: string; groups?: number[] }>;
      answer: string;
      answerIndex?: number;
      visual?: Visual;
    }
  | {
      type: "numberLine";
      id: string;
      prompt: string;
      options: number[];
      answer: number;
      min: number;
      max: number;
    }
  | {
      type: "mab";
      id: string;
      prompt: string;
      target: number;
      maxTens?: number;
      maxOnes?: number;
    }
  | {
      id: string;
      type: "groups";
      prompt: string;
      options: {
        id: string;
        label: string;
        groups: number[];
      }[];
      answerOptionId: string;
    };

export type DotAddVisual = {
  type: "dot_add";
  leftTarget: number;
  rightTarget: number;
  maxDots?: number;
};

export type GroupCountersVisual = {
  type: "group_counters";
  totalCounters: number;
  groups: number;
  layout?: "rows";
  groupSize?: number;
  selectTarget?: number;
};

export type Visual = DotAddVisual | GroupCountersVisual;

export const YEAR3_PRETEST: Question[] = [
  // Paste your real Qs here
  {
    type: "mcq",
    id: "y3-q1",
    prompt: "What is 3,000 + 400 + 20 + 5?",
    options: ["3,425", "3,452", "3,245", "3,405"],
    answer: "3,425",
  },
];
