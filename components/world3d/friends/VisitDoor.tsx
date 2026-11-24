"use client";
// Knock to come in: the visitor waiting at the door (KnockDoor), the owner answering (KnockToast), the owner's
// card while friends are over (VisitorsCard), and the visitor told the visit is over (VisitOverCard).
import { DoorOpen, Eye, Hammer, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { KNOCK_CHECK_MS, endVisit, knock, visitStatus, type KnockAnswer, type VisitGuest } from "@/lib/friend-visits";
import type { FriendOutfit } from "@/lib/friends";
import { useWorldNudges } from "@/lib/world-together";
import { FriendFace, GOLD, GREEN, HEADING, LILAC, VIOLET, panelStyle, pill, stopHub } from "./FriendBits";

const overlay: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 90, display: "grid", placeItems: "center", background: "rgba(8,5,18,.6)", padding: 16 };
const toastTop = "max(172px, calc(env(safe-area-inset-top) + 164px))";
const choice = (background: string, color: string): React.CSSProperties => ({ ...pill(background, color), flexDirection: "column", alignItems: "flex-start", textAlign: "left", whiteSpace: "normal", padding: "11px 13px", width: "100%" });
const choiceNote: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: 0, fontSize: 12, opacity: .9 };

type DoorState = "knocking" | "offline" | "off" | "declined" | "expired" | "error";
const DOOR_MESSAGES: Record<Exclude<DoorState, "knocking">, (name: string) => string> = {
  offline: (name) => `${name}'s not online right now. Try again when they're in the hub.`,
  off: (name) => `You can't visit ${name} right now.`,
  declined: (name) => `${name} said not now. Maybe next time!`,
  expired: (name) => `${name} didn't answer. They might be busy.`,
  error: () => "That didn't work just now. Try again in a moment.",
};

/** The visitor knocks and waits. `onIn` once the friend lets them in. */
export function KnockDoor({ friend, studentId, demo, onIn, onClose }: { friend: { studentId: string; name: string; outfit?: FriendOutfit }; studentId: string | null; demo: boolean; onIn: () => void; onClose: () => void }) {
  const [door, setDoor] = useState<DoorState>("knocking");
  const [visitId, setVisitId] = useState<string | null>(null);
  const entered = useRef(false);
  const enter = useRef(onIn);
  useEffect(() => { enter.current = onIn; });
  const check = useRef<() => void>(() => undefined);
  const nudge = useWorldNudges(demo ? null : friend.studentId, studentId, door === "knocking", (kind) => { if (kind === "answer") check.current(); });

  useEffect(() => {
    let cancelled = false;
    void knock(studentId, demo, friend.studentId).then((knocked) => {
      if (cancelled) return;
      if (knocked.result === "offline" || knocked.result === "off") { setDoor(knocked.result); return; }
      setVisitId(knocked.visitId ?? null);
      if (knocked.result === "inside") { entered.current = true; enter.current(); }
    }).catch(() => { if (!cancelled) setDoor("error"); });
    return () => { cancelled = true; };
    // Knock once when the door opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Ring the bell (the owner's hub checks straight away), then wait for the answer.
  useEffect(() => {
    if (!visitId || door !== "knocking") return;
    const ring = window.setTimeout(() => nudge("knock"), 600);
    check.current = () => void visitStatus(studentId, demo, visitId).then((status) => {
      if (entered.current) return;
      if (status.status === "inside") { entered.current = true; enter.current(); }
      else if (status.status === "declined" || status.status === "expired" || status.status === "ended") setDoor(status.status === "declined" ? "declined" : "expired");
    }).catch(() => undefined);
    const poll = window.setInterval(() => check.current(), KNOCK_CHECK_MS);
    return () => { window.clearTimeout(ring); window.clearInterval(poll); };
  }, [visitId, door, studentId, demo, nudge]);

  const cancel = () => { if (visitId && door === "knocking") void endVisit(studentId, demo, visitId).catch(() => undefined); onClose(); };
  return (
    <div style={overlay} {...stopHub} role="dialog" aria-label={`Knocking on ${friend.name}'s door`}>
      <div style={{ ...panelStyle, width: "min(380px, 100%)", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <FriendFace outfit={friend.outfit} size={84} online={door === "knocking"} />
        {door === "knocking" ? <>
          <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 21 }}>Knocking on {friend.name}&apos;s door…</span>
          <span style={{ fontSize: 14, opacity: .8 }}>{friend.name} needs to let you in.</span>
          <button type="button" onClick={cancel} style={pill("rgba(255,255,255,.12)")}>CANCEL</button>
        </> : <>
          <span role="status" style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.4 }}>{DOOR_MESSAGES[door](friend.name)}</span>
          <button type="button" onClick={onClose} style={pill(VIOLET)}>OK</button>
        </>}
      </div>
    </div>
  );
}

/** The owner's door: a friend knocking. BUILD only shows where building together is allowed for both. */
export function KnockToast({ guest, buildingEnabled, busy, onAnswer }: { guest: VisitGuest; buildingEnabled: boolean; busy: boolean; onAnswer: (answer: KnockAnswer) => void }) {
  return (
    <div role="dialog" aria-label={`${guest.name} is knocking`} {...stopHub} style={{ ...panelStyle, position: "absolute", left: "50%", transform: "translateX(-50%)", top: toastTop, width: "min(400px, calc(100vw - 32px))", padding: 16, display: "flex", flexDirection: "column", gap: 10, zIndex: 72, borderColor: GOLD }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FriendFace outfit={guest.outfit} size={50} online />
        <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}><DoorOpen size={20} color={GOLD} aria-hidden="true" />{guest.name} is knocking!</span>
      </div>
      <button type="button" disabled={busy} onClick={() => onAnswer("look")} style={choice(LILAC, "#2a1050")}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Eye size={16} aria-hidden="true" />LET IN TO LOOK</span><span style={choiceNote}>{guest.name} walks around. Nothing changes.</span></button>
      {buildingEnabled && guest.canBuild ? <button type="button" disabled={busy} onClick={() => onAnswer("build")} style={choice(GREEN, "#103a17")}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Hammer size={16} aria-hidden="true" />LET IN TO BUILD</span><span style={choiceNote}>{guest.name} can build while you&apos;re here. Keep or undo it after.</span></button> : null}
      <button type="button" disabled={busy} onClick={() => onAnswer("no")} style={pill("rgba(255,255,255,.12)")}>NOT NOW</button>
    </div>
  );
}

/** The owner's card while friends are over: LOOK or BUILD for each, and SEND HOME. */
export function VisitorsCard({ visitors, buildingEnabled, busy, onSetBuild, onSendHome }: { visitors: readonly VisitGuest[]; buildingEnabled: boolean; busy: boolean; onSetBuild: (guest: VisitGuest, canBuild: boolean) => void; onSendHome: (guest: VisitGuest) => void }) {
  const segment = (on: boolean, colour: string): React.CSSProperties => ({ ...pill(on ? `${colour}2e` : "rgba(255,255,255,.06)", on ? colour : "#fff"), boxShadow: "none", border: `2px solid ${on ? colour : "transparent"}`, flex: 1, padding: "6px 4px", fontSize: 11 });
  return (
    <div role="region" aria-label="Friends visiting your world" {...stopHub} style={{ ...panelStyle, position: "absolute", left: "max(16px, 2vw)", top: "max(124px, calc(env(safe-area-inset-top) + 116px))", width: "min(250px, calc(100vw - 32px))", maxHeight: "40dvh", overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10, zIndex: 58 }}>
      <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 12, letterSpacing: ".1em", color: LILAC }}>VISITING YOUR WORLD</span>
      {visitors.map((guest) => (
        <div key={guest.visitId} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><FriendFace outfit={guest.outfit} size={32} online /><span style={{ fontWeight: 800, fontSize: 14 }}>{guest.name}</span></div>
          <div role="radiogroup" aria-label={`What ${guest.name} can do`} style={{ display: "flex", gap: 6 }}>
            <button type="button" role="radio" aria-checked={!guest.canBuild} disabled={busy || !guest.canBuild} onClick={() => onSetBuild(guest, false)} style={segment(!guest.canBuild, LILAC)}><Eye size={13} aria-hidden="true" />LOOK</button>
            <button type="button" role="radio" aria-checked={guest.canBuild} disabled={busy || guest.canBuild || !buildingEnabled} onClick={() => onSetBuild(guest, true)} style={{ ...segment(guest.canBuild, GREEN), opacity: buildingEnabled ? 1 : .45 }}><Hammer size={13} aria-hidden="true" />BUILD</button>
          </div>
          <button type="button" disabled={busy} onClick={() => onSendHome(guest)} style={{ ...pill("rgba(255,255,255,.1)"), boxShadow: "none", fontSize: 11, padding: "6px 8px" }}>SEND {guest.name.toUpperCase()} HOME</button>
        </div>
      ))}
    </div>
  );
}

/** The visitor's visit is over (the owner left or sent them home). */
export function VisitOverCard({ message, onGoHome }: { message: string; onGoHome: () => void }) {
  return (
    <div style={overlay} {...stopHub} role="dialog" aria-label="Visit over">
      <div style={{ ...panelStyle, width: "min(360px, 100%)", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <span role="status" style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.4 }}>{message}</span>
        <button type="button" onClick={onGoHome} style={pill(VIOLET)}><Home size={16} aria-hidden="true" />GO HOME</button>
      </div>
    </div>
  );
}
