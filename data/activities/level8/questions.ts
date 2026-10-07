import type { Lesson } from "@/data/programs/year1";
import {
  LEVEL8_WEEK_COUNTS,
  isLevel8Realm,
  type Level8Realm,
} from "@/lib/level8-config";
import { pickLevel7LessonQuiz } from "@/lib/level7-quiz";
import { numberLessons } from "./number";
import { measurementLessons } from "./measurement";
import { spaceLessons } from "./space";
import { patternLessons } from "./pattern";
import { statisticsLessons } from "./statistics";
import { chanceLessons } from "./chance";
import { question, type LessonFactory } from "./shared";
export const LEVEL8_FACTORIES: Record<Level8Realm, LessonFactory[]> = {
  number: numberLessons,
  measurement: measurementLessons,
  space: spaceLessons,
  pattern: patternLessons,
  statistics: statisticsLessons,
  chance: chanceLessons,
};
export function level8Question(
  realm: Level8Realm,
  week: number,
  lesson: number,
  seed: number,
) {
  if (
    !Number.isInteger(week) ||
    !Number.isInteger(lesson) ||
    week < 1 ||
    week > LEVEL8_WEEK_COUNTS[realm] ||
    lesson < 1 ||
    lesson > 3
  )
    throw new Error("Invalid Level 8 lesson");
  const factory = LEVEL8_FACTORIES[realm][(week - 1) * 3 + lesson - 1];
  if (!factory)
    throw new Error(`Missing Level 8 lesson ${realm}/${week}/${lesson}`);
  return question(realm, week, lesson, seed, factory(seed >>> 0));
}
export function generateLevel8Question(_level: unknown, lesson: Lesson) {
  const realm = lesson.id.split("-")[1];
  if (!isLevel8Realm(realm)) throw new Error("Invalid Level 8 realm");
  return level8Question(
    realm,
    lesson.week,
    lesson.lesson,
    Math.floor(Math.random() * 0x7fffffff),
  );
}
export function level8Quiz(realm: Level8Realm, week: number, attempt = 0) {
  if (!Number.isInteger(week) || week < 1 || week >= LEVEL8_WEEK_COUNTS[realm])
    throw new Error("The final week uses the post-test, not a quiz");
  const taken = new Set<string>();
  return [1, 2, 3].flatMap((lesson) =>
    pickLevel7LessonQuiz(
      (_role, seed) => level8Question(realm, week, lesson, seed),
      810007 + week * 10007 + lesson * 101 + attempt * 1000003,
      (q) =>
        JSON.stringify([
          q.prompt,
          q.cave7Visual,
          q.measurement8Visual,
          q.number8Visual,
          q.space8Visual,
        ]),
      `Level 8 ${realm} ${week}/${lesson}`,
      taken,
    ).map((q, i) => ({
      ...q,
      id: `y8-${realm}-w${week}-quiz-l${lesson}-${i + 1}`,
      lessonTag: lesson as 1 | 2 | 3,
    })),
  );
}
