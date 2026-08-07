import { NUMBER_NEXUS_MISCONCEPTION_IDS } from "./numberNexusMisconceptions";

export type NumberNexusLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type NumberNexusAssessmentKind = "pretest" | "posttest";
export type NumberNexusCurriculumStatus = "aligned" | "partial" | "missing" | "incorrect-metadata";
export type NumberNexusDifficulty = "accessible" | "moderate" | "challenging";
export type NumberNexusCognitiveDemand = "recall" | "understanding" | "application" | "reasoning" | "transfer";

export type NumberNexusDescriptorBlueprint = {
  code: string;
  description: string;
  learningIntentions: readonly string[];
  successCriteria: readonly string[];
  misconceptionIds: readonly string[];
  allocation: { pretest: number; posttest: number };
  curriculumMapping: {
    implementationStatus: NumberNexusCurriculumStatus;
    currentWeeks: readonly number[];
    note: string;
  };
  questionBlueprint: {
    pretestArchetypes: readonly string[];
    posttestArchetypes: readonly string[];
  };
};

export type NumberNexusFormBlueprint = {
  kind: NumberNexusAssessmentKind;
  questionCount: 20;
  passPercent: 85;
  purpose: string;
  difficultyMix: Record<NumberNexusDifficulty, number>;
  cognitiveDemandMix: Record<NumberNexusCognitiveDemand, number>;
  responseMix: { selectedResponseMaximum: number; constructedOrManipulatedMinimum: number };
  orderingRules: readonly string[];
  scaffoldRules: readonly string[];
};

export type NumberNexusLevelBlueprint = {
  level: NumberNexusLevel;
  yearLabel: "Ground" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";
  approvalStatus: "conditionally-approved";
  releaseBlocked: true;
  curriculumSource: string;
  descriptors: readonly NumberNexusDescriptorBlueprint[];
  crossRealmCoverage?: readonly {
    codes: readonly string[];
    ownerRealm: "Pattern Peaks (Algebra)";
    implementationStatus: "relocation-required" | "owned-by-pattern-peaks";
    note: string;
  }[];
  forms: readonly NumberNexusFormBlueprint[];
};

const CURRICULUM_SOURCE = "Australian Curriculum: Mathematics - Curriculum content F-6, Version 9.0 (ACARA); verified against the project owner's canonical PDF; AC9M3M06 assigned to Number Nexus by platform curriculum ownership";

const ORDERING_RULES = [
  "Spiral descriptor evidence through the form and never place more than 2 items from one descriptor consecutively.",
  "Begin with accessible independent responses, not worked examples or recognition-only warm-ups.",
  "Distribute reasoning, misconception and transfer evidence across the form rather than clustering it at the end.",
  "Do not repeat a context, interaction structure, correct-answer position or distinctive visual scaffold consecutively.",
] as const;

const SCAFFOLD_RULES = [
  "Provide only the representations and information required to answer; never display a strategy, worked step or intermediate result.",
  "Use constructed or manipulated responses wherever a student can independently produce the number, expression, model, order or rule.",
  "Use multiple choice only for misconception diagnosis, strategy evaluation, conceptual comparison or interpretation.",
  "Read-aloud support must not name the required operation, place-value step, fraction rule, algorithm or equivalence.",
  "Assessment contexts, values, distractors and visual scaffolds must be independent from lesson and weekly-quiz banks.",
] as const;

function form(
  kind: NumberNexusAssessmentKind,
  difficultyMix: Record<NumberNexusDifficulty, number>,
  cognitiveDemandMix: Record<NumberNexusCognitiveDemand, number>,
  selectedResponseMaximum: number,
  constructedOrManipulatedMinimum: number,
): NumberNexusFormBlueprint {
  return {
    kind,
    questionCount: 20,
    passPercent: 85,
    purpose: kind === "pretest"
      ? "Diagnose independent entry knowledge without familiarity or lesson-scaffold inflation."
      : "Demonstrate independent mastery through application, reasoning, misconception diagnosis and transfer.",
    difficultyMix,
    cognitiveDemandMix,
    responseMix: { selectedResponseMaximum, constructedOrManipulatedMinimum },
    orderingRules: ORDERING_RULES,
    scaffoldRules: SCAFFOLD_RULES,
  };
}

const FORM_MIXES = {
  0: [form("posttest", { accessible: 8, moderate: 8, challenging: 4 }, { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, 10, 10)],
  1: [
    form("pretest", { accessible: 10, moderate: 8, challenging: 2 }, { recall: 4, understanding: 7, application: 6, reasoning: 3, transfer: 0 }, 8, 12),
    form("posttest", { accessible: 7, moderate: 8, challenging: 5 }, { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, 8, 12),
  ],
  2: [
    form("pretest", { accessible: 8, moderate: 9, challenging: 3 }, { recall: 3, understanding: 6, application: 7, reasoning: 4, transfer: 0 }, 6, 14),
    form("posttest", { accessible: 6, moderate: 9, challenging: 5 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, 6, 14),
  ],
  3: [
    form("pretest", { accessible: 7, moderate: 9, challenging: 4 }, { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, 4, 16),
    form("posttest", { accessible: 5, moderate: 9, challenging: 6 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, 4, 16),
  ],
  4: [
    form("pretest", { accessible: 6, moderate: 10, challenging: 4 }, { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, 3, 17),
    form("posttest", { accessible: 4, moderate: 9, challenging: 7 }, { recall: 1, understanding: 4, application: 7, reasoning: 6, transfer: 2 }, 3, 17),
  ],
  5: [
    form("pretest", { accessible: 5, moderate: 10, challenging: 5 }, { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, 2, 18),
    form("posttest", { accessible: 3, moderate: 9, challenging: 8 }, { recall: 1, understanding: 3, application: 6, reasoning: 7, transfer: 3 }, 2, 18),
  ],
  6: [
    form("pretest", { accessible: 4, moderate: 10, challenging: 6 }, { recall: 1, understanding: 4, application: 6, reasoning: 6, transfer: 3 }, 1, 19),
    form("posttest", { accessible: 2, moderate: 8, challenging: 10 }, { recall: 0, understanding: 3, application: 6, reasoning: 7, transfer: 4 }, 1, 19),
  ],
} satisfies Record<NumberNexusLevel, readonly NumberNexusFormBlueprint[]>;

function descriptor(
  code: string,
  description: string,
  learningIntentions: readonly string[],
  successCriteria: readonly string[],
  misconceptionIds: readonly string[],
  allocation: number | { pretest: number; posttest: number },
  implementationStatus: NumberNexusCurriculumStatus,
  currentWeeks: readonly number[],
  note: string,
  pretestArchetypes: readonly string[],
  posttestArchetypes: readonly string[],
): NumberNexusDescriptorBlueprint {
  return {
    code,
    description,
    learningIntentions,
    successCriteria,
    misconceptionIds,
    allocation: typeof allocation === "number" ? { pretest: allocation, posttest: allocation } : allocation,
    curriculumMapping: { implementationStatus, currentWeeks, note },
    questionBlueprint: { pretestArchetypes, posttestArchetypes },
  };
}

const D = descriptor;

export const NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS: readonly NumberNexusLevelBlueprint[] = [
  {
    level: 0,
    yearLabel: "Ground",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9MFN01", "Name, represent and order numbers including zero to at least 20 using materials and numerals.", ["Connect number names, numerals, quantities and positions to 20.", "Order numbers and identify before, after and between."], ["I represent a named number accurately.", "I order numbers to 20 and explain their positions."], ["numeral-quantity-disconnect"], { pretest: 0, posttest: 3 }, "aligned", [1, 2, 3, 7, 8, 12], "Strong coverage; assessment must remain within Number rather than reuse retired Space contexts.", ["Build or select a quantity for a numeral.", "Complete a short number sequence."], ["Create a representation of a number.", "Order unfamiliar representations and explain one position."]),
      D("AC9MFN02", "Recognise and name the number of objects within a collection up to 5 using subitising.", ["Recognise structured quantities to 5 without counting one by one."], ["I name a quantity to 5 after a brief view."], ["subitising-vs-counting"], { pretest: 0, posttest: 2 }, "aligned", [4], "Week 4 is the dedicated subitising sequence and restricts instant-recognition tasks to collections of 1-5.", ["Briefly view and enter a quantity to 5."], ["Match differently arranged collections with the same subitised quantity."]),
      D("AC9MFN03", "Quantify and compare collections to at least 20 using counting and explain or demonstrate reasoning.", ["Count each object once and use cardinality.", "Compare collections using count evidence."], ["I count a rearranged collection accurately.", "I identify more, fewer or equal and show why."], ["counting-one-to-one", "cardinality-and-arrangement"], { pretest: 0, posttest: 3 }, "aligned", [2, 4, 5, 7, 12], "Coverage is broad; assessment must require count evidence rather than visual-size guessing.", ["Count and enter a collection total.", "Compare 2 collections after rearrangement."], ["Build a requested collection.", "Explain which collection has more using a count."]),
      D("AC9MFN04", "Partition and combine collections up to 10 using part-part-whole relationships and subitising to recognise and name the parts.", ["Split a whole into parts in more than one way.", "Combine known parts to make the whole."], ["I create 2 valid partitions of a whole to 10.", "I find a missing part without changing the whole."], ["part-whole-conservation", "subitising-vs-counting"], { pretest: 0, posttest: 4 }, "aligned", [6, 12], "Week 6 teaches the dedicated part-part-whole sequence; Week 12 independently reviews missing and flexible parts.", ["Complete a part-part-whole model.", "Build the same whole in another way."], ["Construct multiple partitions of one whole.", "Repair a model that changes the whole."]),
      D("AC9MFN05", "Represent practical situations involving addition, subtraction and quantification using materials and counting or subitising strategies.", ["Represent adding to, taking away and quantifying situations.", "Use a count or subitising strategy to solve."], ["I build the situation before answering.", "I produce and explain the resulting quantity."], ["operation-story-structure"], { pretest: 0, posttest: 3 }, "aligned", [9, 12], "Week 9 provides the dedicated construction sequence; Week 12 reviews practical collection changes independently.", [], ["Build and solve an unfamiliar add-to or take-away story."]),
      D("AC9MFN06", "Represent practical situations involving equal sharing and grouping using materials and counting or subitising strategies.", ["Model equal sharing and equal grouping.", "Distinguish groups from items in each group."], ["I make equal groups with no items left unfairly placed.", "I answer the quantity asked for in the situation."], ["equal-sharing-vs-grouping"], { pretest: 0, posttest: 3 }, "aligned", [10, 12], "Week 10 teaches sharing and grouping as distinct structures; Week 12 reviews an unfamiliar equal structure.", ["Share a small collection equally."], ["Build equal groups for an unfamiliar practical situation."]),
      D("AC9MFA01", "Recognise, copy and continue repeating patterns represented in different ways.", ["Identify the repeating unit.", "Copy and continue a repeating pattern across representations."], ["I mark the complete repeating unit.", "I continue the pattern without changing its rule."], ["repeating-unit"], { pretest: 0, posttest: 2 }, "aligned", [11, 12], "Week 11 progresses from recognising to continuing and constructing; Week 12 includes independent pattern transfer.", [], ["Create or continue a repeating pattern and identify its unit."]),
    ],
    forms: FORM_MIXES[0],
  },
  {
    level: 1,
    yearLabel: "Year 1",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9M1N01", "Recognise, represent and order numbers to at least 120 using materials, numerals, number lines and charts.", ["Represent and order numbers to 120.", "Use number-line and chart structure to locate numbers."], ["I produce a numeral for a represented quantity.", "I place and order numbers accurately."], ["numeral-quantity-disconnect"], 3, "aligned", [1, 2], "Aligned.", ["Enter a represented number.", "Place a number on a line."], ["Order mixed representations.", "Repair an incorrectly placed number."]),
      D("AC9M1N02", "Partition one- and two-digit numbers in different ways, including tens and ones.", ["Partition numbers into tens and ones and non-standard parts."], ["I build at least 2 valid partitions of the same number."], ["place-value-position", "nonstandard-partition", "part-whole-conservation"], 2, "aligned", [3], "Aligned.", ["Build tens and ones.", "Enter a missing part."], ["Create a non-standard partition.", "Diagnose a partition that changes the whole."]),
      D("AC9M1N03", "Quantify sets to at least 120 by partitioning collections into equal groups using number knowledge and skip counting.", ["Group a collection equally.", "Use skip counting to find the total."], ["I keep group size equal.", "I connect the skip-count sequence to the collection total."], ["skip-count-step", "equal-sharing-vs-grouping"], 2, "aligned", [4, 10], "Aligned.", ["Group and total a collection."], ["Choose and apply an efficient grouping structure."]),
      D("AC9M1N04", "Add and subtract numbers within 20 using part-part-whole knowledge and varied calculation strategies.", ["Use and choose addition and subtraction strategies within 20."], ["I produce an accurate answer and represent my strategy."], ["operation-story-structure"], 3, "aligned", [5, 6, 7], "Aligned; Week 12 provides cumulative review without replacing the dedicated teaching sequence.", ["Enter a sum, difference or missing part."], ["Solve an unfamiliar calculation and compare strategies."]),
      D("AC9M1N05", "Use mathematical modelling for practical additive problems including simple money transactions.", ["Represent a practical additive situation.", "Solve and interpret simple money transactions."], ["I identify known and unknown quantities.", "I communicate the answer in context."], ["operation-story-structure", "coin-count-vs-value", "financial-operation-choice"], 3, "aligned", [7, 8], "Aligned, but assessment must not collapse modelling into keyword MCQ.", ["Model and solve a one-step situation."], ["Choose or create a model, solve it and interpret the result."]),
      D("AC9M1N06", "Use mathematical modelling for practical equal-sharing and grouping problems.", ["Represent equal sharing and grouping situations.", "Use a calculation strategy to solve."], ["I distinguish groups from group size.", "I interpret the answer in the situation."], ["equal-sharing-vs-grouping"], 3, "aligned", [9, 10], "Aligned.", ["Build an equal-share model."], ["Solve and explain an unfamiliar grouping problem."]),
      D("AC9M1A01", "Recognise, continue and create skip-counting pattern sequences, initially by twos, fives and tens.", ["Identify and use a constant skip-count rule."], ["I continue and create a sequence with the stated step."], ["skip-count-step"], 2, "aligned", [4, 10], "Existing skip-count sequence lessons now carry the Algebra descriptor explicitly.", ["Enter missing terms."], ["Create a sequence from a rule and explain the step."]),
      D("AC9M1A02", "Recognise, continue and create repeating patterns and identify the repeating unit.", ["Identify the complete repeat and use it to continue or create a pattern."], ["I mark the repeating unit and preserve it."], ["repeating-unit"], 2, "aligned", [11, 12], "Week 11 now provides a dedicated identify, continue and construct sequence; Week 12 carries explicit cumulative review metadata.", ["Identify the complete repeating unit.", "Continue an unfamiliar repeating pattern."], ["Construct a repeating pattern and identify its unit."]),
    ],
    forms: FORM_MIXES[1],
  },
  {
    level: 2,
    yearLabel: "Year 2",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9M2N01", "Recognise, represent and order numbers to at least 1000 using materials, numerals and number lines.", ["Represent and order numbers to 1000."], ["I locate, represent and order numbers accurately."], ["numeral-quantity-disconnect"], 2, "aligned", [1, 3], "Aligned.", ["Enter or place a number."], ["Order unfamiliar representations and justify one placement."]),
      D("AC9M2N02", "Partition, rearrange, regroup and rename two- and three-digit numbers, including the role of zero.", ["Use standard and non-standard partitions.", "Explain zero as a placeholder."], ["I rename a number without changing its value.", "I preserve place when zero appears."], ["place-value-position", "zero-placeholder", "nonstandard-partition"], 2, "aligned", [2, 3], "Aligned.", ["Build or rename a number."], ["Repair a regrouping error."]),
      D("AC9M2N03", "Recognise and describe one-half as one of 2 equal parts of a whole and connect halves, quarters and eighths through repeated halving.", ["Create equal halves, quarters and eighths.", "Connect each fraction through repeated halving."], ["I verify equal parts.", "I show how one fraction is produced from another."], ["unequal-fraction-parts", "denominator-size", "fraction-whole"], 2, "aligned", [12], "Week 12 includes a dedicated repeated-halving construction lab: whole to halves, quarters and eighths, followed by an explicit fraction-connection decision.", ["Create or identify equal fractional parts."], ["Build quarters or eighths by repeated halving and explain the connection."]),
      D("AC9M2N04", "Add and subtract one- and two-digit numbers using number sentences, part-part-whole reasoning and varied strategies.", ["Represent and solve additive problems with number sentences.", "Choose an efficient strategy."], ["I produce and check an accurate result.", "I connect the strategy to part-part-whole structure."], ["operation-story-structure"], 3, "aligned", [5, 6, 7], "Aligned.", ["Enter a result or missing value."], ["Solve and compare 2 strategies."]),
      D("AC9M2N05", "Multiply and divide by one-digit numbers using repeated addition, equal groups, arrays and partitioning.", ["Represent multiplication and division in multiple ways."], ["I connect an array or grouping model to a correct number sentence."], ["additive-vs-multiplicative", "equal-sharing-vs-grouping"], 3, "aligned", [8, 9, 10], "Aligned.", ["Build or interpret an array/grouping."], ["Choose and apply a model in a practical problem."]),
      D("AC9M2N06", "Use mathematical modelling for additive and multiplicative problems including money transactions.", ["Formulate, solve and interpret practical additive or multiplicative situations."], ["I choose a fitting operation and communicate the contextual solution."], ["operation-story-structure", "financial-operation-choice", "additive-vs-multiplicative"], 3, "aligned", [11], "Week 11 now requires operation selection across additive, multiplicative and change situations using Australian money models.", ["Solve a practical transaction."], ["Model and interpret an unfamiliar transaction or grouping context."]),
      D("AC9M2A01", "Recognise, describe and create additive patterns that increase or decrease by a constant amount, using numbers, shapes and objects, and identify missing elements in the pattern.", ["Determine and describe a constant additive rule.", "Create increasing and decreasing patterns using numbers, shapes and objects.", "Use the rule to identify missing elements."], ["I state the rule and preserve it in both directions.", "I create a valid pattern in more than one representation."], ["pattern-rule-vs-example"], 2, "aligned", [8], "Week 8 covers increasing, decreasing and missing-element patterns, then requires genuine pattern creation using numbers, shapes and objects.", ["Complete or interpret an additive pattern."], ["Create a pattern from a rule and explain a missing term."]),
      D("AC9M2A02", "Recall addition facts to 20 and extend them to related subtraction facts.", ["Recall addition facts and derive inverse subtraction facts."], ["I use one known fact to produce related facts."], ["inverse-addition-subtraction", "fact-recall-transfer"], 2, "aligned", [4, 7], "Aligned.", ["Enter related facts."], ["Use a known fact to solve and justify a related unknown."]),
      D("AC9M2A03", "Recall multiplication facts for twos and derive related division facts using doubling and halving.", ["Recall facts for twos.", "Use doubling and halving to derive related division facts."], ["I connect a twos fact to its division family."], ["fact-recall-transfer", "equal-sharing-vs-grouping"], 1, "aligned", [8, 10], "Weeks 8 and 10 explicitly connect a known double to halving into 2 equal groups and the related division fact.", ["Enter a related twos fact."], ["Derive and explain a multiplication/division fact using doubling or halving."]),
    ],
    forms: FORM_MIXES[2],
  },
  {
    level: 3,
    yearLabel: "Year 3",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9M3N01", "Recognise, represent and order natural numbers using naming and writing conventions for numerals beyond 10 000.", ["Read, write, partition, compare and order natural numbers beyond 10 000."], ["I preserve every place and use conventions accurately."], ["place-value-position", "zero-placeholder"], 3, "aligned", [1], "Week 1 now works beyond 10 000 throughout.", ["Enter or order large numbers."], ["Translate and compare unfamiliar large-number representations."]),
      D("AC9M3N02", "Recognise and represent unit fractions including 1/2, 1/3, 1/4, 1/5 and 1/10 and their multiples in different ways; combine fractions with the same denominator to complete the whole.", ["Represent specified unit fractions and their multiples.", "Combine same-denominator fractions to make a whole."], ["I use equal parts and maintain the same whole.", "I complete the whole accurately."], ["unequal-fraction-parts", "denominator-size", "fraction-whole"], 3, "aligned", [11, 12], "Weeks 11-12 include every required denominator and completing wholes.", ["Build a stated fraction or missing part."], ["Compare representations and complete a whole in a new context."]),
      D("AC9M3N03", "Add and subtract two- and three-digit numbers using place value to partition, rearrange and regroup numbers to assist in calculations without a calculator.", ["Choose and apply place-value strategies for addition and subtraction."], ["I regroup accurately and check the result."], ["operation-story-structure", "reasonableness-no-reference"], 3, "aligned", [3, 4, 5, 6], "Weeks 3-6 provide strategy, regrouping and application evidence.", ["Enter a sum, difference or missing value."], ["Solve a multi-step calculation and diagnose a regrouping error."]),
      D("AC9M3N04", "Multiply and divide one- and two-digit numbers, representing problems using number sentences, diagrams and arrays, and using a variety of calculation strategies.", ["Represent and solve multiplication and division problems."], ["I choose a valid model and interpret the result."], ["additive-vs-multiplicative", "equal-sharing-vs-grouping"], 3, "aligned", [7, 8], "Weeks 7-8 explicitly connect arrays, groups, number sentences and inverse relationships.", ["Build or solve an array/grouping."], ["Apply multiplication or division in an unfamiliar situation."]),
      D("AC9M3N05", "Estimate the quantity of objects in collections and make estimates when solving problems to determine the reasonableness of calculations.", ["Estimate quantities using visual benchmarks.", "Use estimates to judge calculated results."], ["I make a defensible collection estimate.", "I explain why an estimate or result is reasonable."], ["estimation-vs-exact", "reasonableness-no-reference"], 2, "aligned", [2, 6], "Week 2 estimates collections and calculations; Week 6 applies reasonableness checks.", ["Enter a reasonable estimate."], ["Evaluate a result against an estimate and justify the decision."]),
      D("AC9M3N06", "Use mathematical modelling to solve practical problems involving additive and multiplicative situations including financial contexts; formulate problems using number sentences and choose calculation strategies, using digital tools where appropriate; interpret and communicate solutions in terms of the situation.", ["Formulate a practical problem with a number sentence.", "Choose, solve and interpret an efficient strategy."], ["I identify the operation from relationships, not keywords.", "I communicate the result in context."], ["operation-story-structure", "financial-operation-choice", "additive-vs-multiplicative"], 3, "aligned", [6, 9], "Week 6 covers additive modelling; Week 9 covers additive and multiplicative financial modelling.", ["Model a one- or two-step practical problem."], ["Formulate, solve and interpret an unfamiliar financial or multiplicative problem."]),
      D("AC9M3N07", "Follow and create algorithms involving a sequence of steps and decisions to investigate numbers; describe any emerging patterns.", ["Follow a branching number algorithm.", "Create an algorithm and describe its pattern."], ["I preserve step order and decision conditions.", "I describe the pattern generated, not just examples."], ["algorithm-step-order", "pattern-rule-vs-example"], 1, "aligned", [10], "Week 10 progresses from following to decisions and algorithm creation.", ["Follow a number algorithm and determine its output."], ["Create, test and explain a number algorithm."]),
      D("AC9M3M06", "Recognise the relationships between dollars and cents and represent money values in different ways.", ["Use 100 cents = 1 dollar.", "Create equivalent representations of a money value."], ["I convert between dollar-cent forms accurately.", "I represent the same value with different denominations."], ["coin-count-vs-value", "dollar-cent-equivalence"], 2, "aligned", [9], "Intentionally owned by Number Nexus and taught with Australian money representations in Week 9.", ["Enter an equivalent dollar-cent value."], ["Construct equivalent dollar-cent representations and diagnose a non-equivalent value."]),
    ],
    crossRealmCoverage: [{ codes: ["AC9M3A01", "AC9M3A02", "AC9M3A03"], ownerRealm: "Pattern Peaks (Algebra)", implementationStatus: "owned-by-pattern-peaks", note: "From Level 3 onward, Algebra is exclusively owned by Pattern Peaks; Number Nexus contains no AC9M3A-coded lessons or quizzes." }],
    forms: FORM_MIXES[3],
  },
  {
    level: 4,
    yearLabel: "Year 4",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9M4N01", "Use place value to tenths and hundredths and decimal notation to name and represent decimals.", ["Represent, compare and locate tenths and hundredths."], ["I use decimal place value rather than digit length."], ["decimal-place-value", "decimal-length"], 2, "aligned", [2, 3, 4], "Weeks 2-4 align. Week 1 is now accurately marked as Year 3 large-number consolidation and remains a curriculum-design replacement candidate.", ["Enter, build or locate a decimal."], ["Compare decimal representations and diagnose a place-value error."]),
      D("AC9M4N02", "Explain and use properties of odd and even numbers.", ["Classify numbers and reason about parity of sums and products."], ["I justify parity using a property, not only the final digit."], ["odd-even-properties"], 2, "aligned", [5], "Aligned.", ["Classify or complete a parity result."], ["Explain or diagnose an odd/even claim."]),
      D("AC9M4N03", "Find equivalent fractions with related denominators and connect fractions with decimal notation.", ["Generate equivalent fractions.", "Connect familiar fractions and decimals."], ["I scale numerator and denominator together.", "I preserve value across representations."], ["equivalent-fraction-scale", "fraction-decimal-connection"], 2, "partial", [9, 11, 12], "Content is present but distributed and lightly weighted.", ["Build an equivalent fraction or decimal match."], ["Explain equivalence across representations."]),
      D("AC9M4N04", "Count by fractions including mixed numerals and locate and represent them on number lines.", ["Continue fractional sequences.", "Place proper and mixed fractions on number lines."], ["I use equal intervals and preserve the counting step."], ["fraction-number-line", "mixed-number-whole"], 2, "aligned", [9, 10], "Aligned.", ["Place or enter a missing fraction."], ["Create and explain a fractional sequence on a number line."]),
      D("AC9M4N05", "Multiply and divide natural numbers by multiples and powers of 10 using place-value relationships.", ["Apply multiplicative place-value relationships without a calculator."], ["I predict direction and magnitude before calculating."], ["powers-ten-direction"], 1, "aligned", [6, 11, 12], "Aligned.", ["Enter a scaled value."], ["Diagnose and explain a powers-of-ten error."]),
      D("AC9M4N06", "Develop efficient strategies for addition, subtraction, multiplication and division with no remainder.", ["Choose and apply efficient operation strategies."], ["I solve accurately and explain why the strategy fits."], ["operation-story-structure", "additive-vs-multiplicative"], 3, "aligned", [7, 8, 11, 12], "Aligned.", ["Produce a calculation result."], ["Compare strategies in a multi-step application."]),
      D("AC9M4N07", "Use estimation and rounding to check and explain calculations including financial transactions.", ["Select an estimation or rounding approach.", "Use it to judge reasonableness."], ["I justify the benchmark and conclusion."], ["estimation-vs-exact", "reasonableness-no-reference", "financial-operation-choice"], 2, "partial", [12], "Explicit coverage appears only in the final review; it requires a dedicated learning sequence.", ["Estimate and judge a result."], ["Evaluate a financial calculation with a justified estimate."]),
      D("AC9M4N08", "Use mathematical modelling for practical additive and multiplicative problems including financial contexts.", ["Formulate, solve and interpret practical multi-operation problems."], ["I choose efficient operations and communicate contextual conclusions."], ["operation-story-structure", "financial-operation-choice", "additive-vs-multiplicative"], 4, "aligned", [8, 11, 12], "Aligned.", ["Model and solve a practical problem."], ["Formulate and justify a multi-step financial or multiplicative model."]),
      D("AC9M4N09", "Follow and create algorithms using addition or multiplication to generate sets and describe patterns.", ["Run and create number-generating algorithms.", "Identify and explain emerging patterns."], ["I apply every decision correctly.", "I state a general pattern."], ["algorithm-step-order", "pattern-rule-vs-example"], 2, "missing", [], "No explicit number-algorithm sequence is present.", [], ["Create, test and explain an addition or multiplication algorithm."]),
    ],
    crossRealmCoverage: [{ codes: ["AC9M4A01", "AC9M4A02"], ownerRealm: "Pattern Peaks (Algebra)", implementationStatus: "relocation-required", note: "Level 4 Algebra belongs to Pattern Peaks. Any equation or fact-generalisation content in Number Nexus must be reviewed for relocation rather than assessed here." }],
    forms: FORM_MIXES[4],
  },
  {
    level: 5,
    yearLabel: "Year 5",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9M5N01", "Interpret, compare and order numbers with more than 2 decimal places and represent them on number lines.", ["Use place value to compare and locate decimals beyond hundredths."], ["I compare from highest place and place values accurately."], ["decimal-place-value", "decimal-length"], 2, "aligned", [1, 2, 12], "Aligned.", ["Enter, order or place decimals."], ["Diagnose a decimal-order claim and justify placement."]),
      D("AC9M5N02", "Express natural numbers as products of factors, recognise multiples and determine divisibility.", ["Find factors and multiples and test divisibility."], ["I distinguish factors from multiples and justify divisibility."], ["factor-vs-multiple"], 2, "aligned", [3, 4, 12], "Aligned.", ["Construct a factor product or divisibility result."], ["Explain a divisibility decision in an unfamiliar case."]),
      D("AC9M5N03", "Compare and order fractions with same and related denominators, including mixed numerals, and represent them on number lines.", ["Use equivalence, factors and multiples to compare fractions."], ["I create compatible representations and justify the order."], ["denominator-size", "equivalent-fraction-scale", "fraction-number-line", "mixed-number-whole"], 2, "aligned", [7, 12], "Aligned.", ["Order or place fractions."], ["Justify a comparison using equivalence or a number line."]),
      D("AC9M5N04", "Use 100% as the whole and connect familiar percentages with decimal and fraction equivalents.", ["Represent and compare familiar percentages.", "Connect them to fractions and decimals."], ["I identify the whole and preserve equivalent value."], ["percentage-whole", "fraction-decimal-connection"], 2, "partial", [9, 10, 12], "Core equivalence is taught, but percentage-of-amount and discount work in Week 10 belongs to Year 6 AC9M6N07 and must not enter the Year 5 assessment.", ["Construct an equivalent fraction-decimal-percentage match."], ["Compare representations and explain the role of 100%."]),
      D("AC9M5N05", "Solve addition and subtraction problems with same or related fraction denominators.", ["Use equivalence to add and subtract related fractions."], ["I combine equal-sized parts and simplify meaningfully."], ["fraction-add-denominator", "equivalent-fraction-scale"], 2, "aligned", [8, 12], "Aligned.", ["Enter a fraction sum or difference."], ["Solve and explain a related-denominator context."]),
      D("AC9M5N06", "Multiply larger numbers by one- or two-digit numbers using efficient strategies and reasonableness checks.", ["Choose an efficient multiplication strategy.", "Check the result with estimation."], ["I produce an accurate product and a credible check."], ["reasonableness-no-reference", "additive-vs-multiplicative"], 2, "aligned", [5, 12], "Aligned.", ["Enter a product."], ["Solve and evaluate a multiplication strategy."]),
      D("AC9M5N07", "Solve division problems, interpret remainders and express results appropriately.", ["Choose an efficient division strategy.", "Interpret the remainder for the context."], ["I report a whole number, decimal or fraction that fits the situation."], ["remainder-context", "additive-vs-multiplicative"], 2, "aligned", [6, 12], "Aligned.", ["Enter a quotient with an interpreted remainder."], ["Evaluate alternative remainder interpretations."]),
      D("AC9M5N08", "Check and explain reasonableness in problems including financial contexts using suitable estimation.", ["Select and justify an estimation strategy."], ["I use the context to decide whether a result is reasonable."], ["estimation-vs-exact", "reasonableness-no-reference", "financial-operation-choice"], 2, "aligned", [1, 2, 5, 6, 10, 11, 12], "Aligned.", ["Estimate and judge a result."], ["Explain whether a financial solution is reasonable."]),
      D("AC9M5N09", "Use mathematical modelling for practical additive and multiplicative problems including financial contexts.", ["Formulate, solve and interpret multi-step practical problems."], ["I choose efficient operations and communicate a contextual conclusion."], ["operation-story-structure", "financial-operation-choice", "additive-vs-multiplicative"], 2, "aligned", [1, 2, 10, 11, 12], "Aligned, excluding Year 6 percentage-of-quantity content.", ["Model and solve a practical problem."], ["Formulate and justify a multi-step model under a constraint."]),
      D("AC9M5N10", "Create and use algorithms to investigate factors, multiples and divisibility and describe patterns.", ["Build and run divisibility algorithms.", "Interpret resulting patterns."], ["I preserve decisions and explain the general pattern."], ["algorithm-step-order", "pattern-rule-vs-example", "factor-vs-multiple"], 2, "aligned", [3, 4], "Algorithm and divisibility-pattern lessons now carry AC9M5N10 explicitly.", ["Follow a divisibility algorithm."], ["Create, test and explain an algorithm with decisions."]),
    ],
    crossRealmCoverage: [{ codes: ["AC9M5A01", "AC9M5A02"], ownerRealm: "Pattern Peaks (Algebra)", implementationStatus: "relocation-required", note: "Level 5 Algebra belongs to Pattern Peaks. Number Nexus assessment allocation excludes inverse-operation families and unknown-value equations as Algebra outcomes." }],
    forms: FORM_MIXES[5],
  },
  {
    level: 6,
    yearLabel: "Year 6",
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      D("AC9M6N01", "Use integers in situations including financial contexts and represent them on number lines and the Cartesian plane.", ["Interpret, order and represent positive and negative integers.", "Use signed coordinates accurately."], ["I reason correctly about order below zero.", "I preserve coordinate order and signs."], ["integer-order", "coordinate-sign"], 2, "aligned", [4, 10, 11], "Integer and coordinate lessons carry AC9M6N01. Coordinate content remains a Number outcome even where neighbouring Algebra lessons relocate.", ["Place or enter an integer/coordinate."], ["Interpret an unfamiliar integer context and justify a coordinate representation."]),
      D("AC9M6N02", "Identify properties of prime, composite and square numbers and use them to solve problems.", ["Classify numbers by their properties.", "Use factor structure to solve problems."], ["I treat one correctly and justify classifications with factors."], ["prime-composite-one", "factor-vs-multiple"], 2, "aligned", [2], "Number-property lessons now carry AC9M6N02.", ["Classify or construct a number with stated properties."], ["Solve and justify a number-property constraint."]),
      D("AC9M6N03", "Use equivalence to compare, order and represent common fractions on the same number line and justify their order.", ["Create equivalent forms for comparison.", "Justify fraction order on one number line."], ["I use a shared scale and explain the order."], ["denominator-size", "equivalent-fraction-scale", "fraction-number-line"], 2, "aligned", [5], "Fraction equivalence and ordering lessons now carry AC9M6N03.", ["Order or place fractions."], ["Justify an order using equivalence and a shared line."]),
      D("AC9M6N04", "Add and subtract decimals using place value, estimation and rounding to check reasonableness.", ["Align decimal place values and calculate.", "Estimate to check the result."], ["I align by place value and justify reasonableness."], ["decimal-operation-alignment", "reasonableness-no-reference"], 2, "aligned", [1], "Decimal calculation and reasonableness lessons now carry AC9M6N04.", ["Enter a decimal sum or difference."], ["Diagnose a place-value error and verify with estimation."]),
      D("AC9M6N05", "Solve addition and subtraction problems with fractions using equivalent fractions.", ["Create common denominators and solve fraction problems."], ["I preserve value while creating equivalent fractions."], ["fraction-add-denominator", "equivalent-fraction-scale"], 2, "aligned", [6], "Fraction operation lessons now carry AC9M6N05.", ["Enter a fraction sum or difference."], ["Solve and explain an unfamiliar fraction problem."]),
      D("AC9M6N06", "Multiply and divide decimals by powers-of-ten multiples using place value and reasonableness checks.", ["Scale decimals without a calculator.", "Check direction and magnitude."], ["I reason from place value and verify with estimation."], ["powers-ten-direction", "decimal-place-value", "reasonableness-no-reference"], 2, "aligned", [3], "Decimal scaling lessons now carry AC9M6N06.", ["Enter a scaled decimal."], ["Diagnose and explain a decimal-scaling error."]),
      D("AC9M6N07", "Find familiar fractions, decimals or percentages of quantities, including percentage discounts.", ["Choose an efficient representation to find part of a quantity.", "Calculate and interpret discounts."], ["I identify the whole and produce the correct part or sale amount."], ["percentage-of-quantity", "percentage-whole", "fraction-decimal-connection"], 3, "aligned", [7, 8], "Quantity and discount lessons now carry AC9M6N07.", ["Construct a fraction/decimal/percentage amount."], ["Solve and explain an unfamiliar discount or quantity problem."]),
      D("AC9M6N08", "Approximate solutions involving rational numbers and percentages, including financial contexts.", ["Select an appropriate approximation strategy.", "Use it to judge rational-number and percentage results."], ["I state the benchmark and explain why the approximation is useful."], ["estimation-vs-exact", "reasonableness-no-reference", "financial-operation-choice"], 2, "aligned", [1, 3, 8], "Approximation and reasonableness lessons now carry AC9M6N08 in decimal and financial contexts.", ["Approximate and judge a result."], ["Compare financial estimates and justify the useful one."]),
      D("AC9M6N09", "Use mathematical modelling with rational numbers and percentages, including financial contexts, and justify choices.", ["Formulate a rational-number or percentage model.", "Choose operations, interpret results and justify decisions."], ["I state assumptions and constraints.", "I communicate and defend the contextual solution."], ["operation-story-structure", "financial-operation-choice", "percentage-of-quantity"], 3, "aligned", [8], "Financial modelling and communication lessons now carry AC9M6N09.", ["Model and solve a constrained problem."], ["Formulate, solve, interpret and justify an unfamiliar financial decision."]),
    ],
    crossRealmCoverage: [{ codes: ["AC9M6A01", "AC9M6A02", "AC9M6A03"], ownerRealm: "Pattern Peaks (Algebra)", implementationStatus: "relocation-required", note: "Number Nexus Weeks 9-11 are predominantly Algebra and must move to Pattern Peaks or be replaced with Number consolidation before Number Nexus assessments are rebuilt." }],
    forms: FORM_MIXES[6],
  },
] as const;

export function validateNumberNexusAssessmentBlueprints(): string[] {
  const issues: string[] = [];
  const expectedConstructed = [10, 12, 14, 16, 17, 18, 19];
  const seenCodes = new Set<string>();

  for (const blueprint of NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS) {
    if (blueprint.approvalStatus !== "conditionally-approved" || blueprint.releaseBlocked !== true) {
      issues.push(`${blueprint.yearLabel} must remain conditionally approved and release-blocked until curriculum prerequisites pass.`);
    }
    for (const kind of blueprint.level === 0 ? ["posttest"] : ["pretest", "posttest"]) {
      const allocation = blueprint.descriptors.reduce((sum, item) => sum + item.allocation[kind as NumberNexusAssessmentKind], 0);
      if (allocation !== 20) issues.push(`${blueprint.yearLabel} ${kind} descriptor allocation is ${allocation}, expected 20.`);
    }
    for (const formBlueprint of blueprint.forms) {
      const difficultyTotal = Object.values(formBlueprint.difficultyMix).reduce((sum, count) => sum + count, 0);
      const cognitiveTotal = Object.values(formBlueprint.cognitiveDemandMix).reduce((sum, count) => sum + count, 0);
      if (difficultyTotal !== 20) issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} difficulty mix is ${difficultyTotal}.`);
      if (cognitiveTotal !== 20) issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} cognitive mix is ${cognitiveTotal}.`);
      if (formBlueprint.responseMix.constructedOrManipulatedMinimum !== expectedConstructed[blueprint.level]) {
        issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} constructed-response quota is incorrect.`);
      }
      if (formBlueprint.responseMix.selectedResponseMaximum + formBlueprint.responseMix.constructedOrManipulatedMinimum !== 20) {
        issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} response mix does not total 20.`);
      }
    }
    for (const item of blueprint.descriptors) {
      if (seenCodes.has(`${blueprint.level}:${item.code}`)) issues.push(`${blueprint.yearLabel} repeats ${item.code}.`);
      seenCodes.add(`${blueprint.level}:${item.code}`);
      if (item.learningIntentions.length === 0 || item.successCriteria.length === 0) issues.push(`${item.code} has incomplete intentions or criteria.`);
      if (item.misconceptionIds.length === 0) issues.push(`${item.code} has no misconception coverage.`);
      for (const id of item.misconceptionIds) if (!NUMBER_NEXUS_MISCONCEPTION_IDS.has(id)) issues.push(`${item.code} references unknown misconception ${id}.`);
      if (item.curriculumMapping.implementationStatus !== "missing" && item.curriculumMapping.currentWeeks.length === 0) issues.push(`${item.code} has no mapped weeks.`);
      if (item.curriculumMapping.implementationStatus === "missing" && item.questionBlueprint.pretestArchetypes.length > 0) issues.push(`${item.code} defines a pre-test archetype before curriculum coverage exists.`);
    }
  }
  return issues;
}
