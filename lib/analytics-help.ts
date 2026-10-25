import { STANDING_META } from "@/lib/proficiency";
import { PACE_META } from "@/lib/growth";

/** "How to read this" text behind the ? in the top-right corner of each
 * School Analytics tab, worded for who is looking. */

export type HelpAudience = "leadership" | "group" | "teacher";

export type TabHelpContent = {
  title: string;
  parts: Array<{ title: string; text: string }>;
  terms: Array<{ term: string; text: string; swatch: string; border?: string }>;
};

const scope = (audience: HelpAudience) => (audience === "teacher" ? "your class" : audience === "group" ? "this group" : "the school");

export function overviewHelp(audience: HelpAudience): TabHelpContent {
  return {
    title: "How to read Overview",
    parts: [
      {
        title: "What it shows",
        text: `Where ${scope(audience)} is in maths right now: how many students are well below, below, at or above where their school year should be.`,
      },
      {
        title: "Where the numbers come from",
        text: "Each student's latest diagnostic, pre-test or post-test in each strand, compared with where they should be in the term they sat it. The expectation rises a quarter of a level each term: a Year 4 should be at 3.25 in Term 1 (Jan–Mar), 3.5 in Term 2, 3.75 in Term 3 and 4.0 in Term 4 (Oct–Dec). Each student counts once overall, with Number weighted most. Algebra and Probability start at Level 3, so they count once their pre-test is sat.",
      },
      {
        title: "What to do with it",
        text:
          audience === "teacher"
            ? "Start with the students listed under Students who need support, especially anyone well below in Number. Students above level may be ready for more."
            : audience === "group"
              ? "Look for a strand that is below level across the group: that's one to plan together as a team."
              : "Start with Where to look. A school year or strand with a large share below level is where a whole-school approach will help most.",
      },
    ],
    terms: [
      { term: STANDING_META.wellBelow.label, text: `${STANDING_META.wellBelow.meaning}.`, swatch: STANDING_META.wellBelow.bg },
      { term: STANDING_META.below.label, text: `${STANDING_META.below.meaning}.`, swatch: STANDING_META.below.bg },
      { term: STANDING_META.at.label, text: `${STANDING_META.at.meaning}.`, swatch: STANDING_META.at.bg },
      { term: STANDING_META.above.label, text: `${STANDING_META.above.meaning}.`, swatch: STANDING_META.above.bg },
      { term: "Not yet placed", text: "no test sat yet, so not counted.", swatch: "#F1F2EE", border: "#C9CDC5" },
      { term: "Faded bar", text: "fewer than 10 students, so read it with care.", swatch: "#DDF5A6" },
    ],
  };
}

export function growthHelp(audience: HelpAudience): TabHelpContent {
  return {
    title: "How to read Growth",
    parts: [
      {
        title: "What it shows",
        text: `How far ${scope(audience)} has moved since each student's starting test this year, compared with the growth expected over the same time.`,
      },
      {
        title: "Where the numbers come from",
        text: "Tests only. A pre-test (or the start diagnostic) sets each student's starting point, and the post-tests and diagnostics after it show the growth. Pre-tests for a new level don't count as growth, because they check content not yet taught. Expected growth rises steadily at a quarter of a level each term (a level a year), so the dashed line climbs smoothly. The growth line moves when each round of post-tests and diagnostics comes in.",
      },
      {
        title: "What to do with it",
        text:
          audience === "teacher"
            ? "Check in with students going backwards or slower than expected, especially in more than one strand. Students waiting for every strand may need a post-test or a starting test in a strand."
            : audience === "group"
              ? "Compare the line with the expected line. If the group is behind pace in one strand, plan it together."
              : "Look for a school year or strand growing slower than expected. Judge the trend after the mid and end diagnostics, when most students have a post-test or diagnostic.",
      },
    ],
    terms: [
      { term: PACE_META.backwards.label, text: `${PACE_META.backwards.meaning}.`, swatch: PACE_META.backwards.bg },
      { term: PACE_META.slower.label, text: `${PACE_META.slower.meaning}.`, swatch: PACE_META.slower.bg },
      { term: PACE_META.onPace.label, text: `${PACE_META.onPace.meaning}.`, swatch: PACE_META.onPace.bg },
      { term: PACE_META.faster.label, text: `${PACE_META.faster.meaning}.`, swatch: PACE_META.faster.bg },
      { term: "Expected", text: "a steady quarter of a level per term from the starting test: to the latest post-test or diagnostic for pace, and to each date on the line.", swatch: "#FFFFFF", border: "#8F948C" },
      { term: "Waiting for every strand", text: "a student counts once every strand available to them has a starting test and a post-test or diagnostic after it: Number, Measurement, Space and Statistics, plus Algebra and Probability from Year 3 or once they move into them early. Growth by strand still includes them.", swatch: "#F1F2EE", border: "#C9CDC5" },
      { term: "Small group", text: "fewer than 5 students in that strand, so read it with care.", swatch: "#F1F2EE", border: "#C9CDC5" },
    ],
  };
}

const standingTerms = (): TabHelpContent["terms"] => [
  { term: STANDING_META.wellBelow.label, text: `${STANDING_META.wellBelow.meaning}.`, swatch: STANDING_META.wellBelow.bg },
  { term: STANDING_META.below.label, text: `${STANDING_META.below.meaning}.`, swatch: STANDING_META.below.bg },
  { term: STANDING_META.at.label, text: `${STANDING_META.at.meaning}.`, swatch: STANDING_META.at.bg },
  { term: STANDING_META.above.label, text: `${STANDING_META.above.meaning}.`, swatch: STANDING_META.above.bg },
];

export function curriculumHelp(audience: HelpAudience): TabHelpContent {
  return {
    title: "How to read Curriculum",
    parts: [
      { title: "What it shows", text: `Where ${scope(audience)} sits in each AC9 strand, split by school year, so you can see which strand and year need the most support.` },
      {
        title: "Where the numbers come from",
        text: "The same as the Overview: each student's latest diagnostic, pre-test or post-test in that strand, compared with where their school year should be in the term they sat it. A student counts once in every strand they have been tested in.",
      },
      {
        title: "What to do with it",
        text:
          audience === "teacher"
            ? "Pick the strand with the most students below level and tap the year row to see who they are."
            : "Look for a strand where one school year is mostly amber or coral. Tap the row to see the students and plan support with their teachers.",
      },
    ],
    terms: [
      ...standingTerms(),
      { term: "At or above", text: "the share of students at level or above level in that strand.", swatch: "#EEFBDB", border: "#83E300" },
      { term: "Below level count", text: "students below or well below in that strand and year.", swatch: "#FFE3DF", border: "#F2998D" },
    ],
  };
}

export function placementHelp(audience: HelpAudience): TabHelpContent {
  return {
    title: "How to read Placement",
    parts: [
      { title: "What it shows", text: `The level each student is working at in RELIQ right now, strand by strand, set against their school year for ${scope(audience)}.` },
      {
        title: "Where the numbers come from",
        text: "Working levels come from each student's pathway in each realm: their placement pre-test, then each level they move on to. Baseline is the average pre-test score. Algebra and Probability show as Not placed until the pre-test is sat. This is where students are working, not a test result, so it can differ from the Overview.",
      },
      {
        title: "What to do with it",
        text: "Read the grid row by row: each school year, and how many of its students work at each level. Lots of amber or coral in a row means many students are working below their year in that strand. Use Need lift to open Intervention.",
      },
    ],
    terms: [
      { term: "Two or more levels below", text: "working two or more levels under their school year.", swatch: "#F2998D" },
      { term: "One level below", text: "working one level under their school year.", swatch: "#FFD866" },
      { term: "Their year level", text: "working at the level that matches their school year (outlined).", swatch: "#83E300", border: "#121314" },
      { term: "Above their year", text: "working at a higher level than their school year.", swatch: "#121314" },
      { term: "Not placed (NP)", text: "no pre-test sat yet in that strand.", swatch: "#E9EBE5", border: "#D5D8D1" },
      { term: "Baseline", text: "the average pre-test score for the students placed.", swatch: "#F1F2EE", border: "#C9CDC5" },
    ],
  };
}

export function interventionHelp(audience: HelpAudience): TabHelpContent {
  return {
    title: "How to read Intervention",
    parts: [
      { title: "What it shows", text: `Which strand and school year in ${scope(audience)} has the most students below level, from the biggest group down.` },
      {
        title: "Where the numbers come from",
        text: "The same as the Overview: each student's latest diagnostic, pre-test or post-test in each strand, compared with where their school year should be in the term they sat it. Below level and well below both count; well below is shown separately.",
      },
      {
        title: "What to do with it",
        text:
          audience === "teacher"
            ? "Start with the biggest group at the top and tap it to see the students. Students well below may need a small focus group in that strand."
            : "Direct support where the heatmap is deepest, starting with groups that have students well below, then hand the list to the class teachers. Tap a cell to see the students.",
      },
    ],
    terms: [
      { term: "Heatmap cell", text: "students below level / students tested, for one strand and school year.", swatch: "#F7C2BA" },
      { term: "Deeper coral", text: "more students below level.", swatch: "#E2685A" },
      { term: "Lime tint", text: "no students below level in that strand and year.", swatch: "#E5F7C1" },
      { term: "Well below", text: `${STANDING_META.wellBelow.meaning}.`, swatch: STANDING_META.wellBelow.bg },
    ],
  };
}

export function classesHelp(): TabHelpContent {
  return {
    title: "How to read Classes",
    parts: [
      { title: "What it shows", text: "Each class side by side: how many students are using RELIQ, meeting the weekly target, their accuracy, levels mastered and growth. Classes in the same class group are listed together." },
      {
        title: "Where the numbers come from",
        text: "Activity from the reporting window you have chosen. Lessons and quizzes are counted once each, however many times they are repeated. Mastered means a post-test at 85% or more.",
      },
      {
        title: "What to do with it",
        text: "Use it to see where support or encouragement is needed, not to rank classes. Low Active or Weekly target numbers usually mean RELIQ time isn't happening yet in that class.",
      },
    ],
    terms: [
      { term: "Active", text: "had a lesson, quiz or test in the last 7 days.", swatch: "#83E300" },
      { term: "Weekly target", text: "at least 3 different lessons completed in the last 7 days.", swatch: "#121314" },
      { term: "Accuracy", text: "average score across lessons and quizzes.", swatch: "#F1F2EE", border: "#C9CDC5" },
      { term: "Mastered", text: "levels finished with a post-test of 85% or more.", swatch: "#EEFBDB", border: "#83E300" },
      { term: "Growth", text: "average points gained from pre-test to post-test at the same level.", swatch: "#FFFFFF", border: "#8F948C" },
    ],
  };
}

export function studentsHelp(audience: HelpAudience): TabHelpContent {
  return {
    title: "How to read Students",
    parts: [
      { title: "What it shows", text: `Every student in ${scope(audience)} with their status, accuracy, levels mastered and growth. Open a student to see each realm, their tests and their learning journey.` },
      {
        title: "Where the numbers come from",
        text: "Status uses the last 7 days of activity and the latest lesson, quiz or test score. Accuracy is the average across lessons and quizzes in the reporting window. Mastered and growth come from pre-tests and post-tests.",
      },
      {
        title: "What to do with it",
        text: "Sort by recent activity to find students who haven't been on RELIQ this week, or by growth to find who is moving slowest. Open a student to print a progress report or their learning journey.",
      },
    ],
    terms: [
      { term: "On track", text: "active this week, with their latest score at 80% or more.", swatch: "#83E300" },
      { term: "Active", text: "active this week, latest score under 80%.", swatch: "#F1F2EE", border: "#C9CDC5" },
      { term: "Needs attention", text: "no lessons, quizzes or tests in the last 7 days.", swatch: "#FFD866" },
      { term: "Mastered", text: "levels finished with a post-test of 85% or more.", swatch: "#EEFBDB", border: "#83E300" },
    ],
  };
}
