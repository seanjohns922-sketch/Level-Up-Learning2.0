"use client";
// Knock to come in (see the friend-visits migration): a friend knocks, the owner (in the hub) lets them in to
// LOOK or BUILD, or says not now. Building only while the owner is there. The server checks every step;
// demo and teacher-preview sessions get a pretend version that lives in this tab.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FriendOutfit } from "@/lib/friends";

/** How often the owner's hub and a visitor say "still here" (the server ends a visit after 45 quiet seconds). */
export const VISIT_HEARTBEAT_MS = 15_000;
/** How often a knocking visitor checks for an answer (a knock runs out after 60 seconds). */
export const KNOCK_CHECK_MS = 2_500;

export type VisitGuest = { visitId: string; studentId: string; name: string; outfit?: FriendOutfit; canBuild: boolean };
/** The owner's view: who's knocking and who's inside. `canBuild` on a knock: building together is allowed for them. */
export type HostState = { buildingEnabled: boolean; knocks: VisitGuest[]; visitors: VisitGuest[] };
export type KnockResult = { result: "knocking" | "inside" | "offline" | "off"; visitId?: string };
export type VisitStatus = { status: "knocking" | "inside" | "declined" | "expired" | "ended"; canBuild: boolean };
export type KnockAnswer = "look" | "build" | "no";

async function call<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}

// The pretend version: Demo Leo knocks once, a little after the hub opens; demo friends let you in after a moment.
const DEMO_KNOCK_AFTER_MS = 10_000;
const DEMO_ANSWER_AFTER_MS = 2_000;
const demo = {
  openedAt: 0,
  leo: "unknocked" as "unknocked" | "knocking" | "inside" | "gone",
  leoCanBuild: false,
  knocks: new Map<string, { friendId: string; at: number; ended: boolean }>(),
};
const DEMO_LEO = { visitId: "demo-visit-leo", studentId: "demo-leo", name: "Demo Leo" };

const DEMO_KNOCK_PREFIX = "demo-knock-";
/** A pretend visit to a demo friend (the same id after a page reload, so the visit carries on). */
export const demoVisitId = (friendId: string) => `${DEMO_KNOCK_PREFIX}${friendId}`;
/** Whether a demo friend lets you build (Demo Mia does, the others let you look). */
export const demoLetsBuild = (friendId: string) => friendId === "demo-mia";

export async function hostHeartbeat(studentId: string | null, isDemo: boolean): Promise<HostState> {
  if (isDemo || !studentId) {
    const now = Date.now();
    if (!demo.openedAt) demo.openedAt = now;
    if (demo.leo === "unknocked" && now - demo.openedAt > DEMO_KNOCK_AFTER_MS) demo.leo = "knocking";
    const leo: VisitGuest = { ...DEMO_LEO, canBuild: demo.leo === "inside" ? demo.leoCanBuild : true };
    return { buildingEnabled: true, knocks: demo.leo === "knocking" ? [leo] : [], visitors: demo.leo === "inside" ? [leo] : [] };
  }
  return call<HostState>("host_heartbeat_secure", { p_student_id: studentId });
}
export async function hostLeave(studentId: string | null, isDemo: boolean) {
  if (isDemo || !studentId) return;
  await call("host_leave_secure", { p_student_id: studentId });
}
export async function answerKnock(studentId: string | null, isDemo: boolean, visitId: string, answer: KnockAnswer) {
  if (isDemo || !studentId) { demo.leo = answer === "no" ? "gone" : "inside"; demo.leoCanBuild = answer === "build"; return; }
  await call("answer_knock_secure", { p_student_id: studentId, p_visit_id: visitId, p_answer: answer });
}
export async function setVisitBuild(studentId: string | null, isDemo: boolean, visitId: string, canBuild: boolean) {
  if (isDemo || !studentId) { demo.leoCanBuild = canBuild; return; }
  await call("set_visit_build_secure", { p_student_id: studentId, p_visit_id: visitId, p_can_build: canBuild });
}

export async function knock(studentId: string | null, isDemo: boolean, ownerId: string): Promise<KnockResult> {
  if (isDemo || !studentId) {
    const visitId = demoVisitId(ownerId);
    demo.knocks.set(visitId, { friendId: ownerId, at: Date.now(), ended: false });
    return { result: "knocking", visitId };
  }
  return call<KnockResult>("knock_secure", { p_student_id: studentId, p_owner_id: ownerId });
}
export async function visitStatus(studentId: string | null, isDemo: boolean, visitId: string): Promise<VisitStatus> {
  if (isDemo || !studentId) {
    const knocked = demo.knocks.get(visitId) ?? { friendId: visitId.replace(DEMO_KNOCK_PREFIX, ""), at: 0, ended: false };
    if (knocked.ended) return { status: "ended", canBuild: false };
    return Date.now() - knocked.at < DEMO_ANSWER_AFTER_MS ? { status: "knocking", canBuild: false } : { status: "inside", canBuild: demoLetsBuild(knocked.friendId) };
  }
  return call<VisitStatus>("visit_status_secure", { p_student_id: studentId, p_visit_id: visitId });
}
/** GO HOME, SEND HOME, or CANCEL while knocking. */
export async function endVisit(studentId: string | null, isDemo: boolean, visitId: string) {
  if (isDemo || !studentId) {
    if (visitId === DEMO_LEO.visitId) demo.leo = "gone";
    const knocked = demo.knocks.get(visitId);
    if (knocked) demo.knocks.set(visitId, { ...knocked, ended: true });
    return;
  }
  await call("end_visit_secure", { p_student_id: studentId, p_visit_id: visitId });
}

/**
 * The owner's side while in their own hub: says "I'm here" every 15 seconds (so friends can knock), shows
 * knocks and visitors, and ends every visit when the owner leaves the hub. `refresh` checks at once (when a
 * friend's knock nudge arrives).
 */
export function useHostVisits(studentId: string | null, isDemo: boolean, enabled: boolean) {
  const [state, setState] = useState<HostState>({ buildingEnabled: false, knocks: [], visitors: [] });
  const refresh = useCallback(() => { void hostHeartbeat(studentId, isDemo).then(setState).catch(() => undefined); }, [studentId, isDemo]);
  useEffect(() => {
    if (!enabled) return;
    const first = window.setTimeout(refresh, 0);
    // The demo's pretend knock arrives sooner than a heartbeat would show it.
    const beat = window.setInterval(refresh, isDemo ? 2_000 : VISIT_HEARTBEAT_MS);
    const leave = () => void hostLeave(studentId, isDemo).catch(() => undefined);
    window.addEventListener("pagehide", leave);
    return () => { window.clearTimeout(first); window.clearInterval(beat); window.removeEventListener("pagehide", leave); leave(); };
  }, [enabled, refresh, studentId, isDemo]);
  return { ...state, refresh };
}
