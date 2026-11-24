"use client";
// Friend battles in the hub: the Battles panel (challenge a friend, pick a realm, LIVE or TAKE TURNS, invites
// and results) and a friend's invite popping up. The battle itself is played in the Battle Arena room
// (components/world3d/battle/BattleRoom.tsx).
import { Swords, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { BATTLE_QUESTIONS, BATTLE_REALMS, type BattleRealm } from "@/lib/battle-questions";
import { BATTLE_PLAY_XP, BATTLE_TURN_DAYS, BATTLE_WIN_XP, createBattle, fetchBattles, respondToBattle, type Battle, type BattleMode, type BattleToPlay } from "@/lib/battles";
import { FriendFace, GOLD, GREEN, HEADING, VIOLET, labelStyle as label, panelStyle as panel, pill, stopHub as stop } from "@/components/world3d/friends/FriendBits";
import type { Friend } from "@/lib/friends";
import { getRealmDefinition } from "@/lib/realms/realm-registry";

const realmName = (realm: BattleRealm) => getRealmDefinition(realm).name;
const tile: React.CSSProperties = { border: 0, borderRadius: 16, padding: "12px 12px", color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 2 };

/** Where the Battles panel opens: a friend already picked (their BATTLE button), and a realm too (REMATCH). */
export type BattlesPanelStart = { friendId?: string | null; realm?: BattleRealm };

export function BattlesPanel({ studentId, demo, friends, online, start: opening, onPlay, onClose }: {
  studentId: string | null; demo: boolean; friends: readonly Friend[]; online: ReadonlySet<string>; start: BattlesPanelStart;
  onPlay: (battle: BattleToPlay) => void; onClose: () => void;
}) {
  const [battles, setBattles] = useState<Battle[]>([]);
  // The friend is kept by id: the friends list may still be loading when the panel opens.
  const [friendId, setFriendId] = useState<string | null>(opening.friendId ?? null);
  const friend = friends.find((f) => f.studentId === friendId && f.status === "friend") ?? null;
  const [realm, setRealm] = useState<BattleRealm | null>(opening.realm ?? null);
  const [mode, setMode] = useState<BattleMode | null>(null);
  const [waiting, setWaiting] = useState<{ id: string; seed: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(async () => { try { setBattles(await fetchBattles(studentId, demo)); } catch { /* the list just stays as it was */ } }, [studentId, demo]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  // A LIVE challenge waits for the friend to say yes (they have two minutes).
  useEffect(() => {
    if (!waiting || !friend || !realm) return;
    const poll = window.setInterval(() => {
      void fetchBattles(studentId, demo).then((list) => {
        const mine = list.find((b) => b.id === waiting.id);
        if (mine?.status === "active") { window.clearInterval(poll); onPlay({ id: mine.id, seed: mine.seed, realm, mode: "live", friendId: friend.studentId, friendName: friend.name }); }
        else if (mine && mine.status !== "invited") { window.clearInterval(poll); setWaiting(null); setMessage(`${friend.name} can't battle right now. Try TAKE TURNS instead.`); }
      }).catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(poll);
  }, [waiting, friend, realm, studentId, demo, onPlay]);

  const start = async (mode: BattleMode) => {
    if (!friend || !realm) return;
    try {
      const made = await createBattle(studentId, demo, { id: friend.studentId, name: friend.name }, realm, mode);
      if (mode === "turns" || demo) onPlay({ id: made.id, seed: made.seed, realm, mode, friendId: friend.studentId, friendName: friend.name });
      else setWaiting({ id: made.id, seed: made.seed });
    } catch { setMessage("That battle couldn't start just now. Try again in a moment."); }
  };
  const accept = async (battle: Battle) => {
    const ok = await respondToBattle(studentId, demo, battle.id, true).catch(() => null);
    if (ok?.status === "active") onPlay({ id: battle.id, seed: battle.seed, realm: battle.realm, mode: battle.mode, friendId: battle.friendId, friendName: battle.friendName });
    else { setMessage("That invite has run out."); void load(); }
  };

  const invites = battles.filter((b) => b.status === "invited" && !b.iChallenged);
  const myTurn = battles.filter((b) => b.status === "active" && b.myScore === null);
  const waitingOn = battles.filter((b) => b.status === "active" && b.myScore !== null);
  const results = battles.filter((b) => b.status === "finished").slice(0, 4);
  const friendsOnly = friends.filter((f) => f.status === "friend");

  return (
    <div role="dialog" aria-label="Battles" {...stop} style={{ ...panel, position: "absolute", right: "max(16px, 3vw)", top: "max(84px, calc(env(safe-area-inset-top) + 76px))", width: "min(420px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 120px)", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12, zIndex: 70 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontFamily: HEADING, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", gap: 8 }}><Swords size={22} color={GOLD} />Battles</h2>
        <button type="button" onClick={onClose} aria-label="Close battles" style={{ ...pill("rgba(255,255,255,.12)"), padding: 8, display: "grid", placeItems: "center" }}><X size={18} /></button>
      </div>
      <p style={{ margin: 0, fontSize: 13, opacity: .8 }}>{BATTLE_QUESTIONS} quick questions each, at your own level. Most right wins. +{BATTLE_PLAY_XP} XP for playing, +{BATTLE_WIN_XP} for winning.</p>

      {[...invites, ...myTurn].map((battle) => (
        <div key={battle.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,207,74,.14)", border: "1.5px solid #ffcf4a88", borderRadius: 14, padding: "10px 12px" }}>
          <span style={{ flex: 1, minWidth: 0, fontWeight: 800 }}>{battle.status === "invited" ? `${battle.friendName} wants to battle LIVE!` : `${battle.friendName} challenged you!`}<small style={{ display: "block", fontWeight: 600, opacity: .75 }}>{realmName(battle.realm)}{battle.status === "active" ? " · your turn" : ""}</small></span>
          <button type="button" onClick={() => (battle.status === "invited" ? void accept(battle) : onPlay({ id: battle.id, seed: battle.seed, realm: battle.realm, mode: battle.mode, friendId: battle.friendId, friendName: battle.friendName }))} style={pill(GREEN, "#103a17")}>{battle.status === "invited" ? "YES!" : "PLAY"}</button>
        </div>
      ))}

      {waiting ? <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, padding: 14, fontWeight: 800 }}>Waiting for {friend?.name} to say yes… <button type="button" onClick={() => setWaiting(null)} style={{ ...pill("rgba(255,255,255,.12)"), marginLeft: 8 }}>CANCEL</button></div> : <>
        {friend ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,207,74,.1)", border: `1.5px solid ${GOLD}66`, borderRadius: 18, padding: "10px 12px" }}>
            <FriendFace outfit={friend.outfit} size={52} online={online.has(friend.studentId)} />
            <span style={{ flex: 1, minWidth: 0 }}><span style={label}>YOU VS</span><span style={{ display: "block", fontFamily: HEADING, fontWeight: 900, fontSize: 20 }}>{friend.name}</span><small style={{ fontWeight: 700, color: online.has(friend.studentId) ? GREEN : "#ffffff99" }}>{online.has(friend.studentId) ? "● Online now" : "Offline: take turns"}</small></span>
            <button type="button" onClick={() => { setFriendId(null); setRealm(null); setMode(null); }} style={{ ...pill("rgba(255,255,255,.12)"), fontSize: 12 }}>CHANGE</button>
          </div>
        ) : <span style={label}>1 · CHALLENGE A FRIEND</span>}
        {!friend ? (friendsOnly.length ? friendsOnly.map((f) => (
          <button key={f.friendshipId} type="button" onClick={() => setFriendId(f.studentId)} style={{ display: "flex", alignItems: "center", gap: 12, border: 0, background: "rgba(255,255,255,.06)", borderRadius: 16, padding: "10px 12px", color: "#fff", cursor: "pointer", textAlign: "left" }}>
            <FriendFace outfit={f.outfit} size={46} online={online.has(f.studentId)} />
            <span style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 16 }}>{f.name}<small style={{ display: "block", fontWeight: 700, color: online.has(f.studentId) ? GREEN : "#ffffff99" }}>{online.has(f.studentId) ? "● Online now" : "Offline"}</small></span>
            <span style={pill(GOLD, "#3a2a00")}><Swords size={15} aria-hidden="true" />CHALLENGE</span>
          </button>
        )) : <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>Add a friend first (FRIENDS button), then challenge them here.</p>) : <>
          <span style={label}>2 · PICK A REALM</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>{BATTLE_REALMS.map((r) => {
            const on = realm === r, colour = reliqRealmColor(r);
            return (
              <button key={r} type="button" aria-pressed={on} onClick={() => setRealm(r)} style={{ ...tile, background: on ? colour : `${colour}2e`, border: `2px solid ${on ? "#fff" : `${colour}88`}`, color: on ? "#14091f" : "#fff" }}>
                <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 14 }}>{realmName(r)}</span>
              </button>
            );
          })}</div>
          {realm ? <>
            <span style={label}>3 · HOW TO PLAY</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
              {online.has(friend.studentId) || demo ? <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")} style={{ ...tile, background: mode === "live" ? `${VIOLET}55` : "rgba(255,255,255,.06)", border: `2px solid ${mode === "live" ? VIOLET : "transparent"}` }}>
                <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 15 }}>⚡ LIVE NOW</span>
                <small style={{ fontWeight: 600, opacity: .85, lineHeight: 1.35 }}>Play at the same time and watch the beams push.</small>
              </button> : null}
              <button type="button" aria-pressed={mode === "turns"} onClick={() => setMode("turns")} style={{ ...tile, background: mode === "turns" ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.06)", border: `2px solid ${mode === "turns" ? "#fff" : "transparent"}` }}>
                <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 15 }}>⏳ TAKE TURNS</span>
                <small style={{ fontWeight: 600, opacity: .85, lineHeight: 1.35 }}>Play yours now. {friend.name} has {BATTLE_TURN_DAYS} days to play theirs.</small>
              </button>
            </div>
            <button type="button" disabled={!mode} onClick={() => mode && void start(mode)} style={{ ...pill(GOLD, "#3a2a00"), padding: "15px 14px", fontSize: 17, opacity: mode ? 1 : .5, cursor: mode ? "pointer" : "default" }}><Swords size={19} aria-hidden="true" />INTO THE ARENA</button>
          </> : null}
        </>}
      </>}

      {waitingOn.length ? <><span style={label}>WAITING FOR FRIENDS</span>{waitingOn.map((b) => <div key={b.id} style={{ fontSize: 14, opacity: .85 }}>{b.friendName} · {realmName(b.realm)} · you got {b.myScore}</div>)}</> : null}
      {results.length ? <><span style={label}>RECENT BATTLES</span>{results.map((b) => <div key={b.id} style={{ fontSize: 14, fontWeight: 700 }}>{b.won ? "🏆 Won" : b.draw ? "🤝 Draw" : "Lost"} vs {b.friendName} · {b.myScore}–{b.friendScore}</div>)}</> : null}
      {message ? <p role="status" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{message}</p> : null}
    </div>
  );
}

/** A friend's battle invite popping up in the hub. */
export function BattleInviteToast({ invite, onOpen, onDismiss }: { invite: Battle; onOpen: () => void; onDismiss: () => void }) {
  return (
    <div role="status" {...stop} style={{ ...panel, position: "absolute", left: "50%", transform: "translateX(-50%)", top: "max(150px, calc(env(safe-area-inset-top) + 142px))", width: "min(420px, calc(100vw - 32px))", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, zIndex: 66, borderColor: "#ffcf4a" }}>
      <Swords size={24} color="#ffcf4a" aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 0, fontWeight: 800 }}>{invite.status === "invited" ? `${invite.friendName} wants to battle LIVE!` : `${invite.friendName} challenged you!`}<small style={{ display: "block", fontWeight: 600, opacity: .75 }}>{realmName(invite.realm)}</small></span>
      <button type="button" onClick={onOpen} style={pill("#7dff8a", "#103a17")}>{invite.status === "invited" ? "YES!" : "PLAY"}</button>
      <button type="button" onClick={onDismiss} aria-label="Not now" style={{ ...pill("rgba(255,255,255,.12)"), padding: 8 }}><X size={16} /></button>
    </div>
  );
}
