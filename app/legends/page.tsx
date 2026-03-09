"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllLegends } from "@/data/legends";
import { readProgress, StudentProgress } from "@/data/progress";

type LegendAny = any;

function normalizeLegend(l: LegendAny) {
  const yearText = String(l.yearLabel ?? l.year ?? "Year ?");
  const strand = String(l.strand ?? "Number");
  const avatar = l.images?.avatar ?? l.images?.cardFront ?? l.avatarImage ?? l.cardImage ?? "/cards/numbot-solver-y4-front.png";
  const cardFront = l.images?.cardFront ?? l.images?.avatar ?? l.cardImage ?? l.avatarImage ?? "/cards/numbot-solver-y4-front.png";
  const cardBack = l.images?.cardBack ?? l.cardBack ?? "/cards/numbot-solver-y4-back.png";
  const stars = Number.isFinite(l.stars) ? Number(l.stars) : undefined;
  const stats = l.stats ? { calculation: Number(l.stats.calculation ?? 0), speed: Number(l.stats.speed ?? 0), accuracy: Number(l.stats.accuracy ?? 0) } : undefined;
  return { id: String(l.id ?? ""), name: String(l.name ?? "Unknown Legend"), description: String(l.description ?? ""), yearText, strand, avatar, cardFront, cardBack, stars, stats };
}

function StarsRow({ stars, size = "md" }: { stars: number; size?: "sm" | "md" }) {
  const total = 6;
  const sz = size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className={`${sz} flex gap-0.5`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = stars - i;
        if (filled >= 1) return <span key={i} className="text-accent drop-shadow-sm">★</span>;
        if (filled >= 0.5) return <span key={i} className="text-accent drop-shadow-sm opacity-60">★</span>;
        return <span key={i} className="text-muted">★</span>;
      })}
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-xs font-extrabold text-foreground">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function LegendCard({ legend, unlocked, onClick, index }: {
  legend: ReturnType<typeof normalizeLegend>;
  unlocked: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden hover:-translate-y-1"
      style={{
        borderColor: unlocked ? "hsl(var(--primary))" : "hsl(var(--border))",
        background: unlocked
          ? "linear-gradient(135deg, hsl(var(--primary-light)), hsl(var(--card)))"
          : "hsl(var(--card))",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Shine sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>

      {unlocked && (
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-transparent rounded-bl-full" />
        </div>
      )}

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {legend.yearText} • {legend.strand}
            </div>
            <div className="font-extrabold text-foreground text-xl font-display leading-tight">
              {legend.name}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wide ${
                  unlocked
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {unlocked ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    UNLOCKED
                  </>
                ) : (
                  <>🔒 LOCKED</>
                )}
              </span>
            </div>

            {typeof legend.stars === "number" && (
              <div className="mt-2">
                <StarsRow stars={legend.stars} size="sm" />
              </div>
            )}
          </div>

          <div
            className={`relative w-[88px] h-[88px] rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${
              unlocked
                ? "border-primary/30 shadow-lg shadow-primary/10 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:scale-105"
                : "border-muted"
            }`}
          >
            <img
              src={legend.avatar}
              alt={legend.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                unlocked ? "" : "blur-sm grayscale opacity-50"
              }`}
            />
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-[1px]">
                <span className="text-lg font-black text-muted-foreground">???</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {legend.description}
        </p>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
          View card <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </button>
  );
}

export default function LegendsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const unlockedIds = progress?.unlockedLegends ?? [];

  const legends = useMemo(() => {
    const raw = getAllLegends();
    const normalised = raw.map(normalizeLegend);
    const yearOrder = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
    return normalised.sort((a, b) => yearOrder.indexOf(a.yearText) - yearOrder.indexOf(b.yearText));
  }, []);

  const [selected, setSelected] = useState<ReturnType<typeof normalizeLegend> | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const unlockedCount = legends.filter((l) => unlockedIds.includes(l.id)).length;

  function openLegend(l: ReturnType<typeof normalizeLegend>) {
    setSelected(l);
    setShowBack(false);
    setShowFullImage(false);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-trust-blue-light">
        <div className="absolute inset-0 pointer-events-none">
          {["⭐", "🏆", "✨", "🎖️", "💎"].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                top: `${15 + i * 15}%`,
                left: `${10 + i * 18}%`,
                transform: `rotate(${i * 30 - 60}deg)`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-6 pb-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-bold text-primary hover:text-primary/80 transition flex items-center gap-1"
            >
              ← Home
            </button>
            <div className="text-sm font-bold text-muted-foreground bg-card px-4 py-1.5 rounded-full border border-border shadow-sm">
              My Legends
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-foreground font-display tracking-tight">
            Level Up Legends
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-lg">
            Collect powerful Numbots by mastering your maths skills.
          </p>

          {/* Progress bar */}
          <div className="mt-6 max-w-sm">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-bold text-foreground">{unlockedCount} / {legends.length} collected</span>
              <span className="font-bold text-accent">{Math.round((unlockedCount / legends.length) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-card border border-border overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-700"
                style={{ width: `${(unlockedCount / legends.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none" style={{ height: 40 }}>
          <path d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {legends.map((legend, i) => (
            <LegendCard
              key={legend.id}
              legend={legend}
              unlocked={unlockedIds.includes(legend.id)}
              onClick={() => openLegend(legend)}
              index={i}
            />
          ))}
        </div>

        {/* Tip */}
        <div className="mt-10 rounded-2xl border-2 border-accent/20 bg-accent/5 p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <div className="font-bold text-foreground mb-0.5">How to unlock Legends</div>
            <div className="text-sm text-muted-foreground">
              Pass the pre-test for a year level, or complete the full 12-week program to unlock that year&apos;s Legend!
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4 z-40"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
            style={{ animation: "fadeUp 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const unlocked = unlockedIds.includes(selected.id);
              const imgSrc = showBack ? selected.cardBack : selected.cardFront;

              return (
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {selected.yearText} • {selected.strand}
                      </div>
                      <div className="text-2xl font-black text-foreground font-display">
                        {selected.name}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {unlocked ? "UNLOCKED" : "LOCKED"}
                        </span>
                        {typeof selected.stars === "number" && <StarsRow stars={selected.stars} />}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold hover:bg-muted/80 transition"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Card preview */}
                    <div className="rounded-2xl border border-border overflow-hidden bg-muted/30">
                      <button
                        type="button"
                        onClick={() => setShowFullImage(true)}
                        className="relative w-full aspect-[3/4] bg-card"
                      >
                        <img
                          src={imgSrc}
                          alt={`${selected.name} card`}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${unlocked ? "" : "blur-md grayscale opacity-60"}`}
                        />
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-2xl bg-card/90 border border-border px-5 py-4 text-center backdrop-blur-sm">
                              <div className="text-2xl mb-1">🔒</div>
                              <div className="font-extrabold text-foreground">Locked</div>
                              <div className="text-xs text-muted-foreground mt-1">Pass the pre-test to unlock</div>
                            </div>
                          </div>
                        )}
                      </button>
                      <div className="p-3 bg-card flex items-center justify-between gap-3 border-t border-border">
                        <span className="text-sm font-bold text-foreground">{showBack ? "Card Back" : "Card Front"}</span>
                        <button
                          onClick={() => setShowBack((v) => !v)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${unlocked ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                          disabled={!unlocked}
                        >
                          🔄 Flip
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="font-bold text-foreground mb-2">About</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                      </div>

                      {selected.stats ? (
                        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                          <div className="font-bold text-foreground">Attributes</div>
                          <StatBar label="Calculation" value={selected.stats.calculation} />
                          <StatBar label="Speed" value={selected.stats.speed} />
                          <StatBar label="Accuracy" value={selected.stats.accuracy} />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                          Attributes coming soon.
                        </div>
                      )}

                      <div className="grid gap-2 mt-auto">
                        <button
                          onClick={() => router.push("/")}
                          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition"
                        >
                          Back to Home
                        </button>
                        <button
                          onClick={() => setSelected(null)}
                          className="w-full py-3 rounded-xl bg-muted text-foreground font-bold hover:bg-muted/80 transition"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Full image overlay */}
      {selected && showFullImage && (
        <div
          className="fixed inset-0 bg-foreground/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-card text-foreground font-bold shadow-lg z-10 flex items-center justify-center"
            >
              ✕
            </button>
            <div className="relative w-full h-[80vh] bg-foreground/90 rounded-2xl overflow-hidden">
              <img
                src={showBack ? selected.cardBack : selected.cardFront}
                alt={`${selected.name} full card`}
                className={`absolute inset-0 w-full h-full object-contain ${unlockedIds.includes(selected.id) ? "" : "blur-md grayscale opacity-60"}`}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
