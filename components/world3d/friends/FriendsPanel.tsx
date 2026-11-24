"use client";
// The Friends panel in the hub. FRIENDS: requests to say yes to, then a card per friend (their explorer,
// KNOCK to visit their world while they're on, and BATTLE); tap a friend for their own page.
// MY CLASS: classmates to ask with one tap. CODE: friend codes for kids outside the class. No chat anywhere.
import { Check, ChevronRight, DoorOpen, RefreshCw, Swords, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  FRIEND_CODE_PATTERN, fetchClassmates, fetchFriends, newFriendCode, normaliseFriendCode, respondToFriend, sendClassmateRequest, sendFriendRequest,
  type Classmate, type Friend, type FriendsState, type SendResult,
} from "@/lib/friends";
import { FriendFace, GOLD, GREEN, HEADING, LILAC, VIOLET, howTos, labelStyle, panelStyle, pill, shortDate, stopHub } from "./FriendBits";

const SEND_MESSAGES: Record<SendResult, string> = {
  sent: "Friend request sent! They need to say yes.",
  accepted: "You're friends now!",
  already: "You've already asked, or you're already friends.",
  not_found: "No explorer has that friend code. Check it and try again.",
  self: "That's your own friend code!",
  off: "Friends are switched off for you right now.",
};
const card: React.CSSProperties = { background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 12, display: "flex", flexDirection: "column", gap: 10 };
type Tab = "friends" | "class" | "code";

export function FriendsPanel({ studentId, demo, online, onKnock, onChallenge, onOpenFriend, onClose }: {
  studentId: string | null; demo: boolean; online: ReadonlySet<string>;
  /** KNOCK on a friend's door (only while they're online). */
  onKnock: (friend: Friend) => void; onChallenge: (friend: Friend) => void; onOpenFriend: (friend: Friend) => void; onClose: () => void;
}) {
  const [state, setState] = useState<FriendsState | null>(null);
  const [classmates, setClassmates] = useState<Classmate[] | null>(null);
  const [tab, setTab] = useState<Tab>("friends");
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setState(await fetchFriends(studentId, demo)); }
    catch { setMessage("Friends couldn't load just now. Try again in a moment."); }
  }, [studentId, demo]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const loadClass = useCallback(async () => {
    try { setClassmates(await fetchClassmates(studentId, demo)); } catch { setMessage("Your class couldn't load just now. Try again in a moment."); }
  }, [studentId, demo]);
  useEffect(() => {
    if (tab !== "class") return;
    const timer = window.setTimeout(() => void loadClass(), 0);
    return () => window.clearTimeout(timer);
  }, [tab, loadClass]);

  const act = async (job: () => Promise<unknown>) => {
    setBusy(true);
    try { await job(); await load(); } catch { setMessage("That didn't work just now. Try again in a moment."); }
    setBusy(false);
  };
  const ask = async (send: () => Promise<SendResult>) => {
    setBusy(true);
    try { setMessage(SEND_MESSAGES[await send()]); await Promise.all([load(), tab === "class" ? loadClass() : null]); }
    catch { setMessage("That didn't work just now. Try again in a moment."); }
    setBusy(false);
  };
  const friends = state?.friends.filter((f) => f.status === "friend") ?? [];
  const incoming = state?.friends.filter((f) => f.status === "incoming") ?? [];
  const outgoing = state?.friends.filter((f) => f.status === "outgoing") ?? [];
  const code = normaliseFriendCode(typed);
  const tabs: Array<[Tab, string]> = [["friends", `Friends${friends.length ? ` (${friends.length})` : ""}`], ...(state?.hasClass ? [["class", "My class"] as [Tab, string]] : []), ["code", "Code"]];

  return (
    <div role="dialog" aria-label="Friends" {...stopHub}
      style={{ ...panelStyle, position: "absolute", right: "max(16px, 3vw)", top: "max(84px, calc(env(safe-area-inset-top) + 76px))", width: "min(420px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 120px)", overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12, zIndex: 70 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontFamily: HEADING, fontWeight: 900, fontSize: 24 }}>Friends</h2>
        <button type="button" onClick={onClose} aria-label="Close friends" style={{ ...pill("rgba(255,255,255,.12)"), padding: 8 }}><X size={18} /></button>
      </div>
      {state && !state.enabled ? <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>Friends are switched off for you right now. Ask your teacher or grown-up.</p> : null}
      <div role="tablist" style={{ display: "flex", gap: 6, background: "rgba(0,0,0,.25)", borderRadius: 999, padding: 4 }}>
        {tabs.map(([id, text]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setMessage(null); }}
            style={{ flex: 1, border: 0, borderRadius: 999, padding: "9px 4px", fontWeight: 900, fontFamily: HEADING, fontSize: 13, cursor: "pointer", background: tab === id ? "#fff" : "transparent", color: tab === id ? "#1f1236" : "#fff", position: "relative" }}>
            {text}{id === "friends" && incoming.length ? <span aria-label={`${incoming.length} new`} style={{ marginLeft: 6, background: GOLD, color: "#3a2a00", borderRadius: 99, padding: "1px 7px", fontSize: 11 }}>{incoming.length}</span> : null}
          </button>
        ))}
      </div>

      {tab === "friends" ? <>
        {incoming.map((friend) => (
          <div key={friend.friendshipId} style={{ ...card, flexDirection: "row", alignItems: "center", background: "rgba(255,207,74,.12)", borderColor: `${GOLD}88` }}>
            <FriendFace outfit={friend.outfit} size={46} />
            <span style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 15 }}>{friend.name} wants to be friends!</span>
            <button type="button" disabled={busy} onClick={() => void act(() => respondToFriend(studentId, demo, friend.friendshipId, true))} style={pill(GREEN, "#103a17")}><Check size={16} aria-hidden="true" />YES</button>
            <button type="button" disabled={busy} onClick={() => void act(() => respondToFriend(studentId, demo, friend.friendshipId, false))} aria-label={`Say no to ${friend.name}`} style={{ ...pill("rgba(255,255,255,.12)"), padding: 10 }}><X size={16} /></button>
          </div>
        ))}
        {friends.map((friend) => {
          // Demo friends are always "in".
          const isOnline = demo || online.has(friend.studentId);
          const since = shortDate(friend.friendsSince);
          return (
            <div key={friend.friendshipId} style={card}>
              <button type="button" onClick={() => onOpenFriend(friend)} aria-label={`Open ${friend.name}'s page`} style={{ display: "flex", alignItems: "center", gap: 12, border: 0, background: "transparent", color: "#fff", padding: 0, cursor: "pointer", textAlign: "left" }}>
                <FriendFace outfit={friend.outfit} size={56} online={isOnline} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: HEADING, fontWeight: 900, fontSize: 18 }}>{friend.name}</span>
                  <small style={{ display: "block", fontWeight: 700, fontSize: 12, color: isOnline ? GREEN : "#ffffffaa" }}>{isOnline ? "● In the hub now" : since ? `Friends since ${since}` : "Friend"}</small>
                </span>
                <ChevronRight size={20} aria-hidden="true" style={{ opacity: .6 }} />
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" disabled={!isOnline} onClick={() => onKnock(friend)} style={{ ...pill(isOnline ? VIOLET : "rgba(255,255,255,.08)", isOnline ? "#fff" : "#ffffff99"), flex: 1, cursor: isOnline ? "pointer" : "default" }}><DoorOpen size={16} aria-hidden="true" />{isOnline ? "KNOCK" : "NOT ONLINE"}</button>
                <button type="button" onClick={() => onChallenge(friend)} style={{ ...pill(GOLD, "#3a2a00"), flex: 1 }}><Swords size={16} aria-hidden="true" />BATTLE</button>
              </div>
            </div>
          );
        })}
        {outgoing.map((friend) => (
          <div key={friend.friendshipId} style={{ ...card, flexDirection: "row", alignItems: "center" }}>
            <FriendFace outfit={friend.outfit} size={40} />
            <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 14, opacity: .85 }}>Waiting for {friend.name} to say yes</span>
            <button type="button" disabled={busy} onClick={() => void act(() => respondToFriend(studentId, demo, friend.friendshipId, false))} style={pill("rgba(255,255,255,.12)")}>CANCEL</button>
          </div>
        ))}
        {state && !friends.length && !incoming.length && !outgoing.length ? <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>No friends yet. {state.hasClass ? <>Tap <b>My class</b> to add someone from your class, or </> : null}tap <b>Code</b> to swap friend codes.</p> : null}
        <details style={{ ...card, gap: 8 }}>
          <summary style={{ cursor: "pointer", fontFamily: HEADING, fontWeight: 900, fontSize: 14, color: LILAC, letterSpacing: ".04em" }}>HOW FRIENDS WORK</summary>
          {howTos().map((how) => <p key={how.key} style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}><b>{how.title}.</b> {how.text}</p>)}
        </details>
      </> : null}

      {tab === "class" ? <>
        <p style={{ margin: 0, fontSize: 13, opacity: .85 }}>Tap ADD to ask someone in your class. They have to say yes.</p>
        {classmates === null ? <p style={{ margin: 0, fontSize: 14, opacity: .7 }}>Loading your class…</p> : classmates.length ? classmates.map((mate) => (
          <div key={mate.studentId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 4px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <FriendFace outfit={mate.outfit} size={46} />
            <span style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 16 }}>{mate.name}</span>
            {mate.status === "none" ? <button type="button" disabled={busy} onClick={() => void ask(() => sendClassmateRequest(studentId, demo, mate.studentId))} style={pill(GREEN, "#103a17")}>ADD</button>
              : mate.status === "incoming" ? <button type="button" disabled={busy} onClick={() => void ask(() => sendClassmateRequest(studentId, demo, mate.studentId))} style={pill(GOLD, "#3a2a00")}>SAY YES</button>
              : <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 12, letterSpacing: ".06em", color: mate.status === "friend" ? GREEN : "#ffffffaa" }}>{mate.status === "friend" ? "✓ FRIENDS" : "ASKED"}</span>}
          </div>
        )) : <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>No one else in your class can add friends yet.</p>}
      </> : null}

      {tab === "code" ? <>
        <div style={{ ...card, gap: 6 }}>
          <span style={labelStyle}>YOUR FRIEND CODE</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 30, letterSpacing: ".08em" }}>{state?.code ?? "…"}</span>
            <button type="button" disabled={busy} onClick={() => void act(() => newFriendCode(studentId, demo))} style={pill("rgba(255,255,255,.12)")}><RefreshCw size={14} aria-hidden="true" />NEW CODE</button>
          </div>
          <span style={{ fontSize: 12, opacity: .7 }}>For friends outside your class: tell them this code so they can add you. A new code stops the old one working.</span>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); if (!FRIEND_CODE_PATTERN.test(code)) { setMessage("A friend code looks like PAL-7K2P."); return; } void ask(async () => { const result = await sendFriendRequest(studentId, demo, code); if (result === "sent" || result === "accepted") setTyped(""); return result; }); }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="friend-code" style={labelStyle}>ADD A FRIEND: TYPE THEIR FRIEND CODE</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="friend-code" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="PAL-7K2P" autoComplete="off" autoCapitalize="characters" maxLength={9}
              style={{ flex: 1, minWidth: 0, height: 50, borderRadius: 12, border: 0, background: "#fff", color: "#1f2328", fontSize: 22, fontWeight: 900, fontFamily: "ui-monospace, monospace", letterSpacing: ".08em", padding: "0 14px", textTransform: "uppercase" }} />
            <button type="submit" disabled={busy || typed.trim().length < 4} style={{ ...pill(GREEN, "#103a17"), opacity: typed.trim().length < 4 ? .55 : 1 }}>SEND</button>
          </div>
        </form>
      </> : null}
      {message ? <p role="status" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{message}</p> : null}
    </div>
  );
}

/** A friend request popping up in the hub. ✕ only hides it: the request waits in the Friends panel. */
export function FriendRequestToast({ friend, busy, onYes, onLater }: { friend: Friend; busy: boolean; onYes: () => void; onLater: () => void }) {
  return (
    <div role="status" {...stopHub} style={{ ...panelStyle, position: "absolute", left: "50%", transform: "translateX(-50%)", top: "max(172px, calc(env(safe-area-inset-top) + 164px))", width: "min(420px, calc(100vw - 32px))", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, zIndex: 66, borderColor: GOLD }}>
      <FriendFace outfit={friend.outfit} size={50} />
      <span style={{ flex: 1, minWidth: 0, fontWeight: 900, fontFamily: HEADING, fontSize: 16 }}>{friend.name} wants to be friends!</span>
      <button type="button" disabled={busy} onClick={onYes} style={pill(GREEN, "#103a17")}><Check size={16} aria-hidden="true" />YES</button>
      <button type="button" disabled={busy} onClick={onLater} aria-label="Not now (it stays in Friends)" style={{ ...pill("rgba(255,255,255,.12)"), padding: 10 }}><X size={16} /></button>
    </div>
  );
}
