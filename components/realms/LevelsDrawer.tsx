"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Eye, Lock } from "lucide-react";
import type { StudentProgress } from "@/data/progress";
import type { LegendRealmId } from "@/data/legends";
import { buildRealmLevelHref, isLevelUnlocked, LEVEL_CATALOG } from "@/lib/level-catalog";
import { enterReviewMode, exitReviewMode } from "@/lib/review-mode";

// The Levels control lives INSIDE a realm (in its HUD). Students enter a realm on
// their placed level and can revisit earlier levels from here — never from the
// Tower. Revisiting a passed level opens it read-only (Review Mode); the placed
// level stays the source of truth.
export default function LevelsDrawer({
  realmId,
  progress,
  viewingYear,
  isPreview,
  accent = "#5eead4",
}: {
  realmId: "number-nexus" | "measurelands";
  progress: StudentProgress | null;
  viewingYear: string;
  isPreview: boolean;
  accent?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const currentYear = progress?.year;
  const legendRealm: LegendRealmId = realmId === "measurelands" ? "measurelands" : "number-nexus";
  const reviewing =
    !isPreview &&
    !!currentYear &&
    viewingYear !== currentYear &&
    LEVEL_CATALOG.findIndex((l) => l.id === viewingYear) < LEVEL_CATALOG.findIndex((l) => l.id === currentYear);

  const viewNum = viewingYear === "Prep" ? 0 : parseInt(viewingYear.replace(/\D/g, ""), 10) || 1;
  const triggerLabel = viewingYear === "Prep" ? "GROUND" : `LV ${viewNum}`;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function selectLevel(targetYear: string) {
    setOpen(false);
    if (targetYear === viewingYear) return;
    const { href, review } = buildRealmLevelHref(realmId, targetYear, currentYear, isPreview);
    // Set the review flag now so the destination's write-gating is correct before
    // navigation; clear it when switching to a non-review (current) level.
    if (review) enterReviewMode(realmId, targetYear);
    else exitReviewMode();
    router.push(href);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition hover:brightness-110"
        style={
          reviewing
            ? { background: "rgba(245,158,11,0.16)", border: "1px solid rgba(245,158,11,0.45)" }
            : { background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}44` }
        }
      >
        {reviewing ? (
          <span style={{ color: "#fbbf24", fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace" }}>
            👁 REVIEW · {triggerLabel}
          </span>
        ) : (
          <span style={{ color: accent, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>
            {triggerLabel}
          </span>
        )}
        <ChevronDown size={11} color={reviewing ? "#fbbf24" : accent} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] w-[248px] rounded-2xl border p-3 backdrop-blur-xl"
          style={{ background: "rgba(8,10,16,0.94)", borderColor: "rgba(255,255,255,0.14)", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", zIndex: 60 }}
        >
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Levels · revisit past levels
          </div>
          <div className="flex flex-col gap-1">
            {LEVEL_CATALOG.map((lvl) => {
              const unlocked = isLevelUnlocked(lvl.id, progress, { forceOpen: isPreview, realmId: legendRealm });
              const isPlaced = !!currentYear && lvl.id === currentYear;
              const isViewing = lvl.id === viewingYear;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && selectLevel(lvl.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition",
                    !unlocked ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-white/10",
                  ].join(" ")}
                  style={
                    isPlaced
                      ? { background: "rgba(94,234,212,0.14)", border: `1px solid ${accent}66` }
                      : isViewing
                      ? { background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.4)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  <span className={`text-sm font-semibold ${isPlaced ? "text-white" : "text-white/80"}`}>{lvl.label}</span>
                  {isPlaced ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                      Current <Check size={13} />
                    </span>
                  ) : isViewing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                      Viewing <Eye size={12} />
                    </span>
                  ) : !unlocked ? (
                    <Lock size={12} className="text-white/40" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
