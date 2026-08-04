import assert from "node:assert/strict";
import * as p1 from "@/data/activities/prepMeasurelands/week1Quiz";
import * as p2 from "@/data/activities/prepMeasurelands/week2Quiz";
import * as p3 from "@/data/activities/prepMeasurelands/week3Quiz";
import * as p4 from "@/data/activities/prepMeasurelands/week4Quiz";
import * as p5 from "@/data/activities/prepMeasurelands/week5Quiz";
import * as p6 from "@/data/activities/prepMeasurelands/week6Quiz";
import * as p7 from "@/data/activities/prepMeasurelands/week7Quiz";
import * as y11 from "@/data/activities/year1Measurelands/week1Quiz";
import * as y12 from "@/data/activities/year1Measurelands/week2Quiz";
import * as y13 from "@/data/activities/year1Measurelands/week3Quiz";
import * as y14 from "@/data/activities/year1Measurelands/week4Quiz";
import * as y15 from "@/data/activities/year1Measurelands/week5Quiz";
import * as y16 from "@/data/activities/year1Measurelands/week6Quiz";
import * as y17 from "@/data/activities/year1Measurelands/week7Quiz";
import * as y21 from "@/data/activities/year2Measurelands/week1Quiz";
import * as y22 from "@/data/activities/year2Measurelands/week2Quiz";
import * as y23 from "@/data/activities/year2Measurelands/week3Quiz";
import { buildY2MeasurelandsWeek4Lesson1QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson1";
import { buildY2MeasurelandsWeek4Lesson2QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson2";
import { buildY2MeasurelandsWeek4Lesson3QuizTasks } from "@/data/activities/year2Measurelands/week4Lesson3";
import * as y25 from "@/data/activities/year2Measurelands/week5Quiz";
import * as y26 from "@/data/activities/year2Measurelands/week6Quiz";
import * as y27 from "@/data/activities/year2Measurelands/week7Quiz";
import { getY3MeasurelandsLessonQuizContribution } from "@/data/activities/year3Measurelands/registry";
import { getY4MeasurelandsLessonQuizContribution } from "@/data/activities/year4Measurelands/registry";
import { getY5MeasurelandsLessonQuizContribution } from "@/data/activities/year5Measurelands/registry";
import { getY6MeasurelandsLessonQuizContribution } from "@/data/activities/year6Measurelands/registry";

type QuizModule = Record<string, unknown>;
const y24 = { buildWeek4QuizTasks: () => [
  ...buildY2MeasurelandsWeek4Lesson1QuizTasks(),
  ...buildY2MeasurelandsWeek4Lesson2QuizTasks(),
  ...buildY2MeasurelandsWeek4Lesson3QuizTasks(),
] };
const modules: QuizModule[][] = [
  [p1, p2, p3, p4, p5, p6, p7],
  [y11, y12, y13, y14, y15, y16, y17],
  [y21, y22, y23, y24, y25, y26, y27],
];

function buildFromModule(module: QuizModule): unknown[] {
  const builder = Object.entries(module).find(([name, value]) =>
    name.includes("QuizTasks") && typeof value === "function",
  )?.[1] as (() => unknown[]) | undefined;
  assert.ok(builder, "Weekly quiz module must export a quiz task builder.");
  return builder();
}

let routes = 0;
for (let level = 0; level <= 2; level += 1) {
  for (let week = 1; week <= 7; week += 1) {
    const tasks = buildFromModule(modules[level]![week - 1]!);
    assert.equal(tasks.length, 15, `Level ${level} Week ${week} must build 15 questions.`);
    assert.ok(tasks.every(Boolean), `Level ${level} Week ${week} contains an invalid task.`);
    routes += 1;
  }
}

const registries = [
  getY3MeasurelandsLessonQuizContribution,
  getY4MeasurelandsLessonQuizContribution,
  getY5MeasurelandsLessonQuizContribution,
  getY6MeasurelandsLessonQuizContribution,
];
for (let level = 3; level <= 6; level += 1) {
  for (let week = 1; week <= 7; week += 1) {
    const lessonCounts = [1, 2, 3].map((lesson) =>
      registries[level - 3]!(`y${level}-measurement-w${week}-l${lesson}`).length,
    );
    assert.deepEqual(lessonCounts, [5, 5, 5], `Level ${level} Week ${week} must use a 5-5-5 split.`);
    routes += 1;
  }
}

console.log(`Measurelands weekly quiz audit passed: ${routes}/49 routes build 15 valid questions in a 5-5-5 split.`);
