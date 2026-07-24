import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { findItTask, sayWhereTask, whichPictureTask } from "@/data/activities/starpath/ground/week4Tasks";
import type { PositionRelation } from "@/data/activities/starpath/ground/position-objects";

const PLANAR: PositionRelation[] = ["above", "below", "beside"];
const DEPTH: PositionRelation[] = ["behind", "in-front", "inside"];
const ALL: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

// Ground Level · Week 4 Voyage Quiz — 15 questions, 5 from each lesson, using
// single-answer graded position tasks only (Find It, Say Where, Which Picture).
//   L1 Where Is It?      : above / below / beside
//   L2 Around Starpath   : behind / in front / inside
//   L3 Position Challenge: a cumulative mix across all position words
export function buildGroundWeek4VoyageQuiz(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;

  // Lesson 1 — 5 questions (find / which-picture alternating)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    tasks.push(i % 2 === 0 ? findItTask(i, n, PLANAR) : whichPictureTask(i, n, PLANAR));
  }

  // Lesson 2 — 5 questions (say-where / find / which-picture cycling)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    const step = i % 3;
    tasks.push(
      step === 0 ? sayWhereTask(i, n, DEPTH, ALL) : step === 1 ? findItTask(i, n, DEPTH) : whichPictureTask(i, n, DEPTH)
    );
  }

  // Lesson 3 — 5 questions (cumulative mix across all position words)
  for (let i = 0; i < 5; i += 1) {
    n += 1;
    const step = i % 3;
    tasks.push(
      step === 0
        ? findItTask(i + 5, n, ALL)
        : step === 1
          ? sayWhereTask(i + 5, n, ALL, ALL)
          : whichPictureTask(i + 5, n, ALL)
    );
  }

  return tasks;
}
