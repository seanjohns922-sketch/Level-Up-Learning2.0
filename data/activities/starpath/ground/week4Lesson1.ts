import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { findItTask, placeItTask, whichPictureTask } from "./week4Tasks";
import type { PositionRelation } from "./position-objects";

const L1_RELATIONS: PositionRelation[] = ["above", "below", "beside"];

export function createWhereIsItTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let findRound = 0;
  let placeRound = 0;
  let pictureRound = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positions",
      heading: "Where is it?",
      prompt: "Say where things are.",
      speakText: "Good explorers always know where things are. Above means higher up. Below means lower down. Beside means right next to. Let's find where things are!",
      target: ++target,
    }),
    activities: [
      () => findItTask(findRound++, ++target, L1_RELATIONS),
      () => placeItTask(placeRound++, ++target),
      () => whichPictureTask(pictureRound++, ++target, L1_RELATIONS),
    ],
  };
}

export const WHERE_IS_IT_CONTENT = {
  missionBrief: "Geospin needs your help finding things across Starpath. Use above, below and beside to say and show where each object is.",
  successCriteria: ["use the words above and below", "use the words beside and next to", "find objects in the correct place"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Where Is It?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-it", title: "Find It", description: "Tap the object the positional clue describes.", taskKinds: ["starpathPositionFind"] },
    { key: "place-it", title: "Place It", description: "Drag an object into the position Geospin asks for.", taskKinds: ["starpathPositionPlace"] },
    { key: "which-picture", title: "Which Picture?", description: "Choose the picture that shows the correct position.", taskKinds: ["starpathPositionPicture"] },
  ],
  reflection: { prompt: "Which position word did you use today?", options: ["Above", "Below", "Beside"] },
  practisedSkills: ["Find an object from a positional clue", "Place an object above, below or beside another", "Match a described position to a picture"],
  nextUpLabel: "Around Starpath",
  createTaskSet: createWhereIsItTaskSet,
} satisfies StarpathLessonContent;
