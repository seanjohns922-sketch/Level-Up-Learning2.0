"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { LEVEL_SIX_LESSON_CONTENT } from "@/data/activities/starpath/level6";

export default function StarpathLevelSixLesson({ lesson }: { lesson: StarpathMissionMetadata }) {
  const content = LEVEL_SIX_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
