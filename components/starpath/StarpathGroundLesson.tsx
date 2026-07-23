"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { GROUND_LESSON_CONTENT } from "@/data/activities/starpath/ground";

// Renders any Ground Level lesson that has playable content, looked up by its
// registry id. The page only mounts this when content exists.
export default function StarpathGroundLesson({ lesson }: { lesson: StarpathMissionMetadata }) {
  const content = GROUND_LESSON_CONTENT[lesson.registryId];
  if (!content) return null;
  return <StarpathLessonShell lesson={lesson} content={content} />;
}
