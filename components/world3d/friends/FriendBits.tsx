"use client";
// Shared by the Friends panel, MY CLASS, the request pop-up, the knock screens and a friend's page: a friend's
// real explorer face, the panel look, and the plain-words how-tos.
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

/** The three things friends do, in plain words (Friends panel and a friend's page). */
export function howTos(name = "your friend") {
  return [
    { key: "battle", title: "Battle", text: `Tap BATTLE, pick a realm, then LIVE (you both play now) or TAKE TURNS (${name} plays later). You each get 20 quick questions at your own level. Most right wins.` },
    { key: "visit", title: "Visit their world", text: `When ${name} is in the hub, tap KNOCK. They let you in to LOOK (walk around, nothing changes) or to BUILD.` },
    { key: "build", title: "Build together", text: "Building only happens while the owner is there and has said BUILD. They can switch you to LOOK or send you home any time, and keep or undo what you built." },
  ] as const;
}
