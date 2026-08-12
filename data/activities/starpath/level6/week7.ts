import { noticeRuleTask, varyTask, evidenceTask } from "./tessellationTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathTessellation", "starpathTessellation", "starpathTessellation"] as const;
const teach = (heading: string, prompt: string, speakText: string) => teaching(heading, prompt, speakText, "l6Trans");

export const createNoticeRuleTaskSet = () => taskSet([noticeRuleTask, noticeRuleTask, noticeRuleTask], teach("Investigate Patterns", "Notice the rule behind a pattern.", "Investigate a tessellation by tracking one tile onto the next. The move that repeats — a slide, turn or flip — is the pattern rule."));
export const createVaryTaskSet = () => taskSet([varyTask, varyTask, varyTask], teach("Vary a Transformation", "Change one part and see what happens.", "A tessellation needs identical copies fitting exactly. Changing a copy's size or angle breaks the fit, leaving gaps or overlaps."), 20);
export const createEvidenceTaskSet = () => taskSet([evidenceTask, evidenceTask, evidenceTask], teach("Explain with Evidence", "Prove it with evidence.", "Use evidence, not looks. A pattern is a tessellation only when there are no gaps and no overlaps anywhere."), 30);

export const NOTICE_RULE_CONTENT = lessonContent({
  title: "Notice the Pattern Rule",
  brief: "Investigate a tessellation and describe the transformation rule that repeats.",
  criteria: ["track a tile onto its neighbour", "name the repeating rule", "connect images to a rule"],
  activities: ["Spot the Rule", "Tile to Tile", "Name the Pattern"],
  kinds,
  reflection: "How do you find a pattern's rule?",
  reflectionOptions: ["Track one tile onto the next", "Count the colours", "Measure the tiles"],
  skills: ["Investigate patterns", "Identify rules", "Reason from images"],
  next: "Vary One Transformation",
  createTaskSet: createNoticeRuleTaskSet,
});

export const VARY_CONTENT = lessonContent({
  title: "Vary One Transformation",
  brief: "Predict how changing one transformation changes the pattern.",
  criteria: ["predict the effect of a change", "know copies must be congruent", "spot a broken tessellation"],
  activities: ["What Breaks It?", "Change One Thing", "Predict the Effect"],
  kinds,
  reflection: "What happens if copies are different sizes?",
  reflectionOptions: ["Gaps or overlaps appear", "Nothing changes", "The colour changes"],
  skills: ["Predict pattern changes", "Reason about congruence", "Spot broken fits"],
  next: "Explain with Evidence",
  createTaskSet: createVaryTaskSet,
});

export const EVIDENCE_CONTENT = lessonContent({
  title: "Explain with Evidence",
  brief: "Justify whether a pattern is a tessellation using evidence, not looks.",
  criteria: ["use no-gap evidence", "reject looks-based reasoning", "justify a tessellation"],
  activities: ["What's the Evidence?", "Prove It", "Justify the Pattern"],
  kinds,
  reflection: "What is the evidence for a tessellation?",
  reflectionOptions: ["No gaps and no overlaps", "It looks nice", "It has many tiles"],
  skills: ["Use evidence", "Justify with rigour", "Evaluate patterns"],
  next: "Week 7 Voyage Quiz",
  createTaskSet: createEvidenceTaskSet,
});
