"use client";
// Friends: add each other with a friend code (never the explorer code), visit worlds, and let chosen
// friends help build. The server checks everything (see the friends migration); demo and teacher-preview
// sessions get a pretend friends list that lives in this tab.
import { supabase } from "@/lib/supabase";
import type { CentralWorldGroundTile, CentralWorldPlacement } from "@/lib/world3d/central-world-layout";

export type Friend = {
  friendshipId: string;
  studentId: string;
  name: string;
  /** friend: accepted. incoming: they asked me. outgoing: I asked them. */
  status: "friend" | "incoming" | "outgoing";
  /** May they build in my world? (my switch) */
  theyCanBuild: boolean;
  /** May I build in theirs? (their switch) */
  iCanBuild: boolean;
};
export type FriendsState = { code: string; enabled: boolean; buildingEnabled: boolean; friends: Friend[] };
export type FriendWorld = { name: string; placements: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; canBuild: boolean; owned: string[] };
export type SendResult = "sent" | "accepted" | "already" | "not_found" | "self" | "off";
export type VisitorChange = {
  id: string; helperName: string; at: string;
  beforePlacements: CentralWorldPlacement[]; beforeGroundTiles: CentralWorldGroundTile[];
  afterPlacements: CentralWorldPlacement[]; afterGroundTiles: CentralWorldGroundTile[];
};

/** The friend-code format: PAL- and four letters or numbers (no look-alikes such as 0/O or 1/I). */
export const FRIEND_CODE_PATTERN = /^PAL-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;
/** Tidies what a kid typed into a code: capitals, the PAL- prefix added if they left it off. */
export function normaliseFriendCode(typed: string) {
  const letters = typed.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/^PAL/, "");
  return `PAL-${letters.slice(0, 4)}`;
}

/** Visiting a friend's world keeps its copy apart from your own (never saved over yours). */
export const VISIT_SCOPE_PREFIX = "visit:";
export const visitScope = (friendId: string) => `${VISIT_SCOPE_PREFIX}${friendId}`;
export const visitedFriendId = (scope: string) => (scope.startsWith(VISIT_SCOPE_PREFIX) ? scope.slice(VISIT_SCOPE_PREFIX.length) : null);

const DEMO_STATE: FriendsState = {
  code: "PAL-D3MQ",
  enabled: true,
  buildingEnabled: true,
  friends: [
    { friendshipId: "demo-1", studentId: "demo-charlotte", name: "Charlotte", status: "friend", theyCanBuild: true, iCanBuild: true },
    { friendshipId: "demo-2", studentId: "demo-liam", name: "Liam", status: "friend", theyCanBuild: false, iCanBuild: false },
    { friendshipId: "demo-3", studentId: "demo-ava", name: "Ava", status: "incoming", theyCanBuild: false, iCanBuild: false },
  ],
};
let demoState = DEMO_STATE;

async function call<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}

export async function fetchFriends(studentId: string | null, demo: boolean): Promise<FriendsState> {
  if (demo || !studentId) return demoState;
  return call<FriendsState>("get_friends_secure", { p_student_id: studentId });
}
export async function newFriendCode(studentId: string | null, demo: boolean): Promise<string> {
  if (demo || !studentId) return demoState.code;
  return call<string>("new_friend_code_secure", { p_student_id: studentId });
}
export async function sendFriendRequest(studentId: string | null, demo: boolean, code: string): Promise<SendResult> {
  if (demo || !studentId) return FRIEND_CODE_PATTERN.test(code) ? "sent" : "not_found";
  return call<SendResult>("send_friend_request_secure", { p_student_id: studentId, p_code: code });
}
export async function respondToFriend(studentId: string | null, demo: boolean, friendshipId: string, accept: boolean) {
  if (demo || !studentId) {
    demoState = { ...demoState, friends: demoState.friends.flatMap((f) => (f.friendshipId !== friendshipId ? [f] : accept ? [{ ...f, status: "friend" as const }] : [])) };
    return;
  }
  await call("respond_friend_request_secure", { p_student_id: studentId, p_friendship_id: friendshipId, p_accept: accept });
}
export async function removeFriend(studentId: string | null, demo: boolean, friendshipId: string) {
  if (demo || !studentId) { demoState = { ...demoState, friends: demoState.friends.filter((f) => f.friendshipId !== friendshipId) }; return; }
  await call("remove_friend_secure", { p_student_id: studentId, p_friendship_id: friendshipId });
}
export async function setFriendCanBuild(studentId: string | null, demo: boolean, friendshipId: string, canBuild: boolean) {
  if (demo || !studentId) { demoState = { ...demoState, friends: demoState.friends.map((f) => (f.friendshipId === friendshipId ? { ...f, theyCanBuild: canBuild } : f)) }; return; }
  await call("set_friend_can_build_secure", { p_student_id: studentId, p_friendship_id: friendshipId, p_can_build: canBuild });
}

export async function fetchFriendWorld(studentId: string | null, demo: boolean, friendId: string): Promise<FriendWorld | null> {
  if (demo || !studentId) {
    const friend = demoState.friends.find((f) => f.studentId === friendId);
    return friend ? { name: friend.name, placements: [], groundTiles: [], canBuild: friend.iCanBuild, owned: [] } : null;
  }
  return call<FriendWorld>("get_friend_world_secure", { p_student_id: studentId, p_friend_id: friendId });
}
export async function saveFriendWorld(studentId: string, friendId: string, world: { placements: unknown[]; groundTiles: unknown[] }) {
  await call("save_friend_world_secure", { p_student_id: studentId, p_friend_id: friendId, p_placements: world.placements, p_ground_tiles: world.groundTiles });
}
export async function fetchVisitorChanges(studentId: string | null, demo: boolean): Promise<VisitorChange[]> {
  if (demo || !studentId) return [];
  return call<VisitorChange[]>("get_world_visitor_changes_secure", { p_student_id: studentId });
}
export async function resolveVisitorChange(studentId: string, changeId: string) {
  await call("resolve_world_visitor_change_secure", { p_student_id: studentId, p_change_id: changeId });
}

/** Teachers switch friends (and friend building) for a class; parents for their child. */
export async function setClassFriends(classId: string, enabled: boolean, building: boolean) {
  await call("set_class_friends_secure", { p_class_id: classId, p_enabled: enabled, p_building: building });
}
export async function setChildFriends(studentId: string, enabled: boolean, building: boolean) {
  await call("set_child_friends_secure", { p_student_id: studentId, p_enabled: enabled, p_building: building });
}
export async function fetchChildFriends(studentId: string): Promise<{ enabled: boolean; building: boolean; schoolManaged: boolean }> {
  return call("get_child_friends_secure", { p_student_id: studentId });
}
