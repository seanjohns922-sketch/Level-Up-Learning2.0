import { notFound, redirect } from "next/navigation";
import StarpathDevelopmentLesson from "@/components/starpath/StarpathDevelopmentLesson";
import StarpathGroundLesson from "@/components/starpath/StarpathGroundLesson";
import { GROUND_LESSON_CONTENT } from "@/data/activities/starpath/ground";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import {
  buildStarpathProgramHref,
  STARPATH_REALM_ID,
} from "@/lib/starpath-routes";

export const dynamic = "force-dynamic";

function parseBoundedInteger(value: string, minimum: number, maximum: number) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

export default async function StarpathLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string; week: string; lesson: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/realms");

  const [route, query] = await Promise.all([params, searchParams]);
  const level = tryNormalizeStarpathLevel(route.level);
  const week = parseBoundedInteger(route.week, 1, 8);
  const lessonNumber = parseBoundedInteger(route.lesson, 1, 3);
  const realmId = typeof query.realm_id === "string" ? query.realm_id : null;
  if (!level || !week || !lessonNumber || realmId !== STARPATH_REALM_ID) notFound();

  const definition = getStarpathLevel(level);
  const program = getStarpathProgram(level);
  const lesson = program.weeks[week - 1]?.lessons[lessonNumber - 1];
  if (!lesson || program.realmId !== STARPATH_REALM_ID) notFound();

  const lessonMetadata = {
    level: definition.yearLabel,
    levelLabel: definition.displayLabel,
    week,
    lesson: lessonNumber,
    title: lesson.title,
    focus: lesson.focus,
    learningIntention: lesson.learningIntention,
    registryId: lesson.id,
    status: lesson.status,
    weekHref: buildStarpathProgramHref({ selectedLevel: level }, week),
  };

  if (GROUND_LESSON_CONTENT[lesson.id]) {
    return <StarpathGroundLesson lesson={lessonMetadata} />;
  }

  return (
    <StarpathDevelopmentLesson
      lesson={lessonMetadata}
    />
  );
}
