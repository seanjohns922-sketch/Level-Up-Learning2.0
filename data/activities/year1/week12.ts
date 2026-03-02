import type { PracticeTask, Difficulty } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildStrategyChoice(d: Difficulty): PracticeTask {
  const maxTotal = d === "easy" ? 14 : d === "medium" ? 17 : 20;
  const total = randInt(d === "easy" ? 8 : 12, maxTotal);
  const remove = randInt(d === "easy" ? 1 : 3, Math.min(9, total - 1));
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
    difficulty: d,
  };
}

export function generateWeek12Task(lessonId: string, d: Difficulty = "easy"): PracticeTask {
  if (lessonId === "y1-w12-l1") {
    const pick = randInt(0, 1);
    if (pick === 0) return { kind: "mixedReviewSprint", durationSeconds: d === "easy" ? 90 : 60, difficulty: d };
    return buildStrategyChoice(d);
  }
  if (lessonId === "y1-w12-l2") {
    return { kind: "targetedRevision", difficulty: d };
  }
  if (lessonId === "y1-w12-l3") {
    return { kind: "funGames", difficulty: d };
  }
  return { kind: "mixedReviewSprint", durationSeconds: 60, difficulty: d };
}
