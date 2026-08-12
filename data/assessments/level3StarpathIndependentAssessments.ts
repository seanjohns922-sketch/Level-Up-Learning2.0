import type { PracticeTask, StarpathObjectSceneItem } from "@/data/activities/year1/practice-task";
import { getL3Object, l3ObjectSvg, type L3ObjectId } from "@/data/activities/starpath/level3/l3-objects";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9M3SP01" | "AC9M3SP02";
type Form = "pretest" | "posttest";
type CandidateQuestion = Question & IndependentAssessmentItem;
type AssessmentTask = Extract<PracticeTask, { kind: "starpathObject" | "starpathMapCreate" | "starpathMapRoute" }>;
type ResponseMode = "selected_response" | "manipulated_response";
type Misconception =
  | "object-feature-vocabulary"
  | "object-use-without-features"
  | "map-symbol-representation"
  | "map-viewpoint"
  | "map-relative-location"
  | "route-start-order";
type Relation = "above" | "below" | "leftOf" | "rightOf";

type ItemSpec = {
  descriptor: Descriptor;
  week: number;
  lesson: number;
  difficulty: AssessmentItemDifficulty;
  cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: ResponseMode;
  misconceptionTags: readonly Misconception[];
  misconceptionDiagnosis?: boolean;
  contextKey: string;
  structureKey: string;
  task: AssessmentTask;
};

const CORRECT_TOKEN = "__starpath_task_correct__";
const FEEDBACK = { correct: "Answer recorded.", wrong: "Answer recorded." } as const;
const OBJECT_IDS: L3ObjectId[] = ["cube", "sphere", "cylinder", "cone", "prism", "pyramid"];

function objectScene(id: L3ObjectId): StarpathObjectSceneItem {
  const object = getL3Object(id);
  return { id, label: object.label, spaceName: object.spaceName, svg: l3ObjectSvg(object, { size: 120 }) };
}

function compare(prompt: string, ids: L3ObjectId[], correct: string, distractors: string[]): AssessmentTask {
  return {
    kind: "starpathObject", mode: "compare", target: 1, prompt, speakText: prompt,
    scene: ids.map(objectScene),
    options: [{ id: "correct", label: correct }, ...distractors.map((label, index) => ({ id: `d${index}`, label }))],
    correctOptionId: "correct", feedback: FEEDBACK,
  };
}

function chooseObject(prompt: string, answer: L3ObjectId, distractors: L3ObjectId[]): AssessmentTask {
  return {
    kind: "starpathObject", mode: "find", target: 1, prompt, speakText: prompt,
    scene: [answer, ...distractors].map(objectScene), correctObjectId: answer, feedback: FEEDBACK,
  };
}

function classify(
  prompt: string,
  groupA: string,
  groupB: string,
  belongsInA: (id: L3ObjectId) => boolean,
  order: L3ObjectId[] = OBJECT_IDS,
): AssessmentTask {
  return {
    kind: "starpathObject", mode: "classify", target: 1, prompt, speakText: prompt,
    scene: order.map(objectScene),
    groups: [{ id: "a", label: groupA, speakText: groupA }, { id: "b", label: groupB, speakText: groupB }],
    assignments: Object.fromEntries(order.map((id) => [id, belongsInA(id) ? "a" : "b"])),
    feedback: FEEDBACK,
  };
}

type Landmark = { id: string; label: string; object: string; symbol: string };
type Constraint = { subjectId: string; relation: Relation; referenceId: string };

function mapCreate(mapId: string, prompt: string, landmarks: Landmark[], constraints: Constraint[]): AssessmentTask {
  const relationText: Record<Relation, string> = { above: "above", below: "below", leftOf: "left of", rightOf: "right of" };
  const labels = new Map(landmarks.map((landmark) => [landmark.id, landmark.label]));
  return {
    kind: "starpathMapCreate", target: 1, mapId, cols: 7, rows: 5, landmarks,
    prompt, speakText: prompt,
    constraints: constraints.map((constraint) => ({
      ...constraint,
      text: `${labels.get(constraint.subjectId)} is ${relationText[constraint.relation]} ${labels.get(constraint.referenceId)}.`,
    })),
    feedback: FEEDBACK,
  };
}

const PRE_LANDMARKS: Landmark[] = [
  { id: "observatory", label: "Observatory", object: "satellite", symbol: "O" },
  { id: "camp", label: "Space Camp", object: "cave", symbol: "C" },
  { id: "garden", label: "Star Garden", object: "star", symbol: "G" },
  { id: "launch", label: "Launch Pad", object: "rocket", symbol: "L" },
];
const POST_LANDMARKS: Landmark[] = [
  { id: "dome", label: "Lunar Dome", object: "planet", symbol: "D" },
  { id: "tower", label: "Signal Tower", object: "flag", symbol: "T" },
  { id: "lab", label: "Solar Lab", object: "satellite", symbol: "S" },
  { id: "bay", label: "Rover Bay", object: "rover", symbol: "R" },
];

function createTasks(prefix: string, landmarks: Landmark[], post = false): AssessmentTask[] {
  const [a, b, c, d] = landmarks;
  const contexts = post
    ? ["Make the rescue map.", "Place the four mission landmarks.", "Build the navigator's map.", "Map the lunar base.", "Create the emergency map.", "Build a map another crew can read.", "Place all lunar landmarks from the clues.", "Create the complete base map."]
    : ["Make the training map.", "Place the four camp landmarks.", "Build the explorer's map.", "Map the space camp.", "Create the visitor map.", "Build a map another explorer can read.", "Place every landmark from the clues.", "Create the complete camp map."];
  const patterns: Constraint[][] = [
    [{ subjectId: b.id, relation: "below", referenceId: a.id }, { subjectId: c.id, relation: "rightOf", referenceId: b.id }, { subjectId: d.id, relation: "above", referenceId: c.id }],
    [{ subjectId: d.id, relation: "leftOf", referenceId: a.id }, { subjectId: b.id, relation: "below", referenceId: d.id }, { subjectId: c.id, relation: "rightOf", referenceId: b.id }],
    [{ subjectId: c.id, relation: "above", referenceId: b.id }, { subjectId: a.id, relation: "leftOf", referenceId: c.id }, { subjectId: d.id, relation: "below", referenceId: a.id }],
    [{ subjectId: a.id, relation: "rightOf", referenceId: b.id }, { subjectId: d.id, relation: "below", referenceId: a.id }, { subjectId: c.id, relation: "leftOf", referenceId: d.id }],
    [{ subjectId: b.id, relation: "above", referenceId: d.id }, { subjectId: a.id, relation: "leftOf", referenceId: b.id }, { subjectId: c.id, relation: "below", referenceId: a.id }],
    [{ subjectId: c.id, relation: "leftOf", referenceId: a.id }, { subjectId: b.id, relation: "below", referenceId: c.id }, { subjectId: d.id, relation: "rightOf", referenceId: b.id }],
    [{ subjectId: d.id, relation: "above", referenceId: c.id }, { subjectId: b.id, relation: "leftOf", referenceId: d.id }, { subjectId: a.id, relation: "below", referenceId: b.id }],
    [{ subjectId: a.id, relation: "above", referenceId: d.id }, { subjectId: c.id, relation: "rightOf", referenceId: a.id }, { subjectId: b.id, relation: "below", referenceId: c.id }],
  ];
  return patterns.map((constraints, index) => mapCreate(`${prefix}-create-${index + 1}`, contexts[index]!, landmarks, constraints));
}

function route(mapId: string, prompt: string, landmarks: Landmark[], start: { r: number; c: number }, goalIndex: number): AssessmentTask {
  const positions = [{ r: 0, c: 1 }, { r: 1, c: 5 }, { r: 3, c: 4 }, { r: 4, c: 0 }];
  const placed = landmarks.map((landmark, index) => ({ ...landmark, ...positions[index]! }));
  const goal = placed[goalIndex]!;
  return {
    kind: "starpathMapRoute", mode: "give", target: 1, mapId, cols: 7, rows: 5,
    prompt, speakText: prompt, landmarks: placed, object: "rover", start,
    goal: { r: goal.r, c: goal.c, object: goal.object, label: goal.label },
    palette: ["up", "down", "left", "right"], maxSteps: 12, feedback: FEEDBACK,
  };
}

const PRE_TASKS: readonly AssessmentTask[] = [
  compare("How are the sphere and cylinder different?", ["sphere", "cylinder"], "Only the cylinder has flat faces and edges.", ["Both have vertices.", "Only the sphere has a curved surface."]),
  compare("What do the cube and rectangular prism share?", ["cube", "prism"], "Both have 6 flat faces, 12 edges and 8 vertices.", ["Both have curved surfaces.", "Both have 5 faces."]),
  chooseObject("Choose an object that rolls and also stacks.", "cylinder", ["sphere", "cone"]),
  chooseObject("Choose the best object for a stable storage block.", "cube", ["sphere", "cone"]),
  classify("Sort by surface type.", "Has a curved surface", "Flat faces only", (id) => getL3Object(id).curvedSurfaces > 0),
  classify("Sort by vertices.", "Has vertices", "No vertices", (id) => getL3Object(id).vertices > 0, ["sphere", "pyramid", "cube", "cylinder", "cone", "prism"]),
  classify("Sort by number of edges.", "8 or more edges", "Fewer than 8 edges", (id) => getL3Object(id).edges >= 8, ["pyramid", "cone", "prism", "sphere", "cube", "cylinder"]),
  classify("Sort by flat faces.", "Has a flat face", "No flat faces", (id) => getL3Object(id).flatFaces > 0, ["cylinder", "sphere", "cube", "cone", "pyramid", "prism"]),
  ...createTasks("y3-pre", PRE_LANDMARKS),
  route("y3-pre-route-1", "Write a route to the Observatory.", PRE_LANDMARKS, { r: 4, c: 6 }, 0),
  route("y3-pre-route-2", "Write a route from the marked start to Star Garden.", PRE_LANDMARKS, { r: 0, c: 6 }, 2),
  route("y3-pre-route-3", "Plan a route to Space Camp.", PRE_LANDMARKS, { r: 4, c: 3 }, 1),
  route("y3-pre-route-4", "Record directions that finish at the Launch Pad.", PRE_LANDMARKS, { r: 0, c: 6 }, 3),
];

const POST_TASKS: readonly AssessmentTask[] = [
  compare("What do the cone and square pyramid share?", ["cone", "pyramid"], "Both have a vertex.", ["Both have curved surfaces.", "Both have 8 edges."]),
  compare("How are the cylinder and cone different?", ["cylinder", "cone"], "Only the cone has a vertex.", ["Only the cylinder has a curved surface.", "Both have 2 flat faces."]),
  chooseObject("Choose the best object for a roller on an axle.", "cylinder", ["cube", "pyramid"]),
  chooseObject("Choose an object with 5 faces, 8 edges and 5 vertices.", "pyramid", ["cube", "prism"]),
  classify("Sort objects that can roll.", "Has a curved surface", "No curved surface", (id) => getL3Object(id).curvedSurfaces > 0, ["prism", "cylinder", "pyramid", "sphere", "cube", "cone"]),
  classify("Sort by vertex count.", "Exactly 8 vertices", "Not 8 vertices", (id) => getL3Object(id).vertices === 8, ["cube", "cone", "sphere", "prism", "pyramid", "cylinder"]),
  classify("Sort by number of faces.", "5 or more flat faces", "Fewer than 5 flat faces", (id) => getL3Object(id).flatFaces >= 5, ["pyramid", "cylinder", "prism", "cone", "cube", "sphere"]),
  classify("Sort by edges.", "Has one or more edges", "Has no edges", (id) => getL3Object(id).edges > 0, ["sphere", "cube", "cylinder", "pyramid", "cone", "prism"]),
  ...createTasks("y3-post", POST_LANDMARKS, true),
  route("y3-post-route-1", "Write a route to Signal Tower.", POST_LANDMARKS, { r: 4, c: 6 }, 1),
  route("y3-post-route-2", "Plan a route from the marked start to Solar Lab.", POST_LANDMARKS, { r: 0, c: 6 }, 2),
  route("y3-post-route-3", "Record directions that finish at Rover Bay.", POST_LANDMARKS, { r: 0, c: 3 }, 3),
  route("y3-post-route-4", "Create a route to Lunar Dome.", POST_LANDMARKS, { r: 4, c: 6 }, 0),
];

const PRE_DIFFICULTY: AssessmentItemDifficulty[] = ["easy", "easy", "moderate", "moderate", "easy", "moderate", "challenging", "moderate", "easy", "easy", "moderate", "moderate", "moderate", "moderate", "challenging", "easy", "moderate", "challenging", "easy", "challenging"];
const PRE_COGNITIVE: AssessmentCognitiveCategory[] = ["recall", "recall", "understanding", "understanding", "understanding", "understanding", "application", "application", "understanding", "understanding", "application", "application", "application", "application", "application", "reasoning", "reasoning", "reasoning", "reasoning", "transfer"];
const POST_DIFFICULTY: AssessmentItemDifficulty[] = ["easy", "easy", "moderate", "moderate", "easy", "moderate", "challenging", "moderate", "easy", "easy", "moderate", "moderate", "moderate", "moderate", "challenging", "moderate", "challenging", "challenging", "challenging", "challenging"];
const POST_COGNITIVE: AssessmentCognitiveCategory[] = ["recall", "understanding", "understanding", "understanding", "understanding", "understanding", "application", "application", "application", "application", "application", "application", "application", "reasoning", "reasoning", "reasoning", "reasoning", "reasoning", "transfer", "transfer"];

function specs(form: Form, tasks: readonly AssessmentTask[]): ItemSpec[] {
  const difficulty = form === "pretest" ? PRE_DIFFICULTY : POST_DIFFICULTY;
  const cognitive = form === "pretest" ? PRE_COGNITIVE : POST_COGNITIVE;
  return tasks.map((task, index) => {
    const objectItem = index < 8;
    const selected = index < 4;
    const mapOffset = index - 8;
    return {
      descriptor: objectItem ? "AC9M3SP01" : "AC9M3SP02",
      week: objectItem ? (index % 3) + 1 : Math.min(8, 4 + Math.floor(mapOffset / 3)),
      lesson: (index % 3) + 1,
      difficulty: difficulty[index]!, cognitiveCategory: cognitive[index]!,
      responseMode: selected ? "selected_response" : "manipulated_response",
      misconceptionTags: objectItem
        ? [selected ? "object-use-without-features" : "object-feature-vocabulary"]
        : [index < 16 ? "map-relative-location" : "route-start-order"],
      misconceptionDiagnosis: [0, 2, 5, 8, 13, 17].includes(index),
      contextKey: `y3-${form}-${objectItem ? "object" : "map"}-${index + 1}`,
      structureKey: `y3-${form}-${task.kind}-${"mode" in task ? task.mode : "place"}-${index + 1}`,
      task,
    };
  });
}

function candidate(form: Form, index: number, spec: ItemSpec): CandidateQuestion {
  const shortForm = form === "pretest" ? "pre" : "post";
  return {
    schemaVersion: 1, id: `y3-starpath-${shortForm}-${String(index + 1).padStart(2, "0")}-v1`, version: "1.0.0",
    realm: "space", level: 3, form, origin: "assessment_authored", sourcePool: form,
    bankId: `starpath-level-3-${form}-v1`, primaryDescriptorCode: spec.descriptor, descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }], cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty, isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false, responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags, contextKey: spec.contextKey, structureKey: spec.structureKey,
    prompt: spec.task.prompt, renderer: { type: "starpath_assessment_task", payload: spec.task },
    scoring: { kind: "interaction", correctResponse: CORRECT_TOKEN }, statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: "starpathTask", correctAnswer: CORRECT_TOKEN, answer: CORRECT_TOKEN,
    skillId: spec.descriptor === "AC9M3SP01" ? "space_l3_object_features" : "space_l3_environment_maps",
    skillLabel: spec.descriptor === "AC9M3SP01" ? "Object Feature Reasoning" : "Environment Map Reasoning",
    linkedWeeks: [spec.week], linkedLessons: [spec.lesson], strand: "Space", curriculumCodes: [spec.descriptor],
    difficultyBand: "level-3-starpath", visual: { type: "starpath_level3_assessment", taskKind: spec.task.kind }, practiceTask: spec.task,
  };
}

export const LEVEL3_STARPATH_INDEPENDENT_PRETEST_ITEMS = specs("pretest", PRE_TASKS).map((spec, index) => candidate("pretest", index, spec));
export const LEVEL3_STARPATH_INDEPENDENT_POSTTEST_ITEMS = specs("posttest", POST_TASKS).map((spec, index) => candidate("posttest", index, spec));
