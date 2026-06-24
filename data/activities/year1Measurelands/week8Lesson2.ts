import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 8 · Lesson 2 — "Build My Day" ──
// AC9M1M03: sequence familiar events and describe when they happen. Students
// move from small event groups (L1) to organising a whole day across
// morning -> afternoon -> evening -> night. Daily-routine scenes are primary.
//   A — Morning, Afternoon or Evening?  (classify one event by part of day)
//   B — Build My Day                    (order a 5-event daily routine)
//   C — What Happens Next?              (continue a routine chain)

type RoutineTask = Extract<PracticeTask, { kind: "routineSequence" }>;
type RoutineItem = NonNullable<RoutineTask["items"]>[number];
type DayPart = "Morning" | "Afternoon" | "Evening" | "Night";

const ROUTINE_IMAGE_BASE = "/images/measurelands/routine-3d";
const DAY_PARTS: DayPart[] = ["Morning", "Afternoon", "Evening", "Night"];

// The 9 image-backed routine events, each with a clear, unambiguous day-part.
const ROUTINES: Array<RoutineItem & { daypart: DayPart }> = [
  { id: "wakeup", label: "Wake Up", icon: "wakeup", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-wakeup.png`, order: 0, daypart: "Morning" },
  { id: "breakfast", label: "Breakfast", icon: "breakfast", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-breakfast.png`, order: 1, daypart: "Morning" },
  { id: "school", label: "School", icon: "school", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-school.png`, order: 2, daypart: "Morning" },
  { id: "sport", label: "Sport", icon: "sport", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-sport.png`, order: 3, daypart: "Afternoon" },
  { id: "art", label: "Art", icon: "art", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-art.png`, order: 4, daypart: "Afternoon" },
  { id: "reading", label: "Reading", icon: "reading", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-reading.png`, order: 5, daypart: "Evening" },
  { id: "dinner", label: "Dinner", icon: "dinner", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-dinner.png`, order: 6, daypart: "Evening" },
  { id: "bath", label: "Bath", icon: "bath", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-bath.png`, order: 7, daypart: "Evening" },
  { id: "bed", label: "Bed", icon: "bed", imageSrc: `${ROUTINE_IMAGE_BASE}/routine-bed.png`, order: 8, daypart: "Night" },
];

// Mid-day events (orders 1..7) that can sit between Wake Up (first) and Bed
// (last). A "day" is Wake Up + 3 of these (in time order) + Bed — which gives
// 35 distinct full-day routines for variety, all unambiguous morning -> night.
const MIDDLES = ["breakfast", "school", "sport", "art", "reading", "dinner", "bath"] as const;

type LessonMemory = { introShown: boolean; cursor: number; lastPodId: string | null; lastDayKey: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "B", "C"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastPodId: null, lastDayKey: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
function byId(id: string) {
  const item = ROUTINES.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`[Y1MeasurelandsW8L2] Unknown routine id: ${id}`);
  return item;
}

// A fresh, valid full-day routine: Wake Up + 3 ordered middles + Bed. Avoids
// repeating the immediately-previous day so consecutive tasks feel different.
function randomDay(memory: LessonMemory): string[] {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const middles = shuffle([...MIDDLES]).slice(0, 3).sort((a, b) => byId(a).order - byId(b).order);
    const day = ["wakeup", ...middles, "bed"];
    const key = day.join("-");
    if (key !== memory.lastDayKey) {
      memory.lastDayKey = key;
      return day;
    }
  }
  return ["wakeup", "breakfast", "school", "dinner", "bed"];
}
// Strip the daypart field — tasks carry plain RoutineItems.
function asItem(r: RoutineItem & { daypart: DayPart }): RoutineItem {
  const { id, label, icon, order, imageSrc } = r;
  return { id, label, icon, order, imageSrc };
}

function buildIntroTask(): RoutineTask {
  return {
    kind: "routineSequence",
    scene: "intro",
    prompt: "A day has different parts.",
    speakText:
      "A day has different parts. We do different things in the morning, afternoon and evening. This is one example of a daily routine.",
    badgeLabel: "Meazurex Mission",
    items: ["wakeup", "breakfast", "school", "dinner", "bed"].map((id) => asItem(byId(id))),
    feedback: { correct: "Let's build a day!", wrong: "Let's get ready." },
  };
}

// Activity A — classify one event into its part of the day.
function buildPartOfDayTask(memory: LessonMemory): RoutineTask {
  const pool = ROUTINES.filter((r) => r.id !== memory.lastPodId);
  const event = shuffle(pool)[0]!;
  memory.lastPodId = event.id;
  return {
    kind: "routineSequence",
    scene: "partOfDay",
    prompt: `When does ${event.label} happen?`,
    speakText: `When does ${event.label} happen? Morning, afternoon, evening or night?`,
    badgeLabel: "When Does It Happen?",
    items: [asItem(event)],
    textOptions: [...DAY_PARTS],
    correctTextOption: event.daypart,
    feedback: { correct: `Yes — ${event.label} happens in the ${event.daypart.toLowerCase()}!`, wrong: "Think about when you usually do this in your day." },
  };
}

// Activity B — build a full daily routine (5 events) in order.
function buildBuildTask(memory: LessonMemory): RoutineTask {
  const set = randomDay(memory).map((id) => asItem(byId(id)));
  return {
    kind: "routineSequence",
    scene: "build",
    prompt: "Build my day in order.",
    speakText: "Tap the events in order, from morning to night.",
    badgeLabel: "Build My Day",
    buildItems: shuffle(set),
    feedback: { correct: "A whole day in order!", wrong: "Start with what happens first, in the morning." },
  };
}

// Activity C — continue the routine: pick the next event.
function buildNextTask(memory: LessonMemory): RoutineTask {
  // Build a fresh day, then show a 2-event contiguous slice; the answer is the
  // immediate next event, and the remaining day events are the distractors.
  const spine = randomDay(memory);
  const start = Math.floor(Math.random() * (spine.length - 2)); // 0..2 -> leaves 2 distractors
  const shownIds = [spine[start]!, spine[start + 1]!];
  const answerId = spine[start + 2]!;
  const distractorIds = spine.filter((id) => !shownIds.includes(id) && id !== answerId);
  const options = shuffle([answerId, ...distractorIds].map((id) => asItem(byId(id))));
  return {
    kind: "routineSequence",
    scene: "next",
    prompt: "What happens next?",
    speakText: "Look at the routine. What happens next?",
    badgeLabel: "What Happens Next?",
    items: shownIds.map((id) => asItem(byId(id))),
    buildItems: options,
    correctTextOption: answerId,
    feedback: { correct: `Yes — ${byId(answerId).label} comes next!`, wrong: "Think about what you do next in your day." },
  };
}

// Reflection / meaning (kept for parity with L1 + the quiz, if wired later).
function buildMeaningTask(): RoutineTask {
  return {
    kind: "routineSequence",
    scene: "meaning",
    prompt: "How did you know what happened next?",
    speakText: "How did you know what happened next?",
    badgeLabel: "How Did You Know?",
    textOptions: shuffle(["I thought about a normal day.", "I picked a random picture.", "I guessed."]),
    correctTextOption: "I thought about a normal day.",
    feedback: { correct: "Yes — a normal day follows an order.", wrong: "Think about the order your day really happens in." },
  };
}

export function generateY1MeasurelandsWeek8Lesson2Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  // Occasionally surface the reflection so it isn't quiz-only.
  if (memory.cursor > 0 && memory.cursor % 7 === 6) {
    memory.cursor += 1;
    return buildMeaningTask();
  }
  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (rotation === "A") return buildPartOfDayTask(memory);
  if (rotation === "B") return buildBuildTask(memory);
  return buildNextTask(memory);
}

export function resetY1MeasurelandsWeek8Lesson2TaskSessionState() {
  lessonMemory.clear();
}
