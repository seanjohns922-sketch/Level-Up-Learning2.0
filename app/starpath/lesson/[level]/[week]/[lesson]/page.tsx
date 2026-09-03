import { notFound } from "next/navigation";
import StarpathDevelopmentLesson from "@/components/starpath/StarpathDevelopmentLesson";
import StarpathGroundLesson from "@/components/starpath/StarpathGroundLesson";
import StarpathLevelOneLesson from "@/components/starpath/StarpathLevelOneLesson";
import StarpathLevelTwoLesson from "@/components/starpath/StarpathLevelTwoLesson";
import StarpathLevelThreeLesson from "@/components/starpath/StarpathLevelThreeLesson";
import StarpathLevelFourLesson from "@/components/starpath/StarpathLevelFourLesson";
import StarpathLevelFiveLesson from "@/components/starpath/StarpathLevelFiveLesson";
import StarpathLevelSixLesson from "@/components/starpath/StarpathLevelSixLesson";
import { GROUND_LESSON_CONTENT } from "@/data/activities/starpath/ground";
import { LEVEL_ONE_LESSON_CONTENT } from "@/data/activities/starpath/level1";
import { LEVEL_TWO_LESSON_CONTENT } from "@/data/activities/starpath/level2";
import { LEVEL_THREE_LESSON_CONTENT } from "@/data/activities/starpath/level3";
import { LEVEL_FOUR_LESSON_CONTENT } from "@/data/activities/starpath/level4";
import { LEVEL_FIVE_LESSON_CONTENT } from "@/data/activities/starpath/level5";
import { LEVEL_SIX_LESSON_CONTENT } from "@/data/activities/starpath/level6";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import {
  buildStarpathProgramHref,
  STARPATH_REALM_ID,
} from "@/lib/starpath-routes";
import { CanonicalRealmActivityGate } from "@/components/realms/CanonicalRealmActivityGate";

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

  const lessonContent = GROUND_LESSON_CONTENT[lesson.id]
    ? <StarpathGroundLesson lesson={lessonMetadata} />
    : LEVEL_ONE_LESSON_CONTENT[lesson.id]
      ? <StarpathLevelOneLesson lesson={lessonMetadata} />
      : LEVEL_TWO_LESSON_CONTENT[lesson.id]
        ? <StarpathLevelTwoLesson lesson={lessonMetadata} />
        : LEVEL_THREE_LESSON_CONTENT[lesson.id]
          ? <StarpathLevelThreeLesson lesson={lessonMetadata} />
          : LEVEL_FOUR_LESSON_CONTENT[lesson.id]
            ? <StarpathLevelFourLesson lesson={lessonMetadata} />
            : LEVEL_FIVE_LESSON_CONTENT[lesson.id]
              ? <StarpathLevelFiveLesson lesson={lessonMetadata} />
              : LEVEL_SIX_LESSON_CONTENT[lesson.id]
                ? <StarpathLevelSixLesson lesson={lessonMetadata} />
                : <StarpathDevelopmentLesson lesson={lessonMetadata} />;

  return (
    <CanonicalRealmActivityGate
      realmId="space"
      year={definition.yearLabel}
      week={week}
      activity="lesson"
      lessonNumber={lessonNumber}
    >
      {lessonContent}
    </CanonicalRealmActivityGate>
  );
}
