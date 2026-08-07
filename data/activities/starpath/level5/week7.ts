import { reflectTapTask, rotateTapTask, compareTask } from "./transformTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathTransform", "starpathTransform", "starpathTransform"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l5Trans");

export const createReflectTaskSet = () => taskSet([reflectTapTask, reflectTapTask, compareTask], teach("Reflect Across a Line", "A reflection is a mirror flip across a line.", "A reflected point is the same distance from the mirror line, on the opposite side. The whole shape flips but keeps its size."));
export const createRotateTaskSet = () => taskSet([rotateTapTask, rotateTapTask, reflectTapTask], teach("Rotate About a Point", "A rotation turns a shape around a centre.", "Every point turns the same amount around the centre and stays the same distance from it. The shape keeps its size."), 20);
export const createCompareTransformsTaskSet = () => taskSet([compareTask, compareTask, rotateTapTask], teach("Compare the Transformations", "Slide, flip or turn — which is it?", "A slide keeps the facing, a flip mirrors it, and a turn rotates it. Compare the shape and its image to name the transformation."), 30);

export const REFLECT_CONTENT = lessonContent({
  title: "Reflect Across a Line",
  brief: "Reflect a figure across a mirror line, matching distances on each side.",
  criteria: ["place corresponding points", "keep equal distance across the line", "flip the whole figure"],
  activities: ["Mirror the Corner", "Reflect Again", "Which Transformation?"],
  kinds,
  reflection: "Where does a reflected point land?",
  reflectionOptions: ["Same distance on the other side", "Right on the line", "Anywhere across the line"],
  skills: ["Reflect across a line", "Match corresponding points", "Preserve size"],
  next: "Rotate About a Point",
  createTaskSet: createReflectTaskSet,
});

export const ROTATE_CONTENT = lessonContent({
  title: "Rotate About a Point",
  brief: "Rotate a figure a quarter or half turn about a stated centre.",
  criteria: ["turn about the centre", "keep distance from the centre", "apply the stated turn"],
  activities: ["Turn the Corner", "Turn Again", "Mirror the Corner"],
  kinds,
  reflection: "What stays the same in a rotation?",
  reflectionOptions: ["Distance from the centre and size", "The facing direction", "The position"],
  skills: ["Rotate about a point", "Use a centre and turn", "Preserve size"],
  next: "Compare the Transformations",
  createTaskSet: createRotateTaskSet,
});

export const COMPARE_TRANSFORMS_CONTENT = lessonContent({
  title: "Compare the Transformations",
  brief: "Identify whether an image is a translation, reflection or rotation.",
  criteria: ["compare facing and position", "identify the transformation", "explain the invariants"],
  activities: ["Which Transformation?", "Name the Move", "Turn the Corner"],
  kinds,
  reflection: "How do you tell a flip from a slide?",
  reflectionOptions: ["A flip mirrors the facing", "A flip moves it right", "A flip changes its size"],
  skills: ["Classify transformations", "Reason about invariants", "Compare image pairs"],
  next: "Week 7 Voyage Quiz",
  createTaskSet: createCompareTransformsTaskSet,
});
