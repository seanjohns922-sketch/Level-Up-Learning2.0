// Friend battles: the tug of war, the XP and limits the server sets matching the screens, live and
// take-turns rules, and the hub, arena, teacher and parent wiring.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BATTLE_PLAY_XP, BATTLE_TURN_DAYS, BATTLE_WIN_XP, clashPoint } from "../lib/battles.ts";
import { BATTLE_QUESTIONS, BATTLE_SECONDS } from "../lib/battle-questions.ts";
import { HUB_V2_ARENA, hubCanStand, hubIsReservedCell, HUB_V2_GRID } from "../lib/world3d/central-world-v2.ts";

// The tug of war: level at the start, pushed by a lead, never past the edges.
assert.equal(clashPoint(0, 0), 0);
assert.ok(clashPoint(5, 2) > 0 && clashPoint(2, 5) < 0, "ahead pushes towards the friend");
assert.equal(clashPoint(20, 0), 1);
assert.equal(clashPoint(0, 20), -1);
assert.equal(BATTLE_QUESTIONS, 20, "20 quick questions");
assert.equal(BATTLE_SECONDS, 300, "five minutes");
assert.deepEqual([BATTLE_PLAY_XP, BATTLE_WIN_XP], [15, 60], "tripled XP: +15 each, +60 to the winner");

// The server sets the same numbers and rules.
const migration = readFileSync(new URL("../supabase/migrations/20261126150000_battles.sql", import.meta.url), "utf8");
assert.ok(migration.includes(`play_xp constant integer := ${BATTLE_PLAY_XP};`) && migration.includes(`win_xp constant integer := ${BATTLE_WIN_XP};`), "XP matches");
assert.ok(migration.includes(`interval '${BATTLE_TURN_DAYS} days'`) && migration.includes("interval '2 minutes'"), "2 days to take a turn; 2 minutes to accept a live invite");
assert.ok(migration.includes("return in_hours < 3 and today < 8;") && migration.includes("return today < 10;"), "daily limits: school 3 in hours and 8 a day, home 10");
assert.ok(migration.includes("You can only battle friends") && migration.includes("public.battles_allowed(p_friend_id)"), "only friends, only when battles are on");
assert.ok(migration.includes("least(greatest(coalesce(p_correct, 0), 0), 20)"), "scores are 0 to 20");
assert.ok(migration.includes("The friend's score only shows once the battle is over"), "no peeking at a take-turns score");
assert.ok(migration.includes("revoke all on public.student_battles from public, anon, authenticated;"), "battles are reached only through the functions");
assert.ok(!/drop\s+table/i.test(migration.replace(/^--.*$/gm, "")), "nothing dropped");

// The arena: a fixed landmark nobody builds over or walks through.
const toCell = (metres) => Math.round(metres / HUB_V2_GRID.cellSize);
assert.ok(hubIsReservedCell(toCell(HUB_V2_ARENA.x), toCell(HUB_V2_ARENA.z)) && hubIsReservedCell(toCell(HUB_V2_ARENA.x + 15), toCell(HUB_V2_ARENA.z)), "the arena's squares are reserved");
assert.ok(!hubCanStand(HUB_V2_ARENA.x, HUB_V2_ARENA.z) && !hubCanStand(HUB_V2_ARENA.x + HUB_V2_ARENA.podium, HUB_V2_ARENA.z), "you walk round the bowl and podiums, not through them");
assert.ok(hubCanStand(HUB_V2_ARENA.x + HUB_V2_ARENA.podium + 3.2, HUB_V2_ARENA.z), "you can stand at the foot of a podium to start a battle");

// Wiring.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hub = read("components/world3d/CentralWorld.tsx");
assert.ok(hub.includes('nearArena ? { label: "BATTLE"') && hub.includes("<BattlesPanel ") && hub.includes("<BattlePlay ") && hub.includes("<BattleInviteToast "), "the hub runs battles");
assert.ok(read("components/world3d/CentralWorldEnvironment.tsx").includes("<BattleArena night={night} clash={battleClash ?? undefined} />"), "the arena stands in the hub and shows the tug of war");
assert.ok(read("components/world3d/friends/FriendsPanel.tsx").includes("onChallenge(friend)"), "friends can be challenged from the Friends panel");
assert.ok(read("app/teacher/dashboard/page.tsx").includes("setClassBattles(selectedClassId"), "teachers switch battles per class");
assert.ok(read("components/parent/ParentPortal.tsx").includes("setChildBattles(child.studentId"), "parents switch battles per child");
console.log("battles: tug of war, XP and limits, live and take-turns rules, the arena, hub, teacher and parent wiring all check out");
