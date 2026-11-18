"use client";

import { ChartColumn, Dices, Hourglass, Orbit, Sigma, Timer } from "lucide-react";
import { lessonBarTheme } from "@/lib/lesson-bar-theme";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function LessonTimer({
  seconds,
  total,
  realmId,
}: {
  seconds: number;
  total: number;
  realmId?: string;
}) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isChance = realmId === "chance";
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  const pct = total > 0 ? (clamped / total) * 100 : 0;

  // Color state
  const state =
    pct > 50 ? "ok" : pct > 12 ? "warn" : "danger";

  // Normal time in the realm's colours; running low and almost out look the same in every realm.
  const theme = lessonBarTheme(realmId);
  const palette = state === "ok"
    ? { bezel: theme.bezel, bg: theme.plate, text: theme.text, icon: theme.accent, glow: theme.glow }
    : state === "warn"
      ? { bezel: "linear-gradient(135deg, rgba(251,191,36,0.6) 0%, rgba(120,53,15,0.3) 50%, rgba(251,191,36,0.48) 100%)", bg: "linear-gradient(135deg, #1a1305 0%, #2e1f05 50%, #4a3a0a 100%)", text: "#fef3c7", icon: "#fcd34d", glow: "rgba(251,191,36,0.5)" }
      : { bezel: "linear-gradient(135deg, rgba(248,113,113,0.6) 0%, rgba(127,29,29,0.32) 50%, rgba(248,113,113,0.5) 100%)", bg: "linear-gradient(135deg, #1a0505 0%, #2e0a0a 50%, #4a1010 100%)", text: "#fee2e2", icon: "#fca5a5", glow: "rgba(248,113,113,0.55)" };
  const IconCmp = isMeasurement ? Hourglass : isStarpath ? Orbit : isStatistics ? ChartColumn : isPattern ? Sigma : isChance ? Dices : Timer;

  return (
    <div className="relative inline-block h-full min-w-[100px]">
      <div aria-hidden className="pointer-events-none absolute -inset-[2px] rounded-xl" style={{ background: palette.bezel }} />
      <div
        className="relative inline-flex h-full w-full items-center justify-center gap-1.5 overflow-hidden rounded-[10px] px-3 py-2 transition-colors duration-500"
        style={{ background: palette.bg, boxShadow: theme.plateShadow }}
      >
        <IconCmp className="relative h-3.5 w-3.5" style={{ color: palette.icon, filter: `drop-shadow(0 0 3px ${palette.glow})` }} />
        <span
          className="relative text-sm font-mono font-extrabold tabular-nums tracking-wider md:text-[15px]"
          style={{ color: palette.text, textShadow: `0 0 8px ${palette.glow}` }}
        >
          {minutes}:{pad2(remaining)}
        </span>
      </div>
    </div>
  );
}
