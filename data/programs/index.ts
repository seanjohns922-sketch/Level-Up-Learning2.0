import { YEAR1_PROGRAM, type WeekPlan } from "./year1";
import { year2Number } from "./year2Number";

function year2ToWeekPlan(): WeekPlan[] {
  return year2Number.weeks.map((week) => ({
    id: `y2-w${week.week}`,
    week: week.week,
    topic: week.focus,
    curriculum: Array.from(new Set(week.lessons.map((lesson) => lesson.curriculum))),
    lessons: week.lessons.map((lesson, idx) => ({
      id: `y2-w${week.week}-l${idx + 1}`,
      week: week.week,
      lesson: idx + 1,
      title: lesson.title,
      focus: week.focus,
      activityIdeas: [],
      curriculum: [lesson.curriculum],
    })),
  }));
}

export const programs = {
  1: YEAR1_PROGRAM,
  2: year2Number,
};

export const PROGRAMS_BY_YEAR: Record<string, WeekPlan[]> = {
  "Year 1": YEAR1_PROGRAM,
  "Year 2": year2ToWeekPlan(),
};

export function getProgramForYear(yearLabel: string): WeekPlan[] {
  return PROGRAMS_BY_YEAR[yearLabel] ?? [];
}
