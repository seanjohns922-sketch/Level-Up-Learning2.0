import assert from "node:assert/strict";
import { getCurriculumPlan, getAllRealms, getGenresForYear } from "../data/programs/genres";
import { STATISTICA_META } from "../data/programs/statistica";

const expected: Record<string, Array<{ focus: string; lessons: [string, string, string]; curriculum: string[] }>> = {
  "Year 1": [
    { focus: "What is Data?", lessons: ["Data All Around Us", "Sort Into Categories", "What Does the Data Tell Us?"], curriculum: ["AC9M1ST01", "AC9M1ST02"] },
    { focus: "Asking Questions", lessons: ["Questions We Can Answer", "Choose the Categories", "Collect the Answers"], curriculum: ["AC9M1ST01"] },
    { focus: "Recording Data", lessons: ["Lists", "Tally Marks", "Read a Tally"], curriculum: ["AC9M1ST01"] },
    { focus: "One-to-One Displays", lessons: ["One Object = One Vote", "Build a Display", "Read the Display"], curriculum: ["AC9M1ST02"] },
    { focus: "Picture Graphs", lessons: ["Pictures Represent Data", "Build a Picture Graph", "Read a Picture Graph"], curriculum: ["AC9M1ST02"] },
    { focus: "Comparing Frequencies", lessons: ["Most & Least", "More, Less & Equal", "Compare Categories"], curriculum: ["AC9M1ST02"] },
    { focus: "Interpreting Data", lessons: ["Find the Frequency", "What Can We Learn?", "Answer From the Data"], curriculum: ["AC9M1ST02"] },
    { focus: "Mini Investigation", lessons: ["Ask & Collect", "Represent", "Interpret & Report"], curriculum: ["AC9M1ST01", "AC9M1ST02"] },
  ],
  "Year 2": [
    { focus: "Questions & Categories", lessons: ["Ask a Statistical Question", "Choose Useful Categories", "Sort the Responses"], curriculum: ["AC9M2ST01"] },
    { focus: "Collecting Data", lessons: ["Surveys", "Observations", "Experiments"], curriculum: ["AC9M2ST01"] },
    { focus: "Recording Data", lessons: ["Lists", "Tables", "Read & Complete Tables"], curriculum: ["AC9M2ST01"] },
    { focus: "Picture Graphs", lessons: ["Build a Picture Graph", "Read a Picture Graph", "Answer Questions"], curriculum: ["AC9M2ST02"] },
    { focus: "Column Graphs", lessons: ["From Data to Columns", "Build a Column Graph", "Read a Column Graph"], curriculum: ["AC9M2ST02"] },
    { focus: "Different Displays", lessons: ["Same Data, New Display", "Picture vs Column Graph", "Which Display Works Best?"], curriculum: ["AC9M2ST02"] },
    { focus: "Interpreting Displays", lessons: ["Most & Least", "Compare Frequencies", "Make Conclusions"], curriculum: ["AC9M2ST02"] },
    { focus: "Statistical Investigation", lessons: ["Ask & Collect", "Display", "Compare & Report"], curriculum: ["AC9M2ST01", "AC9M2ST02"] },
  ],
  "Year 3": [
    { focus: "Types of Data", lessons: ["Categorical Data", "Discrete Numerical Data", "Which Type Is It?"], curriculum: ["AC9M3ST01"] },
    { focus: "Statistical Questions", lessons: ["Questions of Interest", "What Data Do We Need?", "Improve the Question"], curriculum: ["AC9M3ST03"] },
    { focus: "Acquiring Data", lessons: ["Surveys", "Observation & Experiments", "Existing Data Sets"], curriculum: ["AC9M3ST01", "AC9M3ST03"] },
    { focus: "Recording Data", lessons: ["Tallies & Lists", "Frequency Tables", "Digital Tables"], curriculum: ["AC9M3ST01"] },
    { focus: "Representing Data", lessons: ["Choose a Graph", "Create a Graph", "Label & Check"], curriculum: ["AC9M3ST02"] },
    { focus: "Comparing Displays", lessons: ["Same Data, Different Graphs", "Compare Representations", "Choose the Best Display"], curriculum: ["AC9M3ST02"] },
    { focus: "Interpreting Data", lessons: ["Read the Evidence", "Make Inferences", "Answer the Question"], curriculum: ["AC9M3ST02", "AC9M3ST03"] },
    { focus: "Guided Investigation", lessons: ["Plan & Collect", "Represent & Interpret", "Report the Findings"], curriculum: ["AC9M3ST01", "AC9M3ST02", "AC9M3ST03"] },
  ],
  "Year 4": [
    { focus: "Many-to-One Data", lessons: ["What Does the Key Mean?", "Read Many-to-One Displays", "Calculate Frequencies"], curriculum: ["AC9M4ST01"] },
    { focus: "Many-to-One Pictographs", lessons: ["Interpret the Key", "Build the Display", "Handle Partial Symbols"], curriculum: ["AC9M4ST01"] },
    { focus: "Column Graphs", lessons: ["Read Column Graphs", "Construct Column Graphs", "Interpret the Results"], curriculum: ["AC9M4ST01"] },
    { focus: "Comparing Displays", lessons: ["Same Data, Different Displays", "Which Is Easier to Read?", "Choose the Best Display"], curriculum: ["AC9M4ST02"] },
    { focus: "Distribution Shape", lessons: ["Where Is Data Concentrated?", "Describe the Shape", "Compare Distributions"], curriculum: ["AC9M4ST02"] },
    { focus: "Variation", lessons: ["What Is Variation?", "More vs Less Variation", "Compare Data Sets"], curriculum: ["AC9M4ST02"] },
    { focus: "Surveys & Data Collection", lessons: ["Design a Survey", "Collect & Record", "Display & Interpret"], curriculum: ["AC9M4ST03"] },
    { focus: "Statistical Investigation", lessons: ["Pose the Question", "Analyse the Data", "Communicate Findings"], curriculum: ["AC9M4ST01", "AC9M4ST02", "AC9M4ST03"] },
  ],
  "Year 5": [
    { focus: "Data Types", lessons: ["Nominal Data", "Ordinal Data", "Discrete Numerical Data"], curriculum: ["AC9M5ST01"] },
    { focus: "Valid Data", lessons: ["Spot Data Errors", "Check & Validate", "Clean the Data"], curriculum: ["AC9M5ST01"] },
    { focus: "Mode", lessons: ["Find the Mode", "More Than One Mode", "No Mode"], curriculum: ["AC9M5ST01"] },
    { focus: "Distribution Shape", lessons: ["Read the Distribution", "Describe the Shape", "Compare Shapes"], curriculum: ["AC9M5ST01"] },
    { focus: "Choosing Displays", lessons: ["Match Data to Display", "Compare Displays", "Justify the Choice"], curriculum: ["AC9M5ST01"] },
    { focus: "Line Graphs", lessons: ["Read a Line Graph", "Change Over Time", "Make Inferences"], curriculum: ["AC9M5ST02"] },
    { focus: "Planning Investigations", lessons: ["Pose an Unbiased Question", "Choose & Collect Data", "Choose the Display"], curriculum: ["AC9M5ST03"] },
    { focus: "Statistical Investigation", lessons: ["Collect & Validate", "Analyse & Interpret", "Communicate Findings"], curriculum: ["AC9M5ST01", "AC9M5ST02", "AC9M5ST03"] },
  ],
  "Year 6": [
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

assert.equal(STATISTICA_META.realm, "Statistica");
assert.equal(STATISTICA_META.strand, "Statistics");
assert.equal(
  STATISTICA_META.journey,
  "Collect -> Record -> Represent -> Interpret -> Compare -> Analyse -> Investigate -> Critique",
);

const catalogueEntry = getAllRealms().find((realm) => realm.id === "statistics");
assert(catalogueEntry, "Statistica must exist in the realm catalogue.");
assert.equal(catalogueEntry.realm, "Statistica");
assert.equal(catalogueEntry.hasContent, false, "Statistica must remain blueprint-only, not live placement content.");

for (const [yearLabel, expectedWeeks] of Object.entries(expected)) {
  const genre = getGenresForYear(yearLabel).find((candidate) => candidate.id === "statistics");
  assert(genre, `Statistics genre missing for ${yearLabel}.`);
  assert.equal(genre.realm, "Statistica");
  assert.equal(genre.available, false, "Statistica should not be available for live progress until activities and assessments are built.");

  const plan = getCurriculumPlan(yearLabel, "statistics");
  assert.equal(plan.length, 8, `${yearLabel} Statistica must have 8 weeks.`);

  plan.forEach((week, weekIndex) => {
    const expectedWeek = expectedWeeks[weekIndex]!;
    assert.equal(week.week, weekIndex + 1);
    assert.equal(week.topic, expectedWeek.focus);
    assert.deepEqual(week.curriculum, expectedWeek.curriculum);
    assert.equal(week.lessons.length, 3, `${yearLabel} Week ${week.week} must have 3 lessons.`);

    week.lessons.forEach((lesson, lessonIndex) => {
      assert.equal(lesson.id, `y${yearLabel.replace("Year ", "")}-statistics-w${week.week}-l${lesson.lesson}`);
      assert.equal(lesson.title, expectedWeek.lessons[lessonIndex]);
      assert.deepEqual(lesson.curriculum, expectedWeek.curriculum);
      assert.equal(lesson.config?.realmId, "statistics");
      assert.equal(lesson.config?.blueprintOnly, true);
      assert(lesson.focus.includes("Statistics:"), `${lesson.id} must have teacher-readable Statistics focus text.`);
    });
  });
}

assert.equal(getCurriculumPlan("Prep", "statistics").length, 0, "Statistica starts at Level 1, not Prep.");

console.log("Statistica blueprint audit passed: Levels 1-6 are frozen as 8 weeks x 3 lessons and remain blueprint-only.");
