import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Ground · Week 1 Weekly Quiz — "Length Lands" ──
// 15 questions: 5 from each lesson. Every question has exactly ONE defensible
// answer. Built from the same measurementCompare / measurePath task kinds the
// lessons use, so the quiz reuses the lesson visuals and scoring.

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type PathTask = Extract<PracticeTask, { kind: "measurePath" }>;
type MObj = CompareTask["objects"][number];
type Accent = MObj["accent"];

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

const ACCENTS: Accent[] = ["rose", "gold", "teal", "sky", "violet", "leaf"];

// ── Lesson 1: distinct-length / distinct-height pairs (clear gaps) ──
const PAIRS_LENGTH: Array<{ longLabel: string; longIcon: string; shortLabel: string; shortIcon: string }> = [
  { longLabel: "Snake", longIcon: "🐍", shortLabel: "Worm", shortIcon: "🪱" },
  { longLabel: "Ruler", longIcon: "📏", shortLabel: "Pencil", shortIcon: "✏️" },
  { longLabel: "Road", longIcon: "🛣️", shortLabel: "Path", shortIcon: "🪧" },
  { longLabel: "Train", longIcon: "🚆", shortLabel: "Car", shortIcon: "🚗" },
  { longLabel: "Cucumber", longIcon: "🥒", shortLabel: "Carrot", shortIcon: "🥕" },
  { longLabel: "Bridge", longIcon: "🌉", shortLabel: "Plank", shortIcon: "🪵" },
];
const PAIRS_HEIGHT: Array<{ tallLabel: string; tallIcon: string; shortLabel: string; shortIcon: string }> = [
  { tallLabel: "Tree", tallIcon: "🌳", shortLabel: "Bush", shortIcon: "🌿" },
  { tallLabel: "Tower", tallIcon: "🗼", shortLabel: "House", shortIcon: "🏠" },
  { tallLabel: "Giraffe", tallIcon: "🦒", shortLabel: "Dog", shortIcon: "🐕" },
  { tallLabel: "Building", tallIcon: "🏢", shortLabel: "Tent", shortIcon: "⛺" },
];

function bigSmall(): [number, number] {
  const small = 3 + randInt(3); // 3–5
  const big = small + 3 + randInt(2); // ≥3 longer
  return [big, small];
}

function makeObj(id: string, label: string, icon: string, value: number, axis: "length" | "height", accent: Accent): MObj {
  return { id, label, icon, compareValue: value, axis, accent };
}

// ── Lesson 1 builders ──
function qWhichLonger(used: Set<string>): CompareTask {
  let pair = choose(PAIRS_LENGTH);
  let guard = 0;
  while (used.has(pair.longLabel) && guard++ < 10) pair = choose(PAIRS_LENGTH);
  used.add(pair.longLabel);
  const [big, small] = bigSmall();
  const acc = shuffle(ACCENTS);
  const objects = shuffle([
    makeObj("long", pair.longLabel, pair.longIcon, big, "length", acc[0]!),
    makeObj("short", pair.shortLabel, pair.shortIcon, small, "length", acc[1]!),
  ]);
  return {
    kind: "measurementCompare", scene: "pair", targetMode: "longer",
    prompt: "Which is longer?", speakText: "Which is longer?", badgeLabel: "Length Explorer",
    objects, correctOptionId: "long",
    feedback: { correct: "Nice comparing!", wrong: "Let's try another one." },
  };
}

function qWhichShorter(): CompareTask {
  const pair = choose(PAIRS_LENGTH);
  const [big, small] = bigSmall();
  const acc = shuffle(ACCENTS);
  const objects = shuffle([
    makeObj("long", pair.longLabel, pair.longIcon, big, "length", acc[0]!),
    makeObj("short", pair.shortLabel, pair.shortIcon, small, "length", acc[1]!),
  ]);
  return {
    kind: "measurementCompare", scene: "pair", targetMode: "longer",
    prompt: "Which is shorter?", speakText: "Which is shorter?", badgeLabel: "Length Explorer",
    objects, correctOptionId: "short",
    feedback: { correct: "Nice comparing!", wrong: "Let's try another one." },
  };
}

function qWhichTaller(): CompareTask {
  const pair = choose(PAIRS_HEIGHT);
  const [big, small] = bigSmall();
  const acc = shuffle(ACCENTS);
  const objects = shuffle([
    makeObj("tall", pair.tallLabel, pair.tallIcon, big, "height", acc[0]!),
    makeObj("low", pair.shortLabel, pair.shortIcon, small, "height", acc[1]!),
  ]);
  return {
    kind: "measurementCompare", scene: "pair", targetMode: "taller",
    prompt: "Which is taller?", speakText: "Which is taller?", badgeLabel: "Tallest Tower",
    objects, correctOptionId: "tall",
    feedback: { correct: "Towering work!", wrong: "Let's try another one." },
  };
}

// Same length — two equal, one different. Tap the one that is different.
function qSameLength(): CompareTask {
  const fam = choose(FAMILIES);
  const same = 6 + randInt(3); // 6–8
  const diff = 2 + randInt(2); // 2–3 (clearly different)
  const acc = shuffle(ACCENTS);
  const objects = shuffle([
    makeObj("a", fam.label, fam.icon, same, fam.axis, acc[0]!),
    makeObj("b", fam.label, fam.icon, same, fam.axis, acc[1]!),
    makeObj("c", fam.label, fam.icon, diff, fam.axis, acc[2]!),
  ]);
  return {
    kind: "measurementCompare", scene: "trio", targetMode: "longest",
    prompt: "Two are the same length. Tap the one that is different.",
    speakText: "Two are the same length. Tap the one that is different.",
    badgeLabel: "Same or Different", objects, correctOptionId: "c",
    feedback: { correct: "Great spotting!", wrong: "Let's try another one." },
  };
}

// ── Lesson 2 families & builders ──
type Family = { id: string; label: string; icon: string; axis: "length" | "height" };
const FAMILIES: Family[] = [
  { id: "pencil", label: "Pencil", icon: "✏️", axis: "length" },
  { id: "snake", label: "Snake", icon: "🐍", axis: "length" },
  { id: "road", label: "Road", icon: "🛣️", axis: "length" },
  { id: "ladder", label: "Ladder", icon: "🪜", axis: "length" },
  { id: "vine", label: "Vine", icon: "🌿", axis: "length" },
  { id: "rocket", label: "Rocket", icon: "🚀", axis: "length" },
];
const VALUE_TRIPLES: Array<[number, number, number]> = [[3, 6, 10], [2, 5, 9], [4, 7, 10], [3, 7, 10]];
const VALUE_QUADS: Array<[number, number, number, number]> = [[2, 4, 6, 8], [3, 5, 7, 9], [2, 4, 6, 10], [1, 4, 7, 10]];

function familyTrio(fam: Family): MObj[] {
  const vals = choose(VALUE_TRIPLES);
  const acc = shuffle(ACCENTS).slice(0, 3);
  return vals.map((v, i) => makeObj(`${fam.id}-${["s", "m", "l"][i]}`, fam.label, fam.icon, v, fam.axis, acc[i]!));
}

function qTapShortest(): CompareTask {
  const trio = familyTrio(choose(FAMILIES));
  const shortest = [...trio].sort((a, b) => a.compareValue - b.compareValue)[0]!;
  return {
    kind: "measurementCompare", scene: "trio", targetMode: "shortest",
    prompt: "Tap the shortest.", speakText: "Tap the shortest.", badgeLabel: "Sorting Machine",
    objects: shuffle(trio), correctOptionId: shortest.id,
    feedback: { correct: "Wonderful sorting!", wrong: "Let's try another one." },
  };
}

function qTapLongest(): CompareTask {
  const trio = familyTrio(choose(FAMILIES));
  const longest = [...trio].sort((a, b) => b.compareValue - a.compareValue)[0]!;
  return {
    kind: "measurementCompare", scene: "trio", targetMode: "longest",
    prompt: "Tap the longest.", speakText: "Tap the longest.", badgeLabel: "Sorting Machine",
    objects: shuffle(trio), correctOptionId: longest.id,
    feedback: { correct: "Wonderful sorting!", wrong: "Let's try another one." },
  };
}

function qOrder(descending: boolean): CompareTask {
  const trio = familyTrio(choose(FAMILIES));
  const ordered = [...trio].sort((a, b) => (descending ? b.compareValue - a.compareValue : a.compareValue - b.compareValue));
  const target = ordered[ordered.length - 1]!;
  return {
    kind: "measurementCompare", scene: "order", targetMode: descending ? "longest" : "shortest",
    prompt: descending ? "Put them in order: longest to shortest." : "Put them in order: shortest to longest.",
    speakText: descending ? "Put the objects in order, from longest to shortest." : "Put the objects in order, from shortest to longest.",
    badgeLabel: "Sorting Machine", objects: shuffle(trio),
    orderedIds: ordered.map((o) => o.id), correctOptionId: target.id,
    feedback: { correct: "Excellent sorting!", wrong: "Let's try another one." },
  };
}

function qSequence(): CompareTask {
  const fam = choose(FAMILIES);
  const vals = choose(VALUE_QUADS);
  const acc = shuffle(ACCENTS).slice(0, 4);
  const quad = vals.map((v, i) => makeObj(`${fam.id}-${["xs", "s", "m", "l"][i]}`, fam.label, fam.icon, v, fam.axis, acc[i]!));
  const prefix = [quad[0]!, quad[1]!, quad[2]!];
  const correct = quad[3]!;
  const distractorA: MObj = { ...quad[0]!, id: `${fam.id}-dA` };
  const distractorB: MObj = { ...quad[1]!, id: `${fam.id}-dB` };
  return {
    kind: "measurementCompare", scene: "sequence", targetMode: "longest",
    prompt: "Which object comes next?", speakText: "Look at the pattern. They are getting bigger. Which object comes next?",
    badgeLabel: "Which Comes Next?", sequencePrefix: prefix,
    objects: shuffle([correct, distractorA, distractorB]), correctOptionId: correct.id,
    feedback: { correct: "Great pattern spotting!", wrong: "Let's try another one." },
  };
}

// ── Lesson 3 units & builders ──
type Unit = { id: string; emoji: string; plural: string };
const UNITS: Unit[] = [
  { id: "footstep", emoji: "👣", plural: "footsteps" },
  { id: "block", emoji: "🟦", plural: "blocks" },
  { id: "star", emoji: "⭐", plural: "stars" },
  { id: "flower", emoji: "🌸", plural: "flowers" },
  { id: "stone", emoji: "🪨", plural: "stepping stones" },
];

function qCount(unit: Unit): PathTask {
  const length = 3 + randInt(6); // 3–8
  const candidates = [length - 2, length - 1, length + 1, length + 2].filter((n) => n >= 2 && n <= 9 && n !== length);
  const options = shuffle([length, ...shuffle(candidates).slice(0, 2)]);
  return {
    kind: "measurePath", scene: "count",
    prompt: `Count the ${unit.plural}.`, speakText: `How many ${unit.plural} long is the path?`,
    badgeLabel: "Count the Path", unitEmoji: unit.emoji, unitLabel: unit.plural,
    pathLength: length, options, correctAnswer: length,
    feedback: { correct: "Great measuring!", wrong: "Let's try another one." },
  };
}

function qComparePaths(prompt: string): PathTask {
  const unit = choose(UNITS);
  const shortLen = 2 + randInt(4); // 2–5
  const longLen = shortLen + 2 + randInt(3); // ≥2 longer
  const shortPath = { id: "p-short", length: shortLen, unitEmoji: unit.emoji, unitLabel: unit.plural };
  const longPath = { id: "p-long", length: longLen, unitEmoji: unit.emoji, unitLabel: unit.plural };
  return {
    kind: "measurePath", scene: "compare",
    prompt, speakText: prompt, badgeLabel: "Compare Paths",
    paths: shuffle([shortPath, longPath]), correctPathId: longPath.id,
    feedback: { correct: "Nice comparing!", wrong: "Let's try another one." },
  };
}

function qBuild(): PathTask {
  const unit = choose(UNITS);
  const target = 4 + randInt(4); // 4–7
  return {
    kind: "measurePath", scene: "build",
    prompt: `Build a path ${target} ${unit.plural} long.`, speakText: `Build a path ${target} ${unit.plural} long.`,
    badgeLabel: "Build the Path", unitEmoji: unit.emoji, unitLabel: unit.plural,
    targetLength: target, maxUnits: target + 2,
    feedback: { correct: "Path repaired!", wrong: "Let's try another one." },
  };
}

/** Returns 15 tasks (5 per lesson) for the Week 1 quiz. */
export function buildMeasurelandsWeek1QuizTasks(): PracticeTask[] {
  const usedLonger = new Set<string>();
  const lesson1: PracticeTask[] = [
    qWhichLonger(usedLonger),
    qWhichShorter(),
    qWhichTaller(),
    qWhichLonger(usedLonger),
    qSameLength(),
  ];
  const lesson2: PracticeTask[] = [
    qTapShortest(),
    qTapLongest(),
    qOrder(false),
    qOrder(true),
    qSequence(),
  ];
  const lesson3: PracticeTask[] = [
    qCount(UNITS[0]!), // footsteps
    qCount(UNITS[1]!), // blocks
    qComparePaths("Which path is longer?"),
    qBuild(),
    qComparePaths("Which path uses more units?"),
  ];
  return [...lesson1, ...lesson2, ...lesson3];
}
