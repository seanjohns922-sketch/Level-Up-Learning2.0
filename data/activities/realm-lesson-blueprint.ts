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

export type RealmLessonTaskContext = {
  secondsLeft: number;
  totalSeconds: number;
  elapsedSeconds: number;
  difficulty: "easy" | "medium" | "hard";
};

export type RealmLessonTaskGenerator = (ctx?: RealmLessonTaskContext) => PracticeTask;

export type RealmLessonTaskSet = {
  teaching: RealmLessonTaskGenerator;
  // At least two activity generators; most lessons use three.
  activities: readonly [
    RealmLessonTaskGenerator,
    RealmLessonTaskGenerator,
    ...RealmLessonTaskGenerator[],
  ];
};

function shuffledActivityBag(activityCount: number): number[] {
  const bag = Array.from({ length: activityCount }, (_, index) => index);
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[swapIndex]] = [bag[swapIndex]!, bag[index]!];
  }
  return bag;
}

export function createRandomRealmLessonGenerator(
  taskSet: RealmLessonTaskSet
): RealmLessonTaskGenerator {
  let teachingShown = false;
  let activityBag: number[] = [];

  return (ctx) => {
    if (!teachingShown) {
      teachingShown = true;
      return taskSet.teaching(ctx);
    }

    if (activityBag.length === 0) {
      activityBag = shuffledActivityBag(taskSet.activities.length);
    }
    const activityIndex = activityBag.pop()!;
    return taskSet.activities[activityIndex]!(ctx);
  };
}

export type RealmLessonBlueprint = {
  introduction: string;
  successCriteria: readonly string[];
  artworkSrc: string;
  teaching: RealmLessonTeachingDefinition;
  // At least two activities; most lessons use three.
  activities: readonly [
    RealmLessonActivityDefinition,
    RealmLessonActivityDefinition,
    ...RealmLessonActivityDefinition[],
  ];
  reflection: {
    prompt: string;
    // At least three options; some lessons (e.g. the four familiar shapes) use four.
    options: readonly [string, string, string, ...string[]];
  };
  practisedSkills: readonly string[];
  nextUpLabel: string;
  createTaskSet: () => RealmLessonTaskSet;
};
