import { notFound } from "next/navigation";
import StatisticaLessonShell from "@/components/statistica/StatisticaLessonShell";
import { getStatisticaProgramForYearLabel } from "@/data/programs/statistica";

function parseInteger(value: string, minimum: number, maximum: number) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function normalizeLevel(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  const match = /^Year\s+([1-6])$/i.exec(decoded.replace(/\+/g, " ").trim());
  return match ? { label: `Year ${match[1]}`, number: Number(match[1]) } : null;
}

export default async function StatisticaLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; week: string; lesson: string }>;
  searchParams: Promise<{ teacher_preview?: string }>;
}) {
  const [route] = await Promise.all([params, searchParams]);
  const level = normalizeLevel(route.level);
  const week = parseInteger(route.week, 1, 8);
  const lessonNumber = parseInteger(route.lesson, 1, 3);
  if (!level || !week || !lessonNumber) notFound();

  const program = getStatisticaProgramForYearLabel(level.label);
  const weekPlan = program?.find((candidate) => candidate.week === week);
  const lesson = weekPlan?.lessons.find((candidate) => candidate.lesson === lessonNumber);
  if (!weekPlan || !lesson) notFound();

  const lessonConcept = lesson.title.toLowerCase();
  const weekConcept = weekPlan.topic.toLowerCase();

  return (
    <StatisticaLessonShell
      level={level.label}
      levelNumber={level.number}
      week={week}
      lessonNumber={lessonNumber}
      lessonId={lesson.id}
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
