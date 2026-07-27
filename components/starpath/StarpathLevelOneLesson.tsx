"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { LEVEL_ONE_LESSON_CONTENT } from "@/data/activities/starpath/level1";

export default function StarpathLevelOneLesson({
  lesson,
}: {
  lesson: StarpathMissionMetadata;
}) {
  const content = LEVEL_ONE_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
