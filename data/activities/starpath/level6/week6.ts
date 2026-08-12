import { willTessellateTask, patternRuleTask, explainFitTask } from "./tessellationTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathTessellation", "starpathTessellation", "starpathTessellation"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l6Trans");

export const createWillTessellateTaskSet = () => taskSet([willTessellateTask, willTessellateTask, willTessellateTask], teach("Tessellations", "A tessellation fills the plane with no gaps.", "A tessellation repeats one tile to cover the plane with no gaps and no overlaps. Squares, triangles and hexagons tessellate; a regular pentagon leaves gaps."));
export const createPatternRuleTaskSet = () => taskSet([patternRuleTask, patternRuleTask, patternRuleTask], teach("Transformation Pattern", "A rule repeats the tile.", "Each tessellation is made by repeating a tile with a transformation: sliding, turning or flipping the copies."), 20);
export const createExplainFitTaskSet = () => taskSet([explainFitTask, explainFitTask, explainFitTask], teach("Explain the Fit", "Angles at a corner add to 360 degrees.", "Tiles fit with no gaps when the angles meeting at each shared corner add up to exactly 360 degrees."), 30);

export const WILL_TESSELLATE_CONTENT = lessonContent({
  title: "Will It Tessellate?",
  brief: "Test shapes to decide whether they tessellate the plane.",
  criteria: ["spot gaps and overlaps", "identify tessellating shapes", "reject shapes that leave gaps"],
  activities: ["Does It Fill?", "Gaps or Not?", "Tessellate or Not?"],
  kinds,
  reflection: "What must a tessellation have?",
  reflectionOptions: ["No gaps and no overlaps", "Lots of colours", "Curved edges"],
  skills: ["Test for tessellation", "Detect gaps", "Classify tiles"],
  next: "Transformation Pattern",
  createTaskSet: createWillTessellateTaskSet,
});

export const PATTERN_RULE_CONTENT = lessonContent({
  title: "Transformation Pattern",
  brief: "Identify the transformation rule that repeats a tile into a tessellation.",
  criteria: ["link a pattern to a transformation", "name slide, turn or flip", "read a repeating rule"],
  activities: ["Which Rule?", "Slide, Turn or Flip?", "Read the Pattern"],
  kinds,
  reflection: "How is a tessellation generated?",
  reflectionOptions: ["Repeat a tile with a transformation", "Draw random shapes", "Shrink each tile"],
  skills: ["Identify pattern rules", "Name transformations", "Read tessellations"],
  next: "Explain the Fit",
  createTaskSet: createPatternRuleTaskSet,
});

export const EXPLAIN_FIT_CONTENT = lessonContent({
  title: "Explain the Fit",
  brief: "Explain why tiles tessellate using the angles that meet at a corner.",
  criteria: ["use angles at a corner", "explain a gap-free fit", "reject colour and size reasoning"],
  activities: ["Why No Gaps?", "Angles at a Corner", "Justify It"],
  kinds,
  reflection: "Angles meeting at a corner add to what?",
  reflectionOptions: ["360 degrees", "180 degrees", "90 degrees"],
  skills: ["Reason with angles", "Explain the fit", "Justify tessellations"],
  next: "Notice the Pattern Rule",
  createTaskSet: createExplainFitTaskSet,
});
