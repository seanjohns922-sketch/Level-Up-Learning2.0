import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { shapeMatchTask, shapeNameTask } from "@/data/activities/starpath/ground/week1Lesson1";
import { objectMatchTask, shapeExplorerTask } from "@/data/activities/starpath/ground/week1Lesson2";
import { compareShapeTask, oddShapeTask, twinMatchTask, whatChangedTask } from "@/data/activities/starpath/ground/week3Tasks";
import { findItTask, sayWhereTask, whichPictureTask } from "@/data/activities/starpath/ground/week4Tasks";
import { directionChoiceTask } from "@/data/activities/starpath/ground/directionTasks";
import type { PositionRelation } from "@/data/activities/starpath/ground/position-objects";

const PLANAR: PositionRelation[] = ["above", "below", "beside"];
const DEPTH: PositionRelation[] = ["behind", "in-front", "inside"];
const ALL: PositionRelation[] = ["above", "below", "beside", "behind", "in-front", "inside"];

// Ground Level Post-Test — the cumulative graduation assessment. 20 single-answer
// graded questions spanning the whole Ground Level:
//   • Shapes (AC9MFSP01): recognise, name, sort, compare, shapes-in-objects
//   • Position (AC9MFSP02): find by position, say where, which picture
//   • Direction (AC9MFSP02): which way / reach the goal
// Same shared rules as every other realm's post-test: 20 questions, 85% to pass,
// unlocks the realm's Legend. Completion-style mechanics (Place It, Follow the
// Clues, paths, collect, sprint) are excluded because each question is graded.
export function buildGroundPostTest(): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  let n = 0;
  const push = (task: PracticeTask) => {
    tasks.push(task);
  };

  // ── Shapes · AC9MFSP01 (7) ─────────────────────────────────────────────────
  push(shapeMatchTask(0, (n += 1)));
  push(shapeNameTask(1, (n += 1)));
  push(objectMatchTask(0, (n += 1)));
  push(shapeExplorerTask(1, (n += 1)));
  push(oddShapeTask(2, (n += 1)));
  push(compareShapeTask(0, (n += 1)));
  push(twinMatchTask(1, (n += 1)));

  // ── Position · AC9MFSP02 (7) ───────────────────────────────────────────────
  push(findItTask(0, (n += 1), PLANAR));
  push(sayWhereTask(0, (n += 1), DEPTH, ALL));
  push(whichPictureTask(1, (n += 1), PLANAR));
  push(findItTask(2, (n += 1), DEPTH));
  push(sayWhereTask(3, (n += 1), ALL, ALL));
  push(whichPictureTask(2, (n += 1), DEPTH));
  push(whatChangedTask(2, (n += 1)));

  // ── Direction · AC9MFSP02 (6) ──────────────────────────────────────────────
  push(directionChoiceTask(0, (n += 1), "moved"));
  push(directionChoiceTask(1, (n += 1), "goal"));
  push(directionChoiceTask(2, (n += 1), "moved"));
  push(directionChoiceTask(3, (n += 1), "goal"));
  push(findItTask(4, (n += 1), ALL));
  push(directionChoiceTask(5, (n += 1), "goal"));

  return tasks;
}

// Registry keyed by level prefix; only Ground has a real post-test today.
const POST_TEST_BUILDERS: Record<string, () => PracticeTask[]> = {
  ground: buildGroundPostTest,
};

export function getStarpathPostTestTasks(levelPrefix: string): PracticeTask[] | null {
  const builder = POST_TEST_BUILDERS[levelPrefix];
  return builder ? builder() : null;
}
