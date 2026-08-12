import { changeWhichTask, crossAxisTask, reverseTask } from "./cartesianTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathCartesian", "starpathCartesian", "starpathCartesian"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l6Coord");

export const createChangeCoordTaskSet = () => taskSet([changeWhichTask, changeWhichTask, changeWhichTask], teach("Coordinate Change", "A move along one direction changes one number.", "When a point slides left or right, only the across number changes. When it slides up or down, only the up-and-down number changes."));
export const createCrossAxesTaskSet = () => taskSet([crossAxisTask, crossAxisTask, crossAxisTask], teach("Cross the Axes", "Crossing an axis flips a sign.", "Keep counting past the origin. As a point crosses the y-axis its x-coordinate changes sign; crossing the x-axis flips the y-coordinate."), 20);
export const createReverseMoveTaskSet = () => taskSet([reverseTask, reverseTask, reverseTask], teach("Reverse the Movement", "Work out the move from before and after.", "Compare a point with its image. Count how far and in which direction it moved to describe the movement rule."), 30);

export const CHANGE_COORD_CONTENT = lessonContent({
  title: "Change One Coordinate",
  brief: "Relate an axis-aligned move to the single coordinate that changes.",
  criteria: ["connect a move to one changing coordinate", "compare before and after", "read the direction of change"],
  activities: ["Which Changed?", "Compare the Pair", "Change Again"],
  kinds,
  reflection: "Moving straight up changes which coordinate?",
  reflectionOptions: ["Only the up-and-down number (y)", "Only the across number (x)", "Both numbers"],
  skills: ["Link moves to coordinates", "Compare ordered pairs", "Read change direction"],
  next: "Cross the Axes",
  createTaskSet: createChangeCoordTaskSet,
});

export const CROSS_AXES_CONTENT = lessonContent({
  title: "Cross the Axes",
  brief: "Track signs and values as a point moves across the axes.",
  criteria: ["move a point across an axis", "flip a coordinate's sign", "land on a signed point"],
  activities: ["Cross Over", "Flip the Sign", "Land the Rover"],
  kinds,
  reflection: "What happens when a point crosses the y-axis?",
  reflectionOptions: ["Its x-coordinate changes sign", "Its y-coordinate changes sign", "Nothing changes"],
  skills: ["Move across axes", "Track sign changes", "Plot signed images"],
  next: "Reverse the Movement",
  createTaskSet: createCrossAxesTaskSet,
});

export const REVERSE_MOVE_CONTENT = lessonContent({
  title: "Reverse the Movement",
  brief: "Infer a movement rule from a point and its image.",
  criteria: ["compare a point and its image", "describe the move", "reverse a movement"],
  activities: ["Name the Move", "How Far, Which Way?", "Reverse It"],
  kinds,
  reflection: "How do you find the move between two points?",
  reflectionOptions: ["Count how far and which way", "Add the coordinates", "Guess the direction"],
  skills: ["Infer a move rule", "Measure change", "Describe movement"],
  next: "Week 4 Voyage Quiz",
  createTaskSet: createReverseMoveTaskSet,
});
