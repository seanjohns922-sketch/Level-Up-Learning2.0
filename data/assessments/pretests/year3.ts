import type { Question } from "./prep";

export type { Question };

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
