"use client";
// Being in the same world at once: everyone in a world (the owner in their hub, and the friends they let in)
// shares where their explorer is, a few times a second, on that world's live channel. The same channel
// carries quick nudges: someone knocked, the owner answered or switched LOOK/BUILD, the world was built on.
// Only positions and first names travel here; who may enter or build is always checked by the server.
import { useCallback, useEffect, useRef, useState } from "react";
import type { AvatarOutfit } from "@/components/avatar/StudentAvatar";
import { supabase } from "@/lib/supabase";

/** Where an explorer is and which way they face (written by the player each frame). */
export type ExplorerPose = { x: number; y: number; z: number; heading: number; moving: boolean };
export const NO_POSE: ExplorerPose = { x: 0, y: 0, z: 0, heading: 0, moving: false };
/** Someone else in this world. */
export type WorldMate = { id: string; name: string; outfit: AvatarOutfit };
/** Nudges on a world's channel: knock (to the owner), answer (to a visitor), layout (the world was built on). */
export type WorldNudge = "knock" | "answer" | "layout";

const POSE_EVERY_MS = 120;
const STILL_POSE_EVERY_MS = 1_000;
const HELLO_EVERY_MS = 3_000;
/** Someone silent this long has gone. */
const GONE_AFTER_MS = 8_000;

export const worldChannelName = (ownerId: string) => `world:${ownerId}`;

type Hello = { from: string; name: string; outfit: AvatarOutfit };
type PoseMessage = { from: string } & ExplorerPose;

/**
 * Joins a world's channel. Sends my pose (from `poseRef`) and who I am; returns everyone else here, their
 * latest poses (a ref, so the scene reads them each frame without re-rendering) and `nudge` to send one.
 */
export function useWorldTogether({ worldId, me, poseRef, enabled, onNudge }: {
  worldId: string | null; me: { id: string; name: string; outfit: AvatarOutfit } | null; poseRef: React.RefObject<ExplorerPose>;
  enabled: boolean; onNudge?: (nudge: WorldNudge, from: string) => void;
}) {
  const [mates, setMates] = useState<WorldMate[]>([]);
  const poses = useRef(new Map<string, ExplorerPose>());
  const seen = useRef(new Map<string, number>());
  const channel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const nudgeHandler = useRef(onNudge);
  const meRef = useRef(me);
  useEffect(() => { nudgeHandler.current = onNudge; meRef.current = me; });
  const myId = me?.id ?? null;

  useEffect(() => {
    if (!enabled || !worldId || !myId) return;
    const live = supabase.channel(worldChannelName(worldId), { config: { broadcast: { self: false } } });
    const knownMates = poses.current, lastSeen = seen.current;
    const touch = (from: string) => lastSeen.set(from, Date.now());
    live.on("broadcast", { event: "hello" }, ({ payload }) => {
      const hello = payload as Hello;
      if (!hello?.from || hello.from === myId) return;
      touch(hello.from);
      setMates((list) => (list.some((m) => m.id === hello.from && m.name === hello.name) ? list : [...list.filter((m) => m.id !== hello.from), { id: hello.from, name: hello.name, outfit: hello.outfit }]));
    });
    live.on("broadcast", { event: "pose" }, ({ payload }) => {
      const { from, ...pose } = payload as PoseMessage;
      if (!from || from === myId) return;
      touch(from);
      knownMates.set(from, pose);
    });
    live.on("broadcast", { event: "bye" }, ({ payload }) => {
      const from = (payload as { from?: string })?.from;
      if (!from) return;
      knownMates.delete(from);
      lastSeen.delete(from);
      setMates((list) => list.filter((m) => m.id !== from));
    });
    live.on("broadcast", { event: "nudge" }, ({ payload }) => {
      const { from, nudge } = payload as { from: string; nudge: WorldNudge };
      if (from !== myId) nudgeHandler.current?.(nudge, from);
    });
    const hello = () => { const who = meRef.current; if (who) void live.send({ type: "broadcast", event: "hello", payload: { from: who.id, name: who.name, outfit: who.outfit } satisfies Hello }); };
    live.subscribe((status) => { if (status === "SUBSCRIBED") hello(); });
    channel.current = live;

    let lastSent = "", lastSentAt = 0;
    const sendPose = window.setInterval(() => {
      const pose = poseRef.current;
      if (!pose) return;
      const key = `${pose.x.toFixed(2)},${pose.y.toFixed(2)},${pose.z.toFixed(2)},${pose.heading.toFixed(2)},${pose.moving}`;
      const now = Date.now();
      if (key === lastSent && now - lastSentAt < STILL_POSE_EVERY_MS) return;
      lastSent = key;
      lastSentAt = now;
      void live.send({ type: "broadcast", event: "pose", payload: { from: myId, ...pose } satisfies PoseMessage });
    }, POSE_EVERY_MS);
    const sayHello = window.setInterval(hello, HELLO_EVERY_MS);
    // Someone who stops sending has gone (closed the tab, lost signal).
    const sweep = window.setInterval(() => {
      const now = Date.now();
      const gone = [...lastSeen].filter(([, at]) => now - at > GONE_AFTER_MS).map(([id]) => id);
      if (!gone.length) return;
      gone.forEach((id) => { lastSeen.delete(id); knownMates.delete(id); });
      setMates((list) => list.filter((m) => !gone.includes(m.id)));
    }, 2_000);

    return () => {
      window.clearInterval(sendPose);
      window.clearInterval(sayHello);
      window.clearInterval(sweep);
      void live.send({ type: "broadcast", event: "bye", payload: { from: myId } });
      channel.current = null;
      knownMates.clear();
      lastSeen.clear();
      setMates([]);
      void supabase.removeChannel(live);
    };
  }, [enabled, worldId, myId, poseRef]);

  const nudge = useCallback((kind: WorldNudge) => { if (myId) void channel.current?.send({ type: "broadcast", event: "nudge", payload: { from: myId, nudge: kind } }); }, [myId]);
  return { mates, poses, nudge };
}

/** A one-off nudge to a world I'm not in yet (a knock, while waiting at the door). */
export function useWorldNudges(worldId: string | null, myId: string | null, enabled: boolean, onNudge: (nudge: WorldNudge) => void) {
  const handler = useRef(onNudge);
  useEffect(() => { handler.current = onNudge; });
  const channel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (!enabled || !worldId || !myId) return;
    const live = supabase.channel(worldChannelName(worldId), { config: { broadcast: { self: false } } });
    live.on("broadcast", { event: "nudge" }, ({ payload }) => {
      const { from, nudge } = payload as { from: string; nudge: WorldNudge };
      if (from !== myId) handler.current(nudge);
    });
    live.subscribe();
    channel.current = live;
    return () => { channel.current = null; void supabase.removeChannel(live); };
  }, [worldId, myId, enabled]);
  return useCallback((kind: WorldNudge) => { if (myId) void channel.current?.send({ type: "broadcast", event: "nudge", payload: { from: myId, nudge: kind } }); }, [myId]);
}

/**
 * The pretend friend in demo and teacher preview: walks slow loops near you, so the review shows explorers
 * sharing a world. Writes into `poses` like a real friend would.
 */
export function useDemoMate(mate: WorldMate | null, poseRef: React.RefObject<ExplorerPose>, poses: React.RefObject<Map<string, ExplorerPose>>) {
  useEffect(() => {
    if (!mate) return;
    const map = poses.current;
    const start = poseRef.current ?? NO_POSE;
    const centre = { x: start.x + 3, z: start.z - 3 };
    let angle = 0;
    const walk = window.setInterval(() => {
      angle += 0.035;
      const me = poseRef.current ?? NO_POSE;
      map.set(mate.id, { x: centre.x + Math.cos(angle) * 3, y: me.y, z: centre.z + Math.sin(angle) * 3, heading: Math.atan2(-Math.sin(angle), Math.cos(angle)), moving: true });
    }, 100);
    return () => { window.clearInterval(walk); map.delete(mate.id); };
  }, [mate, poseRef, poses]);
}
