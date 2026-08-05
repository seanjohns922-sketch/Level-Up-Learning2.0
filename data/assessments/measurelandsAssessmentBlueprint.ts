export type MeasurelandsLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type MeasurelandsAssessmentKind = "pretest" | "posttest";
export type AssessmentDifficulty = "accessible" | "moderate" | "challenging";
export type CognitiveDemand = "recall" | "understanding" | "application" | "reasoning";
export type CurriculumImplementationStatus = "aligned" | "partial" | "missing" | "incorrect-metadata";

export type AssessmentMix<T extends string> = Record<T, number>;

export type MeasurelandsDescriptorBlueprint = {
  code: string;
  description: string;
  learningIntentions: readonly string[];
  successCriteria: readonly string[];
  misconceptions: readonly string[];
  allocation: {
    pretest: number;
    posttest: number;
  };
  curriculumMapping: {
    implementationStatus: CurriculumImplementationStatus;
    currentWeeks: readonly number[];
    currentLessons: readonly string[];
    note: string;
  };
  questionBlueprint: {
    pretestArchetypes: readonly string[];
    posttestArchetypes: readonly string[];
  };
};

export type MeasurelandsAssessmentFormBlueprint = {
  kind: MeasurelandsAssessmentKind;
  questionCount: 20;
  passPercent: 85;
  purpose: string;
  difficultyMix: AssessmentMix<AssessmentDifficulty>;
  cognitiveDemandMix: AssessmentMix<CognitiveDemand>;
  responseMix: {
    selectedResponseMaximum: number;
    constructedOrManipulatedMinimum: number;
  };
  orderingRules: readonly string[];
  scaffoldRules: readonly string[];
};

export type MeasurelandsLevelAssessmentBlueprint = {
  level: MeasurelandsLevel;
  yearLabel: "Ground" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";
  approvalStatus: "approved";
  curriculumSource: string;
  descriptors: readonly MeasurelandsDescriptorBlueprint[];
  crossRealmCoverage?: readonly {
    code: string;
    ownerRealm: "Number Nexus";
    implementationStatus: "planned-not-verified" | "verified";
    rationale: string;
    coverageRequirement: string;
  }[];
  forms: readonly MeasurelandsAssessmentFormBlueprint[];
};

const CURRICULUM_SOURCE =
  "Australian Curriculum v9.0 Mathematics, Measurement strand, Prep-Year 6 sequence of content descriptions";

const DEFAULT_ORDERING_RULES = [
  "Spiral descriptors through the form; never place more than 2 questions from one descriptor consecutively.",
  "Use accessible entry questions in the first 4 positions without disclosing methods used later in the form.",
  "Distribute challenging and reasoning questions across the second half rather than placing them in one block.",
  "Do not repeat the same context, values, correct-answer position or interaction structure consecutively.",
] as const;

const DEFAULT_SCAFFOLD_RULES = [
  "Show the mathematical information needed to answer, but do not label the required operation or strategy.",
  "Read-aloud text may restate the task but must not reveal a method, conversion rule or intermediate result.",
  "Do not show worked examples, partially completed calculations or correctness feedback before the response is locked.",
  "Visuals must preserve scale and measurement relationships without making the correct option visually distinctive.",
  "Distractors must represent documented misconceptions and exactly one response may be scored as correct.",
] as const;

function form(
  kind: MeasurelandsAssessmentKind,
  difficultyMix: AssessmentMix<AssessmentDifficulty>,
  cognitiveDemandMix: AssessmentMix<CognitiveDemand>,
  selectedResponseMaximum: number,
  constructedOrManipulatedMinimum: number,
): MeasurelandsAssessmentFormBlueprint {
  return {
    kind,
    questionCount: 20,
    passPercent: 85,
    purpose:
      kind === "pretest"
        ? "Diagnose independent entry knowledge and identify the earliest descriptor requiring instruction."
        : "Demonstrate independent mastery through transfer, misconception analysis and multi-step application.",
    difficultyMix,
    cognitiveDemandMix,
    responseMix: { selectedResponseMaximum, constructedOrManipulatedMinimum },
    orderingRules: DEFAULT_ORDERING_RULES,
    scaffoldRules: DEFAULT_SCAFFOLD_RULES,
  };
}

function descriptor(
  code: string,
  description: string,
  learningIntentions: readonly string[],
  successCriteria: readonly string[],
  misconceptions: readonly string[],
  pretest: number,
  posttest: number,
  implementationStatus: CurriculumImplementationStatus,
  currentWeeks: readonly number[],
  currentLessons: readonly string[],
  note: string,
  pretestArchetypes: readonly string[],
  posttestArchetypes: readonly string[],
): MeasurelandsDescriptorBlueprint {
  return {
    code,
    description,
    learningIntentions,
    successCriteria,
    misconceptions,
    allocation: { pretest, posttest },
    curriculumMapping: { implementationStatus, currentWeeks, currentLessons, note },
    questionBlueprint: { pretestArchetypes, posttestArchetypes },
  };
}

export const MEASURELANDS_ASSESSMENT_BLUEPRINTS: readonly MeasurelandsLevelAssessmentBlueprint[] = [
  {
    level: 0,
    yearLabel: "Ground",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9MFM01",
        "Identify and compare attributes of objects and events, including length, capacity, mass and duration, using direct comparisons and communicating reasoning.",
        ["Identify the attribute being compared.", "Compare 2 objects or events directly.", "Communicate why one is longer, heavier, holds more or takes longer."],
        ["I select the relevant attribute.", "I make a valid direct comparison.", "I use comparison language and point to evidence."],
        ["Size always determines mass or capacity.", "The visual position of an object determines its length.", "Familiarity rather than duration determines which event takes longer."],
        0,
        14,
        "aligned",
        [1, 2, 3, 4, 8],
        ["W1 length", "W2 mass", "W3 capacity", "W4 duration", "W8 application"],
        "Current lessons cover all 4 attributes; the approved post-test must add explicit comparison reasoning.",
        [],
        ["Direct pair comparison with a reason choice.", "Attribute selection before comparison.", "Counter-intuitive comparison that prevents size-only guessing."],
      ),
      descriptor(
        "AC9MFM02",
        "Sequence days of the week and times of day, including morning, lunchtime, afternoon and night time, and connect them to familiar events and actions.",
        ["Sequence familiar days and parts of a day.", "Connect routine events to an appropriate day or time of day."],
        ["I place days or day parts in order.", "I match an event to a sensible time and explain the sequence."],
        ["The week begins again after Friday.", "Lunch and afternoon are interchangeable.", "Yesterday, today and tomorrow are fixed weekday names."],
        0,
        6,
        "aligned",
        [5, 6, 7, 8],
        ["W5 days", "W6 times of day", "W7 calendar language", "W8 sequencing"],
        "Current coverage is suitable, but the assessment must avoid repeated label-recognition items.",
        [],
        ["Complete a day/week sequence.", "Place a familiar event in a routine and justify its position."],
      ),
    ],
    forms: [form("posttest", { accessible: 8, moderate: 8, challenging: 4 }, { recall: 2, understanding: 7, application: 7, reasoning: 4 }, 10, 10)],
  },
  {
    level: 1,
    yearLabel: "Year 1",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9M1M01",
        "Compare directly and indirectly and order objects and events using attributes of length, mass, capacity and duration, communicating reasoning.",
        ["Choose a direct or indirect comparison strategy.", "Order objects and events by a stated attribute.", "Explain comparisons using consistent evidence."],
        ["I compare or order at least 3 items accurately.", "I use the same attribute throughout.", "I explain how the evidence supports my order."],
        ["A taller container always holds more.", "A larger-looking object is always heavier.", "Changing comparison units does not affect fairness."],
        8,
        8,
        "aligned",
        [1, 2, 3, 4],
        ["W1 length", "W2 mass", "W3 capacity", "W4 duration"],
        "Current lesson scope is aligned; assessment reasoning evidence needs strengthening.",
        ["Order measured objects with one direct comparison.", "Choose which event takes longer from familiar evidence."],
        ["Resolve an indirect comparison where pictures are not to scale.", "Identify and explain an unfair comparison."],
      ),
      descriptor(
        "AC9M1M02",
        "Measure the length of shapes and objects using informal units, recognising that units need to be uniform and used end-to-end.",
        ["Measure length with equal informal units.", "Place units end-to-end without gaps or overlaps.", "Diagnose an invalid informal measurement."],
        ["I align equal units from the start point.", "I count each unit once.", "I explain why a measurement is fair or unfair."],
        ["Units may have different sizes.", "Gaps and overlaps do not change the result.", "Counting marks is the same as counting spaces."],
        5,
        5,
        "aligned",
        [1],
        ["W1L1", "W1L2", "W1L3"],
        "Current lesson and assessment mechanics align closely.",
        ["Measure an object with uniform blocks.", "Select the valid end-to-end arrangement."],
        ["Correct a measurement with a shifted start, gap or overlap.", "Construct a valid informal measurement independently."],
      ),
      descriptor(
        "AC9M1M03",
        "Describe the duration and sequence of events using years, months, weeks, days and hours.",
        ["Select a sensible formal duration unit.", "Sequence events and cycles using time language.", "Compare familiar durations."],
        ["I choose years, months, weeks, days or hours appropriately.", "I order events consistently.", "I distinguish duration from a calendar date."],
        ["A date describes duration.", "Months and weeks contain fixed interchangeable counts.", "The event with more steps always lasts longer."],
        7,
        7,
        "partial",
        [4, 5, 6, 7, 8],
        ["W4 duration", "W5 cycles", "W6 calendar", "W7 relative days", "W8 sequencing"],
        "Duration and sequence are taught, but formal date navigation extends into Year 2 and must not dominate Year 1 scoring.",
        ["Choose the sensible duration unit.", "Complete a familiar cycle or event sequence."],
        ["Build and explain a sequence across days or months.", "Reject a plausible but dimensionally wrong duration."],
      ),
    ],
    forms: [
      form("pretest", { accessible: 10, moderate: 8, challenging: 2 }, { recall: 3, understanding: 7, application: 8, reasoning: 2 }, 8, 12),
      form("posttest", { accessible: 6, moderate: 9, challenging: 5 }, { recall: 1, understanding: 5, application: 9, reasoning: 5 }, 8, 12),
    ],
  },
  {
    level: 2,
    yearLabel: "Year 2",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9M2M01",
        "Measure and compare objects based on length, capacity and mass using appropriate uniform informal units and smaller units for accuracy when necessary.",
        ["Select uniform informal units for an attribute.", "Measure and compare using the same unit.", "Explain when a smaller unit improves accuracy."],
        ["I use units without gaps or overlaps.", "I compare like units.", "I justify a unit by its fit and accuracy."],
        ["A smaller unit produces a smaller count.", "Different units can be compared by count alone.", "Any object can serve as an accurate unit."],
        6,
        6,
        "aligned",
        [1, 2, 3, 4],
        ["W1 length", "W2 mass", "W3 capacity", "W4 accuracy"],
        "Current content is aligned and should retain misconception-based unit choices.",
        ["Measure and compare with one stated informal unit.", "Choose a suitable unit for one attribute."],
        ["Compare measurements made with different-sized units.", "Diagnose and correct an inaccurate measurement plan."],
      ),
      descriptor(
        "AC9M2M02",
        "Identify common uses and represent halves, quarters and eighths in relation to shapes, objects and events.",
        ["Recognise equal halves, quarters and eighths in measurement contexts.", "Represent fractional parts of shapes, objects and events."],
        ["I verify that parts are equal.", "I connect fractional language to a measured whole or event."],
        ["Any 2 pieces are halves.", "More pieces means each piece is larger.", "Quarter-hour language is unrelated to quarters of a whole."],
        3,
        3,
        "aligned",
        [5],
        ["W5L3"],
        "Equal halves, quarters and eighths are taught and assessed through the fractional-parts interaction.",
        ["Identify an equal fractional partition in a measurement context."],
        ["Choose or construct the representation that preserves equal parts and explain why a distractor does not."],
      ),
      descriptor(
        "AC9M2M03",
        "Identify the date and determine the number of days between events using calendars.",
        ["Locate dates on a calendar.", "Count elapsed days between 2 events without counting the start date twice."],
        ["I identify both event dates.", "I count day-to-day jumps accurately.", "I interpret the result in context."],
        ["Include both endpoints automatically.", "Count calendar squares instead of elapsed days.", "Assume every month has the same length."],
        4,
        4,
        "aligned",
        [7],
        ["W7L1", "W7L2", "W7L3"],
        "Current calendar content is aligned.",
        ["Locate a date and count days within one calendar view."],
        ["Solve a calendar interval crossing a week boundary and explain the counting convention."],
      ),
      descriptor(
        "AC9M2M04",
        "Recognise and read the time represented on an analog clock to the hour, half-hour and quarter-hour.",
        ["Read hour, half-hour and quarter-hour analog times.", "Connect hand positions to past and to language."],
        ["I identify the minute-hand benchmark.", "I name the correct hour, including quarter to the next hour."],
        ["At half past, the hour hand remains on the hour.", "Quarter to names the hour just passed.", "The longer hand always tells the hour."],
        4,
        4,
        "aligned",
        [5, 6],
        ["W5 clock", "W6 clock"],
        "Clock lessons and assessments are mapped to AC9M2M04.",
        ["Read one analog clock at each benchmark."],
        ["Construct or match a clock where the hour hand position tests half-past or quarter-to misconceptions."],
      ),
      descriptor(
        "AC9M2M05",
        "Identify, describe and demonstrate quarter, half, three-quarter and full measures of turn in everyday situations.",
        ["Recognise standard fractional turns.", "Describe and demonstrate a turn from a starting orientation."],
        ["I preserve the starting direction.", "I distinguish turn size from clockwise or anticlockwise direction."],
        ["A quarter turn always points right.", "Clockwise changes the size of a turn.", "A full turn changes the final orientation."],
        3,
        3,
        "aligned",
        [6],
        ["W6L3"],
        "Quarter, half, three-quarter and full turns are taught and assessed from varied starting directions.",
        ["Identify the demonstrated fractional turn."],
        ["Apply a stated turn to an orientation and reject direction-based distractors."],
      ),
    ],
    forms: [
      form("pretest", { accessible: 8, moderate: 9, challenging: 3 }, { recall: 2, understanding: 6, application: 9, reasoning: 3 }, 6, 14),
      form("posttest", { accessible: 5, moderate: 10, challenging: 5 }, { recall: 1, understanding: 4, application: 10, reasoning: 5 }, 6, 14),
    ],
  },
  {
    level: 3,
    yearLabel: "Year 3",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9M3M01",
        "Identify which metric units are used to measure everyday items; use measurements of familiar items and known units to make estimates.",
        ["Choose a suitable metric unit.", "Use benchmarks to estimate length, mass and capacity.", "Check whether an estimate is reasonable."],
        ["I match the unit to the attribute and scale.", "I justify estimates with a known benchmark."],
        ["Choose the smallest available unit regardless of context.", "Confuse the attribute with the unit.", "Treat an estimate as an exact reading."],
        4,
        4,
        "aligned",
        [1, 2, 3, 4],
        ["W1-W2 length", "W3 mass", "W4 capacity"],
        "Current unit and benchmark content is aligned.",
        ["Choose the unit or benchmark for a familiar object."],
        ["Select and justify a reasonable estimate among dimensionally plausible alternatives."],
      ),
      descriptor(
        "AC9M3M02",
        "Measure and compare objects using familiar metric units of length, mass and capacity, and instruments with labelled markings.",
        ["Read labelled rulers, scales and jugs.", "Measure and compare in familiar metric units.", "Calculate a difference between compatible measurements."],
        ["I start and read an instrument correctly.", "I include the correct unit.", "I compare measurements expressed in compatible units."],
        ["Start a ruler at its physical edge rather than zero.", "Read the nearest label without counting intervals.", "Compare numerical values while ignoring units."],
        6,
        6,
        "aligned",
        [1, 2, 3, 4],
        ["W1-W2 rulers", "W3 scales", "W4 jugs"],
        "Current instrument content is aligned; off-level perimeter and area must not be mapped here.",
        ["Read one labelled instrument and compare 2 measurements."],
        ["Diagnose an instrument-reading error and solve a measurement difference problem."],
      ),
      descriptor(
        "AC9M3M03",
        "Recognise and use relationships between formal units of time, including days, hours, minutes and seconds, to estimate and compare event duration.",
        ["Relate days, hours, minutes and seconds.", "Estimate and compare durations using appropriate units."],
        ["I choose a sensible time unit.", "I use unit relationships when comparing different durations."],
        ["Compare only the numeral and ignore the unit.", "Use clock time as elapsed duration.", "Assume every familiar activity takes one standard duration."],
        3,
        3,
        "aligned",
        [5],
        ["W5L1", "W5L2", "W5L3"],
        "Current duration content is aligned.",
        ["Estimate a familiar duration and compare durations in the same unit."],
        ["Convert one relationship implicitly to compare unlike time units in context."],
      ),
      descriptor(
        "AC9M3M04",
        "Describe the relationship between hours and minutes on analog and digital clocks, and read time to the nearest minute.",
        ["Connect analog hand positions to digital time.", "Read time to the nearest minute.", "Explain the hour-minute relationship."],
        ["I identify the hour hand position correctly.", "I count minute intervals from a known benchmark.", "I represent the same time digitally."],
        ["Read the hour hand as the nearest numeral.", "Count minute marks from 1 rather than 0.", "Treat the 2 clock hands as interchangeable."],
        4,
        4,
        "aligned",
        [6],
        ["W6L1", "W6L2", "W6L3"],
        "Current nearest-minute content is aligned.",
        ["Read or match an analog and digital time."],
        ["Correct an incorrect clock reading and construct a nearest-minute representation."],
      ),
      descriptor(
        "AC9M3M05",
        "Identify angles as measures of turn and compare angles with right angles in everyday situations.",
        ["Identify an angle as a measure of turn.", "Compare an angle with a right angle in context."],
        ["I identify the turn being measured.", "I classify it as less than, equal to or greater than a right angle."],
        ["Longer arms make a larger angle.", "Orientation changes angle size.", "Every corner is a right angle."],
        3,
        3,
        "aligned",
        [7, 8],
        ["W7L1", "W7L2", "W7L3", "W8L3"],
        "Angle-turn and right-angle benchmark work replaces the former off-level perimeter and area previews.",
        ["Identify and compare turns with a right-angle benchmark."],
        ["Interpret an angle in an everyday object where arm length and orientation are distractors."],
      ),
    ],
    crossRealmCoverage: [
      {
        code: "AC9M3M06",
        ownerRealm: "Number Nexus",
        implementationStatus: "planned-not-verified",
        rationale:
          "Money descriptors are intentionally excluded from Measurelands. These outcomes are assessed within Number Nexus to preserve thematic consistency. Measurelands assesses only physical measurement concepts.",
        coverageRequirement:
          "Number Nexus must teach and assess dollar-cent relationships and equivalent money representations before Year 3 curriculum coverage can be marked complete.",
      },
    ],
    forms: [
      form("pretest", { accessible: 7, moderate: 9, challenging: 4 }, { recall: 1, understanding: 5, application: 10, reasoning: 4 }, 4, 16),
      form("posttest", { accessible: 4, moderate: 10, challenging: 6 }, { recall: 0, understanding: 4, application: 10, reasoning: 6 }, 4, 16),
    ],
  },
  {
    level: 4,
    yearLabel: "Year 4",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9M4M01",
        "Interpret unmarked and partial units when measuring and comparing length, mass, capacity, duration and temperature using scaled and digital instruments and appropriate units.",
        ["Interpret intervals and partial units on scaled instruments.", "Select and compare readings with appropriate units.", "Explain an instrument-reading error."],
        ["I determine the value of each interval.", "I read between labelled marks.", "I record the value with an appropriate unit."],
        ["Every mark equals one unit.", "Digital displays do not need units.", "The nearest labelled mark is the reading."],
        6,
        6,
        "aligned",
        [1, 2, 3],
        ["W1 length", "W2 mass/capacity", "W3 temperature"],
        "Current content is aligned and visually strong.",
        ["Read partial units on 2 instrument types.", "Compare 2 compatible readings."],
        ["Infer an unlabelled interval and diagnose a plausible scale-reading error across multiple instruments."],
      ),
      descriptor(
        "AC9M4M02",
        "Recognise ways of measuring and approximating perimeter and area of shapes and enclosed spaces using appropriate formal and informal units.",
        ["Distinguish perimeter from area.", "Measure or approximate boundaries and covered spaces.", "Select appropriate units for each attribute."],
        ["I identify whether the boundary or surface is required.", "I count each boundary segment or area unit once.", "I use linear or square units correctly."],
        ["Use length times width for every perimeter.", "Count internal grid lines as perimeter.", "Use linear units for area."],
        5,
        5,
        "aligned",
        [4, 5],
        ["W4 perimeter", "W5 area"],
        "Current content aligns, though assessment items should include approximation and unit choice rather than only exact counts.",
        ["Identify and measure a perimeter or area with units shown."],
        ["Choose an approximation strategy and resolve an area-versus-perimeter misconception in context."],
      ),
      descriptor(
        "AC9M4M03",
        "Solve problems involving duration, including am and pm situations and conversions between units of time.",
        ["Convert between common time units.", "Calculate elapsed, start or finish time.", "Interpret am and pm across a practical schedule."],
        ["I preserve the time unit and am/pm period.", "I use a valid count-on or conversion strategy.", "I check that the result is chronologically possible."],
        ["Subtract clock numerals as base 10.", "Ignore crossing noon.", "Treat 60 minutes as 100 minutes."],
        5,
        5,
        "aligned",
        [6],
        ["W6L1", "W6L2", "W6L3"],
        "Week 6 lessons and assessments are mapped to AC9M4M03.",
        ["Convert one duration and calculate a one-step elapsed time."],
        ["Solve for a missing start or finish time across am/pm and explain why a base-10 distractor fails."],
      ),
      descriptor(
        "AC9M4M04",
        "Estimate and compare angles using angle names, including acute, obtuse, straight, reflex and revolution, and recognise their relationship to a right angle.",
        ["Estimate and compare angles against a right angle.", "Use conventional angle names, including reflex and revolution."],
        ["I classify by turn size rather than arm length or orientation.", "I order angles and justify the comparison to 90 degrees."],
        ["Longer rays create larger angles.", "A rotated right angle changes classification.", "All angles above 180 degrees are full revolutions."],
        4,
        4,
        "aligned",
        [7],
        ["W7L1", "W7L2", "W7L3"],
        "Current scope aligns but the assessment must include the full named-angle range.",
        ["Classify and compare angles against a right angle."],
        ["Estimate and order differently oriented acute, obtuse, straight, reflex and revolution angles."],
      ),
    ],
    forms: [
      form("pretest", { accessible: 6, moderate: 10, challenging: 4 }, { recall: 1, understanding: 4, application: 10, reasoning: 5 }, 3, 17),
      form("posttest", { accessible: 3, moderate: 10, challenging: 7 }, { recall: 0, understanding: 3, application: 9, reasoning: 8 }, 3, 17),
    ],
  },
  {
    level: 5,
    yearLabel: "Year 5",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9M5M01",
        "Choose appropriate metric units when measuring length, mass and capacity; use smaller units or a combination of units to obtain a more accurate measure.",
        ["Choose units based on attribute, scale and required precision.", "Use mixed units to communicate accurate measurements.", "Justify precision decisions."],
        ["I select a realistic unit.", "I read and compare mixed-unit measurements accurately.", "I explain why the precision is fit for purpose."],
        ["Always choose the smallest unit.", "Mixed units can be compared digit by digit.", "Extra precision is always useful."],
        4,
        4,
        "aligned",
        [1, 2],
        ["W1 units", "W2 precision"],
        "Current content is aligned; assessment metadata must match the attribute actually generated.",
        ["Choose a unit and read one mixed-unit instrument."],
        ["Choose fit-for-purpose precision and justify a mixed-unit measurement decision."],
      ),
      descriptor(
        "AC9M5M02",
        "Solve practical problems involving the perimeter and area of regular and irregular shapes using appropriate metric units.",
        ["Model practical perimeter and area problems.", "Calculate regular and irregular measurements.", "Choose and justify metric units and strategies."],
        ["I identify the required attribute.", "I include every relevant section exactly once.", "I communicate a solution with correct units and context."],
        ["Area and perimeter are interchangeable.", "Bounding rectangle area always equals irregular area.", "Internal edges belong in perimeter."],
        6,
        6,
        "aligned",
        [3, 4, 5],
        ["W3 perimeter", "W4 area", "W5 integrated problems"],
        "Current content aligns, but the live forms over-allocate 9 questions to this descriptor.",
        ["Solve one regular and one irregular perimeter/area problem.", "Choose area or perimeter in context."],
        ["Formulate a multi-step practical problem, compare strategies and resolve an irregular-shape misconception."],
      ),
      descriptor(
        "AC9M5M03",
        "Compare 12-hour and 24-hour time systems and solve practical problems involving conversion between them.",
        ["Convert between 12-hour and 24-hour notation.", "Compare times across both systems.", "Solve practical conversion problems."],
        ["I handle midnight and midday correctly.", "I preserve minutes and use leading zeroes appropriately.", "I interpret the converted time in context."],
        ["Add 12 to every 12-hour time.", "00:00 means midday.", "Minutes change during hour-system conversion."],
        4,
        4,
        "aligned",
        [6],
        ["W6L1", "W6L2", "W6L3"],
        "Week 6 now remains within 12-hour and 24-hour comparison and practical conversion problems.",
        ["Convert and compare 12-hour and 24-hour times."],
        ["Solve a practical conversion problem involving midnight, midday or an ambiguous am/pm distractor."],
      ),
      descriptor(
        "AC9M5M04",
        "Estimate, construct and measure angles in degrees using appropriate tools, including a protractor, and relate measures to angle names.",
        ["Estimate an angle before measuring.", "Measure and construct angles with a protractor.", "Relate degree measures to angle names."],
        ["I align the baseline and centre correctly.", "I select the scale beginning at zero.", "I check the result against an estimate and angle name."],
        ["Read the opposite protractor scale.", "Arm length changes angle measure.", "An obtuse angle must be close to 180 degrees."],
        6,
        6,
        "aligned",
        [7],
        ["W7L1", "W7L2", "W7L3"],
        "Current content aligns; mastery evidence should include independent construction and scale-choice misconceptions.",
        ["Estimate, read and construct angles using an indicated baseline."],
        ["Select the correct protractor scale, construct an unfamiliar angle and justify agreement with its angle name."],
      ),
    ],
    forms: [
      form("pretest", { accessible: 5, moderate: 10, challenging: 5 }, { recall: 0, understanding: 4, application: 10, reasoning: 6 }, 2, 18),
      form("posttest", { accessible: 2, moderate: 10, challenging: 8 }, { recall: 0, understanding: 2, application: 9, reasoning: 9 }, 2, 18),
    ],
  },
  {
    level: 6,
    yearLabel: "Year 6",
    approvalStatus: "approved",
    curriculumSource: CURRICULUM_SOURCE,
    descriptors: [
      descriptor(
        "AC9M6M01",
        "Convert between common metric units of length, mass and capacity; choose and use decimal representations relevant to a problem context.",
        ["Select and convert common metric units.", "Use decimal representations in practical contexts.", "Evaluate whether a converted result is reasonable."],
        ["I identify the conversion relationship.", "I preserve magnitude and attribute.", "I choose a representation suited to the context and justify it."],
        ["Always multiply when converting.", "Move a decimal point without considering unit size.", "Compare measurements before expressing them in compatible units."],
        5,
        5,
        "aligned",
        [4],
        ["W4L1", "W4L2", "W4L3"],
        "Week 4 is explicitly mapped to AC9M6M01 and the form allocates 5 conversion questions.",
        ["Convert one familiar unit pair and compare compatible decimal measurements."],
        ["Choose units and decimal representations for a multi-step practical constraint, then justify reasonableness."],
      ),
      descriptor(
        "AC9M6M02",
        "Establish the formula for the area of a rectangle and use it to solve practical problems.",
        ["Explain why rectangle area is length multiplied by width.", "Apply the formula to practical problems.", "Reason about dimensions, area and constraints."],
        ["I connect rows and columns to the formula.", "I use compatible dimensions and square units.", "I solve or compare possible designs and justify the result."],
        ["Use perimeter instead of area.", "Apply the formula without compatible units.", "Assume one set of dimensions is the only possible rectangle for an area."],
        5,
        5,
        "aligned",
        [1, 2, 3],
        ["W1 rectangle area", "W2-W3 applied area"],
        "The former volume week is replaced by practical rectangle-area design and constraint work.",
        ["Explain the formula from an array and solve one practical rectangle problem."],
        ["Formulate and compare rectangle designs under an area or perimeter constraint, communicating reasoning."],
      ),
      descriptor(
        "AC9M6M03",
        "Interpret and use timetables and itineraries to plan activities and determine the duration of events and journeys.",
        ["Interpret timetable and itinerary information.", "Plan an activity or journey under multiple constraints.", "Determine and compare event or journey durations."],
        ["I select all relevant services or events.", "I account for transfers, waiting and deadlines.", "I justify the plan using timetable evidence."],
        ["Earliest departure gives earliest arrival.", "Journey duration excludes transfers or waiting automatically.", "A service arriving at the deadline is too late."],
        5,
        5,
        "aligned",
        [5],
        ["W5L1", "W5L2", "W5L3"],
        "Week 5 is explicitly mapped to AC9M6M03 and includes itinerary planning and journey duration.",
        ["Interpret a timetable and determine one elapsed journey duration."],
        ["Plan a multi-leg itinerary with a deadline or transfer constraint and justify the optimal valid choice."],
      ),
      descriptor(
        "AC9M6M04",
        "Identify relationships between angles on a straight line, at a point and vertically opposite; use them to determine unknown angles and communicate reasoning.",
        ["Identify the relevant angle relationship.", "Determine unknown angles using 180 degrees, 360 degrees and vertically opposite relationships.", "Communicate a chain of angle reasoning."],
        ["I name the relationship before calculating.", "I show a valid sequence when more than one unknown is involved.", "I check the angles satisfy the complete diagram."],
        ["All adjacent angles sum to 180 degrees.", "Vertically opposite angles sum to 180 degrees.", "Use 360 degrees for every diagram around a visible point."],
        5,
        5,
        "aligned",
        [6],
        ["W6L1", "W6L2", "W6L3"],
        "Week 6 is explicitly mapped to AC9M6M04 and the form includes vertically opposite and chained angle reasoning.",
        ["Identify a relationship and calculate one unknown angle without answer options."],
        ["Solve a multi-relationship diagram, including vertically opposite angles, and select or construct the reasoning chain."],
      ),
    ],
    forms: [
      form("pretest", { accessible: 4, moderate: 10, challenging: 6 }, { recall: 0, understanding: 3, application: 9, reasoning: 8 }, 1, 19),
      form("posttest", { accessible: 1, moderate: 9, challenging: 10 }, { recall: 0, understanding: 1, application: 8, reasoning: 11 }, 1, 19),
    ],
  },
] as const;

function mixTotal<T extends string>(mix: AssessmentMix<T>): number {
  return Object.values<number>(mix).reduce((sum, count) => sum + count, 0);
}

export function validateMeasurelandsAssessmentBlueprints(): string[] {
  const issues: string[] = [];
  const levels = new Set<MeasurelandsLevel>();

  for (const blueprint of MEASURELANDS_ASSESSMENT_BLUEPRINTS) {
    const scope = `${blueprint.yearLabel} blueprint`;
    if (levels.has(blueprint.level)) issues.push(`${scope} duplicates Level ${blueprint.level}.`);
    levels.add(blueprint.level);
    if (blueprint.approvalStatus !== "approved") {
      issues.push(`${scope} must be explicitly approved before regeneration.`);
    }

    const codes = blueprint.descriptors.map((item) => item.code);
    if (new Set(codes).size !== codes.length) issues.push(`${scope} has duplicate descriptor codes.`);
    if (codes.some((code) => code === "ALL")) issues.push(`${scope} uses the non-specific ALL curriculum code.`);
    const crossRealmCodes = blueprint.crossRealmCoverage?.map((item) => item.code) ?? [];
    if (new Set([...codes, ...crossRealmCodes]).size !== codes.length + crossRealmCodes.length) {
      issues.push(`${scope} assigns a descriptor to both Measurelands and another realm.`);
    }
    for (const coverage of blueprint.crossRealmCoverage ?? []) {
      if (!coverage.rationale.trim() || !coverage.coverageRequirement.trim()) {
        issues.push(`${scope} has incomplete cross-realm coverage metadata for ${coverage.code}.`);
      }
    }

    const expectedKinds: MeasurelandsAssessmentKind[] = blueprint.level === 0 ? ["posttest"] : ["pretest", "posttest"];
    const actualKinds = blueprint.forms.map((assessment) => assessment.kind);
    for (const kind of expectedKinds) {
      if (!actualKinds.includes(kind)) issues.push(`${scope} is missing its ${kind}.`);
    }
    if (actualKinds.some((kind) => !expectedKinds.includes(kind))) issues.push(`${scope} has an unsupported assessment form.`);

    for (const assessment of blueprint.forms) {
      const formScope = `${scope} ${assessment.kind}`;
      const allocated = blueprint.descriptors.reduce(
        (sum, item) => sum + item.allocation[assessment.kind],
        0,
      );
      if (allocated !== assessment.questionCount) {
        issues.push(`${formScope} allocates ${allocated} questions, expected ${assessment.questionCount}.`);
      }
      if (mixTotal(assessment.difficultyMix) !== assessment.questionCount) {
        issues.push(`${formScope} difficulty mix does not total ${assessment.questionCount}.`);
      }
      if (mixTotal(assessment.cognitiveDemandMix) !== assessment.questionCount) {
        issues.push(`${formScope} cognitive-demand mix does not total ${assessment.questionCount}.`);
      }
      if (
        assessment.responseMix.selectedResponseMaximum
          + assessment.responseMix.constructedOrManipulatedMinimum
        !== assessment.questionCount
      ) {
        issues.push(`${formScope} response mix does not total ${assessment.questionCount}.`);
      }
      if (assessment.passPercent !== 85) issues.push(`${formScope} pass threshold must be 85%.`);

      for (const item of blueprint.descriptors) {
        if (item.allocation[assessment.kind] <= 0) {
          issues.push(`${formScope} does not allocate a question to ${item.code}.`);
        }
        const archetypes =
          assessment.kind === "pretest"
            ? item.questionBlueprint.pretestArchetypes
            : item.questionBlueprint.posttestArchetypes;
        if (archetypes.length === 0) issues.push(`${formScope} has no question archetype for ${item.code}.`);
      }
    }

    if (blueprint.level > 0) {
      const pretest = blueprint.forms.find((assessment) => assessment.kind === "pretest");
      const posttest = blueprint.forms.find((assessment) => assessment.kind === "posttest");
      if (pretest && posttest) {
        if (posttest.cognitiveDemandMix.reasoning <= pretest.cognitiveDemandMix.reasoning) {
          issues.push(`${scope} post-test must contain more reasoning than its pre-test.`);
        }
        if (posttest.difficultyMix.challenging <= pretest.difficultyMix.challenging) {
          issues.push(`${scope} post-test must contain more challenging questions than its pre-test.`);
        }
      }
    }
  }

  for (let level = 0; level <= 6; level += 1) {
    if (!levels.has(level as MeasurelandsLevel)) issues.push(`Missing Measurelands Level ${level} blueprint.`);
  }

  return issues;
}

export function assertMeasurelandsAssessmentBlueprintsApproved(): void {
  const issues = validateMeasurelandsAssessmentBlueprints();
  if (issues.length > 0) {
    throw new Error(`Measurelands assessment blueprint validation failed:\n${issues.join("\n")}`);
  }
}
