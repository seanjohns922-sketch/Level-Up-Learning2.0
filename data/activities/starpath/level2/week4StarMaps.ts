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

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "mapLocate",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createReadingAMapTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
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

export function createFindThePlanetTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Find the Planet",
      "Every place has its own spot on the map.",
      "Each place sits in its own square on the map. Find the place, and say what is at a marked spot."
    ),
    activities: [
      () => whatIsHereTask(a++, ++target),
      () => findTask(b++ + 2, ++target),
      () => whatIsHereTask(c++ + 1, ++target),
    ],
  };
}

export function createMapExplorerTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Map Explorer",
      "Places on a map have positions next to each other.",
      "Explore the map. Find places, name what is at a spot, and work out which place is next to another."
    ),
    activities: [
      () => relativeTask(a++, ++target),
      () => whatIsHereTask(b++ + 2, ++target),
      () => relativeTask(c++ + 1, ++target),
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
  nextUpLabel: "Find the Planet",
  createTaskSet: createReadingAMapTaskSet,
} satisfies StarpathLessonContent;

export const FIND_THE_PLANET_CONTENT = {
  missionBrief:
    "Locate places on the star map. Say what sits at a marked spot, and find places by name.",
  successCriteria: ["read a marked spot", "name the place there", "find places by name"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Find the Planet", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "here-1", title: "What Is Here?", description: "Name what is at a marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "find-1", title: "Find It", description: "Find a place by name.", taskKinds: ["starpathMapLocate"] },
    { key: "here-2", title: "Spot Master", description: "Name spots independently.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "How did you name a spot?",
    options: ["I read the label at the square", "I matched the spot to a place", "I looked carefully at the map"],
  },
  practisedSkills: ["Locate positions on a map", "Name a marked position", "Find places by name"],
  nextUpLabel: "Map Explorer",
  createTaskSet: createFindThePlanetTaskSet,
} satisfies StarpathLessonContent;

export const MAP_EXPLORER_CONTENT = {
  missionBrief:
    "Explore Sector by Sector. Find places, name what is at a spot, and work out which place is next to another.",
  successCriteria: ["read positions on a map", "compare landmark positions", "reason about the map"],
  artworkSrc: LEVEL_TWO_ARTWORK,
  teaching: { title: "Map Explorer", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "relative-1", title: "Next To", description: "Find the place next to another.", taskKinds: ["starpathMapLocate"] },
    { key: "here-1", title: "Spot Check", description: "Name a marked spot.", taskKinds: ["starpathMapLocate"] },
    { key: "relative-2", title: "Explorer Master", description: "Reason about positions.", taskKinds: ["starpathMapLocate"] },
  ],
  reflection: {
    prompt: "What did you learn about the map?",
    options: ["Places have positions next to each other", "I can say what is above or beside a place", "A map shows where everything is"],
  },
  practisedSkills: ["Reason about relative position", "Read a map", "Compare landmark positions"],
  nextUpLabel: "Week 4 Voyage Quiz",
  createTaskSet: createMapExplorerTaskSet,
} satisfies StarpathLessonContent;
