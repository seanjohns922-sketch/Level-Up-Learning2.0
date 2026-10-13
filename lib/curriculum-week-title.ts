import { getCurriculumPlan } from "@/data/programs/genres";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";

/** Curriculum week title (e.g. "Fractions of a collection") for a realm,
 * working level and week, from the same programmes the lessons use. Lesson
 * attempts don't store a topic, so dashboards name topics this way. */
export function curriculumWeekTitle(realmId: string, workingLevel: string, week: number): string | null {
  try {
    if (realmId === "space" || realmId === "starpath") {
      const level = tryNormalizeStarpathLevel(workingLevel);
      return level ? getStarpathProgram(level).weeks.find((item) => item.week === week)?.title ?? null : null;
    }
    const yearLabel = normalizeWorkingLevelLabel(workingLevel) ?? workingLevel;
    const genreId = realmId === "pattern" ? "algebra" : realmId === "chance" || realmId === "chance-hollow" ? "probability" : realmId;
    return getCurriculumPlan(yearLabel, genreId).find((item) => item.week === week)?.topic ?? null;
  } catch {
    return null;
  }
}
