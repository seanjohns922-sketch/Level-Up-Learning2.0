import fs from "node:fs";
import path from "node:path";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";

const lines: string[] = [
  "# Number Nexus Assessment Blueprint",
  "",
  "Status: **Conditionally approved - assessment generation remains blocked**",
  "",
  "This document defines assessment content only. The assessment engine, routing, persistence, progression, replay, reporting, rewards, placement and database schema remain frozen.",
  "",
  "The blueprint design is approved. Assessment generation proceeds level by level only after that level's curriculum coverage and metadata are verified; later blocked levels must not be bypassed.",
  "",
  "## Curriculum Ownership",
  "",
  "- Ground-Level 2: Number Nexus owns Australian Curriculum v9.0 Number and Algebra.",
  "- Level 3-Level 6: Number Nexus owns Number only.",
  "- Level 3-Level 6 Algebra is owned by Pattern Peaks and must not be assessed in Number Nexus.",
  "- AC9M3M06 dollar-cent relationships is intentionally owned by Number Nexus.",
  "",
  "## Permanent Assessment Rules",
  "",
  "- Pre-tests and post-tests contain 20 independent assessment-bank items and use the existing 85% pass threshold.",
  "- Constructed and manipulated responses follow the frozen level quotas in the Assessment Framework.",
  "- Lesson, weekly-quiz and assessment banks may share a descriptor but never wording, values, contexts, distractors, payloads or visual scaffolds.",
  "- Multiple choice is reserved for misconception diagnosis, strategy evaluation, conceptual comparison and interpretation.",
  "- Missing or partial lesson coverage blocks assessment-bank release; assessment items are not used to compensate for untaught curriculum.",
  "",
];

for (const blueprint of NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS) {
  lines.push(`## ${blueprint.yearLabel}`, "", "### Form Design", "");
  lines.push("| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const form of blueprint.forms) {
    lines.push(`| ${form.kind} | ${form.questionCount} | ${form.passPercent}% | ${form.difficultyMix.accessible} | ${form.difficultyMix.moderate} | ${form.difficultyMix.challenging} | ${form.cognitiveDemandMix.recall} | ${form.cognitiveDemandMix.understanding} | ${form.cognitiveDemandMix.application} | ${form.cognitiveDemandMix.reasoning} | ${form.cognitiveDemandMix.transfer} | ${form.responseMix.constructedOrManipulatedMinimum} | ${form.responseMix.selectedResponseMaximum} |`);
  }
  lines.push("");

  for (const item of blueprint.descriptors) {
    const pre = item.questionBlueprint.pretestArchetypes.length > 0
      ? item.questionBlueprint.pretestArchetypes.map((archetype) => `- Pre-Test: ${archetype}`)
      : ["- Pre-Test: Blocked until curriculum coverage exists"];
    const post = item.questionBlueprint.posttestArchetypes.length > 0
      ? item.questionBlueprint.posttestArchetypes.map((archetype) => `- Post-Test: ${archetype}`)
      : ["- Post-Test: Blocked until curriculum coverage exists"];
    lines.push(
      `### ${item.code}`,
      "",
      `**Descriptor:** ${item.description}`,
      "",
      "**Learning Intentions**",
      "",
      ...item.learningIntentions.map((intention) => `- ${intention}`),
      "",
      "**Success Criteria**",
      "",
      ...item.successCriteria.map((criterion) => `- ${criterion}`),
      "",
      `**Question Allocation:** Pre-Test ${item.allocation.pretest}; Post-Test ${item.allocation.posttest}`,
      "",
      "**Difficulty Mix:** Governed by the level form design above; descriptor items must span the allocated form bands rather than repeat one procedure.",
      "",
      "**Reasoning Mix:** Post-Test allocation prioritises application, reasoning and transfer; recall is used only when explicitly allocated at form level.",
      "",
      `**Misconceptions:** ${item.misconceptionIds.map((id) => `\`${id}\``).join(", ")}`,
      "",
      `**Curriculum Mapping:** **${item.curriculumMapping.implementationStatus}**; weeks ${item.curriculumMapping.currentWeeks.length > 0 ? item.curriculumMapping.currentWeeks.join(", ") : "none"}. ${item.curriculumMapping.note}`,
      "",
      "**Question Blueprint**",
      "",
      ...pre,
      ...post,
      "",
    );
  }

  if (blueprint.crossRealmCoverage?.length) {
    lines.push("### Cross-Realm Boundary", "");
    for (const boundary of blueprint.crossRealmCoverage) {
      lines.push(`- **${boundary.codes.join(", ")} -> ${boundary.ownerRealm}:** ${boundary.note}`);
    }
    lines.push("");
  }
}

lines.push(
  "## Approval Gate",
  "",
  "Approval must confirm descriptor ownership, lesson coverage status, allocations, response quotas, misconception coverage and question archetypes. Approval does not switch production banks. Independent item authoring and educator review remain separate later phases.",
  "",
);

const output = path.join(process.cwd(), "docs/number-nexus/assessment-blueprint.md");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(`Generated ${output}`);
