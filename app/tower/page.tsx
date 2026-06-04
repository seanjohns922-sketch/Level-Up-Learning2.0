"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTowerRealms, getTowerRestoration } from "@/lib/tower-realms";

export default function TowerOfKnowledgePage() {
  const router = useRouter();
  const realms = useMemo(() => getTowerRealms(), []);
  const restoration = useMemo(() => getTowerRestoration(realms), [realms]);
  const pct = Math.round(restoration * 100);

  // Tower restores from the base up — strongest realms at the bottom.
  const ordered = useMemo(() => [...realms].sort((a, b) => a.percent - b.percent), [realms]);

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0a0814" }}>
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/dashboard-bg.jpg"
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 35%", filter: "brightness(0.4) saturate(1.05)" }}
      />
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(200,160,48,0.10) 0%, transparent 60%), linear-gradient(180deg, rgba(8,6,20,0.7) 0%, rgba(6,4,14,0.92) 100%)" }} />

      <style jsx>{`
        @keyframes beaconPulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes segFog { 0%,100% { opacity: 0.5; } 50% { opacity: 0.75; } }
      `}</style>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] text-white/85 backdrop-blur-md transition hover:bg-black/45"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="rounded-full border border-amber-300/30 bg-black/30 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-amber-200/90 backdrop-blur-md">
          {pct}% Restored
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 mt-3 text-center px-6">
        <h1
          className="font-mono font-black uppercase tracking-[0.06em]"
          style={{
            fontSize: "clamp(1.8rem, 6vw, 3rem)",
            background: "linear-gradient(180deg, #fff8e8 0%, #e8c878 55%, #8b6520 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 22px rgba(200,160,48,0.5))",
          }}
        >
          Tower of Knowledge
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-white/65">
          The Fog of Forgetfulness shattered the Tower and scattered its shards across the nine realms.
          Restore each realm to relight the Tower, one lesson at a time.
        </p>
      </div>

      {/* Beacon */}
      <div className="relative z-10 mt-6 flex justify-center">
        <div
          className="h-10 w-10 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255,248,232,${0.4 + restoration * 0.6}) 0%, rgba(200,160,48,${0.3 + restoration * 0.5}) 50%, transparent 75%)`,
            boxShadow: `0 0 ${20 + restoration * 50}px rgba(200,160,48,${0.4 + restoration * 0.5})`,
            animation: "beaconPulse 2.6s ease-in-out infinite",
          }}
        />
      </div>

      {/* The Tower — 9 realm segments, base (most restored) at the bottom */}
      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-md flex-col gap-2 px-4 pb-12">
        {ordered.map((r) => {
          const filled = Math.round(r.percent * 100);
          const lit = r.percent > 0;
          const enterable = Boolean(r.route);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => { if (r.route) router.push(r.route); }}
              disabled={!enterable}
              className="group relative w-full overflow-hidden rounded-2xl px-4 py-3 text-left transition-all"
              style={{
                background: lit
                  ? `linear-gradient(135deg, rgba(20,14,4,0.85), rgba(40,30,10,0.7))`
                  : "rgba(18,18,28,0.7)",
                border: `1px solid ${lit ? r.accent + "66" : "rgba(255,255,255,0.08)"}`,
                boxShadow: lit ? `0 0 18px ${r.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                cursor: enterable ? "pointer" : "default",
                opacity: enterable || lit ? 1 : 0.72,
              }}
            >
              {/* restoration fill */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 transition-all duration-700"
                style={{ width: `${filled}%`, background: `linear-gradient(90deg, ${r.accent}22, ${r.accent}05)` }}
              />
              {/* foggy shimmer for locked realms */}
              {!lit && (
                <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(200,205,225,0.06), transparent)", animation: "segFog 4s ease-in-out infinite" }} />
              )}

              <div className="relative flex items-center gap-3">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{
                    background: lit ? `radial-gradient(circle at 40% 35%, ${r.accent}55, rgba(0,0,0,0.3))` : "rgba(255,255,255,0.05)",
                    boxShadow: lit ? `0 0 12px ${r.glow}` : "none",
                    filter: lit ? "none" : "grayscale(0.7) opacity(0.8)",
                  }}
                >
                  {r.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-black leading-tight text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                    {r.realm}
                  </div>
                  <div className="text-[11px] font-semibold text-white/55">{r.strand}</div>
                </div>
                <div className="text-right">
                  {enterable ? (
                    <>
                      <div className="font-mono font-black tabular-nums" style={{ color: r.accent, fontSize: "1.05rem", textShadow: `0 0 10px ${r.glow}` }}>
                        {filled}%
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 group-hover:text-white/70">
                        Enter ▸
                      </div>
                    </>
                  ) : (
                    <div className="rounded-full border border-white/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
                      Coming soon
                    </div>
                  )}
                </div>
              </div>

              {/* thin restoration bar */}
              {enterable && (
                <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${filled}%`, background: r.accent, boxShadow: `0 0 8px ${r.glow}` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
