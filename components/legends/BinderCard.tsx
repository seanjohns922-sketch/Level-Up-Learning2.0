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
      className="group relative w-full focus:outline-none"
      title={
        isUnlocked
          ? `View ${legend.name}`
          : `Unlock by completing the ${legend.yearLabel} Number program.`
      }
    >
      <div
        className="relative overflow-hidden transition-all duration-300 aspect-[2/3] rounded-[18px]"
        style={{
          border: isUnlocked
            ? "1.5px solid hsla(160, 50%, 64%, 0.48)"
            : "1.5px solid hsla(160, 22%, 52%, 0.3)",
          boxShadow: isUnlocked
            ? "0 10px 28px hsla(160, 50%, 24%, 0.26), 0 0 0 1px hsla(160, 50%, 68%, 0.08)"
            : "0 14px 34px hsla(170, 70%, 2%, 0.34)",
          transform: "translateY(0)",
          cursor: isUnlocked ? "pointer" : "default",
          background: "hsla(166, 34%, 8%, 0.72)",
        }}
        onMouseEnter={(e) => {
          if (isUnlocked) {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 18px 44px hsla(160, 50%, 28%, 0.34), 0 0 18px hsla(160, 50%, 55%, 0.14), 0 0 0 1px hsla(160, 50%, 66%, 0.18)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          if (isUnlocked) {
            e.currentTarget.style.boxShadow =
              "0 10px 28px hsla(160, 50%, 24%, 0.26), 0 0 0 1px hsla(160, 50%, 68%, 0.08)";
          } else {
            e.currentTarget.style.boxShadow = "0 14px 34px hsla(170, 70%, 2%, 0.34)";
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
