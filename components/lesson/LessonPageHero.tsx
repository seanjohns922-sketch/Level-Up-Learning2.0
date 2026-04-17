"use client";

type LessonPageHeroProps = {
  levelNumber: number;
  week: number;
  lessonNumber: number;
  pageTitle: string;
  lessonTitle?: string | null;
  focus?: string | null;
  heroClass: string;
};

export function LessonPageHero({
  levelNumber,
  week,
  lessonNumber,
  pageTitle,
  lessonTitle,
  focus,
}: LessonPageHeroProps) {
  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(110deg, #042f2e 0%, #0f4f4a 38%, #0d9488 72%, #22d3ee 100%)",
      }}
    >
      {/* Faint grid (right-biased) */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[68%] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(186,255,247,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(186,255,247,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.4) 100%)",
        }}
        aria-hidden
      />

      {/* Subtle low-opacity number overlay */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[55%] select-none font-mono text-[10px] leading-[14px] tracking-widest text-cyan-100/[0.07] blur-[0.3px]"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 80%, transparent 100%)",
        }}
        aria-hidden
      >
        <div className="flex flex-wrap gap-x-4 p-3">
          {Array.from({ length: 80 }).map((_, i) => (
            <span key={i}>{(i * 37 + 19) % 100}</span>
          ))}
        </div>
      </div>

      {/* Soft glowing energy paths (SVG) */}
      <svg
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[60%] opacity-70"
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="lessonHeroLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(94,234,212,0)" />
            <stop offset="40%" stopColor="rgba(94,234,212,0.55)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
          <filter id="lessonHeroBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>
        <g filter="url(#lessonHeroBlur)" stroke="url(#lessonHeroLine)" fill="none" strokeWidth="1.2">
          <path d="M0 60 Q150 20 300 70 T600 50" />
          <path d="M0 110 Q180 90 320 130 T600 100" opacity="0.7" />
          <path d="M0 160 Q200 140 340 170 T600 150" opacity="0.5" />
        </g>
      </svg>

      {/* Soft right-side radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 88% 30%, rgba(94,234,212,0.28), transparent 55%)",
        }}
        aria-hidden
      />

      {/* Left-to-right fade to keep text crisp */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,47,46,0.85) 0%, rgba(4,47,46,0.55) 35%, rgba(4,47,46,0.15) 65%, rgba(4,47,46,0) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 px-5 py-4 md:px-7 md:py-5 max-w-[60%]">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:text-xs">
          Level {levelNumber} • Week {week} • Lesson {lessonNumber}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] md:text-3xl">
          {pageTitle}
        </h1>
        {lessonTitle ? (
          <p className="mt-1 text-sm font-medium text-white/95 md:text-base">{lessonTitle}</p>
        ) : null}
        {focus ? (
          <p className="mt-0.5 text-xs font-normal text-white/75 md:text-sm">Focus: {focus}</p>
        ) : null}
      </div>
    </div>
  );
}
