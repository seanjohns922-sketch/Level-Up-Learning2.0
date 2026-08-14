import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

type StatisticaLevel = 1 | 2 | 3 | 4 | 5 | 6;

type StatisticaWeekSeed = {
  focus: string;
  lessons: [string, string, string];
  curriculum: CurriculumCode[];
};

const LEVEL_CURRICULUM: Record<StatisticaLevel, CurriculumCode[]> = {
  1: ["AC9M1ST01", "AC9M1ST02"],
  2: ["AC9M2ST01", "AC9M2ST02"],
  3: ["AC9M3ST01", "AC9M3ST02", "AC9M3ST03"],
  4: ["AC9M4ST01", "AC9M4ST02", "AC9M4ST03"],
  5: ["AC9M5ST01", "AC9M5ST02", "AC9M5ST03"],
  6: ["AC9M6ST01", "AC9M6ST02", "AC9M6ST03"],
};

const LEVEL_OUTCOMES: Record<StatisticaLevel, string> = {
  1: "Students understand that data is information collected to answer questions, and that it can be organised and represented visually.",
  2: "Students recognise that the same categorical data can be represented in different ways and compare display features.",
  3: "Students use a repeatable statistical investigation process: question, data, record, represent, interpret and report.",
  4: "Students move from reading the largest value to analysing distribution shape, variation and display suitability.",
  5: "Students reason with data types, validation, mode, distribution shape and line graphs showing change over time.",
  6: "Students compare distributions and critique whether statistical claims are trustworthy.",
};

const LEVEL_SEEDS: Record<StatisticaLevel, StatisticaWeekSeed[]> = {
  1: [
    { focus: "What is Data?", lessons: ["Data All Around Us", "Sort Into Categories", "What Does the Data Tell Us?"], curriculum: ["AC9M1ST01", "AC9M1ST02"] },
    { focus: "Asking Questions", lessons: ["Questions We Can Answer", "Choose the Categories", "Collect the Answers"], curriculum: ["AC9M1ST01"] },
    { focus: "Recording Data", lessons: ["Lists", "Tally Marks", "Read a Tally"], curriculum: ["AC9M1ST01"] },
    { focus: "One-to-One Displays", lessons: ["One Object = One Vote", "Stack the Objects", "Read the Object Display"], curriculum: ["AC9M1ST02"] },
    { focus: "Picture Graphs", lessons: ["Pictures Represent Data", "Build a Picture Graph on the Tablet", "Read a Picture Graph"], curriculum: ["AC9M1ST02"] },
    { focus: "Comparing Frequencies", lessons: ["Most & Least", "More, Less & Equal", "Compare Categories"], curriculum: ["AC9M1ST02"] },
    { focus: "Interpreting Data", lessons: ["Find the Frequency", "What Can We Learn?", "Answer the Question From the Data"], curriculum: ["AC9M1ST02"] },
    { focus: "Mini Investigation", lessons: ["Ask & Collect", "Represent", "Interpret & Report"], curriculum: ["AC9M1ST01", "AC9M1ST02"] },
  ],
  2: [
    { focus: "Questions & Categories", lessons: ["Ask a Statistical Question", "Choose Useful Categories", "Sort the Responses"], curriculum: ["AC9M2ST01"] },
    { focus: "Collecting Data", lessons: ["Surveys", "Observations", "Experiments"], curriculum: ["AC9M2ST01"] },
    { focus: "Recording Data", lessons: ["Lists", "Tables", "Read & Complete Tables"], curriculum: ["AC9M2ST01"] },
    { focus: "Picture Graphs", lessons: ["Build a Picture Graph", "Read a Picture Graph", "Answer Questions"], curriculum: ["AC9M2ST02"] },
    { focus: "Column Graphs", lessons: ["From Data to Columns", "Build a Column Graph", "Read a Column Graph"], curriculum: ["AC9M2ST02"] },
    { focus: "Different Displays", lessons: ["Same Data, New Display", "Picture vs Column Graph", "Which Display Works Best?"], curriculum: ["AC9M2ST02"] },
    { focus: "Interpreting Displays", lessons: ["Most & Least", "Compare Frequencies", "Make Conclusions"], curriculum: ["AC9M2ST02"] },
    { focus: "Statistical Investigation", lessons: ["Ask & Collect", "Display", "Compare & Report"], curriculum: ["AC9M2ST01", "AC9M2ST02"] },
  ],
  3: [
    { focus: "Types of Data", lessons: ["Categorical Data", "Discrete Numerical Data", "Which Type Is It?"], curriculum: ["AC9M3ST01"] },
    { focus: "Statistical Questions", lessons: ["Questions of Interest", "What Data Do We Need?", "Improve the Question"], curriculum: ["AC9M3ST03"] },
    { focus: "Acquiring Data", lessons: ["Surveys", "Observation & Experiments", "Existing Data Sets"], curriculum: ["AC9M3ST01", "AC9M3ST03"] },
    { focus: "Recording Data", lessons: ["Tallies & Lists", "Frequency Tables", "Digital Tables"], curriculum: ["AC9M3ST01"] },
    { focus: "Representing Data", lessons: ["Choose a Graph", "Create a Graph", "Label & Check"], curriculum: ["AC9M3ST02"] },
    { focus: "Comparing Displays", lessons: ["Same Data, Different Graphs", "Compare Representations", "Choose the Best Display"], curriculum: ["AC9M3ST02"] },
    { focus: "Interpreting Data", lessons: ["Read the Evidence", "Make Inferences", "Answer the Question"], curriculum: ["AC9M3ST02", "AC9M3ST03"] },
    { focus: "Guided Investigation", lessons: ["Plan & Collect", "Represent & Interpret", "Report the Findings"], curriculum: ["AC9M3ST01", "AC9M3ST02", "AC9M3ST03"] },
  ],
  4: [
    { focus: "Many-to-One Data", lessons: ["What Does the Key Mean?", "Read Many-to-One Displays", "Calculate Frequencies"], curriculum: ["AC9M4ST01"] },
    { focus: "Many-to-One Pictographs", lessons: ["Interpret the Key", "Build the Display", "Handle Partial Symbols"], curriculum: ["AC9M4ST01"] },
    { focus: "Column Graphs", lessons: ["Read Column Graphs", "Construct Column Graphs", "Interpret the Results"], curriculum: ["AC9M4ST01"] },
    { focus: "Comparing Displays", lessons: ["Same Data, Different Displays", "Which Is Easier to Read?", "Choose the Best Display"], curriculum: ["AC9M4ST02"] },
    { focus: "Distribution Shape", lessons: ["Where Is Data Concentrated?", "Describe the Shape", "Compare Distributions"], curriculum: ["AC9M4ST02"] },
    { focus: "Variation", lessons: ["What Is Variation?", "More vs Less Variation", "Compare Data Sets"], curriculum: ["AC9M4ST02"] },
    { focus: "Surveys & Data Collection", lessons: ["Design a Survey", "Collect & Record", "Display & Interpret"], curriculum: ["AC9M4ST03"] },
    { focus: "Statistical Investigation", lessons: ["Pose the Question", "Analyse the Data", "Communicate Findings"], curriculum: ["AC9M4ST01", "AC9M4ST02", "AC9M4ST03"] },
  ],
  5: [
    { focus: "Data Types", lessons: ["Nominal Data", "Ordinal Data", "Discrete Numerical Data"], curriculum: ["AC9M5ST01"] },
    { focus: "Valid Data", lessons: ["Spot Data Errors", "Check & Validate", "Clean the Data"], curriculum: ["AC9M5ST01"] },
    { focus: "Mode", lessons: ["Find the Mode", "More Than One Mode", "No Mode"], curriculum: ["AC9M5ST01"] },
    { focus: "Distribution Shape", lessons: ["Read the Distribution", "Describe the Shape", "Compare Shapes"], curriculum: ["AC9M5ST01"] },
    { focus: "Choosing Displays", lessons: ["Match Data to Display", "Compare Displays", "Justify the Choice"], curriculum: ["AC9M5ST01"] },
    { focus: "Line Graphs", lessons: ["Read a Line Graph", "Change Over Time", "Make Inferences"], curriculum: ["AC9M5ST02"] },
    { focus: "Planning Investigations", lessons: ["Pose an Unbiased Question", "Choose & Collect Data", "Choose the Display"], curriculum: ["AC9M5ST03"] },
    { focus: "Statistical Investigation", lessons: ["Collect & Validate", "Analyse & Interpret", "Communicate Findings"], curriculum: ["AC9M5ST01", "AC9M5ST02", "AC9M5ST03"] },
  ],
  6: [
    { focus: "Types of Data", lessons: ["Nominal vs Ordinal", "Discrete vs Continuous", "Classify the Data"], curriculum: ["AC9M6ST01"] },
    { focus: "Mode & Range", lessons: ["Find the Mode", "Calculate the Range", "Describe a Data Set"], curriculum: ["AC9M6ST01"] },
    { focus: "Distribution Shape", lessons: ["Read the Distribution", "Shape & Spread", "Compare Distributions"], curriculum: ["AC9M6ST01"] },
    { focus: "Comparative Displays", lessons: ["Side-by-Side Graphs", "Compare Two Groups", "Draw Conclusions"], curriculum: ["AC9M6ST01"] },
    { focus: "Digital Data", lessons: ["Read Digital Data Sets", "Sort & Analyse", "Create a Visualisation"], curriculum: ["AC9M6ST01", "AC9M6ST03"] },
    { focus: "Statistics in the Media", lessons: ["Read the Claim", "Check the Evidence", "Does the Data Support It?"], curriculum: ["AC9M6ST02"] },
    { focus: "Misleading Statistics", lessons: ["Broken Axes & Scales", "Misleading Graphics", "Critique the Representation"], curriculum: ["AC9M6ST02"] },
    { focus: "Statistical Investigation", lessons: ["Pose & Refine", "Analyse & Compare", "Communicate & Defend Findings"], curriculum: ["AC9M6ST01", "AC9M6ST02", "AC9M6ST03"] },
  ],
};

function activityIdeas(level: StatisticaLevel, focus: string, title: string): string[] {
  return [
    `Statistica Level ${level}`,
    focus,
    title,
  ];
}

function lessonFocus(level: StatisticaLevel, weekFocus: string, title: string): string {
  return `Statistics: ${title.toLowerCase()} within ${weekFocus.toLowerCase()}. ${LEVEL_OUTCOMES[level]}`;
}

function buildLevelProgram(level: StatisticaLevel): WeekPlan[] {
  const raw: WeekPlan[] = LEVEL_SEEDS[level].map((seed, weekIndex) => {
    const week = weekIndex + 1;
    return {
      id: `y${level}-statistics-w${week}`,
      week,
      topic: seed.focus,
      curriculum: seed.curriculum,
      lessons: seed.lessons.map((title, lessonIndex): Lesson => {
        const lesson = lessonIndex + 1;
        return {
          id: `y${level}-statistics-w${week}-l${lesson}`,
          week,
          lesson,
          title,
          focus: lessonFocus(level, seed.focus, title),
          activityIdeas: activityIdeas(level, seed.focus, title),
          curriculum: seed.curriculum,
          activityType: "statistica",
          config: {
            realmId: "statistics",
            blueprintOnly: true,
            previewStatus: "activity-preview-unavailable",
          },
        };
      }),
    };
  });

  return normalizeWeekPlans(level, raw);
}

export const STATISTICA_PROGRAMS: Record<StatisticaLevel, WeekPlan[]> = {
  1: buildLevelProgram(1),
  2: buildLevelProgram(2),
  3: buildLevelProgram(3),
  4: buildLevelProgram(4),
  5: buildLevelProgram(5),
  6: buildLevelProgram(6),
};

export function getStatisticaProgramForYearLabel(yearLabel: string): WeekPlan[] | null {
  const match = /^Year\s+([1-6])$/.exec(yearLabel);
  if (!match) return null;
  return STATISTICA_PROGRAMS[Number(match[1]) as StatisticaLevel] ?? null;
}

export const STATISTICA_META = {
  realm: "Statistica",
  strand: "Statistics",
  levels: [1, 2, 3, 4, 5, 6] as const,
  journey: "Collect -> Record -> Represent -> Interpret -> Compare -> Analyse -> Investigate -> Critique",
  curriculum: LEVEL_CURRICULUM,
  outcomes: LEVEL_OUTCOMES,
} as const;
