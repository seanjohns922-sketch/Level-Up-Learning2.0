import { notFound } from "next/navigation";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";
import { getStatisticaWeeklyQuizTasks } from "@/data/activities/statistica/weeklyQuizBank";
import { STATISTICA_PROGRAMS } from "@/data/programs/statistica";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";

export const dynamic = "force-dynamic";

function parseLevel(value: string) {
  const match = /^(?:Year\s*)?([1-6])$/i.exec(decodeURIComponent(value));
  return match ? (Number(match[1]) as 1 | 2 | 3 | 4 | 5 | 6) : null;
}

function parseWeek(value: string) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 && week <= 5 ? week : null;
}

export default async function StatisticaQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; week: string }>;
  searchParams: Promise<{ teacher_preview?: string }>;
}) {
  const route = await params;
  const query = await searchParams;
  const level = parseLevel(route.level);
  const week = parseWeek(route.week);
  if (!level || !week) notFound();

  const weekPlan = STATISTICA_PROGRAMS[level][week - 1];
  const tasks = getStatisticaWeeklyQuizTasks(level, week);
  if (!weekPlan || !tasks || tasks.length !== 15) notFound();

  const year = `Year ${level}` as const;
  const teacherPreview = query.teacher_preview === "1";
  return (
    <CanonicalRealmActivityGate realmId="statistics" year={year} week={week} activity="quiz">
      <StarpathVoyageQuiz
        realm="statistics"
        quiz={{
        level: year,
        levelLabel: year,
        week,
        title: `${weekPlan.topic} Quiz`,
        coverage: `15 evidence questions from ${weekPlan.lessons.map((lesson) => lesson.title).join(", ")}`,
        lessonTitles: weekPlan.lessons.map((lesson) => lesson.title) as [string, string, string],
        lessonCurriculumCodes: weekPlan.lessons.map((lesson) => [...lesson.curriculum]) as [string[], string[], string[]],
        lessonSkillIds: weekPlan.lessons.map((lesson) => [lesson.id]) as [string[], string[], string[]],
        weekHref: buildRealmProgramHref({ realmId: "statistics", year, week, preview: teacherPreview }),
        nextWeekHref: buildRealmProgramHref({ realmId: "statistics", year, week: week + 1, preview: teacherPreview }),
        }}
        tasks={tasks}
      />
    </CanonicalRealmActivityGate>
  );
}
