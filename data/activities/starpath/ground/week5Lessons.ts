import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { placeItTask, sayWhereTask, whichPictureTask } from "./week4Tasks";
import type { PositionObjectId, PositionRelation } from "./position-objects";

const PEOPLE: PositionObjectId[] = ["explorer", "geospin"];
const LANDMARKS: PositionObjectId[] = ["rocket", "flag", "planet", "cave"];
const PLANAR: PositionRelation[] = ["above", "below", "beside"];
const POSITION_POOL: PositionRelation[] = ["above", "below", "beside", "in-front", "behind"];

function intro(target: number, heading: string, prompt: string, speakText: string) {
  return { kind: "starpathShapeIntro" as const, scene: "intro" as const, variant: "positions" as const, heading, prompt, speakText, target };
}

function peopleTaskSet(focus: "self" | "people" | "mission"): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  const copy = focus === "self"
    ? ["Where am I?", "Describe where the explorer is.", "Use a position word to tell where the explorer is compared with a familiar object."]
    : focus === "people"
      ? ["Where are we?", "Compare where people are.", "Describe where one person is compared with another person or object."]
      : ["Position mission", "Use every position clue.", "Place people, read scenes and describe locations using a clear reference."];
  return {
    teaching: () => intro(++target, copy[0]!, copy[1]!, copy[2]!),
    activities: [
      () => sayWhereTask(a++, ++target, PLANAR, POSITION_POOL, { anchors: LANDMARKS, subjects: PEOPLE }),
      () => whichPictureTask(b++, ++target, PLANAR, { anchors: [...PEOPLE, ...LANDMARKS], subjects: PEOPLE }),
      () => placeItTask(c++, ++target, { anchors: [...PEOPLE, ...LANDMARKS], subjects: PEOPLE }),
    ],
  };
}

export const WHERE_AM_I_CONTENT = {
  missionBrief: "Help the explorer describe where they are compared with familiar objects.",
  successCriteria: ["name the reference object", "choose a position word", "place the explorer correctly"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Where Am I?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "describe-self", title: "Where Am I?", description: "Describe the explorer's position relative to an object.", taskKinds: ["starpathPositionWord"] },
    { key: "match-position", title: "Match the Scene", description: "Choose the picture with the stated explorer position.", taskKinds: ["starpathPositionPicture"] },
    { key: "place-explorer", title: "Place the Explorer", description: "Place the explorer relative to a familiar object.", taskKinds: ["starpathPositionPlace"] },
  ],
  reflection: { prompt: "What makes a position description clear?", options: ["A position word", "A reference object", "Both"] },
  practisedSkills: ["Describe their own represented position", "Use a named reference", "Place a person in a stated position"],
  nextUpLabel: "Where Are We?",
  createTaskSet: () => peopleTaskSet("self"),
} satisfies StarpathLessonContent;

export const WHERE_ARE_WE_CONTENT = {
  missionBrief: "Compare where the explorer and Geospin are in a familiar space.",
  successCriteria: ["compare two positions", "say who the reference is", "match a position picture"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Where Are We?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "compare-people", title: "Compare People", description: "Describe one person's position relative to another.", taskKinds: ["starpathPositionWord"] },
    { key: "choose-scene", title: "Choose the Scene", description: "Match people and objects to a position clue.", taskKinds: ["starpathPositionPicture"] },
    { key: "place-person", title: "Place the Person", description: "Place a person using a relative-position clue.", taskKinds: ["starpathPositionPlace"] },
  ],
  reflection: { prompt: "Whose position did you describe?", options: ["The explorer", "Geospin", "Both"] },
  practisedSkills: ["Describe one person relative to another", "Interpret position pictures", "Place a person relative to a reference"],
  nextUpLabel: "Position Mission",
  createTaskSet: () => peopleTaskSet("people"),
} satisfies StarpathLessonContent;

export const POSITION_MISSION_CONTENT = {
  missionBrief: "Complete a people-and-places mission using clear relative-position language.",
  successCriteria: ["identify the reference", "interpret a position", "create the stated position"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Position Mission", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "say-position", title: "Say the Position", description: "Describe where a person is.", taskKinds: ["starpathPositionWord"] },
    { key: "check-scene", title: "Check the Scene", description: "Choose the scene that matches a clue.", taskKinds: ["starpathPositionPicture"] },
    { key: "build-position", title: "Build the Position", description: "Place a person in the stated position.", taskKinds: ["starpathPositionPlace"] },
  ],
  reflection: { prompt: "What made each clue clear?", options: ["A position word", "A reference", "Both"] },
  practisedSkills: ["Describe people and objects in familiar space", "Use references consistently", "Create a stated relative position"],
  nextUpLabel: "Location Clues",
  createTaskSet: () => peopleTaskSet("mission"),
} satisfies StarpathLessonContent;

// Stable exports used by the lesson-content registry.
export const MOVE_IT_THERE_CONTENT = WHERE_AM_I_CONTENT;
export const WHICH_WAY_CONTENT = WHERE_ARE_WE_CONTENT;
export const DIRECTION_MISSION_CONTENT = POSITION_MISSION_CONTENT;
