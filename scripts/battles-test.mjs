// Friend battles: the tug of war, the XP and limits the server sets matching the screens, live and
// take-turns rules, the Battle Arena room and links to it, POWER UPs, and the hub, teacher and parent wiring.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BATTLE_PLAY_XP, BATTLE_TURN_DAYS, BATTLE_WIN_XP, battleRoomHref, clashPoint, readBattleToPlay, rematchHref } from "../lib/battles.ts";
import { BATTLE_QUESTIONS, BATTLE_SECONDS } from "../lib/battle-questions.ts";

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

// The Battle Arena is its own room: the link carries the battle there and back for a rematch.
const play = { id: "b1", seed: 42, realm: "space", mode: "turns", friendId: "f1", friendName: "Demo Mia" };
const href = battleRoomHref(play, false);
assert.ok(href.startsWith("/world/battle?"), "battles play in the arena room");
assert.deepEqual(readBattleToPlay(new URL(href, "https://x").searchParams), play, "the room reads the battle from its link");
assert.ok(battleRoomHref(play, true).includes("teacher_preview=1"), "demo battles stay in demo");
assert.equal(readBattleToPlay(new URLSearchParams("id=b1&seed=1&realm=nope&mode=live&friend=f&name=n")), null, "a made-up realm goes back to the hub");
assert.equal(rematchHref(play, false), "/world?battles=1&friend=f1&realm=space", "REMATCH opens Battles with the same friend and realm");

// Wiring.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hub = read("components/world3d/CentralWorld.tsx");
assert.ok(hub.includes('key: "battles", label: "Battles"') && hub.includes("<BattlesPanel ") && hub.includes("<BattleInviteToast ") && hub.includes("router.push(battleRoomHref(play, preview))"), "the hub's Battles button and invites lead into the arena room");
assert.ok(!hub.includes("BattleArena") && !read("components/world3d/CentralWorldEnvironment.tsx").includes("BattleArena") && !read("lib/world3d/central-world-v2.ts").includes("ARENA"), "the arena no longer stands behind the Tower");
const room = read("components/world3d/battle/BattleRoom.tsx");
assert.ok(room.includes("<BattleArenaScene ") && room.includes('"LAUNCH!"') && room.includes("POWER UP!") && room.includes("VICTORY!") && room.includes("REMATCH") && room.includes("BACK TO THE HUB"), "the room: countdown, LAUNCH, POWER UP, VICTORY, REMATCH");
assert.ok(room.includes("<MuteButton />") && read("lib/audio/battle-sfx.ts").includes('makeSoundSwitch("reliq:battle:muted")'), "the arena is loud, with its own mute");
assert.ok(read("components/world3d/battle/useBattleGame.ts").includes("if (!running || done) return;"), "the clock starts at LAUNCH");
assert.ok(read("app/world/battle/page.tsx").includes("<BattleRoomEntry />"), "the arena has its own page");
assert.ok(read("components/world3d/friends/FriendsPanel.tsx").includes("onChallenge(friend)"), "friends can be challenged from the Friends panel");
assert.ok(read("app/teacher/dashboard/page.tsx").includes("setClassBattles(selectedClassId"), "teachers switch battles per class");
assert.ok(read("components/parent/ParentPortal.tsx").includes("setChildBattles(child.studentId"), "parents switch battles per child");
console.log("battles: tug of war, XP and limits, live and take-turns rules, the arena room, hub, teacher and parent wiring all check out");
