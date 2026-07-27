import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import { LEVEL_ONE_ARTWORK, SHAPES, SIDES, colourFor } from "./shared";

// Level 1 · Week 2 — Shape Families. Students classify familiar shapes by a
// shared feature (number of straight sides), infer a sorting rule, then find a
// second valid way to sort the same set. Each lesson uses a distinct classify
// mode so the week climbs guided → open → reclassify.

const SIDE_FAMILY: Record<0 | 3 | 4, { id: string; label: string }> = {
  0: { id: "none", label: "No straight sides" },
  3: { id: "three", label: "3 straight sides" },
  4: { id: "four", label: "4 straight sides" },
};

// L1 — Meet the Families (guided): sort a specimen into a "number of sides" bin.
export function belongsTask(round: number, target: number): PracticeTask {
  const shape = SHAPES[round % SHAPES.length]!;
  const family = SIDE_FAMILY[SIDES[shape]];
  return {
    kind: "starpathShapeClassify",
    mode: "belongs",
    prompt: `Which family does this ${shape} join?`,
    speakText: `Count the straight sides on this ${shape}, then choose its family.`,
    target,
    specimens: [{ id: `s-${target}`, shape, colour: colourFor(round + 2), scale: 0.95 }],
    options: [SIDE_FAMILY[0], SIDE_FAMILY[3], SIDE_FAMILY[4]],
    correctOptionId: family.id,
    feedback: {
      correct: `Yes — a ${shape} belongs in the "${family.label}" family.`,
      wrong: `Count the straight sides again. A ${shape} has ${SIDES[shape]}.`,
    },
  };
}

// L2 — Make Your Own Rule (open): a group is shown; pick the rule that sorts it.
type RuleGroup = {
  shapes: StarpathShape[];
  correct: string;
  options: Array<{ id: string; label: string }>;
};
const RULE_GROUPS: RuleGroup[] = [
  {
    shapes: ["circle", "oval"],
    correct: "round",
    options: [
      { id: "round", label: "They are all round" },
      { id: "sides4", label: "They all have 4 sides" },
      { id: "colour", label: "They are all the same colour" },
    ],
  },
  {
    shapes: ["square", "rectangle"],
    correct: "sides4",
    options: [
      { id: "sides4", label: "They all have 4 straight sides" },
      { id: "round", label: "They are all round" },
      { id: "big", label: "They are all big" },
    ],
  },
  {
    shapes: ["triangle", "square", "rectangle"],
    correct: "corners",
    options: [
      { id: "corners", label: "They all have corners" },
      { id: "round", label: "They are all round" },
      { id: "sides3", label: "They all have 3 sides" },
    ],
  },
  {
    shapes: ["triangle"],
    correct: "sides3",
    options: [
      { id: "sides3", label: "It has 3 straight sides" },
      { id: "sides4", label: "It has 4 straight sides" },
      { id: "round", label: "It is round" },
    ],
  },
];

export function ruleTask(round: number, target: number): PracticeTask {
  const group = RULE_GROUPS[round % RULE_GROUPS.length]!;
  return {
    kind: "starpathShapeClassify",
    mode: "rule",
    prompt: "What rule puts these shapes in one family?",
    speakText: "Look at what is the same about every shape, then choose the rule.",
    target,
    specimens: group.shapes.map((shape, index) => ({
      id: `g-${target}-${index}`,
      shape,
      colour: colourFor(round + index),
      scale: 0.9,
    })),
    options: group.options,
    correctOptionId: group.correct,
    feedback: {
      correct: "That rule fits every shape in the group.",
      wrong: "Check the rule against every shape, not just one.",
    },
  };
}

// L3 — Two Ways to Sort (reclassify): the set is sorted one way; find another.
type ReclassifyGroup = {
  shapes: StarpathShape[];
  sortedBy: string;
  correct: string;
  options: Array<{ id: string; label: string }>;
};
const RECLASSIFY_GROUPS: ReclassifyGroup[] = [
  {
    shapes: ["circle", "square", "triangle", "rectangle"],
    sortedBy: "colour",
    correct: "sides",
    options: [
      { id: "sides", label: "By number of sides" },
      { id: "loud", label: "By how loud they are" },
      { id: "taste", label: "By how they taste" },
    ],
  },
  {
    shapes: ["oval", "circle", "square", "triangle"],
    sortedBy: "size",
    correct: "round",
    options: [
      { id: "round", label: "Round shapes and shapes with corners" },
      { id: "smell", label: "By how they smell" },
      { id: "age", label: "By how old they are" },
    ],
  },
];

export function reclassifyTask(round: number, target: number): PracticeTask {
  const group = RECLASSIFY_GROUPS[round % RECLASSIFY_GROUPS.length]!;
  return {
    kind: "starpathShapeClassify",
    mode: "reclassify",
    prompt: `Geospin sorted these by ${group.sortedBy}. What is ANOTHER way to sort them?`,
    speakText: `The same shapes can be sorted more than one way. They are sorted by ${group.sortedBy} now — choose another sensible way.`,
    target,
    specimens: group.shapes.map((shape, index) => ({
      id: `r-${target}-${index}`,
      shape,
      colour: colourFor(round + index * 2),
      scale: 0.85,
    })),
    options: group.options,
    correctOptionId: group.correct,
    feedback: {
      correct: "Great — the same set can be sorted a different, sensible way.",
      wrong: "A sorting rule has to be about the shapes. Look for the shape idea.",
    },
  };
}

function teaching(heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () =>
    ({
      kind: "starpathShapeIntro",
      scene: "intro",
      variant: "levelOneShapes",
      heading,
      prompt,
      speakText,
      target: ++target,
    }) satisfies PracticeTask;
}

export function createMeetTheFamiliesTaskSet(): RealmLessonTaskSet {
  let target = 10;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Shape Families",
      "Shapes join a family by what they share.",
      "Shapes can be sorted into families. Count the straight sides to decide which family a shape joins."
    ),
    activities: [
      () => belongsTask(a++, ++target),
      () => belongsTask(b++ + 1, ++target),
      () => belongsTask(c++ + 3, ++target),
    ],
  };
}

export function createMakeYourOwnRuleTaskSet(): RealmLessonTaskSet {
  let target = 20;
  let a = 0;
  let b = 0;
  let c = 0;
  return {
    teaching: teaching(
      "Make Your Own Rule",
      "A rule is what every shape in a family shares.",
      "When shapes are grouped, there is a rule behind it. Find what every shape has in common."
    ),
    activities: [
      () => ruleTask(a++, ++target),
      () => ruleTask(b++ + 1, ++target),
      () => ruleTask(c++ + 2, ++target),
    ],
  };
}

export function createTwoWaysToSortTaskSet(): RealmLessonTaskSet {
  let target = 30;
  let a = 0;
  let b = 0;
  return {
    teaching: teaching(
      "Two Ways to Sort",
      "The same shapes can be sorted more than one way.",
      "A set of shapes does not have only one grouping. Find a second sensible way to sort the same shapes."
    ),
    activities: [
      () => reclassifyTask(a++, ++target),
      () => reclassifyTask(b++ + 1, ++target),
      () => ruleTask(a + 2, ++target),
    ],
  };
}

export const MEET_THE_FAMILIES_CONTENT = {
  missionBrief:
    "Open Geospin's Shape Family archive. Count straight sides and file each familiar shape with its family.",
  successCriteria: ["count straight sides", "match a shape to its family", "explain the shared feature"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Shape Families", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "meet-the-families", title: "Family Filing", description: "Sort a shape into its number-of-sides family.", taskKinds: ["starpathShapeClassify"] },
    { key: "family-check", title: "Family Check", description: "Confirm each shape's family.", taskKinds: ["starpathShapeClassify"] },
    { key: "family-mastery", title: "Archive Sweep", description: "File the trickier shapes independently.", taskKinds: ["starpathShapeClassify"] },
  ],
  reflection: {
    prompt: "How did you choose a family?",
    options: ["I counted the straight sides", "I checked for corners", "I compared it to another shape"],
  },
  practisedSkills: ["Count straight sides", "Classify by number of sides", "Explain a family"],
  nextUpLabel: "Make Your Own Rule",
  createTaskSet: createMeetTheFamiliesTaskSet,
} satisfies StarpathLessonContent;

export const MAKE_YOUR_OWN_RULE_CONTENT = {
  missionBrief:
    "A group of shapes has been filed together. Work out the rule Geospin used to group them.",
  successCriteria: ["look for what is shared", "test the rule on every shape", "choose the matching rule"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Make Your Own Rule", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "find-the-rule", title: "Find the Rule", description: "Choose the rule that fits the whole group.", taskKinds: ["starpathShapeClassify"] },
    { key: "rule-check", title: "Rule Check", description: "Test a rule against every shape.", taskKinds: ["starpathShapeClassify"] },
    { key: "rule-mastery", title: "Rule Master", description: "Name the rule for a mixed group.", taskKinds: ["starpathShapeClassify"] },
  ],
  reflection: {
    prompt: "What makes a good sorting rule?",
    options: ["It is true for every shape", "It is about the shapes", "It is not just about one shape"],
  },
  practisedSkills: ["Infer a classification rule", "Test a rule on a set", "Reject a rule that only fits one shape"],
  nextUpLabel: "Two Ways to Sort",
  createTaskSet: createMakeYourOwnRuleTaskSet,
} satisfies StarpathLessonContent;

export const TWO_WAYS_TO_SORT_CONTENT = {
  missionBrief:
    "These shapes are already sorted one way. Prove they can be sorted a different, sensible way too.",
  successCriteria: ["see the current rule", "find a second rule", "keep the rule about the shapes"],
  artworkSrc: LEVEL_ONE_ARTWORK,
  teaching: { title: "Two Ways to Sort", durationMinutes: 1, taskKind: "starpathShapeIntro" },
  activities: [
    { key: "another-way", title: "Another Way", description: "Find a second way to sort the same set.", taskKinds: ["starpathShapeClassify"] },
    { key: "another-way-2", title: "Sort Again", description: "Re-sort a different set.", taskKinds: ["starpathShapeClassify"] },
    { key: "rule-recap", title: "Rule Recap", description: "Name a rule for a mixed group.", taskKinds: ["starpathShapeClassify"] },
  ],
  reflection: {
    prompt: "What did you learn about sorting?",
    options: ["A set can be sorted many ways", "A rule must be about the shapes", "There is not only one right grouping"],
  },
  practisedSkills: ["Recognise multiple valid groupings", "Choose a second rule", "Keep rules shape-based"],
  nextUpLabel: "Week 2 Voyage Quiz",
  createTaskSet: createTwoWaysToSortTaskSet,
} satisfies StarpathLessonContent;
