import type { PracticeTask } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildStrategyChoice(): PracticeTask {
  const total = randInt(12, 20);
  const remove = randInt(3, 9);
  const answer = total - remove;
  const options = Array.from(new Set([answer, answer + 1, answer - 1, answer + 2]))
    .filter((n) => n >= 0 && n <= 20)
    .slice(0, 4);
  while (options.length < 4) options.push(randInt(0, 20));
  return {
    kind: "strategyChoice",
    total,
    remove,
    options: options.sort(() => Math.random() - 0.5),
    answer,
  };
}

export function generateWeek12Task(lessonId: string): PracticeTask {
  if (lessonId === "y1-w12-l1") {
    const pick = randInt(0, 1);
    if (pick === 0) return { kind: "mixedReviewSprint", durationSeconds: 60 };
    return buildStrategyChoice();
  }
  if (lessonId === "y1-w12-l2") {
    return { kind: "targetedRevision" };
  }
  if (lessonId === "y1-w12-l3") {
    return { kind: "funGames" };
  }
  return { kind: "mixedReviewSprint", durationSeconds: 60 };
}
