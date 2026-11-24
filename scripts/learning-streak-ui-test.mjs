// Streak copy and wiring. The streak rules themselves are tested in learning-streak-db-test.mjs.
import assert from "node:assert/strict";
import fs from "node:fs";

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://postgrest.test";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
globalThis.fetch = async (input) => assert.fail(`unexpected network call to ${input}`);

const streak = await import("../lib/learning-streak.ts");
const base = { shields: 0, awarded: [] };
assert.equal(streak.streakPrompt({ ...base, streak: 4, todayDone: false, nextDay: 5, nextXp: 500 }), "1 lesson today = 5-day streak");
assert.equal(streak.streakPrompt({ ...base, streak: 4, todayDone: true, nextDay: 5, nextXp: 500 }), "Learn tomorrow for your 5-day streak");
assert.equal(streak.streakPrompt({ ...base, streak: 5, todayDone: true, nextDay: 10, nextXp: 750 }), "5 more learning days to day 10");
assert.deepEqual(streak.STREAK_REWARDS.map((r) => [r.day, r.xp]), [[3, 100], [5, 500], [10, 750], [20, 1000], [30, 2000]]);
assert.equal(await streak.claimLearningStreak(), null, "no signed-in student, no claim");

const read = (file) => fs.readFileSync(file, "utf8");
const sync = read("lib/student-progress-sync.ts");
assert.match(sync, /xpAwardDone\("lesson"[\s\S]{0,200}if \(completed === true\) \{?\s*void claimLearningStreak\(\)/);
assert.match(sync, /xpAwardDone\("quiz"[\s\S]{0,200}if \(rewardEligible === true\) void claimLearningStreak\(\)/);
assert.match(read("app/layout.tsx"), /<StreakRewardReveal \/>/);
assert.match(read("components/economy/EconomyHeader.tsx"), /<StreakChip \/>/);
assert.match(read("components/world3d/WorldHUD.tsx"), /worldHudStreakReminder/);
const parent = read("components/parent/ParentChildOverview.tsx");
assert.match(parent, /fetchLearningStreak\(child\.studentId\)/);
assert.doesNotMatch(parent, /activityStreak/, "parents see the server streak, not a second count");
const migration = read("supabase/migrations/20261125090000_learning_streaks.sql");
for (const { day, xp } of streak.STREAK_REWARDS) assert.match(migration, new RegExp(`when p_day = ${day} then ${xp}`), `screen ladder matches the server for day ${day}`);
assert.match(migration, new RegExp(`p_day % 5 = 0 then ${streak.STREAK_REPEAT_XP}`));
assert.match(migration, new RegExp(`least\\(${streak.STREAK_SHIELD_LIMIT}, v_shields \\+ 1\\)`));

console.log("PASS learning streak UI: prompts, ladder matches the server, claims after first completions, chip/card/hub/parent/celebration wired");
