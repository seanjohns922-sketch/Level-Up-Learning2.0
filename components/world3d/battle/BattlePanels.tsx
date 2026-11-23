"use client";
// Friend battles on screen: the Battles panel (challenge a friend, pick a realm, LIVE or TAKE TURNS, invites
// and results) and the battle itself (20 quick questions, a timer, the tug of war in light, the result).
import { Swords, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { BATTLE_QUESTIONS, BATTLE_REALMS, BATTLE_SECONDS, battleQuestions, type BattleRealm } from "@/lib/battle-questions";
import { BATTLE_PLAY_XP, BATTLE_TURN_DAYS, BATTLE_WIN_XP, clashPoint, createBattle, fetchBattles, respondToBattle, submitBattleScore, useLiveBattle, type Battle, type BattleMode, type BattleResult } from "@/lib/battles";
import type { Friend } from "@/lib/friends";
import { readRexAnswer } from "@/lib/rex";
import { getRealmDefinition } from "@/lib/realms/realm-registry";

const VIOLET = "#a855f7", LIME = "#83e300";
const panel: React.CSSProperties = { background: "rgba(20,14,40,.96)", color: "#fff", borderRadius: 22, border: "2px solid #C94DF299", boxShadow: "0 18px 50px rgba(0,0,0,.45)", fontFamily: "Inter, system-ui, sans-serif" };
const pill = (background: string, color = "#fff"): React.CSSProperties => ({ border: 0, borderRadius: 12, padding: "10px 14px", background, color, fontWeight: 900, fontSize: 14, fontFamily: "Montserrat, Inter, sans-serif", letterSpacing: ".04em", cursor: "pointer", whiteSpace: "nowrap" });
const label: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: "#e9b8fa" };
const realmName = (realm: BattleRealm) => getRealmDefinition(realm).name;
const stop = { onPointerDown: (event: React.PointerEvent) => event.stopPropagation(), onKeyDown: (event: React.KeyboardEvent) => event.stopPropagation(), onKeyUp: (event: React.KeyboardEvent) => event.stopPropagation() };

/** A battle about to be played: which, against whom, and my level in its realm. */
export type BattleToPlay = { id: string; seed: number; realm: BattleRealm; mode: BattleMode; friendId: string; friendName: string };

export function BattlesPanel({ studentId, demo, friends, online, preselect, onPlay, onClose }: {
  studentId: string | null; demo: boolean; friends: readonly Friend[]; online: ReadonlySet<string>; preselect?: Friend | null;
  onPlay: (battle: BattleToPlay) => void; onClose: () => void;
}) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [friend, setFriend] = useState<Friend | null>(preselect ?? null);
  const [realm, setRealm] = useState<BattleRealm | null>(null);
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
        <h2 style={{ margin: 0, fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", gap: 8 }}><Swords size={22} />Battles</h2>
        <button type="button" onClick={onClose} aria-label="Close battles" style={{ ...pill("rgba(255,255,255,.12)"), padding: 8, display: "grid", placeItems: "center" }}><X size={18} /></button>
      </div>
      <p style={{ margin: 0, fontSize: 13, opacity: .8 }}>{BATTLE_QUESTIONS} quick questions each, at your own level. Most right wins. +{BATTLE_PLAY_XP} XP for playing, +{BATTLE_WIN_XP} for winning.</p>

      {[...invites, ...myTurn].map((battle) => (
        <div key={battle.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,207,74,.14)", border: "1.5px solid #ffcf4a88", borderRadius: 14, padding: "10px 12px" }}>
          <span style={{ flex: 1, minWidth: 0, fontWeight: 800 }}>{battle.status === "invited" ? `${battle.friendName} wants to battle LIVE!` : `${battle.friendName} challenged you!`}<small style={{ display: "block", fontWeight: 600, opacity: .75 }}>{realmName(battle.realm)}{battle.status === "active" ? " · your turn" : ""}</small></span>
          <button type="button" onClick={() => (battle.status === "invited" ? void accept(battle) : onPlay({ id: battle.id, seed: battle.seed, realm: battle.realm, mode: battle.mode, friendId: battle.friendId, friendName: battle.friendName }))} style={pill("#7dff8a", "#103a17")}>{battle.status === "invited" ? "YES!" : "PLAY"}</button>
        </div>
      ))}

      {waiting ? <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, padding: 14, fontWeight: 800 }}>Waiting for {friend?.name} to say yes… <button type="button" onClick={() => setWaiting(null)} style={{ ...pill("rgba(255,255,255,.12)"), marginLeft: 8 }}>CANCEL</button></div> : <>
        <span style={label}>{friend ? `BATTLE ${friend.name.toUpperCase()}` : "CHALLENGE A FRIEND"}</span>
        {!friend ? (friendsOnly.length ? friendsOnly.map((f) => (
          <button key={f.friendshipId} type="button" onClick={() => setFriend(f)} style={{ display: "flex", alignItems: "center", gap: 10, border: 0, background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "10px 12px", color: "#fff", cursor: "pointer", textAlign: "left" }}>
            <span style={{ flex: 1, fontWeight: 800, fontSize: 15 }}>{f.name}<small style={{ display: "block", fontWeight: 700, color: online.has(f.studentId) ? "#7dff8a" : "#ffffff99" }}>{online.has(f.studentId) ? "● Online now" : "Offline"}</small></span>
            <span style={pill("#ffcf4a", "#3a2a00")}>⚔ CHALLENGE</span>
          </button>
        )) : <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>Add a friend first (FRIENDS button), then challenge them here.</p>) : !realm ? <>
          <div style={{ display: "grid", gap: 6 }}>{BATTLE_REALMS.map((r) => (
            <button key={r} type="button" onClick={() => setRealm(r)} style={{ display: "flex", alignItems: "center", gap: 10, border: 0, background: "rgba(255,255,255,.06)", borderRadius: 12, padding: "10px 12px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", textAlign: "left" }}>
              <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 99, background: reliqRealmColor(r) }} />{realmName(r)}
            </button>
          ))}</div>
          <button type="button" onClick={() => setFriend(null)} style={pill("rgba(255,255,255,.12)")}>BACK</button>
        </> : <>
          {online.has(friend.studentId) || demo ? <button type="button" onClick={() => void start("live")} style={{ ...pill("#C94DF2"), textAlign: "left", padding: 14 }}>⚡ LIVE NOW<small style={{ display: "block", fontWeight: 600, fontFamily: "Inter, sans-serif", letterSpacing: 0, opacity: .9, marginTop: 2 }}>{friend.name}&apos;s online. Play at the same time and watch the light beams push.</small></button> : null}
          <button type="button" onClick={() => void start("turns")} style={{ ...pill("rgba(255,255,255,.1)"), textAlign: "left", padding: 14 }}>⏳ TAKE TURNS<small style={{ display: "block", fontWeight: 600, fontFamily: "Inter, sans-serif", letterSpacing: 0, opacity: .85, marginTop: 2 }}>Play your {BATTLE_QUESTIONS} now. {friend.name} has {BATTLE_TURN_DAYS} days to play theirs.</small></button>
          <button type="button" onClick={() => setRealm(null)} style={pill("rgba(255,255,255,.12)")}>BACK</button>
        </>}
      </>}

      {waitingOn.length ? <><span style={label}>WAITING FOR FRIENDS</span>{waitingOn.map((b) => <div key={b.id} style={{ fontSize: 14, opacity: .85 }}>{b.friendName} · {realmName(b.realm)} · you got {b.myScore}</div>)}</> : null}
      {results.length ? <><span style={label}>RECENT BATTLES</span>{results.map((b) => <div key={b.id} style={{ fontSize: 14, fontWeight: 700 }}>{b.won ? "🏆 Won" : b.draw ? "🤝 Draw" : "Lost"} vs {b.friendName} · {b.myScore}–{b.friendScore}</div>)}</> : null}
      {message ? <p role="status" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{message}</p> : null}
    </div>
  );
}

/** The tug of war as a bar of light along the top of the battle screen. */
function ClashBar({ clash, me, friend }: { clash: number; me: number; friend: number }) {
  const at = 50 + clash * 42;
  return (
    <div style={{ position: "relative", height: 40, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }} aria-label={`You ${me}, friend ${friend}`}>
      <div style={{ position: "absolute", left: 0, top: 14, height: 12, width: `${at}%`, background: VIOLET, boxShadow: `0 0 16px ${VIOLET}`, transition: "width .4s" }} />
      <div style={{ position: "absolute", right: 0, top: 14, height: 12, width: `${100 - at}%`, background: LIME, boxShadow: `0 0 16px ${LIME}`, transition: "width .4s" }} />
      <div style={{ position: "absolute", left: `calc(${at}% - 18px)`, top: 2, width: 36, height: 36, borderRadius: 99, background: "radial-gradient(circle, #fff 30%, #fff4c2 60%, transparent 70%)", transition: "left .4s" }} />
      <b style={{ position: "absolute", left: 12, top: 9, fontSize: 15 }}>YOU {me}</b>
      <b style={{ position: "absolute", right: 12, top: 9, fontSize: 15, color: "#0d2a00" }}>{friend}</b>
    </div>
  );
}

/** Playing a battle: 20 questions at my level, a timer, the tug of war, and the result. */
export function BattlePlay({ battle, level, studentId, demo, onClash, onClose }: { battle: BattleToPlay; level: number; studentId: string | null; demo: boolean; onClash: (clash: number | null) => void; onClose: () => void }) {
  // My own questions: the battle's seed, mixed with who I am, at my level.
  const questions = useMemo(() => battleQuestions(battle.realm, level, battle.seed + [...(studentId ?? "demo")].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 0)), [battle, level, studentId]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [typed, setTyped] = useState("");
  const [flash, setFlash] = useState<"right" | "wrong" | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(BATTLE_SECONDS);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [demoFriend, setDemoFriend] = useState(0);
  const done = index >= questions.length || secondsLeft <= 0;
  const live = useLiveBattle(battle.mode === "live" && !demo ? battle.id : null, studentId, correct, done);
  const friendCorrect = demo ? demoFriend : live.correct;
  const input = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);

  useEffect(() => { const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000); return () => window.clearInterval(tick); }, []);
  // The demo friend answers as you go.
  useEffect(() => {
    if (!demo || done) return;
    const tick = window.setInterval(() => setDemoFriend((n) => Math.min(BATTLE_QUESTIONS, n + (Math.random() < 0.75 ? 1 : 0))), 6000);
    return () => window.clearInterval(tick);
  }, [demo, done]);
  const showLive = battle.mode === "live" || demo;
  useEffect(() => { onClash(showLive ? clashPoint(correct, friendCorrect) : clashPoint(correct, 0)); }, [correct, friendCorrect, showLive, onClash]);
  useEffect(() => () => onClash(null), [onClash]);
  useEffect(() => {
    if (!done || submitted.current) return;
    submitted.current = true;
    void submitBattleScore(studentId, demo, battle.id, correct, level, demo ? demoFriend : undefined).then(setResult).catch(() => setResult({ status: "error", xp: 0, myScore: correct }));
  }, [done, studentId, demo, battle.id, correct, level, demoFriend]);

  const check = () => {
    const value = readRexAnswer(typed);
    if (value === null || done) return;
    const right = value === questions[index].answer;
    if (right) setCorrect((n) => n + 1);
    setFlash(right ? "right" : "wrong");
    window.setTimeout(() => setFlash(null), 350);
    setTyped("");
    setIndex((i) => i + 1);
    requestAnimationFrame(() => input.current?.focus());
  };

  const minutes = Math.floor(secondsLeft / 60), seconds = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div role="dialog" aria-label={`Battle with ${battle.friendName}`} {...stop} style={{ ...panel, position: "absolute", left: "50%", transform: "translateX(-50%)", top: "max(84px, calc(env(safe-area-inset-top) + 76px))", width: "min(480px, calc(100vw - 32px))", padding: 20, display: "flex", flexDirection: "column", gap: 14, zIndex: 72, borderColor: flash === "right" ? "#7dff8a" : flash === "wrong" ? "#ff8a5a" : "#C94DF299" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={label}>{realmName(battle.realm).toUpperCase()} · VS {battle.friendName.toUpperCase()}</span>
        <span style={{ ...label, color: secondsLeft < 30 ? "#ff8a5a" : "#fff" }}>⏱ {minutes}:{seconds}</span>
      </div>
      <ClashBar clash={showLive ? clashPoint(correct, friendCorrect) : clashPoint(correct, 0)} me={correct} friend={showLive ? friendCorrect : 0} />
      {!result ? (!done ? <>
        <span style={label}>QUESTION {index + 1} OF {questions.length}</span>
        <div style={{ fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: "clamp(24px, 6vw, 40px)", lineHeight: 1.15 }}>{questions[index].prompt}</div>
        <form onSubmit={(event) => { event.preventDefault(); check(); }} style={{ display: "flex", gap: 8 }}>
          <input ref={input} value={typed} onChange={(event) => setTyped(event.target.value)} inputMode="decimal" autoFocus autoComplete="off" aria-label="Your answer" style={{ flex: 1, minWidth: 0, height: 58, borderRadius: 14, border: 0, background: "#fff", color: "#1f2328", fontSize: 30, fontWeight: 900, padding: "0 16px" }} />
          <button type="submit" style={pill("#7dff8a", "#103a17")}>GO</button>
        </form>
        {!showLive ? <span style={{ fontSize: 13, opacity: .75 }}>Take turns: {battle.friendName} plays later, then you both see the showdown.</span> : null}
      </> : <div style={{ fontWeight: 800 }}>Adding up…</div>) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <div style={{ fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: 34 }}>
            {result.status === "finished" ? (result.won ? "YOU WON! 🏆" : result.draw ? "IT'S A DRAW!" : `${battle.friendName.toUpperCase()} WON`) : "NICE BATTLING!"}
          </div>
          <div style={{ fontWeight: 900, fontSize: 20 }}>You {result.myScore ?? correct}{result.status === "finished" ? ` · ${battle.friendName} ${result.friendScore}` : ""}</div>
          {result.status !== "finished" ? <p style={{ margin: 0, fontSize: 14, opacity: .85 }}>{battle.friendName} plays their turn next. You&apos;ll see who won in Battles.</p> : null}
          {result.xp ? <span style={pill("#ffcf4a", "#3a2a00")}>+{result.xp} XP</span> : <span style={{ fontSize: 13, opacity: .75 }}>No XP this time (today&apos;s battle XP is used up), but it still counts!</span>}
          <button type="button" onClick={onClose} style={pill("#C94DF2")}>DONE</button>
        </div>
      )}
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
