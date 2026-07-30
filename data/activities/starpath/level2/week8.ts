import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_TWO_ARTWORK } from "./star-maps";
import { compareTask, edgeTask, parallelYesNoTask, sidesCountTask } from "./shapeWeeks";
import { findTask, whatIsHereTask } from "./week4StarMaps";
import { chooseMapTask, followMapTask, giveMapTask } from "./navWeeks";

// Level 2 · Week 8 — Master Mapper. Cumulative: shape features, map reading and
// map navigation together. Completion unlocks the Year 2 Post-Test.

function teaching(
  variant: "masterShapeMap" | "masterPathway" | "masterMission",
  heading: string,
  prompt: string,
  speakText: string
) {
  let target = 0;
  return () =>
    ({ kind: "starpathShapeIntro", scene: "intro", variant, heading, prompt, speakText, target: ++target }) satisfies PracticeTask;
}

export function createShapeAndMapTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching("masterShapeMap", "Shape and Map", "Shapes and maps together.", "Use your shape skills and your map skills together in one mission."),
    activities: [
      () => edgeTask(a++, ++target),
      () => sidesCountTask(b++ + 1, ++target),
      () => findTask(c++ + 2, ++target),
    ],
  };
}

export function createPathwayMasterTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching("masterPathway", "Pathway Master", "Follow and give pathways.", "Read the map, follow a path, and give your own route to a place."),
    activities: [
      () => whatIsHereTask(a++, ++target),
      () => followMapTask(b++ + 1, ++target),
      () => giveMapTask(c++ + 2, ++target),
    ],
  };
}

export function createMasterMissionTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching("masterMission", "Master Mission", "Everything together.", "The final Space Mapper mission: compare shapes, read the map and navigate to the goal."),
    activities: [
      () => (a % 2 === 0 ? compareTask(a++, ++target, "same") : parallelYesNoTask(a++, ++target)),
      () => chooseMapTask(b++ + 1, ++target),
      () => giveMapTask(c++ + 2, ++target),
    ],
  };
}

function content(title: string, brief: string, criteria: [string, string, string], acts: [string, string, string], reflectPrompt: string, reflectOpts: [string, string, string], skills: [string, string, string], nextUp: string, createTaskSet: () => RealmLessonTaskSet): StarpathLessonContent {
  return {
    missionBrief: brief,
    successCriteria: criteria,
    artworkSrc: LEVEL_TWO_ARTWORK,
    teaching: { title, durationMinutes: 1, taskKind: "starpathShapeIntro" },
    activities: [
      { key: "a1", title: acts[0], description: acts[0], taskKinds: ["starpathShapeFeature", "starpathMapLocate", "starpathMapRoute"] },
      { key: "a2", title: acts[1], description: acts[1], taskKinds: ["starpathShapeFeature", "starpathMapLocate", "starpathMapRoute"] },
      { key: "a3", title: acts[2], description: acts[2], taskKinds: ["starpathShapeFeature", "starpathMapLocate", "starpathMapRoute"] },
    ],
    reflection: { prompt: reflectPrompt, options: reflectOpts },
    practisedSkills: skills,
    nextUpLabel: nextUp,
    createTaskSet,
  } satisfies StarpathLessonContent;
}

export const SHAPE_AND_MAP_CONTENT = content("Shape and Map", "Begin Master Mapper graduation. Use shape features and map reading together.", ["read shape features", "read the map", "combine both skills"], ["Shape Skills", "Map Skills", "Both Together"], "How did you combine your skills?", ["I read shape features", "I read the map", "I used both"], ["Shape features", "Map reading", "Combine skills"], "Pathway Master", createShapeAndMapTaskSet);
export const PATHWAY_MASTER_CONTENT = content("Pathway Master", "Read the map, follow a path, and give your own route to a place.", ["read the map", "follow a path", "give a route"], ["Read", "Follow", "Give"], "How did you master pathways?", ["I read the map", "I followed a path", "I gave a route"], ["Read a map", "Follow a path", "Give a route"], "Master Mission", createPathwayMasterTaskSet);
export const MASTER_MISSION_CONTENT = content("Master Mission", "The final mission — compare shapes, read the map and navigate to the goal.", ["compare shapes", "read the map", "navigate to the goal"], ["Shapes", "Map", "Navigate"], "You are a Space Mapper! What did you master?", ["Comparing shapes", "Reading maps", "Navigating pathways"], ["Compare shapes", "Read maps", "Navigate"], "Level 2 Post-Test", createMasterMissionTaskSet);
