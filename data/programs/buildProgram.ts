import type { CurriculumCode, WeekPlan } from "./year1";
import type { ActivityType, LessonActivity } from "./types";

export type ProgramRow = {
  week: number;
  focus: string;
  weekTopic?: string;
  lesson: number;
  topic: string;
  quizSafe?: boolean;
  activities: LessonActivity[];
  activity: string;
  curriculum: CurriculumCode[];
};

type RotationRole = "fast_thinking" | "reasoning" | "apply_create";

const ROTATION_ROLES: RotationRole[] = [
  "fast_thinking",
  "reasoning",
  "apply_create",
];

const ROTATION_ROLE_META: Record<
  RotationRole,
  { label: string; purpose: string }
> = {
  fast_thinking: {
    label: "Fast Thinking",
    purpose: "quick response, low friction, high pace",
  },
  reasoning: {
    label: "Reasoning",
    purpose: "structured explanation, error spotting, and justification",
  },
  apply_create: {
    label: "Apply / Create",
    purpose: "deeper thinking through solving, generating, and explaining",
  },
};

const FAST_ACTIVITY_TYPES = new Set<ActivityType>([
  "place_value_builder",
  "number_order",
  "partition_expand",
  "number_line",
  "area_model_select",
  "set_model_select",
  "number_line_place",
  "odd_even_sort",
  "equal_groups",
  "arrays",
  "skip_count",
  "speed_round",
]);

const REASONING_ACTIVITY_TYPES = new Set<ActivityType>([
  "multiple_choice",
  "review_quiz",
  "fraction_compare",
  "fact_family",
]);

const APPLY_ACTIVITY_TYPES = new Set<ActivityType>([
  "typed_response",
  "mixed_word_problem",
  "build_the_whole",
  "equivalent_fraction_build",
  "division_groups",
  "addition_strategy",
  "subtraction_strategy",
]);

function slugifyLessonKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function scoreActivityForRole(activity: LessonActivity, role: RotationRole): number {
  const config = activity.config ?? {};
  const mode = typeof config.mode === "string" ? config.mode : "";
  const sourceActivityType =
    typeof config.sourceActivityType === "string" ? config.sourceActivityType : "";

  let score = 0;

  if (FAST_ACTIVITY_TYPES.has(activity.activityType)) score += role === "fast_thinking" ? 5 : 0;
  if (REASONING_ACTIVITY_TYPES.has(activity.activityType)) score += role === "reasoning" ? 5 : 0;
  if (APPLY_ACTIVITY_TYPES.has(activity.activityType)) score += role === "apply_create" ? 5 : 0;

  if (activity.activityType === "typed_response" && role === "apply_create") score += 4;
  if (activity.activityType === "multiple_choice" && role === "reasoning") score += 3;
  if (activity.activityType === "multiple_choice" && role === "fast_thinking") score += 1;
  if (activity.activityType === "mixed_word_problem" && role === "apply_create") score += 3;
  if (
    (activity.activityType === "number_line" || activity.activityType === "number_order") &&
    role === "fast_thinking"
  ) {
    score += 2;
  }

  if (
    role === "reasoning" &&
    (mode.includes("reason") ||
      mode.includes("compare") ||
      mode.includes("justify") ||
      mode.includes("true_false") ||
      mode.includes("algorithm") ||
      sourceActivityType.length > 0)
  ) {
    score += 2;
  }

  if (
    role === "apply_create" &&
    (mode.includes("solve") ||
      mode.includes("partial") ||
      mode.includes("build") ||
      mode.includes("problem") ||
      mode.includes("create"))
  ) {
    score += 2;
  }

  if (
    role === "fast_thinking" &&
    (mode.includes("order") ||
      mode.includes("place") ||
      mode.includes("match") ||
      mode.includes("sort") ||
      mode.includes("estimate"))
  ) {
    score += 2;
  }

  return score;
}

function withRotationMetadata(
  activity: LessonActivity,
  role: RotationRole,
  lessonKey: string
): LessonActivity {
  const roleMeta = ROTATION_ROLE_META[role];
  const config = activity.config ?? {};
  const existingMode = typeof config.mode === "string" ? config.mode : undefined;

  return {
    ...activity,
    weight: 1,
    config: {
      ...config,
      mode: existingMode ?? `${lessonKey}_${role}`,
      rotationRole: role,
      rotationLabel: roleMeta.label,
      rotationPurpose: roleMeta.purpose,
      lessonStructure: "8_minute_rotation",
    },
  };
}

function buildFallbackRotationActivities(lessonKey: string): LessonActivity[] {
  return [
    {
      activityType: "multiple_choice",
      weight: 1,
      config: {
        mode: `${lessonKey}_fast`,
        rotationRole: "fast_thinking",
        rotationLabel: ROTATION_ROLE_META.fast_thinking.label,
        rotationPurpose: ROTATION_ROLE_META.fast_thinking.purpose,
        lessonStructure: "8_minute_rotation",
      },
    },
    {
      activityType: "multiple_choice",
      weight: 1,
      config: {
        mode: `${lessonKey}_reasoning`,
        rotationRole: "reasoning",
        rotationLabel: ROTATION_ROLE_META.reasoning.label,
        rotationPurpose: ROTATION_ROLE_META.reasoning.purpose,
        lessonStructure: "8_minute_rotation",
      },
    },
    {
      activityType: "typed_response",
      weight: 1,
      config: {
        mode: `${lessonKey}_apply_create`,
        rotationRole: "apply_create",
        rotationLabel: ROTATION_ROLE_META.apply_create.label,
        rotationPurpose: ROTATION_ROLE_META.apply_create.purpose,
        lessonStructure: "8_minute_rotation",
      },
    },
  ];
}

export function normalizeLessonActivities(
  lessonKey: string,
  activities?: LessonActivity[]
): LessonActivity[] {
  const sourceActivities = activities ?? [];
  if (sourceActivities.length === 0) {
    return buildFallbackRotationActivities(lessonKey);
  }

  const chosen: LessonActivity[] = [];
  const usedIndexes = new Set<number>();

  for (const role of ROTATION_ROLES) {
    let bestIndex = -1;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < sourceActivities.length; index += 1) {
      if (usedIndexes.has(index)) continue;
      const score = scoreActivityForRole(sourceActivities[index]!, role);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    const fallbackActivity =
      bestIndex >= 0
        ? sourceActivities[bestIndex]!
        : sourceActivities[chosen.length] ?? sourceActivities[sourceActivities.length - 1]!;

    if (bestIndex >= 0) {
      usedIndexes.add(bestIndex);
    }

    chosen.push(withRotationMetadata(fallbackActivity, role, lessonKey));
  }

  return chosen;
}

export function normalizeWeekPlans(
  yearLevel: number,
  weeks: WeekPlan[]
): WeekPlan[] {
  return weeks.map((week) => ({
    ...week,
    lessons: week.lessons.map((lesson) => {
      const lessonKey = slugifyLessonKey(
        `y${yearLevel}_w${lesson.week}_l${lesson.lesson}_${lesson.title}`
      );
      return {
        ...lesson,
        activities: normalizeLessonActivities(lessonKey, lesson.activities),
      };
    }),
  }));
}

export function buildProgram(
  yearLevel: number,
  _strand: "Number",
  rows: ProgramRow[]
): WeekPlan[] {
  const weekMap = new Map<number, ProgramRow[]>();

  for (const row of rows) {
    const existing = weekMap.get(row.week) ?? [];
    existing.push(row);
    weekMap.set(row.week, existing);
  }

  const weeks = Array.from(weekMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, weekRows]) => {
      const sortedRows = [...weekRows].sort((a, b) => a.lesson - b.lesson);
      const topic = sortedRows[0]?.weekTopic ?? sortedRows[0]?.focus ?? `Week ${week}`;
      const curriculum = Array.from(
        new Set(sortedRows.flatMap((row) => row.curriculum))
      );

      return {
        id: `y${yearLevel}-w${week}`,
        week,
        topic,
        curriculum,
        lessons: sortedRows.map((row) => ({
          id: `y${yearLevel}-w${row.week}-l${row.lesson}`,
          week: row.week,
          lesson: row.lesson,
          title: row.topic,
          focus: row.focus,
          quizSafe: row.quizSafe,
          activityIdeas: [row.activity],
          curriculum: row.curriculum,
          activities: row.activities,
        })),
      };
    });

  return normalizeWeekPlans(yearLevel, weeks);
}
