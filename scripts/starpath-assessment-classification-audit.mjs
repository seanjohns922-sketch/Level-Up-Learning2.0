#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const requireText = (source, expected, message) => {
  if (!source.includes(expected)) failures.push(message);
};

const wrapper = read("components/assessment/MeasurelandsAssessmentTask.tsx");
const card = read("components/starpath/StarpathObjectCard.tsx");
const pretest = read("app/pretest/page.tsx");
const posttest = read("app/posttest/page.tsx");

requireText(wrapper, 'task.kind === "starpathObject" && task.mode === "classify"', "Starpath classification assessments do not enable editable mode.");
requireText(wrapper, "recordAssessmentAnswer: (correct)", "Starpath classification results are not recorded through the neutral assessment contract.");
requireText(card, "if (!isEditableAssessment && classifyTask.assignments[selectedId] !== groupId)", "Assessment sorting still reveals incorrect groups while the child is working.");
requireText(card, "moveAgain(objectId", "Placed assessment objects cannot be moved to another group.");
requireText(card, "recordClassification", "Classification answers still submit automatically.");
requireText(card, "min-h-32 w-full", "Classification group targets are not large enough for reliable placement.");
requireText(card, "Place all ${classifyTask.scene.length} objects", "Incomplete classifications do not block explicit recording.");
requireText(pretest, "<MeasurelandsAssessmentTask", "Pre-tests do not use the shared interactive assessment wrapper.");
requireText(posttest, "<MeasurelandsAssessmentTask", "Post-tests do not use the shared interactive assessment wrapper.");

if (failures.length > 0) {
  console.error(`Starpath assessment classification audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Starpath assessment classification audit passed: large targets, editable placement and explicit neutral recording cover pre/post-tests.");
