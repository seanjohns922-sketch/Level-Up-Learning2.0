import type { RealmLessonBlueprint } from "@/data/activities/realm-lesson-blueprint";

export type StarpathLessonContent = Omit<RealmLessonBlueprint, "introduction"> & {
  missionBrief: string;
};
