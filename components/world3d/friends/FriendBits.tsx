"use client";
// Shared by the Friends panel, MY CLASS, the request pop-up and a friend's page: a friend's real explorer
// face, the "in my world" choice (VISIT ONLY or CAN HELP BUILD), and the plain-words how-tos.
import { Eye, Hammer } from "lucide-react";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import { friendLook, type FriendOutfit } from "@/lib/friends";

export const VIOLET = "#C94DF2";
export const GOLD = "#ffcf4a";
export const GREEN = "#7dff8a";
export const LILAC = "#e9b8fa";
export const HEADING = "Montserrat, Inter, sans-serif";

export const panelStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(36,22,70,.97), rgba(20,14,40,.97))", color: "#fff", borderRadius: 24,
  border: `2px solid ${VIOLET}99`, boxShadow: "0 18px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)", fontFamily: "Inter, system-ui, sans-serif",
};
export const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: LILAC };
export const pill = (background: string, color = "#fff"): React.CSSProperties => ({
  border: 0, borderRadius: 14, padding: "10px 14px", background, color, fontWeight: 900, fontSize: 14, fontFamily: HEADING,
  letterSpacing: ".04em", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  boxShadow: background.startsWith("rgba") || background === "transparent" ? "none" : "0 4px 0 rgba(0,0,0,.28)",
});
/** Keeps taps and keys in a panel from moving the explorer in the hub behind it. */
export const stopHub = {
  onPointerDown: (event: React.PointerEvent) => event.stopPropagation(),
  onKeyDown: (event: React.KeyboardEvent) => event.stopPropagation(),
  onKeyUp: (event: React.KeyboardEvent) => event.stopPropagation(),
};

/** A friend's explorer, head and shoulders in a round frame, glowing green when they're in the hub. */
export function FriendFace({ outfit, size = 52, online = false }: { outfit?: FriendOutfit; size?: number; online?: boolean }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, borderRadius: 999, flex: "none", overflow: "hidden", display: "grid", placeItems: "end center", position: "relative",
      background: "radial-gradient(circle at 50% 35%, #5b3c9e, #2a1a52)",
      border: `3px solid ${online ? GREEN : "rgba(255,255,255,.22)"}`, boxShadow: online ? `0 0 14px ${GREEN}99` : "none",
    }}>
      <StudentAvatar outfit={friendLook(outfit)} framing="head" height={Math.round(size * 1.02)} alive={false} glowColor="transparent" floatAnimation="none" />
    </span>
  );
}

/** "When was that": Friends since 2 Nov. */
export const shortDate = (at: string | null | undefined) => (at ? new Date(at).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : null);

/**
 * The owner's choice for one friend in their world: VISIT ONLY (look around, nothing changes) or CAN HELP
 * BUILD (place and move things; the owner keeps or undoes it after). Off when a teacher or grown-up has
 * switched building together off.
 */
export function WorldAccessChoice({ name, canBuild, enabled, busy, onChange, compact = false }: { name: string; canBuild: boolean; enabled: boolean; busy?: boolean; onChange: (canBuild: boolean) => void; compact?: boolean }) {
  const option = (build: boolean) => {
    const on = canBuild === build;
    const Icon = build ? Hammer : Eye;
    return (
      <button type="button" role="radio" aria-checked={on} disabled={busy || !enabled || on} onClick={() => onChange(build)}
        style={{
          flex: 1, minWidth: 0, border: `2px solid ${on ? (build ? GREEN : LILAC) : "transparent"}`, borderRadius: 14, padding: compact ? "8px 8px" : "12px 12px",
          background: on ? (build ? "rgba(125,255,138,.16)" : "rgba(233,184,250,.16)") : "rgba(255,255,255,.06)", color: "#fff", cursor: busy || !enabled || on ? "default" : "pointer",
          textAlign: "left", display: "flex", flexDirection: "column", gap: 3, opacity: !enabled && build ? 0.45 : 1,
        }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: HEADING, fontWeight: 900, fontSize: compact ? 12 : 14, letterSpacing: ".04em", color: on ? (build ? GREEN : LILAC) : "#fff" }}>
          <Icon size={compact ? 14 : 17} aria-hidden="true" />{build ? "CAN HELP BUILD" : "VISIT ONLY"}
        </span>
        {compact ? null : <span style={{ fontSize: 13, fontWeight: 600, opacity: .85, lineHeight: 1.35 }}>
          {build ? `${name} can place and move things. You'll see what changed and can keep it or undo it.` : `${name} can walk around and look. Nothing in your world changes.`}
        </span>}
      </button>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div role="radiogroup" aria-label={`What ${name} can do in your world`} style={{ display: "flex", gap: 8 }}>{option(false)}{option(true)}</div>
      {!enabled ? <span style={{ fontSize: 12, fontWeight: 600, opacity: .75 }}>Building together is switched off by your teacher or grown-up. Friends can still visit.</span> : null}
    </div>
  );
}

/** The three things friends do, in plain words (Friends panel and a friend's page). */
export function howTos(name = "your friend") {
  return [
    { key: "battle", title: "Battle", text: `Tap BATTLE, pick a realm, then LIVE (you both play now) or TAKE TURNS (${name} plays later). You each get 20 quick questions at your own level. Most right wins.` },
    { key: "build", title: "Build in their world", text: `${name} has to choose CAN HELP BUILD for you. Then tap VISIT WORLD and BUILD to place and move things. They can keep or undo what you change.` },
    { key: "visit", title: "Visit only", text: "Every friend can visit your world and look around. Choose VISIT ONLY and nothing they do changes it. CAN HELP BUILD lets them build too." },
  ] as const;
}
