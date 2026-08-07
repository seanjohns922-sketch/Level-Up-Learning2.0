"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { LEVEL_FIVE_LESSON_CONTENT } from "@/data/activities/starpath/level5";

export default function StarpathLevelFiveLesson({ lesson }: { lesson: StarpathMissionMetadata }) {
  const content = LEVEL_FIVE_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
