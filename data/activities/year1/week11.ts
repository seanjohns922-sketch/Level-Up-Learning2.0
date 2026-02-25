import type { PracticeTask } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateWeek11Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w11-l1") {
    const mode = randInt(0, 2);
    if (mode === 0) return { kind: "flashFacts", durationSeconds: 60 };
    if (mode === 1) return { kind: "make10Builder" };
    return { kind: "missingNumberFacts" };
  }

  if (lessonId === "y1-w11-l2") {
    const mode = randInt(0, 2);
    if (mode === 0) return { kind: "doubleIt" };
    if (mode === 1) return { kind: "nearDouble" };
    return { kind: "doubleDetective" };
  }

  if (lessonId === "y1-w11-l3") {
    const mode = randInt(0, 2);
    if (mode === 0) return { kind: "gridRace" };
    if (mode === 1) return { kind: "factMatch" };
    return { kind: "climbLadder" };
  }

  return generateWeek11Task("y1-w11-l1");
}

