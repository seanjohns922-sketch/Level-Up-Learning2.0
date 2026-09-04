import { notFound, redirect } from "next/navigation";
import StarpathVoyageQuiz from "@/components/starpath/StarpathVoyageQuiz";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";
import { getPatternPeaksWeeklyQuizTasks } from "@/data/activities/patternPeaks/weeklyQuizBank";
import { PATTERN_PEAKS_PROGRAMS, type PatternPeaksYearLabel } from "@/data/programs/patternPeaks";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";
import type { LiveRealmId } from "@/lib/realms/realm-registry";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

export const dynamic = "force-dynamic";

function parseLevel(value: string) {
  const match = /^(?:Year\s*)?([3-6])$/i.exec(decodeURIComponent(value));
  return match ? (Number(match[1]) as 3 | 4 | 5 | 6) : null;
}

function parseWeek(value: string) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 && week <= 7 ? week : null;
}

export default async function PatternPeaksQuizPage({ params, searchParams }: {
  params: Promise<{ level: string; week: string }>;
  searchParams: Promise<{ teacher_preview?: string }>;
}) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  const route = await params;
  const query = await searchParams;
  const level = parseLevel(route.level);
  const week = parseWeek(route.week);
  if (!level || !week) notFound();

  const year = `Year ${level}` as PatternPeaksYearLabel;
  const weekPlan = PATTERN_PEAKS_PROGRAMS[year][week - 1];
  const tasks = getPatternPeaksWeeklyQuizTasks(level, week);
  if (!weekPlan || !tasks || tasks.length !== 15) notFound();

  const teacherPreview = query.teacher_preview === "1";
  return (
    <CanonicalRealmActivityGate realmId={"pattern" as LiveRealmId} year={year} week={week} activity="quiz">
      <StarpathVoyageQuiz
        realm="pattern"
        quiz={{
          level: year,
          levelLabel: year,
          week,
          title: `${weekPlan.topic} Quiz`,
          coverage: `15 independent questions: five from each lesson`,
          lessonTitles: weekPlan.lessons.map((lesson) => lesson.title) as [string, string, string],
          lessonCurriculumCodes: weekPlan.lessons.map((lesson) => [...lesson.curriculum]) as [string[], string[], string[]],
          lessonSkillIds: weekPlan.lessons.map((lesson) => [lesson.id]) as [string[], string[], string[]],
          weekHref: buildRealmProgramHref({ realmId: "pattern", year, week, preview: teacherPreview }),
          nextWeekHref: buildRealmProgramHref({ realmId: "pattern", year, week: week + 1, preview: teacherPreview }),
        }}
        tasks={tasks}
      />
    </CanonicalRealmActivityGate>
  );
}
