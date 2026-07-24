import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { findItTask, sayWhereTask, whichPictureTask } from "./week4Tasks";
import type { PositionRelation } from "./position-objects";

const L2_RELATIONS: PositionRelation[] = ["behind", "in-front", "inside"];
const L2_OPTION_POOL: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

export function createAroundStarpathTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let sayRound = 0;
  let findRound = 0;
  let pictureRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positionsDepth",
      heading: "Around Starpath",
      prompt: "Behind, in front and inside.",
      speakText: "Explorers can describe more places. Behind means at the back. In front means at the front. Inside means tucked within. Let's find things around Starpath!",
      target: ++target,
    }),
    activities: [
      () => sayWhereTask(sayRound++, ++target, L2_RELATIONS, L2_OPTION_POOL),
      () => findItTask(findRound++, ++target, L2_RELATIONS),
      () => whichPictureTask(pictureRound++, ++target, L2_RELATIONS),
    ],
  };
}

export const AROUND_STARPATH_CONTENT = {
  missionBrief: "Explore every corner of Starpath. Say where things are and find objects that are behind, in front of and inside other objects.",
  successCriteria: ["use positional words", "follow directions", "find objects"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Around Starpath", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "hide-and-seek", title: "Hide and Seek", description: "Look at the scene and choose the word for where the object is.", taskKinds: ["starpathPositionWord"] },
    { key: "space-explorer", title: "Space Explorer", description: "Follow the clue and tap the object in the right place.", taskKinds: ["starpathPositionFind"] },
    { key: "match-the-position", title: "Match the Position", description: "Choose the picture that shows the described position.", taskKinds: ["starpathPositionPicture"] },
  ],
  reflection: { prompt: "Which new position word did you use?", options: ["Behind", "In front", "Inside"] },
  practisedSkills: ["Say where an object is using a position word", "Find an object that is behind, in front or inside", "Match a described position to a picture"],
  nextUpLabel: "Position Challenge",
  createTaskSet: createAroundStarpathTaskSet,
} satisfies StarpathLessonContent;
