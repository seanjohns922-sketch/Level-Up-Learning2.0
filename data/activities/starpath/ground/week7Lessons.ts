import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathBuildObjectId } from "./shape-builds";
import { finishPictureTask, identifyBuildShapesTask, shapeBuilderTask, spaceMuseumTask } from "./week2Tasks";
import { findItTask, placeItTask, sayWhereTask, whichPictureTask } from "./week4Tasks";
import type { PositionRelation } from "./position-objects";

const BUILD_OBJECTS: StarpathBuildObjectId[] = ["rocket", "planet", "satellite", "alien", "house"];
const W7_RELATIONS: PositionRelation[] = ["above", "below", "beside", "behind", "inside"];
const W7_POOL: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

// ── Lesson 1 — Build a Planet ────────────────────────────────────────────────
export function createBuildAPlanetTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "builders",
      heading: "Build with shapes",
      prompt: "Combine shapes to build space objects.",
      speakText: "Explorers build big things from small shapes. Put shapes together to build planets, rockets and more, then find the shapes inside them.",
      target: ++target,
    }),
    activities: [
      () => shapeBuilderTask(BUILD_OBJECTS, "guided", a++, ++target),
      () => finishPictureTask(BUILD_OBJECTS, b++, ++target),
      () => identifyBuildShapesTask(BUILD_OBJECTS, c++, ++target),
    ],
  };
}

export const BUILD_A_PLANET_CONTENT = {
  missionBrief: "Open the Starpath workshop. Combine familiar shapes to build space objects, then find the shapes inside your creations.",
  successCriteria: ["build with shapes", "finish a picture", "name the shapes inside"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Build a Planet", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "build-object", title: "Build the Object", description: "Combine shapes to build a space object.", taskKinds: ["starpathShapeBuilder"] },
    { key: "finish-picture", title: "Finish the Picture", description: "Choose the shape that completes the build.", taskKinds: ["starpathFinishPicture"] },
    { key: "name-the-shapes", title: "Name the Shapes", description: "Find the familiar shapes inside the build.", taskKinds: ["starpathBuildShapeIdentify"] },
  ],
  reflection: { prompt: "What did you build with?", options: ["Circles and squares", "Triangles and rectangles", "Lots of shapes"] },
  practisedSkills: ["Combine shapes to build an object", "Complete a shape picture", "Recognise shapes within a build"],
  nextUpLabel: "Create a Space Scene",
  createTaskSet: createBuildAPlanetTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 2 — Create a Space Scene ──────────────────────────────────────────
export function createSpaceSceneTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positions",
      heading: "Create a space scene",
      prompt: "Build objects, then place them.",
      speakText: "A space scene needs objects in the right places. Build your objects, then use position words to arrange them into a scene.",
      target: ++target,
    }),
    activities: [
      () => shapeBuilderTask(BUILD_OBJECTS, "free", a++, ++target),
      () => placeItTask(b++, ++target),
      () => whichPictureTask(c++, ++target, W7_RELATIONS),
    ],
  };
}

export const SPACE_SCENE_CONTENT = {
  missionBrief: "Design your own Starpath scene. Build space objects, then arrange them using position words.",
  successCriteria: ["build an object", "place an object in position", "choose the matching scene"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Create a Space Scene", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "build-for-scene", title: "Build for the Scene", description: "Combine shapes to build a scene object.", taskKinds: ["starpathShapeBuilder"] },
    { key: "place-in-scene", title: "Place It", description: "Place an object above, below or beside another.", taskKinds: ["starpathPositionPlace"] },
    { key: "which-scene", title: "Which Scene?", description: "Choose the scene that matches the position.", taskKinds: ["starpathPositionPicture"] },
  ],
  reflection: { prompt: "How did you arrange your scene?", options: ["I built the objects", "I placed them in position", "I checked the picture"] },
  practisedSkills: ["Build a scene object from shapes", "Place an object using position words", "Match a described scene to a picture"],
  nextUpLabel: "Describe Your Picture",
  createTaskSet: createSpaceSceneTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 3 — Describe Your Picture ─────────────────────────────────────────
export function createDescribePictureTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "positions",
      heading: "Describe your picture",
      prompt: "Say where everything is.",
      speakText: "A good explorer can describe a scene so anyone can picture it. Say where each object is using position words.",
      target: ++target,
    }),
    activities: [
      () => sayWhereTask(a++, ++target, W7_RELATIONS, W7_POOL),
      () => findItTask(b++, ++target, W7_RELATIONS),
      () => spaceMuseumTask(c++, ++target),
    ],
  };
}

export const DESCRIBE_PICTURE_CONTENT = {
  missionBrief: "Present your Starpath scene to Geospin. Describe where each object is and reason about the shapes you can see.",
  successCriteria: ["say where objects are", "find an object by position", "reason about the scene"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Describe Your Picture", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "say-where", title: "Say Where", description: "Choose the word for where an object is.", taskKinds: ["starpathPositionWord"] },
    { key: "find-in-scene", title: "Find It", description: "Find the object a position clue describes.", taskKinds: ["starpathPositionFind"] },
    { key: "scene-reasoning", title: "Scene Reasoning", description: "Reason about the shapes in each scene.", taskKinds: ["starpathSpaceMuseum"] },
  ],
  reflection: { prompt: "What did you describe today?", options: ["Where things are", "Which object is which", "The shapes inside"] },
  practisedSkills: ["Describe an object's position", "Find an object from a position clue", "Reason about shapes in a scene"],
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createDescribePictureTaskSet,
} satisfies StarpathLessonContent;
