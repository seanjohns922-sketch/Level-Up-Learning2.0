"use client";

const heroNumberNexus = { src: "/images/lesson-hero-number-nexus.jpg" };
const heroMeasurelands = { src: "/images/measurelands-home-bg.png" };
const heroMeasurelandsByYear: Record<number, string> = {
  1: "/images/measurelands-home-bg-y1.png",
  2: "/images/measurelands-home-bg-y2.png",
  3: "/images/measurelands-home-bg-y3.jpg",
  4: "/images/measurelands-home-bg-y4.jpg",
  5: "/images/measurelands-home-bg-y5.png",
  6: "/images/measurelands-home-bg-y6.png",
};

function getMeasurelandsHeroSrc(year?: number | string) {
  const numericYear = typeof year === "number" ? year : Number(String(year ?? "").match(/\d+/)?.[0] ?? NaN);
  return heroMeasurelandsByYear[numericYear] ?? heroMeasurelands.src;
}

type LessonPageHeroProps = {
  levelNumber: number;
  levelLabel?: string;
  year?: number | string;
  week: number;
  lessonNumber: number;
  breadcrumbText?: string;
  pageTitle: string;
  lessonTitle?: string | null;
  focus?: string | null;
  heroClass: string;
  realmId?: string;
};

export function LessonPageHero({
  levelNumber,
  levelLabel,
  year,
  week,
  lessonNumber,
  breadcrumbText,
  pageTitle,
  lessonTitle,
  focus,
  realmId,
}: LessonPageHeroProps) {
  const isMeasurement = realmId === "measurement";
  const measurementHeroSrc = getMeasurelandsHeroSrc(year ?? levelNumber);

  return (
    <div
      className="relative overflow-hidden text-white"
      style={{ background: isMeasurement ? "#1a0e00" : "#021716" }}
    >
      {/* Hero background image */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isMeasurement ? measurementHeroSrc : heroNumberNexus.src}
          alt=""
          className="h-full w-full object-cover"
          style={isMeasurement ? {
            objectPosition: "center 35%",
            filter: "brightness(0.88) saturate(1.14) contrast(1.18)",
            imageRendering: "high-quality" as React.CSSProperties["imageRendering"],
            WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
          } : {
            objectPosition: "78% center",
            transform: "scale(1.02)",
            filter: "contrast(1.18) saturate(1.08) brightness(1.06) hue-rotate(-4deg)",
          }}
        />

        {isMeasurement ? (
          <>
            {/* Warm left-to-right darken so text is readable */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(90deg, rgba(20,8,0,0.96) 0%, rgba(20,8,0,0.92) 18%, rgba(15,6,0,0.82) 34%, rgba(10,4,0,0.55) 52%, rgba(5,2,0,0.2) 72%, rgba(5,2,0,0) 100%)",
            }} />
            {/* Top/bottom darkening for depth */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(0,0,0,0.25) 100%)",
            }} />
            {/* Warm purple accent on far right */}
            <div className="absolute inset-y-0 right-0 w-[35%]" style={{
              background: "radial-gradient(ellipse at 80% 35%, rgba(109,40,217,0.14), transparent 60%)",
            }} />
            {/* Subtle golden light from the centre */}
            <div className="absolute inset-0" style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,160,48,0.06) 0%, transparent 70%)",
            }} />
          </>
        ) : (
          <>
            {/* Long horizontal darken — opaque on left, transparent on right */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(90deg, #021716 0%, rgba(2,23,22,0.98) 20%, rgba(2,23,22,0.9) 35%, rgba(2,23,22,0.65) 52%, rgba(2,23,22,0.3) 70%, rgba(2,23,22,0.1) 86%, rgba(2,23,22,0) 100%)",
            }} />
            {/* Soft top-to-bottom darken */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
            }} />
            {/* Subtle cyan accent on the far right */}
            <div className="absolute inset-y-0 right-0 w-[35%]" style={{
              background: "radial-gradient(ellipse at 80% 35%, rgba(94,234,212,0.16), transparent 60%)",
            }} />
          </>
        )}
      </div>

      {/* Floating numbers overlay (Number Nexus only) */}
      {!isMeasurement && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[30%] select-none font-mono text-[10px] leading-[16px] tracking-widest text-cyan-200/[0.18] mix-blend-screen"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 80%, transparent 100%)",
          }}
          aria-hidden
        >
          <div className="flex flex-wrap gap-x-3 p-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i}>{(i * 53 + 7) % 1000}</span>
            ))}
          </div>
        </div>
      )}

      {/* Measurelands subtle measurement symbols */}
      {isMeasurement && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[28%] select-none font-mono text-[11px] leading-[18px] tracking-widest mix-blend-screen"
          style={{
            color: "rgba(200,160,48,0.12)",
            maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.8) 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.8) 80%, transparent 100%)",
          }}
          aria-hidden
        >
          <div className="flex flex-wrap gap-x-4 p-3">
            {["1m", "30cm", "½", "10g", "1L", "60s", "24h", "⊕", "⊗", "∞", "≈", "⏱"].map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Content — confined to left ~58% */}
      <div className="relative z-10 px-5 py-4 md:px-7 md:py-5 max-w-[58%]">
        {/* Breadcrumb pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:text-xs"
          style={isMeasurement ? {
            background: "rgba(50,25,5,0.55)",
            border: "1px solid rgba(200,160,48,0.35)",
            color: "rgba(255,240,200,0.92)",
          } : {
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {breadcrumbText ?? `${levelLabel ?? `Level ${levelNumber}`} • Week ${week} • Lesson ${lessonNumber}`}
        </div>

        <h1
          className="mt-2 text-2xl font-bold tracking-[-0.02em] md:text-3xl"
          style={isMeasurement ? {
            color: "#fff8e8",
            textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 0 24px rgba(109,40,217,0.2)",
          } : {
            textShadow: "0 2px 8px rgba(0,0,0,0.45)",
          }}
        >
          {pageTitle}
        </h1>
        {lessonTitle ? (
          <p
            className="mt-1 text-sm font-medium md:text-base"
            style={{ color: isMeasurement ? "rgba(255,235,185,0.92)" : "rgba(255,255,255,0.95)" }}
          >
            {lessonTitle}
          </p>
        ) : null}
        {focus ? (
          <p
            className="mt-0.5 text-xs font-normal md:text-sm"
            style={{ color: isMeasurement ? "rgba(220,200,155,0.78)" : "rgba(255,255,255,0.75)" }}
          >
            Focus: {focus}
          </p>
        ) : null}
      </div>
    </div>
  );
}
