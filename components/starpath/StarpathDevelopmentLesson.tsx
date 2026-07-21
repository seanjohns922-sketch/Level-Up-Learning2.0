"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Orbit } from "lucide-react";
import { useEffect } from "react";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

type LessonMetadata = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  lesson: number;
  title: string;
  focus: string;
  learningIntention: string;
  registryId: string;
  status: string;
  dashboardHref: string;
  previousHref: string | null;
  nextHref: string | null;
};

export default function StarpathDevelopmentLesson({ lesson }: { lesson: LessonMetadata }) {
  useEffect(() => {
    writeStarpathDemoJourney(lesson.level, {
      currentWeek: lesson.week,
      currentLesson: lesson.lesson,
    });
  }, [lesson.lesson, lesson.level, lesson.week]);

  return (
    <main className="min-h-screen bg-[#070a1b] px-5 py-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(124,58,237,0.28),transparent_38%),linear-gradient(180deg,#070a1b_0%,#10153a_55%,#070a1b_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-200/15 pb-5">
          <Link
            href={lesson.dashboardHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-200/25 bg-white/5 px-4 text-sm font-bold text-cyan-100 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Starpath
          </Link>
          <div className="text-right font-mono text-xs font-black uppercase tracking-[0.18em] text-violet-200">
            Demo Mode · realm_id=space
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center py-10">
          <article className="w-full overflow-hidden rounded-lg border border-cyan-200/25 bg-[#0d1230]/90 shadow-[0_24px_90px_rgba(76,29,149,0.34)] backdrop-blur-xl">
            <div className="border-b border-cyan-200/15 bg-gradient-to-r from-violet-950/80 via-indigo-900/60 to-cyan-950/70 px-7 py-6 sm:px-10">
              <div className="flex items-center gap-3 text-cyan-200">
                <Orbit className="h-7 w-7" />
                <span className="font-mono text-xs font-black uppercase tracking-[0.24em]">Starpath Development Lesson</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-normal sm:text-5xl">{lesson.title}</h1>
              <p className="mt-3 font-mono text-sm font-bold uppercase tracking-[0.16em] text-violet-200">
                {lesson.levelLabel} · Week {lesson.week} · Lesson {lesson.lesson}
              </p>
            </div>

            <div className="grid gap-8 px-7 py-8 sm:px-10 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
                  <BookOpen className="h-4 w-4" /> Ready to Build
                </div>
                <h2 className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Curriculum focus</h2>
                <p className="mt-3 text-lg leading-8 text-slate-100">{lesson.focus}</p>
                <h2 className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Learning intention</h2>
                <p className="mt-3 text-lg leading-8 text-slate-100">{lesson.learningIntention}</p>
              </div>

              <aside className="rounded-lg border border-white/10 bg-black/20 p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">Registry metadata</div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="text-slate-400">Realm</dt><dd className="mt-1 font-mono font-bold text-cyan-100">space</dd></div>
                  <div><dt className="text-slate-400">Registry ID</dt><dd className="mt-1 break-all font-mono font-bold text-cyan-100">{lesson.registryId}</dd></div>
                  <div><dt className="text-slate-400">Content status</dt><dd className="mt-1 font-bold capitalize text-amber-200">{lesson.status}</dd></div>
                </dl>
              </aside>
            </div>
          </article>
        </section>

        <nav className="flex items-center justify-between gap-4 border-t border-cyan-200/15 pt-5" aria-label="Starpath lesson navigation">
          {lesson.previousHref ? (
            <Link href={lesson.previousHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold text-slate-100 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> Previous lesson
            </Link>
          ) : <span />}
          {lesson.nextHref ? (
            <Link href={lesson.nextHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-black text-slate-950 hover:bg-cyan-100">
              Next lesson <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
