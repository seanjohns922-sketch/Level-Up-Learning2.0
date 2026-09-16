import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "@/data/assessments/posttests";
import {
  GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  GROUND_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "@/data/assessments/groundStarpathIndependentPosttest";

export const GROUND_STARPATH_FORMS = ["pretest", "posttest", "start", "mid", "end"] as const;
export type GroundStarpathForm = (typeof GROUND_STARPATH_FORMS)[number];

export const GROUND_STARPATH_LABELS: Record<GroundStarpathForm, string> = {
  pretest: "Pre-Test",
  posttest: "Post-Test",
  start: "Start",
  mid: "Mid",
  end: "End",
};

export const GROUND_STARPATH_BLUEPRINT = [
  ["AC9MFSP01", "Recognise a familiar shape when its appearance changes"],
  ["AC9MFSP01", "Name a familiar shape"],
  ["AC9MFSP01", "Recognise a familiar shape in an object"],
  ["AC9MFSP01", "Find a shape that does not belong"],
  ["AC9MFSP01", "Classify shapes using a shared feature"],
  ["AC9MFSP01", "Construct a familiar shape"],
  ["AC9MFSP01", "Create a picture from familiar shapes"],
  ["AC9MFSP01", "Arrange familiar shapes by position"],
  ["AC9MFSP01", "Construct a second familiar shape"],
  ["AC9MFSP01", "Create a shape picture from two conditions"],
  ["AC9MFSP02", "Describe an object's relative position"],
  ["AC9MFSP02", "Match a picture to a position clue"],
  ["AC9MFSP02", "Find an object from a position clue"],
  ["AC9MFSP02", "Compare the positions of two people"],
  ["AC9MFSP02", "Check a relative-position scene"],
  ["AC9MFSP02", "Place an object above a reference"],
  ["AC9MFSP02", "Place an object below a reference"],
  ["AC9MFSP02", "Place an object to the right of a reference"],
  ["AC9MFSP02", "Place one person beside another"],
  ["AC9MFSP02", "Place two people relative to an object"],
] as const;

export type GroundStarpathReviewItem = Question & {
  readAloudText: string;
  primaryDescriptorCode: string;
  difficulty: string;
  practiceTask: PracticeTask;
  contextKey: string;
};

type GroundStarpathSourceItem = Question & {
  primaryDescriptorCode: string;
  difficulty: string;
  contextKey: string;
  practiceTask?: PracticeTask;
};

const COLOUR_SETS = [
  ["#f9a8d4", "#fde047", "#67e8f9", "#86efac", "#a78bfa"],
  ["#86efac", "#67e8f9", "#f97316", "#f9a8d4", "#fde047"],
  ["#a78bfa", "#86efac", "#fde047", "#67e8f9", "#f9a8d4"],
] as const;

const ORIGINAL_COLOURS = ["#67e8f9", "#fde047", "#a78bfa", "#f9a8d4", "#86efac"] as const;

const OBJECT_MAPS: ReadonlyArray<Readonly<Record<string, string>>> = [
  { planet: "cave", star: "crystal", moon: "planet", rocket: "satellite", cave: "rover", crystal: "star", alien: "explorer", explorer: "geospin", geospin: "alien", flag: "rocket" },
  { planet: "moon", star: "rocket", moon: "crystal", rocket: "rover", cave: "planet", crystal: "satellite", alien: "geospin", explorer: "alien", geospin: "explorer", flag: "cave" },
  { planet: "satellite", star: "moon", moon: "cave", rocket: "planet", cave: "crystal", crystal: "rover", alien: "explorer", explorer: "rover", geospin: "satellite", flag: "star" },
];

function preserveCase(source: string, replacement: string) {
  return source[0] === source[0]?.toUpperCase()
    ? replacement[0]!.toUpperCase() + replacement.slice(1)
    : replacement;
}

function replaceObjects(value: string, objectMap: Readonly<Record<string, string>>) {
  const names = Object.keys(objectMap).sort((a, b) => b.length - a.length);
  return value.replace(new RegExp(`\\b(${names.join("|")})\\b`, "gi"), (match) => {
    const replacement = objectMap[match.toLowerCase()];
    return replacement ? preserveCase(match, replacement) : match;
  });
}

function transformValue(value: unknown, variant: number): unknown {
  const objectMap = OBJECT_MAPS[variant]!;
  const colours = COLOUR_SETS[variant]!;
  if (typeof value === "string") {
    const colourIndex = ORIGINAL_COLOURS.indexOf(value as (typeof ORIGINAL_COLOURS)[number]);
    if (colourIndex >= 0) return colours[colourIndex];
    return replaceObjects(value, objectMap);
  }
  if (Array.isArray(value)) return value.map((entry) => transformValue(entry, variant));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, transformValue(entry, variant)]),
    );
  }
  return value;
}

function rotateOptions(task: PracticeTask, amount: number): PracticeTask {
  if (!("options" in task) || !Array.isArray(task.options) || task.options.length < 2) return task;
  const offset = amount % task.options.length;
  return { ...task, options: [...task.options.slice(offset), ...task.options.slice(0, offset)] } as PracticeTask;
}

function diversifyTask(task: PracticeTask, variant: number): PracticeTask {
  if (task.kind === "starpathShapeName") {
    const option = task.options[(variant + 1) % task.options.length]!;
    return { ...task, shape: option.name, correctOptionId: option.id };
  }
  if (task.kind === "starpathShapeWorkshop" && task.mode === "construct") {
    const points = task.shapeLabel === "square"
      ? [
          [{ r: 0, c: 0 }, { r: 0, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 0 }],
          [{ r: 2, c: 2 }, { r: 2, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 2 }],
          [{ r: 0, c: 1 }, { r: 0, c: 4 }, { r: 3, c: 4 }, { r: 3, c: 1 }],
        ][variant]
      : [
          [{ r: 4, c: 0 }, { r: 1, c: 2 }, { r: 4, c: 4 }],
          [{ r: 0, c: 0 }, { r: 4, c: 1 }, { r: 0, c: 4 }],
          [{ r: 1, c: 0 }, { r: 0, c: 4 }, { r: 4, c: 3 }],
        ][variant];
    return { ...task, points: points! };
  }
  return task;
}

function makeCheckpointForm(
  form: Extract<GroundStarpathForm, "start" | "mid" | "end">,
  source: readonly GroundStarpathReviewItem[],
  variant: number,
): GroundStarpathReviewItem[] {
  return source.map((question, index) => {
    const transformed = transformValue(question.practiceTask, variant) as PracticeTask;
    const task = diversifyTask(rotateOptions(transformed, variant + index + 1), variant);
    const prompt = "prompt" in task && typeof task.prompt === "string" ? task.prompt : question.prompt;
    const readAloudText = "speakText" in task && typeof task.speakText === "string" ? task.speakText : prompt;
    return {
      ...question,
      id: `y0-starpath-${form}-${String(index + 1).padStart(2, "0")}-v3`,
      version: "3.0.0",
      bankId: `starpath-level-0-${form}-v3`,
      prompt,
      readAloudText,
      contextKey: `${form}-${question.contextKey}`,
      renderer: { type: "starpath_assessment_task", payload: task },
      visual: { type: "starpath_ground_assessment", taskKind: task.kind },
      practiceTask: task,
    };
  });
}

function prepareExisting(items: readonly GroundStarpathSourceItem[]): GroundStarpathReviewItem[] {
  return items.map((question) => {
    if (!question.practiceTask) throw new Error(`${question.id} is missing its Starpath interaction.`);
    return {
      ...question,
      practiceTask: question.practiceTask,
      readAloudText:
        "speakText" in question.practiceTask && typeof question.practiceTask.speakText === "string"
          ? question.practiceTask.speakText
          : question.prompt,
    };
  });
}

const pretest = prepareExisting(GROUND_STARPATH_INDEPENDENT_PRETEST_ITEMS);
const posttest = prepareExisting(GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS);

export const GROUND_STARPATH_FIVE_FORMS: Record<GroundStarpathForm, readonly GroundStarpathReviewItem[]> = {
  pretest,
  posttest,
  start: makeCheckpointForm("start", posttest, 0),
  mid: makeCheckpointForm("mid", pretest, 1),
  end: makeCheckpointForm("end", posttest, 2),
};
