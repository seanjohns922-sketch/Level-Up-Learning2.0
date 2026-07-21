"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye, Lock } from "lucide-react";
import type { RealmDashboardLevelOption } from "./types";

function compactLabel(label: string) {
  if (/ground/i.test(label)) return "Ground";
  const number = label.match(/[1-6]/)?.[0];
  return number ? `Level ${number}` : label;
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
        <span style={{ textTransform: "uppercase" }}>{selected ? compactLabel(selected.label) : "Level"}</span>
        <ChevronDown
          size={12}
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 180ms ease" }}
        />
      </button>

      <div
        id="realm-level-panel"
        aria-label="Choose realm level"
        role="menu"
        className="realm-level-panel"
        style={{
          position: "fixed",
          top: 58,
          left: "50%",
          zIndex: 70,
          maxWidth: "calc(100vw - 24px)",
          padding: "12px 14px",
          borderRadius: 20,
          background: "rgba(8,10,20,0.96)",
          border: `1px solid ${accent}3a`,
          boxShadow: `0 16px 44px rgba(0,0,0,0.5), 0 0 20px ${accent}14`,
          backdropFilter: "blur(18px)",
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
          transform: `translateX(-50%) translateY(${open ? "0" : "-6px"}) scale(${open ? 1 : 0.98})`,
          transformOrigin: "top center",
          transition: "opacity 160ms ease, transform 180ms ease, visibility 180ms",
        }}
      >
        <div
          style={{
            marginBottom: 8,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "ui-monospace,monospace",
          }}
        >
          Levels · revisit past levels
        </div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {levels.map((level) => {
            const locked = level.state === "locked";
            const isSelected = level.id === selectedLevel;
            const isReviewing = level.state === "reviewing";
            const isCurrent = level.state === "current";

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
                  minWidth: 92,
                  minHeight: 54,
                  padding: "8px 14px",
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flexShrink: 0,
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.4 : 1,
                  background: isReviewing
                    ? "rgba(245,158,11,0.14)"
                    : isSelected ? `${accent}1f` : "rgba(255,255,255,0.045)",
                  border: isReviewing
                    ? "1px solid rgba(245,158,11,0.42)"
                    : `1px solid ${isSelected ? `${accent}66` : "rgba(255,255,255,0.09)"}`,
                  color: isReviewing ? "#fbbf24" : isSelected ? "#ffffff" : "rgba(255,255,255,0.8)",
                  transition: "border-color 160ms ease, background 160ms ease, color 160ms ease",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{level.label}</span>
                {isReviewing ? (
                  <Eye size={14} aria-hidden="true" style={{ color: "#fbbf24" }} />
                ) : isCurrent && isSelected ? (
                  <Check size={14} aria-hidden="true" style={{ color: accent }} />
                ) : locked ? (
                  <Lock size={13} aria-hidden="true" style={{ color: "rgba(255,255,255,0.4)" }} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
