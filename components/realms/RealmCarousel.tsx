"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_MODE } from "@/data/config";
import RealmPortalPreview from "@/components/realms/RealmPortalPreview";
import { readProgress } from "@/data/progress";
import { getWeekProgress, readProgramStore } from "@/lib/program-progress";

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

const DROPDOWN_REALM_IDS = [
  "number-nexus",
  "reading-ridge",
  "inkwell-wilds",
  "measurelands",
  "statistica",
  "chance-hollow",
  "pattern-peaks",
] as const;

type RealmItem = (typeof REALMS)[number];

function ApexTowerScene({
  realms,
  currentIndex,
  transitioning,
  onSelect,
  levelNumber,
}: {
  realms: RealmItem[];
  currentIndex: number;
  transitioning: boolean;
  onSelect: (index: number) => void;
  levelNumber: number;
}) {
  const portalPositions = [
    { left: "50%", top: "17%", scale: 0.88 },
    { left: "31%", top: "25%", scale: 0.78 },
    { left: "69%", top: "25%", scale: 0.78 },
    { left: "17%", top: "43%", scale: 0.66 },
    { left: "83%", top: "43%", scale: 0.66 },
    { left: "40%", top: "50%", scale: 0.62 },
    { left: "60%", top: "50%", scale: 0.62 },
    { left: "25%", top: "65%", scale: 0.56 },
    { left: "75%", top: "65%", scale: 0.56 },
    { left: "50%", top: "72%", scale: 0.55 },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ height: "420px" }}>
      <div
        className="absolute left-1/2 bottom-0 h-[118px] w-[360px] -translate-x-1/2 rounded-t-full"
        style={{
          background: "linear-gradient(180deg, rgba(230,250,255,0.16), rgba(32,42,38,0.68) 45%, rgba(8,10,12,0.9))",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 -12px 42px rgba(255,244,190,0.16), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      />
      <div
        className="absolute left-1/2 bottom-[46px] h-[74px] w-[210px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,248,205,0.42), rgba(52,211,153,0.13) 42%, transparent 72%)",
          filter: "blur(1px)",
        }}
      />

      {/* child/avatar at the tower apex */}
      <div className="absolute left-1/2 bottom-[102px] z-20 -translate-x-1/2">
        <div className="relative mx-auto h-14 w-10">
          <div className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_16px_rgba(255,248,210,0.35)]" />
          <div className="absolute left-1/2 top-[18px] h-8 w-7 -translate-x-1/2 rounded-t-2xl bg-emerald-300/90 shadow-[0_0_14px_rgba(52,211,153,0.35)]" />
          <div className="absolute left-[8px] top-[43px] h-4 w-2 rounded-full bg-white/75" />
          <div className="absolute right-[8px] top-[43px] h-4 w-2 rounded-full bg-white/75" />
        </div>
      </div>

      {realms.map((realm, index) => {
        const isSelected = index === currentIndex;
        const position = portalPositions[index] ?? portalPositions[portalPositions.length - 1];
        const isActive = realm.active || DEMO_MODE;

        return (
          <button
            key={realm.id}
            type="button"
            onClick={() => onSelect(index)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
            style={{
              left: position.left,
              top: position.top,
              transform: `translate(-50%, -50%) scale(${isSelected ? position.scale * 1.14 : position.scale})`,
              opacity: transitioning ? 0.55 : isSelected ? 1 : 0.78,
            }}
          >
            <div
              className="relative mx-auto overflow-hidden rounded-t-full"
              style={{
                width: "130px",
                height: "188px",
                background: "linear-gradient(180deg, rgba(42,38,34,0.88), rgba(10,11,12,0.96))",
                border: `3px solid ${isSelected ? realm.color : "rgba(255,245,205,0.2)"}`,
                boxShadow: isSelected
                  ? `0 0 32px ${realm.colorDim}, inset 0 0 30px ${realm.colorDim}, 0 16px 30px rgba(0,0,0,0.28)`
                  : "inset 0 0 24px rgba(0,0,0,0.45), 0 10px 22px rgba(0,0,0,0.22)",
              }}
            >
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center 58%, ${realm.colorDim}, transparent 68%)` }} />
              {isSelected ? (
                <RealmPortalPreview
                  realmId={realm.id}
                  symbol={realm.symbol}
                  color={isActive ? realm.color : "rgba(255,255,255,0.35)"}
                  colorDim={isActive ? realm.colorDim : "rgba(255,255,255,0.1)"}
                  isSelected
                  levelNumber={levelNumber}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl" style={{ color: realm.color, filter: `drop-shadow(0 0 10px ${realm.colorDim})` }}>
                    {realm.symbol}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 max-w-[150px] truncate text-center text-[11px] font-black text-white/70 drop-shadow-lg">
              {realm.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export default function RealmCarousel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") ?? "Year 1";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [studentYear, setStudentYear] = useState(level);
  const [programStore, setProgramStore] = useState<ReturnType<typeof readProgramStore>>({});
  const levelMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const progress = readProgress();
    setStudentYear(progress?.year ?? level);
    setProgramStore(readProgramStore());
  }, [level]);

  const levelLabel = level.startsWith("Year")
    ? `Level ${level.replace("Year ", "")}`
    : level;
  const levelNumber = Number(levelLabel.replace(/[^0-9]/g, "")) || 1;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!levelMenuRef.current) return;
      if (!levelMenuRef.current.contains(event.target as Node)) {
        setIsLevelMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLevelMenuOpen(false);
    }

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const realmProgressRows = useMemo(() => {
    const totalLessonSlots = 12 * 3;
    let completedLessonSlots = 0;
    let completedQuizSlots = 0;

    for (let week = 1; week <= 12; week += 1) {
      const weekProgress = getWeekProgress(programStore, studentYear, week);
      completedLessonSlots += weekProgress.lessonsCompleted.filter(Boolean).length;
      if (weekProgress.quizCompleted || typeof weekProgress.quizScore === "number") {
        completedQuizSlots += 1;
      }
    }

    const nexusPercent = Math.round(
      ((completedLessonSlots + completedQuizSlots) / Math.max(totalLessonSlots + 12, 1)) * 100
    );

    return DROPDOWN_REALM_IDS.map((realmId) => {
      const realm = REALMS.find((item) => item.id === realmId);
      if (!realm) return null;

      if (realm.id === "number-nexus") {
        return {
          id: realm.id,
          name: realm.name,
          percent: Math.max(0, Math.min(100, nexusPercent)),
          status: nexusPercent >= 100 ? "Complete" : `${Math.max(0, nexusPercent)}%`,
          barClass:
            nexusPercent >= 100
              ? "from-emerald-400 to-teal-300"
              : "from-emerald-500 to-cyan-400",
        };
      }

      if (realm.comingSoon) {
        return {
          id: realm.id,
          name: realm.name,
          percent: 0,
          status: "Soon",
          barClass: "from-white/20 to-white/10",
        };
      }

      const levelLocked =
        (realm.id === "pattern-peaks" || realm.id === "statistica") && levelNumber < 3;

      return {
        id: realm.id,
        name: realm.name,
        percent: 0,
        status: levelLocked ? "Locked" : "Locked",
        barClass: "from-white/15 to-white/10",
      };
    }).filter(Boolean) as Array<{
      id: string;
      name: string;
      percent: number;
      status: string;
      barClass: string;
    }>;
  }, [levelNumber, programStore, studentYear]);

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
  const isApexLevel = levelNumber >= 6;

  function selectRealm(index: number) {
    if (transitioning || index === currentIndex) return;
    setTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setTransitioning(false), 400);
  }

  function enterRealm() {
    if (!isActive) return;
    if (current.id === "number-nexus") router.push("/home");
  }

  return (
    <main className="min-h-screen relative overflow-hidden select-none">
      {/* Interior background */}
      <div className="fixed inset-0 z-0">
        <img
          src={isApexLevel ? "/images/tower-hub-bg.jpg" : "/images/realm-select-bg.jpg"}
          alt=""
          className="w-full h-full object-cover"
          style={{
            objectPosition: isApexLevel ? "center 18%" : `${50 + bgShift}% 35%`,
            transition: "object-position 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: isApexLevel ? "scale(1.02)" : "scale(1.05)",
          }}
        />
        {isApexLevel ? (
          <>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center 0%, rgba(255,245,190,0.34), transparent 34%), radial-gradient(ellipse at center 46%, transparent 28%, rgba(0,0,0,0.5) 100%)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-white/10" />
            <div
              className="absolute left-1/2 top-0 h-[58vh] w-[62vw] -translate-x-1/2"
              style={{ background: "radial-gradient(ellipse at top, rgba(255,250,220,0.36), transparent 68%)", filter: "blur(10px)" }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center 60%, transparent 30%, rgba(0,0,0,0.5) 100%)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </>
        )}
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
          <div ref={levelMenuRef} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLevelMenuOpen((currentValue) => !currentValue)}
              className="text-xs font-bold text-white/90 px-3.5 py-1.5 rounded-full transition hover:scale-[1.02] hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {levelLabel}
            </button>
            <button
              type="button"
              onClick={() => router.push("/realm-stats")}
              title="View Progress"
              aria-label="View Progress"
              className="h-10 w-10 rounded-full border border-white/20 bg-white/10 text-white/90 backdrop-blur-md transition hover:scale-105 hover:bg-white/15 hover:shadow-[0_0_18px_rgba(255,255,255,0.18)] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="8" r="4" />
              </svg>
            </button>

            {isLevelMenuOpen ? (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-[320px] rounded-3xl border border-white/15 bg-[rgba(10,12,18,0.82)] p-4 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                style={{ zIndex: 40 }}
              >
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    Current Level
                  </div>
                  <div className="mt-1 text-lg font-black text-white">{levelLabel}</div>
                </div>

                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Realm Progress
                </div>

                <div className="space-y-3">
                  {realmProgressRows.map((realm) => (
                    <div key={realm.id} className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-white/90">{realm.name}</div>
                        <div className="text-xs font-extrabold uppercase tracking-wide text-white/55">
                          {realm.status}
                        </div>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${realm.barClass}`}
                          style={{ width: `${realm.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
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
            {isApexLevel ? "Tower Apex" : "Choose Your Realm"}
          </h1>
        </div>

        {/* Portal Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
          {isApexLevel ? (
            <ApexTowerScene
              realms={REALMS}
              currentIndex={currentIndex}
              transitioning={transitioning}
              onSelect={selectRealm}
              levelNumber={levelNumber}
            />
          ) : (
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
                  levelNumber={levelNumber}
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
          )}

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
