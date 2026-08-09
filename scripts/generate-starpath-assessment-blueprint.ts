import fs from "node:fs";
import {
  STARPATH_ASSESSMENT_BLUEPRINTS,
  type StarpathFormBlueprint,
} from "../data/assessments/starpathAssessmentBlueprint";
import { getStarpathMisconception } from "../data/assessments/starpathMisconceptions";

const outputPath = new URL("../docs/starpath/assessment-blueprint.md", import.meta.url);

function formRow(form: StarpathFormBlueprint): string {
  const difficulty = form.difficultyMix;
  const cognitive = form.cognitiveDemandMix;
  return `| ${form.kind} | ${form.questionCount} | ${form.passPercent}% | ${difficulty.accessible} | ${difficulty.moderate} | ${difficulty.challenging} | ${cognitive.recall} | ${cognitive.understanding} | ${cognitive.application} | ${cognitive.reasoning} | ${cognitive.transfer} | ${form.responseMix.constructedOrManipulatedMinimum} | ${form.responseMix.selectedResponseMaximum} |`;
}

const lines: string[] = [
  "# Starpath Assessment Blueprint",
  "",
  "Status: **Conditionally approved - assessment generation remains blocked**",
  "",
  "The purpose of a Level Up Learning assessment is not to measure whether a student remembers the lesson. It is to determine whether the student can independently transfer, apply and reason with the curriculum after learning has occurred.",
  "",
  "This blueprint defines Starpath assessment content only. The assessment engine, routing, saving, progression, replay, reporting, rewards, placement and database schema remain frozen. No assessment questions are approved for generation until the relevant level passes its curriculum, weekly-quiz and independent-bank audits.",
  "",
  "## Curriculum Source and Ownership",
  "",
  "- Source of truth: *Australian Curriculum: Mathematics - Curriculum content F-6, Version 9.0*, supplied project PDF `mathematics-curriculum-content-f-6-v9 (4).pdf`.",
  "- Starpath owns the complete Space strand from Foundation to Year 6.",
  "- Ground has one post-test. Levels 1-6 each have one pre-test and one post-test.",
  "- Every form contains exactly 20 questions and retains the existing 85% threshold.",
  "",
  "## Independent Item Rules",
  "",
  "- Lesson Bank, Weekly Quiz Bank and Assessment Bank are separate.",
  "- Forms may assess the same descriptor but must not reuse lesson or quiz wording, values, contexts, distractors, payloads, route layouts, maps, models or visual scaffolds.",
  "- Constructed or manipulated responses include drawing, placing, sorting, building, routing, transforming and independently recording a spatial explanation.",
  "- Multiple choice is limited to misconception diagnosis, conceptual comparison, interpretation and evaluation.",
  "- Visuals contain only information required by the task. Keys, labels, marked features and read-aloud must not disclose the answer or strategy.",
  "- Foundation tasks are visual first, use minimal language, and provide neutral read-aloud for every instruction and selectable response.",
  "",
  "## Release Sequence",
  "",
  "1. Verify curriculum and lesson metadata against the supplied ACv9 PDF.",
  "2. Verify every weekly quiz independently assesses that week's three lessons.",
  "3. Approve the level blueprint and item archetypes.",
  "4. Author an independent assessment bank with canonical metadata.",
  "5. Run automated validation and educator review.",
  "6. Pilot, calibrate and explicitly promote the bank to production.",
  "",
];

for (const blueprint of STARPATH_ASSESSMENT_BLUEPRINTS) {
  lines.push(`## ${blueprint.yearLabel}`, "", "### Form Design", "");
  lines.push("| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const form of blueprint.forms) lines.push(formRow(form));
  lines.push("");

  for (const item of blueprint.descriptors) {
    lines.push(`### ${item.code}`, "", `**Descriptor:** ${item.descriptor}`, "", "**Learning Intentions**", "");
    for (const intention of item.learningIntentions) lines.push(`- ${intention}`);
    lines.push("", "**Success Criteria**", "");
    for (const criterion of item.successCriteria) lines.push(`- ${criterion}`);
    lines.push(
      "",
      `**Question Allocation:** Pre-Test ${item.allocation.pretest}; Post-Test ${item.allocation.posttest}`,
      "",
      `**Difficulty Mix:** ${item.difficultyMix}`,
      "",
      `**Reasoning Mix:** ${item.reasoningMix}`,
      "",
      "**Misconceptions**",
      "",
    );
    for (const id of item.misconceptionIds) {
      const misconception = getStarpathMisconception(id);
      lines.push(`- \`${id}\`: ${misconception?.label ?? "Unknown"} - ${misconception?.description ?? "Missing canonical definition."}`);
    }
    lines.push(
      "",
      `**Curriculum Mapping:** **${item.curriculumMapping.implementationStatus}**; weeks ${item.curriculumMapping.currentWeeks.join(", ")}. ${item.curriculumMapping.note}`,
      "",
      "**Question Blueprint**",
      "",
    );
    if (item.questionBlueprint.pretestArchetypes.length === 0) lines.push("- Pre-Test: Not applicable for Foundation.");
    else for (const archetype of item.questionBlueprint.pretestArchetypes) lines.push(`- Pre-Test: ${archetype}`);
    for (const archetype of item.questionBlueprint.posttestArchetypes) lines.push(`- Post-Test: ${archetype}`);
    lines.push("");
  }
}

lines.push(
  "## Current Production Blocker",
  "",
  "The existing Ground Starpath post-test remains a legacy implementation. It reuses lesson and weekly-quiz generators, contains no qualifying constructed or manipulated responses under this framework, and includes read-aloud or visual cues that can disclose target information. It is not an approved Starpath Assessment Bank and must not be treated as blueprint-compliant.",
  "",
  "All Starpath levels remain release-blocked until the required audits and independent item reviews are complete.",
);

fs.mkdirSync(new URL("../docs/starpath/", import.meta.url), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
console.log(`Generated ${outputPath.pathname}`);
