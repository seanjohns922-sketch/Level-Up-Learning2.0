import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 6 (Year 6) — architecture shell only.
//
// Curriculum content is intentionally not planned here yet. These placeholders
// let routing, world selection, registries and program cards resolve safely
// inside realm_id=measurement without falling back to Ground Level or Number.
const YEAR6_MEASURELANDS_CURRICULUM: CurriculumCode[] = ["ALL"];

function buildLesson(week: number, lesson: number): Lesson {
  return {
    id: `y6-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title: `Lesson ${lesson}`,
    focus: "Measurelands Level 6 lesson details will appear here once this level is built.",
    activityIdeas: [],
    curriculum: YEAR6_MEASURELANDS_CURRICULUM,
  };
}

const YEAR6_MEASURELANDS_RAW: WeekPlan[] = Array.from({ length: 8 }, (_, index) => {
  const week = index + 1;
  return {
    id: `y6-measurement-w${week}`,
    week,
    topic: `Level 6 — Week ${week}`,
    curriculum: YEAR6_MEASURELANDS_CURRICULUM,
    lessons: [1, 2, 3].map((lesson) => buildLesson(week, lesson)),
  };
});

export const YEAR6_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  6,
  YEAR6_MEASURELANDS_RAW,
);

export const YEAR6_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 6",
  legend: "Meazurex Timewielder",
  legendLine: "Meazurex",
  curriculum: YEAR6_MEASURELANDS_CURRICULUM,
} as const;
