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

// Year 3 assessments are generated exclusively from `level3Blueprint.ts`.
// This export is intentionally unused placeholder data so the file can still
// satisfy type imports without competing with the runtime blueprint path.
export const YEAR3_PRETEST: Question[] = [];
