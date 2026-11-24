"use client";
// Into the Battle Arena (/world/battle?id=…): which battle comes from the link (lib/battles.ts battleRoomHref),
// who you are from this device's explorer, and your level in the battle's realm from the server. The server
// checks it's really your battle when your score goes in. Demo and teacher-preview sessions play a pretend battle.
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { readBattleToPlay } from "@/lib/battles";
import { rexLevelFrom } from "@/lib/rex";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

const BattleRoom = dynamic(() => import("@/components/world3d/battle/BattleRoom").then((m) => m.BattleRoom), { ssr: false, loading: () => <Entering /> });

function Entering() {
  return <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "#07050f", color: "#e9b8fa", fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, letterSpacing: ".12em" }}>ENTERING THE BATTLE ARENA…</div>;
}

export default function BattleRoomEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const [setup] = useState(() => {
    const battle = readBattleToPlay(new URLSearchParams(params.toString()));
    const demo = params.get("teacher_preview") === "1" || isDemoPreviewMode();
    return { battle, demo, student: getActiveStudentProfile() };
  });
  const [level, setLevel] = useState<number | null>(null);
  const { battle, demo, student } = setup;

  useEffect(() => {
    if (!battle) { router.replace(demo ? "/world?teacher_preview=1" : "/world"); return; }
    if (!demo && !student?.studentId) { router.replace("/login"); return; }
    let cancelled = false;
    const done = (year?: string | null) => { if (!cancelled) setLevel(rexLevelFrom(year, student?.yearLevel)); };
    if (demo || !student?.studentId) { const timer = window.setTimeout(() => done(null), 0); return () => { cancelled = true; window.clearTimeout(timer); }; }
    void restoreStudentStateFromServer(student.studentId, battle.realm).then((restored) => done(restored.progress?.year)).catch(() => done(null));
    return () => { cancelled = true; };
  }, [battle, demo, student, router]);

  if (!battle || level === null) return <Entering />;
  const myName = student?.displayName?.split(" ")[0] || "You";
  return <BattleRoom battle={battle} level={level} studentId={demo ? null : student?.studentId ?? null} myName={myName} demo={demo} />;
}
