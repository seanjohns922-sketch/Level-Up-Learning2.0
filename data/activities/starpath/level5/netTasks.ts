import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { HEXOMINOES, VALID_NET_IDS, INVALID_NET_IDS, foldNet, relationBetween, normalise, type Cell } from "./nets";

type NetTask = Extract<PracticeTask, { kind: "starpathNet" }>;

const pick = <T,>(arr: T[], index: number) => arr[((index % arr.length) + arr.length) % arr.length]!;
const cellsOf = (id: string) => normalise(HEXOMINOES[id] ?? []);
const key = (cell: Cell) => `${cell.r}:${cell.c}`;
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);

// W1 L1 — pick the flat net that folds into a cube (one valid, two that overlap).
export function chooseNetTask(round: number, target: number): NetTask {
  const validId = pick(VALID_NET_IDS, round);
  const invalids = order(INVALID_NET_IDS, round);
  const options = order([
    { id: "a", cells: cellsOf(validId) },
    { id: "b", cells: cellsOf(invalids[0]!) },
    { id: "c", cells: cellsOf(invalids[1] ?? invalids[0]!) },
  ], round + 1);
  return {
    kind: "starpathNet", mode: "chooseNet", render: "options", netId: `l5-choose-${round}`, target,
    prompt: "Which flat net folds into a cube?", speakText: "A net folds up when its six faces close with no overlaps. Choose the flat shape that folds into a closed cube.",
    showCube: true, coloured: false, netOptions: options, correctOptionIds: ["a"],
    feedback: { correct: "That net folds into a cube with every face in place.", wrong: "Two faces of that net would land on the same spot, so it cannot fold into a cube." },
  };
}

// W1 L2 — does this single net fold into a cube? Yes / No, with Fold it to test.
export function foldPredictTask(round: number, target: number): NetTask {
  const useValid = round % 2 === 0;
  const id = useValid ? pick(VALID_NET_IDS, round) : pick(INVALID_NET_IDS, round);
  return {
    kind: "starpathNet", mode: "foldPredict", render: "single", netId: `l5-fold-${round}`, target,
    cells: cellsOf(id), coloured: false, fold: true,
    prompt: "Does this net fold into a cube?", speakText: "Fold it up in your mind, then test it. Watch for two faces trying to cover the same spot.",
    textOptions: [{ id: "yes", label: "Yes, it folds into a cube" }, { id: "no", label: "No, it cannot fold" }],
    correctOptionIds: [useValid ? "yes" : "no"],
    feedback: { correct: "Correct — the fold test agrees.", wrong: "Use Fold it: the faces show whether it closes into a cube or overlaps." },
  };
}

// W1 L3 — justify why a valid net folds into a cube.
export function reasonTask(round: number, target: number): NetTask {
  const id = pick(VALID_NET_IDS, round);
  const options = order([
    { id: "a", label: "Its six faces fold up without overlapping" },
    { id: "b", label: "All six faces are the same colour" },
    { id: "c", label: "Its faces are all in one straight line" },
  ], round);
  return {
    kind: "starpathNet", mode: "reason", render: "single", netId: `l5-reason-${round}`, target,
    cells: cellsOf(id), coloured: true, fold: true,
    prompt: "Why does this net fold into a cube?", speakText: "A net makes a cube when its six faces meet edge to edge with no gaps and no overlaps.",
    textOptions: options, correctOptionIds: ["a"],
    feedback: { correct: "Yes — six faces that meet without overlapping make a cube.", wrong: "Colour and straight lines do not decide it — a cube needs six faces that fold without overlapping." },
  };
}

// W2 L1 — tap the tile that folds to the face opposite the marked one.
export function trackCellTask(round: number, target: number): NetTask {
  const id = pick(VALID_NET_IDS, round);
  const cells = cellsOf(id);
  const fold = foldNet(cells);
  const mark = cells[round % cells.length]!;
  const opposite = cells.find((cell) => relationBetween(fold, mark, cell) === "opposite")!;
  return {
    kind: "starpathNet", mode: "trackCell", render: "single", netId: `l5-track-${round}`, target,
    cells, coloured: true, fold: true, focusKeys: [key(mark)],
    prompt: "Tap the face that ends up opposite the marked face.", speakText: "Opposite faces never touch. Fold it up, then find the face on the far side from the marked one.",
    answerCells: [key(opposite)],
    feedback: { correct: "That face lands on the far side, opposite the marked one.", wrong: "Opposite faces sit across the cube and never share an edge. Fold it and look at the far side." },
  };
}

// W2 L2 — after folding, how many faces touch the marked face? (Four; only the opposite one does not.)
export function countTask(round: number, target: number): NetTask {
  const id = pick(VALID_NET_IDS, round + 1);
  const cells = cellsOf(id);
  const mark = cells[(round + 2) % cells.length]!;
  return {
    kind: "starpathNet", mode: "count", render: "single", netId: `l5-count-${round}`, target,
    cells, coloured: true, fold: true, focusKeys: [key(mark)],
    prompt: "After folding, how many faces touch the marked face?", speakText: "On a cube every face shares an edge with four others. Only the opposite face never touches it.",
    textOptions: order([{ id: "a", label: "4 faces" }, { id: "b", label: "3 faces" }, { id: "c", label: "5 faces" }], round),
    correctOptionIds: ["a"],
    feedback: { correct: "Right — four faces touch it and only the opposite face does not.", wrong: "On a cube a face touches four others; just the opposite face stays apart." },
  };
}

// W2 L3 — are the two marked faces opposite or next to each other?
export function relationTask(round: number, target: number): NetTask {
  const id = pick(VALID_NET_IDS, round + 2);
  const cells = cellsOf(id);
  const fold = foldNet(cells);
  const a = cells[round % cells.length]!;
  const wantOpposite = round % 2 === 0;
  const b = cells.find((cell) => key(cell) !== key(a) && relationBetween(fold, a, cell) === (wantOpposite ? "opposite" : "adjacent"))
    ?? cells.find((cell) => key(cell) !== key(a))!;
  const rel = relationBetween(fold, a, b);
  return {
    kind: "starpathNet", mode: "relation", render: "single", netId: `l5-rel-${round}`, target,
    cells, coloured: true, fold: true, focusKeys: [key(a), key(b)],
    prompt: "How do the two marked faces meet on the cube?", speakText: "Fold it up. Faces are opposite if they sit across the cube, or next to each other if they share an edge.",
    textOptions: order([{ id: "opp", label: "They are opposite" }, { id: "adj", label: "They are next to each other" }], round),
    correctOptionIds: [rel === "opposite" ? "opp" : "adj"],
    feedback: { correct: "Correct — the fold shows how they meet.", wrong: "Fold it up and check: opposite faces sit across the cube; touching faces share an edge." },
  };
}

// W3 L1 — build a net that folds into a cube (place six faces, Fold it to test).
export function buildTask(round: number, target: number): NetTask {
  return {
    kind: "starpathNet", mode: "build", render: "build", netId: `l5-build-${round}`, target,
    coloured: true, fold: true, buildFaces: 6,
    prompt: "Build a net that folds into a cube.", speakText: "Place six faces edge to edge so they fold into a cube with no overlaps. Use Fold it to test your net.",
    feedback: { correct: "That net folds into a cube — six faces, no overlaps.", wrong: "Not yet — fold it to see where faces overlap or a face is missing, then rearrange." },
  };
}

// W3 L2 — classify a fold: clean cube, overlap, or missing face.
export function classifyTask(round: number, target: number): NetTask {
  const phase = round % 3;
  let cells = phase === 0 ? cellsOf(pick(VALID_NET_IDS, round)) : cellsOf(pick(INVALID_NET_IDS, round));
  let correct = phase === 0 ? "folds" : "overlap";
  if (phase === 2) { cells = cellsOf(pick(VALID_NET_IDS, round)).slice(0, 5); correct = "missing"; }
  return {
    kind: "starpathNet", mode: "classify", render: "single", netId: `l5-classify-${round}`, target,
    cells: normalise(cells), coloured: false, fold: true,
    prompt: "What happens when you fold this net?", speakText: "Test the fold. A cube needs six faces that close up with no overlap and no gap.",
    textOptions: order([{ id: "folds", label: "It folds into a cube" }, { id: "overlap", label: "Two faces overlap" }, { id: "missing", label: "A face is missing" }], round),
    correctOptionIds: [correct],
    feedback: { correct: "Correct — the fold test shows it.", wrong: "Fold it and watch: does it close cleanly, do two faces overlap, or is a face missing?" },
  };
}

// W3 L3 — tap ALL nets that fold into a cube (more than one can).
export function selectValidTask(round: number, target: number): NetTask {
  const valids = order(VALID_NET_IDS, round);
  const options = order([
    { id: "a", cells: cellsOf(valids[0]!) },
    { id: "b", cells: cellsOf(pick(INVALID_NET_IDS, round)) },
    { id: "c", cells: cellsOf(valids[1] ?? valids[0]!) },
  ], round + 1);
  const correct = options.filter((option) => foldNet(option.cells).valid).map((option) => option.id);
  return {
    kind: "starpathNet", mode: "selectValid", render: "options", netId: `l5-select-${round}`, target,
    netOptions: options, correctOptionIds: correct, multi: true, coloured: false,
    prompt: "Tap ALL the nets that fold into a cube.", speakText: "More than one flat shape can fold into a cube. Choose every net that folds with no overlaps.",
    feedback: { correct: "Every net you chose folds into a cube.", wrong: "At least one choice is off — some of these overlap when folded and some fold cleanly." },
  };
}
