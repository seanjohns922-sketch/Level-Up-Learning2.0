import { plotSignedTask, readSignedTask, quadrantTask, reasonTask } from "./cartesianTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathCartesian", "starpathCartesian", "starpathCartesian"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l6Coord");

export const createExtendAxesTaskSet = () => taskSet([plotSignedTask, readSignedTask, plotSignedTask], teach("Four Quadrants", "The axes reach into negative numbers.", "Extend both axes past the origin. Left of it, x is negative; below it, y is negative. Coordinates can now be positive, negative or zero."));
export const createPlotQuadrantsTaskSet = () => taskSet([plotSignedTask, quadrantTask, plotSignedTask], teach("Plot Every Quadrant", "Plot points in all four quadrants.", "Count across first (left is negative), then up or down (below is negative). Every ordered pair lands in one of the four quadrants."), 20);
export const createCoordReasoningTaskSet = () => taskSet([quadrantTask, reasonTask, quadrantTask], teach("Coordinate Reasoning", "Use the signs to reason about position.", "Quadrant I is positive-positive, and they run anticlockwise: II is negative-positive, III negative-negative, IV positive-negative."), 30);

export const EXTEND_AXES_CONTENT = lessonContent({
  title: "Extend the Axes",
  brief: "Extend the axes into negative numbers and plot signed coordinates.",
  criteria: ["read negative directions on the axes", "plot points with negative coordinates", "use the centred origin"],
  activities: ["Plot a Point", "Read a Point", "Plot Again"],
  kinds,
  reflection: "What does a negative x-coordinate mean?",
  reflectionOptions: ["Count left of the origin", "Count up from the origin", "It is not allowed"],
  skills: ["Read signed axes", "Plot negative coordinates", "Use a centred origin"],
  next: "Plot Every Quadrant",
  createTaskSet: createExtendAxesTaskSet,
});

export const PLOT_QUADRANTS_CONTENT = lessonContent({
  title: "Plot Every Quadrant",
  brief: "Plot and locate ordered pairs across all four quadrants and the axes.",
  criteria: ["plot in every quadrant", "name the quadrant of a point", "handle points on an axis"],
  activities: ["Plot Anywhere", "Which Quadrant?", "Plot Again"],
  kinds,
  reflection: "How many quadrants does the plane have?",
  reflectionOptions: ["Four", "Two", "One"],
  skills: ["Plot in four quadrants", "Identify quadrants", "Read signed pairs"],
  next: "Coordinate Reasoning",
  createTaskSet: createPlotQuadrantsTaskSet,
});

export const COORD_REASONING_CONTENT = lessonContent({
  title: "Coordinate Reasoning",
  brief: "Infer a point's quadrant and position from the signs of its coordinates.",
  criteria: ["link signs to quadrants", "reason without plotting", "explain a point's position"],
  activities: ["Name the Quadrant", "Signs to Quadrant", "Reason It Out"],
  kinds,
  reflection: "A point with (-, -) is in which quadrant?",
  reflectionOptions: ["Quadrant III", "Quadrant I", "Quadrant II"],
  skills: ["Reason from signs", "Predict quadrants", "Justify a position"],
  next: "Change One Coordinate",
  createTaskSet: createCoordReasoningTaskSet,
});
