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
}: LessonPageHeroProps) {
  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(110deg, #042f2e 0%, #0b3f3c 45%, #0f4f4a 60%, #0d9488 100%)",
      }}
    >
      {/* RIGHT ~55%: crisp city artwork (wider so the long blend can sit on top) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%]" aria-hidden>
        <img
          src={heroNumberNexus.src}
          alt=""
          className="h-full w-full object-cover"
          style={{
            objectPosition: "60% center",
            transform: "scale(1.08)",
            transformOrigin: "right center",
            filter: "contrast(1.04) saturate(0.92) brightness(1.02) hue-rotate(-4deg)",
          }}
        />
        {/* Long edge softener — fades the LEFT 70% of the image into the header */}
        <div
          className="absolute inset-y-0 left-0 w-[70%]"
          style={{
            background:
              "linear-gradient(90deg, #042f2e 0%, rgba(11,63,60,0.96) 18%, rgba(13,80,76,0.78) 38%, rgba(15,79,74,0.45) 60%, rgba(15,79,74,0.18) 80%, rgba(15,79,74,0) 100%)",
          }}
        />
        {/* Tiny vertical glow line at the blend point — "portal" feel */}
        <div
          className="absolute inset-y-0 left-[28%] w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(94,234,212,0.35) 40%, rgba(94,234,212,0.5) 50%, rgba(94,234,212,0.35) 60%, transparent 100%)",
            boxShadow: "0 0 12px rgba(94,234,212,0.35)",
          }}
        />
        {/* Subtle cyan accent on the far right */}
        <div
          className="absolute inset-y-0 right-0 w-[40%]"
          style={{
            background:
              "radial-gradient(ellipse at 80% 35%, rgba(94,234,212,0.14), transparent 60%)",
          }}
        />
      </div>

      {/* Subtle floating numbers overlay — only over the city */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[30%] select-none font-mono text-[10px] leading-[16px] tracking-widest text-cyan-200/[0.18] mix-blend-screen"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 80%, transparent 100%)",
        }}
        aria-hidden
      >
        <div className="flex flex-wrap gap-x-3 p-3">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i}>{(i * 53 + 7) % 1000}</span>
          ))}
        </div>
      </div>

      {/* Content — confined to left ~58% */}
      <div className="relative z-10 px-5 py-4 md:px-7 md:py-5 max-w-[58%]">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm md:text-xs">
          Level {levelNumber} • Week {week} • Lesson {lessonNumber}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] md:text-3xl">
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
