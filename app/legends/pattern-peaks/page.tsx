"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mountain, Sparkles } from "lucide-react";
import BinderCard from "@/components/legends/BinderCard";
import LegendDetailModal from "@/components/legends/LegendDetailModal";
import { getAllLegends, type Legend } from "@/data/legends";
import { YEAR_ORDER } from "@/data/yearOrder";
import { isDemoPreviewMode } from "@/lib/demo-mode";

export default function PatternPeaksCollectionPage() {
  const router = useRouter();
  const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
  const [barAnimated, setBarAnimated] = useState(false);
  const [demoPreview, setDemoPreview] = useState(false);
  const [demoResolved, setDemoResolved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDemoPreview(isDemoPreviewMode());
      setDemoResolved(true);
      setBarAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (demoResolved && !demoPreview) router.replace("/legends");
  }, [demoPreview, demoResolved, router]);

  const legends = useMemo(
    () =>
      getAllLegends("pattern-peaks").sort(
        (a, b) => YEAR_ORDER.indexOf(a.yearLabel) - YEAR_ORDER.indexOf(b.yearLabel),
      ),
    [],
  );

  if (!demoResolved || !demoPreview) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0c1219] text-[#e8fff7]">
        <p className="font-semibold">Opening the Patternox Summit...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c1219]">
      <div className="pointer-events-none absolute inset-0">
        <div className="relative h-[580px] w-full">
          <Image
            src="/images/patternpeaks-home-bg-y6.jpeg"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            quality={90}
            className="object-cover object-center opacity-75"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,25,0.12)_0%,rgba(12,18,25,0.78)_48%,#0c1219_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(57,217,160,0.18),transparent_36%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/legends")}
            className="flex items-center gap-1 text-sm font-bold text-emerald-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> My Legends
          </button>
          <div className="inline-flex items-center gap-2 border border-emerald-300/30 bg-[#16252a]/85 px-4 py-2 text-sm font-bold text-emerald-50 backdrop-blur-md">
            <Mountain className="h-4 w-4 text-[#39d9a0]" /> Patternox Summit
          </div>
        </div>

        <header className="pb-9 pt-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ffcc62]">
            Pattern Peaks Realm
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-white md:text-6xl">
            Patternox Collection
          </h1>
          <p className="mt-3 max-w-xl text-base font-medium text-white/75 md:text-lg">
            Meet every Patternox evolution and watch how each one masters patterns, rules,
            unknowns, and algebraic structure.
          </p>

          <div className="mt-6 max-w-sm">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span className="text-white">{legends.length} / {legends.length} collected</span>
              <span className="text-[#39d9a0]">100%</span>
            </div>
            <div className="h-4 overflow-hidden border border-emerald-300/25 bg-black/45">
              <div
                className="h-full bg-[linear-gradient(90deg,#39d9a0,#54a8ff,#8b5cf6)] shadow-[0_0_14px_rgba(57,217,160,0.35)] transition-all duration-1000"
                style={{ width: barAnimated ? "100%" : "0%" }}
              />
            </div>
          </div>
        </header>

        <h2 className="mb-5 text-xs font-extrabold tracking-[0.22em] text-emerald-100">
          CARD BINDER
        </h2>
        <section className="relative overflow-hidden border border-emerald-300/20 bg-[#101b22]/85 p-3 shadow-[0_26px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5 md:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.14),transparent_42%)]" />
          <div className="relative grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {legends.map((legend) => (
              <BinderCard
                key={legend.id}
                legend={legend}
                isUnlocked
                isDemoPreview
                onClick={() => setSelectedLegend(legend)}
              />
            ))}
          </div>
        </section>

        <div className="mt-10 flex items-start gap-3 border border-emerald-300/20 bg-[#16252a]/85 p-5 text-white/80 backdrop-blur-md">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#ffcc62]" />
          <div>
            <p className="font-bold text-white">Demo collection unlocked</p>
            <p className="mt-1 text-sm text-white/65">
              Select any Patternox card to flip, enlarge, watch its showcase, or preview the
              full unlock video.
            </p>
          </div>
        </div>
      </div>

      {selectedLegend ? (
        <LegendDetailModal legend={selectedLegend} onClose={() => setSelectedLegend(null)} />
      ) : null}
    </main>
  );
}
