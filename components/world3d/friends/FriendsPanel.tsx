"use client";
// The Friends panel in the hub: your friends (VISIT, and the switch that lets each one help build in your
// world), requests to accept, and adding a friend with their friend code. No chat anywhere.
import { Check, RefreshCw, Swords, UserMinus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  FRIEND_CODE_PATTERN, fetchFriends, newFriendCode, normaliseFriendCode, removeFriend, respondToFriend, sendFriendRequest, setFriendCanBuild,
  type Friend, type FriendsState, type SendResult,
} from "@/lib/friends";

const VIOLET = "#C94DF2";
const panel: React.CSSProperties = { background: "rgba(20,14,40,.96)", color: "#fff", borderRadius: 22, border: `2px solid ${VIOLET}99`, boxShadow: "0 18px 50px rgba(0,0,0,.45)", fontFamily: "Inter, system-ui, sans-serif" };
const pill = (background: string, color = "#fff"): React.CSSProperties => ({ border: 0, borderRadius: 12, padding: "9px 14px", background, color, fontWeight: 900, fontSize: 13, fontFamily: "Montserrat, Inter, sans-serif", letterSpacing: ".04em", cursor: "pointer", whiteSpace: "nowrap" });
const COLOURS = ["#7dff8a", "#ffcf4a", "#5fd0ff", "#ff9ac8", "#ffd27a", "#b8f0a0"];
const colourFor = (name: string) => COLOURS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLOURS.length];

const SEND_MESSAGES: Record<SendResult, string> = {
  sent: "Friend request sent! They need to accept it.",
  accepted: "You're friends now!",
  already: "You've already asked, or you're already friends.",
  not_found: "No explorer has that friend code. Check it and try again.",
  self: "That's your own friend code!",
  off: "Friends are switched off for you right now.",
};

/** A friend's initial: from their own name (so "Demo Mia" shows M). */
export const initialOf = (name: string) => (name.trim().split(/\s+/).pop() ?? "?").slice(0, 1).toUpperCase();

function Avatar({ name }: { name: string }) {
  return <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 99, display: "grid", placeItems: "center", fontWeight: 900, color: "#1f1236", background: colourFor(name), flex: "none" }}>{initialOf(name)}</span>;
}

function Switch({ on, label, onChange, disabled }: { on: boolean; label: string; onChange: (on: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => onChange(!on)} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, background: "transparent", color: "#fff", fontWeight: 800, fontSize: 13, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, padding: 0 }}>
      <span aria-hidden="true" style={{ width: 36, height: 21, borderRadius: 99, background: on ? "#7dff8a" : "rgba(255,255,255,.25)", position: "relative", flex: "none" }}>
        <span style={{ position: "absolute", top: 2.5, left: on ? 17 : 2.5, width: 16, height: 16, borderRadius: 99, background: on ? "#103a17" : "#fff", transition: "left .15s" }} />
      </span>
      {label}
    </button>
  );
}

export function FriendsPanel({ studentId, demo, onVisit, onChallenge, onClose }: { studentId: string | null; demo: boolean; onVisit: (friend: Friend) => void; onChallenge?: (friend: Friend) => void; onClose: () => void }) {
  const [state, setState] = useState<FriendsState | null>(null);
  const [tab, setTab] = useState<"friends" | "requests" | "add">("friends");
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setState(await fetchFriends(studentId, demo)); }
    catch { setMessage("Friends couldn't load just now. Try again in a moment."); }
  }, [studentId, demo]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const act = async (job: () => Promise<unknown>) => {
    setBusy(true);
    try { await job(); await load(); } catch { setMessage("That didn't work just now. Try again in a moment."); }
    setBusy(false);
  };
  const friends = state?.friends.filter((f) => f.status === "friend") ?? [];
  const requests = state?.friends.filter((f) => f.status !== "friend") ?? [];
  const code = normaliseFriendCode(typed);

  return (
    <div role="dialog" aria-label="Friends" onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} onKeyUp={(event) => event.stopPropagation()}
      style={{ ...panel, position: "absolute", right: "max(16px, 3vw)", top: "max(84px, calc(env(safe-area-inset-top) + 76px))", width: "min(400px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 120px)", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12, zIndex: 70 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: 22 }}>Friends</h2>
        <button type="button" onClick={onClose} aria-label="Close friends" style={{ ...pill("rgba(255,255,255,.12)"), padding: 8, display: "grid", placeItems: "center" }}><X size={18} /></button>
      </div>
      {state && !state.enabled ? <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>Friends are switched off for you right now. Ask your teacher or grown-up.</p> : null}
      <div role="tablist" style={{ display: "flex", gap: 6, background: "rgba(255,255,255,.08)", borderRadius: 999, padding: 4 }}>
        {([["friends", `Friends (${friends.length})`], ["requests", `Requests${requests.some((f) => f.status === "incoming") ? ` (${requests.filter((f) => f.status === "incoming").length})` : ""}`], ["add", "Add"]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setMessage(null); }}
            style={{ flex: 1, border: 0, borderRadius: 999, padding: "8px 4px", fontWeight: 800, fontSize: 13, cursor: "pointer", background: tab === id ? "#fff" : "transparent", color: tab === id ? "#1f1236" : "#fff" }}>{label}</button>
        ))}
      </div>

      {tab === "friends" ? (friends.length ? friends.map((friend) => (
        <div key={friend.friendshipId} style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={friend.name} />
            <span style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 16 }}>{friend.name}<small style={{ display: "block", fontWeight: 600, fontSize: 12, opacity: .7 }}>{friend.iCanBuild ? "You can help build in their world" : "You can visit their world"}</small></span>
            {onChallenge ? <button type="button" onClick={() => onChallenge(friend)} aria-label={`Battle ${friend.name}`} style={{ ...pill("#ffcf4a", "#3a2a00"), display: "inline-flex", alignItems: "center", gap: 6 }}><Swords size={16} aria-hidden="true" />BATTLE</button> : null}
            <button type="button" onClick={() => onVisit(friend)} style={pill(VIOLET)}>VISIT</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingLeft: 50 }}>
            <Switch on={friend.theyCanBuild} disabled={busy || !state?.buildingEnabled} label="Can help build in my world" onChange={(on) => void act(() => setFriendCanBuild(studentId, demo, friend.friendshipId, on))} />
            {confirmRemove === friend.friendshipId
              ? <span style={{ display: "flex", gap: 6 }}><button type="button" onClick={() => void act(() => removeFriend(studentId, demo, friend.friendshipId))} style={pill("#e5484d")}>REMOVE</button><button type="button" onClick={() => setConfirmRemove(null)} style={pill("rgba(255,255,255,.12)")}>KEEP</button></span>
              : <button type="button" onClick={() => setConfirmRemove(friend.friendshipId)} aria-label={`Remove ${friend.name} as a friend`} style={{ ...pill("transparent"), padding: 6, opacity: .7 }}><UserMinus size={16} /></button>}
          </div>
        </div>
      )) : <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>No friends yet. Tap <b>Add</b> and type a friend&apos;s friend code, or share yours.</p>) : null}

      {tab === "requests" ? (requests.length ? requests.map((friend) => (
        <div key={friend.friendshipId} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "10px 12px" }}>
          <Avatar name={friend.name} />
          <span style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 15 }}>{friend.status === "incoming" ? `${friend.name} wants to be friends` : `Waiting for ${friend.name}`}</span>
          {friend.status === "incoming" ? <>
            <button type="button" disabled={busy} onClick={() => void act(() => respondToFriend(studentId, demo, friend.friendshipId, true))} aria-label={`Accept ${friend.name}`} style={pill("#7dff8a", "#103a17")}><Check size={16} /></button>
            <button type="button" disabled={busy} onClick={() => void act(() => respondToFriend(studentId, demo, friend.friendshipId, false))} aria-label={`Say no to ${friend.name}`} style={pill("rgba(255,255,255,.12)")}><X size={16} /></button>
          </> : <button type="button" disabled={busy} onClick={() => void act(() => respondToFriend(studentId, demo, friend.friendshipId, false))} style={pill("rgba(255,255,255,.12)")}>CANCEL</button>}
        </div>
      )) : <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>No friend requests right now.</p>) : null}

      {tab === "add" ? <>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: "#e9b8fa" }}>YOUR FRIEND CODE</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 30, letterSpacing: ".08em" }}>{state?.code ?? "…"}</span>
            <button type="button" disabled={busy} onClick={() => void act(() => newFriendCode(studentId, demo))} style={{ ...pill("rgba(255,255,255,.12)"), display: "inline-flex", alignItems: "center", gap: 6 }}><RefreshCw size={14} />NEW CODE</button>
          </div>
          <span style={{ fontSize: 12, opacity: .7 }}>Tell a friend this code so they can add you. A new code stops the old one working.</span>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); if (!FRIEND_CODE_PATTERN.test(code)) { setMessage("A friend code looks like PAL-7K2P."); return; } void (async () => { setBusy(true); try { const result = await sendFriendRequest(studentId, demo, code); setMessage(SEND_MESSAGES[result]); if (result === "sent" || result === "accepted") setTyped(""); await load(); } catch { setMessage("That didn't work just now. Try again in a moment."); } setBusy(false); })(); }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="friend-code" style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: "#e9b8fa" }}>ADD A FRIEND: TYPE THEIR FRIEND CODE</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="friend-code" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="PAL-7K2P" autoComplete="off" autoCapitalize="characters" maxLength={9}
              style={{ flex: 1, minWidth: 0, height: 50, borderRadius: 12, border: 0, background: "#fff", color: "#1f2328", fontSize: 22, fontWeight: 900, fontFamily: "ui-monospace, monospace", letterSpacing: ".08em", padding: "0 14px", textTransform: "uppercase" }} />
            <button type="submit" disabled={busy || typed.trim().length < 4} style={{ ...pill("#7dff8a", "#103a17"), opacity: typed.trim().length < 4 ? .55 : 1 }}>SEND</button>
          </div>
        </form>
      </> : null}
      {message ? <p role="status" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{message}</p> : null}
    </div>
  );
}
