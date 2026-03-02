import type { PracticeTask, Difficulty } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateWeek11Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w11-l1") {
    const mode = randInt(0, 2);
    if (mode === 0) return { kind: "flashFacts", durationSeconds: d === "easy" ? 90 : d === "medium" ? 60 : 45, difficulty: d };
    if (mode === 1) return { kind: "make10Builder", difficulty: d };
    return { kind: "missingNumberFacts", difficulty: d };
  }

  if (lessonId === "y1-w11-l2") {
    const mode = randInt(0, 2);
    if (mode === 0) return { kind: "doubleIt", difficulty: d };
    if (mode === 1) return { kind: "nearDouble", difficulty: d };
    return { kind: "doubleDetective", difficulty: d };
  }

  if (lessonId === "y1-w11-l3") {
    const mode = randInt(0, 2);
    if (mode === 0) return { kind: "gridRace", difficulty: d };
    if (mode === 1) return { kind: "factMatch", difficulty: d };
    return { kind: "climbLadder", difficulty: d };
  }

  return generateWeek11Task("y1-w11-l1", d);
}
