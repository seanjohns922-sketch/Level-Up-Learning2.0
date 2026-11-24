"use client";
// Friend battles: challenge a friend, pick a realm, 20 quick questions each at your own level. LIVE when
// your friend is online (both play at once and see the tug of war move), otherwise TAKE TURNS. The server
// keeps the battles, scores and XP (see the battles migration); demo and teacher-preview sessions play a
// pretend battle against a friend who answers as they go.
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BATTLE_REALMS, type BattleRealm } from "@/lib/battle-questions";

/** XP set by the server (shown here): for playing, and for winning. */
export const BATTLE_PLAY_XP = 15;
export const BATTLE_WIN_XP = 60;
/** How long a friend has to play their turn. */
export const BATTLE_TURN_DAYS = 2;

export type BattleMode = "live" | "turns";
export type Battle = {
  id: string; realm: BattleRealm; mode: BattleMode;
  status: "invited" | "active" | "finished" | "declined" | "expired";
  seed: number; iChallenged: boolean; friendId: string; friendName: string;
  myScore: number | null; friendScore: number | null; won: boolean | null; draw: boolean;
  expiresAt: string; createdAt: string;
};
/** A battle about to be played: which, against whom. */
export type BattleToPlay = { id: string; seed: number; realm: BattleRealm; mode: BattleMode; friendId: string; friendName: string };

export function readBattleRealm(value: string | null | undefined): BattleRealm | undefined {
  return BATTLE_REALMS.find((realm) => realm === value);
}
/** The Battle Arena room for a battle (app/world/battle). The server checks it's really your battle when you finish. */
export function battleRoomHref(play: BattleToPlay, preview: boolean) {
  const params = new URLSearchParams({ id: play.id, seed: String(play.seed), realm: play.realm, mode: play.mode, friend: play.friendId, name: play.friendName });
  if (preview) params.set("teacher_preview", "1");
  return `/world/battle?${params}`;
}
export function readBattleToPlay(params: URLSearchParams): BattleToPlay | null {
  const realm = readBattleRealm(params.get("realm")), seed = Number(params.get("seed")), mode = params.get("mode");
  const id = params.get("id"), friendId = params.get("friend"), friendName = params.get("name");
  if (!realm || !Number.isFinite(seed) || (mode !== "live" && mode !== "turns") || !id || !friendId || !friendName) return null;
  return { id, seed, realm, mode, friendId, friendName };
}
/** Back to the hub's Battles panel, with the same friend and realm picked: REMATCH. */
export function rematchHref(play: BattleToPlay, preview: boolean) {
  const params = new URLSearchParams({ battles: "1", friend: play.friendId, realm: play.realm });
  if (preview) params.set("teacher_preview", "1");
  return `/world?${params}`;
}

export type BattleResult = { status: string; xp: number; myScore?: number; friendScore?: number | null; won?: boolean | null; draw?: boolean };

async function call<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}

let demoBattles: Battle[] = [];
export async function fetchBattles(studentId: string | null, demo: boolean): Promise<Battle[]> {
  if (demo || !studentId) return demoBattles;
  return call<Battle[]>("get_battles_secure", { p_student_id: studentId });
}
export async function createBattle(studentId: string | null, demo: boolean, friend: { id: string; name: string }, realm: BattleRealm, mode: BattleMode): Promise<{ id: string; seed: number; status: string }> {
  if (demo || !studentId) {
    const battle: Battle = { id: `demo-${Date.now()}`, realm, mode, status: "active", seed: Math.floor(Math.random() * 1e9), iChallenged: true, friendId: friend.id, friendName: friend.name, myScore: null, friendScore: null, won: null, draw: false, expiresAt: new Date(Date.now() + 864e5).toISOString(), createdAt: new Date().toISOString() };
    demoBattles = [battle, ...demoBattles];
    return { id: battle.id, seed: battle.seed, status: "active" };
  }
  return call("create_battle_secure", { p_student_id: studentId, p_friend_id: friend.id, p_realm: realm, p_mode: mode });
}
export async function respondToBattle(studentId: string | null, demo: boolean, battleId: string, accept: boolean) {
  if (demo || !studentId) return null;
  return call<{ id: string; seed: number; status: string } | null>("respond_battle_secure", { p_student_id: studentId, p_battle_id: battleId, p_accept: accept });
}
export async function submitBattleScore(studentId: string | null, demo: boolean, battleId: string, correct: number, level: number, demoFriendScore?: number): Promise<BattleResult> {
  if (demo || !studentId) {
    const friendScore = demoFriendScore ?? Math.max(0, Math.min(20, correct + Math.round(Math.random() * 6 - 3)));
    const won = correct > friendScore, draw = correct === friendScore;
    demoBattles = demoBattles.map((b) => (b.id === battleId ? { ...b, status: "finished", myScore: correct, friendScore, won, draw } : b));
    return { status: "finished", xp: BATTLE_PLAY_XP + (won ? BATTLE_WIN_XP : 0), myScore: correct, friendScore, won, draw };
  }
  return call<BattleResult>("submit_battle_score_secure", { p_student_id: studentId, p_battle_id: battleId, p_correct: correct, p_level: level });
}
export async function setClassBattles(classId: string, enabled: boolean) {
  await call("set_class_battles_secure", { p_class_id: classId, p_enabled: enabled });
}
export async function setChildBattles(studentId: string, enabled: boolean) {
  await call("set_child_battles_secure", { p_student_id: studentId, p_enabled: enabled });
}

/** The tug of war: where the clash point sits, from -1 (your side pushed all the way) to 1 (theirs). */
export function clashPoint(myCorrect: number, friendCorrect: number) {
  const lead = myCorrect - friendCorrect;
  return Math.max(-1, Math.min(1, lead / 6));
}

/**
 * Who's online: each explorer in the hub is present on their own channel; we look in on our friends'
 * channels to see if they're there. Channels are named by student id, which only friends know.
 */
export function useOnlineFriends(studentId: string | null, friendIds: readonly string[], enabled: boolean) {
  const [online, setOnline] = useState<ReadonlySet<string>>(() => new Set());
  const key = friendIds.join(",");
  useEffect(() => {
    if (!enabled || !studentId) return;
    const mine = supabase.channel(`online:${studentId}`, { config: { presence: { key: studentId } } });
    mine.subscribe((status) => { if (status === "SUBSCRIBED") void mine.track({ at: Date.now() }); });
    const theirs = friendIds.map((friendId) => {
      const channel = supabase.channel(`online:${friendId}`, { config: { presence: { key: studentId } } });
      channel.on("presence", { event: "sync" }, () => {
        const here = Object.keys(channel.presenceState()).includes(friendId);
        setOnline((current) => { const next = new Set(current); if (here) next.add(friendId); else next.delete(friendId); return next; });
      });
      channel.subscribe();
      return channel;
    });
    return () => { void supabase.removeChannel(mine); theirs.forEach((channel) => void supabase.removeChannel(channel)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` stands for the friend list
  }, [studentId, key, enabled]);
  return online;
}

/** A live battle's scores, shared as both friends play. Sends mine; returns my friend's latest. */
export function useLiveBattle(battleId: string | null, studentId: string | null, myCorrect: number, myDone: boolean) {
  const [friend, setFriend] = useState<{ correct: number; done: boolean }>({ correct: 0, done: false });
  const channel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (!battleId || !studentId) return;
    const live = supabase.channel(`battle:${battleId}`, { config: { broadcast: { self: false } } });
    live.on("broadcast", { event: "score" }, ({ payload }) => {
      const message = payload as { from: string; correct: number; done: boolean };
      if (message.from !== studentId) setFriend({ correct: message.correct, done: message.done });
    });
    live.subscribe();
    channel.current = live;
    return () => { channel.current = null; void supabase.removeChannel(live); };
  }, [battleId, studentId]);
  useEffect(() => {
    void channel.current?.send({ type: "broadcast", event: "score", payload: { from: studentId, correct: myCorrect, done: myDone } });
  }, [myCorrect, myDone, studentId]);
  return friend;
}
