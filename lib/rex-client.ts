"use client";
// Rex in the hub: reads the explorer's open visit from the server, wakes him after 15 minutes of hub
// time, and tames him. Demo and teacher-preview sessions keep a pretend visit in this tab only
// (add ?rex=now to see him straight away).
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { REX_WAKE_MINUTES, REX_XP } from "@/lib/rex";

export type RexVisit = { id: string; source: "teacher" | "parent" | "timer"; tamed: boolean };
/** away: no Rex. chasing: he's after you. answering: you're facing him. tamed: he waits for a lesson. */
export type RexPhase = "away" | "chasing" | "answering" | "tamed";

const HUB_SECONDS_KEY = (studentId: string) => `reliq:rex:hub-seconds:${studentId}`;
const DEMO_VISIT_KEY = "reliq:rex:demo-visit";

function readNumber(key: string) {
  try { return Number(localStorage.getItem(key) ?? 0) || 0; } catch { return 0; }
}
function writeNumber(key: string, value: number) {
  try { localStorage.setItem(key, String(Math.round(value))); } catch { /* storage blocked: the timer just restarts */ }
}
function readDemoVisit(): RexVisit | null {
  try { const raw = sessionStorage.getItem(DEMO_VISIT_KEY); return raw ? JSON.parse(raw) as RexVisit : null; } catch { return null; }
}
function writeDemoVisit(visit: RexVisit | null) {
  try { if (visit) sessionStorage.setItem(DEMO_VISIT_KEY, JSON.stringify(visit)); else sessionStorage.removeItem(DEMO_VISIT_KEY); } catch { /* tab-only pretend visit */ }
}
const toVisit = (row: { id: string; source: string; tamed: boolean } | undefined): RexVisit | null =>
  row ? { id: row.id, source: row.source as RexVisit["source"], tamed: Boolean(row.tamed) } : null;

/**
 * The explorer's Rex. `active` is false while building, racing or driving: the hub clock pauses then
 * and Rex holds still. Returns the phase, the visit, and what the panels can do.
 */
export function useRexVisit({ studentId, demo, active, wakeNow = false }: { studentId: string | null; demo: boolean; active: boolean; wakeNow?: boolean }) {
  const [visit, setVisit] = useState<RexVisit | null>(null);
  const [answering, setAnswering] = useState(false);
  const [paidXp, setPaidXp] = useState<number | null>(null);
  const waking = useRef(false);

  // Load the open visit (a teacher or parent may have sent him).
  useEffect(() => {
    let cancelled = false;
    if (demo) {
      const saved = readDemoVisit() ?? (wakeNow ? { id: "demo", source: "timer" as const, tamed: false } : null);
      writeDemoVisit(saved);
      setVisit(saved);
      return;
    }
    if (!studentId) return;
    const load = async () => {
      const { data, error } = await supabase.rpc("get_rex_visit_secure", { p_student_id: studentId });
      if (cancelled) return;
      if (error) console.warn("[Rex] couldn't check for a visit:", error.message);
      else setVisit(toVisit((data as RexVisit[] | null)?.[0]));
    };
    void load();
    // A teacher or parent can send him while the explorer is already in the hub: check every 20 seconds,
    // and straight away when the explorer comes back to the tab.
    const poll = setInterval(load, 20_000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; clearInterval(poll); document.removeEventListener("visibilitychange", onVisible); };
  }, [studentId, demo, wakeNow]);

  const wake = useCallback(async () => {
    if (waking.current) return;
    waking.current = true;
    try {
      if (demo) {
        const next = { id: `demo-${Date.now()}`, source: "timer" as const, tamed: false };
        writeDemoVisit(next); setVisit(next);
      } else if (studentId) {
        const { data, error } = await supabase.rpc("wake_rex_secure", { p_student_id: studentId });
        if (!error) setVisit(toVisit((data as RexVisit[] | null)?.[0]));
      }
    } finally { waking.current = false; }
  }, [demo, studentId]);

  // The hub clock: 15 minutes in the hub (while visible and not building) wakes him.
  useEffect(() => {
    if (!active || visit) return;
    const key = HUB_SECONDS_KEY(studentId ?? "demo");
    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const seconds = readNumber(key) + 5;
      if (seconds >= REX_WAKE_MINUTES * 60) { writeNumber(key, 0); void wake(); }
      else writeNumber(key, seconds);
    }, 5_000);
    return () => clearInterval(tick);
  }, [active, visit, studentId, wake]);

  /** Five right: tame him on the server (which pays the XP, up to its daily limit). */
  const tame = useCallback(async (correct: number) => {
    if (!visit) return;
    setAnswering(false);
    if (demo) {
      const next = { ...visit, tamed: true };
      writeDemoVisit(next); setVisit(next); setPaidXp(REX_XP);
      return;
    }
    if (!studentId) return;
    const { data, error } = await supabase.rpc("tame_rex_secure", { p_student_id: studentId, p_visit_id: visit.id, p_correct: correct });
    setVisit({ ...visit, tamed: true });
    setPaidXp(error ? 0 : Number(data ?? 0));
  }, [visit, demo, studentId]);

  /** Off to a lesson. The server sends him away when it's finished; the pretend demo Rex just goes. */
  const leaveForLesson = useCallback(() => {
    if (demo) { writeDemoVisit(null); setVisit(null); }
  }, [demo]);

  const phase: RexPhase = !visit ? "away" : visit.tamed ? "tamed" : answering ? "answering" : "chasing";
  return { phase, visit, paidXp, startAnswering: () => setAnswering(true), stopAnswering: () => setAnswering(false), tame, leaveForLesson, clearPaid: () => setPaidXp(null) };
}
export type RexState = ReturnType<typeof useRexVisit>;

/** A teacher sends Rex to their class or chosen students, or a parent to their child. Returns how many he went to. */
export async function sendRex(target: { classId: string } | { studentIds: string[] } | { studentId: string }): Promise<number> {
  const { data, error } = "classId" in target
    ? await supabase.rpc("send_rex_secure", { p_class_id: target.classId, p_student_id: null })
    : "studentIds" in target
      ? await supabase.rpc("send_rex_to_students_secure", { p_student_ids: target.studentIds })
      : await supabase.rpc("send_rex_secure", { p_class_id: null, p_student_id: target.studentId });
  if (error) throw error;
  return Number(data ?? 0);
}
