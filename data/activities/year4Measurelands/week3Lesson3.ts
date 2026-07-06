import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickDistinctTemps, weatherEmoji, shuffle, choose, CITIES, DAYS } from "@/data/activities/year4Measurelands/week3Common";

// ── Measurelands · Level 4 · Week 3 · Lesson 3 — "Temperature Investigations" (AC9M4M01) ──
// Use temperature readings to compare, order and solve real-world weather problems.
// THREE rotating activities:
//   A. warmest — three cities; tap the warmest.
//   B. order   — arrange places coldest → warmest.
//   C. weather — a real-world weather question (jumper / swimming / hottest…).

type TempTask = Extract<PracticeTask, { kind: "temperature" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"warmest" | "order" | "weather"> = ["warmest", "order", "weather", "warmest", "order", "weather"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function threeCities(min = 6, max = 37): Array<{ id: string; label: string; value: number }> {
  const temps = pickDistinctTemps(3, min, max);
  const labels = shuffle(CITIES).slice(0, 3);
  return temps.map((value, i) => ({ id: `c${i}`, label: labels[i]!, value }));
}

function buildIntroTask(): TempTask {
  return {
    kind: "temperature",
    scene: "intro",
    prompt: "Scientists use temperatures to understand the world.",
    speakText:
      "Professor Gauge says: scientists use temperatures to understand the world. Compare the readings to decide what to wear, where it's warmest, and how the weather changes.",
    badgeLabel: "Meazurex Mission",
    introValue: 28,
    feedback: { correct: "Let's investigate!", wrong: "Let's investigate!" },
  };
}

// Activity A — Which City Is Warmest?
function buildWarmestTask(): TempTask {
  const items = threeCities();
  const warmest = items.reduce((a, b) => (b.value > a.value ? b : a));
  return {
    kind: "temperature",
    scene: "compare",
    prompt: "Which city is warmest?",
    speakText: "Use the temperatures. Which city is warmest?",
    badgeLabel: "Which City Is Warmest?",
    items,
    correctLabel: warmest.label,
    feedback: {
      correct: `Yes — ${warmest.label} is warmest at ${warmest.value}°C.`,
      wrong: `The warmest is the highest temperature — ${warmest.label}.`,
    },
  };
}

// Activity B — Order the Temperatures.
function buildOrderTask(): TempTask {
  const items = threeCities();
  const ordered = [...items].sort((a, b) => a.value - b.value).map((i) => i.label);
  return {
    kind: "temperature",
    scene: "order",
    prompt: "Order the cities from coldest to warmest.",
    speakText: "Use the temperatures. Tap the cities from coldest to warmest.",
    badgeLabel: "Order the Temperatures",
    items: shuffle(items),
    orderedLabels: ordered,
    feedback: {
      correct: "Good ordering — coldest to warmest!",
      wrong: "Start with the lowest temperature.",
    },
  };
}

// Activity C — Weather Investigation.
type WeatherQ = { q: string; badge: string; pick: "min" | "max"; min: number; max: number };
const WEATHER_QS: WeatherQ[] = [
  { q: "Which day should we wear a jumper?", badge: "Weather Investigation", pick: "min", min: 4, max: 24 },
  { q: "Which day is best for swimming?", badge: "Weather Investigation", pick: "max", min: 14, max: 38 },
  { q: "Which day is the hottest?", badge: "Weather Investigation", pick: "max", min: 10, max: 38 },
  { q: "Which day is the coldest?", badge: "Weather Investigation", pick: "min", min: 4, max: 30 },
];

function buildWeatherTask(): TempTask {
  const spec = choose(WEATHER_QS);
  const temps = pickDistinctTemps(3, spec.min, spec.max);
  const days = shuffle(DAYS).slice(0, 3);
  const items = temps.map((value, i) => ({ id: `d${i}`, label: days[i]!, emoji: weatherEmoji(value), value }));
  const target = spec.pick === "max"
    ? items.reduce((a, b) => (b.value > a.value ? b : a))
    : items.reduce((a, b) => (b.value < a.value ? b : a));
  return {
    kind: "temperature",
    scene: "compare",
    prompt: spec.q,
    speakText: `${spec.q} Use the temperatures.`,
    badgeLabel: spec.badge,
    items,
    correctLabel: target.label,
    feedback: {
      correct: `Yes — ${target.label} at ${target.value}°C.`,
      wrong: spec.pick === "max" ? "Choose the highest temperature." : "Choose the lowest temperature.",
    },
  };
}

export function generateY4MeasurelandsWeek3Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "order") return buildOrderTask();
  if (activity === "weather") return buildWeatherTask();
  return buildWarmestTask();
}

export function resetY4MeasurelandsWeek3Lesson3TaskSessionState() {
  lessonMemory.clear();
}

export function buildY4MeasurelandsWeek3Lesson3QuizTasks(): PracticeTask[] {
  return [buildWarmestTask(), buildOrderTask(), buildWeatherTask(), buildWarmestTask(), buildWeatherTask()];
}
