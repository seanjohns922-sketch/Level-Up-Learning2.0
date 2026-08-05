import type { Question } from "@/data/assessments/posttests";

export type MeasurelandsAnswerFormat =
  | { kind: "number"; unit?: string; ariaLabel: string }
  | { kind: "time"; ariaLabel: string; storage: "hhmm" }
  | { kind: "pair"; labels: [string, string]; separator: string; ariaLabel: string };

type PresentationInput = {
  prompt: string;
  correctAnswer: string;
  domain?: string;
  visual?: Question["visual"];
  inputMode?: Question["inputMode"];
  selected: boolean;
};

const UNIT_PATTERNS: Array<[string, string]> = [
  ["square centimetres?", "cm²"], ["square metres?", "m²"], ["square millimetres?", "mm²"],
  ["square units?", "units²"], ["degrees Celsius", "°C"], ["millilitres?", "mL"],
  ["kilolitres?", "kL"], ["centimetres?", "cm"], ["millimetres?", "mm"],
  ["kilometres?", "km"], ["kilograms?", "kg"], ["minutes?", "minutes"],
  ["seconds?", "seconds"], ["hours?", "hours"], ["degrees?", "°"],
  ["grams?", "g"], ["litres?", "L"], ["metres?", "m"], ["months?", "months"],
  ["days?", "days"], ["cubes?", "cubes"], ["blocks?", "blocks"], ["cups?", "cups"],
  ["scoops?", "scoops"], ["counters?", "counters"], ["tiles?", "tiles"],
  ["squares?", "squares"], ["pieces?", "pieces"], ["sections?", "sections"],
  ["turns?", "turns"], ["corners?", "corners"],
];
const UNIT_SOURCE = UNIT_PATTERNS.map(([source]) => source).join("|");

function displayUnit(matched: string): string | undefined {
  return UNIT_PATTERNS.find(([source]) => new RegExp(`^${source}$`, "i").test(matched))?.[1];
}

function requestedUnit(prompt: string): string | undefined {
  const request = prompt.slice(Math.max(0, prompt.toLowerCase().lastIndexOf("enter")));
  for (const pattern of [
    new RegExp(`number of\\s+(${UNIT_SOURCE})\\b`, "i"),
    new RegExp(`how many\\s+(${UNIT_SOURCE})\\b`, "i"),
    new RegExp(`(?:answer|length|width|mass|capacity|volume|area|perimeter|difference|duration|estimate|amount|temperature|value|x)\\s+in\\s+(${UNIT_SOURCE})\\b`, "i"),
    new RegExp(`\\binto\\s+(${UNIT_SOURCE})\\b`, "i"),
    new RegExp(`\\benter(?:\\s+the|\\s+its|\\s+their|\\s+your|\\s+correct|\\s+total|\\s+numerical)*\\s+(${UNIT_SOURCE})\\b`, "i"),
    new RegExp(`\\bin\\s+(${UNIT_SOURCE})[.?!]*$`, "i"),
  ]) {
    const match = request.match(pattern);
    if (match?.[1]) return displayUnit(match[1]);
  }
  return undefined;
}

function targetUnit(prompt: string, domain?: string, visual?: Question["visual"]): string | undefined {
  const requested = requestedUnit(prompt);
  if (requested) return requested;
  if (domain === "angle" && !/how many (?:of )?(?:its )?(?:corners|turns)|number of (?:right-angle )?corners/i.test(prompt)) return "°";
  if (typeof visual !== "object" || visual === null || !("kind" in visual)) return undefined;
  const item = visual as { kind?: unknown; mode?: unknown; unit?: unknown };
  if (item.kind !== "rectangle" || typeof item.unit !== "string") return undefined;
  if (item.mode === "area") return item.unit === "units" ? "units²" : `${item.unit}²`;
  return item.unit;
}

function instructionAsQuestion(instruction: string): string {
  let text = instruction.trim().replace(/[.]+$/, "");
  text = text.replace(/^enter\s+/i, "");
  text = text.replace(/^correct it by entering\s+/i, "the correct ");
  text = text.replace(/\s+as four digits(?: in 24-hour time)?(?:,? without punctuation)?/i, "");
  text = text.replace(/\s+in 24-hour time(?:,? without punctuation)?/i, "");
  text = text.replace(/\s+using a comma/i, "");
  text = text.replace(/\s+in (?:square )?(?:centimetres?|metres?|millimetres?|kilometres?|grams?|kilograms?|millilitres?|litres?|degrees(?: Celsius)?|minutes?|seconds?|hours?|days?|blocks?|cubes?|cups?|scoops?|units?)(?:\s+time)?$/i, "");
  const comparative = text.match(/^how many (.+?) (heavier|longer) (.+) (is|are)$/i);
  if (comparative) return `How many ${comparative[1]} ${comparative[2]} ${comparative[4] === "are" ? "are" : "is"} ${comparative[3]}?`;
  const more = text.match(/^how many more (.+?) (.+) (holds|hold)$/i);
  if (more) return `How many more ${more[1]} does ${more[2]} hold?`;
  const fencing = text.match(/^(?:the )?metres of fencing (?:needed|required)(.*)$/i);
  if (fencing) return `How many metres of fencing are needed${fencing[1]}?`;
  if (/^(?:the )?metres needed$/i.test(text)) return "How many metres are needed?";
  const howLong = text.match(/^how long (.+?) is (.+)$/i);
  if (howLong) return `How long is ${howLong[1]} ${howLong[2]}?`;
  if (/^how many\b/i.test(text)) return `${text[0]!.toUpperCase()}${text.slice(1)}?`;
  if (/^how long\b/i.test(text)) return `${text[0]!.toUpperCase()}${text.slice(1)}?`;
  if (/^the number of\b/i.test(text)) return `How many ${text.replace(/^the number of\s+/i, "")}?`;
  if (/^(its|his|her|their)\b/i.test(text)) return `What is ${text}?`;
  if (/^x\b/i.test(text)) return `What is ${text}?`;
  if (/^the\b/i.test(text)) return `What is ${text}?`;
  return `What is ${text}?`;
}

function requiredVisual(prompt: string, visual?: Question["visual"]): Question["visual"] {
  if (typeof visual !== "object" || visual === null || !("kind" in visual)) return visual;
  const kind = String((visual as { kind?: unknown }).kind);
  if (kind === "concept" || kind === "convert") return undefined;
  if (["ruler", "scaleDial", "jug", "thermometer"].includes(kind)) {
    return /\b(?:read|shown|show)\b/i.test(prompt) ? visual : undefined;
  }
  if (kind === "clock") return /(?:read|shown|show).{0,30}clock|clock.{0,30}(?:shown|show)/i.test(prompt) ? visual : undefined;
  if (kind === "rectangle") return /\b(?:this|shown|diagram|plan|outline)\b/i.test(prompt) ? visual : undefined;
  if (kind === "angle") return /\b(?:read|shown|estimate|protractor)\b/i.test(prompt) ? visual : undefined;
  return visual;
}

export function conciseMeasurelandsPrompt(prompt: string, domain?: string, visual?: Question["visual"]): string {
  const visualKind = typeof visual === "object" && visual !== null && "kind" in visual ? String((visual as { kind?: unknown }).kind) : "";
  if (visualKind === "clock" && /^read the .+ clock shown\./i.test(prompt)) {
    const label = prompt.match(/^read the (.+?) clock shown\./i)?.[1] ?? "";
    return `What time does the ${label} clock show?`;
  }
  if (domain === "clock" && /^read the .+ clock shown\./i.test(prompt)) return "What time does the clock show?";

  const split = prompt.match(/^(.*?)[.]\s+(Enter .*)$/i);
  if (split) return `${split[1]}. ${instructionAsQuestion(split[2]!)}`;

  const commaSplit = prompt.match(/^(.*?),\s+(enter .*)$/i);
  if (commaSplit) return `${commaSplit[1]}. ${instructionAsQuestion(commaSplit[2]!)}`;

  if (/^Enter\s+/i.test(prompt)) return instructionAsQuestion(prompt);
  const revised = prompt
    .replace(/Correct it by entering the /i, "What is the correct ")
    .replace(/entering the /i, "giving the ")
    .replace(/\s+as four digits(?: in 24-hour time)?(?:,? without punctuation)?/gi, "")
    .replace(/\s+without punctuation/gi, "");
  return revised
    .replace(/How long it is open\?/i, "How long is it open?")
    .replace(/What is the metres needed\?/i, "How many metres are needed?")
    .replace(/What is the metres of fencing (?:needed|required)(.*?)\?/i, "How many metres of fencing are needed$1?")
    .replace(/[.]$/, "?");
}

export function prepareMeasurelandsAssessmentPresentation(input: PresentationInput): {
  prompt: string;
  visual: Question["visual"];
  answerFormat?: MeasurelandsAnswerFormat;
  inputMode?: Question["inputMode"];
} {
  const prompt = conciseMeasurelandsPrompt(input.prompt, input.domain, input.visual);
  const visual = requiredVisual(input.prompt, input.visual);
  if (input.selected) return { prompt, visual, inputMode: input.inputMode };

  const isTime = (/four digits|24-hour time|time as/i.test(input.prompt) || input.domain === "clock" || input.domain === "time24")
    && /^\d{1,4}$/.test(input.correctAnswer);
  const isPair = input.inputMode === "text" && input.correctAnswer.includes(",");
  if (isTime) return { prompt, visual, inputMode: "text", answerFormat: { kind: "time", storage: "hhmm", ariaLabel: "Time" } };
  if (isPair) {
    const labels: [string, string] = input.domain === "angle" ? ["x", "y"] : ["Length", "Width"];
    const pairPrompt = input.domain === "angle"
      ? prompt.replace(/What is x,y\?/i, "What are x and y?")
      : prompt.replace(/What is length,width\?/i, "What are the length and width?");
    return { prompt: pairPrompt, visual, inputMode: "text", answerFormat: { kind: "pair", labels, separator: ",", ariaLabel: labels.join(" and ") } };
  }
  const unit = targetUnit(input.prompt, input.domain, input.visual);
  return { prompt, visual, inputMode: input.inputMode ?? "decimal", answerFormat: { kind: "number", unit, ariaLabel: unit ? `Answer in ${unit}` : "Numerical answer" } };
}
