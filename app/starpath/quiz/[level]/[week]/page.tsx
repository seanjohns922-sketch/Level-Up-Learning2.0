import { notFound, redirect } from "next/navigation";
import StarpathDevelopmentQuiz from "@/components/starpath/StarpathDevelopmentQuiz";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { getStarpathQuizTasks } from "@/data/activities/starpath/ground/week1Quiz";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { buildStarpathProgramHref, STARPATH_REALM_ID } from "@/lib/starpath-routes";

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
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/realms");

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
      <StarpathVoyageQuiz
        quiz={{
          level: definition.yearLabel,
          levelLabel: definition.displayLabel,
          week,
          title: `${weekPlan.title} Voyage Quiz`,
          coverage: weekPlan.quiz.coverage,
          lessonTitles: weekPlan.lessons.map((lesson) => lesson.title) as [string, string, string],
          weekHref: buildStarpathProgramHref({ selectedLevel: level }, week),
        }}
        tasks={quizTasks}
      />
    );
  }

  return (
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
  );
}
