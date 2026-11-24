"use client";
// Visiting a friend's world: the banner saying whose world you're in (and whether you're helping build),
// with GO HOME. And back home, the card telling the owner what a friend changed, to keep or undo.
import { Home } from "lucide-react";
import { describeFriendChanges, summariseFriendChanges } from "@/lib/world3d/friend-changes";
import type { VisitorChange } from "@/lib/friends";

const card: React.CSSProperties = { background: "rgba(20,14,40,.95)", color: "#fff", borderRadius: 22, border: "2px solid #C94DF299", boxShadow: "0 18px 50px rgba(0,0,0,.4)", fontFamily: "Inter, system-ui, sans-serif" };
const pill = (background: string, color = "#fff"): React.CSSProperties => ({ border: 0, borderRadius: 12, padding: "10px 16px", background, color, fontWeight: 900, fontSize: 14, fontFamily: "Montserrat, Inter, sans-serif", letterSpacing: ".04em", cursor: "pointer" });
const possessive = (name: string) => `${name.toUpperCase()}${name.toLowerCase().endsWith("s") ? "'" : "'S"}`;

export function VisitBanner({ name, canBuild, onGoHome }: { name: string; canBuild: boolean; onGoHome: () => void }) {
  return (
    <div style={{ position: "absolute", top: "max(84px, calc(env(safe-area-inset-top) + 76px))", left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10, zIndex: 56, pointerEvents: "none", padding: "0 16px", flexWrap: "wrap" }}>
      <div style={{ background: canBuild ? "#2fa36b" : "#C94DF2", color: "#fff", padding: "8px 22px", borderRadius: 22, fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: "clamp(14px, 2.2vw, 19px)", letterSpacing: ".04em", boxShadow: "0 10px 30px rgba(0,0,0,.35)", textAlign: "center" }}>
        {canBuild ? `HELPING BUILD ${possessive(name)} WORLD` : `VISITING ${possessive(name)} WORLD`}
        <small style={{ display: "block", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 0, opacity: .92 }}>
          {canBuild ? `Tap BUILD to place and move things. ${name} can keep or undo it.` : "Visit only: look around. Nothing here changes."}
        </small>
      </div>
      <button type="button" onClick={onGoHome} style={{ ...pill("rgba(20,14,40,.9)"), pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid rgba(255,255,255,.3)" }}><Home size={17} aria-hidden="true" />GO HOME</button>
    </div>
  );
}

export function VisitorChangesCard({ change, busy, onKeep, onUndo }: { change: VisitorChange; busy: boolean; onKeep: () => void; onUndo: () => void }) {
  const summary = describeFriendChanges(summariseFriendChanges(
    { placements: change.beforePlacements, groundTiles: change.beforeGroundTiles },
    { placements: change.afterPlacements, groundTiles: change.afterGroundTiles },
  ));
  return (
    <div role="dialog" aria-label={`${change.helperName} changed your world`} style={{ ...card, position: "absolute", left: "50%", transform: "translateX(-50%)", top: "max(150px, calc(env(safe-area-inset-top) + 142px))", width: "min(440px, calc(100vw - 32px))", padding: 20, display: "flex", flexDirection: "column", gap: 12, zIndex: 65 }}>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: "#e9b8fa" }}>WHILE YOU WERE AWAY</span>
      <div style={{ fontWeight: 900, fontSize: 18 }}>{change.helperName} helped build your world<small style={{ display: "block", fontWeight: 600, fontSize: 14, opacity: .8, marginTop: 4 }}>{summary.charAt(0).toUpperCase() + summary.slice(1)}.</small></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={busy} onClick={onKeep} style={{ ...pill("#7dff8a", "#103a17"), flex: 1 }}>KEEP IT!</button>
        <button type="button" disabled={busy} onClick={onUndo} style={{ ...pill("rgba(255,255,255,.12)"), flex: 1 }}>UNDO {change.helperName.toUpperCase()}&apos;S</button>
      </div>
    </div>
  );
}
