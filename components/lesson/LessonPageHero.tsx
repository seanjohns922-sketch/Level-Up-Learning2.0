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
    <div className={`${heroClass} text-white px-5 py-3.5 md:px-7 md:py-4`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur-sm md:text-xs">
        Level {levelNumber} • Week {week} • Lesson {lessonNumber}
      </div>
      <h1 className="mt-1.5 text-xl font-light tracking-tight md:text-2xl">
        {pageTitle}
      </h1>
      {lessonTitle ? (
        <p className="mt-0.5 text-sm font-medium text-white/90 md:text-base">{lessonTitle}</p>
      ) : null}
      {focus ? (
        <p className="mt-0.5 text-xs text-white/75 md:text-sm">Focus: {focus}</p>
      ) : null}
    </div>
  );
}
