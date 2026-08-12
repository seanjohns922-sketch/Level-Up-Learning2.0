import type {
  PracticeTask,
  StarpathGroundAssessmentToken,
} from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type GroundStarpathDescriptor = "AC9MFSP01" | "AC9MFSP02";
type CandidateQuestion = Question & IndependentAssessmentItem;

type ItemSpec = {
  descriptor: GroundStarpathDescriptor;
  week: number;
  lesson: number;
  skillId: string;
  skillLabel: string;
  difficulty: AssessmentItemDifficulty;
  cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: "selected_response" | "manipulated_response";
  misconceptionTags: readonly string[];
  misconceptionDiagnosis?: boolean;
  contextKey: string;
  structureKey: string;
  task: PracticeTask;
};

const CORRECT_TOKEN = "__starpath_task_correct__";
const FEEDBACK = { correct: "Answer recorded.", wrong: "Answer recorded." } as const;

const shapeToken = (
  id: string,
  label: string,
  shape: "circle" | "oval" | "triangle" | "square" | "rectangle",
  colour: string,
  rotation = 0,
): StarpathGroundAssessmentToken => ({
  id,
  label,
  visual: { kind: "shape", shape, colour, rotation },
});

const objectToken = (id: string, label: string, objectId: string): StarpathGroundAssessmentToken => ({
  id,
  label,
  visual: { kind: "object", objectId },
});

function candidate(index: number, spec: ItemSpec): CandidateQuestion {
  if (!("prompt" in spec.task) || typeof spec.task.prompt !== "string") {
    throw new Error(`Ground Starpath assessment task ${index + 1} requires a prompt.`);
  }
  return {
    schemaVersion: 1,
    id: `y0-starpath-post-${String(index + 1).padStart(2, "0")}-rc1`,
    version: "1.0.0-rc1",
    realm: "space",
    level: 0,
    form: "posttest",
    origin: "assessment_authored",
    sourcePool: "posttest",
    bankId: "starpath-level-0-posttest-rc1",
    primaryDescriptorCode: spec.descriptor,
    descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey,
    structureKey: spec.structureKey,
    prompt: spec.task.prompt,
    renderer: { type: "starpath_assessment_task", payload: spec.task },
    scoring: { kind: "interaction", correctResponse: CORRECT_TOKEN },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: "starpathTask",
    correctAnswer: CORRECT_TOKEN,
    answer: CORRECT_TOKEN,
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Space",
    curriculumCodes: [spec.descriptor],
    difficultyBand: "ground-starpath",
    visual: { type: "starpath_ground_assessment", taskKind: spec.task.kind },
    practiceTask: spec.task,
  };
}

const POSTTEST_SPECS: readonly ItemSpec[] = [
  {
    descriptor: "AC9MFSP01", week: 1, lesson: 1, skillId: "name_shape", skillLabel: "Name Familiar Shapes",
    difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response",
    misconceptionTags: ["shape-orientation-invariance"], contextKey: "turned-cyan-rectangle", structureKey: "select-turned-target-shape",
    task: {
      kind: "starpathShapeMatch", prompt: "Tap the rectangle.", speakText: "Tap the rectangle.", target: 1,
      targetShape: "rectangle",
      options: [
        { id: "triangle", shape: "triangle", colour: "#fde047", scale: 0.9, rotation: 20 },
        { id: "rectangle", shape: "rectangle", colour: "#67e8f9", scale: 0.9, rotation: 35 },
        { id: "oval", shape: "oval", colour: "#f9a8d4", scale: 0.9, rotation: -20 },
      ],
      correctOptionId: "rectangle", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 1, lesson: 2, skillId: "recognise_shape", skillLabel: "Recognise Familiar Shapes",
    difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response",
    misconceptionTags: ["shape-colour-size"], contextKey: "small-pink-triangle", structureKey: "name-single-familiar-shape",
    task: {
      kind: "starpathShapeName", prompt: "What shape is shown?", speakText: "What shape is shown?", target: 1,
      shape: "triangle",
      options: [
        { id: "circle", name: "circle" },
        { id: "triangle", name: "triangle" },
        { id: "square", name: "square" },
      ],
      correctOptionId: "triangle", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 2, lesson: 1, skillId: "shape_in_object", skillLabel: "Find Shapes in Objects",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response",
    misconceptionTags: ["shape-in-object"], contextKey: "rocket-window-circle", structureKey: "identify-shape-component-in-object",
    task: {
      kind: "starpathObjectShape", prompt: "What shape is the rocket window?", speakText: "What shape is the rocket window?", target: 1,
      objectId: "rocket", targetShape: "circle",
      options: [
        { id: "square", shape: "square", colour: "#86efac" },
        { id: "circle", shape: "circle", colour: "#67e8f9" },
        { id: "triangle", shape: "triangle", colour: "#fde047" },
      ],
      correctOptionId: "circle", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 3, lesson: 1, skillId: "sort_shapes", skillLabel: "Sort Familiar Shapes",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response",
    misconceptionTags: ["shape-colour-size"], contextKey: "three-circles-one-square", structureKey: "find-shape-not-belonging",
    task: {
      kind: "starpathOddOneOut", prompt: "Which shape does not belong?", speakText: "Which shape does not belong?", target: 1,
      options: [
        { id: "circle-a", shape: "circle", colour: "#67e8f9" },
        { id: "circle-b", shape: "circle", colour: "#fde047" },
        { id: "square", shape: "square", colour: "#67e8f9" },
        { id: "circle-c", shape: "circle", colour: "#f9a8d4" },
      ],
      oddOptionId: "square", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 3, lesson: 3, skillId: "classify_shapes", skillLabel: "Classify Shapes by Features",
    difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true,
    misconceptionTags: ["classification-single-rule"], contextKey: "circle-oval-round-group", structureKey: "choose-rule-for-shape-set",
    task: {
      kind: "starpathShapeClassify", mode: "rule", prompt: "Why do these shapes belong together?", speakText: "Why do these shapes belong together?", target: 1,
      specimens: [
        { id: "circle", shape: "circle", colour: "#67e8f9", scale: 0.8 },
        { id: "oval", shape: "oval", colour: "#fde047", scale: 1 },
      ],
      options: [
        { id: "round", label: "They are round." },
        { id: "same-colour", label: "They are the same colour." },
        { id: "three-sides", label: "They have three sides." },
      ],
      correctOptionId: "round", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 2, lesson: 2, skillId: "create_shape_picture", skillLabel: "Create a Shape Picture",
    difficulty: "easy", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["shape-in-object"], contextKey: "triangle-rectangle-circle-rocket", structureKey: "build-three-part-vertical-picture",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Build a rocket: triangle, rectangle, then circle.", speakText: "Build a rocket. Put the triangle above the rectangle, and the circle below.", target: 1, rows: 3, cols: 3,
      tokens: [
        shapeToken("nose", "triangle", "triangle", "#fde047"),
        shapeToken("body", "rectangle", "rectangle", "#67e8f9"),
        shapeToken("window", "circle", "circle", "#f9a8d4"),
      ],
      answer: [{ tokenId: "nose", r: 0, c: 1 }, { tokenId: "body", r: 1, c: 1 }, { tokenId: "window", r: 2, c: 1 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 2, lesson: 3, skillId: "create_shape_picture", skillLabel: "Create a Shape Picture",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["shape-in-object"], contextKey: "triangle-square-house", structureKey: "build-two-part-house-picture",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Build a house with a triangle above a square.", speakText: "Build a house with a triangle above a square.", target: 1, rows: 3, cols: 3,
      tokens: [shapeToken("roof", "triangle", "triangle", "#f97316"), shapeToken("room", "square", "square", "#86efac")],
      answer: [{ tokenId: "roof", r: 0, c: 1 }, { tokenId: "room", r: 1, c: 1 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 3, lesson: 2, skillId: "create_shape_layout", skillLabel: "Arrange Familiar Shapes",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["shape-orientation-invariance"], contextKey: "circle-left-square-triangle-above", structureKey: "place-three-shapes-by-position",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Put the circle left and the triangle above the square.", speakText: "Put the circle to the left of the square. Put the triangle above the square.", target: 1, rows: 3, cols: 3,
      tokens: [
        shapeToken("circle", "circle", "circle", "#67e8f9"),
        shapeToken("square", "square", "square", "#86efac"),
        shapeToken("triangle", "triangle", "triangle", "#fde047", 28),
      ],
      answer: [{ tokenId: "circle", r: 1, c: 0 }, { tokenId: "square", r: 1, c: 1 }, { tokenId: "triangle", r: 0, c: 1 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 7, lesson: 2, skillId: "repair_shape_picture", skillLabel: "Repair a Shape Picture",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "manipulated_response", misconceptionDiagnosis: true,
    misconceptionTags: ["shape-in-object"], contextKey: "flag-square-fixed-rectangle-pole", structureKey: "repair-picture-with-missing-shape",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Finish the flag with a rectangle below the square.", speakText: "Finish the flag. Put the rectangle below the square.", target: 1, rows: 3, cols: 3,
      tokens: [shapeToken("pole", "rectangle", "rectangle", "#f97316", 90)],
      fixed: [{ token: shapeToken("flag", "square", "square", "#67e8f9"), r: 0, c: 1 }],
      answer: [{ tokenId: "pole", r: 1, c: 1 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP01", week: 8, lesson: 2, skillId: "transfer_shape_conditions", skillLabel: "Create from Shape Conditions",
    difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "manipulated_response", misconceptionDiagnosis: true,
    misconceptionTags: ["classification-single-rule"], contextKey: "triangle-above-two-different-round-shapes", structureKey: "build-picture-meeting-two-conditions",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Put a triangle above a circle and an oval.", speakText: "Put a triangle above a circle and an oval. Put the circle on the left.", target: 1, rows: 3, cols: 3,
      tokens: [
        shapeToken("triangle", "triangle", "triangle", "#fde047"),
        shapeToken("circle", "circle", "circle", "#67e8f9"),
        shapeToken("oval", "oval", "oval", "#f9a8d4"),
      ],
      answer: [{ tokenId: "triangle", r: 0, c: 1 }, { tokenId: "circle", r: 1, c: 0 }, { tokenId: "oval", r: 1, c: 2 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 4, lesson: 1, skillId: "position_word", skillLabel: "Describe Relative Position",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response",
    misconceptionTags: ["position-without-reference"], contextKey: "star-above-planet", structureKey: "select-position-word-from-scene",
    task: {
      kind: "starpathPositionWord", prompt: "Where is the star compared with the planet?", speakText: "Where is the star compared with the planet?", target: 1,
      anchorObject: "planet", subjectObject: "star", relation: "above",
      options: [{ id: "above", relation: "above" }, { id: "below", relation: "below" }, { id: "beside", relation: "beside" }],
      correctOptionId: "above", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 4, lesson: 2, skillId: "position_picture", skillLabel: "Match a Position Picture",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response",
    misconceptionTags: ["position-without-reference"], contextKey: "moon-below-rocket-scenes", structureKey: "select-scene-matching-position-clue",
    task: {
      kind: "starpathPositionPicture", prompt: "Which picture shows the moon below the rocket?", speakText: "Which picture shows the moon below the rocket?", target: 1,
      options: [
        { id: "above", anchorObject: "rocket", subjectObject: "moon", relation: "above" },
        { id: "below", anchorObject: "rocket", subjectObject: "moon", relation: "below" },
        { id: "beside", anchorObject: "rocket", subjectObject: "moon", relation: "beside" },
      ],
      correctOptionId: "below", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 4, lesson: 3, skillId: "find_positioned_object", skillLabel: "Find an Object from a Position Clue",
    difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "selected_response",
    misconceptionTags: ["position-without-reference"], contextKey: "crystal-inside-cave", structureKey: "find-object-from-relative-clue",
    task: {
      kind: "starpathPositionFind", prompt: "Tap the object inside the cave.", speakText: "Tap the object inside the cave.", target: 1,
      anchorObject: "cave",
      placements: [
        { id: "crystal", object: "crystal", relation: "inside" },
        { id: "star", object: "star", relation: "above" },
        { id: "alien", object: "alien", relation: "beside", side: "right" },
      ],
      correctId: "crystal", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 5, lesson: 1, skillId: "compare_people_positions", skillLabel: "Compare People and Positions",
    difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true,
    misconceptionTags: ["position-without-reference"], contextKey: "explorer-above-geospin", structureKey: "select-person-position-from-reference",
    task: {
      kind: "starpathPositionWord", prompt: "Where is the explorer compared with Geospin?", speakText: "Where is the explorer compared with Geospin?", target: 1,
      anchorObject: "geospin", subjectObject: "explorer", relation: "above",
      options: [{ id: "below", relation: "below" }, { id: "above", relation: "above" }, { id: "beside", relation: "beside" }],
      correctOptionId: "above", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 5, lesson: 3, skillId: "diagnose_relative_position", skillLabel: "Check a Relative Position",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true,
    misconceptionTags: ["position-without-reference"], contextKey: "geospin-behind-explorer-scenes", structureKey: "diagnose-person-position-scene",
    task: {
      kind: "starpathPositionPicture", prompt: "Which picture shows Geospin behind the explorer?", speakText: "Which picture shows Geospin behind the explorer?", target: 1,
      options: [
        { id: "in-front", anchorObject: "explorer", subjectObject: "geospin", relation: "in-front" },
        { id: "beside", anchorObject: "explorer", subjectObject: "geospin", relation: "beside", side: "right" },
        { id: "behind", anchorObject: "explorer", subjectObject: "geospin", relation: "behind" },
      ],
      correctOptionId: "behind", feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 6, lesson: 1, skillId: "place_above", skillLabel: "Place an Object Above a Reference",
    difficulty: "easy", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["position-without-reference"], contextKey: "star-above-fixed-planet", structureKey: "place-object-above-reference",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Put the star above the planet.", speakText: "Put the star above the planet.", target: 1, rows: 3, cols: 3,
      tokens: [objectToken("star", "star", "star")],
      fixed: [{ token: objectToken("planet", "planet", "planet"), r: 1, c: 1 }],
      answer: [{ tokenId: "star", r: 0, c: 1 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 6, lesson: 2, skillId: "place_below", skillLabel: "Place an Object Below a Reference",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["position-without-reference"], contextKey: "rocket-below-fixed-moon", structureKey: "place-object-below-reference",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Put the rocket below the moon.", speakText: "Put the rocket below the moon.", target: 1, rows: 3, cols: 3,
      tokens: [objectToken("rocket", "rocket", "rocket")],
      fixed: [{ token: objectToken("moon", "moon", "moon"), r: 1, c: 1 }],
      answer: [{ tokenId: "rocket", r: 2, c: 1 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 6, lesson: 3, skillId: "place_right", skillLabel: "Place an Object to the Right",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["viewpoint-left-right"], contextKey: "crystal-right-of-fixed-cave", structureKey: "place-object-right-of-reference",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Put the crystal to the right of the cave.", speakText: "Put the crystal to the right of the cave.", target: 1, rows: 3, cols: 3,
      tokens: [objectToken("crystal", "crystal", "crystal")],
      fixed: [{ token: objectToken("cave", "cave", "cave"), r: 1, c: 1 }],
      answer: [{ tokenId: "crystal", r: 1, c: 2 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 7, lesson: 3, skillId: "place_person_beside", skillLabel: "Place a Person Beside Another",
    difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "manipulated_response",
    misconceptionTags: ["position-without-reference"], contextKey: "explorer-beside-fixed-geospin", structureKey: "place-person-beside-reference",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Put the explorer beside Geospin.", speakText: "Put the explorer beside Geospin.", target: 1, rows: 3, cols: 3,
      tokens: [objectToken("explorer", "explorer", "explorer")],
      fixed: [{ token: objectToken("geospin", "Geospin", "geospin"), r: 1, c: 1 }],
      answer: [{ tokenId: "explorer", r: 1, c: 2 }], feedback: FEEDBACK,
    },
  },
  {
    descriptor: "AC9MFSP02", week: 8, lesson: 3, skillId: "place_people_relative", skillLabel: "Place People Relative to an Object",
    difficulty: "challenging", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["position-without-reference"], contextKey: "people-above-below-fixed-flag", structureKey: "place-two-people-from-relative-clues",
    task: {
      kind: "starpathGroundAssessment", mode: "placement", prompt: "Place Geospin above and the explorer below the flag.", speakText: "Place Geospin above the flag. Place the explorer below the flag.", target: 1, rows: 3, cols: 3,
      tokens: [objectToken("geospin", "Geospin", "geospin"), objectToken("explorer", "explorer", "explorer")],
      fixed: [{ token: objectToken("flag", "flag", "flag"), r: 1, c: 1 }],
      answer: [{ tokenId: "geospin", r: 0, c: 1 }, { tokenId: "explorer", r: 2, c: 1 }], feedback: FEEDBACK,
    },
  },
] as const;

export const GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS: readonly CandidateQuestion[] =
  POSTTEST_SPECS.map((spec, index) => candidate(index, spec));
