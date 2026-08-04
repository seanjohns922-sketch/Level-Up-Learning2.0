import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

type Landmark = { id: string; label: string; object: string; symbol: string };
type Relation = "above" | "below" | "leftOf" | "rightOf";
type Constraint = { subjectId: string; relation: Relation; referenceId: string; text: string };
type Spec = { landmarks: Landmark[]; constraints: Constraint[] };

const ALL: Record<string, Landmark> = {
  tent: { id: "tent", label: "Space Tent", object: "cave", symbol: "▲" },
  fire: { id: "fire", label: "Signal Fire", object: "star", symbol: "✦" },
  rover: { id: "rover", label: "Rover", object: "rover", symbol: "●" },
  dome: { id: "dome", label: "Moon Dome", object: "planet", symbol: "◆" },
  flag: { id: "flag", label: "Flag", object: "flag", symbol: "■" },
  observatory: { id: "observatory", label: "Observatory", object: "satellite", symbol: "☾" },
};

const SPECS: Spec[][] = [
  [
    { landmarks: [ALL.tent!, ALL.fire!], constraints: [{ subjectId: "tent", relation: "above", referenceId: "fire", text: "The Space Tent is above the Signal Fire." }] },
    { landmarks: [ALL.rover!, ALL.dome!, ALL.flag!], constraints: [{ subjectId: "rover", relation: "leftOf", referenceId: "dome", text: "The Rover is left of the Moon Dome." }, { subjectId: "flag", relation: "below", referenceId: "rover", text: "The Flag is below the Rover." }] },
  ],
  [
    { landmarks: [ALL.rover!, ALL.dome!, ALL.flag!], constraints: [{ subjectId: "rover", relation: "leftOf", referenceId: "dome", text: "The Rover is left of the Moon Dome." }, { subjectId: "flag", relation: "below", referenceId: "rover", text: "The Flag is below the Rover." }] },
    { landmarks: [ALL.observatory!, ALL.dome!, ALL.fire!], constraints: [{ subjectId: "observatory", relation: "above", referenceId: "dome", text: "The Observatory is above the Moon Dome." }, { subjectId: "fire", relation: "rightOf", referenceId: "dome", text: "The Signal Fire is right of the Moon Dome." }] },
  ],
  [
    { landmarks: [ALL.rover!, ALL.dome!, ALL.flag!, ALL.observatory!], constraints: [{ subjectId: "rover", relation: "leftOf", referenceId: "dome", text: "The Rover is left of the Moon Dome." }, { subjectId: "flag", relation: "below", referenceId: "rover", text: "The Flag is below the Rover." }, { subjectId: "observatory", relation: "above", referenceId: "dome", text: "The Observatory is above the Moon Dome." }] },
    { landmarks: [ALL.tent!, ALL.fire!, ALL.rover!, ALL.flag!], constraints: [{ subjectId: "tent", relation: "above", referenceId: "fire", text: "The Space Tent is above the Signal Fire." }, { subjectId: "rover", relation: "rightOf", referenceId: "fire", text: "The Rover is right of the Signal Fire." }, { subjectId: "flag", relation: "below", referenceId: "rover", text: "The Flag is below the Rover." }] },
  ],
];

function createTask(level: 0 | 1 | 2, round: number, target: number): PracticeTask {
  const spec = SPECS[level][round % SPECS[level].length]!;
  return { kind: "starpathMapCreate", prompt: level === 0 ? "Build the space camp from the condition." : level === 1 ? "Place the landmarks so both clues are true." : "Build a map that satisfies every condition.", speakText: `Place every landmark on the map. ${spec.constraints.map((item) => item.text).join(" ")}`, target, mapId: `creator-${level}-${round}`, cols: 8, rows: 4, landmarks: spec.landmarks, constraints: spec.constraints, feedback: { correct: "Your map satisfies every condition.", wrong: "Check each condition and reposition any landmark that does not fit." } };
}

export const drawCampTask = (round: number, target: number) => createTask(0, round, target);
export const placeLandmarksTask = (round: number, target: number) => createTask(1, round, target);
export const mapBuilderTask = (round: number, target: number) => createTask(2, round, target);
export const createDrawCampTaskSet = () => taskSet([drawCampTask, drawCampTask, drawCampTask], teaching("mapPositions", "Draw My Space Camp", "Place landmarks to show a simple layout.", "Select a landmark, tap a map cell, and make the stated relative position true."));
export const createPlaceLandmarksTaskSet = () => taskSet([placeLandmarksTask, placeLandmarksTask, placeLandmarksTask], teaching("mapPositions", "Place the Landmarks", "Build a map from two relative clues.", "Every landmark must be placed so both clues are true at the same time."), 20);
export const createMapBuilderTaskSet = () => taskSet([mapBuilderTask, mapBuilderTask, mapBuilderTask], teaching("mapPositions", "Map Builder", "Make a complete map another person can read.", "Place every landmark and check every condition before submitting your map."), 30);

export const DRAW_CAMP_CONTENT = lessonContent({ title: "Draw My Space Camp", brief: "Create a simple top-view camp map by placing two or three landmarks in the described layout.", criteria: ["select a landmark", "place it on the grid", "check the relative position"], activities: ["Tent and Fire", "Camp Layout", "Map Check"], kinds: ["starpathMapCreate", "starpathMapCreate", "starpathMapCreate"], reflection: "How did you make the layout?", reflectionOptions: ["I read the condition", "I placed the reference first", "I checked the positions"], skills: ["Create a simple map", "Place landmarks", "Show relative position"], next: "Place the Landmarks", createTaskSet: createDrawCampTaskSet });
export const PLACE_LANDMARKS_CONTENT = lessonContent({ title: "Place the Landmarks", brief: "Create a map from connected relative clues so every landmark is correctly positioned.", criteria: ["read both clues", "connect the landmarks", "make both clues true"], activities: ["Two Clues", "Linked Layout", "Position Check"], kinds: ["starpathMapCreate", "starpathMapCreate", "starpathMapCreate"], reflection: "How did you satisfy both clues?", reflectionOptions: ["I linked the clues", "I moved landmarks", "I checked both"], skills: ["Create from clues", "Coordinate positions", "Validate a layout"], next: "Map Builder", createTaskSet: createPlaceLandmarksTaskSet });
export const MAP_BUILDER_CONTENT = lessonContent({ title: "Map Builder", brief: "Build a complete readable map with all landmarks satisfying every condition.", criteria: ["place every landmark", "satisfy every condition", "check the finished map"], activities: ["Four Landmarks", "Constraint Builder", "Readable Map"], kinds: ["starpathMapCreate", "starpathMapCreate", "starpathMapCreate"], reflection: "Could another person read your map?", reflectionOptions: ["Every landmark is shown", "Every condition is true", "The layout is clear"], skills: ["Build a complete map", "Meet multiple constraints", "Create a readable representation"], next: "Week 5 Voyage Quiz", createTaskSet: createMapBuilderTaskSet });
