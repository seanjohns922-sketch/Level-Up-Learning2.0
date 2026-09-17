import type { ParentChild } from "@/components/parent/ParentPortal";
import type { ParentActivity, ParentProgressReport } from "@/lib/parent-insights";

/**
 * Review fixture for the Parent dashboard preview.
 *
 * The preview renders the real Parent components; only the data is fixed, so
 * layout, wording, theming and the printable report can be reviewed without a
 * parent login. Nothing here is written anywhere. Use the mock parent account
 * to verify real permissions, saving and linking.
 */

function daysAgo(days: number, hour = 16) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 12, 0, 0);
  // Never let a fixture timestamp land in the future, whatever time of day the
  // preview is opened.
  return new Date(Math.min(date.getTime(), Date.now() - 60_000)).toISOString();
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isoDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const FIXTURE_PARENT_NAME = "Review";

export const FIXTURE_PARENT_CHILDREN: ParentChild[] = [
  {
    studentId: "review-child-1",
    displayName: "Maya Fletcher",
    firstName: "Maya",
    username: "maya.f",
    yearLevel: "Year 2",
    explorerCode: "LUL-REVW-2026",
    schoolName: "Brightwater Primary",
    lastActiveAt: hoursAgo(2),
    homeAccess: true,
    billingStatus: "free",
    realms: [
      {
        realmId: "number",
        workingLevel: "Year 2",
        currentWeek: 5,
        requiredWeeks: [1, 2, 3, 4, 5, 6],
        optionalWeeks: [7, 8],
        status: "ASSIGNED_PROGRAM",
        currentFocus: "Place value to 1000",
        completedLessons: 14,
        unlockedLegends: [],
      },
      {
        realmId: "measurement",
        workingLevel: "Year 2",
        currentWeek: 3,
        requiredWeeks: [1, 2, 3, 4],
        optionalWeeks: [],
        status: "ASSIGNED_PROGRAM",
        currentFocus: "Measuring length with informal units",
        completedLessons: 7,
        unlockedLegends: [],
      },
      {
        realmId: "space",
        workingLevel: "Year 1",
        currentWeek: 8,
        requiredWeeks: [1, 2, 3, 4, 5, 6, 7, 8],
        optionalWeeks: [],
        status: "ASSIGNED_PROGRAM",
        currentFocus: "Giving and following directions",
        completedLessons: 21,
        unlockedLegends: [],
      },
      {
        realmId: "statistics",
        workingLevel: "Year 2",
        currentWeek: 2,
        requiredWeeks: [1, 2, 3],
        optionalWeeks: [],
        status: "ASSIGNED_PROGRAM",
        currentFocus: "Collecting and sorting data",
        completedLessons: 4,
        unlockedLegends: [],
      },
    ],
    recentAchievements: [
      { name: "Number Navigator", earnedAt: daysAgo(1), rarity: "rare" },
      { name: "Five Day Streak", earnedAt: daysAgo(3), rarity: "common" },
      { name: "Perfect Quiz", earnedAt: daysAgo(6), rarity: "epic" },
    ],
    gems: [
      { gemId: "streak-5", name: "Five Day Streak", earnedAt: daysAgo(3), rarity: "common" },
      { gemId: "perfect-quiz", name: "Perfect Quiz", earnedAt: daysAgo(6), rarity: "epic" },
    ],
  },
  {
    studentId: "review-child-2",
    displayName: "Ari Fletcher",
    firstName: "Ari",
    username: "ari.f",
    yearLevel: "Prep",
    explorerCode: "LUL-REVW-2027",
    schoolName: null,
    lastActiveAt: daysAgo(2),
    homeAccess: false,
    billingStatus: null,
    realms: [
      {
        realmId: "number",
        workingLevel: "Prep",
        currentWeek: 2,
        requiredWeeks: [1, 2, 3],
        optionalWeeks: [],
        status: "ASSIGNED_PROGRAM",
        currentFocus: "Counting to 20",
        completedLessons: 5,
        unlockedLegends: [],
      },
    ],
    recentAchievements: [{ name: "First Lesson", earnedAt: daysAgo(9), rarity: "common" }],
    gems: [{ gemId: "first-lesson", name: "First Lesson", earnedAt: daysAgo(9), rarity: "common" }],
  },
];

export const FIXTURE_PARENT_ACTIVITY: Record<string, ParentActivity> = {
  "review-child-1": {
    days: [
      { date: isoDate(8), minutes: 18, secondsActive: 1080, questions: 24, correct: 19, lessons: 1, quizzes: 0, xp: 60 },
      { date: isoDate(6), minutes: 26, secondsActive: 1560, questions: 31, correct: 27, lessons: 2, quizzes: 1, xp: 110 },
      { date: isoDate(5), minutes: 12, secondsActive: 720, questions: 15, correct: 12, lessons: 1, quizzes: 0, xp: 45 },
      { date: isoDate(3), minutes: 31, secondsActive: 1860, questions: 38, correct: 33, lessons: 2, quizzes: 1, xp: 130 },
      { date: isoDate(2), minutes: 22, secondsActive: 1320, questions: 27, correct: 24, lessons: 1, quizzes: 0, xp: 80 },
      { date: isoDate(1), minutes: 19, secondsActive: 1140, questions: 23, correct: 21, lessons: 1, quizzes: 0, xp: 75 },
      { date: isoDate(0), minutes: 24, secondsActive: 1440, questions: 29, correct: 26, lessons: 2, quizzes: 0, xp: 95 },
    ],
    feed: [
      {
        kind: "lesson",
        realmId: "number",
        workingLevel: "Year 2",
        label: "Place value to 1000",
        week: 5,
        lesson: 2,
        correct: 9,
        attempted: 10,
        accuracy: 90,
        completedAt: hoursAgo(2),
      },
      {
        kind: "lesson",
        realmId: "statistics",
        workingLevel: "Year 2",
        label: "Sorting data into groups",
        week: 2,
        lesson: 1,
        correct: 8,
        attempted: 10,
        accuracy: 80,
        completedAt: hoursAgo(6),
      },
      {
        kind: "quiz",
        realmId: "number",
        workingLevel: "Year 2",
        label: "Week 4 Quiz",
        week: 4,
        lesson: null,
        correct: 9,
        attempted: 10,
        accuracy: 90,
        completedAt: daysAgo(1, 17),
      },
      {
        kind: "lesson",
        realmId: "measurement",
        workingLevel: "Year 2",
        label: "Measuring length with informal units",
        week: 3,
        lesson: 3,
        correct: 7,
        attempted: 10,
        accuracy: 70,
        completedAt: daysAgo(2, 15),
      },
      {
        kind: "assessment",
        realmId: "space",
        workingLevel: "Year 1",
        label: "Post-Test",
        week: null,
        lesson: null,
        correct: 18,
        attempted: 20,
        accuracy: 90,
        completedAt: daysAgo(3, 11),
      },
      {
        kind: "lesson",
        realmId: "space",
        workingLevel: "Year 1",
        label: "Giving and following directions",
        week: 8,
        lesson: 3,
        correct: 10,
        attempted: 10,
        accuracy: 100,
        completedAt: daysAgo(5, 16),
      },
      {
        kind: "quiz",
        realmId: "measurement",
        workingLevel: "Year 2",
        label: "Week 2 Quiz",
        week: 2,
        lesson: null,
        correct: 6,
        attempted: 10,
        accuracy: 60,
        completedAt: daysAgo(6, 14),
      },
    ],
  },
  "review-child-2": {
    days: [
      { date: isoDate(9), minutes: 11, secondsActive: 660, questions: 12, correct: 9, lessons: 1, quizzes: 0, xp: 35 },
      { date: isoDate(2), minutes: 14, secondsActive: 840, questions: 16, correct: 13, lessons: 1, quizzes: 0, xp: 45 },
    ],
    feed: [
      {
        kind: "lesson",
        realmId: "number",
        workingLevel: "Prep",
        label: "Counting to 20",
        week: 2,
        lesson: 1,
        correct: 8,
        attempted: 10,
        accuracy: 80,
        completedAt: daysAgo(2, 10),
      },
    ],
  },
};

export const FIXTURE_PARENT_REPORTS: Record<string, ParentProgressReport> = {
  "review-child-1": {
    student: {
      id: "review-child-1",
      name: "Maya Fletcher",
      yearLevel: "Year 2",
      schoolName: "Brightwater Primary",
    },
    levels: [
      { realmId: "number", workingLevel: "Prep", isCurrent: false, currentWeek: null, status: "COMPLETE", pretestScore: 55, posttestScore: 95, posttestCompletedAt: daysAgo(210) },
      { realmId: "number", workingLevel: "Year 1", isCurrent: false, currentWeek: null, status: "COMPLETE", pretestScore: 60, posttestScore: 90, posttestCompletedAt: daysAgo(96) },
      { realmId: "number", workingLevel: "Year 2", isCurrent: true, currentWeek: 5, status: "ASSIGNED_PROGRAM", pretestScore: 45, posttestScore: null, posttestCompletedAt: null },
      { realmId: "measurement", workingLevel: "Year 1", isCurrent: false, currentWeek: null, status: "COMPLETE", pretestScore: 50, posttestScore: 88, posttestCompletedAt: daysAgo(74) },
      { realmId: "measurement", workingLevel: "Year 2", isCurrent: true, currentWeek: 3, status: "ASSIGNED_PROGRAM", pretestScore: 40, posttestScore: null, posttestCompletedAt: null },
      { realmId: "space", workingLevel: "Prep", isCurrent: false, currentWeek: null, status: "COMPLETE", pretestScore: 65, posttestScore: 100, posttestCompletedAt: daysAgo(150) },
      { realmId: "space", workingLevel: "Year 1", isCurrent: true, currentWeek: 8, status: "ASSIGNED_PROGRAM", pretestScore: 55, posttestScore: 90, posttestCompletedAt: daysAgo(3) },
      { realmId: "statistics", workingLevel: "Year 2", isCurrent: true, currentWeek: 2, status: "ASSIGNED_PROGRAM", pretestScore: 35, posttestScore: null, posttestCompletedAt: null },
    ],
    lessonsCompleted: 46,
    gemsEarned: 9,
    learningDays: 38,
    minutesLearning: 742,
    passThreshold: 85,
  },
  "review-child-2": {
    student: { id: "review-child-2", name: "Ari Fletcher", yearLevel: "Prep", schoolName: null },
    levels: [
      { realmId: "number", workingLevel: "Prep", isCurrent: true, currentWeek: 2, status: "ASSIGNED_PROGRAM", pretestScore: 30, posttestScore: null, posttestCompletedAt: null },
    ],
    lessonsCompleted: 5,
    gemsEarned: 1,
    learningDays: 4,
    minutesLearning: 52,
    passThreshold: 85,
  },
};
