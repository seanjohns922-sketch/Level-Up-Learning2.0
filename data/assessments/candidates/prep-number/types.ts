import type { DesignedForm, SkillSlot } from "../../design/assessmentContract";

export const PREP_NUMBER_CANDIDATE_VERSION = "prep-number-2026-09-15-candidate-2";
export type Token = "star" | "crystal" | "robot" | "leaf" | "shell";
export type PrepNumberTask =
  | { kind: "numerals"; targets: [number, number]; choices: number[][] }
  | { kind: "count"; count: number; layout: number; quickLook: boolean }
  | { kind: "combine"; parts: [number, number] }
  | { kind: "missing"; whole: number; part: number }
  | { kind: "add"; start: number; change: number; supply: number }
  | { kind: "remove"; start: number; change: number }
  | { kind: "share"; total: number; recipients: number; initial?: number[] }
  | { kind: "pattern"; source: Token[]; palette: Token[]; blanks: number; copy: boolean }
  | { kind: "order"; cards: number[] }
  | { kind: "compare"; a: number; b: number }
  | { kind: "partition"; total: number; previous?: [number, number] }
  | { kind: "match"; count: number; choices: number[]; layout: number }
  | { kind: "group"; total: number; size: number }
  | { kind: "build"; target: number; supply: number }
  | { kind: "conserve"; count: number; layout: number; reasons: string[] }
  | { kind: "supply_shortfall"; recipients: number; available: number }
  | { kind: "provide"; recipients: number; supply: number };

export type PrepNumberCandidate = {
  id: string;
  version: string;
  blueprintVersion: string;
  form: DesignedForm;
  slot: SkillSlot;
  prompt: string;
  token: Token;
  task: PrepNumberTask;
  maximumScore: 1;
  status: "candidate";
};

/** Raw evidence, never a client-supplied correctness flag. -1 means supply/unplaced.
 * placements[index] identifies the destination of that original object.
 * pairs[index] identifies the object in collection B paired with object A[index]. */
export type PrepNumberResponse = {
  values?: number[];
  symbols?: Token[];
  placements?: number[];
  pairs?: number[];
  choice?: number;
  reason?: string;
};
export type PrepNumberSubmission = {
  itemId: string;
  version: string;
  response: PrepNumberResponse;
};
