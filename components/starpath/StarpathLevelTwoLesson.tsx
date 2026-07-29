"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { LEVEL_TWO_LESSON_CONTENT } from "@/data/activities/starpath/level2";

export default function StarpathLevelTwoLesson({
  lesson,
}: {
  lesson: StarpathMissionMetadata;
}) {
  const content = LEVEL_TWO_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
