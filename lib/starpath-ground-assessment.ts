import type { StarpathGroundAssessmentTask } from "@/data/activities/year1/practice-task";
type Task = Extract<StarpathGroundAssessmentTask, {mode: "placement"}>;
export function groundPlacementIsCorrect(task: Task, actual: Task["answer"]): boolean {
  if (actual.length !== task.tokens.length || new Set(actual.map(p => p.tokenId)).size !== actual.length) return false;
  const all = [...actual, ...(task.fixed ?? []).map(p => ({tokenId: p.token.id, r: p.r, c: p.c}))];
  if (new Set(all.map(p => `${p.r}:${p.c}`)).size !== all.length) return false;
  if (actual.some(p => !task.tokens.some(t => t.id === p.tokenId) || !Number.isInteger(p.r) || !Number.isInteger(p.c) || p.r < 0 || p.c < 0 || p.r >= task.rows || p.c >= task.cols)) return false;
  if (!task.relations?.length) return task.answer.every(e => actual.some(p => p.tokenId === e.tokenId && p.r === e.r && p.c === e.c));
  return task.relations.every(rule => {
    const a = all.find(p => p.tokenId === rule.subject), b = all.find(p => p.tokenId === rule.reference);
    if (!a || !b) return false;
    if (rule.relation === "above") return a.r < b.r;
    if (rule.relation === "below") return a.r > b.r;
    if (rule.relation === "left") return a.r === b.r && a.c < b.c;
    if (rule.relation === "right") return a.r === b.r && a.c > b.c;
    return a.r === b.r && Math.abs(a.c - b.c) === 1;
  });
}
