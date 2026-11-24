"use client";
// Friends: add each other (MY CLASS or a friend code, never the explorer code), visit worlds when they let
// you in (lib/friend-visits.ts), and battle. The server checks everything (see the friends migrations);
// demo and teacher-preview sessions get a pretend friends list that lives in this tab.
import type { AvatarOutfit } from "@/components/avatar/StudentAvatar";
import type { BattleRealm } from "@/lib/battle-questions";
import { outfitFromLayers } from "@/lib/economy";
import { demoLetsBuild, demoVisitId } from "@/lib/friend-visits";
import { supabase } from "@/lib/supabase";
import type { CentralWorldGroundTile, CentralWorldPlacement } from "@/lib/world3d/central-world-layout";

/** What an explorer is wearing, as the server sends it: their base look and each equipped layer. */
export type FriendOutfit = { base: AvatarOutfit; layers: Partial<Record<string, unknown>> };
/** A friend's explorer to draw (StudentAvatar). */
export const friendLook = (outfit: FriendOutfit | undefined): AvatarOutfit => (outfit ? outfitFromLayers(outfit.base ?? {}, outfit.layers ?? {}) : {});

export type Friend = {
  friendshipId: string;
  studentId: string;
  name: string;
  /** friend: accepted. incoming: they asked me. outgoing: I asked them. */
  status: "friend" | "incoming" | "outgoing";
  friendsSince?: string | null;
  outfit?: FriendOutfit;
};
/** `hasClass`: in a class, so MY CLASS has classmates to add (home learners use codes). */
export type FriendsState = { code: string; enabled: boolean; buildingEnabled: boolean; hasClass?: boolean; friends: Friend[] };
/** Someone in my class, and where we are: not asked yet, friends, I asked, or they asked me. */
export type Classmate = { studentId: string; name: string; outfit?: FriendOutfit; status: "none" | "friend" | "outgoing" | "incoming" };
export type FriendBattleResult = { id: string; realm: BattleRealm; at: string; myScore: number; friendScore: number; won: boolean; draw: boolean };
/** A friend's page. Never their level, lesson or quiz results, or RELIQS (those show how far through maths they are). */
export type FriendProfile = {
  friendshipId: string; studentId: string; name: string; outfit?: FriendOutfit; friendsSince: string | null; sameClass: boolean;
  battlesEnabled: boolean; worldItems: number;
  record: { won: number; lost: number; drawn: number }; recent: FriendBattleResult[];
};
/** A friend's world while they've let me in: `canBuild` while they've said BUILD. */
export type FriendWorld = { visitId: string; name: string; outfit?: FriendOutfit; placements: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; canBuild: boolean; owned: string[] };
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

/** Demo mode has no real students, so it gets pretend friends (clearly named) to show visiting and battles. */
const demoOutfit = (base: AvatarOutfit): FriendOutfit => ({ base, layers: {} });
const DEMO_OUTFITS: Record<string, FriendOutfit> = {
  "demo-mia": demoOutfit({ hairStyle: "curlyPony", hair: "#2b1a12", hairShade: "#140b06", skin: "#c98e63", skinShade: "#a8714a", shirt: "#e11d74", shirtTrim: "#f9a8d4", face: "bigSmile" }),
  "demo-leo": demoOutfit({ hairStyle: "fade", hair: "#111111", hairShade: "#000000", skin: "#8a5a3b", skinShade: "#6b4329", shirt: "#0ea5e9", shirtTrim: "#bae6fd", hat: "cap", hatColor: "#f59e0b", face: "confident" }),
  "demo-zara": demoOutfit({ hairStyle: "spaceBuns", hair: "#b45309", hairShade: "#7c2d12", skin: "#f1c8a6", skinShade: "#d6a07a", shirt: "#16a34a", shirtTrim: "#bbf7d0", face: "happy" }),
  "demo-isla": demoOutfit({ hairStyle: "waves", hair: "#e8c26a", hairShade: "#b8902e", skin: "#f6d3b8", skinShade: "#dcae8c", shirt: "#7c3aed", shirtTrim: "#ddd6fe", face: "rosy" }),
  "demo-kai": demoOutfit({ hairStyle: "twists", hair: "#1c1410", hairShade: "#0a0705", skin: "#a86e47", skinShade: "#86522f", shirt: "#f97316", shirtTrim: "#fed7aa", face: "determined" }),
};
const DEMO_STATE: FriendsState = {
  code: "PAL-D3MQ",
  enabled: true,
  buildingEnabled: true,
  hasClass: true,
  friends: [
    { friendshipId: "demo-1", studentId: "demo-mia", name: "Demo Mia", status: "friend", friendsSince: "2026-11-02T09:00:00Z", outfit: DEMO_OUTFITS["demo-mia"] },
    { friendshipId: "demo-2", studentId: "demo-leo", name: "Demo Leo", status: "friend", friendsSince: "2026-11-16T09:00:00Z", outfit: DEMO_OUTFITS["demo-leo"] },
    { friendshipId: "demo-3", studentId: "demo-zara", name: "Demo Zara", status: "incoming", outfit: DEMO_OUTFITS["demo-zara"] },
  ],
};
/** The demo class: the demo friends plus two classmates not asked yet. */
const DEMO_CLASSMATES = [
  { studentId: "demo-isla", name: "Demo Isla" },
  { studentId: "demo-kai", name: "Demo Kai" },
];
let demoState = DEMO_STATE;
let demoAsked: readonly string[] = [];

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
export async function fetchClassmates(studentId: string | null, demo: boolean): Promise<Classmate[]> {
  if (demo || !studentId) {
    const known = demoState.friends.map((f): Classmate => ({ studentId: f.studentId, name: f.name, outfit: f.outfit, status: f.status }));
    const others = DEMO_CLASSMATES.map((c): Classmate => ({ ...c, outfit: DEMO_OUTFITS[c.studentId], status: demoAsked.includes(c.studentId) ? "outgoing" : "none" }));
    return [...known, ...others].sort((a, b) => a.name.localeCompare(b.name));
  }
  return call<Classmate[]>("get_classmates_secure", { p_student_id: studentId });
}
/** MY CLASS: ask a classmate (they still say yes). */
export async function sendClassmateRequest(studentId: string | null, demo: boolean, classmateId: string): Promise<SendResult> {
  if (demo || !studentId) {
    const incoming = demoState.friends.find((f) => f.studentId === classmateId && f.status === "incoming");
    if (incoming) { await respondToFriend(studentId, demo, incoming.friendshipId, true); return "accepted"; }
    demoAsked = [...demoAsked, classmateId];
    return "sent";
  }
  return call<SendResult>("send_classmate_request_secure", { p_student_id: studentId, p_classmate_id: classmateId });
}

export async function fetchFriendProfile(studentId: string | null, demo: boolean, friendId: string): Promise<FriendProfile | null> {
  if (demo || !studentId) {
    const friend = demoState.friends.find((f) => f.studentId === friendId && f.status === "friend");
    if (!friend) return null;
    const mia = friend.studentId === "demo-mia";
    return {
      friendshipId: friend.friendshipId, studentId: friend.studentId, name: friend.name, outfit: friend.outfit, friendsSince: friend.friendsSince ?? null,
      sameClass: true, battlesEnabled: true, worldItems: mia ? 46 : 12,
      record: mia ? { won: 3, lost: 2, drawn: 0 } : { won: 0, lost: 0, drawn: 0 },
      recent: mia ? [
        { id: "demo-r1", realm: "number", at: "2026-11-23T04:00:00Z", myScore: 14, friendScore: 11, won: true, draw: false },
        { id: "demo-r2", realm: "space", at: "2026-11-21T04:00:00Z", myScore: 9, friendScore: 12, won: false, draw: false },
        { id: "demo-r3", realm: "measurement", at: "2026-11-19T04:00:00Z", myScore: 13, friendScore: 10, won: true, draw: false },
      ] : [],
    };
  }
  return call<FriendProfile>("get_friend_profile_secure", { p_student_id: studentId, p_friend_id: friendId });
}
/** A friend's own page (app/world/friend). */
export function friendPageHref(friendId: string, preview: boolean) {
  return `/world/friend?id=${encodeURIComponent(friendId)}${preview ? "&teacher_preview=1" : ""}`;
}
/** Their world, to look around (or help build, if they've said yes). */
export function visitHref(friendId: string, preview: boolean) {
  return `/world?visit=${encodeURIComponent(friendId)}${preview ? "&teacher_preview=1" : ""}`;
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

export async function fetchFriendWorld(studentId: string | null, demo: boolean, friendId: string): Promise<FriendWorld | null> {
  if (demo || !studentId) {
    const friend = demoState.friends.find((f) => f.studentId === friendId);
    return friend ? { visitId: demoVisitId(friendId), name: friend.name, outfit: friend.outfit, placements: [], groundTiles: [], canBuild: demoLetsBuild(friendId), owned: [] } : null;
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
export async function fetchChildFriends(studentId: string): Promise<{ enabled: boolean; building: boolean; battles?: boolean; schoolManaged: boolean }> {
  return call("get_child_friends_secure", { p_student_id: studentId });
}
