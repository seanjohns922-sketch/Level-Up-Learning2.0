import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { debugMapTask, followMapTask, missionMapTask } from "@/data/activities/starpath/level2/navWeeks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

export const treasureHuntTask = (round: number, target: number): PracticeTask => {
  const task = followMapTask(round, target);
  return task.kind === "starpathMapRoute" ? { ...task, prompt: `Treasure hunt: ${task.prompt}`, speakText: `Treasure hunt. ${task.speakText}` } : task;
};
export const observatoryMissionTask = (round: number, target: number): PracticeTask => {
  const task = missionMapTask(round, target);
  if (task.kind !== "starpathMapRoute") return task;
  const landmarks = task.landmarks.map((landmark) => landmark.r === task.goal.r && landmark.c === task.goal.c
    ? { ...landmark, id: "observatory", label: "Observatory", object: "satellite" }
    : landmark);
  const checkpoint = task.checkpoints?.[0]?.label ?? "the checkpoint";
  const missionRule = `Visit ${checkpoint}, avoid the asteroids, then reach the Observatory.`;
  return {
    ...task,
    prompt: "Plan a route to the Observatory.",
    speakText: `Plan a landmark route. ${missionRule}`,
    landmarks,
    goal: { ...task.goal, object: "satellite", label: "Observatory" },
    missionRule,
    feedback: { ...task.feedback, correct: "Mission complete — you reached the Observatory!" },
  };
};
export const missionControlTask = (round: number, target: number): PracticeTask => round % 2 ? debugMapTask(round, target) : missionMapTask(round, target);

export const createTreasureHuntTaskSet = () => taskSet([treasureHuntTask, treasureHuntTask, treasureHuntTask], teaching("mapRoute", "Treasure Hunt", "Follow a landmark-anchored route.", "Start at the rover and follow each ordered direction until you reach the named landmark."));
export const createObservatoryMissionTaskSet = () => taskSet([observatoryMissionTask, observatoryMissionTask, observatoryMissionTask], teaching("mapMission", "Find the Observatory", "Plan a route to a named landmark.", "Use the landmark positions to build a route that follows every mission rule."), 20);
export const createMissionControlTaskSet = () => taskSet([missionControlTask, missionControlTask, missionControlTask], teaching("mapDebug", "Mission Control", "Plan, test and fix landmark routes.", "Locate the mission landmarks, run the route, and identify any step that sends the rover off course."), 30);

export const TREASURE_HUNT_CONTENT = lessonContent({ title: "Treasure Hunt", brief: "Follow ordered directions from a known landmark to reach the treasure location.", criteria: ["find the start", "follow moves in order", "reach the landmark"], activities: ["Route One", "Route Check", "Treasure Route"], kinds: ["starpathMapRoute", "starpathMapRoute", "starpathMapRoute"], reflection: "How did you follow the route?", reflectionOptions: ["I found the start", "I moved one step at a time", "I checked the landmark"], skills: ["Follow a route", "Use landmarks", "Navigate in order"], next: "Find the Observatory", createTaskSet: createTreasureHuntTaskSet });
export const FIND_OBSERVATORY_CONTENT = lessonContent({ title: "Find the Observatory", brief: "Plan your own route to a named landmark while satisfying the mission rules.", criteria: ["locate the goal", "plan the route", "obey every rule"], activities: ["Locate the Goal", "Plan the Route", "Run the Mission"], kinds: ["starpathMapRoute", "starpathMapRoute", "starpathMapRoute"], reflection: "How did you plan the mission?", reflectionOptions: ["I located the landmarks", "I avoided hazards", "I tested my route"], skills: ["Plan a route", "Navigate to a landmark", "Meet route constraints"], next: "Mission Control", createTaskSet: createObservatoryMissionTaskSet });
export const MISSION_CONTROL_CONTENT = lessonContent({ title: "Mission Control", brief: "Complete multi-step missions by locating landmarks, planning routes and fixing broken directions.", criteria: ["locate first", "route second", "test and fix"], activities: ["Mission Plan", "Route Debug", "Control Check"], kinds: ["starpathMapRoute", "starpathMapRoute", "starpathMapRoute"], reflection: "What did Mission Control require?", reflectionOptions: ["I read the map", "I planned in order", "I fixed the wrong step"], skills: ["Combine location and route", "Debug navigation", "Complete a mission"], next: "Week 6 Voyage Quiz", createTaskSet: createMissionControlTaskSet });
