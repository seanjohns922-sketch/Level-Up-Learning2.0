"use client";

import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import type { Legend } from "@/data/legends";

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] font-extrabold text-foreground w-7 text-right">{value}</span>
    </div>
  );
}

export default function LegendDetailModal({
  legend,
  onClose,
}: {
  legend: Legend;
  onClose: () => void;
}) {
  const [showBack, setShowBack] = useState(false);

  const frontImage = legend.images.cardFront;
  const backImage = legend.images.cardBack;

  useEffect(() => {
    console.log("[CardBinder] Legend detail opened", {
      id: legend.id,
      name: legend.name,
      frontImage,
      backImage,
    });
  }, [backImage, frontImage, legend.id, legend.name]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-card rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-[fadeUp_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background transition border border-border"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Card artwork */}
        <div className="relative bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex flex-col items-center justify-center gap-4 py-8 px-6">
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-teal-400/20 to-emerald-400/20 blur-xl" />
            <button
              type="button"
              onClick={() => setShowBack((current) => !current)}
              className="relative block rounded-xl focus:outline-none"
              aria-label={showBack ? `Show ${legend.name} card front` : `Show ${legend.name} card back`}
            >
              <img
                src={showBack ? backImage : frontImage}
                alt={showBack ? `${legend.name} card back` : `${legend.name} card front`}
                className="relative h-56 w-auto rounded-xl shadow-lg border-2 border-white/60"
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBack(false)}
              className={`rounded-full px-3 py-1 text-xs font-black transition ${
                !showBack
                  ? "bg-teal-600 text-white"
                  : "bg-white/70 text-slate-700 hover:bg-white"
              }`}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setShowBack(true)}
              className={`rounded-full px-3 py-1 text-xs font-black transition ${
                showBack
                  ? "bg-teal-600 text-white"
                  : "bg-white/70 text-slate-700 hover:bg-white"
              }`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setShowBack((current) => !current)}
              className="rounded-full border border-teal-600/20 bg-white/80 px-3 py-1 text-xs font-black text-teal-700 transition hover:bg-white"
            >
              Flip Card
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          <div>
            <p className="text-[10px] font-extrabold text-teal-600 tracking-[0.15em]">
              {legend.yearLabel.toUpperCase()}
            </p>
            <h3 className="text-xl font-black text-foreground">{legend.name}</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            &ldquo;{legend.description}&rdquo;
          </p>

          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.ceil(legend.stars) }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-amber-400" fill="currentColor" />
            ))}
          </div>

          {/* Stats */}
          <div className="space-y-1.5 pt-1">
            <StatBar label="Calc" value={legend.stats.calculation} />
            <StatBar label="Speed" value={legend.stats.speed} />
            <StatBar label="Accuracy" value={legend.stats.accuracy} />
          </div>
        </div>
      </div>
    </div>
  );
}
