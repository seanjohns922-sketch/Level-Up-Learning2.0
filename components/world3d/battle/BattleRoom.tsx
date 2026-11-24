"use client";
// The Battle Arena room: a friend battle on its own page. Into the stadium (names on the big screen), a
// 3-2-1 countdown and LAUNCH, then the battle from behind your podium: the question in a slim bar at the
// bottom, the tug of war along the top, beams surging with every right answer and a POWER UP for three in a
// row. At the end the loser's beam snaps and their top is blasted out, then VICTORY (or so close), the XP,
// and REMATCH or back to the hub.
import { Canvas } from "@react-three/fiber";
import { Swords, Volume2, VolumeX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { BattleArenaScene, type ArenaOutcome, type ArenaStage } from "@/components/world3d/battle/BattleArena";
import { POWER_UP_STREAK, useBattleGame } from "@/components/world3d/battle/useBattleGame";
import { battleSounds, battleSoundsOn, setBattleMuted, subscribeBattleMute } from "@/lib/audio/battle-sfx";
import { BATTLE_QUESTIONS } from "@/lib/battle-questions";
import { BATTLE_WIN_XP, clashPoint, fetchBattles, rematchHref, type BattleResult, type BattleToPlay } from "@/lib/battles";
import { getRealmDefinition } from "@/lib/realms/realm-registry";

const VIOLET = "#a855f7", LIME = "#83e300", GOLD = "#ffcf4a";
const display = "Montserrat, Inter, system-ui, sans-serif";
/** How long the intro shows the names, and each beat of the countdown (ms). */
const INTRO_MS = 3200, BEAT_MS = 900;
/** After the finish starts: when the top is blasted out (matches the arena's snap), and when the result shows. */
const CRASH_MS = 700, RESULT_MS = 2300;
/** How long a POWER UP lasts on screen and in the beams. */
const POWER_MS = 3000;

const glass: React.CSSProperties = { background: "rgba(12,8,28,.78)", border: "1.5px solid rgba(255,255,255,.14)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 18, color: "#fff" };
const button = (background: string, color = "#fff"): React.CSSProperties => ({ border: 0, borderRadius: 14, padding: "0 22px", height: 54, background, color, fontFamily: display, fontWeight: 900, fontSize: 17, letterSpacing: ".05em", cursor: "pointer", whiteSpace: "nowrap" });
const iconButton: React.CSSProperties = { ...glass, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", flex: "none", padding: 0 };

const STYLES = `
@keyframes ba-pop { 0% { transform: scale(2.4); opacity: 0 } 25% { transform: scale(.9); opacity: 1 } 40% { transform: scale(1.05) } 100% { transform: scale(1); opacity: 1 } }
@keyframes ba-rise { 0% { transform: translateY(24px); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes ba-banner { 0% { transform: translate(-50%, -20px) scale(.6); opacity: 0 } 15% { transform: translate(-50%, 0) scale(1.08); opacity: 1 } 25% { transform: translate(-50%, 0) scale(1) } 85% { opacity: 1 } 100% { transform: translate(-50%, -10px); opacity: 0 } }
@keyframes ba-shake { 0%, 100% { transform: none } 20% { transform: translateX(-8px) } 40% { transform: translateX(8px) } 60% { transform: translateX(-5px) } 80% { transform: translateX(5px) } }
@keyframes ba-plus { 0% { transform: translateY(0) scale(.8); opacity: 0 } 20% { opacity: 1; transform: translateY(-10px) scale(1.1) } 100% { transform: translateY(-46px); opacity: 0 } }
@keyframes ba-xp { 0% { transform: translateY(40px) scale(.6); opacity: 0 } 60% { transform: translateY(-6px) scale(1.12); opacity: 1 } 100% { transform: none; opacity: 1 } }
@keyframes ba-fall { 0% { transform: translateY(-10vh) rotate(0) } 100% { transform: translateY(110vh) rotate(720deg) } }
@keyframes ba-glow { 0%, 100% { filter: drop-shadow(0 0 12px rgba(255,207,74,.6)) } 50% { filter: drop-shadow(0 0 28px rgba(255,207,74,.95)) } }
.ba-name { display: inline }
@media (max-width: 560px) { .ba-name { display: none } }
/* The bars along the bottom; on narrow screens they sit above the app's Full Screen button. */
.ba-bottom { bottom: calc(env(safe-area-inset-bottom, 0px) + 16px) }
@media (max-width: 760px) { .ba-bottom { bottom: calc(env(safe-area-inset-bottom, 0px) + 64px) } }
`;

function initial(name: string) {
  return (name.replace(/^demo\s+/i, "").trim()[0] ?? "?").toUpperCase();
}

function MuteButton() {
  const on = useSyncExternalStore(subscribeBattleMute, battleSoundsOn, () => true);
  return (
    <button type="button" onClick={() => { setBattleMuted(on); if (!on) window.setTimeout(() => battleSounds.cheer(0.5), 50); }} aria-pressed={!on} aria-label={on ? "Mute the arena" : "Hear the arena"} title={on ? "Mute the arena" : "Hear the arena"} style={{ ...iconButton, background: on ? glass.background : "rgba(229,72,77,.35)" }}>
      {on ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
    </button>
  );
}

/** A player's chip at the top: their colour, initial, name (on wider screens) and score. */
function PlayerChip({ name, score, colour, ink, right = false }: { name: string; score: number | null; colour: string; ink: string; right?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: right ? "row-reverse" : "row", background: colour, color: ink, borderRadius: 16, padding: "6px 10px", boxShadow: `0 0 22px ${colour}88`, flex: "none" }}>
      <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 99, background: "rgba(0,0,0,.25)", color: "#fff", display: "grid", placeItems: "center", fontFamily: display, fontWeight: 900 }}>{initial(name)}</span>
      <span className="ba-name" style={{ fontFamily: display, fontWeight: 900, fontSize: 14, letterSpacing: ".04em", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name.toUpperCase()}</span>
      <span style={{ fontFamily: display, fontWeight: 900, fontSize: 24, minWidth: 28, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{score ?? "?"}</span>
    </div>
  );
}

/** The tug of war in light along the top: violet from the left, lime from the right, meeting at the clash. */
function TugBar({ clash }: { clash: number }) {
  const at = 50 + clash * 42;
  return (
    <div aria-hidden="true" style={{ position: "relative", flex: 1, minWidth: 60, height: 18, borderRadius: 99, background: "rgba(255,255,255,.1)", overflow: "visible" }}>
      <div style={{ position: "absolute", left: 0, top: 3, height: 12, width: `${at}%`, borderRadius: 99, background: VIOLET, boxShadow: `0 0 16px ${VIOLET}`, transition: "width .35s" }} />
      <div style={{ position: "absolute", right: 0, top: 3, height: 12, width: `${100 - at}%`, borderRadius: 99, background: LIME, boxShadow: `0 0 16px ${LIME}`, transition: "width .35s" }} />
      <div style={{ position: "absolute", left: `calc(${at}% - 17px)`, top: -8, width: 34, height: 34, borderRadius: 99, background: "radial-gradient(circle, #fff 30%, #fff4c2 55%, transparent 70%)", transition: "left .35s" }} />
    </div>
  );
}

/** Falling confetti for a win or a draw. */
function Confetti() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: 48 }, (_, i) => (
        <span key={i} style={{ position: "absolute", left: `${(i * 37) % 100}%`, top: 0, width: 10, height: 16, borderRadius: 3, background: [VIOLET, LIME, GOLD, "#38e1ff", "#ff7ab6"][i % 5], animation: `ba-fall ${2.4 + (i % 7) * 0.35}s linear ${(i % 12) * 0.18}s infinite` }} />
      ))}
    </div>
  );
}

/** What the finish card says. */
function finishWords(outcome: ArenaOutcome, friendName: string, result: BattleResult) {
  if (outcome === "me") return { title: "VICTORY!", line: `You beat ${friendName}!` };
  if (outcome === "friend") return { title: "SO CLOSE!", line: `${friendName} won this one. Rematch?` };
  if (outcome === "draw") return { title: "DRAW!", line: "Dead level. Nobody wins, so go again!" };
  return result.status === "error"
    ? { title: "NICE BATTLING!", line: "Your score couldn't be saved just now. Check Battles in the hub." }
    : { title: "TURN DONE!", line: `${friendName} plays their turn next. You'll see who won in Battles.` };
}

export function BattleRoom({ battle, level, studentId, myName, demo }: { battle: BattleToPlay; level: number; studentId: string | null; myName: string; demo: boolean }) {
  const router = useRouter();
  const hubHref = demo ? "/world?teacher_preview=1" : "/world";
  const [stage, setStage] = useState<ArenaStage>("intro");
  const [count, setCount] = useState<number | "LAUNCH!" | null>(null);
  const game = useBattleGame({ battle, level, studentId, demo, running: stage === "battle" });
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "right" | "wrong" | "power"; at: number } | null>(null);
  const [flash, setFlash] = useState<"right" | "wrong" | null>(null);
  /** When the current POWER UP started (null when there isn't one). */
  const [powerAt, setPowerAt] = useState<number | null>(null);
  const powered = powerAt !== null;
  const [cheer, setCheer] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  /** Live and finished first: wait for the friend, then the showdown. */
  const [final, setFinal] = useState<BattleResult | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const realm = getRealmDefinition(battle.realm);

  // The intro, then 3, 2, 1, LAUNCH!
  useEffect(() => {
    battleSounds.cheer(0.8);
    const timers = [
      window.setTimeout(() => { setStage("countdown"); setCount(3); battleSounds.count(); }, INTRO_MS),
      window.setTimeout(() => { setCount(2); battleSounds.count(); }, INTRO_MS + BEAT_MS),
      window.setTimeout(() => { setCount(1); battleSounds.count(); }, INTRO_MS + BEAT_MS * 2),
      window.setTimeout(() => { setCount("LAUNCH!"); setStage("battle"); battleSounds.count(true); battleSounds.launch(); battleSounds.cheer(1); setCheer((n) => n + 1); }, INTRO_MS + BEAT_MS * 3),
      window.setTimeout(() => { setCount(null); input.current?.focus(); }, INTRO_MS + BEAT_MS * 4),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // The friend's beam surges as they score (live or demo).
  const friendSeen = useRef(0);
  useEffect(() => {
    if (game.friendCorrect <= friendSeen.current) return;
    friendSeen.current = game.friendCorrect;
    battleSounds.surge(false);
    const timer = window.setTimeout(() => setCheer((n) => n + 1), 0);
    return () => window.clearTimeout(timer);
  }, [game.friendCorrect]);

  // The last ten seconds tick.
  useEffect(() => { if (stage === "battle" && !game.done && game.secondsLeft <= 10 && game.secondsLeft > 0) battleSounds.tick(); }, [game.secondsLeft, game.done, stage]);

  // A live battle where I finished first: keep checking until my friend has too.
  const result = game.result;
  useEffect(() => {
    if (!result) return;
    if (result.status !== "active" || battle.mode !== "live" || demo || !studentId) { const timer = window.setTimeout(() => setFinal(result), 0); return () => window.clearTimeout(timer); }
    let tries = 0;
    const poll = window.setInterval(() => {
      tries++;
      void fetchBattles(studentId, false).then((list) => {
        const mine = list.find((b) => b.id === battle.id);
        if (mine?.status === "finished") {
          window.clearInterval(poll);
          // The win XP is paid when the second score comes in, if I'd earned XP for playing.
          setFinal({ status: "finished", xp: result.xp + (mine.won && result.xp > 0 ? BATTLE_WIN_XP : 0), myScore: mine.myScore ?? result.myScore, friendScore: mine.friendScore, won: mine.won, draw: mine.draw });
        } else if (tries > 75) { window.clearInterval(poll); setFinal(result); }
      }).catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(poll);
  }, [result, battle.mode, battle.id, demo, studentId]);

  const outcome: ArenaOutcome | null = final ? (final.status === "finished" ? (final.won ? "me" : final.draw ? "draw" : "friend") : "turns") : null;
  // The finish: the beam snaps, the crash, then the result card.
  useEffect(() => {
    if (!outcome) return;
    const timers = [window.setTimeout(() => setStage("finish"), 0)];
    if (outcome === "me" || outcome === "friend") timers.push(window.setTimeout(() => { battleSounds.crash(); setCheer((n) => n + 1); }, CRASH_MS));
    timers.push(window.setTimeout(() => {
      setShowResult(true);
      if (outcome === "me") { battleSounds.fanfare(); battleSounds.cheer(1); }
      else if (outcome === "draw") battleSounds.cheer(0.8);
    }, outcome === "turns" ? 900 : RESULT_MS));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [outcome]);

  // The bar's flash fades quickly; a POWER UP wears off after a few seconds.
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFlash(null), 400);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  useEffect(() => {
    if (powerAt === null) return;
    const timer = window.setTimeout(() => setPowerAt(null), POWER_MS);
    return () => window.clearTimeout(timer);
  }, [powerAt]);

  const submit = () => {
    const kind = game.answer(typed);
    if (!kind) return;
    setTyped("");
    const at = Date.now();
    setFeedback({ kind, at });
    setFlash(kind === "wrong" ? "wrong" : "right");
    if (kind === "wrong") battleSounds.miss();
    else {
      battleSounds.surge();
      setCheer((n) => n + 1);
      if (kind === "power") { battleSounds.powerUp(); setPowerAt(at); }
    }
    requestAnimationFrame(() => input.current?.focus());
  };

  const friendScore = final?.status === "finished" ? final.friendScore ?? null : game.showLive ? game.friendCorrect : null;
  const myScore = final?.myScore ?? game.correct;
  // Once it's over, the clash shows the real scores (in take turns, the friend's was hidden till now).
  const clash = final?.status === "finished" ? clashPoint(myScore, friendScore ?? 0) : game.clash;
  const minutes = Math.floor(game.secondsLeft / 60), seconds = String(game.secondsLeft % 60).padStart(2, "0");
  const words = outcome && final ? finishWords(outcome, battle.friendName, final) : null;
  const xp = final?.xp ?? 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#07050f", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif", color: "#fff", touchAction: "manipulation" }}>
      <style>{STYLES}</style>
      <Canvas camera={{ fov: 50, near: 0.1, far: 200, position: [-24, 12, -14] }} dpr={[1, 1.75]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} style={{ position: "absolute", inset: 0 }}>
        <BattleArenaScene stage={stage} clash={clash} mySurges={game.correct} friendSurges={game.friendCorrect} power={powered} outcome={stage === "finish" ? outcome : null} cheer={cheer} myName={myName} friendName={battle.friendName} myScore={myScore} friendScore={friendScore} />
      </Canvas>

      {/* Top: leave, the two players and the tug of war, sound. */}
      <div style={{ position: "absolute", left: 16, right: 16, top: "calc(env(safe-area-inset-top, 0px) + 12px)", display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => (stage === "battle" && !game.done ? setLeaving(true) : router.push(hubHref))} aria-label="Leave the arena" style={iconButton}><X size={20} aria-hidden="true" /></button>
        {stage === "intro" ? <div style={{ flex: 1 }} /> : <>
          <PlayerChip name="You" score={myScore} colour={VIOLET} ink="#fff" />
          <TugBar clash={stage === "finish" && (outcome === "me" || outcome === "friend") ? (outcome === "me" ? 1.19 : -1.19) : clash} />
          <PlayerChip name={battle.friendName} score={friendScore} colour={LIME} ink="#103a17" right />
        </>}
        <MuteButton />
      </div>
      {stage === "battle" && !game.done ? (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "calc(env(safe-area-inset-top, 0px) + 66px)", ...glass, borderRadius: 99, padding: "5px 14px", fontFamily: display, fontWeight: 900, fontSize: 16, fontVariantNumeric: "tabular-nums", color: game.secondsLeft <= 30 ? "#ff8a5a" : "#fff" }}>
          ⏱ {minutes}:{seconds}
        </div>
      ) : null}

      {/* The intro: who's battling, in what. */}
      {stage === "intro" ? (
        <div style={{ position: "absolute", left: 16, right: 16, top: "50%", transform: "translateY(-50%)", display: "grid", justifyItems: "center", gap: 14, textAlign: "center", animation: "ba-rise .5s both" }}>
          <span style={{ fontFamily: display, fontWeight: 900, letterSpacing: ".22em", color: GOLD, fontSize: 14 }}>BATTLE ARENA</span>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 3vw, 22px)", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ ...button(VIOLET), height: "auto", padding: "12px 22px", fontSize: "clamp(22px, 5vw, 34px)", boxShadow: `0 0 34px ${VIOLET}` }}>YOU</span>
            <span style={{ fontFamily: display, fontWeight: 900, fontSize: "clamp(30px, 7vw, 52px)", textShadow: "0 0 24px rgba(255,255,255,.6)" }}>VS</span>
            <span style={{ ...button(LIME, "#103a17"), height: "auto", padding: "12px 22px", fontSize: "clamp(22px, 5vw, 34px)", boxShadow: `0 0 34px ${LIME}`, maxWidth: "80vw", overflow: "hidden", textOverflow: "ellipsis" }}>{battle.friendName.toUpperCase()}</span>
          </div>
          <span style={{ ...glass, borderRadius: 99, padding: "8px 16px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 99, background: reliqRealmColor(battle.realm) }} />{realm.name} · {BATTLE_QUESTIONS} quick questions · most right wins
          </span>
          {battle.mode === "turns" && !demo ? <span style={{ fontSize: 14, opacity: .8 }}>Take turns: {battle.friendName} plays theirs later, then the showdown.</span> : null}
        </div>
      ) : null}

      {/* 3, 2, 1, LAUNCH! */}
      {count !== null ? (
        <div key={String(count)} aria-live="assertive" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <span style={{ fontFamily: display, fontWeight: 900, fontSize: count === "LAUNCH!" ? "clamp(52px, 13vw, 120px)" : "clamp(90px, 22vw, 190px)", color: count === "LAUNCH!" ? GOLD : "#fff", textShadow: `0 0 40px ${count === "LAUNCH!" ? GOLD : VIOLET}`, animation: "ba-pop .7s both", letterSpacing: ".02em" }}>{count}</span>
        </div>
      ) : null}

      {/* POWER UP! */}
      {powerAt !== null ? (
        <div key={powerAt} role="status" style={{ position: "absolute", left: "50%", top: "calc(env(safe-area-inset-top, 0px) + 110px)", animation: `ba-banner ${POWER_MS}ms both`, textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: display, fontWeight: 900, fontSize: "clamp(40px, 10vw, 84px)", background: `linear-gradient(180deg, #fff6c4, ${GOLD} 55%, #ff9a3c)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "ba-glow .8s infinite", whiteSpace: "nowrap" }}>POWER UP!</div>
          <div style={{ fontWeight: 900, letterSpacing: ".14em", fontSize: 14 }}>{POWER_UP_STREAK} IN A ROW · YOUR BEAM SURGES</div>
        </div>
      ) : null}

      {/* The question bar (then, once done, the wait for the result). */}
      {stage === "battle" && count === null && !leaving ? (
        <div className="ba-bottom" style={{ position: "absolute", left: 16, right: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ ...glass, width: "min(820px, 100%)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", borderColor: flash === "wrong" ? "#ff8a5a" : flash === "right" ? "#7dff8a" : "rgba(255,255,255,.14)", animation: flash === "wrong" ? "ba-shake .35s" : undefined, position: "relative" }}>
            {game.question ? <>
              <div style={{ display: "grid", gap: 4, flex: "none" }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: "#e9b8fa" }}>Q {game.index + 1} / {game.total}</span>
                <span aria-label={`${game.streak % POWER_UP_STREAK} of ${POWER_UP_STREAK} towards a power up`} style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: POWER_UP_STREAK }, (_, i) => <span key={i} style={{ width: 14, height: 6, borderRadius: 99, background: i < game.streak % POWER_UP_STREAK || powered ? GOLD : "rgba(255,255,255,.18)" }} />)}
                </span>
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 0, fontFamily: display, fontWeight: 900, fontSize: "clamp(22px, 4.6vw, 34px)", lineHeight: 1.15 }}>{game.question.prompt}</div>
              <form onSubmit={(event) => { event.preventDefault(); submit(); }} style={{ display: "flex", gap: 8, flex: "1 1 220px", maxWidth: 320 }}>
                <input ref={input} value={typed} onChange={(event) => setTyped(event.target.value)} inputMode="decimal" autoComplete="off" aria-label="Your answer" style={{ flex: 1, minWidth: 0, height: 54, borderRadius: 14, border: 0, background: "#fff", color: "#1f2328", fontSize: 28, fontWeight: 900, padding: "0 16px" }} />
                <button type="submit" style={button("#7dff8a", "#103a17")}>GO</button>
              </form>
              {feedback && feedback.kind !== "wrong" ? <span key={feedback.at} aria-hidden="true" style={{ position: "absolute", right: 24, top: -8, fontFamily: display, fontWeight: 900, fontSize: 26, color: "#7dff8a", animation: "ba-plus .8s both", pointerEvents: "none" }}>+1</span> : null}
            </> : <div style={{ flex: 1, textAlign: "center", fontFamily: display, fontWeight: 900, fontSize: 20, padding: "8px 0" }}>{game.result && battle.mode === "live" ? `Waiting for ${battle.friendName} to finish…` : "Adding up…"}</div>}
          </div>
        </div>
      ) : null}
      {/* Leaving in the middle: the score so far counts. */}
      {leaving ? (
        <div role="dialog" aria-label="Leave the battle?" className="ba-bottom" style={{ position: "absolute", left: 16, right: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ ...glass, padding: 18, display: "grid", gap: 12, width: "min(460px, 100%)", textAlign: "center" }}>
            <strong style={{ fontFamily: display, fontSize: 20 }}>Leave the battle?</strong>
            <span style={{ opacity: .85 }}>Your {game.correct} right so far will count.</span>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => { setLeaving(false); requestAnimationFrame(() => input.current?.focus()); }} style={button("#7dff8a", "#103a17")}>KEEP BATTLING</button>
              <button type="button" onClick={() => { setLeaving(false); game.leave(); }} style={button("rgba(255,255,255,.14)")}>LEAVE</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* The result. */}
      {showResult && words ? <>
        {outcome === "me" || outcome === "draw" ? <Confetti /> : null}
        <div className="ba-bottom" style={{ position: "absolute", left: 16, right: 16, display: "flex", justifyContent: "center" }}>
          <div style={{ ...glass, padding: "20px 22px", width: "min(480px, 100%)", display: "grid", justifyItems: "center", gap: 12, textAlign: "center", animation: "ba-rise .45s both", borderColor: outcome === "me" ? GOLD : "rgba(255,255,255,.14)" }}>
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: "clamp(42px, 11vw, 72px)", lineHeight: 1, ...(outcome === "me" ? { background: `linear-gradient(180deg, #fff6c4, ${GOLD} 55%, #ff9a3c)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animation: "ba-glow 1.2s infinite" } : {}) }}>{words.title}</div>
            <div style={{ fontWeight: 700, fontSize: 16, opacity: .9 }}>{words.line}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: display, fontWeight: 900, fontSize: 30, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: VIOLET }}>{myScore}</span><span style={{ opacity: .6, fontSize: 18 }}>{outcome === "turns" ? `of ${BATTLE_QUESTIONS}` : "–"}</span>{outcome === "turns" ? null : <span style={{ color: LIME }}>{friendScore ?? "?"}</span>}
            </div>
            {xp ? <span style={{ ...button(GOLD, "#3a2a00"), height: "auto", padding: "10px 20px", fontSize: 24, animation: "ba-xp .7s .2s both" }}>+{xp} XP</span>
              : final?.status !== "error" ? <span style={{ fontSize: 13, opacity: .75 }}>No XP this time (today&apos;s battle XP is used up), but it still counts!</span> : null}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
              <button type="button" onClick={() => router.push(rematchHref(battle, demo))} style={{ ...button("#C94DF2"), display: "inline-flex", alignItems: "center", gap: 8 }}><Swords size={18} aria-hidden="true" />REMATCH</button>
              <button type="button" onClick={() => router.push(hubHref)} style={button("rgba(255,255,255,.14)")}>BACK TO THE HUB</button>
            </div>
          </div>
        </div>
      </> : null}
    </div>
  );
}
