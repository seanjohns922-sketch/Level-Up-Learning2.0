"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { LEVEL_FOUR_LESSON_CONTENT } from "@/data/activities/starpath/level4";

export default function StarpathLevelFourLesson({ lesson }: { lesson: StarpathMissionMetadata }) {
  const content = LEVEL_FOUR_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
