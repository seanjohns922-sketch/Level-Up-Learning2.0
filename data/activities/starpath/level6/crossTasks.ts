import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SECTION_SHAPES, getCrossObject } from "./crossSections";

type CrossTask = Extract<PracticeTask, { kind: "starpathCrossSection" }>;

const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// A rotation of objects that mixes prisms, a cylinder and pyramids/cone.
const OBJ_ORDER = ["rectPrism", "triPrism", "cylinder", "sqPyramid", "hexPrism", "cone"];
const objFor = (round: number, offset = 0) => OBJ_ORDER[(round + offset) % OBJ_ORDER.length]!;

function shapeOptions(correct: string, round: number) {
  const distractors = SECTION_SHAPES.filter((s) => s !== correct);
  const d0 = distractors[round % distractors.length]!;
  const d1 = distractors[(round + 1) % distractors.length]!;
  const options = order([
    { id: "a", label: cap(correct) },
    { id: "b", label: cap(d0) },
    { id: "c", label: cap(d1) },
  ], round);
  return { options, correctId: "a" };
}

// W1 L1 — Slice and See: name the 2D shape a horizontal cut makes.
export function sliceShapeTask(round: number, target: number): CrossTask {
  const obj = getCrossObject(objFor(round));
  const { options, correctId } = shapeOptions(obj.sectionName, round);
  return {
    kind: "starpathCrossSection", mode: "sliceShape", target, objectId: obj.id,
    prompt: "Slide the cut through the object. What 2D shape is the cross-section?",
    speakText: "A cross-section is the flat shape you see where the object is cut. Slide the cut and look at the shape it makes.",
    options, correctOptionIds: [correctId],
    feedback: { correct: `Correct — a horizontal slice of a ${obj.name.toLowerCase()} is a ${obj.sectionName}.`, wrong: "Look at the flat shape the cut plane reveals, then match it." },
  };
}

// W1 L2 — Parallel Slice Sequence: do the slices stay the same or change?
export function sliceChangeTask(round: number, target: number): CrossTask {
  const obj = getCrossObject(objFor(round, 3));
  const options = order([
    { id: "same", label: "They stay the same size" },
    { id: "smaller", label: "They get smaller" },
    { id: "bigger", label: "They get bigger" },
  ], round);
  return {
    kind: "starpathCrossSection", mode: "sliceChange", target, objectId: obj.id,
    prompt: "As the cut moves up, what happens to the parallel slices?",
    speakText: "Slide the cut from the bottom to the top and compare the slices. Do they stay the same, or change size?",
    options, correctOptionIds: [obj.constantSection ? "same" : "smaller"],
    feedback: { correct: obj.constantSection ? "Right — every parallel slice is congruent." : "Right — each slice is smaller as you near the apex.", wrong: "Slide from bottom to top and compare the slice sizes." },
  };
}

// W1 L3 — Predict Before Cutting: predict the cross-section shape.
export function predictTask(round: number, target: number): CrossTask {
  const obj = getCrossObject(objFor(round, 1));
  const { options, correctId } = shapeOptions(obj.sectionName, round + 1);
  return {
    kind: "starpathCrossSection", mode: "predict", target, objectId: obj.id,
    prompt: `Before you slice: what shape will a horizontal cut of the ${obj.name.toLowerCase()} make?`,
    speakText: "Picture the object's base. A horizontal cut makes the same shape as the base. Predict it, then slide to check.",
    options, correctOptionIds: [correctId],
    feedback: { correct: `Predicted correctly — a horizontal cut matches the base: a ${obj.sectionName}.`, wrong: "A horizontal cut is the same shape as the object's base. Check by slicing." },
  };
}

// W2 L1 — Prism or Not?: a right prism has a constant polygonal cross-section
// (a cylinder has a constant slice but is curved, so it is not a prism).
export function prismTask(round: number, target: number): CrossTask {
  const obj = getCrossObject(objFor(round, 2));
  const options = order([
    { id: "yes", label: "Yes, it is a prism" },
    { id: "no", label: "No, it is not a prism" },
  ], round);
  const why = obj.isPrism
    ? "every parallel slice is the same polygon."
    : obj.constantSection
      ? "its slices are congruent, but they are circles — it is curved, so it is a cylinder, not a prism."
      : "its slices get smaller, so it narrows to a point.";
  return {
    kind: "starpathCrossSection", mode: "prism", target, objectId: obj.id,
    prompt: "Use the slices to decide: is this object a right prism?",
    speakText: "A right prism has the same polygon cross-section all the way up. Slide the cut and check.",
    options, correctOptionIds: [obj.isPrism ? "yes" : "no"],
    feedback: { correct: `Correct — ${why}`, wrong: `Check the slices: a prism has the same polygon slice at every height. Here ${why}` },
  };
}

// W2 L2 — Constant or Changing: classify how the sections behave.
export function constantTask(round: number, target: number): CrossTask {
  const obj = getCrossObject(objFor(round, 4));
  const options = order([
    { id: "congruent", label: "They stay congruent (same shape and size)" },
    { id: "smaller", label: "They get smaller toward the top" },
    { id: "reshape", label: "They change into a different shape" },
  ], round);
  return {
    kind: "starpathCrossSection", mode: "constant", target, objectId: obj.id,
    prompt: "How do the parallel cross-sections change from bottom to top?",
    speakText: "Compare a slice near the bottom with one near the top. Same size, smaller, or a different shape?",
    options, correctOptionIds: [obj.constantSection ? "congruent" : "smaller"],
    feedback: { correct: obj.constantSection ? "Yes — congruent slices signal a prism or cylinder." : "Yes — shrinking slices signal a pyramid or cone.", wrong: "Compare a low slice with a high slice — do they match in size?" },
  };
}

// W2 L3 — Explain the Structure: reason from the section behaviour to the solid.
export function explainTask(round: number, target: number): CrossTask {
  const obj = getCrossObject(objFor(round, 5));
  const options = order([
    { id: "prismlike", label: "Its slices stay congruent — it has prism-like structure" },
    { id: "apex", label: "Its slices shrink to a point — it has an apex" },
    { id: "random", label: "Its slices have no pattern" },
  ], round);
  return {
    kind: "starpathCrossSection", mode: "explain", target, objectId: obj.id,
    prompt: "What do the parallel cross-sections tell you about this object?",
    speakText: "Use the evidence from slicing. What does the pattern of the slices prove about the object's structure?",
    options, correctOptionIds: [obj.constantSection ? "prismlike" : "apex"],
    feedback: { correct: obj.constantSection ? "Correct — congruent parallel slices mean a uniform, prism-like body." : "Correct — slices shrinking to a point mean the object rises to an apex.", wrong: "Look at whether the slices stay the same or shrink, then choose the matching structure." },
  };
}
