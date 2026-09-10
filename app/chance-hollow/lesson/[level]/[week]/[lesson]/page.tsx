import { notFound } from "next/navigation";
import ChanceHollowLessonShell from "@/components/chance-hollow/ChanceHollowLessonShell";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";
import { getChanceHollowProgramForYearLabel } from "@/data/programs/chanceHollow";

type PageProps = {
  params: Promise<{
    level: string;
    week: string;
    lesson: string;
  }>;
};

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
  const match = /^Year\s+([3456])$/i.exec(decoded.replace(/\+/g, " ").trim());
  return match ? { label: `Year ${match[1]}`, number: Number(match[1]) } : null;
}

export default async function ChanceHollowLessonPage({ params }: PageProps) {
  const resolved = await params;
  const level = normalizeLevel(resolved.level);
  const week = parseInteger(resolved.week, 1, 6);
  const lessonNumber = parseInteger(resolved.lesson, 1, 3);
  if (!level || !week || !lessonNumber) notFound();

  const weekPlan = getChanceHollowProgramForYearLabel(level.label)?.find((candidate) => candidate.week === week);
  const lesson = weekPlan?.lessons.find((candidate) => candidate.lesson === lessonNumber);

  if (!weekPlan || !lesson) {
    notFound();
  }

  return (
    <CanonicalRealmActivityGate realmId="chance" year={level.label} week={week} lessonNumber={lessonNumber} activity="lesson">
      <ChanceHollowLessonShell
        level={level.label}
        levelNumber={level.number}
        week={week}
        lesson={lesson}
      />
    </CanonicalRealmActivityGate>
  );
}
