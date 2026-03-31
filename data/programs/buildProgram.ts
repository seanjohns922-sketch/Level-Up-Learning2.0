import type { CurriculumCode, WeekPlan } from "./year1";
import type { ActivityType, LessonActivity } from "./types";

export type ProgramRow = {
  week: number;
  focus: string;
  lesson: number;
  topic: string;
  quizSafe?: boolean;
  activities: LessonActivity[];
  activity: string;
  curriculum: CurriculumCode[];
};

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

  return Array.from(weekMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, weekRows]) => {
      const sortedRows = [...weekRows].sort((a, b) => a.lesson - b.lesson);
      const topic = sortedRows[0]?.focus ?? `Week ${week}`;
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
}
