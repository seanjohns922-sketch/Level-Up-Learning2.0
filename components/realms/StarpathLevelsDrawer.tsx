"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { STARPATH_LEVELS, type StarpathLevelId } from "@/lib/starpath-levels";
import { buildStarpathWorldHref } from "@/lib/starpath-routes";

// Starpath's in-realm Levels control — mirrors the number/measurement LevelsDrawer
// look + flow, but drives Starpath's own levels + world routes. Starpath is a
// demo/preview realm, so every level is reachable from here.
export default function StarpathLevelsDrawer({
  selectedLevel,
  accent = "#9be7ff",
  openDirection = "down",
}: {
  selectedLevel: StarpathLevelId;
  accent?: string;
  openDirection?: "down" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const current = STARPATH_LEVELS.find((lvl) => lvl.id === selectedLevel);
  const triggerLabel = current && current.levelNumber === 0 ? "GROUND" : `LV ${current?.levelNumber ?? 1}`;

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

  function selectLevel(id: StarpathLevelId) {
    setOpen(false);
    if (id === selectedLevel) return;
    // Full navigation: the world reads its level once on mount, so switching
    // levels must re-initialise from the new URL.
    window.location.assign(buildStarpathWorldHref({ selectedLevel: id, placementLevel: null }));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition hover:brightness-110"
        style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}44` }}
      >
        <span style={{ color: accent, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>{triggerLabel}</span>
        {openDirection === "right" ? <ChevronRight size={11} color={accent} /> : <ChevronDown size={11} color={accent} />}
      </button>

      {open ? (
        <div
          className={[
            "absolute w-[248px] rounded-2xl border p-3 backdrop-blur-xl",
            openDirection === "right" ? "left-0 top-[calc(100%+8px)]" : "left-0 top-[calc(100%+8px)]",
          ].join(" ")}
          style={{ background: "rgba(8,10,16,0.94)", borderColor: "rgba(255,255,255,0.14)", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", zIndex: 60 }}
          role="menu"
        >
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Levels · jump to any level</div>
          <div className="flex flex-col gap-1">
            {STARPATH_LEVELS.map((lvl) => {
              const isViewing = lvl.id === selectedLevel;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => selectLevel(lvl.id)}
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
                  style={
                    isViewing
                      ? { background: `${accent}22`, border: `1px solid ${accent}66` }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  <span className={`text-sm font-semibold ${isViewing ? "text-white" : "text-white/80"}`}>{lvl.displayLabel}</span>
                  {isViewing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                      Current <Check size={13} />
                    </span>
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
