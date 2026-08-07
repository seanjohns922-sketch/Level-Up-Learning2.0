import { orderTask, originTask, plotTask, readTask, errorTask } from "./coordinateTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathCoordinate", "starpathCoordinate", "starpathCoordinate"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l5Coord");

export const createBuildAxesTaskSet = () => taskSet([orderTask, originTask, orderTask], teach("Build the Axes", "A coordinate names how far across, then how far up.", "The origin is the corner where the axes meet, at zero and zero. Read a coordinate across first, then up — the order matters."));
export const createPlotReadTaskSet = () => taskSet([plotTask, readTask, plotTask], teach("Plot and Read", "Plot points and read their coordinates.", "To plot a point, count across then up from the origin. To read one, find how far across it is, then how far up."), 20);
export const createCoordErrorTaskSet = () => taskSet([errorTask, readTask, errorTask], teach("Find the Coordinate Error", "Spot a swapped or mis-scaled coordinate.", "A wrong label usually swaps the across and up numbers, or counts the wrong amount. Re-count to find the true coordinate."), 30);

export const BUILD_AXES_CONTENT = lessonContent({
  title: "Build the Axes",
  brief: "Set up a coordinate system: origin, axes and the across-then-up order.",
  criteria: ["locate the origin", "read across before up", "use a consistent order"],
  activities: ["Across then Up", "Find the Origin", "Order Matters"],
  kinds,
  reflection: "Which number comes first in a coordinate?",
  reflectionOptions: ["The across number", "The up number", "Either one"],
  skills: ["Locate the origin", "Use ordered pairs", "Keep coordinate order"],
  next: "Plot and Read",
  createTaskSet: createBuildAxesTaskSet,
});

export const PLOT_READ_CONTENT = lessonContent({
  title: "Plot and Read",
  brief: "Plot points from ordered pairs and read coordinates from the grid.",
  criteria: ["plot from an ordered pair", "read a point's coordinates", "count from the origin"],
  activities: ["Plot the Point", "Read the Point", "Plot Again"],
  kinds,
  reflection: "How do you plot (3, 2)?",
  reflectionOptions: ["3 across then 2 up", "3 up then 2 across", "Anywhere with a 3 and a 2"],
  skills: ["Plot ordered pairs", "Read coordinates", "Use the origin"],
  next: "Find the Coordinate Error",
  createTaskSet: createPlotReadTaskSet,
});

export const COORD_ERROR_CONTENT = lessonContent({
  title: "Find the Coordinate Error",
  brief: "Diagnose swapped or mis-scaled coordinates and give the correct pair.",
  criteria: ["detect a swapped pair", "detect a mis-counted value", "give the correct coordinate"],
  activities: ["Fix the Label", "Read the Point", "Fix Another"],
  kinds,
  reflection: "What is the most common coordinate mistake?",
  reflectionOptions: ["Swapping across and up", "Using the origin", "Counting up first is fine"],
  skills: ["Detect coordinate errors", "Correct ordered pairs", "Reason about order"],
  next: "Week 4 Voyage Quiz",
  createTaskSet: createCoordErrorTaskSet,
});
