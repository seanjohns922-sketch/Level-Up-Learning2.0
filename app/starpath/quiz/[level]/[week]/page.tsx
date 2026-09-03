import { notFound } from "next/navigation";
import StarpathDevelopmentQuiz from "@/components/starpath/StarpathDevelopmentQuiz";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { buildStarpathProgramHref, STARPATH_REALM_ID } from "@/lib/starpath-routes";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";

export const dynamic = "force-dynamic";

function parseWeek(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 8 ? parsed : null;
}

export default async function StarpathQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; week: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [route, query] = await Promise.all([params, searchParams]);
  const level = tryNormalizeStarpathLevel(route.level);
  const week = parseWeek(route.week);
  const realmId = typeof query.realm_id === "string" ? query.realm_id : null;
  if (!level || !week || realmId !== STARPATH_REALM_ID) notFound();

  const definition = getStarpathLevel(level);
  const program = getStarpathProgram(level);
  const weekPlan = program.weeks[week - 1];
  if (!weekPlan?.quiz || program.realmId !== STARPATH_REALM_ID) notFound();

  const quizTasks = getStarpathQuizTasks(level, week);
  if (quizTasks && quizTasks.length > 0) {
    return (
      <CanonicalRealmActivityGate realmId="space" year={definition.yearLabel} week={week} activity="quiz">
        <StarpathVoyageQuiz
          quiz={{
          level: definition.yearLabel,
          levelLabel: definition.displayLabel,
          week,
          title: `${weekPlan.title} Voyage Quiz`,
          coverage: weekPlan.quiz.coverage,
          lessonTitles: weekPlan.lessons.map((lesson) => lesson.title) as [string, string, string],
          lessonCurriculumCodes: weekPlan.lessons.map(() => [...weekPlan.descriptorCodes]) as [
            string[],
            string[],
            string[],
          ],
          lessonSkillIds: weekPlan.lessons.map((lesson) => [...lesson.skillIds]) as [
            string[],
            string[],
            string[],
          ],
          weekHref: buildStarpathProgramHref({ selectedLevel: level }, week),
          nextWeekHref:
            week < program.weeks.length
              ? buildStarpathProgramHref({ selectedLevel: level }, week + 1)
              : undefined,
          }}
          tasks={quizTasks}
        />
      </CanonicalRealmActivityGate>
    );
  }

  return (
    <CanonicalRealmActivityGate realmId="space" year={definition.yearLabel} week={week} activity="quiz">
      <StarpathDevelopmentQuiz
        quiz={{
          level: definition.yearLabel,
          levelLabel: definition.displayLabel,
          week,
          title: `${weekPlan.title} Voyage Quiz`,
          coverage: weekPlan.quiz.coverage,
          sourceLessons: weekPlan.lessons.map((lesson) => lesson.title),
          registryId: weekPlan.quiz.id,
          status: weekPlan.quiz.status,
          weekHref: buildStarpathProgramHref({ selectedLevel: level }, week),
        }}
      />
    </CanonicalRealmActivityGate>
  );
}
