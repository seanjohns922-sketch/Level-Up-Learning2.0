import { transformInOrderTask, orderMattersTask, findChainTask } from "./transformChainTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathTransform", "starpathTransform", "starpathTransform"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l6Trans");

export const createTransformOrderTaskSet = () => taskSet([transformInOrderTask, transformInOrderTask, transformInOrderTask], teach("Combined Transformations", "Do one transformation, then another.", "You can combine transformations by doing them one after the other. Two slides combine into a single longer slide."));
export const createOrderMattersTaskSet = () => taskSet([orderMattersTask, orderMattersTask, orderMattersTask], teach("Does Order Matter?", "The order can change the result.", "Two slides give the same result in any order. But a slide and a turn can land in different places depending on which you do first."), 20);
export const createFindChainTaskSet = () => taskSet([findChainTask, findChainTask, findChainTask], teach("Find the Chain", "Work out the sequence from the image.", "Compare the shape with its final image. Which two moves, in order, take one to the other?"), 30);

export const TRANSFORM_ORDER_CONTENT = lessonContent({
  title: "Transform in Order",
  brief: "Apply two transformations in a stated order and find the result.",
  criteria: ["do two transformations in sequence", "combine two slides", "track a point through both"],
  activities: ["Slide Then Slide", "Combine the Moves", "Land the Corner"],
  kinds,
  reflection: "What do two slides combine into?",
  reflectionOptions: ["One longer slide", "A turn", "A flip"],
  skills: ["Sequence transformations", "Combine slides", "Track a point"],
  next: "Does Order Matter?",
  createTaskSet: createTransformOrderTaskSet,
});

export const ORDER_MATTERS_CONTENT = lessonContent({
  title: "Does Order Matter?",
  brief: "Compare a sequence of transformations with the reversed sequence.",
  criteria: ["reverse a sequence", "decide if the result changes", "know slides always commute"],
  activities: ["Same or Different?", "Swap the Order", "Compare Results"],
  kinds,
  reflection: "When does the order of two moves matter?",
  reflectionOptions: ["When one is a slide and one is a turn", "Never", "Only for two slides"],
  skills: ["Reverse sequences", "Compare results", "Reason about order"],
  next: "Find the Transformation Chain",
  createTaskSet: createOrderMattersTaskSet,
});

export const FIND_CHAIN_CONTENT = lessonContent({
  title: "Find the Transformation Chain",
  brief: "Infer the sequence of transformations that maps a shape to its image.",
  criteria: ["compare a shape and its image", "identify a sequence", "check by tracking a point"],
  activities: ["Name the Chain", "Which Sequence?", "Trace It"],
  kinds,
  reflection: "How do you find a transformation chain?",
  reflectionOptions: ["Track a corner from shape to image", "Guess the moves", "Count the tiles"],
  skills: ["Infer sequences", "Match image to moves", "Verify with a point"],
  next: "Will It Tessellate?",
  createTaskSet: createFindChainTaskSet,
});
