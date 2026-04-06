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
    <div className={`${heroClass} text-white px-5 py-6 md:px-7 md:py-7`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm md:text-sm">
        Level {levelNumber} • Week {week} • Lesson {lessonNumber}
      </div>
      <h1 className="mt-4 text-3xl font-light tracking-tight md:text-5xl">
        {pageTitle}
      </h1>
      {lessonTitle ? (
        <p className="mt-2 text-lg font-medium text-white/90 md:text-xl">{lessonTitle}</p>
      ) : null}
      {focus ? (
        <p className="mt-1.5 text-sm text-white/75 md:text-base">Focus: {focus}</p>
      ) : null}
    </div>
  );
}
