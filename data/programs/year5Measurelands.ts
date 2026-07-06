import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 5 (Year 5) — plumbing shell only.
//
// This file intentionally does not define the Level 5 curriculum sequence yet.
// It gives the program/realm/lesson pipeline a real Measurement program to
// resolve so Year 5 Measurelands never falls back to Ground Level or Number
// Nexus while the curriculum is being designed.
const YEAR5_MEASURELANDS_CURRICULUM: CurriculumCode[] = ["ALL"];

function buildLesson(week: number, lesson: number): Lesson {
  return {
    id: `y5-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title: `Lesson ${lesson}`,
    focus: "Measurelands Level 5 curriculum coming soon. Lesson details will appear here once this level is built.",
    activityIdeas: [],
    curriculum: YEAR5_MEASURELANDS_CURRICULUM,
  };
}

const YEAR5_MEASURELANDS_RAW: WeekPlan[] = Array.from({ length: 8 }, (_, index) => {
  const week = index + 1;
  return {
    id: `y5-measurement-w${week}`,
    week,
    topic: `Level 5 — Week ${week}`,
    curriculum: YEAR5_MEASURELANDS_CURRICULUM,
    lessons: [buildLesson(week, 1), buildLesson(week, 2), buildLesson(week, 3)],
  };
});

export const YEAR5_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  5,
  YEAR5_MEASURELANDS_RAW,
);

export const YEAR5_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 5",
  legend: "Meazurex Calibrator",
  legendLine: "Meazurex",
  curriculum: YEAR5_MEASURELANDS_CURRICULUM,
} as const;
