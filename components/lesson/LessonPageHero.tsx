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
    <div className={`${heroClass} text-white px-6 py-8 md:px-8 md:py-10`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm">
        Level {levelNumber} • Week {week} • Lesson {lessonNumber}
      </div>
      <h1 className="mt-5 text-4xl font-light tracking-tight md:text-6xl">
        {pageTitle}
      </h1>
      {lessonTitle ? (
        <p className="mt-3 text-xl font-medium text-white/90 md:text-2xl">{lessonTitle}</p>
      ) : null}
      {focus ? (
        <p className="mt-2 text-base text-white/75 md:text-lg">Focus: {focus}</p>
      ) : null}
    </div>
  );
}
