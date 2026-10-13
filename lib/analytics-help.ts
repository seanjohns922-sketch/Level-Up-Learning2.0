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
        text: "Each student's latest diagnostic, pre-test or post-test in each strand, compared with where they should be on the day they sat it. A Year 4 should be at Level 3 in January, 3.5 mid-year and 4 in December. Each student counts once overall, with Number weighted most. Algebra and Probability start at Level 3, so they count once their pre-test is sat.",
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
        text: `How far ${scope(audience)} has moved since each student's first test this year, compared with the growth expected over the same time.`,
      },
      {
        title: "Where the numbers come from",
        text: "Tests only. Each strand starts at the first test this year (pre-test or start diagnostic) and follows every later test. Expected growth is a level a year, so February to July is about 0.4. Growth counts once a student has sat a second test, so the line steps up after each round of testing. Algebra and Probability count once their pre-test is sat.",
      },
      {
        title: "What to do with it",
        text:
          audience === "teacher"
            ? "Check in with students going backwards or slower than expected, especially in more than one strand. Students waiting for a retest may be due a post-test."
            : audience === "group"
              ? "Compare the line with the expected line. If the group is behind pace in one strand, plan it together."
              : "Look for a school year or strand growing slower than expected. Judge the trend after the mid and end diagnostics, when most students have been retested.",
      },
    ],
    terms: [
      { term: PACE_META.backwards.label, text: `${PACE_META.backwards.meaning}.`, swatch: PACE_META.backwards.bg },
      { term: PACE_META.slower.label, text: `${PACE_META.slower.meaning}.`, swatch: PACE_META.slower.bg },
      { term: PACE_META.onPace.label, text: `${PACE_META.onPace.meaning}.`, swatch: PACE_META.onPace.bg },
      { term: PACE_META.faster.label, text: `${PACE_META.faster.meaning}.`, swatch: PACE_META.faster.bg },
      { term: "Expected", text: "a level a year, counted between each student's first and latest test.", swatch: "#FFFFFF", border: "#8F948C" },
      { term: "Waiting for a retest", text: "only one test so far, so no growth to show yet.", swatch: "#F1F2EE", border: "#C9CDC5" },
      { term: "Faded bar", text: "fewer than 5 students, so read it with care.", swatch: "#DDF5A6" },
    ],
  };
}
