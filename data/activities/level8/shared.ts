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
  chanceVisual?: import("./chance-visual").Chance8Visual;
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
/** Rounds half away from zero on the decimal value, so 6.7215 → 6.722 (toFixed gives 6.721). */
export const rounded = (n: number, places = 2) => {
  const text = String(Math.abs(n));
  if (text.includes("e")) return Number(n.toFixed(places));
  return (n < 0 ? -1 : 1) * Number(`${Math.round(Number(`${text}e${places}`))}e-${places}`);
};
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
/** Safety net for display text: 509.99999999999994 → 510, 56.00000000000001 → 56. */
const tidyNumbers = (text: string) =>
  text.replace(/\d+\.\d*?(?:0{7,}|9{7,})\d+/g, (m) => String(Number(Number(m).toPrecision(12))));
/** Display text shows a true minus sign: "(-2, -5)" → "(−2, −5)". Answers keep "-" for marking. */
const trueMinus = (text: string) => tidyNumbers(text).replace(/(^|[\s(,=])-(?=\d)/g, "$1−");
export function question(
  realm: Level8Realm,
  week: number,
  lesson: number,
  seed: number,
  raw: QuestionDraft,
): Level8Question {
  const draft: QuestionDraft = {
    ...raw,
    prompt: trueMinus(raw.prompt),
    answer: typeof raw.answer === "number" ? Number(raw.answer.toPrecision(12)) : tidyNumbers(raw.answer),
    steps: raw.steps.map(trueMinus),
    choices: raw.choices?.map(tidyNumbers),
  };
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
    // A step that continues the last calculation ("= 72 cubes") joins it without a full stop between.
    explanation: draft.steps.reduce((text, step, i) => (i && /^[=×÷+−≈]/.test(step) ? `${text.replace(/\.$/, "")} ${step}` : i ? `${text} ${step}` : step), ""),
    steps: draft.steps,
    cave7Visual: draft.visual,
    space8Visual: draft.spaceVisual,
    measurement8Visual: draft.measurementVisual,
    number8Visual: draft.numberVisual,
    algebra8Visual: draft.algebraVisual,
    chance8Visual: draft.chanceVisual,
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
