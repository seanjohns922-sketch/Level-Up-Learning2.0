import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { gridReferenceForCell, type StarpathGridReferenceTask } from "@/lib/starpath-grid-reference";

type Cell = { r: number; c: number };
type Landmark = StarpathGridReferenceTask["landmarks"][number];
type MapSpec = {
  id: string;
  cols: number;
  rows: number;
  columns: string[];
  rowLabels: string[];
  landmarks: Landmark[];
};

const OBJECTS = ["rover", "planet", "satellite", "flag", "star", "cave"] as const;
const LABELS = ["Rover", "Moon Dome", "Observatory", "Landing Flag", "Signal Star", "Supply Cave"] as const;

function landmarks(cells: Cell[]): Landmark[] {
  return cells.map((cell, index) => ({
    id: `landmark-${index + 1}`,
    label: LABELS[index]!,
    object: OBJECTS[index]!,
    ...cell,
  }));
}

export const LEVEL_FOUR_GRID_MAPS: MapSpec[] = [
  { id: "aurora", cols: 5, rows: 4, columns: ["A", "B", "C", "D", "E"], rowLabels: ["1", "2", "3", "4"], landmarks: landmarks([{ r: 0, c: 1 }, { r: 2, c: 3 }, { r: 1, c: 4 }, { r: 3, c: 0 }]) },
  { id: "nebula", cols: 6, rows: 4, columns: ["A", "B", "C", "D", "E", "F"], rowLabels: ["1", "2", "3", "4"], landmarks: landmarks([{ r: 3, c: 4 }, { r: 0, c: 2 }, { r: 2, c: 0 }, { r: 1, c: 5 }, { r: 3, c: 1 }]) },
  { id: "comet", cols: 5, rows: 5, columns: ["A", "B", "C", "D", "E"], rowLabels: ["1", "2", "3", "4", "5"], landmarks: landmarks([{ r: 1, c: 3 }, { r: 4, c: 0 }, { r: 0, c: 4 }, { r: 3, c: 2 }, { r: 2, c: 1 }]) },
  { id: "orbit", cols: 6, rows: 5, columns: ["A", "B", "C", "D", "E", "F"], rowLabels: ["1", "2", "3", "4", "5"], landmarks: landmarks([{ r: 2, c: 5 }, { r: 4, c: 3 }, { r: 0, c: 1 }, { r: 1, c: 4 }, { r: 3, c: 0 }, { r: 2, c: 2 }]) },
];

function spec(round: number): MapSpec {
  return LEVEL_FOUR_GRID_MAPS[((round % LEVEL_FOUR_GRID_MAPS.length) + LEVEL_FOUR_GRID_MAPS.length) % LEVEL_FOUR_GRID_MAPS.length]!;
}

function base(map: MapSpec, mode: StarpathGridReferenceTask["mode"], prompt: string, speakText: string, target: number): Omit<StarpathGridReferenceTask, "feedback"> {
  return {
    kind: "starpathGridReference",
    mode,
    prompt,
    speakText,
    target,
    mapId: `l4-${map.id}-${mode}-${target}`,
    cols: map.cols,
    rows: map.rows,
    columnLabels: map.columns,
    rowLabels: map.rowLabels,
    landmarks: map.landmarks,
  };
}

function ref(map: MapSpec, cell: Cell): string {
  return gridReferenceForCell({ rows: map.rows, cols: map.cols, rowLabels: map.rowLabels, columnLabels: map.columns }, cell)!;
}

function cellsAround(map: MapSpec, correct: Cell): Cell[] {
  const candidates = [
    correct,
    { r: correct.r, c: (correct.c + 1) % map.cols },
    { r: (correct.r + 1) % map.rows, c: correct.c },
    { r: (correct.r + map.rows - 1) % map.rows, c: (correct.c + map.cols - 1) % map.cols },
  ];
  return [...new Map(candidates.map((cell) => [`${cell.r}:${cell.c}`, cell])).values()];
}

function referenceOptions(map: MapSpec, correct: Cell, round: number) {
  const options = cellsAround(map, correct).map((cell) => ({ id: `${cell.r}-${cell.c}`, label: ref(map, cell) }));
  const shift = round % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

export function referenceToCellTask(round: number, target: number): PracticeTask {
  const map = spec(round);
  const correctCell = { r: (round * 2 + 1) % map.rows, c: (round * 3 + 2) % map.cols };
  const reference = ref(map, correctCell);
  return { ...base(map, "referenceToCell", `Tap cell ${reference}.`, `Use the column letter first and the row number second. Tap cell ${reference}.`, target), reference, correctCell, landmarks: [], feedback: { correct: `${reference} is the correct cell.`, wrong: "Read the column letter first, then the row number." } };
}

export function cellToReferenceTask(round: number, target: number): PracticeTask {
  const map = spec(round + 1);
  const highlight = { r: (round + 2) % map.rows, c: (round * 2 + 1) % map.cols };
  const correct = ref(map, highlight);
  const options = referenceOptions(map, highlight, round);
  return { ...base(map, "cellToReference", "What is the reference of the highlighted cell?", "Find the highlighted cell. Read its column letter, then its row number.", target), highlight, landmarks: [], options, correctOptionId: options.find((option) => option.label === correct)!.id, feedback: { correct: `${correct} names the highlighted cell.`, wrong: "Trace up to the column letter, then across to the row number." } };
}

export function referenceDebugTask(round: number, target: number): PracticeTask {
  const map = spec(round + 2);
  const chosen = map.landmarks.slice(0, 3);
  const wrongIndex = round % chosen.length;
  const options = chosen.map((landmark, index) => {
    const actual = ref(map, landmark);
    const claimed = index === wrongIndex ? ref(map, { r: landmark.r, c: (landmark.c + 1) % map.cols }) : actual;
    return { id: landmark.id, label: `${landmark.label} is reported at ${claimed}.` };
  });
  return { ...base(map, "debug", "Which location report is wrong?", "Check each landmark against the row and column labels. Choose the report with the wrong reference.", target), options, correctOptionId: chosen[wrongIndex]!.id, feedback: { correct: "You found the report that used the wrong cell reference.", wrong: "Check each report against the landmark's exact cell." } };
}

export function referenceToLandmarkTask(round: number, target: number): PracticeTask {
  const map = spec(round);
  const landmark = map.landmarks[(round + 1) % map.landmarks.length]!;
  const reference = ref(map, landmark);
  return { ...base(map, "referenceToLandmark", `Which landmark is at ${reference}?`, `Find cell ${reference}, then select the landmark in that cell.`, target), reference, correctLandmarkId: landmark.id, feedback: { correct: `${landmark.label} is at ${reference}.`, wrong: `Find column ${reference[0]}, then row ${reference.slice(1)}.` } };
}

export function landmarkToReferenceTask(round: number, target: number): PracticeTask {
  const map = spec(round + 1);
  const landmark = map.landmarks[(round + 2) % map.landmarks.length]!;
  const options = referenceOptions(map, landmark, round + 1);
  const correct = ref(map, landmark);
  return { ...base(map, "landmarkToReference", `Report the grid reference for the ${landmark.label}.`, `Locate the ${landmark.label}. Read the column letter, then the row number.`, target), highlight: { r: landmark.r, c: landmark.c }, options, correctOptionId: options.find((option) => option.label === correct)!.id, feedback: { correct: `${correct} is the precise location.`, wrong: "Read the landmark's column letter first, then its row number." } };
}

export function placeAtReferenceTask(round: number, target: number): PracticeTask {
  const map = spec(round + 2);
  const correctCell = { r: (round * 3 + 1) % map.rows, c: (round * 2 + 3) % map.cols };
  const reference = ref(map, correctCell);
  const visibleLandmarks = map.landmarks.filter((landmark) => landmark.r !== correctCell.r || landmark.c !== correctCell.c).slice(0, 3);
  return { ...base(map, "placeAtReference", `Place the supply pod at ${reference}.`, `Use the grid labels to place the supply pod in cell ${reference}.`, target), reference, correctCell, landmarks: visibleLandmarks, feedback: { correct: `The supply pod is correctly placed at ${reference}.`, wrong: "Check the column letter and row number before placing the pod." } };
}

export function labelGridTask(round: number, target: number): PracticeTask {
  const map = spec(round);
  return { ...base(map, "labelGrid", "Complete the grid reference system.", "Choose the correct label for every column and row so each cell has one clear reference.", target), landmarks: map.landmarks.slice(0, 2), feedback: { correct: "Every row and column is labelled consistently.", wrong: "Check that columns run in letter order and rows run in number order." } };
}

export function repairLabelsTask(round: number, target: number): PracticeTask {
  const map = spec(round + 1);
  const repairColumn = round % 2 === 0;
  const index = repairColumn ? (round + 1) % map.cols : (round + 1) % map.rows;
  const faultyColumnLabels = [...map.columns];
  const faultyRowLabels = [...map.rowLabels];
  const expected = repairColumn ? map.columns[index]! : map.rowLabels[index]!;
  if (repairColumn) faultyColumnLabels[index] = map.columns[(index + 1) % map.cols]!;
  else faultyRowLabels[index] = map.rowLabels[(index + 1) % map.rows]!;
  const alternatives = repairColumn ? map.columns : map.rowLabels;
  const options = [...new Set([expected, alternatives[(index + 1) % alternatives.length]!, alternatives[(index + 2) % alternatives.length]!])].map((label) => ({ id: label, label }));
  return { ...base(map, "repairLabels", `Repair the incorrect ${repairColumn ? "column" : "row"} label.`, "One grid label is repeated or out of order. Choose the label that repairs the system.", target), faultyColumnLabels, faultyRowLabels, options, correctOptionId: expected, feedback: { correct: "The grid labels now form a consistent reference system.", wrong: "Look for the missing label in the sequence." } };
}

export function typeReferenceTask(round: number, target: number, includeLandmarks = false): PracticeTask {
  const map = spec(round + (includeLandmarks ? 2 : 0));
  const landmark = includeLandmarks ? map.landmarks[(round + 1) % map.landmarks.length]! : null;
  const highlight = landmark ?? { r: (round * 2 + 2) % map.rows, c: (round * 3 + 1) % map.cols };
  const expectedReference = ref(map, highlight);
  return { ...base(map, "typeReference", landmark ? `Type the reference for the ${landmark.label}.` : "Type the reference for the highlighted cell.", landmark ? `Locate the ${landmark.label}. Type the column letter, then the row number.` : "Type the highlighted cell's column letter, then its row number.", target), highlight, landmarks: landmark ? map.landmarks : [], expectedReference, feedback: { correct: `${expectedReference} is correct.`, wrong: "Type the column letter first and the row number second." } };
}
