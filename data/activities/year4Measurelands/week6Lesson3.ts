import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickElapsed, fmtDur, shuffle, choose, randInt, randRange, roundTo, CARNIVAL_EVENTS, PLANNER_EVENTS } from "@/data/activities/year4Measurelands/week6Common";

// ── Measurelands · Level 4 · Week 6 · Lesson 3 — "Solve Time Problems" (AC9M4M03) ──
// Real-world time: journeys, carnivals and schedules.
//   A. bus     — how long was the journey? (set the duration)
//   B. carnival — which finishes first / lasts longest? (MCQ)
//   C. planner  — order the day's events by time.

type TimeTask = Extract<PracticeTask, { kind: "timeQuest" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"bus" | "carnival" | "planner"> = ["bus", "carnival", "planner", "bus", "carnival", "planner"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function buildIntroTask(): TimeTask {
  const { start, dur, finish } = pickElapsed(90);
  return {
    kind: "timeQuest",
    scene: "intro",
    prompt: "Time helps us plan our day.",
    speakText:
      "Professor Gauge says: time helps us plan our day — school, sport, travel and cooking. Draw or imagine a timeline, then work out how long things take and when they finish.",
    badgeLabel: "Meazurex Mission",
    startMin: start, finishMin: finish, durationMin: dur,
    feedback: { correct: "Let's solve!", wrong: "Let's solve!" },
  };
}

// Activity A — Bus Journey (set the duration).
function buildBusTask(): TimeTask {
  const { start, dur, finish } = pickElapsed(90);
  return {
    kind: "timeQuest",
    scene: "howLong",
    prompt: "How long was the bus journey?",
    speakText: "The bus leaves and arrives at the times shown. How long was the journey?",
    badgeLabel: "Bus Journey",
    startMin: start, finishMin: finish, durationMin: dur,
    feedback: { correct: `Yes — the journey took ${fmtDur(dur)}.`, wrong: `Count on from when the bus left — it's ${fmtDur(dur)}.` },
  };
}

// Activity B — Sports Carnival (MCQ).
function buildCarnivalTask(): TimeTask {
  const picks = shuffle(CARNIVAL_EVENTS).slice(0, 3);
  const events = picks.map((e) => {
    const start = roundTo(randRange(540, 660), 5); // 9–11 am
    const dur = choose([15, 20, 30, 45]);
    return { id: e.id, label: e.label, emoji: e.emoji, startMin: start, finishMin: start + dur, dur };
  });
  // ensure distinct finish times and durations
  const askLongest = randInt(2) === 0;
  let correct;
  if (askLongest) correct = events.reduce((a, b) => (b.dur > a.dur ? b : a));
  else correct = events.reduce((a, b) => (b.finishMin < a.finishMin ? b : a));
  return {
    kind: "timeQuest",
    scene: "compare",
    prompt: askLongest ? "Which event lasts the longest?" : "Which event finishes first?",
    speakText: askLongest ? "Look at how long each event lasts. Which lasts the longest?" : "Look at the finish times. Which event finishes first?",
    badgeLabel: "Sports Carnival",
    events: events.map(({ id, label, emoji, startMin, finishMin }) => ({ id, label, emoji, startMin, finishMin })),
    options: shuffle(events.map((e) => e.label)),
    correctOption: correct.label,
    feedback: {
      correct: askLongest ? `Yes — ${correct.label} lasts ${fmtDur(correct.dur)}.` : `Yes — ${correct.label} finishes first.`,
      wrong: askLongest ? "Compare how long each one lasts." : "Compare the finish times.",
    },
  };
}

// Activity C — Adventure Planner (order by time).
function buildPlannerTask(): TimeTask {
  const picks = shuffle(PLANNER_EVENTS).slice(0, 4);
  const times = shuffle([540, 660, 780, 900, 990]).slice(0, 4).sort(() => Math.random() - 0.5); // 9am,11am,1pm,3pm,4:30pm
  const events = picks.map((e, i) => ({ id: e.id, label: e.label, emoji: e.emoji, min: times[i]! }));
  return {
    kind: "timeQuest",
    scene: "order",
    prompt: "Put the day's plan in order, earliest to latest.",
    speakText: "Use the times. Tap the events from the earliest to the latest.",
    badgeLabel: "Adventure Planner",
    events,
    orderedIds: [...events].sort((a, b) => a.min - b.min).map((e) => e.id),
    feedback: { correct: "Nice planning — earliest to latest!", wrong: "Use the times — start with the earliest." },
  };
}

export function generateY4MeasurelandsWeek6Lesson3Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "carnival") return buildCarnivalTask();
  if (activity === "planner") return buildPlannerTask();
  return buildBusTask();
}

export function resetY4MeasurelandsWeek6Lesson3TaskSessionState() { lessonMemory.clear(); }

export function buildY4MeasurelandsWeek6Lesson3QuizTasks(): PracticeTask[] {
  return [buildBusTask(), buildCarnivalTask(), buildPlannerTask(), buildCarnivalTask(), buildBusTask()];
}
