"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye, Lock } from "lucide-react";
import type { RealmDashboardLevelOption } from "./types";

function compactLabel(label: string) {
  if (/ground/i.test(label)) return "Ground";
  const number = label.match(/[1-6]/)?.[0];
  return number ? `Level ${number}` : label;
}

function panelLabel(label: string) {
  if (/ground/i.test(label)) return "Ground";
  const number = label.match(/[1-6]/)?.[0];
  return number ? `Lv${number}` : label;
}

export default function RealmLevelSelector<TLevel extends string>({
  levels,
  selectedLevel,
  accent,
  onSelect,
}: {
  levels: RealmDashboardLevelOption<TLevel>[];
  selectedLevel: TLevel;
  accent: string;
  onSelect: (level: TLevel) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = levels.find((level) => level.id === selectedLevel) ?? levels[0];
  const reviewing = selected?.state === "reviewing";

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="realm-level-panel"
        className="realm-level-trigger"
        style={{
          minHeight: 34,
          padding: "0 11px",
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer",
          background: reviewing ? "rgba(245,158,11,0.16)" : "rgba(255,255,255,0.055)",
          border: reviewing ? "1px solid rgba(245,158,11,0.48)" : `1px solid ${accent}55`,
          color: reviewing ? "#fbbf24" : accent,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.08em",
          fontFamily: "ui-monospace,monospace",
          whiteSpace: "nowrap",
          transition: "border-color 160ms ease, background 160ms ease, filter 160ms ease",
        }}
      >
        {reviewing ? <Eye size={11} aria-hidden="true" /> : null}
        <span>{selected ? compactLabel(selected.label) : "Level"}</span>
        <ChevronDown
          size={12}
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 180ms ease" }}
        />
      </button>

      <nav
        id="realm-level-panel"
        aria-label="Choose realm level"
        role="menu"
        className="realm-level-panel"
        style={{
          position: "fixed",
          top: 60,
          left: "50%",
          zIndex: 70,
          display: "flex",
          alignItems: "center",
          gap: 4,
          maxWidth: "calc(100vw - 24px)",
          padding: 4,
          overflowX: "auto",
          scrollbarWidth: "none",
          borderRadius: 999,
          background: "rgba(7,10,22,0.96)",
          border: `1px solid ${accent}44`,
          boxShadow: `0 10px 28px rgba(0,0,0,0.42), 0 0 18px ${accent}18`,
          backdropFilter: "blur(16px)",
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
          transform: `translateX(-50%) translateY(${open ? "0" : "-6px"}) scale(${open ? 1 : 0.98})`,
          transformOrigin: "top center",
          transition: "opacity 160ms ease, transform 180ms ease, visibility 180ms",
        }}
      >
        {levels.map((level) => {
          const locked = level.state === "locked";
          const isSelected = level.id === selectedLevel;
          const isReviewing = level.state === "reviewing";

          return (
            <button
              key={level.id}
              type="button"
              role="menuitem"
              disabled={locked}
              onClick={() => {
                if (locked) return;
                setOpen(false);
                onSelect(level.id);
              }}
              aria-current={isSelected ? "page" : undefined}
              aria-label={`${level.label}${locked ? ", locked" : isReviewing ? ", review mode" : ""}`}
              title={level.label}
              style={{
                height: 28,
                minWidth: /ground/i.test(level.label) ? 66 : 43,
                padding: "0 9px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                flexShrink: 0,
                cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.38 : 1,
                background: isReviewing
                  ? "rgba(245,158,11,0.16)"
                  : isSelected ? `${accent}22` : "rgba(255,255,255,0.045)",
                border: isReviewing
                  ? "1px solid rgba(245,158,11,0.48)"
                  : `1px solid ${isSelected ? `${accent}88` : "rgba(255,255,255,0.1)"}`,
                color: isReviewing ? "#fbbf24" : isSelected ? accent : "rgba(255,255,255,0.72)",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.08em",
                fontFamily: "ui-monospace,monospace",
                whiteSpace: "nowrap",
                transition: "border-color 160ms ease, background 160ms ease, color 160ms ease",
              }}
            >
              {panelLabel(level.label)}
              {locked ? <Lock size={9} aria-hidden="true" /> : null}
              {isReviewing ? <Eye size={9} aria-hidden="true" /> : null}
              {level.state === "current" && isSelected ? <Check size={9} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
