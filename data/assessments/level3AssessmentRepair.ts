import type { Question } from "./posttests";
import { createUncalibratedItemStatistics, type IndependentAssessmentItem } from "./assessmentItemStandard";

// The legacy renderer shapes remain supported; new IDs prevent old drafts being
// silently interpreted as this curriculum-corrected form.
export function repairLevel3Form(form: "pretest" | "posttest", questions: Question[]): Array<Question & IndependentAssessmentItem> {
  const post = form === "posttest";
  const descriptors = ["AC9M3N01","AC9M3N01","AC9M3N05","AC9M3N05","AC9M3N03","AC9M3N03","AC9M3N03","AC9M3N03","AC9M3M06","AC9M3M06","AC9M3N06","AC9M3N06","AC9M3N04","AC9M3N04","AC9M3N04","AC9M3N07","AC9M3N02","AC9M3N02","AC9M3N02","AC9M3N02"];
  return questions.map((original, index) => {
    let q = { ...original };
    const numeric = (prompt: string, answer: string) => { q = { ...q, type: "numeric", prompt, correctAnswer: answer, answer, options: [], visual: undefined }; };
    if (index === 0) numeric(post ? "What is 20,000 + 5,000 + 600 + 40 + 8?" : "What is 10,000 + 3,000 + 400 + 20 + 6?", post ? "25648" : "13426");
    if (index === 1) {
      const values = post ? ["25,608", "25,860", "25,680", "25,086"] : ["13,406", "13,640", "13,460", "13,064"];
      const answer = post ? "25,086||25,608||25,680||25,860" : "13,064||13,406||13,460||13,640";
      q = { ...q, type: "number_order", prompt: "Put these numbers in order from smallest to largest.", options: values, correctAnswer: answer, answer, visual: undefined };
    }
    if (index === 2) numeric(post ? "Round 6,742 to the nearest 100." : "Round 4,368 to the nearest 100.", post ? "6700" : "4400");
    if (index === 3) numeric(post ? "A class collected 346 cards and then 172 more. Round each amount to the nearest hundred, then estimate the total." : "A class collected 248 stickers and then 173 more. Round each amount to the nearest hundred, then estimate the total.", post ? "500" : "400");
    if (index === 8) numeric(post ? "Write $6.40 as a number of cents." : "Write $4.70 as a number of cents.", post ? "640" : "470");
    if (index === 9) numeric(post ? "You have $3 and three 20-cent coins. How many 10-cent coins have the same total value?" : "You have $2 and four 20-cent coins. How many 10-cent coins have the same total value?", post ? "36" : "28");
    if (index === 15) numeric(post ? "Start at 18. If the number is even, halve it; otherwise add 5. Then add 3. What is the final number?" : "Start at 14. If the number is even, halve it; otherwise add 5. Then add 3. What is the final number?", post ? "12" : "10");
    if (post && index === 6) numeric("What is 104 − 99?", "5");
    if (post && index === 7) numeric("What is the difference between 96 and 132?", "36");
    if (post && index === 11) numeric("There were 450 tickets. 186 were sold in the morning and 95 in the afternoon. How many are left?", "169");
    if (post && index === 12) numeric("There are 5 bags with 6 oranges in each bag. How many oranges are there altogether?", "30");
    if (post && index === 13) q = { ...q, type: "mcq", prompt: "Which multiplication sentence matches an array with 4 rows of 5?", correctAnswer: "4 × 5 = 20", answer: "4 × 5 = 20", options: ["4 + 5 = 9", "20 ÷ 5 = 5", "4 × 5 = 20", "5 + 5 + 5 = 15"], visual: undefined };
    if (post && index === 14) numeric("What number makes this true: 5 × ? = 40", "8");
    if (post && index === 17) q = { ...q, type: "build_whole", prompt: "This single block is 1 of 4 equal parts. Which picture shows the whole?", correctAnswer: "a", answer: "a", options: [{id:"a",label:"4 equal parts",parts:4},{id:"b",label:"3 equal parts",parts:3},{id:"c",label:"5 equal parts",parts:5}], visual:{fractionLabel:"1/4",denominator:4} };
    if (post && index === 18) q = { ...q, type: "fraction_order", prompt: "Put the fractions in order from smallest to largest.", correctAnswer:"1/4,1/2,3/4",answer:"1/4,1/2,3/4",options:["3/4","1/4","1/2"],visual:undefined};
    const descriptor = descriptors[index]!;
    const mode = ["mcq", "fraction_mcq", "fraction_model_select", "build_whole"].includes(q.type ?? "") ? "selected_response" : q.type === "numeric" ? "constructed_response" : "manipulated_response";
    const demand = [9, 10, 11, 15].includes(index) ? "application" : [0, 2, 8].includes(index) ? "understanding" : "application";
    const difficulty = [9, 10, 11, 15].includes(index) ? "challenging" : [0, 2, 8].includes(index) ? "easy" : "moderate";
    const id = `y3-number-${post ? "post" : "pre"}-${String(index + 1).padStart(2, "0")}-v2`;
    return { ...q, id, schemaVersion: 1, version: "2.0.0", realm: "number", level: 3, form, origin: "assessment_authored", sourcePool: form,
      bankId: `number-nexus-level-3-${form}-v2`, primaryDescriptorCode: descriptor, descriptorCodes: [descriptor], curriculumCodes: [descriptor],
      curriculumLessonMapping: [{ week: index === 8 || index === 9 ? 9 : index === 15 ? 10 : q.linkedWeeks?.[0] ?? 1, lesson: 1 }],
      linkedWeeks: index === 8 || index === 9 ? [9] : index === 15 ? [10] : q.linkedWeeks,
      skillId: index === 8 || index === 9 ? "dollar_cent_equivalence" : index === 15 ? "follow_branching_algorithm" : q.skillId,
      skillLabel: index === 8 || index === 9 ? "Equivalent Australian money values" : index === 15 ? "Follow a branching number algorithm" : q.skillLabel,
      cognitiveCategory: demand, difficulty, responseMode: mode, isTransfer: false, requiresReasoning: false, misconceptionDiagnosis: false, misconceptionTags: [],
      contextKey: id, structureKey: `number-y3-slot-${index + 1}`, renderer: { type: q.type, payload: { prompt: q.prompt, visual: q.visual, options: q.options } },
      scoring: { kind: "exact", correctResponse: String(q.correctAnswer) }, statistics: createUncalibratedItemStatistics(difficulty) } as Question & IndependentAssessmentItem;
  });
}
