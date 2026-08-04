import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "fractionTurn" }>;
type Memory = { cursor: number };
const memory = new Map<string, Memory>();
const PARTS = [2, 4, 8] as const;
const NAMES = { 2: "one half", 4: "one quarter", 8: "one eighth" } as const;

function buildFraction(index = Math.floor(Math.random() * PARTS.length)): Task {
  const parts = PARTS[index % PARTS.length]!;
  const answer = NAMES[parts];
  return {
    kind: "fractionTurn",
    scene: "fraction",
    parts,
    shadedParts: 1,
    prompt: `The whole is split into ${parts} equal parts. What fraction is shaded?`,
    speakText: `The whole is split into ${parts} equal parts. One part is shaded. What fraction is it?`,
    badgeLabel: "Equal Parts",
    options: ["one half", "one quarter", "one eighth", "not equal parts"],
    correctOption: answer,
    feedback: { correct: "Correct. Every part is equal.", wrong: `Count ${parts} equal parts in the whole.` },
  };
}

export function generateY2MeasurelandsWeek5Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const state = memory.get(lessonId) ?? { cursor: 0 };
  memory.set(lessonId, state);
  const task = buildFraction(state.cursor);
  state.cursor += 1;
  return task;
}

export function resetY2MeasurelandsWeek5Lesson3TaskSessionState() { memory.clear(); }
export function buildY2MeasurelandsWeek5Lesson3QuizTasks(): PracticeTask[] {
  return [buildFraction(0), buildFraction(1), buildFraction(2), buildFraction(1), buildFraction(2)];
}
