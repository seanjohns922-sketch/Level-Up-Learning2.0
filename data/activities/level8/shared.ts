import type { MultipleChoiceQuestion } from "@/data/activities/year2/lessonEngine";
import type { Cave7Visual } from "@/data/activities/cave7/shared";
import type { Level7Answer } from "@/lib/level7-answer";
import type { Level8Realm } from "@/lib/level8-config";
export const LEVEL8_CONTENT_REVISION = 2;

export type QuestionDraft = {
  prompt: string;
  answer: string | number;
  steps: string[];
  visual?: Cave7Visual;
  spaceVisual?: {
    polygons?: import("@/data/assessments/revisions/level8StarpathFiveForms").Polygon8[];
    space?: import("@/data/assessments/revisions/level8StarpathFiveForms").Space8;
  };
  measurementVisual?: import("@/data/assessments/revisions/year8MeasurementFiveForms").Measurement8Visual;
  numberVisual?: import("./number-visual").Number8Visual;
  algebraVisual?: import("./algebra-visual").Algebra8Visual;
  /** Expression answers that must be written expanded or fully factorised, not just equivalent. */
  format?: Level7Answer["format"];
  unit?: string;
  choices?: string[];
  input?: Level7Answer["kind"];
  labels?: string[];
};
export type Level8Question = MultipleChoiceQuestion & {
  lessonId: string;
  version: 1;
  steps: string[];
  answerSpec?: Level7Answer;
};
export type LessonFactory = (seed: number) => QuestionDraft;
export const rounded = (n: number, places = 2) => Number(n.toFixed(places));
export function random(seed: number) {
  let state = seed >>> 0;
  return (min: number, max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return min + Math.floor((state / 4294967296) * (max - min + 1));
  };
}
export function fraction(n: number, d: number): string {
  if (!d) throw new Error("A fraction needs a nonzero denominator");
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(Math.abs(n), Math.abs(d));
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}
export const table = (
  title: string,
  headers: string[],
  rows: (string | number)[][],
): Cave7Visual => ({
  kind: "table",
  title,
  headers,
  rows: rows.map((row) => row.map(String)),
});
export const formula = (
  title: string,
  value: string,
  meaning = "",
): Cave7Visual => ({ kind: "formula", title, formula: value, meaning });
export function question(
  realm: Level8Realm,
  week: number,
  lesson: number,
  seed: number,
  draft: QuestionDraft,
): Level8Question {
  const answer = String(draft.answer);
  if (
    !draft.prompt ||
    !draft.steps.length ||
    !answer ||
    /NaN|Infinity/.test(answer)
  )
    throw new Error(`Invalid Level 8 question: ${realm}/${week}/${lesson}`);
  // Keep short conceptual comparisons as choices; calculations use constructed answers.
  const conceptualSets = [
    ["Rational", "Irrational"],
    ["Terminating", "Recurring"],
    ["Congruent", "Similar"],
    ["SSS", "SAS", "RHS", "AAA"],
    ["Sample", "Census"],
    ["Experiment", "Observation"],
    ["Primary", "Secondary"],
    ["Random", "Non-random"],
    ["Selection", "Measurement"],
    ["Yes", "No"],
  ];
  const choices =
    draft.choices ?? conceptualSets.find((set) => set.includes(answer));
  const prompt = choices
    ? draft.prompt
        .replace(/ Type yes or no\./, "")
        .replace(/ Type selection or measurement\./, "")
    : draft.prompt;
  const options = choices ? [...choices] : [answer];
  if (
    choices &&
    (!options.includes(answer) || new Set(options).size !== options.length)
  )
    throw new Error("Invalid choice set");
  const int = random(seed);
  for (let i = options.length - 1; i > 0; i--) {
    const j = int(0, i);
    [options[i], options[j]] = [options[j], options[i]];
  }
  const kind =
    draft.input ??
    (answer.includes("/")
      ? "fraction"
      : /^-?\d+(\.\d+)?$/.test(answer)
        ? "number"
        : "text");
  return {
    kind: "multiple_choice",
    lessonId: `y8-${realm}-w${week}-l${lesson}`,
    version: 1,
    readabilityRevision: LEVEL8_CONTENT_REVISION,
    prompt,
    answer,
    options,
    explanation: draft.steps.join(" "),
    steps: draft.steps,
    cave7Visual: draft.visual,
    space8Visual: draft.spaceVisual,
    measurement8Visual: draft.measurementVisual,
    number8Visual: draft.numberVisual,
    algebra8Visual: draft.algebraVisual,
    ...(choices
      ? {}
      : {
          answerSpec: {
            kind,
            expected: answer,
            prompt: draft.prompt,
            unit: draft.unit,
            ...(draft.format ? { format: draft.format } : {}),
            ...(kind === "list"
              ? {
                  labels:
                    draft.labels ??
                    answer.split(",").map((_, i) => `Value ${i + 1}`),
                }
              : {}),
          },
        }),
  };
}
