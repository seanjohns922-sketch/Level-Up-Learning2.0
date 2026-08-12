import { sliceShapeTask, prismTask, explainTask } from "./crossTasks";
import { readSignedTask, plotSignedTask, quadrantTask } from "./cartesianTasks";
import { patternRuleTask, evidenceTask } from "./tessellationTasks";
import { findChainTask } from "./transformChainTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

// Each integration lesson touches all three Year 6 strands: an object
// (cross-section), a location (four-quadrant coordinate) and a movement
// (transformation or tessellation).
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l6Integrate");

export const createAnalyseTaskSet = () => taskSet([sliceShapeTask, readSignedTask, patternRuleTask], teach("Orbital Design", "One mission joins objects, locations and patterns.", "A design brief describes an object to read, a place to locate and a pattern to name. Interpret each part: the cross-section, the coordinate and the transformation rule."));
export const createBuildTestTaskSet = () => taskSet([prismTask, plotSignedTask, findChainTask], teach("Build and Test", "Classify, place, then transform.", "Test whether an object is a prism, plot a position in the four quadrants, and work out the transformation chain. Every part must be right."), 20);
export const createDefendTaskSet = () => taskSet([explainTask, quadrantTask, evidenceTask], teach("Defend the Model", "Prove every part with evidence.", "Defend the design: explain the object from its sections, justify a point's quadrant, and give the evidence that a pattern truly tessellates."), 30);

export const ANALYSE_CONTENT = lessonContent({
  title: "Analyse the System",
  brief: "Interpret an object's section, a coordinate and a pattern rule together.",
  criteria: ["read a cross-section", "read a four-quadrant coordinate", "name a tessellation rule"],
  activities: ["Read the Section", "Read the Coordinate", "Name the Rule"],
  kinds: ["starpathCrossSection", "starpathCartesian", "starpathTessellation"],
  reflection: "What does an integration mission combine?",
  reflectionOptions: ["Objects, locations and patterns", "Only shapes", "Only coordinates"],
  skills: ["Interpret sections", "Interpret coordinates", "Interpret patterns"],
  next: "Build and Test",
  createTaskSet: createAnalyseTaskSet,
});

export const BUILD_TEST_CONTENT = lessonContent({
  title: "Build and Test",
  brief: "Classify an object, place it with coordinates, then transform it.",
  criteria: ["test for a prism", "plot a signed coordinate", "work out a transformation chain"],
  activities: ["Prism or Not?", "Plot the Point", "Find the Chain"],
  kinds: ["starpathCrossSection", "starpathCartesian", "starpathTransform"],
  reflection: "How many strands must a build get right?",
  reflectionOptions: ["All three", "Just one", "Any two"],
  skills: ["Classify objects", "Plot coordinates", "Build transformations"],
  next: "Defend the Model",
  createTaskSet: createBuildTestTaskSet,
});

export const DEFEND_CONTENT = lessonContent({
  title: "Defend the Model",
  brief: "Justify an object's structure, a point's quadrant and a tessellation with evidence.",
  criteria: ["explain structure from sections", "justify a quadrant", "give tessellation evidence"],
  activities: ["Explain the Structure", "Justify the Quadrant", "Evidence to Defend"],
  kinds: ["starpathCrossSection", "starpathCartesian", "starpathTessellation"],
  reflection: "What makes a strong defence?",
  reflectionOptions: ["Evidence for every part", "A neat drawing", "One good guess"],
  skills: ["Explain with evidence", "Justify positions", "Defend a model"],
  next: "Level 6 Post-Test",
  createTaskSet: createDefendTaskSet,
});
