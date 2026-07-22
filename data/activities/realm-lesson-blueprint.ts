import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type RealmLessonTeachingDefinition = {
  title: string;
  durationMinutes: 1;
  taskKind: PracticeTask["kind"];
};

export type RealmLessonActivityDefinition = {
  key: string;
  title: string;
  description: string;
  taskKinds: readonly PracticeTask["kind"][];
};

export type RealmLessonBlueprint = {
  introduction: string;
  successCriteria: readonly string[];
  artworkSrc: string;
  teaching: RealmLessonTeachingDefinition;
  activities: readonly [
    RealmLessonActivityDefinition,
    RealmLessonActivityDefinition,
    RealmLessonActivityDefinition,
  ];
  reflection: {
    prompt: string;
    options: readonly [string, string, string];
  };
  practisedSkills: readonly string[];
  nextUpLabel: string;
  createTaskGenerator: () => (ctx?: {
    secondsLeft: number;
    totalSeconds: number;
    elapsedSeconds: number;
    difficulty: "easy" | "medium" | "hard";
  }) => PracticeTask;
};
