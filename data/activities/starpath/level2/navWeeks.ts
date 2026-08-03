import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_TWO_ARTWORK, getStarMap, listStarMaps, mapLandmarks } from "./star-maps";

// Level 2 · Week 7 — Pathways on the star map (AC9M2SP02). Follow a path to a
// named place, choose the first move, then give the full route yourself. Uses
// the starpathMapRoute mechanic so navigation happens on the labelled map.

type Dir = "up" | "down" | "left" | "right";
const WORD: Record<Dir, string> = { up: "up", down: "down", left: "left", right: "right" };
const MAP_IDS = listStarMaps().map((m) => m.id);

function pathTo(start: { r: number; c: number }, goal: { r: number; c: number }): Dir[] {
  const steps: Dir[] = [];
  let r = start.r;
  let c = start.c;
  while (r > goal.r) { steps.push("up"); r -= 1; }
  while (r < goal.r) { steps.push("down"); r += 1; }
  while (c > goal.c) { steps.push("left"); c -= 1; }
  while (c < goal.c) { steps.push("right"); c += 1; }
  return steps;
}

function scene(round: number) {
  const map = getStarMap(MAP_IDS[round % MAP_IDS.length]!);
  const landmarks = mapLandmarks(map);
  const start = { r: map.rows - 1, c: 0 };
  // Goal = a landmark that isn't sitting on the start cell.
  const goalLm = landmarks.filter((l) => !(l.r === start.r && l.c === start.c))[round % Math.max(1, landmarks.length)]
    ?? landmarks[0]!;
  return { map, landmarks, start, goalLm };
}

export function followMapTask(round: number, target: number): PracticeTask {
  const { map, landmarks, start, goalLm } = scene(round);
  const dirs = pathTo(start, goalLm);
  return {
    kind: "starpathMapRoute",
    mode: "follow",
    prompt: `Follow the path to ${goalLm.label}.`,
    speakText: `Follow the directions to move the rover to ${goalLm.label}.`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    object: "rover",
    start,
    goal: { r: goalLm.r, c: goalLm.c, object: goalLm.object, label: goalLm.label },
    steps: dirs.map((direction) => ({ direction, instruction: `Move ${WORD[direction]}.`, speakText: `Move the rover ${WORD[direction]}.` })),
    feedback: { correct: `You reached ${goalLm.label}.`, wrong: "Read the direction and tap the matching arrow." },
  };
}

export function chooseMapTask(round: number, target: number): PracticeTask {
  const { map, landmarks, start, goalLm } = scene(round);
  const dirs = pathTo(start, goalLm);
  const first = dirs[0] ?? "up";
  const all: Dir[] = ["up", "down", "left", "right"];
  return {
    kind: "starpathMapRoute",
    mode: "choose",
    prompt: `Which way should the rover move first to reach ${goalLm.label}?`,
    speakText: `The rover starts in the corner. Which way should it move first to head toward ${goalLm.label}?`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    object: "rover",
    start,
    goal: { r: goalLm.r, c: goalLm.c, object: goalLm.object, label: goalLm.label },
    options: all.map((direction) => ({ id: `dir-${direction}`, direction })),
    correctOptionId: `dir-${first}`,
    feedback: { correct: `Yes — ${WORD[first]} heads toward ${goalLm.label}.`, wrong: `Look where ${goalLm.label} is from the rover and choose the first move.` },
  };
}

export function giveMapTask(round: number, target: number): PracticeTask {
  const { map, landmarks, start, goalLm } = scene(round);
  const dirs = pathTo(start, goalLm);
  return {
    kind: "starpathMapRoute",
    mode: "give",
    prompt: `Give the rover a route to ${goalLm.label}.`,
    speakText: `Build a route to move the rover to ${goalLm.label}, then run it.`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    object: "rover",
    start,
    goal: { r: goalLm.r, c: goalLm.c, object: goalLm.object, label: goalLm.label },
    palette: ["up", "down", "left", "right"],
    maxSteps: Math.max(1, dirs.length),
    feedback: { correct: `Your route reached ${goalLm.label}.`, wrong: "The route did not reach the place. Adjust the moves and run again." },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant: "mapRoute", heading, prompt, speakText, target: ++target }) satisfies PracticeTask;
}

function set(gens: Array<(round: number, target: number) => PracticeTask>, teach: () => PracticeTask): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  const [g0, g1, g2] = gens;
  return {
    teaching: teach,
    activities: [
      () => g0!(a++, ++target),
      () => g1!(b++ + 1, ++target),
      () => g2!(c++ + 2, ++target),
    ],
  };
}

export const createFollowThePathTaskSet = (): RealmLessonTaskSet =>
  set([followMapTask, followMapTask, followMapTask], teaching("Follow the Path", "Follow directions across the map.", "Follow each direction to move the rover along the path to the place."));
export const createChooseTheRouteTaskSet = (): RealmLessonTaskSet =>
  set([chooseMapTask, chooseMapTask, chooseMapTask], teaching("Choose the Route", "Choose the first move.", "Look at where the place is, then choose the first move that heads toward it."));
export const createGiveARouteTaskSet = (): RealmLessonTaskSet =>
  set([giveMapTask, giveMapTask, giveMapTask], teaching("Give a Route", "Give the route yourself.", "Now you give the directions. Build a route to move the rover to the place, then run it."));

function content(title: string, brief: string, criteria: [string, string, string], acts: [string, string, string], reflectPrompt: string, reflectOpts: [string, string, string], skills: [string, string, string], nextUp: string, kind: string, createTaskSet: () => RealmLessonTaskSet): StarpathLessonContent {
  return {
    missionBrief: brief,
    successCriteria: criteria,
    artworkSrc: LEVEL_TWO_ARTWORK,
    teaching: { title, durationMinutes: 1, taskKind: "starpathShapeIntro" },
    activities: [
      { key: "a1", title: acts[0], description: acts[0], taskKinds: [kind] as ["starpathMapRoute"] },
      { key: "a2", title: acts[1], description: acts[1], taskKinds: [kind] as ["starpathMapRoute"] },
      { key: "a3", title: acts[2], description: acts[2], taskKinds: [kind] as ["starpathMapRoute"] },
    ],
    reflection: { prompt: reflectPrompt, options: reflectOpts },
    practisedSkills: skills,
    nextUpLabel: nextUp,
    createTaskSet,
  } satisfies StarpathLessonContent;
}

export const FOLLOW_THE_PATH_CONTENT = content("Follow the Path", "Follow the directions to move the rover along the path to each place on the map.", ["read each direction", "move the rover", "reach the place"], ["Follow the Path", "Path Check", "Path Master"], "How did you follow the path?", ["I read each direction", "I moved one step at a time", "I reached the place"], ["Follow a map path", "Move step by step", "Reach a place"], "Choose the Route", "starpathMapRoute", createFollowThePathTaskSet);
export const CHOOSE_THE_ROUTE_CONTENT = content("Choose the Route", "Look at where the place is and choose the first move that heads toward it.", ["see where the place is", "choose the first move", "head the right way"], ["Choose the Route", "Route Check", "Route Master"], "How did you choose?", ["I looked where the place was", "I chose the first move", "I headed the right way"], ["Choose a direction", "Read a map", "Plan a first move"], "Give a Route", "starpathMapRoute", createChooseTheRouteTaskSet);
export const GIVE_A_ROUTE_CONTENT = content("Give a Route", "Now you give the directions. Build a route to move the rover to the place, then run it.", ["choose moves in order", "run the route", "reach the place"], ["Give a Route", "Route Orders", "Route Master"], "How did you give the route?", ["I chose moves in order", "I ran it to test", "I reached the place"], ["Give a route", "Order moves", "Reach a place"], "Week 7 Voyage Quiz", "starpathMapRoute", createGiveARouteTaskSet);
