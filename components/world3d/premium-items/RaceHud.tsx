"use client";
// The race overlay: 3-2-1-GO, the lap and its time, last and best laps, and buttons to restart or leave.
import { Flag, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatLapTime } from "@/lib/world3d/race-driving";
import type { RaceHud as RaceHudState } from "./RaceKartDriver";

const NEON = "#3fd0ff", PINK = "#ff4fd8";
const panel: React.CSSProperties = { background: "rgba(14,16,30,.88)", border: `2px solid ${NEON}`, borderRadius: 14, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.35)" };
const button: React.CSSProperties = { ...panel, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 46, padding: "0 16px", fontWeight: 900, fontSize: 15, letterSpacing: ".06em", cursor: "pointer" };

export function RaceHud({ hud, onRestart, onExit }: { hud: React.MutableRefObject<RaceHudState>; onRestart: () => void; onExit: () => void }) {
  const [view, setView] = useState<RaceHudState>(() => ({ ...hud.current }));
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    let frame = 0, last = 0, best = hud.current.bestLap, flash = 0;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (time - last < 66) return;
      last = time;
      const next = hud.current;
      if (next.bestLap !== null && next.bestLap !== best) {
        best = next.bestLap;
        setNewBest(true);
        window.clearTimeout(flash);
        flash = window.setTimeout(() => setNewBest(false), 2600);
      }
      setView({ ...next });
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(flash); };
  }, [hud]);

  const count = Math.ceil(view.countdown);
  const go = view.countdown === 0 && view.lap === 1 && view.lapTime < 1;
  return (
    <section aria-label="Race" data-race-hud style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "max(14px, env(safe-area-inset-top))", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, pointerEvents: "auto" }}>
        <div style={{ ...panel, padding: "8px 16px", display: "grid", justifyItems: "center", minWidth: 150 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".18em", color: NEON }}><Flag size={12} style={{ verticalAlign: -1 }} aria-hidden="true" /> LAP {view.lap}</span>
          <span data-race-time style={{ fontSize: 30, fontWeight: 950, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{formatLapTime(view.lapTime)}</span>
          <span style={{ fontSize: 12, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "#b9c3ff" }}>{Math.round(view.speed * 3.6)} km/h</span>
        </div>
        <div style={{ ...panel, padding: "8px 14px", display: "grid", gap: 2, fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 800 }}>
          <span><Timer size={13} style={{ verticalAlign: -2, color: NEON }} aria-hidden="true" /> Last {formatLapTime(view.lastLap)}</span>
          <span><Trophy size={13} style={{ verticalAlign: -2, color: "#ffd34d" }} aria-hidden="true" /> Best {formatLapTime(view.bestLap)}</span>
        </div>
      </div>

      {count > 0 || go ? (
        <div aria-live="assertive" style={{ position: "absolute", top: "34%", left: 0, right: 0, textAlign: "center", fontSize: "min(28vw, 160px)", fontWeight: 950, color: count > 0 ? "#fff" : "#3dff6a", textShadow: `0 0 30px ${count > 0 ? PINK : "#3dff6a"}, 0 6px 0 rgba(0,0,0,.35)` }}>{count > 0 ? count : "GO!"}</div>
      ) : null}
      {newBest ? <div role="status" style={{ position: "absolute", top: "22%", left: 0, right: 0, textAlign: "center", fontSize: 34, fontWeight: 950, color: "#ffd34d", textShadow: "0 0 24px #ff9d00, 0 4px 0 rgba(0,0,0,.35)" }}>NEW BEST LAP!</div> : null}
      {view.boosting ? <div style={{ position: "absolute", bottom: "26%", left: 0, right: 0, textAlign: "center", fontSize: 26, fontWeight: 950, color: NEON, textShadow: `0 0 20px ${NEON}` }}>BOOST!</div> : null}

      <div style={{ position: "absolute", top: "max(14px, env(safe-area-inset-top))", right: 14, display: "flex", gap: 8, pointerEvents: "auto" }}>
        <button type="button" onClick={onRestart} style={button} aria-label="Restart the race"><RotateCcw size={18} aria-hidden="true" />Restart</button>
        <button type="button" onClick={onExit} style={{ ...button, borderColor: PINK }} aria-label="Leave the race"><X size={18} aria-hidden="true" />Exit</button>
      </div>
    </section>
  );
}
