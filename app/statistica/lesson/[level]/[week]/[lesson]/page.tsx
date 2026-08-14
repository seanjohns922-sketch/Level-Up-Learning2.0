import { notFound, redirect } from "next/navigation";
import StatisticaLessonHome from "@/components/statistica/StatisticaLessonHome";
import { getStatisticaProgramForYearLabel } from "@/data/programs/statistica";

function parseInteger(value: string, minimum: number, maximum: number) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function normalizeLevel(value: string) {
  const match = /^Year ([1-6])$/.exec(value);
  return match ? { label: `Year ${match[1]}`, number: Number(match[1]) } : null;
}

export default async function StatisticaLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; week: string; lesson: string }>;
  searchParams: Promise<{ teacher_preview?: string }>;
}) {
  const [route, query] = await Promise.all([params, searchParams]);
  const level = normalizeLevel(route.level);
  const week = parseInteger(route.week, 1, 8);
  const lessonNumber = parseInteger(route.lesson, 1, 3);
  if (!level || !week || !lessonNumber) notFound();

  if (query.teacher_preview !== "1") {
    redirect(`/statistica/lesson/${encodeURIComponent(level.label)}/${week}/${lessonNumber}?teacher_preview=1`);
  }

  const program = getStatisticaProgramForYearLabel(level.label);
  const weekPlan = program?.find((candidate) => candidate.week === week);
  const lesson = weekPlan?.lessons.find((candidate) => candidate.lesson === lessonNumber);
  if (!weekPlan || !lesson) notFound();

  const lessonConcept = lesson.title.toLowerCase();
  const weekConcept = weekPlan.topic.toLowerCase();

  return (
    <StatisticaLessonHome
      level={level.label}
      levelNumber={level.number}
      week={week}
      lessonNumber={lessonNumber}
      lessonTitle={lesson.title}
      focus={`use ${lessonConcept} to explore ${weekConcept}`}
      successCriteria={[
        `recognise and use ${lessonConcept}`,
        "use evidence from the data to answer a question",
        `explain how my result connects to ${weekConcept}`,
      ]}
    />
  );
}
