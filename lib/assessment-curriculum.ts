import { getProgramForYear } from "@/data/programs";
import { getCurriculumPlan } from "@/data/programs/genres";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { tryNormalizeStarpathLevel } from "@/lib/starpath-levels";

type QuestionCurriculumLink = {
  linkedWeeks?: number[];
  curriculumCodes?: string[];
};

export function curriculumCodesForAssessmentQuestion(
  realmId: string,
  workingLevel: string,
  question: QuestionCurriculumLink,
): string[] {
  if (question.curriculumCodes?.length) return Array.from(new Set(question.curriculumCodes));

  const weeks = new Set((question.linkedWeeks ?? []).filter(Number.isFinite));
  if (weeks.size === 0) return [];

  if (realmId === "space") {
    const level = tryNormalizeStarpathLevel(workingLevel);
    if (!level) return [];
    const program = getStarpathProgram(level);
    return Array.from(
      new Set(
        program.weeks
          .filter((week) => weeks.has(week.week))
          .flatMap((week) => week.descriptorCodes),
      ),
    );
  }

  const plans =
    realmId === "measurement"
      ? getCurriculumPlan(workingLevel, "measurement")
      : getProgramForYear(workingLevel);
  return Array.from(
    new Set(
      plans
        .filter((week) => weeks.has(week.week))
        .flatMap((week) => week.curriculum ?? []),
    ),
  );
}
