import type { GroundTask } from "@/data/assessments/revisions/groundStarpathRedesignedForms";
import { isTriangle, isComposedSquare, type Point, type Piece } from "./starpath-ground-prototype";
export type GroundResponse = { selected: string[]; reason: string | null; points: Point[]; pieces: Piece[]; cell: number | null };
export function emptyGroundResponse(task: GroundTask): GroundResponse {
  return { selected: [], reason: null, points: [], pieces: (task.initialPieces ?? []).map(p => ({ ...p })), cell: null };
}
export function readGroundResponse(task: GroundTask, value?: string): GroundResponse {
  if (!value) return emptyGroundResponse(task);
  try { const v = JSON.parse(value); if (Array.isArray(v.selected) && Array.isArray(v.points) && Array.isArray(v.pieces)) return v; } catch {}
  return emptyGroundResponse(task);
}
export function quadrilateralIsCorrect(points: Point[], square: boolean) {
  if (points.length !== 4 || new Set(points.map(p => `${p.x},${p.y}`)).size !== 4) return false;
  const edges = points.map((p,i) => ({ x: points[(i+1)%4].x-p.x, y: points[(i+1)%4].y-p.y }));
  const lengths = edges.map(e => e.x*e.x+e.y*e.y);
  return lengths.every(l => l > 0) && edges.every((e,i) => e.x*edges[(i+1)%4].x+e.y*edges[(i+1)%4].y === 0)
    && (!square || lengths.every(l => l === lengths[0]));
}
export function scoreGroundResponse(task: GroundTask, response: GroundResponse): boolean {
  if (task.mode === "draw") return task.drawShape === "triangle" ? isTriangle(response.points) : quadrilateralIsCorrect(response.points, task.drawShape === "square");
  if (task.mode === "compose") return isComposedSquare(response.pieces);
  if (task.mode === "place") return response.cell !== null && (task.relation === "beside" ? [3,5] : task.relation === "above" ? [0,1,2] : [6,7,8]).includes(response.cell);
  return response.selected.length === task.correctIds?.length
    && new Set(response.selected).size === response.selected.length
    && response.selected.every(id => task.correctIds?.includes(id))
    && (!task.reasons || response.reason === task.correctReason);
}
export function groundResponseReady(task: GroundTask, response: GroundResponse) {
  if (task.mode === "draw") return response.points.length > 0;
  if (task.mode === "compose") return true;
  if (task.mode === "place") return response.cell !== null;
  return response.selected.length > 0 && (!task.reasons || response.reason !== null);
}
