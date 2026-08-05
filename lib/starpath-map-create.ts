import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type StarpathMapCreateTask = Extract<PracticeTask, { kind: "starpathMapCreate" }>;
export type StarpathMapPlacement = { r: number; c: number };

function satisfies(subject: StarpathMapPlacement, reference: StarpathMapPlacement, relation: StarpathMapCreateTask["constraints"][number]["relation"]): boolean {
  // "above/below/left/right of" means anywhere along that axis, not exactly one
  // cell away. The condition wording ("above") never promises adjacency, and a
  // map-creation task should accept every layout that reads as correct.
  if (relation === "above") return subject.c === reference.c && subject.r < reference.r;
  if (relation === "below") return subject.c === reference.c && subject.r > reference.r;
  if (relation === "leftOf") return subject.r === reference.r && subject.c < reference.c;
  return subject.r === reference.r && subject.c > reference.c;
}

export function isStarpathMapCreationValid(task: StarpathMapCreateTask, placements: Record<string, StarpathMapPlacement>): boolean {
  const cells = task.landmarks.map((landmark) => placements[landmark.id]);
  if (cells.some((cell) => !cell || cell.r < 0 || cell.r >= task.rows || cell.c < 0 || cell.c >= task.cols)) return false;
  if (new Set(cells.map((cell) => `${cell!.r}:${cell!.c}`)).size !== cells.length) return false;
  return task.constraints.every((constraint) => {
    const subject = placements[constraint.subjectId];
    const reference = placements[constraint.referenceId];
    return Boolean(subject && reference && satisfies(subject, reference, constraint.relation));
  });
}
