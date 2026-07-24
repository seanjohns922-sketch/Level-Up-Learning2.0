import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import { directionChoiceTask, directionPathTask } from "./directionTasks";

// ── Lesson 1 — Move It There ─────────────────────────────────────────────────
export function createMoveItThereTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading: "Which way?",
      prompt: "Move things up, down, left and right.",
      speakText: "Good explorers can move things around. Up goes to the top. Down goes to the bottom. Left goes to your left. Right goes to your right. Let's move things!",
      target: ++target,
    }),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 1, prompt: "Move the rocket where the clue says." }),
      () => directionPathTask(b++, ++target, { steps: 2, prompt: "Follow both directions." }),
      () => directionChoiceTask(c++, ++target, "moved"),
    ],
  };
}

export const MOVE_IT_THERE_CONTENT = {
  missionBrief: "Geospin's rocket needs a pilot. Move it up, down, left and right by following each direction.",
  successCriteria: ["move up and down", "move left and right", "follow a direction"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Move It There", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "move-one-step", title: "Move One Step", description: "Move the rocket one step in the right direction.", taskKinds: ["starpathDirectionPath"] },
    { key: "move-two-steps", title: "Move Two Steps", description: "Follow two directions in a row.", taskKinds: ["starpathDirectionPath"] },
    { key: "which-way", title: "Which Way?", description: "Choose the direction the rocket moved.", taskKinds: ["starpathDirectionChoice"] },
  ],
  reflection: { prompt: "Which direction did you use?", options: ["Up or down", "Left or right", "All of them"] },
  practisedSkills: ["Move an object up, down, left or right", "Follow two directions in order", "Name the direction of a move"],
  nextUpLabel: "Which Way?",
  createTaskSet: createMoveItThereTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 2 — Which Way? ────────────────────────────────────────────────────
export function createWhichWayTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading: "Which way did it go?",
      prompt: "Say which way something moved.",
      speakText: "Look carefully at where something starts and where it ends. Then you can say which way it moved — up, down, left or right.",
      target: ++target,
    }),
    activities: [
      () => directionChoiceTask(a++, ++target, "moved"),
      () => directionChoiceTask(b++, ++target, "goal"),
      () => directionPathTask(c++, ++target, { steps: 2, prompt: "Move the rocket to the goal." }),
    ],
  };
}

export const WHICH_WAY_CONTENT = {
  missionBrief: "Help Geospin read the stars. Work out which way things move and which way to travel to reach them.",
  successCriteria: ["say which way something moved", "say which way to travel", "follow directions"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Which Way?", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "which-way-moved", title: "Which Way Did It Move?", description: "Choose the direction the rocket travelled.", taskKinds: ["starpathDirectionChoice"] },
    { key: "which-way-goal", title: "Which Way to the Star?", description: "Choose the direction to reach the star.", taskKinds: ["starpathDirectionChoice"] },
    { key: "move-there", title: "Move There", description: "Follow the directions to reach the goal.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: { prompt: "How did you work out the direction?", options: ["I looked at the start", "I looked at the end", "I followed the path"] },
  practisedSkills: ["Identify the direction of a move", "Choose the direction toward a goal", "Follow a two-step path"],
  nextUpLabel: "Direction Mission",
  createTaskSet: createWhichWayTaskSet,
} satisfies StarpathLessonContent;

// ── Lesson 3 — Direction Mission ─────────────────────────────────────────────
export function createDirectionMissionTaskSet(): RealmLessonTaskSet {
  let target = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: () => ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "directions",
      heading: "Direction mission",
      prompt: "Follow all the directions to finish the mission.",
      speakText: "You are ready for a direction mission! Follow each direction in order to move the rocket all the way to the goal.",
      target: ++target,
    }),
    activities: [
      () => directionPathTask(a++, ++target, { steps: 2, prompt: "Follow the two directions." }),
      () => directionChoiceTask(b++, ++target, "goal"),
      () => directionPathTask(c++, ++target, { steps: 3, prompt: "Complete the direction mission." }),
    ],
  };
}

export const DIRECTION_MISSION_CONTENT = {
  missionBrief: "Take on Geospin's direction mission. Follow each direction in order to fly the rocket all the way to its goal.",
  successCriteria: ["follow two directions", "choose the right way", "complete a direction mission"],
  artworkSrc: "/images/starpath-home-bg-ground.png",
  teaching: { title: "Direction Mission", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "two-steps", title: "Two Steps", description: "Follow two directions in a row.", taskKinds: ["starpathDirectionPath"] },
    { key: "which-way", title: "Which Way?", description: "Choose the direction toward the goal.", taskKinds: ["starpathDirectionChoice"] },
    { key: "direction-mission", title: "Direction Mission", description: "Follow three directions to complete the mission.", taskKinds: ["starpathDirectionPath"] },
  ],
  reflection: { prompt: "What helped you finish the mission?", options: ["Reading each clue", "Following the order", "Watching the rocket"] },
  practisedSkills: ["Follow a two-step path", "Choose the direction toward a goal", "Complete a three-step direction mission"],
  nextUpLabel: "Voyage Quiz",
  createTaskSet: createDirectionMissionTaskSet,
} satisfies StarpathLessonContent;
