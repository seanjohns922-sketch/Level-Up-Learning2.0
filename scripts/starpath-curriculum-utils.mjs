import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadTypeScriptModule(file) {
  const source = fs.readFileSync(path.join(repoRoot, file), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

export const registry = await loadTypeScriptModule("data/starpath/program-registry.ts");

const bullets = (values) => values.map((value) => `- ${value}`).join("\n");

export function renderStarpathCurriculumMap() {
  const lines = [
    "# Starpath Curriculum Map",
    "",
    "> Status: Planned for teacher review. This registry contains no playable lessons, quiz banks or assessment banks.",
    "",
    "Starpath uses the canonical realm ID `space`. Every level has exactly 8 weeks and 3 lessons per week. Weeks 1-7 have a 15-question weekly quiz (5 questions per lesson); Week 8 has no quiz and unlocks the 20-question post-test after Lesson 3. Ground Level has no pre-test. Levels 1-6 use a 20-question pre-test.",
    "",
    "## Pathway Rules",
    "",
    "- 85-100%: level mastered; no required weeks.",
    "- 50-84%: targeted pathway based on weak skill-to-week evidence.",
    "- 0-49% or no pre-test result: full 8-week pathway.",
    "- Starpath remains locked and non-persistent until dedicated `space` persistence and playable content exist.",
    "",
    "## Curriculum Sources",
    "",
    ...registry.STARPATH_CURRICULUM_SOURCES.map((source) => `- [${source.label}](${source.url})`),
    "",
  ];

  for (const program of registry.STARPATH_PROGRAMS) {
    lines.push(
      `## ${program.title}`,
      "",
      `**Canonical level:** \`${program.level}\``,
      `**Program ID:** \`${program.programId}\``,
      `**Status:** ${program.status}`,
      "",
      program.summary,
      "",
      "### Curriculum Alignment",
      "",
      ...program.descriptors.map((item) => `- **${item.code}:** ${item.text}`),
      "",
      `**Achievement-standard connection:** ${program.achievementStandardConnection}`,
      "",
      "**Prerequisite knowledge**",
      "",
      bullets(program.prerequisites),
      "",
      "**Likely level misconceptions**",
      "",
      bullets(program.likelyMisconceptions),
      "",
      `**Progression rationale:** ${program.progressionRationale}`,
      "",
      "### Assessment Metadata",
      "",
      program.assessments.preTest
        ? `- Pre-test: \`${program.assessments.preTest.id}\` (${program.assessments.preTest.questionCount} questions; planned)`
        : "- Pre-test: not required",
      `- Post-test: \`${program.assessments.postTest.id}\` (${program.assessments.postTest.questionCount} questions; unlocks after \`${program.assessments.postTest.unlockAfterLessonId}\`; planned)`,
      "",
      "### Skill Taxonomy",
      "",
      "| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |",
      "| --- | --- | --- | ---: | --- | --- |",
      ...program.skills.map((skill) => `| \`${skill.id}\` | ${skill.studentName} | ${skill.teacherDescription} | ${skill.weeks.join(", ")} | ${skill.reportingCategory} | ${skill.prerequisiteSkillIds.map((id) => `\`${id}\``).join(", ") || "None"} |`),
      "",
      "### Eight-Week Sequence",
      "",
    );

    for (const week of program.weeks) {
      lines.push(
        `#### Week ${week.week}: ${week.title}`,
        "",
        `**Central concept:** ${week.centralConcept}`,
        `**Curriculum alignment:** ${week.descriptorCodes.join(", ")}`,
        `**Practised skills:** ${week.skillIds.map((id) => `\`${id}\``).join(", ")}`,
        "",
        "| Lesson | Role | Focus | Learning intention | Activity mechanic families |",
        "| --- | --- | --- | --- | --- |",
        ...week.lessons.map((lesson, index) => `| ${index + 1}. ${lesson.title} (\`${lesson.id}\`) | ${lesson.sequenceRole} | ${lesson.focus} | ${lesson.learningIntention} | ${lesson.activityMechanics.join(", ")} |`),
        "",
        `**Vocabulary:** ${week.vocabulary.join(", ")}`,
        "",
        "**Common misconceptions**",
        "",
        bullets(week.misconceptions),
        "",
        week.quiz
          ? `**Weekly quiz:** \`${week.quiz.id}\` - ${week.quiz.coverage} (${week.quiz.questionCount} questions; planned)`
          : `**Weekly quiz:** none. Week 8 Lesson 3 unlocks \`${program.assessments.postTest.id}\`.`,
        "",
      );
    }
  }

  return `${lines.join("\n").trim()}\n`;
}
