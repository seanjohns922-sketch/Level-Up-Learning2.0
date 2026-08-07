import { chooseNetTask, buildTask, classifyTask } from "./netTasks";
import { readTask, plotTask, errorTask } from "./coordinateTasks";
import { compareTask, translateTapTask, checkTask } from "./transformTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathNet", "starpathCoordinate", "starpathTransform"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l5Integrate");

// Each integration lesson touches all three strands: an object (net), a location
// (coordinate) and a movement (transformation).
export const createInterpretBriefTaskSet = () => taskSet([chooseNetTask, readTask, compareTask], teach("Interpret the Brief", "One mission joins objects, locations and movements.", "A design brief names an object to build, a place to put it and a way to move it. Read each part: which net, which coordinate, which transformation."));
export const createBuildTransformTaskSet = () => taskSet([buildTask, plotTask, translateTapTask], teach("Build and Transform", "Build the object, place it, then transform it.", "Construct a valid net, plot its position with coordinates, then slide it to its transformed image. Every part must be correct."), 20);
export const createTestDefendTaskSet = () => taskSet([classifyTask, errorTask, checkTask], teach("Test and Defend", "Prove every part of the design works.", "Audit each part with evidence: test the fold, fix the coordinate, and check the image against the invariants. Only submit when all three pass."), 30);

export const INTERPRET_BRIEF_CONTENT = lessonContent({
  title: "Interpret the Brief",
  brief: "Read a spatial design brief and connect its net, coordinate and transformation constraints.",
  criteria: ["identify the object constraint", "identify the location constraint", "identify the movement constraint"],
  activities: ["Which Object?", "Which Place?", "Which Move?"],
  kinds,
  reflection: "Why read every part of the brief?",
  reflectionOptions: ["Each part is a different constraint", "Only the object matters", "The parts are unrelated"],
  skills: ["Interpret integrated briefs", "Connect constraints", "Read spatial evidence"],
  next: "Build and Transform",
  createTaskSet: createInterpretBriefTaskSet,
});

export const BUILD_TRANSFORM_CONTENT = lessonContent({
  title: "Build and Transform",
  brief: "Construct an object, position it with coordinates, and transform it to its image.",
  criteria: ["build a valid net", "place it with coordinates", "transform it correctly"],
  activities: ["Build the Object", "Plot the Position", "Move the Image"],
  kinds,
  reflection: "What makes this one connected design?",
  reflectionOptions: ["The object, place and move all fit together", "Each part is separate", "Only the last part counts"],
  skills: ["Build across strands", "Position with coordinates", "Apply transformations"],
  next: "Test and Defend",
  createTaskSet: createBuildTransformTaskSet,
});

export const TEST_DEFEND_CONTENT = lessonContent({
  title: "Test and Defend",
  brief: "Audit each part of the design with spatial evidence before submitting.",
  criteria: ["test the fold", "fix the coordinate", "check the image invariants"],
  activities: ["Test the Fold", "Fix the Coordinate", "Check the Image"],
  kinds,
  reflection: "What proves a design is complete?",
  reflectionOptions: ["Every part passes its test", "It looks about right", "One part passes"],
  skills: ["Audit representations", "Correct with evidence", "Defend a design"],
  next: "Level 5 Post-Test",
  createTaskSet: createTestDefendTaskSet,
});
