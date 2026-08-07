import { translateTapTask, describeTask, checkTask } from "./transformTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathTransform", "starpathTransform", "starpathTransform"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l5Trans");

export const createSlideTaskSet = () => taskSet([translateTapTask, describeTask, translateTapTask], teach("Slide Every Point", "A slide moves every point the same amount.", "In a translation, every point of the shape moves the same distance across and up. The shape keeps its size and stays facing the same way."));
export const createDescribeTaskSet = () => taskSet([describeTask, translateTapTask, checkTask], teach("Describe the Translation", "Say how far a shape slid.", "Compare a point on the shape with the matching point on its image. Describe the move as so far across and so far up."), 20);
export const createCheckImageTaskSet = () => taskSet([checkTask, describeTask, checkTask], teach("Check the Image", "A slide never flips or turns the shape.", "Use the invariants: a translation keeps size, shape and facing. If the image is flipped or turned, it is not a slide."), 30);

export const SLIDE_CONTENT = lessonContent({
  title: "Slide Every Point",
  brief: "Translate a figure so every point moves by the same amount.",
  criteria: ["move every point the same", "keep size and facing", "land the image correctly"],
  activities: ["Slide the Shape", "Describe the Slide", "Slide Again"],
  kinds,
  reflection: "What stays the same in a slide?",
  reflectionOptions: ["Size, shape and facing", "Only the colour", "Nothing stays the same"],
  skills: ["Translate a figure", "Preserve invariants", "Place an image"],
  next: "Describe the Translation",
  createTaskSet: createSlideTaskSet,
});

export const DESCRIBE_CONTENT = lessonContent({
  title: "Describe the Translation",
  brief: "Describe a slide using across-and-up movement language.",
  criteria: ["compare matching points", "measure across and up", "describe the movement"],
  activities: ["Describe the Slide", "Slide the Shape", "Is It a Slide?"],
  kinds,
  reflection: "How do you describe a slide?",
  reflectionOptions: ["How far across and how far up", "Only the ending point", "The colour of the image"],
  skills: ["Describe translations", "Compare image points", "Use movement language"],
  next: "Check the Image",
  createTaskSet: createDescribeTaskSet,
});

export const CHECK_IMAGE_CONTENT = lessonContent({
  title: "Check the Image",
  brief: "Use invariants to judge whether a claimed image is a valid translation.",
  criteria: ["check size and shape", "check the facing", "reject flips and turns"],
  activities: ["Is It a Slide?", "Describe the Slide", "Check Again"],
  kinds,
  reflection: "How can you tell it is NOT a slide?",
  reflectionOptions: ["It is flipped or turned", "It moved to the right", "It kept its size"],
  skills: ["Evaluate translations", "Reason with invariants", "Detect flips and turns"],
  next: "Week 6 Voyage Quiz",
  createTaskSet: createCheckImageTaskSet,
});
