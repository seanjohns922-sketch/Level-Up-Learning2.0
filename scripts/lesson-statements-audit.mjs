// Lists the "Today I am learning to…" and "I can…" statements every lesson shows,
// using the same data and sentence-building as the lesson pages.
// Run with --check (npm run qa:lesson-statements) to fail on statements that don't read properly;
// without it, prints every lesson's statements as tab-separated rows.
const { learningStatementFor, successCriteriaStatementsFor } = await import("../lib/lesson-statements.ts");
const { getProgramForYear } = await import("../data/programs/index.ts");
const { getCurriculumPlan } = await import("../data/programs/genres.ts");
const { getStatisticaProgramForYearLabel } = await import("../data/programs/statistica.ts");
const { getPatternPeaksProgramForYearLabel } = await import("../data/programs/patternPeaks.ts");
const { getChanceHollowProgramForYearLabel } = await import("../data/programs/chanceHollow.ts");
const { chanceHollowSuccessCriteria } = await import("../lib/chance-hollow-success-criteria.ts");
// Same rule as app/lesson/page.tsx: only activity ideas written as goals become "I can" lines.
const goals = (ideas) => (ideas ?? []).filter((idea) => /^(core concept|application task|reasoning prompt):/i.test(idea.trim()) || idea.includes("."));

const rows = [];
const add = (realm, level, week, lesson, title, focus, criteria) => {
  if (!focus) return;
  rows.push([realm, level, week, lesson, title, learningStatementFor(focus, title), ...successCriteriaStatementsFor(criteria ?? [], focus, title)]);
};
const LEVELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

for (const year of LEVELS) {
  for (const week of getProgramForYear(year) ?? []) {
    week.lessons.forEach((l, i) => add("number", year, week.week, i + 1, l.displayTitle ?? l.title, l.focus, goals(l.activityIdeas)));
  }
  for (const week of getCurriculumPlan(year, "measurement") ?? []) {
    week.lessons.forEach((l, i) => add("measurement", year, week.week, i + 1, l.displayTitle ?? l.title, l.focus, goals(l.activityIdeas)));
  }
  const stat = getStatisticaProgramForYearLabel(year);
  for (const week of stat ?? []) {
    for (const l of week.lessons) {
      const lc = l.title.toLowerCase(), wc = week.topic.toLowerCase();
      add("statistics", year, week.week, l.lesson, l.title, `use ${lc} to explore ${wc}`, [`recognise and use ${lc}`, "use evidence from the data to answer a question", `explain how my result connects to ${wc}`]);
    }
  }
  for (const week of getPatternPeaksProgramForYearLabel(year) ?? []) {
    for (const l of week.lessons) add("pattern", year, week.week, l.lesson, l.title, l.focus, [l.focus, `use the ${String(l.config?.mechanic ?? "pattern model")} to show my thinking`, "check my answer and explain why the rule or equation works"]);
  }
  for (const week of getChanceHollowProgramForYearLabel(year) ?? []) {
    const n = year === "Prep" ? 0 : Number(year.slice(5));
    for (const l of week.lessons) add("chance", year, week.week, l.lesson, l.title, l.focus, chanceHollowSuccessCriteria(n, week.week, l.lesson));
  }
}

const { STARPATH_PROGRAMS } = await import("../data/starpath/program-registry.ts");
const contentMaps = Object.assign({},
  (await import("../data/activities/starpath/ground/index.ts")).GROUND_LESSON_CONTENT,
  (await import("../data/activities/starpath/level1/index.ts")).LEVEL_ONE_LESSON_CONTENT,
  (await import("../data/activities/starpath/level2/index.ts")).LEVEL_TWO_LESSON_CONTENT,
  (await import("../data/activities/starpath/level3/index.ts")).LEVEL_THREE_LESSON_CONTENT,
  (await import("../data/activities/starpath/level4/index.ts")).LEVEL_FOUR_LESSON_CONTENT,
  (await import("../data/activities/starpath/level5/index.ts")).LEVEL_FIVE_LESSON_CONTENT,
  (await import("../data/activities/starpath/level6/index.ts")).LEVEL_SIX_LESSON_CONTENT,
);
for (const program of STARPATH_PROGRAMS) {
  for (const week of program.weeks) {
    week.lessons.forEach((l, i) => add("space", program.level ?? program.yearLabel ?? program.id, week.week, i + 1, l.title, l.learningIntention, contentMaps[l.registryId]?.successCriteria ?? [l.focus]));
  }
}

if (process.argv.includes("--check")) {
  // Statistica's statements are still template text and are being rewritten lesson by lesson.
  const checked = rows.filter(([realm]) => realm !== "statistics");
  const awkward = checked.filter((row) => row.slice(5).some((line) => /^I am learning about |^I can explain what I know about |Open-ended:|^I (am learning to|can) [a-z]+:|learning to learn|^I can learn /.test(String(line))));
  if (awkward.length) {
    console.error(`FAIL ${awkward.length} lessons have statements that don't read properly:`);
    for (const row of awkward.slice(0, 20)) console.error(`- ${row.slice(0, 4).join(" ")}: ${row.slice(5).join(" / ")}`);
    process.exit(1);
  }
  console.log(`PASS lesson statements: ${checked.length} lessons read as "I am learning to…" and "I can…" sentences`);
} else {
  for (const r of rows) console.log(r.map((v) => String(v).replace(/\t|\n/g, " ")).join("\t"));
  console.error(`${rows.length} lessons`);
}
