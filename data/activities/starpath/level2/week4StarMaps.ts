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

// L3 — Reason about one landmark's position relative to another.
export function relativeTask(round: number, target: number): PracticeTask {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map);
  // Find an aligned pair (same row -> left/right, same column -> above/below).
  type Rel = keyof typeof RELATION_WORD;
  const pairs: Array<{ ref: (typeof landmarks)[number]; answer: (typeof landmarks)[number]; rel: Rel }> = [];
  for (const a of landmarks) {
    for (const b of landmarks) {
      if (a.id === b.id) continue;
      if (a.r === b.r) pairs.push({ ref: a, answer: b, rel: b.c > a.c ? "right" : "left" });
      else if (a.c === b.c) pairs.push({ ref: a, answer: b, rel: b.r > a.r ? "below" : "above" });
    }
  }
  if (pairs.length === 0) return whatIsHereTask(round, target);
  const pick = pairs[round % pairs.length]!;
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

// ── W5 · Reading a Map — locate named places on the star map ─────────────────
export function createReadingAMapTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapLocate",
      "Reading a Space Map",
      "A star map shows where places are.",
      "A star map is a picture from above that shows where places are. Find each place by reading its label."
    ),
    activities: [
      () => findTask(a++, ++target),
      () => findTask(b++ + 1, ++target),
      () => findTask(c++ + 2, ++target),
    ],
  };
}

export function createFindThePlaceTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapLocate",
      "Find the Place",
      "Every place has its own spot on the map.",
      "Each place sits in its own square on the map. Read the label and find each place on the map."
    ),
    activities: [
      () => findTask(a++ + 3, ++target),
      () => findTask(b++ + 4, ++target),
      () => findTask(c++ + 5, ++target),
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
      "Show what you know about reading the map.",
      "Find each place on the star map on your own."
    ),
    activities: [
      () => findTask(a++ + 6, ++target),
      () => findTask(b++ + 7, ++target),
      () => findTask(c++ + 8, ++target),
    ],
  };
}

// ── W6 · Positions on a Map — name what is here and what is next to what ──────
export function createWhatIsHereTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "What Is Here?",
      "Each spot on the map has a place.",
      "Look at the marked spot on the map and say which place is there."
    ),
    activities: [
      () => whatIsHereTask(a++, ++target),
      () => whatIsHereTask(b++ + 1, ++target),
      () => whatIsHereTask(c++ + 2, ++target),
    ],
  };
}

export function createNextToTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "Next To and Nearby",
      "Places sit next to, above and below each other.",
      "Use the map to work out which place is next to, above or below another place."
    ),
    activities: [
      () => relativeTask(a++, ++target),
      () => relativeTask(b++ + 1, ++target),
      () => relativeTask(c++ + 2, ++target),
    ],
  };
}

export function createPositionChallengeTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "mapPositions",
      "Position Challenge",
      "Show what you know about positions on the map.",
      "Name what is at a spot, and work out which place is next to another."
    ),
    activities: [
      () => whatIsHereTask(a++ + 1, ++target),
      () => relativeTask(b++, ++target),
      () => relativeTask(c++ + 2, ++target),
    ],
  };
}

export const READING_A_MAP_CONTENT = {
  missionBrief:
    "Welcome, Space Mapper. A star map shows Starpath from above. Read the labels and find each place on the map.",
  successCriteria: ["read a star map", "find a named place", "use the map labels"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Reading a Space Map", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Read the Map", description: "Find a named place on the map.", taskKinds: ["starpathMapLocate"] },
    { key: "find-2", title: "Map Check", description: "Find another place.", taskKinds: ["starpathMapLocate"] },
    { key: "find-3", title: "Map Master", description: "Find places independently.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find a place?",
    options: ["I read the map labels", "I looked from above", "I found its square"],
  },
  practisedSkills: ["Read a 2D map", "Locate a named place", "Use map labels"],
  nextUpLabel: "Find the Place",
  createTaskSet: createReadingAMapTaskSet,
} satisfies StarpathLessonContent;

export const FIND_THE_PLACE_CONTENT = {
  missionBrief:
    "Every place has its own square on the star map. Read the labels and find each place by name.",
  successCriteria: ["read the map labels", "find a place by name", "locate places quickly"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Find the Place", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Find the Place", description: "Find a place by name.", taskKinds: ["starpathMapLocate"] },
    { key: "find-2", title: "Find Another", description: "Find the next place.", taskKinds: ["starpathMapLocate"] },
    { key: "find-3", title: "Place Finder", description: "Find places quickly.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find each place?",
    options: ["I read the labels", "I looked square by square", "I found it by name"],
  },
  practisedSkills: ["Locate a named place", "Read map labels", "Find places quickly"],
  nextUpLabel: "Map Reading Challenge",
  createTaskSet: createFindThePlaceTaskSet,
} satisfies StarpathLessonContent;

export const MAP_READING_CHALLENGE_CONTENT = {
  missionBrief:
    "Mixed review — find each place on the star map on your own.",
  successCriteria: ["read the map", "find places independently", "answer on your own"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Map Reading Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-1", title: "Map Quiz", description: "Find a place on the map.", taskKinds: ["starpathMapLocate"] },
    { key: "find-2", title: "Map Hunt", description: "Find another place.", taskKinds: ["starpathMapLocate"] },
    { key: "find-3", title: "Map Champion", description: "Find places independently.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "What did you learn about reading a map?",
    options: ["A map shows places from above", "I can find a place by its label", "Every place has its own square"],
  },
  practisedSkills: ["Read a 2D map", "Locate named places", "Work independently"],
  nextUpLabel: "Week 5 Voyage Quiz",
  createTaskSet: createMapReadingChallengeTaskSet,
} satisfies StarpathLessonContent;

// ── W6 · Positions on a Map ──────────────────────────────────────────────────
export const WHAT_IS_HERE_CONTENT = {
  missionBrief:
    "Each spot on the star map has a place. Look at a marked spot and say which place is there.",
  successCriteria: ["read a marked spot", "name the place there", "use the map labels"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "What Is Here?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "here-1", title: "What Is Here?", description: "Name what is at a marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "here-2", title: "Spot Check", description: "Name another marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "here-3", title: "Spot Master", description: "Name spots independently.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you name a spot?",
    options: ["I read the label at the square", "I matched the spot to a place", "I looked carefully at the map"],
  },
  practisedSkills: ["Name a marked position", "Read a spot on a map", "Use map labels"],
  nextUpLabel: "Next To and Nearby",
  createTaskSet: createWhatIsHereTaskSet,
} satisfies StarpathLessonContent;

export const NEXT_TO_CONTENT = {
  missionBrief:
    "Places sit next to, above and below each other. Work out which place is next to another.",
  successCriteria: ["find the reference place", "look next to it", "name the place there"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Next To and Nearby", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "relative-1", title: "Next To", description: "Find the place next to another.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-2", title: "Above and Below", description: "Find the place above or below another.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-3", title: "Nearby Master", description: "Reason about nearby places.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you find the place?",
    options: ["I found the first place", "I looked next to it", "I named the place there"],
  },
  practisedSkills: ["Reason about relative position", "Use above, below and beside", "Compare positions"],
  nextUpLabel: "Position Challenge",
  createTaskSet: createNextToTaskSet,
} satisfies StarpathLessonContent;

export const POSITION_CHALLENGE_CONTENT = {
  missionBrief:
    "Mixed review — name what is at a spot and work out which place is next to another.",
  successCriteria: ["name a spot", "reason about position", "answer on your own"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Position Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "here-1", title: "Position Quiz", description: "Name what is at a spot.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-1", title: "Position Hunt", description: "Find the place next to another.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-2", title: "Position Champion", description: "Reason about positions.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "What did you learn about positions?",
    options: ["Places have positions next to each other", "I can say what is above or beside a place", "A map shows where everything is"],
  },
  practisedSkills: ["Name a position", "Reason about relative position", "Work independently"],
  nextUpLabel: "Week 6 Voyage Quiz",
  createTaskSet: createPositionChallengeTaskSet,
} satisfies StarpathLessonContent;
