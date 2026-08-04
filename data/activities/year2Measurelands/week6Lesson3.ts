import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "fractionTurn" }>;
type Turn = NonNullable<Task["turnFraction"]>;
const TURNS: Turn[] = ["quarter", "half", "three-quarter", "full"];
const memory = new Map<string, number>();

function buildTurn(index = Math.floor(Math.random() * TURNS.length)): Task {
  const turn = TURNS[index % TURNS.length]!;
  const clockwise = index % 2 === 0;
  return {
    kind: "fractionTurn",
    scene: "turn",
    turnFraction: turn,
    clockwise,
    startDirection: (["up", "right", "down", "left"] as const)[index % 4],
    prompt: `How much ${clockwise ? "clockwise" : "anticlockwise"} turn is shown?`,
    badgeLabel: "Fractional Turns",
    options: ["quarter turn", "half turn", "three-quarter turn", "full turn"],
    correctOption: `${turn} turn`,
    feedback: { correct: "Correct. You kept the starting direction in mind.", wrong: "Trace the turn from the gold start to the purple finish." },
  };
}

export function generateY2MeasurelandsWeek6Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const cursor = memory.get(lessonId) ?? 0;
  memory.set(lessonId, cursor + 1);
  return buildTurn(cursor);
}

export function resetY2MeasurelandsWeek6Lesson3TaskSessionState() { memory.clear(); }
export function buildY2MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  return [buildTurn(0), buildTurn(1), buildTurn(2), buildTurn(3), buildTurn(4)];
}
