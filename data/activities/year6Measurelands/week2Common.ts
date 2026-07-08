import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 6 · Week 2 — "Breaking Apart Shapes" (AC9M6M02) ──────
// Composite RECTILINEAR area: split an L-shape (or T/step) into rectangles, find
// each area, add them. No algebra, no missing side lengths — every sub-rectangle
// carries its own labelled length × width. Extends the Area Builder.

type AreaTask = Extract<PracticeTask, { kind: "area" }>;
export type Rect = { x: number; y: number; w: number; h: number };

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function between(lo: number, hi: number): number { return lo + randInt(hi - lo + 1); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}

type Corner = "TR" | "TL" | "BR" | "BL";
export type LData = {
  gridW: number; gridH: number; notchW: number; notchH: number; corner: Corner;
  total: number;
  hSplit: number; vSplit: number;        // valid horizontal (row) / vertical (col) cut
  hRects: [Rect, Rect]; vRects: [Rect, Rect];
};

// Build an L-shape = bounding box minus one corner notch, with both valid
// (horizontal and vertical) 2-rectangle decompositions computed.
export function makeL(min = 4, max = 8): LData {
  const gridW = between(min, max);
  const gridH = between(min, Math.min(max, 7));
  const notchW = between(1, gridW - 2);
  const notchH = between(1, gridH - 2);
  const corner = choose<Corner>(["TR", "TL", "BR", "BL"]);
  const right = corner === "TR" || corner === "BR";
  const top = corner === "TR" || corner === "TL";

  const hSplit = top ? notchH : gridH - notchH;
  const vSplit = right ? gridW - notchW : notchW;

  const hRects: [Rect, Rect] = top
    ? [{ x: right ? 0 : notchW, y: 0, w: gridW - notchW, h: notchH }, { x: 0, y: notchH, w: gridW, h: gridH - notchH }]
    : [{ x: 0, y: 0, w: gridW, h: gridH - notchH }, { x: right ? 0 : notchW, y: gridH - notchH, w: gridW - notchW, h: notchH }];
  const vRects: [Rect, Rect] = right
    ? [{ x: 0, y: 0, w: gridW - notchW, h: gridH }, { x: gridW - notchW, y: top ? notchH : 0, w: notchW, h: gridH - notchH }]
    : [{ x: 0, y: top ? notchH : 0, w: notchW, h: gridH - notchH }, { x: notchW, y: 0, w: gridW - notchW, h: gridH }];

  return { gridW, gridH, notchW, notchH, corner, total: gridW * gridH - notchW * notchH, hSplit, vSplit, hRects, vRects };
}

function pickDecomp(l: LData): [Rect, Rect] { return randInt(2) === 0 ? l.hRects : l.vRects; }
const rectArea = (r: Rect) => r.w * r.h;

// Real contexts for Lesson 3 (emoji matches the label).
export const L3_CONTEXTS = [
  { label: "school playground", emoji: "🛝" },
  { label: "community garden", emoji: "🥕" },
  { label: "sports complex", emoji: "🏟️" },
  { label: "shopping centre", emoji: "🛒" },
  { label: "museum floor", emoji: "🏛️" },
  { label: "school building", emoji: "🏫" },
];

// ── Lesson 1: break the shape (choose / drag / which works) ────────────────────
export function splitChooseTask(): AreaTask {
  const l = makeL(4, 7);
  // one valid line (pick an orientation) + two decoys that leave a non-rectangle.
  const useH = randInt(2) === 0;
  const valid = useH ? { id: "valid", orient: "h" as const, pos: l.hSplit } : { id: "valid", orient: "v" as const, pos: l.vSplit };
  const decoys: Array<{ id: string; orient: "h" | "v"; pos: number }> = [];
  // a horizontal decoy inside the notch band (leaves an L), and a vertical one.
  const top = l.corner === "TR" || l.corner === "TL";
  const right = l.corner === "TR" || l.corner === "BR";
  const hDecoyRow = top ? Math.max(1, l.hSplit - 1) : Math.min(l.gridH - 1, l.hSplit + 1);
  const vDecoyCol = right ? Math.min(l.gridW - 1, l.vSplit + 1) : Math.max(1, l.vSplit - 1);
  decoys.push({ id: "dh", orient: "h", pos: hDecoyRow });
  decoys.push({ id: "dv", orient: "v", pos: vDecoyCol });
  const candidates = shuffle([{ ...valid, valid: true }, { ...decoys[0]!, valid: false }, { ...decoys[1]!, valid: false }]);
  return {
    kind: "area", scene: "splitChoose", figureMode: "cells",
    composite: { gridW: l.gridW, gridH: l.gridH, rects: useH ? l.hRects : l.vRects },
    splitCandidates: candidates,
    prompt: "Which cut splits it into two rectangles?",
    speakText: "Architects break big shapes into smaller ones. Tap the cut that splits this shape into two rectangles.",
    badgeLabel: "Where to Split",
    feedback: { correct: "Two clean rectangles!", wrong: "That cut leaves a shape that isn't a rectangle." },
  };
}

export function splitDragTask(): AreaTask {
  const l = makeL(4, 7);
  const useH = randInt(2) === 0;
  return {
    kind: "area", scene: "splitDrag", figureMode: "cells",
    composite: { gridW: l.gridW, gridH: l.gridH, rects: useH ? l.hRects : l.vRects },
    dragOrient: useH ? "h" : "v",
    dragValidPos: useH ? l.hSplit : l.vSplit,
    prompt: "Slide the cut to split it into two rectangles.",
    speakText: "Slide the dotted line to the place that splits this shape into two rectangles, then press Split.",
    badgeLabel: "Split the Shape",
    feedback: { correct: "Perfect split!", wrong: "Move the line so both parts are rectangles." },
  };
}

export function splitWorksTask(): AreaTask {
  const l = makeL(4, 7);
  const top = l.corner === "TR" || l.corner === "TL";
  const right = l.corner === "TR" || l.corner === "BR";
  const valid = { id: "ok", orient: "h" as const, pos: l.hSplit };
  const badH = { id: "bad1", orient: "h" as const, pos: top ? Math.max(1, l.hSplit - 1) : Math.min(l.gridH - 1, l.hSplit + 1) };
  const badV = { id: "bad2", orient: "v" as const, pos: right ? Math.min(l.gridW - 1, l.vSplit + 1) : Math.max(1, l.vSplit - 1) };
  const options = shuffle([valid, badH, badV]);
  return {
    kind: "area", scene: "splitWorks", figureMode: "cells",
    composite: { gridW: l.gridW, gridH: l.gridH, rects: l.hRects },
    splitWorksOptions: options, correctSplitId: "ok",
    prompt: "Which split works?",
    speakText: "Which of these splits makes two rectangles? The others leave a shape that isn't a rectangle.",
    badgeLabel: "Which Split Works?",
    feedback: { correct: "Yes — both parts are rectangles.", wrong: "One part there is still an L — not a rectangle." },
  };
}

// ── Lesson 2 & 3: calculate composite area ────────────────────────────────────
function baseComposite(l: LData, rects: [Rect, Rect], mode: "cells" | "dims", unit?: "cm²" | "m²", ctx?: { label: string; emoji: string }): Partial<AreaTask> {
  return {
    figureMode: mode,
    composite: { gridW: l.gridW, gridH: l.gridH, rects },
    areaUnit: unit,
    context: ctx?.label, emoji: ctx?.emoji,
  };
}

export function compositeSolveTask(mode: "cells" | "dims", unit?: "cm²" | "m²", ctx?: { label: string; emoji: string }): AreaTask {
  const l = mode === "dims" ? makeL(5, 9) : makeL(4, 7);
  const rects = pickDecomp(l);
  return {
    kind: "area", scene: "compositeSolve", ...baseComposite(l, rects, mode, unit, ctx),
    answerValue: l.total,
    prompt: "Break it apart, then find the total area.",
    speakText: "Split the shape into two rectangles. Find each rectangle's area, then add them for the total.",
    badgeLabel: "Break & Solve",
    feedback: { correct: `Yes — the two rectangles add to ${l.total}${unit ? " " + unit : " square units"}.`, wrong: "Find each rectangle, then add the areas." },
  } as AreaTask;
}

export function compositeTotalTask(mode: "cells" | "dims", unit?: "cm²" | "m²", ctx?: { label: string; emoji: string }): AreaTask {
  const l = mode === "dims" ? makeL(5, 9) : makeL(4, 7);
  const rects = pickDecomp(l);
  const correct = l.total;
  const box = l.gridW * l.gridH;                    // counted the missing corner
  const oneRect = Math.max(rectArea(rects[0]), rectArea(rects[1])); // forgot a piece
  const opts = [correct];
  for (const v of [box, oneRect, correct + rects[0]!.w, box - 1]) { if (opts.length < 3 && v > 0 && !opts.includes(v)) opts.push(v); }
  while (opts.length < 3) opts.push(correct + opts.length);
  return {
    kind: "area", scene: "compositeTotal", ...baseComposite(l, rects, mode, unit, ctx),
    options: shuffle(opts), correctNumber: correct,
    prompt: "What is the total area?",
    speakText: "Add the two rectangles. What is the total area of the whole shape?",
    badgeLabel: "Total Area",
    feedback: { correct: `Yes — ${rectArea(rects[0])} + ${rectArea(rects[1])} = ${correct}${unit ? " " + unit : ""}.`, wrong: `Add both rectangles: ${rectArea(rects[0])} + ${rectArea(rects[1])} = ${correct}.` },
  } as AreaTask;
}

export function compositeMistakeTask(mode: "cells" | "dims", unit?: "cm²" | "m²", ctx?: { label: string; emoji: string }): AreaTask {
  const l = mode === "dims" ? makeL(5, 9) : makeL(4, 7);
  const rects = pickDecomp(l);
  const box = l.gridW * l.gridH;
  const forgot = Math.max(rectArea(rects[0]), rectArea(rects[1]));
  const wholeBox = randInt(2) === 0;
  const u = unit ? " " + unit : " square units";
  const statement = wholeBox
    ? `Gauge says the area is ${box}${u} — he measured the whole box.`
    : `Gauge says the area is ${forgot}${u} — he found only one rectangle.`;
  const correctReason = wholeBox ? "He counted the missing corner" : "He forgot one of the rectangles";
  const distractors = ["He measured everything correctly", "He added the sides instead of the areas"];
  return {
    kind: "area", scene: "compositeMistake", ...baseComposite(l, rects, mode, unit, ctx),
    statement, reasonOptions: shuffle([correctReason, distractors[0]!, distractors[1]!]), correctReason,
    prompt: "What did Professor Gauge do wrong?",
    speakText: `${statement} What did he do wrong?`,
    badgeLabel: "Professor Gauge's Mistake",
    feedback: { correct: `Right — the real area is ${l.total}${u}.`, wrong: `Break it into two rectangles: the area is ${l.total}${u}.` },
  } as AreaTask;
}

// Instructional opener for Lessons 2 & 3.
export function breakIntroTask(): AreaTask {
  const l = makeL(5, 7);
  return {
    kind: "area", scene: "breakIntro", figureMode: "cells",
    composite: { gridW: l.gridW, gridH: l.gridH, rects: l.hRects },
    answerValue: l.total,
    prompt: "Break a hard shape into easy ones",
    speakText: "When a shape looks hard, break it into rectangles. Find each rectangle's area, then add them together for the total.",
    badgeLabel: "The Strategy",
    feedback: { correct: "Let's solve!", wrong: "Let's solve!" },
  };
}

// Lesson 3 real-context wrappers.
export function l3Solve(): AreaTask { return compositeSolveTask("dims", "m²", choose(L3_CONTEXTS)); }
export function l3Total(): AreaTask { return compositeTotalTask("dims", "m²", choose(L3_CONTEXTS)); }
export function l3Mistake(): AreaTask { return compositeMistakeTask("dims", "m²", choose(L3_CONTEXTS)); }
