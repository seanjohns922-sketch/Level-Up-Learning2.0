// Friends: friend codes (never explorer codes), visiting keeps the friend's world apart from yours,
// a friend's changes summarised and undone without touching anything else, the server's rules, and the
// hub/teacher/parent wiring.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FRIEND_CODE_PATTERN, fetchClassmates, fetchFriendProfile, fetchFriends, friendLook, friendPageHref, normaliseFriendCode, sendClassmateRequest, visitHref, visitScope, visitedFriendId } from "../lib/friends.ts";
import { describeFriendChanges, summariseFriendChanges, undoFriendChanges } from "../lib/world3d/friend-changes.ts";
import { isSyncedWorldScope } from "../lib/world3d/central-world-sync.ts";

// Friend codes: typed loosely, tidied up; look-alike characters never appear.
assert.equal(normaliseFriendCode("pal-7k2p"), "PAL-7K2P");
assert.equal(normaliseFriendCode("7K2P"), "PAL-7K2P", "the PAL- prefix is optional");
assert.equal(normaliseFriendCode(" pal 7k 2p "), "PAL-7K2P");
assert.ok(FRIEND_CODE_PATTERN.test("PAL-7K2P") && !FRIEND_CODE_PATTERN.test("PAL-0O1I") && !FRIEND_CODE_PATTERN.test("LUL-ABCD-EFGH"), "friend codes are not explorer codes");

// Visiting: a separate copy of the friend's world that syncs to them, never to you.
const friend = "11111111-2222-3333-4444-555555555555";
assert.equal(visitScope(friend), `visit:${friend}`);
assert.equal(visitedFriendId(visitScope(friend)), friend);
assert.equal(visitedFriendId(friend), null);
assert.ok(isSyncedWorldScope(visitScope(friend)) && isSyncedWorldScope(friend) && !isSyncedWorldScope("visit:demo-mia") && !isSyncedWorldScope("demo-preview"));

// A friend's changes: summarised, then undone without losing what the owner built since.
const p = (id, gridX, gridZ, rotation = 0, itemId = "tree") => ({ placementId: id, itemId, gridX, gridZ, rotation });
const t = (gridX, gridZ, tileType = "path") => ({ gridX, gridZ, tileType });
const before = { placements: [p("home", 0, 0), p("bench", 4, 4), p("lamp", 6, 6)], groundTiles: [t(1, 1)] };
const after = { placements: [p("home", 0, 0), p("bench", 8, 8), p("tree1", 2, 2), p("tree2", 3, 3)], groundTiles: [t(1, 1, "water"), t(5, 5)] };
const summary = summariseFriendChanges(before, after);
assert.deepEqual(summary, { added: 2, moved: 1, removed: 1, painted: 2 });
assert.equal(describeFriendChanges(summary), "2 things built, 1 moved, 1 taken away and 2 squares painted");
assert.equal(describeFriendChanges(summariseFriendChanges(before, before)), "nothing changed");
// Since the visit, the owner added a fountain and moved one of the friend's trees themselves.
const current = { placements: [...after.placements.filter((x) => x.placementId !== "tree2"), p("tree2", 9, 9), p("fountain", 10, 10)], groundTiles: [...after.groundTiles, t(7, 7)] };
const undone = undoFriendChanges(current, before, after);
const ids = new Set(undone.placements.map((x) => x.placementId));
assert.ok(!ids.has("tree1"), "the friend's tree goes");
assert.ok(ids.has("tree2"), "a tree the owner moved since stays (it's theirs now)");
assert.ok(ids.has("fountain"), "what the owner built since stays");
assert.ok(ids.has("lamp"), "what the friend took away comes back");
assert.deepEqual(undone.placements.find((x) => x.placementId === "bench"), p("bench", 4, 4), "what the friend moved goes back");
assert.equal(undone.groundTiles.find((x) => x.gridX === 1).tileType, "path", "repainted ground goes back");
assert.ok(!undone.groundTiles.some((x) => x.gridX === 5), "newly painted ground goes");
assert.ok(undone.groundTiles.some((x) => x.gridX === 7), "the owner's own new path stays");

// The server's rules.
const migration = readFileSync(new URL("../supabase/migrations/20261126130000_friends.sql", import.meta.url), "utf8");
for (const fn of ["get_friends_secure", "new_friend_code_secure", "send_friend_request_secure", "respond_friend_request_secure", "remove_friend_secure", "set_friend_can_build_secure", "get_friend_world_secure", "save_friend_world_secure", "get_world_visitor_changes_secure", "resolve_world_visitor_change_secure", "set_class_friends_secure", "set_child_friends_secure", "get_child_friends_secure"]) {
  assert.ok(migration.includes(`create or replace function public.${fn}(`), fn);
}
assert.ok(migration.includes("code ~ '^PAL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$'"), "friend codes have their own format");
assert.ok(migration.includes("if not public.friend_can_build(p_friend_id, p_student_id) then"), "saving a friend's world needs their permission");
assert.ok(/case when f\.student_low = p_owner then f\.low_lets_high_build else f\.high_lets_low_build end/.test(migration), "only the owner's own switch lets a friend build");
assert.ok(migration.includes("revoke all on public.student_friend_codes, public.student_friendships, public.student_world_visitor_changes from public, anon, authenticated;"), "the tables are reached only through the functions");
assert.ok(migration.includes("public.can_manage_class(p_class_id)") && migration.includes("parent_student_links"), "adults' switches check the class or the child");
assert.ok(!/drop\s+table|alter\s+table\s+\S+\s+drop/i.test(migration.replace(/^--.*$/gm, "")), "nothing dropped");

// Friends, take two: MY CLASS, real explorers, and a friend's own page.
const takeTwo = readFileSync(new URL("../supabase/migrations/20261127090000_friends_my_class_and_profiles.sql", import.meta.url), "utf8");
for (const fn of ["get_classmates_secure", "send_classmate_request_secure", "get_friend_profile_secure", "get_friends_secure", "send_friend_request_secure"]) {
  assert.ok(takeTwo.includes(`create or replace function public.${fn}(`), fn);
}
const takeTwoCode = takeTwo.replace(/^--.*$/gm, "");
assert.ok(/send_classmate_request_secure[\s\S]*student_class_ids\(p_classmate_id\)[\s\S]*friend_request_to\(p_student_id, p_classmate_id\)/.test(takeTwoCode), "MY CLASS only asks someone in my class, and they still say yes");
assert.ok(/get_classmates_secure[\s\S]*if not public\.friends_allowed\(p_student_id\) then return '\[\]'::jsonb/.test(takeTwoCode), "the class Friends switch also turns off MY CLASS");
assert.ok(/get_friend_profile_secure[\s\S]*friendship\.status is distinct from 'accepted'/.test(takeTwoCode), "only friends see a friend's page");
assert.ok(!/(challenger|opponent)_level|student_progress|lesson|quiz|legend|reliq/i.test(takeTwoCode), "a friend's level, lessons, quizzes and RELIQS are never sent");
assert.ok(!/drop\s+table|alter\s+table/i.test(takeTwoCode), "no schema changes");
const demoFriends = await fetchFriends(null, true);
assert.ok(demoFriends.hasClass && demoFriends.friends.every((f) => f.outfit), "demo friends come dressed");
assert.equal(friendLook(demoFriends.friends[0].outfit).hairStyle, "curlyPony", "a friend's face is drawn from what they wear");
assert.deepEqual(friendLook(undefined), {}, "no outfit: the default explorer");
const mates = await fetchClassmates(null, true);
const isla = mates.find((m) => m.name === "Demo Isla");
assert.equal(isla.status, "none");
assert.equal(await sendClassmateRequest(null, true, isla.studentId), "sent");
assert.equal((await fetchClassmates(null, true)).find((m) => m.name === "Demo Isla").status, "outgoing", "ADD turns into ASKED");
assert.equal(await sendClassmateRequest(null, true, "demo-zara"), "accepted", "adding someone who asked you says yes");
const mia = await fetchFriendProfile(null, true, "demo-mia");
assert.deepEqual(mia.record, { won: 3, lost: 2, drawn: 0 });
assert.ok(!("level" in mia) && !("reliqs" in mia), "the page has no level or RELIQS");
assert.equal(await fetchFriendProfile(null, true, "nobody"), null);
assert.equal(friendPageHref("a b", true), "/world/friend?id=a%20b&teacher_preview=1");
assert.equal(visitHref("f1", false), "/world?visit=f1");

// Wiring.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hub = read("components/world3d/CentralWorld.tsx");
assert.ok(hub.includes("visitId ? visitScope(visitId)") && hub.includes("<VisitBanner ") && hub.includes("<FriendsPanel ") && hub.includes("<VisitorChangesCard "), "the hub visits, shows friends and the change card");
assert.ok(hub.includes("primaryAction={walkBuild || !canBuildHere ? undefined"), "BUILD only where you may build");
assert.ok(hub.includes("<FriendRequestToast ") && hub.includes("onOpenFriend={(friend) => router.push(friendPageHref("), "requests pop up; tapping a friend opens their page");
assert.ok(read("app/world/friend/page.tsx").includes("<FriendPageEntry />"), "a friend's page has its own route");
const page = read("components/world3d/friends/FriendPage.tsx");
assert.ok(page.includes("How to battle") && page.includes("Help build in") && page.includes("in your world") && page.includes("<WorldAccessChoice "), "the page says how to battle, how to build, and VISIT ONLY or CAN HELP BUILD");
assert.ok(read("components/world3d/friends/FriendBits.tsx").includes("VISIT ONLY") && read("components/world3d/friends/FriendVisit.tsx").includes("Visit only: look around"), "visit-only is said in plain words");
assert.ok(read("app/teacher/dashboard/page.tsx").includes("setClassFriends(selectedClassId"), "teachers switch friends per class");
assert.ok(read("components/parent/ParentPortal.tsx").includes("<ParentFriends "), "parents switch friends per child");
console.log("friends: codes, visiting, change summaries and undo, server rules, hub, teacher and parent wiring all check out");
