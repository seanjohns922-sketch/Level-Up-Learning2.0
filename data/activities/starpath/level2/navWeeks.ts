import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_TWO_ARTWORK, getStarMap, listStarMaps, mapLandmarks } from "./star-maps";

// Level 2 · Week 7 — Pathways on the star map (AC9M2SP02). Follow a path to a
// named place, plan a route that obeys mission rules (visit a checkpoint, dodge
// the asteroids), then test a route and find the broken step. This lifts the
// Year-2 map work to the planning + debugging demand Year 1 reached on a plain
// grid, now on the labelled 2D map.

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
  const goalLm = landmarks.filter((l) => !(l.r === start.r && l.c === start.c))[round % Math.max(1, landmarks.length)]
    ?? landmarks[0]!;
  return { map, landmarks, start, goalLm };
}

function lm(map: ReturnType<typeof getStarMap>, id: string) {
  return mapLandmarks(map).find((l) => l.id === id)!;
}

// ── L1 · Follow the Path — read and execute a given set of directions ─────────
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

// ── L2 · Plan a Mission — build a route that obeys rules (checkpoint + hazards) ─
type MissionSpec = {
  mapId: string;
  goalId: string;
  checkpointId: string;
  blocked: Array<{ r: number; c: number }>;
  rule: string;
};
const MISSIONS: MissionSpec[] = [
  { mapId: "sector-1", goalId: "nebula-station", checkpointId: "constellation-crossing", blocked: [{ r: 3, c: 3 }, { r: 2, c: 4 }], rule: "Visit Constellation Crossing, dodge the asteroids, then reach Nebula Station." },
  { mapId: "sector-2", goalId: "flag-point", checkpointId: "moon-maze", blocked: [{ r: 2, c: 3 }, { r: 1, c: 4 }], rule: "Collect Moon Maze, dodge the asteroids, then reach Flag Point." },
  { mapId: "sector-3", goalId: "crystal-caves", checkpointId: "planet-plaza", blocked: [{ r: 2, c: 4 }, { r: 3, c: 4 }], rule: "Find Planet Plaza, dodge the asteroids, then reach Crystal Caves." },
];

export function missionMapTask(round: number, target: number): PracticeTask {
  const spec = MISSIONS[round % MISSIONS.length]!;
  const map = getStarMap(spec.mapId);
  const landmarks = mapLandmarks(map);
  const start = { r: map.rows - 1, c: 0 };
  const goalLm = lm(map, spec.goalId);
  const cp = lm(map, spec.checkpointId);
  return {
    kind: "starpathMapRoute",
    mode: "mission",
    prompt: `Plan a mission route to ${goalLm.label}.`,
    speakText: `Plan a route. ${spec.rule} Build the moves, then run it.`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    object: "rover",
    start,
    goal: { r: goalLm.r, c: goalLm.c, object: goalLm.object, label: goalLm.label },
    palette: ["up", "down", "left", "right"],
    maxSteps: 16,
    blocked: spec.blocked,
    checkpoints: [{ r: cp.r, c: cp.c, object: cp.object, label: cp.label }],
    missionRule: spec.rule,
    singleAttempt: false,
    feedback: { correct: `Mission complete — you reached ${goalLm.label}!`, wrong: "Check the rule: visit the checkpoint, avoid the asteroids, reach the goal." },
  };
}

// ── L3 · Test & Fix — a route with one wrong step; find which one breaks it ────
type DebugSpec = { mapId: string; goalId: string; steps: Dir[]; corruptIndex: number; corruptDir: Dir };
const DEBUGS: DebugSpec[] = [
  { mapId: "sector-1", goalId: "nebula-station", steps: ["up", "up", "right", "right", "right", "right", "right"], corruptIndex: 3, corruptDir: "down" },
  { mapId: "sector-2", goalId: "flag-point", steps: ["up", "up", "up", "right", "right", "right", "right"], corruptIndex: 4, corruptDir: "down" },
  { mapId: "sector-3", goalId: "alien-outpost", steps: ["up", "up", "up", "right", "right", "right", "right"], corruptIndex: 3, corruptDir: "down" },
];

export function debugMapTask(round: number, target: number): PracticeTask {
  const spec = DEBUGS[round % DEBUGS.length]!;
  const map = getStarMap(spec.mapId);
  const landmarks = mapLandmarks(map);
  const start = { r: map.rows - 1, c: 0 };
  const goalLm = lm(map, spec.goalId);
  const debugSteps = spec.steps.map((direction, index) => ({
    id: `dstep-${target}-${index}`,
    direction: index === spec.corruptIndex ? spec.corruptDir : direction,
  }));
  return {
    kind: "starpathMapRoute",
    mode: "debug",
    prompt: `This route should reach ${goalLm.label}, but one step is wrong. Which step?`,
    speakText: `Follow the steps from the rover. One step goes the wrong way. Tap the step that breaks the route.`,
    target,
    mapId: map.id,
    cols: map.cols,
    rows: map.rows,
    landmarks,
    object: "rover",
    start,
    goal: { r: goalLm.r, c: goalLm.c, object: goalLm.object, label: goalLm.label },
    debugSteps,
    wrongStepId: `dstep-${target}-${spec.corruptIndex}`,
    feedback: { correct: "You found the broken step!", wrong: "Follow each step from the rover and find the one heading the wrong way." },
  };
}

function teaching(variant: "mapRoute" | "mapMission" | "mapDebug", heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant, heading, prompt, speakText, target: ++target }) satisfies PracticeTask;
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
  set([followMapTask, followMapTask, followMapTask], teaching("mapRoute", "Follow the Path", "Follow directions across the map.", "Follow each direction to move the rover along the path to the place."));
export const createPlanAMissionTaskSet = (): RealmLessonTaskSet =>
  set([missionMapTask, missionMapTask, missionMapTask], teaching("mapMission", "Plan a Mission", "Plan a route that follows the rules.", "Plan a route that visits the checkpoint, avoids the asteroids, and reaches the goal. Build the moves, then run it."));
export const createTestAndFixTaskSet = (): RealmLessonTaskSet =>
  set([debugMapTask, debugMapTask, debugMapTask], teaching("mapDebug", "Test and Fix", "Find the step that breaks the route.", "A route to the place has one wrong step. Follow it from the rover and tap the step that heads the wrong way."));

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

export const FOLLOW_THE_PATH_CONTENT = content("Follow the Path", "Follow the directions to move the rover along the path to each place on the map.", ["read each direction", "move the rover", "reach the place"], ["Follow the Path", "Path Check", "Path Master"], "How did you follow the path?", ["I read each direction", "I moved one step at a time", "I reached the place"], ["Follow a map path", "Move step by step", "Reach a place"], "Plan a Mission", "starpathMapRoute", createFollowThePathTaskSet);
export const PLAN_A_MISSION_CONTENT = content("Plan a Mission", "Plan your own route that visits the checkpoint, dodges the asteroids and reaches the goal, then run it to test it.", ["visit the checkpoint", "avoid the asteroids", "reach the goal"], ["Plan a Mission", "Mission Check", "Mission Master"], "How did you plan your route?", ["I visited the checkpoint first", "I steered around the asteroids", "I ran it to test it"], ["Plan a route with rules", "Avoid obstacles", "Reach a goal in order"], "Test and Fix", "starpathMapRoute", createPlanAMissionTaskSet);
export const TEST_AND_FIX_CONTENT = content("Test and Fix", "A route to the place has one wrong step. Follow it from the rover and find the step that breaks it.", ["follow the steps in order", "spot the wrong turn", "find the broken step"], ["Test and Fix", "Fault Finder", "Route Mechanic"], "How did you find the broken step?", ["I followed each step from the rover", "I found where it went the wrong way", "I checked every step"], ["Test a route", "Find an error", "Debug a pathway"], "Week 7 Voyage Quiz", "starpathMapRoute", createTestAndFixTaskSet);
