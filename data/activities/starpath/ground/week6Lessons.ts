import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { findItTask, followCluesTask, sayWhereTask, whichPictureTask } from "./week4Tasks";
import type { PositionRelation } from "./position-objects";

const RELATIONS: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

function locationTaskSet(mode: "find" | "geospin" | "treasure"): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  const heading = mode === "find" ? "Find the explorer" : mode === "geospin" ? "Help Geospin" : "Hidden treasure";
  const prompt = mode === "find" ? "Use position clues to find a person." : mode === "geospin" ? "Use location clues to find what Geospin needs." : "Use several position clues to find the treasure.";
  return {
    teaching: () => ({ kind: "starpathShapeIntro", scene: "intro", variant: "positions", heading, prompt, speakText: prompt, target: ++target }),
    activities: mode === "treasure"
      ? [
          () => followCluesTask(a++, ++target, "clues"),
          () => whichPictureTask(b++, ++target, RELATIONS),
          () => followCluesTask(c++, ++target, "mission"),
        ]
      : [
          () => findItTask(a++, ++target, RELATIONS),
          () => sayWhereTask(b++, ++target, RELATIONS, RELATIONS),
          () => whichPictureTask(c++, ++target, RELATIONS),
        ],
  };
}

function content(title: string, brief: string, mode: "find" | "geospin" | "treasure", nextUpLabel: string): StarpathLessonContent {
  const sequence = mode === "treasure";
  return {
    missionBrief: brief,
    successCriteria: ["use the named reference", "interpret position words", sequence ? "follow several location clues" : "match a clue to a scene"],
    artworkSrc: "/images/starpath-home-bg-ground.png",
    teaching: { title, durationMinutes: 1, taskKind: "starpathShapeIntro" },
    activities: sequence
      ? [
          { key: "clue-one", title: "Follow the Clues", description: "Find each object from its position clue.", taskKinds: ["starpathPositionSequence"] },
          { key: "check-scene", title: "Check the Scene", description: "Choose the picture matching a location clue.", taskKinds: ["starpathPositionPicture"] },
          { key: "treasure", title: "Treasure Mission", description: "Use several clues to locate the hidden treasure.", taskKinds: ["starpathPositionSequence"] },
        ]
      : [
          { key: "find", title: "Find It", description: "Find an object from a position clue.", taskKinds: ["starpathPositionFind"] },
          { key: "describe", title: "Say Where", description: "Describe where an object is relative to another.", taskKinds: ["starpathPositionWord"] },
          { key: "picture", title: "Which Picture?", description: "Choose the scene matching the clue.", taskKinds: ["starpathPositionPicture"] },
        ],
    reflection: { prompt: "What helped you locate the object?", options: ["The position word", "The reference object", "Both"] },
    practisedSkills: ["Locate people and objects in familiar space", "Describe a position relative to a reference", "Interpret one or more location clues"],
    nextUpLabel,
    createTaskSet: () => locationTaskSet(mode),
  };
}

export const GUIDE_THE_ROVER_CONTENT = content("Find the Explorer", "Use relative-position clues to locate the explorer and familiar objects.", "find", "Help Geospin");
export const GUIDE_THE_ROCKET_CONTENT = GUIDE_THE_ROVER_CONTENT;
export const HELP_GEOSPIN_CONTENT = content("Help Geospin", "Help Geospin interpret and describe where people and objects are.", "geospin", "Hidden Treasure");
export const HIDDEN_TREASURE_CONTENT = content("Hidden Treasure", "Use several relative-position clues to locate hidden objects in a familiar space.", "treasure", "Shape and Position Worlds");
