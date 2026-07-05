import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SIMPLE_SHAPES, COMPLEX_SHAPES, ALL_SHAPES, boundaryEdges, internalEdges, perimeter, type ShapeDef, type Edge } from "@/data/activities/year3Measurelands/perimeterShapes";

type PerimTask = Extract<PracticeTask, { kind: "perimeter" }>;

function randInt(n: number) { return Math.floor(Math.random() * n); }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }
function pick(pool: ShapeDef[]): ShapeDef { return pool[randInt(pool.length)]!; }
function sameEdge(a: Edge, b: Edge) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]; }

export function buildIntro(): PerimTask {
  const s = SIMPLE_SHAPES[0]!;
  return { kind: "perimeter", scene: "intro", prompt: "What is perimeter?", speakText: "Professor Gauge says: imagine you're walking around a garden fence. The path you walk all the way around the outside is called the perimeter.", badgeLabel: "Meazurex Mission", cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji, feedback: { correct: "Let's explore!", wrong: "Let's explore!" } };
}

export function buildTrace(pool: ShapeDef[], finish = false): PerimTask {
  const s = pick(pool);
  const edges = boundaryEdges(s.cells);
  const prefilled = finish ? shuffle(edges).slice(0, Math.floor(edges.length / 2)) : [];
  return {
    kind: "perimeter", scene: "trace",
    prompt: finish ? `Finish walking around the ${s.label}.` : `Walk all the way around the ${s.label}.`,
    speakText: `Tap every outside edge of the ${s.label} to walk the whole perimeter. Don't cut across the middle.`,
    badgeLabel: finish ? "Finish the Path" : "Walk the Perimeter",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    prefilled,
    feedback: { correct: "All the way around — that's the perimeter!", wrong: "Stay on the outside." },
  };
}

export function buildMissingSide(pool: ShapeDef[]): PerimTask {
  const s = pick(pool);
  const edges = boundaryEdges(s.cells);
  const miss = edges[randInt(edges.length)]!;
  const decoys = shuffle(internalEdges(s.cells)).slice(0, 2);
  while (decoys.length < 2) { const e = edges[randInt(edges.length)]!; if (!sameEdge(e, miss) && !decoys.some((d) => sameEdge(d, e))) decoys.push(e); }
  return {
    kind: "perimeter", scene: "missingSide",
    prompt: `The ${s.label} fence has a gap. Tap the missing outside edge.`,
    speakText: `The ${s.label} boundary has a gap. Tap the outside edge that closes it.`,
    badgeLabel: "Find the Missing Side",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    missingSide: miss, decoySides: decoys,
    feedback: { correct: "Fence closed — the whole boundary!", wrong: "That cuts across — stay on the outside." },
  };
}

export function buildWhichPath(pool: ShapeDef[]): PerimTask {
  const s = pick(pool);
  const options = shuffle([{ id: "full", pathType: "full" as const }, { id: "cut", pathType: "cut" as const }, { id: "incomplete", pathType: "incomplete" as const }]);
  return {
    kind: "perimeter", scene: "whichPath",
    prompt: `Which path shows the perimeter of the ${s.label}?`,
    speakText: `Which path goes all the way around the outside of the ${s.label}?`,
    badgeLabel: "Which Path Is the Perimeter?",
    cells: s.cells, gridW: s.gridW, gridH: s.gridH, label: s.label, emoji: s.emoji,
    pathOptions: options, correctPathId: "full",
    feedback: { correct: "Yes — that follows the whole outside.", wrong: "Perimeter goes all the way around the outside, not across the middle." },
  };
}

export function buildCompareWalk(pool: ShapeDef[]): PerimTask {
  let a = pick(pool);
  let b = pick(pool);
  for (let k = 0; k < 30 && (a.label === b.label || perimeter(a.cells) === perimeter(b.cells)); k++) b = pick(pool);
  const longer = perimeter(a.cells) >= perimeter(b.cells) ? a.label : b.label;
  return {
    kind: "perimeter", scene: "compareWalk",
    prompt: "Which shape takes longer to walk around?",
    speakText: `Which would take longer to walk all the way around, the ${a.label} or the ${b.label}?`,
    badgeLabel: "Which Walk Is Longer?",
    compareShapes: {
      a: { cells: a.cells, label: a.label, emoji: a.emoji, gridW: a.gridW, gridH: a.gridH },
      b: { cells: b.cells, label: b.label, emoji: b.emoji, gridW: b.gridW, gridH: b.gridH },
    },
    feedback: { correct: `Yes — the ${longer} has the longer perimeter.`, wrong: `Look at the whole outside — the ${longer} is longer.` },
  };
}

export const POOLS = { SIMPLE: SIMPLE_SHAPES, COMPLEX: COMPLEX_SHAPES, ALL: ALL_SHAPES };
