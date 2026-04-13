"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_MODE } from "@/data/config";
import RealmPortalPreview from "@/components/realms/RealmPortalPreview";

const REALMS = [
  { id: "number-nexus", name: "Number Nexus", symbol: "⚡", description: "Master numbers, operations & place value", color: "rgb(52,211,153)", colorDim: "rgba(52,211,153,0.25)", active: true },
  { id: "pattern-peaks", name: "Pattern Peaks", symbol: "△", description: "Algebra and pattern recognition", color: "rgb(251,191,36)", colorDim: "rgba(251,191,36,0.2)", active: false },
  { id: "measurelands", name: "Measurelands", symbol: "◈", description: "Length, mass, capacity & more", color: "rgb(96,165,250)", colorDim: "rgba(96,165,250,0.2)", active: false },
  { id: "statistica", name: "Statistica", symbol: "▣", description: "Data, graphs & interpretation", color: "rgb(167,139,250)", colorDim: "rgba(167,139,250,0.2)", active: false },
  { id: "chance-hollow", name: "Chance Hollow", symbol: "◉", description: "Probability & chance", color: "rgb(251,113,133)", colorDim: "rgba(251,113,133,0.2)", active: false },
  { id: "chronorok", name: "Chronorok", symbol: "⧖", description: "Time & duration", color: "rgb(103,232,249)", colorDim: "rgba(103,232,249,0.2)", active: false, comingSoon: true },
  { id: "starpath-realm", name: "Starpath Realm", symbol: "✦", description: "Space & spatial reasoning", color: "rgb(129,140,248)", colorDim: "rgba(129,140,248,0.2)", active: false },
  { id: "reading-ridge", name: "Reading Ridge", symbol: "▧", description: "Reading comprehension & fluency", color: "rgb(250,204,21)", colorDim: "rgba(250,204,21,0.2)", active: false },
  { id: "inkwell-wilds", name: "Inkwell Wilds", symbol: "✎", description: "Writing, grammar & spelling", color: "rgb(163,230,53)", colorDim: "rgba(163,230,53,0.2)", active: false },
  { id: "runehaven-peaks", name: "Runehaven Peaks", symbol: "♦", description: "Advanced literacy & lore", color: "rgb(248,113,113)", colorDim: "rgba(248,113,113,0.2)", active: false },
];

export default function RealmCarousel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") ?? "Year 1";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const levelLabel = level.startsWith("Year")
    ? `Level ${level.replace("Year ", "")}`
    : level;

  const navigate = useCallback((dir: 1 | -1) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrentIndex((prev) => (prev + dir + REALMS.length) % REALMS.length);
    setTimeout(() => setTransitioning(false), 400);
  }, [transitioning]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") navigate(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") navigate(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  useEffect(() => {
    let startX = 0;
    function onStart(e: TouchEvent) { startX = e.touches[0].clientX; }
    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [navigate]);

  const current = REALMS[currentIndex];
  const isActive = current.active || DEMO_MODE;
  const prevIdx = (currentIndex - 1 + REALMS.length) % REALMS.length;
  const nextIdx = (currentIndex + 1) % REALMS.length;
  const bgShift = -2 + (currentIndex / REALMS.length) * 4;

  function enterRealm() {
    if (!isActive) return;
    if (current.id === "number-nexus") router.push("/home");
  }

  return (
    <main className="min-h-screen relative overflow-hidden select-none">
      {/* Interior background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/realm-select-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{
            objectPosition: `${50 + bgShift}% 35%`,
            transition: "object-position 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: "scale(1.05)",
          }}
        />
        {/* Warm vignette overlay */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center 60%, transparent 30%, rgba(0,0,0,0.5) 100%)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 min-h-screen flex flex-col"
        style={{ opacity: entered ? 1 : 0, transition: "opacity 0.6s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <button
            onClick={() => router.push("/levels")}
            className="text-sm text-white/70 hover:text-white transition font-medium"
            type="button"
          >
            ← Back to Levels
          </button>
          <span
            className="text-xs font-bold text-white/80 px-3.5 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {levelLabel}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mt-2 mb-4">
          <h1
            className="text-3xl md:text-4xl font-black text-white tracking-wide"
            style={{
              fontFamily: "'Quicksand', 'Nunito', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            Choose Your Realm
          </h1>
        </div>

        {/* Portal Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
          <div className="relative w-full max-w-3xl mx-auto" style={{ height: "340px" }}>

            {/* Side doorways (prev & next) */}
            {[
              { realm: REALMS[prevIdx], position: "left" as const, dir: -1 as const },
              { realm: REALMS[nextIdx], position: "right" as const, dir: 1 as const },
            ].map(({ realm, position, dir }) => (
              <button
                key={realm.id + position}
                type="button"
                onClick={() => navigate(dir)}
                className="absolute top-1/2 cursor-pointer transition-all duration-400"
                style={{
                  [position]: "4%",
                  transform: "translateY(-55%) scale(0.65)",
                  opacity: 0.35,
                  width: "140px",
                  zIndex: 1,
                }}
              >
                {/* Stone doorway arch shape */}
                <div
                  className="relative mx-auto rounded-t-full overflow-hidden"
                  style={{
                    width: "110px",
                    height: "160px",
                    background: "linear-gradient(180deg, rgba(30,25,20,0.9) 0%, rgba(15,12,10,0.95) 100%)",
                    border: "3px solid rgba(180,160,120,0.3)",
                    boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Inner glow */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `radial-gradient(ellipse at center 60%, ${realm.colorDim}, transparent 70%)` }}
                  >
                    <span className="text-3xl opacity-50" style={{ filter: "grayscale(0.5)" }}>{realm.symbol}</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-white/30 text-center mt-2 truncate">{realm.name}</p>
              </button>
            ))}

            {/* CENTER PORTAL — the focused realm */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: "translate(-50%, -52%)",
                width: "220px",
                transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                zIndex: 10,
              }}
            >
              {/* Stone doorway arch */}
              <div
                className="relative mx-auto rounded-t-full overflow-hidden"
                style={{
                  width: "180px",
                  height: "260px",
                  background: "linear-gradient(180deg, rgba(25,20,15,0.85) 0%, rgba(10,8,5,0.95) 100%)",
                  border: `3px solid ${isActive ? current.color : "rgba(180,160,120,0.3)"}`,
                  boxShadow: isActive
                    ? `0 0 40px ${current.colorDim}, inset 0 0 40px ${current.colorDim}`
                    : "inset 0 0 30px rgba(0,0,0,0.5)",
                  transition: "all 0.4s ease",
                }}
              >
                {/* Portal energy inside doorway */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isActive
                      ? `radial-gradient(ellipse at center 55%, ${current.colorDim} 0%, transparent 65%)`
                      : "none",
                    transition: "background 0.4s ease",
                  }}
                />

                <RealmPortalPreview
                  realmId={current.id}
                  symbol={current.symbol}
                  color={isActive ? current.color : "rgba(255,255,255,0.2)"}
                  colorDim={isActive ? current.colorDim : "rgba(255,255,255,0.08)"}
                  isSelected
                />

                {/* Lock overlay */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="4" y="11" width="16" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Stone base / threshold */}
              <div
                className="mx-auto"
                style={{
                  width: "186px",
                  height: "8px",
                  background: "linear-gradient(180deg, rgba(140,120,80,0.5), rgba(100,85,55,0.3))",
                  borderRadius: "0 0 4px 4px",
                }}
              />
            </div>

            {/* Arrow buttons */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "2px solid rgba(180,160,120,0.3)",
                backdropFilter: "blur(4px)",
              }}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "2px solid rgba(180,160,120,0.3)",
                backdropFilter: "blur(4px)",
              }}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Info Panel */}
          <div
            className="w-full max-w-sm mx-auto text-center mt-2"
            style={{ transition: "opacity 0.3s ease", opacity: transitioning ? 0.3 : 1 }}
          >
            <h2
              className="text-2xl md:text-3xl font-black text-white mb-1"
              style={{
                fontFamily: "'Quicksand', 'Nunito', sans-serif",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {current.name}
            </h2>
            <p className="text-sm text-white/55 mb-4">{current.description}</p>

            {current.active ? (
              <button
                onClick={enterRealm}
                className="px-8 py-3 rounded-2xl font-bold text-white text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: current.color,
                  boxShadow: `0 6px 24px ${current.colorDim}`,
                }}
              >
                Enter Realm
              </button>
            ) : current.comingSoon ? (
              <span className="inline-block px-6 py-2.5 rounded-2xl text-sm font-bold text-amber-300/80 border border-amber-400/30" style={{ background: "rgba(251,191,36,0.1)" }}>
                Coming Soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white/40 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
                Locked
              </span>
            )}

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              {REALMS.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (!transitioning) {
                      setTransitioning(true);
                      setCurrentIndex(i);
                      setTimeout(() => setTransitioning(false), 400);
                    }
                  }}
                  className="transition-all cursor-pointer"
                  style={{
                    width: i === currentIndex ? "20px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === currentIndex ? current.color : "rgba(255,255,255,0.2)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
