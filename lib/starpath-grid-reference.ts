import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type StarpathGridReferenceTask = Extract<PracticeTask, { kind: "starpathGridReference" }>;
export type GridReferenceCell = { r: number; c: number };

export function isGridReferenceCellInBounds(
  task: Pick<StarpathGridReferenceTask, "rows" | "cols">,
  cell: GridReferenceCell,
): boolean {
  return Number.isInteger(cell.r) && Number.isInteger(cell.c) && cell.r >= 0 && cell.r < task.rows && cell.c >= 0 && cell.c < task.cols;
}

export function gridReferenceForCell(
  task: Pick<StarpathGridReferenceTask, "rows" | "cols" | "rowLabels" | "columnLabels">,
  cell: GridReferenceCell,
): string | null {
  if (!isGridReferenceCellInBounds(task, cell)) return null;
  const column = task.columnLabels[cell.c];
  const row = task.rowLabels[cell.r];
  return column && row ? `${column}${row}` : null;
}

export function normaliseGridReference(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function isGridReferenceSystemValid(
  task: Pick<StarpathGridReferenceTask, "rows" | "cols" | "rowLabels" | "columnLabels">,
): boolean {
  return (
    task.rowLabels.length === task.rows &&
    task.columnLabels.length === task.cols &&
    task.rowLabels.every((label) => label.trim().length > 0) &&
    task.columnLabels.every((label) => label.trim().length > 0) &&
    new Set(task.rowLabels.map(normaliseGridReference)).size === task.rows &&
    new Set(task.columnLabels.map(normaliseGridReference)).size === task.cols
  );
}

export function isGridReferenceTaskValid(task: StarpathGridReferenceTask): boolean {
  if (!isGridReferenceSystemValid(task)) return false;
  if (task.landmarks.some((landmark) => !isGridReferenceCellInBounds(task, landmark))) return false;
  if (new Set(task.landmarks.map(({ r, c }) => `${r}:${c}`)).size !== task.landmarks.length) return false;

  if (task.mode === "referenceToCell" || task.mode === "placeAtReference") {
    return Boolean(task.reference && task.correctCell && isGridReferenceCellInBounds(task, task.correctCell) && gridReferenceForCell(task, task.correctCell) === normaliseGridReference(task.reference));
  }
  if (task.mode === "referenceToLandmark") {
    const landmark = task.landmarks.find((item) => item.id === task.correctLandmarkId);
    return Boolean(landmark && task.reference && gridReferenceForCell(task, landmark) === normaliseGridReference(task.reference));
  }
  if (task.mode === "cellToReference" || task.mode === "landmarkToReference" || task.mode === "debug" || task.mode === "repairLabels") {
    return Boolean(task.correctOptionId && task.options?.some((option) => option.id === task.correctOptionId));
  }
  if (task.mode === "typeReference") {
    return Boolean(task.expectedReference && task.highlight && gridReferenceForCell(task, task.highlight) === normaliseGridReference(task.expectedReference));
  }
  if (task.mode === "labelGrid") return true;
  return false;
}
