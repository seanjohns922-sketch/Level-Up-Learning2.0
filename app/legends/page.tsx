"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllLegends } from "@/data/legends";
import { readProgress, StudentProgress } from "@/data/progress";

/**
 * Legends data has been evolving in your project.
 * This page normalises both shapes so it won’t break:
 * - older: avatarImage/cardImage/year
 * - newer: images.avatar/cardFront/cardBack/yearLabel + stars/stats
 */
type LegendAny = any;

function normalizeLegend(l: LegendAny) {
  const yearText = String(l.yearLabel ?? l.year ?? "Year ?");
  const strand = String(l.strand ?? "Number");

  // Prefer the new shape first, then fall back to legacy fields.
  const avatar =
    l.images?.avatar ??
    l.images?.cardFront ??
    l.avatarImage ??
    l.cardImage ??
    "/cards/numbot-solver-y4-front.png";

  const cardFront =
    l.images?.cardFront ??
    l.images?.avatar ??
    l.cardImage ??
    l.avatarImage ??
    "/cards/numbot-solver-y4-front.png";

  const cardBack =
    l.images?.cardBack ??
    l.cardBack ??
    "/cards/numbot-solver-y4-back.png";

  const stars = Number.isFinite(l.stars) ? Number(l.stars) : undefined;

  const stats = l.stats
    ? {
        calculation: Number(l.stats.calculation ?? 0),
        speed: Number(l.stats.speed ?? 0),
        accuracy: Number(l.stats.accuracy ?? 0),
      }
    : undefined;

  return {
    id: String(l.id ?? ""),
    name: String(l.name ?? "Unknown Legend"),
    description: String(l.description ?? ""),
    yearText,
    strand,
    avatar,
    cardFront,
    cardBack,
    stars,
    stats,
  };
}

function StarsRow({ stars }: { stars: number }) {
  const total = 6;
  const full = Math.max(0, Math.min(total, Math.round(stars)));
  return (
    <div className="text-sm text-gray-700">
      <span className="font-bold">{"★".repeat(full)}</span>
      <span className="text-gray-300">{"★".repeat(total - full)}</span>
    </div>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <div className="text-[11px] font-bold text-gray-500">{label}</div>
      <div className="text-sm font-extrabold text-gray-800">{value}</div>
    </div>
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

    const yearOrder = [
      "Prep",
      "Year 1",
      "Year 2",
      "Year 3",
      "Year 4",
      "Year 5",
      "Year 6",
    ];

    return normalised.sort(
      (a, b) =>
        yearOrder.indexOf(a.yearText) -
        yearOrder.indexOf(b.yearText)
    );
  }, []);

  const [selected, setSelected] = useState<ReturnType<typeof normalizeLegend> | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  function openLegend(l: ReturnType<typeof normalizeLegend>) {
    setSelected(l);
    setShowBack(false);
    setShowFullImage(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-indigo-700 hover:underline"
          >
            ← Home
          </button>
          <div className="text-sm text-gray-500">My Legends</div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Level Up Legends
        </h1>
        <p className="text-gray-500 mb-6">
          Tap a Legend to view their card (front + back).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {legends.map((legend) => {
            const unlocked = unlockedIds.includes(legend.id);

            return (
              <button
                key={legend.id}
                onClick={() => openLegend(legend)}
                className={[
                  "rounded-2xl border p-4 text-left transition shadow-sm hover:shadow-md",
                  unlocked
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200 bg-gray-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      {legend.yearText} • {legend.strand}
                    </div>
                    <div className="font-extrabold text-gray-800 text-lg">
                      {legend.name}
                    </div>

                    <div
                      className={[
                        "mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full",
                        unlocked
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600",
                      ].join(" ")}
                    >
                      {unlocked ? "UNLOCKED" : "LOCKED"}
                    </div>

                    {typeof legend.stars === "number" ? (
                      <div className="mt-2">
                        <StarsRow stars={legend.stars} />
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={[
                      "relative w-20 h-20 rounded-xl overflow-hidden border bg-white",
                      unlocked ? "border-indigo-200" : "border-gray-200",
                    ].join(" ")}
                  >
                    <img
                      src={legend.avatar}
                      alt={legend.name}
                      className={[
                        "absolute inset-0 w-full h-full object-cover",
                        unlocked ? "" : "blur-sm grayscale opacity-60",
                      ].join(" ")}
                    />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-700">
                        ???
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                  {legend.description}
                </div>

                <div className="mt-3 text-xs text-indigo-700 font-bold">
                  Tap to view card →
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="font-semibold text-gray-800 mb-1">Tip</div>
          <div className="text-sm text-gray-600">
            Legends unlock when a student passes the pre-test or completes the 12-week program.
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected ? (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const unlocked = unlockedIds.includes(selected.id);
              const imgSrc = showBack ? selected.cardBack : selected.cardFront;

              return (
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        {selected.yearText} • {selected.strand}
                      </div>
                      <div className="text-2xl font-extrabold text-gray-800">
                        {selected.name}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <div
                          className={[
                            "inline-block text-xs font-bold px-3 py-1 rounded-full",
                            unlocked
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600",
                          ].join(" ")}
                        >
                          {unlocked ? "UNLOCKED" : "LOCKED"}
                        </div>

                        {typeof selected.stars === "number" ? (
                          <StarsRow stars={selected.stars} />
                        ) : null}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelected(null)}
                      className="px-3 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Card */}
                    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setShowFullImage(true)}
                        className="relative w-full aspect-[3/4] bg-white"
                        aria-label="View full card image"
                      >
                        <img
                          src={imgSrc}
                          alt={`${selected.name} card`}
                          className={[
                            "absolute inset-0 w-full h-full object-cover",
                            unlocked ? "" : "blur-md grayscale opacity-70",
                          ].join(" ")}
                        />

                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-2xl bg-white/85 border border-gray-200 px-4 py-3 text-center">
                              <div className="font-extrabold text-gray-800">
                                Locked
                              </div>
                              <div className="text-sm text-gray-600">
                                Pass the pre-test or finish the 12-week program
                              </div>
                            </div>
                          </div>
                        )}
                      </button>

                      <div className="p-4 bg-white flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-gray-800">
                          {showBack ? "Card Back" : "Card Front"}
                        </div>

                        <button
                          onClick={() => setShowBack((v) => !v)}
                          className={[
                            "px-4 py-2 rounded-xl font-bold transition",
                            unlocked
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed",
                          ].join(" ")}
                          disabled={!unlocked}
                          title={unlocked ? "Flip card" : "Unlock to flip"}
                        >
                          Flip
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                      <div className="font-semibold text-gray-800 mb-2">
                        Description
                      </div>
                      <div className="text-sm text-gray-700 mb-5">
                        {selected.description}
                      </div>

                      {selected.stats ? (
                        <>
                          <div className="font-semibold text-gray-800 mb-2">
                            Attributes
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <StatPill label="Calculation" value={selected.stats.calculation} />
                            <StatPill label="Speed" value={selected.stats.speed} />
                            <StatPill label="Accuracy" value={selected.stats.accuracy} />
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Attributes coming soon.
                        </div>
                      )}

                      <div className="mt-6 grid gap-3">
                        <button
                          onClick={() => router.push("/")}
                          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
                        >
                          Back to Home
                        </button>
                        <button
                          onClick={() => setSelected(null)}
                          className="w-full py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
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
      ) : null}

      {/* Full image overlay */}
      {selected && showFullImage ? (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowFullImage(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-gray-800 font-bold shadow-lg"
              aria-label="Close full image"
            >
              ✕
            </button>
            <div className="relative w-full h-[80vh] bg-black rounded-2xl overflow-hidden">
              <img
                src={showBack ? selected.cardBack : selected.cardFront}
                alt={`${selected.name} full card`}
                className={[
                  "absolute inset-0 w-full h-full object-contain",
                  unlockedIds.includes(selected.id) ? "" : "blur-md grayscale opacity-70",
                ].join(" ")}
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
