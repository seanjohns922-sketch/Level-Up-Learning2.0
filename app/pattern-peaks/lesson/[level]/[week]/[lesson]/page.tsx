import { notFound, redirect } from "next/navigation";
import PatternPeaksLessonShell from "@/components/pattern-peaks/PatternPeaksLessonShell";
import { getPatternPeaksProgramForYearLabel } from "@/data/programs/patternPeaks";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";
import type { LiveRealmId } from "@/lib/realms/realm-registry";

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
  const match = /^Year\s+([3-6])$/i.exec(decoded.replace(/\+/g, " ").trim());
  return match ? { label: `Year ${match[1]}`, number: Number(match[1]) } : null;
}

export default async function PatternPeaksLessonPage({
  params,
}: {
  params: Promise<{ level: string; week: string; lesson: string }>;
}) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");

  const route = await params;
  const level = normalizeLevel(route.level);
  const week = parseInteger(route.week, 1, 8);
  const lessonNumber = parseInteger(route.lesson, 1, 3);
  if (!level || !week || !lessonNumber) notFound();

  const program = getPatternPeaksProgramForYearLabel(level.label);
  const weekPlan = program?.find((candidate) => candidate.week === week);
  const lesson = weekPlan?.lessons.find((candidate) => candidate.lesson === lessonNumber);
  if (!lesson) notFound();

  return (
    <CanonicalRealmActivityGate realmId={"pattern" as LiveRealmId} year={level.label} week={week} activity="lesson" lessonNumber={lessonNumber}>
      <PatternPeaksLessonShell level={level.label} levelNumber={level.number} week={week} lesson={lesson} />
    </CanonicalRealmActivityGate>
  );
}
