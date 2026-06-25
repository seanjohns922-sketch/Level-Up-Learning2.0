import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 1 · Week 8 · Lesson 3 — "Sequence Events" ──
// AC9M1M03: sequence familiar events and simple processes in a logical order.
// Uses short visual process stories so Year 1 students can answer from the
// image sequence itself, with text/audio as support only.

type RoutineTask = Extract<PracticeTask, { kind: "routineSequence" }>;
type RoutineItem = NonNullable<RoutineTask["items"]>[number];

const STORY_IMAGE_BASE = "/images/measurelands/story-3d";

type StoryDefinition = {
  id: string;
  title: string;
  steps: Array<{ id: string; label: string; image: string }>;
};

const STORIES: StoryDefinition[] = [
  {
    id: "seed",
    title: "Plant the Seed",
    steps: [
      { id: "story-seed-1", label: "Seed", image: "story-seed-1.png" },
      { id: "story-seed-2", label: "Water the Soil", image: "story-seed-2.png" },
      { id: "story-seed-3", label: "Sprout", image: "story-seed-3.png" },
      { id: "story-seed-4", label: "Flower", image: "story-seed-4.png" },
    ],
  },
  {
    id: "butterfly",
    title: "Butterfly Life Cycle",
    steps: [
      { id: "story-butterfly-1", label: "Egg", image: "story-butterfly-1.png" },
      { id: "story-butterfly-2", label: "Caterpillar", image: "story-butterfly-2.png" },
      { id: "story-butterfly-3", label: "Chrysalis", image: "story-butterfly-3.png" },
      { id: "story-butterfly-4", label: "Butterfly", image: "story-butterfly-4-v2.svg" },
    ],
  },
  {
    id: "teeth",
    title: "Brushing Teeth",
    steps: [
      { id: "story-teeth-1", label: "Brush and Paste", image: "story-teeth-1.png" },
      { id: "story-teeth-2", label: "Add Toothpaste", image: "story-teeth-2.png" },
      { id: "story-teeth-3", label: "Brush Teeth", image: "story-teeth-3.png" },
      { id: "story-teeth-4", label: "Rinse", image: "story-teeth-4.png" },
    ],
  },
  {
    id: "toast",
    title: "Make Toast",
    steps: [
      { id: "story-toast-1", label: "Bread", image: "story-toast-1-v2.png" },
      { id: "story-toast-2", label: "Into the Toaster", image: "story-toast-2-v2.png" },
      { id: "story-toast-3", label: "Toast Pops Up", image: "story-toast-3-v2.png" },
      { id: "story-toast-4", label: "Buttered Toast", image: "story-toast-4-v2.png" },
    ],
  },
];

type LessonMemory = {
  introShown: boolean;
  cursor: number;
  storyCursor: number;
  lastStoryId: string | null;
};

const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"A" | "B" | "C"> = ["A", "B", "C", "A", "C", "B"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0, storyCursor: 0, lastStoryId: null };
  lessonMemory.set(lessonId, created);
  return created;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function asItem(step: StoryDefinition["steps"][number], order: number): RoutineItem {
  return {
    id: step.id,
    label: step.label,
    icon: "story",
    order,
    imageSrc: `${STORY_IMAGE_BASE}/${step.image}`,
  };
}

function chooseStory(memory: LessonMemory): StoryDefinition {
  const ordered = STORIES.slice().sort((a, b) => a.id.localeCompare(b.id));
  for (let attempt = 0; attempt < ordered.length; attempt += 1) {
    const story = ordered[(memory.storyCursor + attempt) % ordered.length]!;
    if (story.id !== memory.lastStoryId) {
      memory.storyCursor = (memory.storyCursor + attempt + 1) % ordered.length;
      memory.lastStoryId = story.id;
      return story;
    }
  }
  return ordered[0]!;
}

function buildIntroTask(): RoutineTask {
  const story = STORIES[0]!;
  return {
    kind: "routineSequence",
    scene: "intro",
    prompt: "Stories happen in order.",
    speakText:
      "Professor Gauge says some events happen in a special order. First we plant the seed. Then we water it. Next it sprouts. Last it becomes a flower.",
    badgeLabel: "Meazurex Mission",
    items: story.steps.map((step, index) => asItem(step, index)),
    feedback: { correct: "Let's sequence the story!", wrong: "Look at what happens first, next and last." },
  };
}

function buildFirstTask(memory: LessonMemory): RoutineTask {
  const story = chooseStory(memory);
  const items = shuffle(story.steps.map((step, index) => asItem(step, index)));
  return {
    kind: "routineSequence",
    scene: "first",
    prompt: `What happens first in ${story.title}?`,
    speakText: `Look at the story cards. What happens first in ${story.title}?`,
    badgeLabel: "What Comes First?",
    items,
    feedback: { correct: "Yes — that happens first!", wrong: "Think about how the story begins." },
  };
}

function buildBuildTask(memory: LessonMemory): RoutineTask {
  const story = chooseStory(memory);
  const ordered = story.steps.map((step, index) => asItem(step, index));
  return {
    kind: "routineSequence",
    scene: "build",
    prompt: `Put ${story.title} in order.`,
    speakText: `Tap the story cards in order for ${story.title}.`,
    badgeLabel: "Put the Story in Order",
    buildItems: shuffle(ordered),
    feedback: { correct: "Great sequencing!", wrong: "Start with what happens first in the story." },
  };
}

// Step cards from every OTHER story, used to top up "next" distractors so the
// question always has 3 options even when the current story can't supply enough.
function otherStorySteps(excludeStoryId: string): RoutineItem[] {
  return STORIES.filter((s) => s.id !== excludeStoryId).flatMap((s) => s.steps.map((step, index) => asItem(step, index)));
}

function buildNextTask(memory: LessonMemory): RoutineTask {
  const story = chooseStory(memory);
  const ordered = story.steps.map((step, index) => asItem(step, index));
  // Prefix is 1 or 2 so the answer is never the last step (always >=1 later step).
  const prefixLength = Math.random() < 0.5 ? 1 : 2;
  const shown = ordered.slice(0, prefixLength);
  const answer = ordered[prefixLength]!;
  // Prefer same-story steps as distractors; top up from other stories to reach 2.
  const sameStory = ordered.filter((item) => !shown.some((s) => s.id === item.id) && item.id !== answer.id);
  let distractors = shuffle(sameStory).slice(0, 2);
  if (distractors.length < 2) {
    const topUp = shuffle(otherStorySteps(story.id)).filter((item) => item.id !== answer.id);
    distractors = [...distractors, ...topUp].slice(0, 2);
  }
  return {
    kind: "routineSequence",
    scene: "next",
    prompt: `What happens next in ${story.title}?`,
    speakText: `Look at the story. What happens next in ${story.title}?`,
    badgeLabel: "What Happens Next?",
    items: shown,
    buildItems: shuffle([answer, ...distractors]),
    correctTextOption: answer.id,
    feedback: { correct: "Yes — that happens next!", wrong: "Look at the story order and choose the next step." },
  };
}

function buildMeaningTask(): RoutineTask {
  return {
    kind: "routineSequence",
    scene: "meaning",
    prompt: "How did you know the right order?",
    speakText: "How did you know the right order?",
    badgeLabel: "How Did You Know?",
    textOptions: shuffle([
      "I looked at what happens first, next and last.",
      "I picked the brightest picture.",
      "I guessed.",
    ]),
    correctTextOption: "I looked at what happens first, next and last.",
    feedback: { correct: "Yes — story events happen in an order.", wrong: "Think about the order the events really happen." },
  };
}

export function generateY1MeasurelandsWeek8Lesson3Task(
  lessonId: string,
  _difficulty: Difficulty,
): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) {
    memory.introShown = true;
    return buildIntroTask();
  }
  if (memory.cursor > 0 && memory.cursor % 7 === 6) {
    memory.cursor += 1;
    return buildMeaningTask();
  }
  const rotation = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (rotation === "A") return buildFirstTask(memory);
  if (rotation === "B") return buildBuildTask(memory);
  return buildNextTask(memory);
}

export function resetY1MeasurelandsWeek8Lesson3TaskSessionState() {
  lessonMemory.clear();
}
