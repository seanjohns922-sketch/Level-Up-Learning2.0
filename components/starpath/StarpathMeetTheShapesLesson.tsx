"use client";

import StarpathLessonShell from "@/components/starpath/StarpathLessonShell";
import type { StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { MEET_THE_SHAPES_CONTENT } from "@/data/activities/starpath/ground/week1Lesson1";

export default function StarpathMeetTheShapesLesson({ lesson }: { lesson: StarpathMissionMetadata }) {
  return <StarpathLessonShell lesson={lesson} content={MEET_THE_SHAPES_CONTENT} />;
}
