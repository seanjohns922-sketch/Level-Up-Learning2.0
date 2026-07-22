"use client";

import { useEffect } from "react";
import StarpathMissionHome, { type StarpathMissionMetadata } from "@/components/starpath/StarpathMissionHome";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";

export default function StarpathDevelopmentLesson({ lesson }: { lesson: StarpathMissionMetadata }) {
  useEffect(() => {
    writeStarpathDemoJourney(lesson.level, {
      currentWeek: lesson.week,
      currentLesson: lesson.lesson,
    });
  }, [lesson.lesson, lesson.level, lesson.week]);

  return <StarpathMissionHome lesson={lesson} />;
}
