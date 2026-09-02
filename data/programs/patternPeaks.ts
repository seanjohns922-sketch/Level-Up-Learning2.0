import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

export type PatternPeaksYearLabel = "Year 3" | "Year 4" | "Year 5" | "Year 6";

type LessonSeed = { title: string; focus: string; mechanic: string; curriculum: CurriculumCode[] };
type WeekSeed = { topic: string; purpose: string; lessons: [LessonSeed, LessonSeed, LessonSeed] };

const lesson = (title: string, focus: string, mechanic: string, ...curriculum: CurriculumCode[]): LessonSeed => ({ title, focus, mechanic, curriculum });

const level3Seeds: WeekSeed[] = [
  {
    topic: "Spot Patterns",
    purpose: "Notice, describe and explain how doubling and halving sequences change.",
    lessons: [
      lesson("What Changes?", "Identify the operation and amount of change between consecutive terms.", "Pattern scanner", "AC9M3A01"),
      lesson("Double or Halve", "Recognise extended sequences formed by repeated doubling or halving.", "Crystal chain", "AC9M3A01"),
      lesson("Find the Broken Step", "Locate and repair a term that does not follow a doubling or halving rule.", "Fault finder", "AC9M3A01"),
    ],
  },
  {
    topic: "Continue and Create",
    purpose: "Continue, complete and create extended doubling and halving sequences.",
    lessons: [
      lesson("Continue the Sequence", "Apply a doubling or halving rule accurately across several steps.", "Sequence bridge", "AC9M3A01"),
      lesson("Missing Terms", "Reason forwards and backwards to restore missing sequence terms.", "Missing rune slots", "AC9M3A01"),
      lesson("Create a Pattern", "Choose a valid start and rule, then explain the resulting sequence.", "Pattern forge", "AC9M3A01"),
    ],
  },
  {
    topic: "Rules and Function Machines",
    purpose: "Connect a simple operation rule with its inputs, outputs and sequence.",
    lessons: [
      lesson("Inputs and Outputs", "Apply one-step double, halve, add or subtract rules to several inputs.", "Function machine", "AC9M3A01", "AC9M3A02"),
      lesson("Discover the Rule", "Infer a consistent operation rule from several input-output pairs.", "Rule decoder", "AC9M3A01", "AC9M3A02"),
      lesson("Build a Rule Machine", "Create and test a one-step rule that produces specified outputs.", "Machine builder", "AC9M3A01", "AC9M3A02"),
    ],
  },
  {
    topic: "Inverse Relationships",
    purpose: "Use inverse operations to connect facts and check results.",
    lessons: [
      lesson("Addition and Subtraction", "Explain with a model how addition and subtraction undo each other.", "Inverse portals", "AC9M3A02"),
      lesson("Related Multiplication Facts", "Connect known multiplication facts for 3, 4, 5 and 10 with related division facts.", "Fact-family vault", "AC9M3A03"),
      lesson("Check with the Inverse", "Select and apply an inverse operation to verify a calculated answer.", "Balance check", "AC9M3A02", "AC9M3A03"),
    ],
  },
  {
    topic: "Equivalent Number Sentences",
    purpose: "Partition numbers and generate different number sentences with the same value.",
    lessons: [
      lesson("Balance Both Sides", "Decide whether two additive number sentences represent equal values.", "Equation scales", "AC9M3A02"),
      lesson("True or False?", "Test and explain equivalence without treating equals as an answer cue.", "Truth gates", "AC9M3A02"),
      lesson("Make an Equivalent Sentence", "Partition a number to create a different but equivalent additive sentence.", "Equation builder", "AC9M3A02"),
    ],
  },
  {
    topic: "Find the Unknown",
    purpose: "Use inverse reasoning and known facts to determine missing values.",
    lessons: [
      lesson("Missing Addends", "Find an unknown part in addition and subtraction number sentences.", "Hidden-rune equations", "AC9M3A02"),
      lesson("Missing Fact Values", "Use known multiplication and related division facts to find a missing value.", "Fact lock", "AC9M3A03"),
      lesson("Explain the Unknown", "Choose a strategy and justify why the missing value makes the sentence true.", "Reasoning chamber", "AC9M3A02", "AC9M3A03"),
    ],
  },
  {
    topic: "Properties and Structure",
    purpose: "Use patterns in known facts to calculate efficiently with larger numbers.",
    lessons: [
      lesson("Patterns in Addition Facts", "Use patterns in facts to 20 to derive related calculations with larger numbers.", "Fact ladder", "AC9M3A03"),
      lesson("Multiplication Fact Patterns", "Recognise and explain patterns in the 3, 4, 5 and 10 multiplication facts.", "Array observatory", "AC9M3A03"),
      lesson("Choose an Efficient Fact", "Select a known or related fact that reduces the calculation effort.", "Strategy sorter", "AC9M3A03"),
    ],
  },
  {
    topic: "Pattern Investigation",
    purpose: "Apply, compare and justify pattern and inverse reasoning in an investigation.",
    lessons: [
      lesson("Plan and Test", "Plan a sequence investigation and record the resulting values systematically.", "Investigation board", "AC9M3A01", "AC9M3A02"),
      lesson("Compare Two Rules", "Compare two rules and explain where their outputs differ or coincide.", "Dual-rule race", "AC9M3A01", "AC9M3A03"),
      lesson("Justify and Diagnose", "Evaluate a claim, identify its error and support a correction with evidence.", "Pattern trial", "AC9M3A01", "AC9M3A02", "AC9M3A03"),
    ],
  },
];

// ACARA Mathematics Curriculum F-6 v9: AC9M4A01 and AC9M4A02.
const level4Seeds: WeekSeed[] = [
  {
    topic: "Equality and Balance",
    purpose: "Interpret the equals sign relationally and decide whether additive equations remain balanced.",
    lessons: [
      lesson("What Does Equal Mean?", "Interpret equals as a relationship between two values rather than an answer prompt.", "Twin-pan equality lab", "AC9M4A01"),
      lesson("Balance Both Sides", "Compare both sides of additive equations and restore equality after one side changes.", "Mountain balance bridge", "AC9M4A01"),
      lesson("True, False or Repair", "Test additive equations, identify false relationships and repair one value.", "Truth beacon network", "AC9M4A01"),
    ],
  },
  {
    topic: "Addition Unknowns",
    purpose: "Find unknown addends in different equation positions by using relational and inverse reasoning.",
    lessons: [
      lesson("Find the Missing Addend", "Determine an unknown addend by connecting the whole and known part.", "Hidden crystal sum", "AC9M4A01"),
      lesson("Unknowns Move Around", "Solve equations when the addition unknown appears in different positions.", "Sliding rune equation", "AC9M4A01"),
      lesson("Prove the Missing Value", "Use substitution or an inverse to prove that an unknown makes both sides equal.", "Proof pedestal", "AC9M4A01"),
    ],
  },
  {
    topic: "Subtraction Unknowns",
    purpose: "Use part-part-whole and inverse relationships to solve and explain subtraction equations.",
    lessons: [
      lesson("Missing Parts", "Model subtraction equations and determine an unknown part or unknown whole.", "Split-stone model", "AC9M4A01"),
      lesson("Undo with Addition", "Transform subtraction unknowns into related addition equations and solve efficiently.", "Inverse cable lift", "AC9M4A01"),
      lesson("Diagnose the Difference", "Analyse an incorrect subtraction equation and explain the misunderstood relationship.", "Difference fault console", "AC9M4A01"),
    ],
  },
  {
    topic: "Equivalent Additive Equations",
    purpose: "Use commutative and associative structure to construct equivalent additive equations.",
    lessons: [
      lesson("Reorder Without Changing", "Apply commutativity and explain why reordering addends preserves the total.", "Commutative cable cars", "AC9M4A01"),
      lesson("Regroup the Parts", "Regroup three or more addends to simplify a calculation while preserving value.", "Associative climbing holds", "AC9M4A01"),
      lesson("Build an Equivalent Equation", "Construct a different addition or subtraction expression with the same value.", "Equation forge", "AC9M4A01"),
    ],
  },
  {
    topic: "Multiplication Fact Patterns",
    purpose: "Represent and explain multiplication facts to 10 x 10 and their related division facts.",
    lessons: [
      lesson("Read the Fact Grid", "Use arrays and a fact grid to locate facts, symmetry and related products.", "Illuminated fact grid", "AC9M4A02"),
      lesson("Connect Related Facts", "Derive unfamiliar facts by doubling, halving or using a nearby known fact.", "Fact-link climbing wall", "AC9M4A02"),
      lesson("Reveal the Division Facts", "Use a known product to state and explain its related division facts.", "Reversible array gate", "AC9M4A02"),
    ],
  },
  {
    topic: "Derive Harder Facts",
    purpose: "Use known facts and properties to derive efficient strategies for 6, 7, 8 and 9 facts.",
    lessons: [
      lesson("Double to Build Sixes", "Use threes facts and doubling to derive and explain connected sixes facts.", "Doubling crystal tower", "AC9M4A02"),
      lesson("Split to Build Sevens", "Partition sevens into useful facts and represent the reasoning with arrays.", "Split-array workshop", "AC9M4A02"),
      lesson("Ten Times Minus One", "Derive nines facts from tens facts by subtracting one equal group.", "Nine-step summit trail", "AC9M4A02"),
    ],
  },
  {
    topic: "Efficient Fact Strategies",
    purpose: "Select and apply multiplication fact strategies to larger calculations without a calculator.",
    lessons: [
      lesson("Choose the Best Known Fact", "Compare known-fact pathways and select the most efficient calculation route.", "Strategy route planner", "AC9M4A02"),
      lesson("Scale Facts Up", "Extend basic facts to larger multiples using place value and explain the connection.", "Fact scaling telescope", "AC9M4A02"),
      lesson("Mental Strategy Challenge", "Solve larger calculations mentally and justify the fact relationship used.", "No-calculator ascent", "AC9M4A02"),
    ],
  },
  {
    topic: "Equation Expedition",
    purpose: "Integrate additive unknowns and multiplication fact structure in a reasoning investigation.",
    lessons: [
      lesson("Follow the Clues", "Combine equation clues and multiplication facts to determine connected unknowns.", "Equation clue map", "AC9M4A01", "AC9M4A02"),
      lesson("Compare Two Strategies", "Evaluate two valid strategies and explain which is more efficient here.", "Dual-path strategy race", "AC9M4A01", "AC9M4A02"),
      lesson("Defend the Solution", "Diagnose a flawed solution and support the corrected equation with evidence.", "Summit reasoning tribunal", "AC9M4A01", "AC9M4A02"),
    ],
  },
];

// ACARA Mathematics Curriculum F-6 v9: AC9M5A01 and AC9M5A02.
const level5Seeds: WeekSeed[] = [
  {
    topic: "Multiplication and Division Inverses",
    purpose: "Explain how multiplication and division undo each other and support efficient calculation.",
    lessons: [
      lesson("Operations That Undo", "Model multiplication and division as inverse operations with arrays and equations.", "Inverse summit portals", "AC9M5A01"),
      lesson("Turn Division Around", "Rewrite division as related multiplication and use it to determine the quotient.", "Reversible operation dial", "AC9M5A01"),
      lesson("Check with the Inverse", "Verify solutions by selecting and applying the appropriate inverse equation.", "Inverse proof scanner", "AC9M5A01"),
    ],
  },
  {
    topic: "Fact Families",
    purpose: "Develop complete multiplication and division fact families from multiplicative partitions.",
    lessons: [
      lesson("Four Connected Facts", "Generate two multiplication and two division equations from one array.", "Four-face fact crystal", "AC9M5A01"),
      lesson("Partition the Product", "Represent a product with different equal groupings and connect each fact.", "Partitioning platform", "AC9M5A01"),
      lesson("Complete the Family", "Infer missing family members from one multiplication or division equation.", "Fact-family archive", "AC9M5A01"),
    ],
  },
  {
    topic: "Unknown Multiplicative Parts",
    purpose: "Use inverse relationships to solve for an unknown product, factor, dividend or divisor.",
    lessons: [
      lesson("Unknown Products and Factors", "Distinguish missing products and factors, then choose the inverse needed.", "Factor lock mechanism", "AC9M5A01", "AC9M5A02"),
      lesson("Unknown Dividends and Divisors", "Interpret each division value and determine a missing dividend or divisor.", "Division chamber controls", "AC9M5A01", "AC9M5A02"),
      lesson("Large-Number Inverses", "Use multiplication as the inverse to solve division with larger multiples.", "High-altitude inverse lift", "AC9M5A01", "AC9M5A02"),
    ],
  },
  {
    topic: "Equivalent Multiplicative Equations",
    purpose: "Recognise, test and construct equivalent multiplication and division equations.",
    lessons: [
      lesson("Same Value, Different Form", "Match multiplicative expressions with equal values using relational thinking.", "Equivalent rune matcher", "AC9M5A02"),
      lesson("True or False Relationships", "Judge multiplicative equations and justify each decision with evidence.", "Multiplicative truth gates", "AC9M5A02"),
      lesson("Construct an Equivalent", "Create a different multiplicative expression that preserves a given value.", "Multiplicative equation forge", "AC9M5A02"),
    ],
  },
  {
    topic: "Properties of Multiplication",
    purpose: "Apply commutative and associative properties while recognising division behaves differently.",
    lessons: [
      lesson("Turn the Array", "Show why multiplication is commutative and why reversed division is not.", "Rotating array observatory", "AC9M5A02"),
      lesson("Regroup Three Factors", "Use associativity to regroup three factors and simplify the calculation.", "Factor grouping rig", "AC9M5A02"),
      lesson("Why Division Is Different", "Compare grouped division sequences and explain changing quotients.", "Division branch simulator", "AC9M5A02"),
    ],
  },
  {
    topic: "Distributive Reasoning",
    purpose: "Represent and apply distribution to create equivalent multiplication calculations.",
    lessons: [
      lesson("Split an Array", "Partition an array into useful parts and write the equivalent equation.", "Interactive split array", "AC9M5A02"),
      lesson("Build from Friendly Numbers", "Use a friendly factor to derive a product and record the distribution.", "Friendly-number scaffold", "AC9M5A02"),
      lesson("Find the Hidden Factor", "Use a distributed equation to find an unknown factor or partial product.", "Distributive vault", "AC9M5A02"),
    ],
  },
  {
    topic: "Factors, Multiples and Constraints",
    purpose: "Use factors and multiples as tools to find unknowns satisfying several equation conditions.",
    lessons: [
      lesson("Use Factor Clues", "Interpret factor clues in equations and identify every satisfying value.", "Factor clue wall", "AC9M5A02"),
      lesson("Use Multiple Clues", "Combine multiple and equation constraints to narrow possible unknowns.", "Multiple filter machine", "AC9M5A02"),
      lesson("Find All Solutions", "List and justify all natural-number solutions to a constrained equation.", "Solution-set expedition", "AC9M5A02"),
    ],
  },
  {
    topic: "Multiplicative Mystery",
    purpose: "Integrate inverse, property and equivalence reasoning in a connected investigation.",
    lessons: [
      lesson("Analyse the Evidence", "Use arrays and fact families to reconstruct missing values in a case file.", "Evidence board investigation", "AC9M5A01", "AC9M5A02"),
      lesson("Solve the Connected Equations", "Coordinate equations where each solved unknown informs the next one.", "Linked-equation ascent", "AC9M5A01", "AC9M5A02"),
      lesson("Expose the Flawed Argument", "Identify a misused property and justify a corrected multiplicative argument.", "Solver summit hearing", "AC9M5A01", "AC9M5A02"),
    ],
  },
];

// ACARA Mathematics Curriculum F-6 v9: AC9M6A01, AC9M6A02 and AC9M6A03.
const level6Seeds: WeekSeed[] = [
  {
    topic: "Visually Growing Patterns",
    purpose: "Recognise, represent and use rules that generate visually growing patterns.",
    lessons: [
      lesson("Build the Next Stage", "Analyse visual stages, identify the growth and construct the next stage.", "Growing-tile constructor", "AC9M6A01"),
      lesson("From Picture to Table", "Record a visual pattern in a table and explain the correspondence.", "Pattern capture table", "AC9M6A01"),
      lesson("State and Use the Rule", "Describe a general rule and predict a non-consecutive later stage.", "Rule projection telescope", "AC9M6A01"),
    ],
  },
  {
    topic: "Rational Number Patterns",
    purpose: "Generate and continue fraction and decimal patterns while explaining emerging structure.",
    lessons: [
      lesson("Fraction Sequences", "Continue fraction patterns using equivalent forms where they are needed.", "Fraction ridge trail", "AC9M6A01"),
      lesson("Decimal Sequences", "Generate extended decimal patterns and identify non-consecutive missing terms.", "Decimal crystal chain", "AC9M6A01"),
      lesson("Reverse the Pattern", "Reason backwards to recover a start, missing term or generating rule.", "Reverse-sequence winch", "AC9M6A01"),
    ],
  },
  {
    topic: "Rules Across Representations",
    purpose: "Connect materials, sequences, tables and rules describing the same growing relationship.",
    lessons: [
      lesson("Match Pattern, Table and Rule", "Match a visual pattern, value table and verbal rule representing one relationship.", "Representation alignment deck", "AC9M6A01", "AC9M6A03"),
      lesson("Compare Growth", "Generate values and explain how additive and multiplicative growth differ.", "Dual-rule mountain race", "AC9M6A01", "AC9M6A03"),
      lesson("Transfer the Rule", "Recognise the same rule in a new representation and justify the match.", "Rule transfer portals", "AC9M6A01", "AC9M6A03"),
    ],
  },
  {
    topic: "Function Machines and Algorithms",
    purpose: "Create multi-step input-output algorithms and interpret patterns generated by their rules.",
    lessons: [
      lesson("Follow a Multi-Step Machine", "Execute ordered operations for several inputs and record the output set.", "Programmable function machine", "AC9M6A03"),
      lesson("Discover the Algorithm", "Infer ordered algorithm steps from varied input-output evidence.", "Black-box algorithm lab", "AC9M6A03"),
      lesson("Create and Test a Machine", "Design an algorithm, test edge cases and explain its output pattern.", "Algorithm machine builder", "AC9M6A03"),
    ],
  },
  {
    topic: "Brackets and Operation Order",
    purpose: "Use brackets and operation order to interpret and construct unambiguous equations.",
    lessons: [
      lesson("Why Brackets Matter", "Compare expressions and explain how bracketed grouping changes the value.", "Bracket impact simulator", "AC9M6A02"),
      lesson("Place the Brackets", "Insert brackets to produce a target value and verify the result.", "Bracket placement puzzle", "AC9M6A02"),
      lesson("Construct an Equivalent Expression", "Build a bracketed expression equivalent to a multi-operation expression.", "Expression equivalence forge", "AC9M6A02"),
    ],
  },
  {
    topic: "Complex Unknowns",
    purpose: "Determine unknown values in equations involving brackets and combinations of operations.",
    lessons: [
      lesson("Unknown Inside the Brackets", "Use inverses and operation order to solve an unknown inside grouped operations.", "Nested-rune equation lock", "AC9M6A02"),
      lesson("Unknown on Either Side", "Solve multi-operation equations with an unknown on either side of equality.", "Two-sided equation chamber", "AC9M6A02"),
      lesson("Find Pairs of Unknowns", "Find and justify pairs of natural numbers that make an equation true.", "Paired-solution board", "AC9M6A02"),
    ],
  },
  {
    topic: "Algorithms with Decisions",
    purpose: "Create, follow and debug algorithms containing ordered steps and decision points.",
    lessons: [
      lesson("Follow the Decision Path", "Trace a branched algorithm and explain why different inputs diverge.", "Branching flowchart trail", "AC9M6A03"),
      lesson("Debug the Algorithm", "Locate a faulty step by comparing expected and generated number sets.", "Algorithm fault debugger", "AC9M6A03"),
      lesson("Design a Number Generator", "Create an algorithm generating a defined set and explain its pattern.", "Number-generator bench", "AC9M6A03"),
    ],
  },
  {
    topic: "Pattern Peaks Summit",
    purpose: "Integrate growing patterns, bracketed equations and algorithms in an investigation.",
    lessons: [
      lesson("Model the Growing Structure", "Represent a structure visually and numerically, then test a general rule.", "Summit structure lab", "AC9M6A01"),
      lesson("Build the Solving Algorithm", "Generate evidence with an algorithm to solve a related bracketed unknown.", "Integrated rule engine", "AC9M6A02", "AC9M6A03"),
      lesson("Defend a Generalisation", "Evaluate a claim, refine its rule and defend the conclusion with evidence.", "Codemaster summit defence", "AC9M6A01", "AC9M6A02", "AC9M6A03"),
    ],
  },
];

const SEEDS: Record<PatternPeaksYearLabel, WeekSeed[]> = {
  "Year 3": level3Seeds,
  "Year 4": level4Seeds,
  "Year 5": level5Seeds,
  "Year 6": level6Seeds,
};

function buildProgram(yearLabel: PatternPeaksYearLabel, seeds: WeekSeed[]): WeekPlan[] {
  const level = yearLabel.replace("Year ", "");
  return seeds.map((week, weekIndex) => {
    const weekNumber = weekIndex + 1;
    const lessons = week.lessons.map((item, lessonIndex): Lesson => ({
      id: `y${level}-algebra-w${weekNumber}-l${lessonIndex + 1}`,
      week: weekNumber,
      lesson: lessonIndex + 1,
      title: item.title,
      focus: item.focus,
      activityIdeas: [item.mechanic],
      curriculum: item.curriculum,
      activityType: "pattern-peaks-blueprint",
      config: { realmId: "pattern", mechanic: item.mechanic, implementationStatus: "blueprint" },
    }));
    return {
      id: `y${level}-algebra-w${weekNumber}`,
      week: weekNumber,
      topic: week.topic,
      curriculum: [...new Set(lessons.flatMap((item) => item.curriculum))],
      lessons,
    };
  });
}

export const PATTERN_PEAKS_PROGRAMS: Record<PatternPeaksYearLabel, WeekPlan[]> = {
  "Year 3": buildProgram("Year 3", level3Seeds),
  "Year 4": buildProgram("Year 4", level4Seeds),
  "Year 5": buildProgram("Year 5", level5Seeds),
  "Year 6": buildProgram("Year 6", level6Seeds),
};

export const PATTERN_PEAKS_SPINES = Object.fromEntries(
  Object.entries(SEEDS).map(([level, seeds]) => [level, seeds.map((week, index) => ({ week: index + 1, topic: week.topic, purpose: week.purpose }))]),
) as Record<PatternPeaksYearLabel, Array<{ week: number; topic: string; purpose: string }>>;

export const PATTERN_PEAKS_SPINE = PATTERN_PEAKS_SPINES["Year 3"];
export const PATTERN_PEAKS_LEVEL3_PROGRAM = PATTERN_PEAKS_PROGRAMS["Year 3"];
export const PATTERN_PEAKS_LEVEL4_PROGRAM = PATTERN_PEAKS_PROGRAMS["Year 4"];
export const PATTERN_PEAKS_LEVEL5_PROGRAM = PATTERN_PEAKS_PROGRAMS["Year 5"];
export const PATTERN_PEAKS_LEVEL6_PROGRAM = PATTERN_PEAKS_PROGRAMS["Year 6"];

export function getPatternPeaksWeekPurposes(yearLabel: PatternPeaksYearLabel): Record<number, string> {
  return Object.fromEntries(PATTERN_PEAKS_SPINES[yearLabel].map((week) => [week.week, week.purpose]));
}

export const PATTERN_PEAKS_LEVEL3_WEEK_PURPOSES = getPatternPeaksWeekPurposes("Year 3");

export function getPatternPeaksSpineForYearLabel(yearLabel: string) {
  return PATTERN_PEAKS_SPINES[yearLabel as PatternPeaksYearLabel] ?? PATTERN_PEAKS_SPINES["Year 3"];
}

export function getPatternPeaksProgramForYearLabel(yearLabel: string): WeekPlan[] | null {
  return PATTERN_PEAKS_PROGRAMS[yearLabel as PatternPeaksYearLabel] ?? null;
}
