import { LEVEL_THREE_LESSON_CONTENT } from "../data/activities/starpath/level3/index";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../data/assessments/starpathAssessmentBlueprint";
import { getStarpathProgram } from "../data/starpath/program-registry";
import { isPracticeTaskSafe } from "../lib/task-safety";

const failures: string[] = [];
let passed = 0;
const check = (condition: boolean, message: string) => condition ? passed += 1 : failures.push(message);
const program = getStarpathProgram("level-3");

const expectedDescriptors = new Map([
  ["AC9M3SP01", "Make, compare and classify objects, identifying key features and explaining why those features make them suited to their uses."],
  ["AC9M3SP02", "Interpret and create two-dimensional representations of familiar environments, locating key landmarks and objects relative to each other."],
]);
const expectedWeekCodes = [
  ["AC9M3SP01"], ["AC9M3SP01"], ["AC9M3SP01"],
  ["AC9M3SP02"], ["AC9M3SP02"], ["AC9M3SP02"],
  ["AC9M3SP01", "AC9M3SP02"], ["AC9M3SP01", "AC9M3SP02"],
];
const leakage = /\b(?:line symmetry|rotational symmetry|tessellat(?:e|ion)|cartesian|ordered pair|x[- ]axis|y[- ]axis|front view|side view|hidden (?:face|edge|vertex|feature))\b/i;

check(program.status === "implemented", "Level 3 program must be implemented.");
check(program.weeks.length === 8, "Level 3 must contain eight weeks.");
check(program.skills.length === 8 && program.skills.every((skill) => skill.status === "implemented"), "All eight Level 3 reporting skills must be implemented.");
check(program.descriptors.length === 2, "Level 3 must contain exactly the two Year 3 Space descriptors.");
for (const descriptor of program.descriptors) check(expectedDescriptors.get(descriptor.code) === descriptor.text, `${descriptor.code} does not use the approved curriculum wording.`);

const lessonIds = program.weeks.flatMap((week) => week.lessons.map((lesson) => lesson.id));
check(lessonIds.length === 24 && new Set(lessonIds).size === 24, "Level 3 must contain 24 unique lessons.");
check(Object.keys(LEVEL_THREE_LESSON_CONTENT).length === 24, "Level 3 lesson-content registry must contain exactly 24 entries.");
check(lessonIds.every((id) => id in LEVEL_THREE_LESSON_CONTENT), "A Level 3 registry lesson has no playable content.");
check(Object.keys(LEVEL_THREE_LESSON_CONTENT).every((id) => lessonIds.includes(id)), "Level 3 lesson content contains an orphan lesson ID.");

for (const [index, week] of program.weeks.entries()) {
  check(JSON.stringify(week.descriptorCodes) === JSON.stringify(expectedWeekCodes[index]), `Week ${index + 1} has incorrect descriptor coverage.`);
  check(week.status === "implemented", `Week ${index + 1} is not implemented.`);
  check(week.lessons.length === 3 && week.lessons.every((lesson) => lesson.status === "implemented"), `Week ${index + 1} must have three implemented lessons.`);
  if (index < 7) check(week.quiz?.questionCount === 15 && week.quiz.status === "implemented", `Week ${index + 1} quiz must be implemented with 15 questions.`);
  else check(week.quiz === null, "Week 8 must finish with the Post-Test, not a weekly quiz.");

  for (const lesson of week.lessons) {
    const content = LEVEL_THREE_LESSON_CONTENT[lesson.id]!;
    check(Boolean(content.missionBrief.trim()) && content.successCriteria.length >= 3, `${lesson.id} lacks a complete mission brief.`);
    check(content.activities.length === 3, `${lesson.id} must expose three activity stages.`);
    check(!leakage.test([lesson.title, lesson.learningIntention, content.missionBrief, ...content.successCriteria].join(" ")), `${lesson.id} contains content above the Year 3 Space boundary.`);
    const tasks = content.createTaskSet().activities.flatMap((activity) => [activity(), activity()]);
    check(tasks.length === 6, `${lesson.id} must generate six audit samples.`);
    check(tasks.every(isPracticeTaskSafe), `${lesson.id} generates a task blocked by the safety gate.`);
    check(tasks.every((task) => "prompt" in task && typeof task.prompt === "string" && Boolean(task.prompt.trim())), `${lesson.id} generates a task without a prompt.`);
    check(tasks.every((task) => "speakText" in task && typeof task.speakText === "string" && Boolean(task.speakText.trim())), `${lesson.id} generates a task without read-aloud text.`);
    check(tasks.every((task) => {
      const prompt = "prompt" in task && typeof task.prompt === "string" ? task.prompt : "";
      const speakText = "speakText" in task && typeof task.speakText === "string" ? task.speakText : "";
      return !leakage.test(`${prompt} ${speakText}`);
    }), `${lesson.id} generates above-level content.`);
  }
}

const blueprint = STARPATH_ASSESSMENT_BLUEPRINTS.find((item) => item.level === 3);
check(Boolean(blueprint), "Year 3 assessment blueprint is missing.");
check(blueprint?.descriptors.every((item) => item.curriculumMapping.implementationStatus === "aligned") ?? false, "Year 3 blueprint mappings must be aligned.");

console.log(`Level 3 Starpath curriculum audit: ${passed} passed, ${failures.length} failed.`);
console.log("Coverage: 8 weeks, 24 lessons, AC9M3SP01 + AC9M3SP02, 7 weekly quizzes, Week 8 Post-Test.");
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
