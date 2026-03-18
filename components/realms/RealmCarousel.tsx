"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_MODE } from "@/data/config";

const REALMS = [
  { id: "number-nexus", name: "Number Nexus", icon: "⚡", description: "Master numbers, operations & place value", glowColor: "rgba(52,211,153,0.5)", ringColor: "rgba(52,211,153,0.8)", active: true },
  { id: "pattern-peaks", name: "Pattern Peaks", icon: "🌀", description: "Algebra and pattern recognition", glowColor: "rgba(251,191,36,0.4)", ringColor: "rgba(251,191,36,0.7)", active: false },
  { id: "measurelands", name: "Measurelands", icon: "📏", description: "Length, mass, capacity & more", glowColor: "rgba(96,165,250,0.4)", ringColor: "rgba(96,165,250,0.7)", active: false },
  { id: "statistica", name: "Statistica", icon: "📊", description: "Data, graphs & interpretation", glowColor: "rgba(167,139,250,0.4)", ringColor: "rgba(167,139,250,0.7)", active: false },
  { id: "chance-hollow", name: "Chance Hollow", icon: "🎲", description: "Probability & chance", glowColor: "rgba(251,113,133,0.4)", ringColor: "rgba(251,113,133,0.7)", active: false },
  { id: "chronorok", name: "Chronorok", icon: "⏳", description: "Time & duration", glowColor: "rgba(103,232,249,0.4)", ringColor: "rgba(103,232,249,0.7)", active: false, comingSoon: true },
  { id: "starpath-realm", name: "Starpath Realm", icon: "🌌", description: "Space & spatial reasoning", glowColor: "rgba(129,140,248,0.4)", ringColor: "rgba(129,140,248,0.7)", active: false },
  { id: "reading-ridge", name: "Reading Ridge", icon: "📖", description: "Reading comprehension & fluency", glowColor: "rgba(250,204,21,0.4)", ringColor: "rgba(250,204,21,0.7)", active: false },
  { id: "inkwell-wilds", name: "Inkwell Wilds", icon: "✒️", description: "Writing, grammar & spelling", glowColor: "rgba(163,230,53,0.4)", ringColor: "rgba(163,230,53,0.7)", active: false },
  { id: "runehaven-peaks", name: "Runehaven Peaks", icon: "🔥", description: "Advanced literacy & lore", glowColor: "rgba(248,113,113,0.4)", ringColor: "rgba(248,113,113,0.7)", active: false },
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

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") navigate(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") navigate(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Touch/swipe
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

  function enterRealm() {
    if (!isActive) return;
    if (current.id === "number-nexus") {
      router.push("/home");
    }
  }

  // Get visible portals: prev, current, next
  const prevIdx = (currentIndex - 1 + REALMS.length) % REALMS.length;
  const nextIdx = (currentIndex + 1) % REALMS.length;

  // Background parallax shift based on index
  const bgShift = -2 + (currentIndex / REALMS.length) * 4; // subtle horizontal pan

  return (
    <main className="min-h-screen relative overflow-hidden select-none">
      {/* Background with subtle parallax */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/realm-select-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{
            objectPosition: `${50 + bgShift}% 40%`,
            transition: "object-position 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: "scale(1.08)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)" }} />
      </div>

      {/* Content */}
      <div
        className="relative z-10 min-h-screen flex flex-col"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 0.6s ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <button
            onClick={() => router.push("/levels")}
            className="text-sm text-white/70 hover:text-white transition"
            type="button"
          >
            ← Back to Levels
          </button>
          <span
            className="text-xs font-bold text-white/80 px-3 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            {levelLabel}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl md:text-4xl font-black text-white tracking-wide"
            style={{
              fontFamily: "'Quicksand', 'Nunito', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            Choose Your Realm
          </h1>
        </div>

        {/* Portal Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
          {/* Portal ring area */}
          <div className="relative w-full max-w-2xl mx-auto" style={{ height: "320px" }}>
            {/* Side portals (prev & next) */}
            {[
              { realm: REALMS[prevIdx], position: "left", offset: -1 },
              { realm: REALMS[nextIdx], position: "right", offset: 1 },
            ].map(({ realm, position, offset }) => (
              <div
                key={realm.id + position}
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  [position]: "0%",
                  width: "120px",
                  height: "120px",
                  opacity: 0.4,
                  transform: `translateY(-50%) scale(0.7)`,
                  transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                  zIndex: 1,
                }}
                onClick={() => navigate(offset as 1 | -1)}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${realm.glowColor} 0%, transparent 70%)`,
                    border: `2px solid rgba(255,255,255,0.15)`,
                  }}
                >
                  <span className="text-3xl">{realm.icon}</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-bold text-white/40">{realm.name}</span>
                </div>
              </div>
            ))}

            {/* Center portal — the focused realm */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: "translate(-50%, -50%)",
                width: "200px",
                height: "200px",
                transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                zIndex: 10,
              }}
            >
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${current.glowColor} 0%, transparent 65%)`,
                  transform: "scale(1.6)",
                  animation: isActive ? "portalPulse 3s ease-in-out infinite" : "none",
                  opacity: isActive ? 0.6 : 0.2,
                }}
              />
              {/* Portal ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `3px solid ${isActive ? current.ringColor : "rgba(255,255,255,0.2)"}`,
                  boxShadow: isActive
                    ? `0 0 30px ${current.glowColor}, inset 0 0 20px ${current.glowColor}`
                    : "none",
                  transition: "all 0.4s ease",
                }}
              />
              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-6xl"
                  style={{
                    filter: isActive ? "none" : "grayscale(0.8) brightness(0.5)",
                    transition: "filter 0.4s ease",
                  }}
                >
                  {current.icon}
                </span>
              </div>
              {/* Lock overlay for inactive */}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Arrow buttons */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
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
            className="w-full max-w-sm mx-auto text-center mt-4"
            style={{
              transition: "opacity 0.3s ease",
              opacity: transitioning ? 0.3 : 1,
            }}
          >
            <h2
              className="text-2xl md:text-3xl font-black text-white mb-1"
              style={{
                fontFamily: "'Quicksand', 'Nunito', sans-serif",
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              {current.name}
            </h2>
            <p className="text-sm text-white/60 mb-4">{current.description}</p>

            {/* Status + CTA */}
            {current.active ? (
              <button
                onClick={enterRealm}
                className="px-8 py-3 rounded-2xl font-bold text-white text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${current.ringColor}, ${current.glowColor})`,
                  boxShadow: `0 8px 30px ${current.glowColor}`,
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
            <div className="flex items-center justify-center gap-1.5 mt-6">
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
                    background: i === currentIndex ? current.ringColor : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portal pulse animation */}
      <style jsx>{`
        @keyframes portalPulse {
          0%, 100% { transform: scale(1.5); opacity: 0.4; }
          50% { transform: scale(1.7); opacity: 0.7; }
        }
      `}</style>
    </main>
  );
}
