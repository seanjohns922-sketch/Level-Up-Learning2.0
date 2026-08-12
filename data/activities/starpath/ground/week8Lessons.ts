import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { shapeMatchTask } from "./week1Lesson1";
import { compareShapeTask, familyStationTask, oddShapeTask } from "./week3Tasks";
import { findItTask, followCluesTask, placeItTask, sayWhereTask, whichPictureTask } from "./week4Tasks";
import type { PositionObjectId, PositionRelation } from "./position-objects";

const ALL_RELATIONS: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];
const PEOPLE: PositionObjectId[] = ["explorer", "geospin"];
const REFERENCES: PositionObjectId[] = ["flag", "rocket", "planet", "cave", ...PEOPLE];

// ── Lesson 1 — Shape Explorer Challenge ──────────────────────────────────────
export function createShapeExplorerChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "shapes",
      heading: "Shape Explorer challenge",
      prompt: "Show everything you know about shapes.",
      speakText: "Welcome to Space Graduation! First, show what you know about shapes. Recognise, sort and compare familiar shapes.",
      target: ++target,
    }),
    activities: [
      () => shapeMatchTask(a++, ++target),
      () => oddShapeTask(b++, ++target),
      () => compareShapeTask(c++, ++target),
    ],
  };
}

export const SHAPE_EXPLORER_CHALLENGE_CONTENT = {
  missionBrief: "Begin your Space Graduation. Recognise, sort and compare familiar shapes to prove your shape skills.",
  successCriteria: ["recognise shapes", "sort shapes", "compare shapes"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Shape Explorer Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "recognise", title: "Recognise", description: "Find the named familiar shape.", taskKinds: ["starpathShapeMatch"] },
    { key: "sort", title: "Odd One Out", description: "Spot the shape that does not belong.", taskKinds: ["starpathOddOneOut"] },
    { key: "compare", title: "Compare", description: "Decide if two shapes are the same.", taskKinds: ["starpathShapeCompare"] },
  ],
  reflection: { prompt: "Which shape skill felt easiest?", options: ["Recognising", "Sorting", "Comparing"] },
  practisedSkills: ["Recognise familiar shapes", "Sort shapes and spot the odd one", "Compare shapes past colour and size"],
  nextUpLabel: "Position Explorer Challenge",
  createTaskSet: createShapeExplorerChallengeTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 2 — Position Explorer Challenge ───────────────────────────────────
export function createPositionExplorerChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positions",
      heading: "Position Explorer challenge",
      prompt: "Show everything you know about position.",
      speakText: "Now show what you know about position. Find people and objects, describe where they are and place them from a clue.",
      target: ++target,
    }),
    activities: [
      () => findItTask(a++, ++target, ALL_RELATIONS),
      () => sayWhereTask(b++, ++target, ALL_RELATIONS, ALL_RELATIONS),
      () => placeItTask(c++, ++target, { anchors: REFERENCES, subjects: PEOPLE }),
    ],
  };
}

export const POSITION_EXPLORER_CHALLENGE_CONTENT = {
  missionBrief: "Continue your Space Graduation. Find, describe and place people and objects using relative-position clues.",
  successCriteria: ["find by position", "say where things are", "place from a clue"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Position Explorer Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-by-position", title: "Find It", description: "Find the object a position clue describes.", taskKinds: ["starpathPositionFind"] },
    { key: "say-where", title: "Say Where", description: "Choose the word for where an object is.", taskKinds: ["starpathPositionWord"] },
    { key: "place-person", title: "Place the Explorer", description: "Place a person relative to a named reference.", taskKinds: ["starpathPositionPlace"] },
  ],
  reflection: { prompt: "Which space skill felt strongest?", options: ["Finding by position", "Saying where", "Placing from clues"] },
  practisedSkills: ["Find an object by position", "Describe an object's position", "Place a person relative to a reference"],
  nextUpLabel: "Geospin's Final Mission",
  createTaskSet: createPositionExplorerChallengeTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 3 — Geospin's Final Mission ───────────────────────────────────────
export function createFinalMissionTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positions",
      heading: "Geospin's final mission",
      prompt: "Bring every skill together.",
      speakText: "This is the final mission. Bring together everything you know about shapes and relative position to help Geospin graduate.",
      target: ++target,
    }),
    activities: [
      () => familyStationTask(a++, ++target),
      () => whichPictureTask(b++, ++target, ALL_RELATIONS),
      () => compareShapeTask(c++, ++target),
      () => followCluesTask(d++, ++target, "mission"),
    ],
  };
}

export const FINAL_MISSION_CONTENT = {
  missionBrief: "Complete Geospin's final mission. Combine shape sorting, comparison and relative-position clues to graduate from Ground Level.",
  successCriteria: ["sort shapes", "use position", "follow location clues"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Geospin's Final Mission", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "sort-shapes", title: "Sort the Shapes", description: "Sort each shape into its family.", taskKinds: ["starpathFamilySort"] },
    { key: "which-picture", title: "Which Picture?", description: "Choose the scene that matches the position.", taskKinds: ["starpathPositionPicture"] },
    { key: "compare", title: "Compare", description: "Decide if two shapes are the same.", taskKinds: ["starpathShapeCompare"] },
    { key: "final-clues", title: "Final Clues", description: "Use several relative-position clues to finish the mission.", taskKinds: ["starpathPositionSequence"] },
  ],
  reflection: { prompt: "You did it! What are you proudest of?", options: ["My shape skills", "My position skills", "My clue skills"] },
  practisedSkills: ["Sort shapes into families", "Apply position and comparison", "Interpret several relative-position clues"],
  nextUpLabel: "Ground Graduate",
  createTaskSet: createFinalMissionTaskSet,
} satisfies StarpathLessonContent;
