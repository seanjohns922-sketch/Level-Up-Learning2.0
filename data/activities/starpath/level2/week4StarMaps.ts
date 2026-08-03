import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_TWO_ARTWORK, getStarMap, listStarMaps, mapLandmarks } from "./star-maps";

// Level 2 · Week 4 — Star Maps (AC9M2SP02). Locate positions in a simple 2D
// representation: find a named landmark, name what sits at a spot, and reason
// about a landmark's position relative to another.

function rotate<T>(items: readonly T[], by: number): T[] {
  const shift = ((by % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

const MAP_IDS = listStarMaps().map((map) => map.id);

// L1 — Find a named landmark by tapping it on the map.
export function findTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map);
  const wanted = landmarks[round % landmarks.length]!;
  return {
    kind: "starpathMapLocate",
    mode: "find",
    prompt: `Find ${wanted.label} on the map.`,
    speakText: `Look at the star map. Find ${wanted.label} and tap it.`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    correctLandmarkId: wanted.id,
    feedback: {
      correct: `That is ${wanted.label}.`,
      wrong: `Read the labels on the map to find ${wanted.label}.`,
    },
  };
}

// L2 — Name what sits at a highlighted spot on the map.
export function whatIsHereTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map);
  const here = landmarks[(round + 1) % landmarks.length]!;
  const distractors = rotate(
    landmarks.filter((landmark) => landmark.id !== here.id),
    round
  ).slice(0, 3);
  const options = rotate(
    [here, ...distractors].map((landmark) => ({ id: landmark.id, label: landmark.label })),
    round
  );
  return {
    kind: "starpathMapLocate",
    mode: "whatIsHere",
    prompt: "What is at the marked spot on the map?",
    speakText: "Look at the marked square on the star map. What place is there?",
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    highlight: { r: here.r, c: here.c },
    options,
    correctOptionId: here.id,
    feedback: {
      correct: `Yes — ${here.label} is there.`,
      wrong: "Look at the marked square and read the label there.",
    },
  };
}

const RELATION_WORD = {
  right: "to the right of",
  left: "to the left of",
  above: "above",
  below: "below",
} as const;

// L3 — Reason about one landmark's position relative to another. The axis picks
// which relations to ask about: horizontal (left/right), vertical (above/below)
// or both, so lessons can focus on one kind of relative position at a time.
export function relativeTask(
  round: number,
  target: number,
  axis: "horizontal" | "vertical" | "both" = "both"
): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map);
  // Find an aligned pair (same row -> left/right, same column -> above/below).
  type Rel = keyof typeof RELATION_WORD;
  const all: Array<{ ref: (typeof landmarks)[number]; answer: (typeof landmarks)[number]; rel: Rel }> = [];
  for (const a of landmarks) {
    for (const b of landmarks) {
      if (a.id === b.id) continue;
      if (a.r === b.r) all.push({ ref: a, answer: b, rel: b.c > a.c ? "right" : "left" });
      else if (a.c === b.c) all.push({ ref: a, answer: b, rel: b.r > a.r ? "below" : "above" });
    }
  }
  const horizontal = all.filter((p) => p.rel === "left" || p.rel === "right");
  const vertical = all.filter((p) => p.rel === "above" || p.rel === "below");
  const pairs = axis === "horizontal" ? horizontal : axis === "vertical" ? vertical : all;
  const usable = pairs.length > 0 ? pairs : all;
  if (usable.length === 0) return whatIsHereTask(round, target);
  const pick = usable[round % usable.length]!;
  const distractors = rotate(
    landmarks.filter((landmark) => landmark.id !== pick.answer.id && landmark.id !== pick.ref.id),
    round
  ).slice(0, 2);
  const options = rotate(
    [pick.answer, ...distractors].map((landmark) => ({ id: landmark.id, label: landmark.label })),
    round + 1
  );
  return {
    kind: "starpathMapLocate",
    mode: "relative",
    prompt: `Which place is ${RELATION_WORD[pick.rel]} ${pick.ref.label}?`,
    speakText: `On the star map, which place is ${RELATION_WORD[pick.rel]} ${pick.ref.label}?`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    options,
    correctOptionId: pick.answer.id,
    feedback: {
      correct: `Correct — ${pick.answer.label} is ${RELATION_WORD[pick.rel]} ${pick.ref.label}.`,
      wrong: `Find ${pick.ref.label} first, then look ${pick.rel}.`,
    },
  };
}

// L3 (W6) — Position Detective. Two clues that together identify one place: a
// row clue that leaves two candidates, then a relative clue that disambiguates.
// Static, hand-checked specs so the answer is always exactly one landmark.
type DetectiveSpec = {
  mapId: string;
  targetId: string;
  clues: [string, string];
  optionIds: [string, string, string, string];
};
const DETECTIVES: DetectiveSpec[] = [
  { mapId: "sector-1", targetId: "planet-plaza", clues: ["It is in the top row.", "It is to the right of Crystal Caves."], optionIds: ["planet-plaza", "crystal-caves", "constellation-crossing", "moon-maze"] },
  { mapId: "sector-2", targetId: "flag-point", clues: ["It is in the top row.", "It is to the right of Rocket Base."], optionIds: ["flag-point", "rocket-base", "moon-maze", "constellation-crossing"] },
  { mapId: "sector-3", targetId: "alien-outpost", clues: ["It is in the top row.", "It is to the right of Moon Maze."], optionIds: ["alien-outpost", "moon-maze", "planet-plaza", "crystal-caves"] },
  { mapId: "sector-1", targetId: "crystal-caves", clues: ["It is in the top row.", "It is to the left of Planet Plaza."], optionIds: ["crystal-caves", "planet-plaza", "moon-maze", "rocket-base"] },
  { mapId: "sector-2", targetId: "rocket-base", clues: ["It is in the top row.", "It is to the left of Flag Point."], optionIds: ["rocket-base", "flag-point", "planet-plaza", "asteroid-pass"] },
  { mapId: "sector-3", targetId: "moon-maze", clues: ["It is in the top row.", "It is to the left of Alien Outpost."], optionIds: ["moon-maze", "alien-outpost", "planet-plaza", "nebula-station"] },
];

export function positionDetectiveTask(round: number, target: number): PracticeTask {
  const spec = DETECTIVES[round % DETECTIVES.length]!;
  const map = getStarMap(spec.mapId);
  const landmarks = mapLandmarks(map);
  const byId = (id: string) => landmarks.find((l) => l.id === id)!;
  const options = rotate(
    spec.optionIds.map((id) => ({ id, label: byId(id).label })),
    round
  );
  return {
    kind: "starpathMapLocate",
    mode: "clues",
    prompt: "Which place do both clues point to?",
    speakText: `Use both clues to find the place. ${spec.clues[0]} ${spec.clues[1]}`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    clues: spec.clues,
    options,
    correctOptionId: spec.targetId,
    feedback: {
      correct: `Yes — ${byId(spec.targetId).label} fits both clues.`,
      wrong: "Read both clues. The place must match the first clue and the second clue.",
    },
  };
}

function teaching(
  variant: "mapLocate" | "mapPositions",
  heading: string,
  prompt: string,
  speakText: string
) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant,
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

// ── W5 · Reading a Map — read the map both ways: name → place, place → name ───
// L1 Find the Place (told a name, tap it), L2 What Is Here? (a spot is marked,
// name the place there), L3 Map Reading Challenge (both, mixed).
export function createReadingAMapTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapLocate",
      "Find the Place",
      "A star map shows where places are.",
      "A star map is a picture from above that shows where places are. Read a label and tap that place on the map."
    ),
    activities: [
      () => findTask(a++, ++target),
      () => findTask(b++ + 1, ++target),
      () => findTask(c++ + 2, ++target),
    ],
  };
}

export function createWhatIsHereTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "What Is Here?",
      "Each spot on the map has a place.",
      "This time the spot is marked for you. Look at the marked spot on the map and say which place is there."
    ),
    activities: [
      () => whatIsHereTask(a++, ++target),
      () => whatIsHereTask(b++ + 1, ++target),
      () => whatIsHereTask(c++ + 2, ++target),
    ],
  };
}

export function createMapReadingChallengeTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapLocate",
      "Map Reading Challenge",
      "Read the map both ways.",
      "Find a place from its name, and name the place at a marked spot, all on your own."
    ),
    activities: [
      () => findTask(a++ + 3, ++target),
      () => whatIsHereTask(b++ + 3, ++target),
      () => findTask(c++ + 4, ++target),
    ],
  };
}

// ── W6 · Positions on a Map — describe how places relate: next-to, above/below ─
// L1 Next To (left/right), L2 Above and Below (up/down), L3 Position Challenge
// (both directions, mixed).
export function createNextToTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "Next To and Beside",
      "Places sit next to each other, left and right.",
      "Use the map to work out which place is next to another — on its left or its right."
    ),
    activities: [
      () => relativeTask(a++, ++target, "horizontal"),
      () => relativeTask(b++ + 1, ++target, "horizontal"),
      () => relativeTask(c++ + 2, ++target, "horizontal"),
    ],
  };
}

export function createAboveBelowTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "Above and Below",
      "Places sit above and below each other.",
      "Use the map to work out which place is above or below another place."
    ),
    activities: [
      () => relativeTask(a++, ++target, "vertical"),
      () => relativeTask(b++ + 1, ++target, "vertical"),
      () => relativeTask(c++ + 2, ++target, "vertical"),
    ],
  };
}

export function createPositionDetectiveTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "Position Detective",
      "Use two clues to find one place.",
      "Now use two clues together. The place must match the first clue and the second clue. Find the one place that fits both."
    ),
    activities: [
      () => positionDetectiveTask(a++, ++target),
      () => positionDetectiveTask(b++ + 1, ++target),
      () => positionDetectiveTask(c++ + 2, ++target),
    ],
  };
}

// ── W5 · Reading a Map ───────────────────────────────────────────────────────
export const READING_A_MAP_CONTENT = {
  missionBrief:
    "Welcome, Space Mapper. A star map shows Starpath from above. Read a label, then tap that place on the map.",
  successCriteria: ["read a star map", "find a named place", "use the map labels"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Find the Place", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Find the Place", description: "Read a name and tap that place.", taskKinds: ["starpathMapLocate"] },
    { key: "find-2", title: "Find Another", description: "Find the next named place.", taskKinds: ["starpathMapLocate"] },
    { key: "find-3", title: "Place Finder", description: "Find places by name.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find a place?",
    options: ["I read the map labels", "I looked from above", "I found its square"],
  },
  practisedSkills: ["Read a 2D map", "Locate a named place", "Use map labels"],
  nextUpLabel: "What Is Here?",
  createTaskSet: createReadingAMapTaskSet,
} satisfies StarpathLessonContent;

export const WHAT_IS_HERE_CONTENT = {
  missionBrief:
    "Now read the map the other way. A spot is marked for you — look at it and say which place is there.",
  successCriteria: ["read a marked spot", "name the place there", "use the map labels"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "What Is Here?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "here-1", title: "What Is Here?", description: "Name what is at a marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "here-2", title: "Spot Check", description: "Name another marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "here-3", title: "Spot Master", description: "Name marked spots.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you name a spot?",
    options: ["I read the label at the square", "I matched the spot to a place", "I looked carefully at the map"],
  },
  practisedSkills: ["Name a marked position", "Read a spot on a map", "Use map labels"],
  nextUpLabel: "Map Reading Challenge",
  createTaskSet: createWhatIsHereTaskSet,
} satisfies StarpathLessonContent;

export const MAP_READING_CHALLENGE_CONTENT = {
  missionBrief:
    "Mixed review — find a place from its name, and name the place at a marked spot, on your own.",
  successCriteria: ["find a named place", "name a marked spot", "answer on your own"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Map Reading Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Find It", description: "Find a place from its name.", taskKinds: ["starpathMapLocate"] },
    { key: "here-1", title: "Name It", description: "Name the place at a marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "find-2", title: "Map Champion", description: "Read the map both ways.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "What did you learn about reading a map?",
    options: ["A map shows places from above", "I can find a place by its label", "I can name the place at a spot"],
  },
  practisedSkills: ["Read a 2D map both ways", "Locate and name places", "Work independently"],
  nextUpLabel: "Week 5 Voyage Quiz",
  createTaskSet: createMapReadingChallengeTaskSet,
} satisfies StarpathLessonContent;

// ── W6 · Positions on a Map ──────────────────────────────────────────────────
export const NEXT_TO_CONTENT = {
  missionBrief:
    "Places sit next to each other, left and right. Work out which place is next to another.",
  successCriteria: ["find the reference place", "look left and right", "name the place there"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Next To and Beside", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "relative-1", title: "Next To", description: "Find the place to the left or right.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-2", title: "Beside Check", description: "Find another place beside one.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-3", title: "Beside Master", description: "Reason about left and right.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find the place?",
    options: ["I found the first place", "I looked left and right", "I named the place there"],
  },
  practisedSkills: ["Use left and right", "Reason about beside", "Read positions on a map"],
  nextUpLabel: "Above and Below",
  createTaskSet: createNextToTaskSet,
} satisfies StarpathLessonContent;

export const ABOVE_BELOW_CONTENT = {
  missionBrief:
    "Places sit above and below each other too. Work out which place is above or below another.",
  successCriteria: ["find the reference place", "look up and down", "name the place there"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Above and Below", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "relative-1", title: "Above", description: "Find the place above another.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-2", title: "Below", description: "Find the place below another.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-3", title: "Up-Down Master", description: "Reason about above and below.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find the place?",
    options: ["I found the first place", "I looked up and down", "I named the place there"],
  },
  practisedSkills: ["Use above and below", "Reason about up and down", "Read positions on a map"],
  nextUpLabel: "Position Challenge",
  createTaskSet: createAboveBelowTaskSet,
} satisfies StarpathLessonContent;

export const POSITION_DETECTIVE_CONTENT = {
  missionBrief:
    "Be a Position Detective. Use two clues together — the place must match both — to find the one place they point to.",
  successCriteria: ["read both clues", "use them together", "find the one place"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Position Detective", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "clues-1", title: "Two Clues", description: "Use two clues to find one place.", taskKinds: ["starpathMapLocate"] },
    { key: "clues-2", title: "Detective Check", description: "Match both clues to a place.", taskKinds: ["starpathMapLocate"] },
    { key: "clues-3", title: "Master Detective", description: "Solve a two-clue position puzzle.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find the place?",
    options: ["I used the first clue", "I used the second clue too", "I found the place that fit both"],
  },
  practisedSkills: ["Combine two position clues", "Narrow down to one place", "Reason about position"],
  nextUpLabel: "Week 6 Voyage Quiz",
  createTaskSet: createPositionDetectiveTaskSet,
} satisfies StarpathLessonContent;
