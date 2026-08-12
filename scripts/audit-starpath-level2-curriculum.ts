import { LEVEL_TWO_LESSON_CONTENT } from "../data/activities/starpath/level2";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../data/assessments/starpathAssessmentBlueprint";
import { getStarpathProgram } from "../data/starpath/program-registry";
import { isPracticeTaskSafe } from "../lib/task-safety";

const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);
const program = getStarpathProgram("level-2");

const expectedDescriptors = new Map([
  ["AC9M2SP01", "recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight"],
  ["AC9M2SP02", "locate positions in two-dimensional representations of a familiar space; move positions by following directions and pathways"],
]);

check(program.status === "implemented", "Level 2 program must be implemented.");
check(program.weeks.length === 8, "Level 2 must contain eight weeks.");
check(program.skills.length === 8 && program.skills.every((skill) => skill.status === "implemented"), "All eight Level 2 reporting skills must be implemented.");
check(program.descriptors.length === 2, "Level 2 must contain exactly two curriculum descriptors.");
for (const descriptor of program.descriptors) {
  check(expectedDescriptors.get(descriptor.code) === descriptor.text, `${descriptor.code} does not use the supplied curriculum wording.`);
}

const expectedWeekCodes = [
  ["AC9M2SP01"], ["AC9M2SP01"], ["AC9M2SP01"], ["AC9M2SP01"],
  ["AC9M2SP02"], ["AC9M2SP02"], ["AC9M2SP02"], ["AC9M2SP01", "AC9M2SP02"],
];
const lessonIds = program.weeks.flatMap((week) => week.lessons.map((lesson) => lesson.id));
check(lessonIds.length === 24 && new Set(lessonIds).size === 24, "Level 2 must contain 24 unique lessons.");
check(Object.keys(LEVEL_TWO_LESSON_CONTENT).length === 24, "Level 2 lesson-content registry must contain exactly 24 entries.");
check(lessonIds.every((id) => id in LEVEL_TWO_LESSON_CONTENT), "A Level 2 registry lesson has no playable content.");
check(Object.keys(LEVEL_TWO_LESSON_CONTENT).every((id) => lessonIds.includes(id)), "Level 2 lesson content contains an orphan lesson ID.");

for (const [index, week] of program.weeks.entries()) {
  check(JSON.stringify(week.descriptorCodes) === JSON.stringify(expectedWeekCodes[index]), `Week ${index + 1} has incorrect descriptor coverage.`);
  check(week.status === "implemented", `Week ${index + 1} is not implemented.`);
  check(week.lessons.length === 3 && week.lessons.every((lesson) => lesson.status === "implemented"), `Week ${index + 1} must have three implemented lessons.`);
  if (index < 7) check(week.quiz?.questionCount === 15 && week.quiz.status === "implemented", `Week ${index + 1} quiz must be implemented with 15 questions.`);
  else check(week.quiz === null, "Week 8 must finish with the Post-Test, not a weekly quiz.");

  for (const lesson of week.lessons) {
    const content = LEVEL_TWO_LESSON_CONTENT[lesson.id]!;
    check(Boolean(content.missionBrief.trim()) && content.successCriteria.length >= 3, `${lesson.id} lacks a complete mission brief.`);
    check(content.activities.length === 3, `${lesson.id} must expose three activity stages.`);
    const taskSet = content.createTaskSet();
    const tasks = taskSet.activities.flatMap((activity) => [activity(), activity()]);
    check(tasks.length >= 6, `${lesson.id} must generate at least six audit samples.`);
    check(tasks.every(isPracticeTaskSafe), `${lesson.id} generates a task blocked by the safety gate.`);
    check(tasks.every((task) => "prompt" in task && Boolean(task.prompt.trim())), `${lesson.id} generates a task without a prompt.`);
    check(tasks.every((task) => "speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim())), `${lesson.id} generates a task without read-aloud text.`);
  }
}

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 2);
check(Boolean(blueprint), "Year 2 assessment blueprint is missing.");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") ?? false, "Year 2 blueprint mappings must be aligned after the curriculum audit.");

console.log(`Level 2 Starpath curriculum audit: ${passed} passed, ${failures.length} failed.`);
console.log("Coverage: 8 weeks, 24 lessons, 2 descriptors, 7 weekly quizzes.");
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
