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
  heroClass,
}: LessonPageHeroProps) {
  return (
    <div className={`${heroClass} text-white px-5 py-4 md:px-7 md:py-5`}>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm md:text-xs">
          Level {levelNumber} • Week {week} • Lesson {lessonNumber}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] md:text-3xl">
          {pageTitle}
        </h1>
        {lessonTitle ? (
          <p className="mt-1 text-sm font-medium text-white/95 md:text-base">{lessonTitle}</p>
        ) : null}
        {focus ? (
          <p className="mt-0.5 text-xs font-normal text-white/70 md:text-sm">Focus: {focus}</p>
        ) : null}
      </div>
    </div>
  );
}
