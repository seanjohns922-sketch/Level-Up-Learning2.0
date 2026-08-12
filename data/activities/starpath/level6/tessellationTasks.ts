import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { RULE_LABEL, TESSELLATING_IDS, getTile, type TileRule } from "./tessellation";

type TessTask = Extract<PracticeTask, { kind: "starpathTessellation" }>;
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);

// A mix of tessellating and non-tessellating tiles for yes/no variety.
const WILL_ORDER = ["square", "pentagon", "triangle", "circle", "hexagon", "rectangle", "lshape", "parallelogram"];
const willFor = (round: number) => WILL_ORDER[round % WILL_ORDER.length]!;
const tessFor = (round: number, offset = 0) => TESSELLATING_IDS[(round + offset) % TESSELLATING_IDS.length]!;
// Interleaved so the transformation rule (translate/rotate) varies across a lesson.
const RULE_MIX = ["square", "triangle", "hexagon", "lshape", "rectangle", "parallelogram"];
const ruleFor = (round: number) => RULE_MIX[round % RULE_MIX.length]!;

const base = (mode: TessTask["mode"], tileId: string, target: number) => ({ kind: "starpathTessellation" as const, mode, tileId, target });

// W6 L1 / W7 — does this shape tessellate?
export function willTessellateTask(round: number, target: number): TessTask {
  const tile = getTile(willFor(round));
  const options = order([
    { id: "yes", label: "Yes, it tessellates" },
    { id: "no", label: "No, it leaves gaps" },
  ], round);
  return {
    ...base("will", tile.id, target),
    prompt: `Does the ${tile.name.toLowerCase()} tessellate — fill the plane with no gaps?`,
    speakText: "Look at the tiling. A tessellation covers the plane with no gaps and no overlaps.",
    options, correctOptionIds: [tile.tessellates ? "yes" : "no"],
    feedback: { correct: tile.tessellates ? `Yes — ${tile.angleReason}` : `Right — ${tile.angleReason}`, wrong: "Look for gaps or overlaps where the corners meet." },
  };
}

// W6 L2 — which transformation rule generates the tiling?
export function patternRuleTask(round: number, target: number): TessTask {
  const tile = getTile(ruleFor(round));
  const rules: TileRule[] = ["translate", "rotate", "reflect"];
  const options = order(rules.map((r) => ({ id: r, label: RULE_LABEL[r] })), round);
  return {
    ...base("rule", tile.id, target),
    prompt: `Which transformation rule repeats the ${tile.name.toLowerCase()} to make this pattern?`,
    speakText: "A tessellation is made by repeating one tile with a transformation. Which rule fits this pattern?",
    options, correctOptionIds: [tile.rule!],
    feedback: { correct: `Correct — the copies are made by that rule.`, wrong: "Watch how one tile maps onto the next: is it slid, turned, or flipped?" },
  };
}

// W6 L3 / W7 — why do the tiles fit with no gaps?
export function explainFitTask(round: number, target: number): TessTask {
  const tile = getTile(tessFor(round, 2));
  const options = order([
    { id: "angles", label: "The angles that meet at a corner add to 360 degrees" },
    { id: "colour", label: "The tiles are different colours" },
    { id: "size", label: "The tiles get smaller each row" },
  ], round);
  return {
    ...base("explain", tile.id, target),
    prompt: "Why do these tiles fit together with no gaps?",
    speakText: "Think about the corners where tiles meet. What has to be true about the angles there?",
    options, correctOptionIds: ["angles"],
    feedback: { correct: `Correct — ${tile.angleReason}`, wrong: "Colour and size do not matter. Look at the angles meeting at each corner." },
  };
}

// W7 L1 — notice the repeating rule (same idea as pattern rule, investigation framing).
export function noticeRuleTask(round: number, target: number): TessTask {
  const tile = getTile(ruleFor(round + 1));
  const rules: TileRule[] = ["translate", "rotate", "reflect"];
  const options = order(rules.map((r) => ({ id: r, label: RULE_LABEL[r] })), round);
  return {
    ...base("notice", tile.id, target),
    prompt: "Investigate the pattern. What rule takes each tile to the next?",
    speakText: "Track a single tile onto its neighbour. Is it slid, turned or flipped to get there?",
    options, correctOptionIds: [tile.rule!],
    feedback: { correct: "Correct — that is the rule repeating across the pattern.", wrong: "Follow one tile onto the next and describe the move." },
  };
}

// W7 L2 — vary one transformation: what breaks the tessellation?
export function varyTask(round: number, target: number): TessTask {
  const tile = getTile(tessFor(round, 3));
  const options = order([
    { id: "break", label: "Gaps or overlaps would appear" },
    { id: "same", label: "Nothing would change" },
    { id: "colour", label: "Only the colours would change" },
  ], round);
  return {
    ...base("vary", tile.id, target),
    prompt: "If every second copy were made a different size, what would happen to the tessellation?",
    speakText: "A tessellation needs identical copies. Predict what changing the size of some copies would do.",
    options, correctOptionIds: ["break"],
    feedback: { correct: "Correct — different-sized copies no longer meet edge to edge, so gaps or overlaps appear.", wrong: "The copies must stay congruent. Different sizes would stop them meeting exactly." },
  };
}

// W7 L3 — explain with evidence: what proves it is a tessellation?
export function evidenceTask(round: number, target: number): TessTask {
  const tile = getTile(tessFor(round, 4));
  const options = order([
    { id: "nogaps", label: "There are no gaps and no overlaps anywhere" },
    { id: "pretty", label: "The pattern looks nice" },
    { id: "many", label: "There are lots of tiles" },
  ], round);
  return {
    ...base("evidence", tile.id, target),
    prompt: "What is the evidence that this pattern is a true tessellation?",
    speakText: "Use evidence, not looks. What must be true everywhere for a pattern to be a tessellation?",
    options, correctOptionIds: ["nogaps"],
    feedback: { correct: "Correct — a tessellation covers the plane with no gaps and no overlaps.", wrong: "Looks and count are not evidence. Check for gaps and overlaps everywhere." },
  };
}
