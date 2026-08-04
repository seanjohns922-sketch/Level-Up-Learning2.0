import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { LEVEL_THREE_ARTWORK } from "./week1";

export function teaching(variant: "mapLocate" | "mapPositions" | "mapRoute" | "mapMission" | "mapDebug" | "objectFeatures", heading: string, prompt: string, speakText: string) {
  let target = 0;
  return () => ({ kind: "starpathShapeIntro", scene: "intro", variant, heading, prompt, speakText, target: ++target }) satisfies PracticeTask;
}

type TaskGenerator = (round: number, target: number) => PracticeTask;

export function taskSet(generators: [TaskGenerator, TaskGenerator, TaskGenerator], teach: () => PracticeTask, start = 10): RealmLessonTaskSet {
  let target = start;
  const rounds = generators.map(() => 0);
  return {
    teaching: teach,
    activities: [
      () => generators[0](rounds[0]++ + 0, ++target),
      () => generators[1](rounds[1]++ + 1, ++target),
      () => generators[2](rounds[2]++ + 2, ++target),
    ],
  };
}

export function lessonContent(params: {
  title: string;
  brief: string;
  criteria: [string, string, string];
  activities: [string, string, string];
  kinds: [PracticeTask["kind"], PracticeTask["kind"], PracticeTask["kind"]];
  reflection: string;
  reflectionOptions: [string, string, string];
  skills: [string, string, string];
  next: string;
  createTaskSet: () => RealmLessonTaskSet;
}): StarpathLessonContent {
  return {
    missionBrief: params.brief,
    successCriteria: params.criteria,
    artworkSrc: LEVEL_THREE_ARTWORK,
    teaching: { title: params.title, durationMinutes: 1, taskKind: "starpathShapeIntro" },
    activities: [
      { key: "a1", title: params.activities[0], description: params.activities[0], taskKinds: [params.kinds[0]] },
      { key: "a2", title: params.activities[1], description: params.activities[1], taskKinds: [params.kinds[1]] },
      { key: "a3", title: params.activities[2], description: params.activities[2], taskKinds: [params.kinds[2]] },
    ],
    reflection: { prompt: params.reflection, options: params.reflectionOptions },
    practisedSkills: params.skills,
    nextUpLabel: params.next,
    createTaskSet: params.createTaskSet,
  };
}
