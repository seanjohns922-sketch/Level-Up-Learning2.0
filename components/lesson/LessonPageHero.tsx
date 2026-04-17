"use client";

import heroNumberNexus from "@/src/assets/lesson-hero-number-nexus.jpg";

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
  heroClass,
}: LessonPageHeroProps) {
  return (
    <div
      className={`${heroClass} relative overflow-hidden text-white`}
      style={{
        background:
          "linear-gradient(135deg, #042f2e 0%, #0f4f4a 40%, #0d9488 75%, #14b8a6 100%)",
      }}
    >
      {/* Layer 2: World artwork on the right */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[62%] bg-cover bg-center opacity-95"
        style={{ backgroundImage: `url(${heroNumberNexus.src})` }}
        aria-hidden
      />
      {/* Left-to-right fade so the left text area reads cleanly */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,47,46,0.96) 0%, rgba(4,47,46,0.85) 32%, rgba(4,47,46,0.45) 55%, rgba(4,47,46,0.15) 80%, rgba(4,47,46,0) 100%)",
        }}
        aria-hidden
      />
      {/* Layer 3: Soft top radial light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 75% 0%, rgba(94,234,212,0.22), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 px-5 py-4 md:px-7 md:py-5 max-w-[60%]">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm md:text-xs">
          Level {levelNumber} • Week {week} • Lesson {lessonNumber}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] md:text-3xl">
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
