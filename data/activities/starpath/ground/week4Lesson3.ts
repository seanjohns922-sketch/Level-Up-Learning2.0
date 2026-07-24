import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { followCluesTask, sayWhereTask } from "./week4Tasks";
import type { PositionRelation } from "./position-objects";

const L3_CORRECT: PositionRelation[] = ["above", "below", "beside", "behind"];
const L3_OPTION_POOL: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

export function createPositionChallengeTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let clueRound = 0;
  let mapRound = 0;
  let missionRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positions",
      heading: "Position Challenge",
      prompt: "Good explorers always know where things are.",
      speakText: "You are ready for a position challenge! Follow the clues, read the space map and complete Geospin's mission using everything you know about position.",
      target: ++target,
    }),
    activities: [
      () => followCluesTask(clueRound++, ++target, "clues"),
      () => sayWhereTask(mapRound++, ++target, L3_CORRECT, L3_OPTION_POOL),
      () => followCluesTask(missionRound++, ++target, "mission"),
    ],
  };
}

export const POSITION_CHALLENGE_CONTENT = {
  missionBrief: "Take on Geospin's Week 4 position challenge: follow the clues, read the Starpath space map and complete a final explorer mission.",
  successCriteria: ["recognise positions", "follow clues", "solve a space mission"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Position Challenge", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "follow-the-clues", title: "Follow the Clues", description: "Complete one positional clue at a time.", taskKinds: ["starpathPositionSequence"] },
    { key: "space-map", title: "Space Map", description: "Read the scene and say where the object is.", taskKinds: ["starpathPositionWord"] },
    { key: "explorer-mission", title: "Explorer Mission", description: "Complete a final mission by following positional clues.", taskKinds: ["starpathPositionSequence"] },
  ],
  reflection: { prompt: "Which explorer skill helped you most?", options: ["Following clues", "Reading the map", "Knowing positions"] },
  practisedSkills: ["Follow a sequence of positional clues", "Read a scene and describe a position", "Apply position language to complete a mission"],
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createPositionChallengeTaskSet,
} satisfies StarpathLessonContent;
