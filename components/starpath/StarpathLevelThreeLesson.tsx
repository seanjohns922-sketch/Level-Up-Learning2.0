"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { LEVEL_THREE_LESSON_CONTENT } from "@/data/activities/starpath/level3";

export default function StarpathLevelThreeLesson({
  lesson,
}: {
  lesson: StarpathMissionMetadata;
}) {
  const content = LEVEL_THREE_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
