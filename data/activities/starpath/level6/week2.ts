import { prismTask, constantTask, explainTask } from "./crossTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathCrossSection", "starpathCrossSection", "starpathCrossSection"] as const;

export const createPrismOrNotTaskSet = () => taskSet([prismTask, prismTask, prismTask], teaching("Prisms and Sections", "A right prism has the same slice all the way up.", "A right prism has two congruent polygon bases and a cross-section that never changes. A cylinder's slice is constant too, but it is curved — so it is not a prism."));
export const createConstantChangingTaskSet = () => taskSet([constantTask, constantTask, constantTask], teaching("Constant or Changing", "Classify how the sections behave.", "Congruent parallel slices point to a prism or cylinder. Slices that shrink to a point point to a pyramid or cone."), 20);
export const createExplainStructureTaskSet = () => taskSet([explainTask, explainTask, explainTask], teaching("Explain the Structure", "Reason from the slices to the solid.", "Use the pattern of the cross-sections as evidence. Constant slices mean a uniform body; shrinking slices mean the object rises to an apex."), 30);

export const PRISM_OR_NOT_CONTENT = lessonContent({
  title: "Prism or Not?",
  brief: "Use parallel cross-sections to decide whether an object is a right prism.",
  criteria: ["link a constant polygon section to a prism", "reject a shrinking section", "tell a cylinder from a prism"],
  activities: ["Is It a Prism?", "Check the Slices", "Prism or Cylinder?"],
  kinds,
  reflection: "What makes an object a right prism?",
  reflectionOptions: ["The same polygon slice all the way up", "Any object with a flat base", "Any object with a circle slice"],
  skills: ["Identify right prisms", "Use section evidence", "Distinguish curved solids"],
  next: "Constant or Changing",
  createTaskSet: createPrismOrNotTaskSet,
});

export const CONSTANT_CHANGING_CONTENT = lessonContent({
  title: "Constant or Changing",
  brief: "Classify objects by whether their parallel cross-sections stay congruent or shrink.",
  criteria: ["classify constant sections", "classify shrinking sections", "connect the pattern to the solid"],
  activities: ["Congruent or Not?", "Track the Sections", "Sort the Solid"],
  kinds,
  reflection: "What do shrinking cross-sections tell you?",
  reflectionOptions: ["The object narrows to an apex", "The object is a prism", "The object is a cube"],
  skills: ["Classify section behaviour", "Compare bottom and top", "Infer the solid"],
  next: "Explain the Structure",
  createTaskSet: createConstantChangingTaskSet,
});

export const EXPLAIN_STRUCTURE_CONTENT = lessonContent({
  title: "Explain the Structure",
  brief: "Reason from a sequence of cross-sections to describe an object's structure.",
  criteria: ["use sections as evidence", "explain constant vs shrinking", "describe the object's structure"],
  activities: ["What Does It Prove?", "From Slices to Solid", "Justify It"],
  kinds,
  reflection: "Congruent parallel slices are evidence of what?",
  reflectionOptions: ["A prism-like, uniform object", "A pyramid", "A sphere"],
  skills: ["Reason from evidence", "Explain structure", "Justify a classification"],
  next: "Week 2 Voyage Quiz",
  createTaskSet: createExplainStructureTaskSet,
});
