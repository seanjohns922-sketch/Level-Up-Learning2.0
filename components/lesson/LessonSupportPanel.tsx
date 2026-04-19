"use client";

import { Lightbulb } from "lucide-react";
import { MathFormattedText } from "@/components/FractionText";

export function LessonSupportPanel({
  hint,
}: {
  hint?: string | null;
}) {
  if (!hint) return null;
  return (
    <div className="relative">
      {/* Amber Nexus alert bezel */}
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={{
          clipPath:
            "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.55) 0%, rgba(120,53,15,0.3) 50%, rgba(251,191,36,0.45) 100%)",
        }}
      />
      <div
        className="relative px-4 py-3.5 overflow-hidden"
        style={{
          clipPath:
            "polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)",
          background:
            "linear-gradient(135deg, #1a1305 0%, #2e1f05 50%, #3d2808 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(251,191,36,0.3), inset 0 -10px 20px rgba(0,0,0,0.45), 0 0 18px rgba(251,191,36,0.12)",
        }}
      >
        {/* Scanlines */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(251,191,36,0.5) 0px, rgba(251,191,36,0.5) 1px, transparent 1px, transparent 3px)",
          }}
        />
        <div className="relative mb-1.5 flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center"
            style={{
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              background:
                "radial-gradient(circle at 35% 30%, #fbbf24 0%, #b45309 65%, #451a03 100%)",
              boxShadow:
                "inset 0 0 6px rgba(254,240,138,0.65), 0 0 10px rgba(251,191,36,0.45)",
            }}
          >
            <Lightbulb
              className="h-3.5 w-3.5 text-amber-50"
              style={{ filter: "drop-shadow(0 0 3px rgba(254,240,138,0.9))" }}
            />
          </div>
          <span
            className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-amber-200"
            style={{ textShadow: "0 0 8px rgba(251,191,36,0.5)" }}
          >
            Hint
          </span>
        </div>
        <p className="relative text-sm font-medium text-amber-50/95 leading-relaxed whitespace-pre-line md:text-[15px]">
          <MathFormattedText text={hint} />
        </p>
      </div>
    </div>
  );
}
