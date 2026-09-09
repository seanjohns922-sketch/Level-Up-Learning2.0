import { notFound } from "next/navigation";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";
import { getChanceHollowWeeklyQuizTasks } from "@/data/activities/chanceHollow/weeklyQuizBank";
import { CHANCE_HOLLOW_PROGRAMS, type ChanceHollowYearLabel } from "@/data/programs/chanceHollow";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";

export const dynamic = "force-dynamic";

function parseLevel(value: string) {
  const match = /^(?:Year\s*)?([3-6])$/i.exec(decodeURIComponent(value));
  return match ? (Number(match[1]) as 3 | 4 | 5 | 6) : null;
}

function parseWeek(value: string) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 && week <= 5 ? week : null;
}

export default async function ChanceHollowQuizPage({ params, searchParams }: {
  params: Promise<{ level: string; week: string }>;
  searchParams: Promise<{ teacher_preview?: string }>;
}) {
  const route = await params;
  const query = await searchParams;
  const level = parseLevel(route.level);
  const week = parseWeek(route.week);
  if (!level || !week) notFound();

  const year = `Year ${level}` as ChanceHollowYearLabel;
  const weekPlan = CHANCE_HOLLOW_PROGRAMS[level][week - 1];
  const tasks = getChanceHollowWeeklyQuizTasks(level, week);
  if (!weekPlan || !tasks || tasks.length !== 15) notFound();

  const teacherPreview = query.teacher_preview === "1";
  return (
    <CanonicalRealmActivityGate realmId="chance" year={year} week={week} activity="quiz">
      <StarpathVoyageQuiz
        realm="chance"
        quiz={{
          level: year,
          levelLabel: year,
          week,
          title: `${weekPlan.topic} Quiz`,
          coverage: `15 independent questions: five from each lesson`,
          lessonTitles: weekPlan.lessons.map((lesson) => lesson.title) as [string, string, string],
          lessonCurriculumCodes: weekPlan.lessons.map((lesson) => [...lesson.curriculum]) as [string[], string[], string[]],
          lessonSkillIds: weekPlan.lessons.map((lesson) => [lesson.id]) as [string[], string[], string[]],
          weekHref: buildRealmProgramHref({ realmId: "chance", year, week, preview: teacherPreview }),
          nextWeekHref: week < 6 ? buildRealmProgramHref({ realmId: "chance", year, week: week + 1, preview: teacherPreview }) : undefined,
        }}
        tasks={tasks}
      />
    </CanonicalRealmActivityGate>
  );
}
