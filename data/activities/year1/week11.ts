import type { Difficulty, PracticeTask, Year1PatternToken } from "./practice-task";

const UNITS: readonly Year1PatternToken[][] = [
  ["amber-star", "cyan-gem"],
  ["blue-circle", "green-square"],
  ["rose-robot", "amber-star", "cyan-gem"],
  ["violet-triangle", "blue-circle", "blue-circle"],
  ["green-square", "green-square", "amber-star"],
  ["cyan-gem", "rose-robot", "rose-robot"],
];

const ALL_TOKENS: readonly Year1PatternToken[] = [
  "amber-star",
  "cyan-gem",
  "rose-robot",
  "blue-circle",
  "green-square",
  "violet-triangle",
];

let cursor = 0;

function nextUnit(difficulty: Difficulty): Year1PatternToken[] {
  const pool = difficulty === "easy" ? UNITS.slice(0, 2) : UNITS;
  const unit = pool[cursor % pool.length]!;
  cursor += 1;
  return [...unit];
}

function tokenName(token: Year1PatternToken): string {
  return token.replace("-", " ");
}

function paletteFor(unit: readonly Year1PatternToken[]): Year1PatternToken[] {
  const extra = ALL_TOKENS.find((token) => !unit.includes(token))!;
  return [...unit.filter((token, index) => unit.indexOf(token) === index), extra];
}

function identifyUnitTask(difficulty: Difficulty): PracticeTask {
  const answerUnit = nextUnit(difficulty);
  const sequence = Array.from({ length: difficulty === "hard" ? 3 : 2 }, () => answerUnit).flat();
  const extended = [...answerUnit, answerUnit[0]!];
  const partial = [answerUnit[0]!];
  const reversed = [...answerUnit].reverse();
  const distractors = [partial, extended, reversed]
    .filter((candidate, index, items) => candidate.join("|") !== answerUnit.join("|") && items.findIndex((item) => item.join("|") === candidate.join("|")) === index)
    .slice(0, 2);
  return {
    kind: "repeatingPattern",
    mode: "identify_unit",
    prompt: "Tap the complete part that repeats.",
    speakText: "Tap the complete part that repeats.",
    sequence,
    unitOptions: [answerUnit, ...distractors].sort(() => Math.random() - 0.5),
    answerUnit,
  };
}

function continuePatternTask(difficulty: Difficulty): PracticeTask {
  const unit = nextUnit(difficulty);
  const sequence = Array.from({ length: 2 }, () => unit).flat();
  const answer = difficulty === "easy" ? unit.slice(0, 1) : unit.slice(0, 2);
  return {
    kind: "repeatingPattern",
    mode: "continue",
    prompt: `Build the next ${answer.length} ${answer.length === 1 ? "part" : "parts"}.`,
    speakText: `Build the next ${answer.length} ${answer.length === 1 ? "part" : "parts"} in the repeating pattern.`,
    sequence,
    palette: paletteFor(unit),
    answer,
  };
}

function createPatternTask(difficulty: Difficulty): PracticeTask {
  const repeatUnit = nextUnit(difficulty);
  const repeats = difficulty === "hard" ? 3 : 2;
  return {
    kind: "repeatingPattern",
    mode: "create",
    prompt: `Build ${repeats} repeats of ${repeatUnit.map(tokenName).join(", then ")}.`,
    speakText: `Build ${repeats} repeats of ${repeatUnit.map(tokenName).join(", then ")}.`,
    repeatUnit,
    repeats,
    palette: paletteFor(repeatUnit),
  };
}

export function generateWeek11Task(lessonId: string, difficulty: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w11-l1") return identifyUnitTask(difficulty);
  if (lessonId === "y1-w11-l2") return continuePatternTask(difficulty);
  if (lessonId === "y1-w11-l3") return createPatternTask(difficulty);
  return identifyUnitTask(difficulty);
}

export function resetWeek11TaskSessionState(): void {
  cursor = 0;
}
