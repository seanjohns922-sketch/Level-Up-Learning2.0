import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import {
  buildMatchTask,
  shapeBuilderTask,
  spaceMuseumTask,
} from "@/data/activities/starpath/ground/week2Tasks";

const COSMIC_BUILDS = ["rocket", "planet", "alien", "satellite"] as const;

export function createSpaceBuildersTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let constructionRound = 0;
  let matchRound = 0;
  let museumRound = 0;

  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "builders",
      heading: "Great explorers build",
      prompt: "Build amazing things from simple shapes.",
      speakText:
        "Great explorers build amazing things from simple shapes. Today you can create, compare and explain your shape builds.",
      target: ++target,
    }),
    activities: [
      () => shapeBuilderTask(COSMIC_BUILDS, "free", constructionRound++, ++target),
      () => buildMatchTask(COSMIC_BUILDS, matchRound++, ++target),
      () => spaceMuseumTask(museumRound++, ++target),
    ],
  };
}

export const SPACE_BUILDERS_CONTENT = {
  missionBrief:
    "Open the Starpath Space Museum. Create your own cosmic build, match completed pictures and explain what their shape parts reveal.",
  successCriteria: [
    "build a picture",
    "recognise the shapes",
    "explain my thinking",
  ],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: {
    title: "Great Explorers Build",
    durationMinutes: 1,
    taskKind: "starpathShapeIntro",
  },
  activities: [
    {
      key: "cosmic-construction",
      title: "Cosmic Construction",
      description: "Create a rocket, planet, alien or satellite. There is no wrong creation.",
      taskKinds: ["starpathShapeBuilder"],
    },
    {
      key: "match-the-build",
      title: "Match the Build",
      description: "Choose the finished object that matches Geospin's shape build.",
      taskKinds: ["starpathBuildMatch"],
    },
    {
      key: "space-museum",
      title: "Space Museum",
      description: "Compare completed pictures and reason about the shapes they use.",
      taskKinds: ["starpathSpaceMuseum"],
    },
  ],
  reflection: {
    prompt: "What helped you explain your shape creation?",
    options: ["I named the shapes", "I counted the shapes", "I compared the pictures"],
  },
  practisedSkills: [
    "Create a themed picture with familiar shapes",
    "Match a model to a finished build",
    "Use visual shape reasoning",
  ],
  nextUpLabel: "Shape Sorters",
  createTaskSet: createSpaceBuildersTaskSet,
} satisfies StarpathLessonContent;
