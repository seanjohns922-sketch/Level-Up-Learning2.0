import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 4 (Year 4) — Measurement.
//
// PLUMBING / SCAFFOLD ONLY. This is the Level 4 program shell that mirrors the
// completed Level 3 (year3Measurelands.ts) architecture so routing, registry,
// progression, quizzes, saving and dashboards can be wired and validated before
// the real 8-week curriculum plan is approved. Lesson titles/focus are
// placeholders and will be replaced once the Level 4 curriculum is planned.
//
// Core AC v9 alignment (indicative — finalised during curriculum planning):
// AC9M4M01 — measure and compare using scaled instruments and appropriate units.
// AC9M4M02 — units of time and conversions; solve problems involving duration.
// AC9M4M03 — length, area and perimeter of shapes using appropriate metric units.
const YEAR4_MEASURELANDS_CURRICULUM: CurriculumCode[] = [
  "AC9M4M01",
  "AC9M4M02",
  "AC9M4M03",
];

function buildLesson(
  week: number,
  lesson: number,
  title: string,
  focus: string,
  activityIdeas: string[],
  curriculum: CurriculumCode[],
): Lesson {
  return {
    id: `y4-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

// Placeholder week: three "coming soon" lessons. Real topics land with the
// approved Level 4 curriculum plan.
function placeholderWeek(week: number): WeekPlan {
  return {
    id: `y4-measurement-w${week}`,
    week,
    topic: `Level 4 — Week ${week}`,
    curriculum: YEAR4_MEASURELANDS_CURRICULUM,
    lessons: [1, 2, 3].map((lesson) =>
      buildLesson(
        week,
        lesson,
        `Lesson ${lesson}`,
        "Curriculum coming soon. Level 4 Measurelands lesson details appear here once the curriculum plan is approved.",
        [],
        YEAR4_MEASURELANDS_CURRICULUM,
      ),
    ),
  };
}

const YEAR4_MEASURELANDS_RAW: WeekPlan[] = [1, 2, 3, 4, 5, 6, 7, 8].map(placeholderWeek);

export const YEAR4_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  4,
  YEAR4_MEASURELANDS_RAW,
);

export const YEAR4_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 4",
  legend: "Meazurex Tracker",
  legendLine: "Meazurex",
  curriculum: YEAR4_MEASURELANDS_CURRICULUM,
} as const;
