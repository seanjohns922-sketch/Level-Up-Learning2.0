import { genreIdForRealm, getCurriculumPlan } from "@/data/programs/genres";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { formatStudentLevelLabel, normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";

/**
 * The curriculum a parent sees for a realm level: week titles and lesson
 * names from the same plans the learning program uses.
 */

export type ParentCurriculumWeek = {
  week: number;
  title: string;
  lessons: Array<{ lesson: number; title: string; focus: string | null }>;
};

export function parentCurriculumWeeks(realmId: string, workingLevel: string): ParentCurriculumWeek[] {
  if (realmId === "space" || realmId === "starpath") {
    const level = tryNormalizeStarpathLevel(workingLevel);
    return level
      ? getStarpathProgram(level).weeks.map((week) => ({
          week: week.week,
          title: week.title,
          lessons: week.lessons.map((lesson, index) => ({ lesson: index + 1, title: lesson.title, focus: lesson.focus ?? null })),
        }))
      : [];
  }

  const yearLabel = normalizeWorkingLevelLabel(workingLevel) ?? workingLevel;
  return getCurriculumPlan(yearLabel, genreIdForRealm(realmId)).map((week) => ({
    week: week.week,
    title: week.topic,
    lessons: week.lessons.map((lesson) => ({ lesson: lesson.lesson, title: lesson.title, focus: lesson.focus ?? null })),
  }));
}

export function parentCurriculumWeek(realmId: string, workingLevel: string, weekNumber: number) {
  return parentCurriculumWeeks(realmId, workingLevel).find((week) => week.week === weekNumber) ?? null;
}

export function parentCurriculumLessonCount(realmId: string, workingLevel: string) {
  return parentCurriculumWeeks(realmId, workingLevel).reduce((total, week) => total + week.lessons.length, 0);
}

/** "Year 2" → "Level 2", "Prep" → "Ground". */
export function parentLevelLabel(workingLevel: string) {
  return formatStudentLevelLabel(normalizeWorkingLevelLabel(workingLevel) ?? workingLevel);
}
