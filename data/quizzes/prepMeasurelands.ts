import type { CurriculumCode } from "@/data/programs/year1";

export type MeasurelandsWeeklyQuizMeta = {
  week: number;
  quizTitle: string;
  weeklyFocus: string;
  realm: "Measurelands";
  levelLabel: "Ground Level";
  curriculum: CurriculumCode[];
  coverage: string[];
};

export const PREP_MEASURELANDS_WEEKLY_QUIZZES: MeasurelandsWeeklyQuizMeta[] = [
  {
    week: 1,
    quizTitle: "Week 1 Quiz — Length Lands",
    weeklyFocus: "Length and Height",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM01"],
    coverage: ["Which is longer?", "Ordering lengths", "Measuring paths"],
  },
  {
    week: 2,
    quizTitle: "Week 2 Quiz — Balance Basin",
    weeklyFocus: "Mass (Weight)",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM01"],
    coverage: ["Heavy or light?", "Order by mass", "Balance the scales"],
  },
  {
    week: 3,
    quizTitle: "Week 3 Quiz — Capacity Springs",
    weeklyFocus: "Capacity",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM01"],
    coverage: ["Which holds more?", "Ordering containers", "Filling the springs"],
  },
  {
    week: 4,
    quizTitle: "Week 4 Quiz — Duration Dunes",
    weeklyFocus: "Duration",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM01"],
    coverage: ["Which takes longer?", "Order the activities", "Quick or slow?"],
  },
  {
    week: 5,
    quizTitle: "Week 5 Quiz — Daylight Grove",
    weeklyFocus: "Days of the Week",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM02"],
    coverage: ["Name the days", "Put the days in order", "Weekdays and weekends"],
  },
  {
    week: 6,
    quizTitle: "Week 6 Quiz — Clockwork Crossing",
    weeklyFocus: "Time of Day",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM02"],
    coverage: ["Morning afternoon evening night", "Match activities to time of day", "My daily routine"],
  },
  {
    week: 7,
    quizTitle: "Week 7 Quiz — Calendar Keep",
    weeklyFocus: "Calendar Concepts",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM02"],
    coverage: ["Today", "Yesterday and tomorrow", "What day comes next?"],
  },
  {
    week: 8,
    quizTitle: "Week 8 Quiz — Timewielder Trial",
    weeklyFocus: "Mixed Measurement Mastery",
    realm: "Measurelands",
    levelLabel: "Ground Level",
    curriculum: ["AC9MFM01", "AC9MFM02"],
    coverage: [
      "Length, mass and capacity challenge",
      "Duration and time challenge",
      "Measurelands adventure challenge",
    ],
  },
];
