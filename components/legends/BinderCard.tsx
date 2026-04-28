"use client";

import { Lock } from "lucide-react";
import type { Legend } from "@/data/legends";

export default function BinderCard({
  legend,
  isUnlocked,
  onClick,
}: {
  legend: Legend;
  isUnlocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className="group relative w-full"
      title={
        isUnlocked
          ? `View ${legend.name}`
          : `Unlock by completing the ${legend.yearLabel} Number program.`
      }
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300 aspect-[2/3]"
        style={{
          border: isUnlocked
            ? "2px solid hsla(160, 50%, 55%, 0.5)"
            : "2px solid hsla(160, 20%, 42%, 0.28)",
          boxShadow: isUnlocked
            ? "0 4px 20px hsla(160, 50%, 45%, 0.2), 0 0 0 1px hsla(160, 50%, 60%, 0.1)"
            : "0 8px 22px hsla(170, 60%, 2%, 0.24)",
          transform: "translateY(0)",
          cursor: isUnlocked ? "pointer" : "default",
        }}
        onMouseEnter={(e) => {
          if (isUnlocked) {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 8px 28px hsla(160, 50%, 45%, 0.3), 0 0 16px hsla(160, 50%, 55%, 0.15), 0 0 0 1px hsla(160, 50%, 60%, 0.2)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          if (isUnlocked) {
            e.currentTarget.style.boxShadow =
              "0 4px 20px hsla(160, 50%, 45%, 0.2), 0 0 0 1px hsla(160, 50%, 60%, 0.1)";
          } else {
            e.currentTarget.style.boxShadow = "0 8px 22px hsla(170, 60%, 2%, 0.24)";
          }
        }}
      >
        {/* Card artwork */}
        <div className="absolute inset-0">
          <img
            src={legend.images.cardFront}
            alt={legend.name}
            className="h-full w-full object-cover transition-all duration-300"
            style={{
              filter: isUnlocked ? "none" : "blur(2px) grayscale(60%)",
              opacity: isUnlocked ? 1 : 0.5,
            }}
          />
        </div>

        {/* Unlocked hover glow overlay */}
        {isUnlocked && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, hsla(160, 50%, 30%, 0.25), transparent 60%)",
            }}
          />
        )}

        {/* Lock overlay — subtler, silhouette visible */}
        {!isUnlocked && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "hsla(170, 32%, 5%, 0.42)" }}
          >
            <div
              className="p-2.5 rounded-full"
              style={{
                background: "hsla(166, 36%, 10%, 0.78)",
                backdropFilter: "blur(4px)",
                border: "1px solid hsla(160, 42%, 54%, 0.22)",
                boxShadow: "0 2px 10px hsla(170, 60%, 2%, 0.28)",
              }}
            >
              <Lock className="h-4 w-4" style={{ color: "hsl(160, 26%, 64%)" }} />
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {isUnlocked ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wide text-white shadow"
              style={{
                background: "hsla(155, 60%, 42%, 0.9)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 0 8px hsla(155, 60%, 45%, 0.3)",
                fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif",
              }}
            >
              ✦ UNLOCKED
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wide shadow"
              style={{
                background: "hsla(166, 38%, 10%, 0.72)",
                backdropFilter: "blur(4px)",
                color: "hsl(160, 20%, 66%)",
                border: "1px solid hsla(160, 32%, 48%, 0.18)",
                fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif",
              }}
            >
              <Lock className="h-2 w-2" /> LOCKED
            </span>
          )}
        </div>

        {/* Bottom label */}
        <div
          className="absolute bottom-0 inset-x-0 p-2.5"
          style={{
            background: "linear-gradient(to top, hsla(0, 0%, 0%, 0.6), hsla(0, 0%, 0%, 0.3) 60%, transparent)",
          }}
        >
          <p
            className="text-[9px] font-bold tracking-wider"
            style={{ color: "hsla(0, 0%, 100%, 0.7)", fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif" }}
          >
            {legend.yearLabel.toUpperCase()}
          </p>
          <p
            className="text-xs font-extrabold leading-tight"
            style={{ color: isUnlocked ? "white" : "hsla(0, 0%, 100%, 0.55)" }}
          >
            {legend.name}
          </p>
        </div>
      </div>
    </button>
  );
}
