import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";
import type { PracticeTask, StarpathObjectSceneItem } from "@/data/activities/year1/practice-task";
import { getL3Object, l3ObjectSvg, type L3ObjectId } from "./l3-objects";

type Facing = "N" | "E" | "S" | "W";
type Relation = "above" | "below" | "leftOf" | "rightOf";

const FEEDBACK = { correct: "Answer recorded.", wrong: "Check the spatial information and try again." } as const;
const SYMBOLS = ["star", "crescent", "diamond", "triangle", "square", "circle"] as const;
const OBJECT_IDS: L3ObjectId[] = ["cube", "sphere", "cylinder", "cone", "prism", "pyramid"];

const QUIZ_MAP = [
  { id: "solar-lab", label: "Solar Lab", object: "satellite", r: 0, c: 1 },
  { id: "comet-camp", label: "Comet Camp", object: "cave", r: 0, c: 5 },
  { id: "lunar-dome", label: "Lunar Dome", object: "planet", r: 1, c: 5 },
  { id: "signal-tower", label: "Signal Tower", object: "flag", r: 2, c: 5 },
  { id: "rover-bay", label: "Rover Bay", object: "rover", r: 3, c: 1 },
  { id: "star-garden", label: "Star Garden", object: "star", r: 3, c: 5 },
] as const;

const CREATE_LANDMARKS = [
  { id: "workshop", label: "Workshop", object: "satellite", symbol: "W" },
  { id: "launchpad", label: "Launchpad", object: "rocket", symbol: "L" },
  { id: "garden", label: "Moon Garden", object: "star", symbol: "G" },
  { id: "shelter", label: "Shelter", object: "cave", symbol: "S" },
] as const;

function scene(id: L3ObjectId): StarpathObjectSceneItem {
  const object = getL3Object(id);
  return { id, label: object.label, spaceName: object.spaceName, svg: l3ObjectSvg(object, { size: 120 }) };
}

function rotate<T>(items: readonly T[], amount: number): T[] {
  const shift = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function objectName(index: number, target: number): PracticeTask {
  const id = OBJECT_IDS[index % OBJECT_IDS.length]!;
  const object = getL3Object(id);
  const alternatives = rotate(OBJECT_IDS.filter((candidate) => candidate !== id), index).slice(0, 2);
  return {
    kind: "starpathObject", mode: "name", target,
    prompt: `Name this object with ${object.faceDescription}.`,
    speakText: `Name the object. It has ${object.faceDescription}.`,
    scene: [scene(id)],
    options: rotate([{ id, label: object.label }, ...alternatives.map((candidate) => ({ id: candidate, label: getL3Object(candidate).label }))], index),
    correctOptionId: id, feedback: FEEDBACK,
  };
}

const FEATURE_CLUES = [
  { text: "two flat faces, one curved surface and no vertices", answer: "cylinder" },
  { text: "five flat faces, eight edges and five vertices", answer: "pyramid" },
  { text: "one curved surface and no flat faces, edges or vertices", answer: "sphere" },
  { text: "one flat face, one curved surface and one vertex", answer: "cone" },
  { text: "six flat faces, twelve edges and eight vertices", answer: "cube" },
] as const;

function objectFeature(index: number, target: number): PracticeTask {
  const clue = FEATURE_CLUES[index % FEATURE_CLUES.length]!;
  const answer = clue.answer as L3ObjectId;
  const distractors = rotate(OBJECT_IDS.filter((id) => id !== answer), index).slice(0, 3);
  return {
    kind: "starpathObject", mode: "find", target,
    prompt: `Tap the object with ${clue.text}.`, speakText: `Tap the object with ${clue.text}.`,
    scene: rotate([scene(answer), ...distractors.map(scene)], index + 1), correctObjectId: answer, feedback: FEEDBACK,
  };
}

const COMPARISONS = [
  { ids: ["sphere", "cylinder"], prompt: "How are these objects different?", correct: "Only the cylinder has flat faces", wrong: ["Both have vertices", "Only the sphere has edges"] },
  { ids: ["cube", "prism"], prompt: "What feature do both objects share?", correct: "Both have 12 edges and 8 vertices", wrong: ["Both have a curved surface", "Both have 5 faces"] },
  { ids: ["cone", "pyramid"], prompt: "What feature do both objects share?", correct: "Both have a vertex", wrong: ["Both have no edges", "Both have a curved surface"] },
  { ids: ["cylinder", "cone"], prompt: "How are these objects different?", correct: "Only the cone has a vertex", wrong: ["Only the cylinder is curved", "Both have 8 vertices"] },
  { ids: ["cube", "pyramid"], prompt: "How are these objects different?", correct: "They have different numbers of faces", wrong: ["Only the cube has edges", "Both have 8 vertices"] },
] as const;

function objectCompare(index: number, target: number): PracticeTask {
  const item = COMPARISONS[index % COMPARISONS.length]!;
  return {
    kind: "starpathObject", mode: "compare", target, prompt: item.prompt, speakText: item.prompt,
    scene: item.ids.map((id) => scene(id as L3ObjectId)),
    options: rotate([{ id: "answer", label: item.correct }, ...item.wrong.map((label, i) => ({ id: `wrong-${i}`, label }))], index),
    correctOptionId: "answer", feedback: FEEDBACK,
  };
}

function objectClassify(index: number, target: number, context: "detective" | "engineering" = "detective"): PracticeTask {
  const rules = [
    { a: "Has a curved surface", b: "Flat faces only", group: (id: L3ObjectId) => getL3Object(id).curvedSurfaces > 0 },
    { a: "Has vertices", b: "No vertices", group: (id: L3ObjectId) => getL3Object(id).vertices > 0 },
    { a: "Eight or more edges", b: "Fewer than eight edges", group: (id: L3ObjectId) => getL3Object(id).edges >= 8 },
    { a: "Has a flat face", b: "No flat faces", group: (id: L3ObjectId) => getL3Object(id).flatFaces > 0 },
    { a: "Has one or more vertices", b: "Has no vertices", group: (id: L3ObjectId) => getL3Object(id).vertices > 0 },
  ];
  const rule = rules[index % rules.length]!;
  const ids = rotate(OBJECT_IDS, index);
  const prompt = context === "engineering"
    ? `Sort the construction pieces: ${rule.a} or ${rule.b}.`
    : `Sort the objects: ${rule.a} or ${rule.b}.`;
  return {
    kind: "starpathObject", mode: "classify", target,
    prompt,
    speakText: context === "engineering"
      ? `Sort every construction piece into ${rule.a}, or ${rule.b}.`
      : `Sort every object into ${rule.a}, or ${rule.b}.`,
    scene: ids.map(scene), groups: [{ id: "a", label: rule.a, speakText: rule.a }, { id: "b", label: rule.b, speakText: rule.b }],
    assignments: Object.fromEntries(ids.map((id) => [id, rule.group(id) ? "a" : "b"])), feedback: FEEDBACK,
  };
}

const JOBS = [
  { job: "a wheel that rolls forward and stays on an axle", answer: "cylinder" },
  { job: "a storage block that stacks without rolling", answer: "cube" },
  { job: "a marker whose flat triangular faces meet at one top vertex", answer: "pyramid" },
  { job: "a nose piece that ends at one point", answer: "cone" },
  { job: "a signal globe that looks round from every direction", answer: "sphere" },
] as const;

function objectJob(index: number, target: number, context: "engineering" | "mission" = "engineering"): PracticeTask {
  const item = JOBS[index % JOBS.length]!;
  const answer = item.answer as L3ObjectId;
  const distractors = rotate(OBJECT_IDS.filter((id) => id !== answer), index).slice(0, 2);
  const prompt = context === "mission"
    ? `Choose the object the rescue crew needs for ${item.job}.`
    : `Choose the best object for ${item.job}.`;
  return {
    kind: "starpathObject", mode: "find", target,
    prompt, speakText: prompt,
    scene: rotate([scene(answer), ...distractors.map(scene)], index), correctObjectId: answer, feedback: FEEDBACK,
  };
}

function objectReason(index: number, target: number): PracticeTask {
  const item = JOBS[index % JOBS.length]!;
  const object = getL3Object(item.answer as L3ObjectId);
  return {
    kind: "starpathObject", mode: "name", target,
    prompt: `Why does the ${object.label.toLowerCase()} suit ${item.job}?`,
    speakText: `Why does the ${object.label.toLowerCase()} suit ${item.job}?`, scene: [scene(object.id)],
    options: rotate([
      { id: "answer", label: `Its faces, surfaces, edges or vertices suit that job` },
      { id: "colour", label: "Its colour makes it suitable" },
      { id: "size", label: "It is always the largest object" },
    ], index), correctOptionId: "answer", feedback: FEEDBACK,
  };
}

function mapLegend() {
  return QUIZ_MAP.map((landmark, index) => ({ symbol: SYMBOLS[index]!, landmarkId: landmark.id, label: landmark.label }));
}

function mapOptions(answerId: string, index: number) {
  const answer = QUIZ_MAP.find((landmark) => landmark.id === answerId);
  if (!answer) throw new Error(`Unknown Level 3 quiz landmark: ${answerId}`);
  const alternatives = rotate(QUIZ_MAP.filter((landmark) => landmark.id !== answerId), index).slice(0, 3);
  return rotate([answer, ...alternatives], index).map((landmark) => ({ id: landmark.id, label: landmark.label }));
}

function mapSymbol(index: number, target: number): PracticeTask {
  const legend = mapLegend();
  const wanted = legend[index % legend.length]!;
  return {
    kind: "starpathMapLocate", mode: "symbol", target, mapId: `quiz-symbol-${index}`, cols: 8, rows: 4,
    prompt: `Use the key. Which place uses the ${wanted.symbol} symbol?`, speakText: `Use the map key. Which place uses the ${wanted.symbol} symbol?`,
    landmarks: [...QUIZ_MAP], legend, options: mapOptions(wanted.landmarkId, index),
    correctOptionId: wanted.landmarkId, feedback: FEEDBACK,
  };
}

function mapRelative(index: number, target: number): PracticeTask {
  const cases = [
    { prompt: "Which place is below Solar Lab?", answer: "rover-bay" },
    { prompt: "Which place is right of Rover Bay?", answer: "star-garden" },
    { prompt: "Which place is above Star Garden?", answer: "signal-tower" },
    { prompt: "Which place is left of Comet Camp?", answer: "solar-lab" },
    { prompt: "Which place is on the same row as Rover Bay?", answer: "star-garden" },
  ] as const;
  const item = cases[index % cases.length]!;
  const options = mapOptions(item.answer, index);
  return { kind: "starpathMapLocate", mode: "relative", target, mapId: `quiz-relative-${index}`, cols: 8, rows: 4, prompt: item.prompt, speakText: item.prompt, landmarks: [...QUIZ_MAP], legend: mapLegend(), options, correctOptionId: item.answer, feedback: FEEDBACK };
}

function mapClues(index: number, target: number): PracticeTask {
  const cases = [
    { answer: "lunar-dome", clues: ["It is below Comet Camp.", "It is above Signal Tower."] },
    { answer: "star-garden", clues: ["It is below Signal Tower.", "It is right of Rover Bay."] },
    { answer: "solar-lab", clues: ["It is above Rover Bay.", "It is left of Comet Camp."] },
    { answer: "signal-tower", clues: ["It is below Lunar Dome.", "It is above Star Garden."] },
    { answer: "rover-bay", clues: ["It is below Solar Lab.", "It is left of Star Garden."] },
  ] as const;
  const item = cases[index % cases.length]!;
  return { kind: "starpathMapLocate", mode: "clues", target, mapId: `quiz-clues-${index}`, cols: 8, rows: 4, prompt: "Which place matches both clues?", speakText: `Which place matches both clues? ${item.clues.join(" ")}`, landmarks: [...QUIZ_MAP], legend: mapLegend(), clues: [...item.clues], options: mapOptions(item.answer, index), correctOptionId: item.answer, feedback: FEEDBACK };
}

function mapCreate(index: number, target: number, count: 1 | 2 | 3): PracticeTask {
  const relations: Array<{ subjectId: string; relation: Relation; referenceId: string; text: string }> = [
    { subjectId: "workshop", relation: "above", referenceId: "launchpad", text: "The Workshop is above the Launchpad." },
    { subjectId: "garden", relation: "rightOf", referenceId: "launchpad", text: "The Moon Garden is right of the Launchpad." },
    { subjectId: "shelter", relation: "below", referenceId: "garden", text: "The Shelter is below the Moon Garden." },
  ];
  const shifted = rotate(relations, index).slice(0, count);
  const used = new Set(shifted.flatMap((constraint) => [constraint.subjectId, constraint.referenceId]));
  return { kind: "starpathMapCreate", target, mapId: `quiz-create-${count}-${index}`, cols: 8, rows: 4, prompt: count === 1 ? "Place the two landmarks to match the clue." : "Create a map that makes every clue true.", speakText: `Place every landmark. ${shifted.map((item) => item.text).join(" ")}`, landmarks: CREATE_LANDMARKS.filter((landmark) => used.has(landmark.id)), constraints: shifted, feedback: FEEDBACK };
}

const FACING_WORD: Record<Facing, string> = { N: "north", E: "east", S: "south", W: "west" };
const FACINGS: Facing[] = ["N", "E", "S", "W"];
function turn(facing: Facing, direction: "left" | "right"): Facing {
  return FACINGS[(FACINGS.indexOf(facing) + (direction === "right" ? 1 : 3)) % 4]!;
}

function steerHeading(index: number, target: number): PracticeTask {
  const start = FACINGS[index % 4]!;
  const turns = index % 2 ? ["left", "right", "left"] as const : ["right", "right"] as const;
  const answer = turns.reduce((facing, direction) => turn(facing, direction), start);
  return { kind: "starpathSteer", mode: "heading", target, mapId: `quiz-heading-${index}`, cols: 8, rows: 4, landmarks: [...QUIZ_MAP], object: "rover", start: { r: 2, c: 2, facing: start }, turns: [...turns], prompt: `The rover faces ${FACING_WORD[start]}. Track the turns. Which way does it face now?`, speakText: `The rover faces ${FACING_WORD[start]}. It turns ${turns.join(", then ")}. Which way does it face now?`, options: rotate(FACINGS.map((id) => ({ id, label: FACING_WORD[id] })), index), correctOptionId: answer, feedback: FEEDBACK };
}

function steerFirst(index: number, target: number): PracticeTask {
  const facing = FACINGS[index % 4]!;
  const correct = index % 3 === 0 ? "forward" : index % 3 === 1 ? "left" : "right";
  const label = correct === "forward" ? "straight ahead" : `on the rover's ${correct}`;
  const targetFacing = correct === "forward" ? facing : turn(facing, correct);
  const delta: Record<Facing, { r: number; c: number }> = {
    N: { r: -1, c: 0 }, E: { r: 0, c: 1 }, S: { r: 1, c: 0 }, W: { r: 0, c: -1 },
  };
  const start = { r: 2, c: 3, facing };
  const move = delta[targetFacing];
  return { kind: "starpathSteer", mode: "firstMove", target, mapId: `quiz-first-${index}`, cols: 8, rows: 4, landmarks: [...QUIZ_MAP], object: "rover", start, goal: { r: start.r + move.r, c: start.c + move.c, object: "star", label: "Target Beacon" }, prompt: `The target is ${label}. What should the rover do first?`, speakText: `The rover faces ${FACING_WORD[facing]}. The target is ${label}. What should it do first?`, options: rotate([{ id: "left", label: "Turn left" }, { id: "forward", label: "Go forward" }, { id: "right", label: "Turn right" }], index), correctOptionId: correct, feedback: FEEDBACK };
}

function steerDrive(index: number, target: number): PracticeTask {
  const starts = [{ r: 3, c: 6, facing: "W" }, { r: 0, c: 7, facing: "S" }, { r: 3, c: 7, facing: "N" }, { r: 0, c: 0, facing: "E" }] as const;
  const goals = QUIZ_MAP.filter((landmark) => landmark.id === "lunar-dome" || landmark.id === "star-garden" || landmark.id === "signal-tower" || landmark.id === "solar-lab");
  const start = starts[index % starts.length]!;
  const goal = goals[index % goals.length]!;
  return { kind: "starpathSteer", mode: "drive", target, mapId: `quiz-drive-${index}`, cols: 8, rows: 4, landmarks: [...QUIZ_MAP], object: "rover", start: { ...start }, goal: { r: goal.r, c: goal.c, object: goal.object, label: goal.label }, palette: ["left", "right", "forward"], maxSteps: 14, prompt: `Drive the rover to ${goal.label}.`, speakText: `Drive the rover to ${goal.label}. Turn to change direction, then move forward.`, feedback: FEEDBACK };
}

function routeGive(index: number, target: number): PracticeTask {
  const goals = [QUIZ_MAP[0]!, QUIZ_MAP[2]!, QUIZ_MAP[3]!, QUIZ_MAP[4]!, QUIZ_MAP[5]!];
  const goal = goals[index % goals.length]!;
  return { kind: "starpathMapRoute", mode: "give", target, mapId: `quiz-route-${index}`, cols: 8, rows: 4, landmarks: [...QUIZ_MAP], object: "rover", start: { r: 2, c: 2 }, goal: { r: goal.r, c: goal.c, object: goal.object, label: goal.label }, palette: ["up", "down", "left", "right"], maxSteps: 12, prompt: `Write a route from Mission Start to ${goal.label}.`, speakText: `Use the arrow commands to write a route from Mission Start to ${goal.label}.`, feedback: FEEDBACK };
}

function section(factory: (index: number, target: number) => PracticeTask, offset: number): PracticeTask[] {
  return Array.from({ length: 5 }, (_, index) => factory(index, offset + index + 1));
}

function quiz(label: string, a: PracticeTask[], b: PracticeTask[], c: PracticeTask[]): PracticeTask[] {
  return assertWeeklyQuizQuestionCount([...a, ...b, ...c], label);
}

export const buildLevelThreeWeek1IndependentQuiz = () => quiz("Starpath Level 3 Week 1", section(objectName, 0), section(objectFeature, 5), section(objectCompare, 10));
export const buildLevelThreeWeek2IndependentQuiz = () => quiz("Starpath Level 3 Week 2", section(objectFeature, 0), section(objectCompare, 5), section(objectClassify, 10));
export const buildLevelThreeWeek3IndependentQuiz = () => quiz("Starpath Level 3 Week 3", section(objectJob, 0), section(objectReason, 5), section((i, t) => objectClassify(i, t, "engineering"), 10));
export const buildLevelThreeWeek4IndependentQuiz = () => quiz("Starpath Level 3 Week 4", section(mapSymbol, 0), section(mapRelative, 5), section(mapClues, 10));
export const buildLevelThreeWeek5IndependentQuiz = () => quiz("Starpath Level 3 Week 5", section((i, t) => mapCreate(i, t, 1), 0), section((i, t) => mapCreate(i, t, 2), 5), section((i, t) => mapCreate(i, t, 3), 10));
export const buildLevelThreeWeek6IndependentQuiz = () => quiz("Starpath Level 3 Week 6", section(steerHeading, 0), section(steerFirst, 5), section(steerDrive, 10));
export const buildLevelThreeWeek7IndependentQuiz = () => quiz("Starpath Level 3 Week 7", section((i, t) => objectJob(i, t, "mission"), 0), section((i, t) => mapCreate(i + 5, t, 2), 5), section(routeGive, 10));

export function buildLevelThreeIndependentWeeklyQuiz(week: number): PracticeTask[] {
  const builders = [buildLevelThreeWeek1IndependentQuiz, buildLevelThreeWeek2IndependentQuiz, buildLevelThreeWeek3IndependentQuiz, buildLevelThreeWeek4IndependentQuiz, buildLevelThreeWeek5IndependentQuiz, buildLevelThreeWeek6IndependentQuiz, buildLevelThreeWeek7IndependentQuiz];
  const build = builders[week - 1];
  if (!build) throw new Error(`Starpath Level 3 has no weekly quiz for Week ${week}.`);
  return build();
}
