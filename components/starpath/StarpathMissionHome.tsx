"use client";

import { useRouter } from "next/navigation";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import { RealmLessonHome } from "@/components/lesson/RealmLessonHome";

export type StarpathMissionMetadata = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  lesson: number;
  title: string;
  focus: string;
  learningIntention: string;
  registryId: string;
  status: string;
  weekHref: string;
};

function starpathLevelNumber(level: RealmLevelId) {
  if (level === "Prep") return 0;
  const parsed = Number(level.replace("Year ", ""));
  return Number.isInteger(parsed) ? parsed : 0;
}

/**
 * A Starpath mission's start page: the shared lesson start page with the
 * mission's own brief and artwork. A mission still being prepared shows the
 * page with its start button disabled.
 */
export default function StarpathMissionHome({
  lesson,
  content,
  onStart,
}: {
  lesson: StarpathMissionMetadata;
  content?: StarpathLessonContent;
  onStart?: () => void;
}) {
  const router = useRouter();
  const available = lesson.status === "implemented" && Boolean(content) && Boolean(onStart);
  return (
    <RealmLessonHome
      realm="space"
      levelNumber={starpathLevelNumber(lesson.level)}
      levelLabel={lesson.levelLabel}
      year={lesson.level}
      week={lesson.week}
      lessonNumber={lesson.lesson}
      lessonTitle={lesson.title}
      focus={lesson.learningIntention}
      successCriteria={content?.successCriteria ?? [lesson.focus]}
      intro={content?.missionBrief ?? "This Starpath mission is being prepared for future explorers. It will open when its three practice activities are ready."}
      artworkSrc={content?.artworkSrc ?? "/images/starpath-home-bg-ground.png"}
      // Starpath missions start straight away; their guides live inside the mission.
      hasNativeStartGuide
      startDisabled={!available}
      startDisabledLabel="Mission preparation in progress"
      onBack={() => router.push(lesson.weekHref)}
      onStart={() => onStart?.()}
    />
  );
}
