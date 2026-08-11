import { moveTask, moveAxisTask, followTask, commandsTask, routeTask, GRID_8 } from "./coordinateTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathCoordinate", "starpathCoordinate", "starpathCoordinate"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l5Coord");

// Week 5 onward uses the standard 8x8 grid (Week 4 keeps the 6x6 intro grid).
export const createMoveAxisTaskSet = () => taskSet([
  (r, t) => moveTask(r, t, GRID_8),
  (r, t) => moveAxisTask(r, t, GRID_8),
  (r, t) => moveTask(r, t, GRID_8),
], teach("Move Along an Axis", "A move along one direction changes one number.", "Moving up or down changes only the up number. Moving left or right changes only the across number."));
export const createFollowCommandsTaskSet = () => taskSet([
  (r, t) => followTask(r, t, GRID_8),
  (r, t) => commandsTask(r, t, GRID_8),
  (r, t) => followTask(r, t, GRID_8),
], teach("Follow Coordinate Commands", "Apply moves in order to reach a position.", "Each command moves the rover one square. Follow them in order, one at a time, to find where it ends."), 20);
export const createPlanRouteTaskSet = () => taskSet([
  (r, t) => routeTask(r, t, GRID_8),
  (r, t) => routeTask(r, t, GRID_8),
  (r, t) => commandsTask(r, t, GRID_8),
], teach("Plan an Efficient Route", "The best route uses the fewest moves.", "Plan a path that reaches the goal, stays on the grid, avoids blocked sectors and uses as few moves as possible."), 30);

export const MOVE_AXIS_CONTENT = lessonContent({
  title: "Move Along an Axis",
  brief: "Connect horizontal and vertical moves to changes in one coordinate.",
  criteria: ["move along one axis", "change only one number", "identify which number changed"],
  activities: ["Land the Rover", "Which Number Changed?", "Move Again"],
  kinds,
  reflection: "What changes when the rover moves up?",
  reflectionOptions: ["Only the up number", "Only the across number", "Both numbers"],
  skills: ["Move along an axis", "Relate moves to coordinates", "Compare ordered pairs"],
  next: "Follow Coordinate Commands",
  createTaskSet: createMoveAxisTaskSet,
});

export const FOLLOW_COMMANDS_CONTENT = lessonContent({
  title: "Follow Coordinate Commands",
  brief: "Apply and build ordered sequences of coordinate moves.",
  criteria: ["follow a command sequence", "track position step by step", "reach a target"],
  activities: ["Follow the Commands", "Send the Rover", "Follow Again"],
  kinds,
  reflection: "How do you follow a command sequence?",
  reflectionOptions: ["One move at a time, in order", "All at once", "In any order"],
  skills: ["Follow command sequences", "Track position", "Build a route"],
  next: "Plan an Efficient Route",
  createTaskSet: createFollowCommandsTaskSet,
});

export const PLAN_ROUTE_CONTENT = lessonContent({
  title: "Plan an Efficient Route",
  brief: "Plan the shortest valid route to a goal around blocked sectors.",
  criteria: ["reach the goal", "avoid blocked sectors", "use the fewest moves"],
  activities: ["Shortest Path", "Route Around", "Send the Rover"],
  kinds,
  reflection: "What makes a route efficient?",
  reflectionOptions: ["It uses the fewest moves", "It is the most colourful", "It visits every square"],
  skills: ["Plan efficient routes", "Avoid obstacles", "Compare pathways"],
  next: "Week 5 Voyage Quiz",
  createTaskSet: createPlanRouteTaskSet,
});
