import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 4 · Lesson 1 — "Hour, Day, Week" ──
// AC9M1M03: describe duration using hour/day/week. Ground Level asked "which
// takes longer?"; Level 1 connects familiar activities to duration UNITS and
// orders them hour < day < week. Activity scenes carry the meaning (non-reader
// friendly); text/audio are support.
//   A — Hour, Day or Week?  (scene "classify", tap the unit)
//   B — Which Lasts Longer?  (scene "compare", tap the longer activity)
//   C — Sort by Duration     (scene "order",   shortest → longest)

type DurationTask = Extract<PracticeTask, { kind: "durationUnit" }>;
type Unit = "hour" | "day" | "week";

const BASE = "/images/measurelands/duration-3d";
const RANK: Record<Unit, number> = { hour: 1, day: 2, week: 3 };

type Activity = { id: string; label: string; image: string; unit: Unit };

const ACTIVITIES: Activity[] = [
  // about an hour
  { id: "movie", label: "Movie Night", image: `${BASE}/movie.png`, unit: "hour" },
  { id: "swimming-lesson", label: "Swimming Lesson", image: `${BASE}/swimming-lesson.png`, unit: "hour" },
  { id: "sports-training", label: "Sports Training", image: `${BASE}/sports-training.png`, unit: "hour" },
  { id: "library", label: "Library Visit", image: `${BASE}/library.png`, unit: "hour" },
  // about a day
  { id: "school-day", label: "School Day", image: `${BASE}/school-day.png`, unit: "day" },
  { id: "zoo", label: "Zoo Trip", image: `${BASE}/zoo.png`, unit: "day" },
  { id: "birthday-party", label: "Birthday Party", image: `${BASE}/birthday-party.png`, unit: "day" },
  // about a week
  { id: "holidays", label: "School Holidays", image: `${BASE}/holidays.png`, unit: "week" },
  { id: "camping", label: "Camping Trip", image: `${BASE}/camping.png`, unit: "week" },
  { id: "festival", label: "Festival Week", image: `${BASE}/festival.png`, unit: "week" },
];

const BY_ID: Record<string, Activity> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));
const BY_UNIT: Record<Unit, Activity[]> = {
  hour: ACTIVITIES.filter((a) => a.unit === "hour"),
  day: ACTIVITIES.filter((a) => a.unit === "day"),
  week: ACTIVITIES.filter((a) => a.unit === "week"),
};

type LessonMemory = { introShown: boolean; cursor: number; lastId: string | null };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, lastId: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

function pickActivity(memory: LessonMemory): Activity {
  const a = choose(ACTIVITIES.filter((o) => o.id !== memory.lastId));
  memory.lastId = a.id;
  return a;
}

const toItem = (a: Activity) => ({ id: a.id, imageSrc: a.image, label: a.label, unit: a.unit });

function buildIntroTask(): DurationTask {
  return {
    kind: "durationUnit",
    scene: "intro",
    prompt: "Some things take an hour, a day, or a week.",
    speakText:
      "Professor Gauge has reached Duration Dunes! Last year we compared which takes longer. Now we use time words. Some things take about an hour, some take about a day, and some take about a week. An hour is short, a day is longer, and a week is the longest.",
    badgeLabel: "Meazurex Mission",
    teachingItems: [
      { imageSrc: BY_ID.movie!.image, label: "Movie Night", unit: "hour", caption: "A movie takes about an hour." },
      { imageSrc: BY_ID["school-day"]!.image, label: "School Day", unit: "day", caption: "School takes about a day." },
      { imageSrc: BY_ID.holidays!.image, label: "School Holidays", unit: "week", caption: "The holidays take about a week." },
    ],
    feedback: { correct: "Let's explore time!", wrong: "Let's get ready." },
  };
}

// Activity A — classify hour / day / week.
function buildClassifyTask(memory: LessonMemory): DurationTask {
  const a = pickActivity(memory);
  return {
    kind: "durationUnit",
    scene: "classify",
    prompt: `How long does ${a.label.toLowerCase()} usually take?`,
    speakText: `How long does ${a.label.toLowerCase()} usually take? An hour, a day, or a week?`,
    badgeLabel: "Hour, Day or Week?",
    activity: { imageSrc: a.image, label: a.label, unit: a.unit },
    feedback: { correct: "That's about right!", wrong: "Think about how long it usually takes." },
  };
}

// Activity B — which lasts longer / shorter?
function buildCompareTask(memory: LessonMemory): DurationTask {
  const units = shuffle(["hour", "day", "week"] as Unit[]).slice(0, 2) as [Unit, Unit];
  const a = choose(BY_UNIT[units[0]]);
  const b = choose(BY_UNIT[units[1]]);
  memory.lastId = b.id;
  const longer = randInt(2) === 0;
  const winner = longer
    ? (RANK[a.unit] > RANK[b.unit] ? a : b)
    : (RANK[a.unit] < RANK[b.unit] ? a : b);
  return {
    kind: "durationUnit",
    scene: "compare",
    prompt: longer ? "Which lasts longer?" : "Which lasts a shorter time?",
    speakText: longer ? "Which activity lasts longer?" : "Which activity lasts a shorter time?",
    badgeLabel: longer ? "Which Lasts Longer?" : "Which Is Shorter?",
    items: shuffle([toItem(a), toItem(b)]),
    compareMode: longer ? "longer" : "shorter",
    correctOptionId: winner.id,
    feedback: { correct: "Great time thinking!", wrong: "Think about how long each one takes." },
  };
}

// Activity C — order shortest → longest (hour → day → week).
function buildOrderTask(memory: LessonMemory): DurationTask {
  const hour = choose(BY_UNIT.hour);
  const day = choose(BY_UNIT.day);
  const week = choose(BY_UNIT.week);
  memory.lastId = week.id;
  const trio = [hour, day, week];
  return {
    kind: "durationUnit",
    scene: "order",
    prompt: "Put them in order: shortest to longest.",
    speakText: "Tap the activities in order, from the shortest time to the longest time.",
    badgeLabel: "Sort by Duration",
    items: shuffle(trio.map(toItem)),
    orderedIds: [hour.id, day.id, week.id],
    feedback: { correct: "Hour, day, week — perfect!", wrong: "Shortest first: hour, then day, then week." },
  };
}

// Quiz helper — "which activity takes about a <unit>?" (3 activities, one per unit).
function buildPickByUnit(memory: LessonMemory, target: Unit): DurationTask {
  const hour = choose(BY_UNIT.hour);
  const day = choose(BY_UNIT.day);
  const week = choose(BY_UNIT.week);
  const byUnit: Record<Unit, Activity> = { hour, day, week };
  return {
    kind: "durationUnit",
    scene: "compare",
    prompt: `Which activity takes about a ${target}?`,
    speakText: `Which activity takes about a ${target}?`,
    badgeLabel: "Which Takes About...",
    items: shuffle([toItem(hour), toItem(day), toItem(week)]),
    correctOptionId: byUnit[target].id,
    feedback: { correct: "Yes — that's about right!", wrong: `Find the one that takes about a ${target}.` },
  };
}

export function generateY1MeasurelandsWeek4Lesson1Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (rotation === "A") return buildClassifyTask(memory);
  if (rotation === "B") return buildCompareTask(memory);
  return buildOrderTask(memory);
}

export function resetY1MeasurelandsWeek4Lesson1TaskSessionState() {
  lessonMemory.clear();
}

// 5 fixed tasks for the Week 4 weekly quiz (Lesson 1's contribution):
// about an hour, about a day, about a week, which lasts longer, order by duration.
export function buildY1MeasurelandsWeek4Lesson1QuizTasks(): PracticeTask[] {
  const seed: LessonMemory = { introShown: true, cursor: 0, lastId: null };
  return [
    buildPickByUnit(seed, "hour"),
    buildPickByUnit(seed, "day"),
    buildPickByUnit(seed, "week"),
    buildCompareTask(seed),
    buildOrderTask(seed),
  ];
}
