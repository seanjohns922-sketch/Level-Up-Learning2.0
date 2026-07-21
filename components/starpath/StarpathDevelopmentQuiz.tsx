"use client";

import Link from "next/link";
import { ArrowLeft, Orbit, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

type QuizMetadata = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  title: string;
  coverage: string;
  sourceLessons: string[];
  registryId: string;
  status: string;
  weekHref: string;
};

export default function StarpathDevelopmentQuiz({ quiz }: { quiz: QuizMetadata }) {
  useEffect(() => {
    writeStarpathDemoJourney(quiz.level, { currentWeek: quiz.week, currentLesson: 3 });
  }, [quiz.level, quiz.week]);

  return (
    <main className="min-h-screen bg-[#070a1b] px-5 py-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_75%_42%,rgba(124,58,237,0.24),transparent_40%),linear-gradient(180deg,#070a1b_0%,#11163d_58%,#070a1b_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-200/15 pb-5">
          <Link href={quiz.weekHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-200/25 bg-white/5 px-4 text-sm font-bold text-cyan-100 transition hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" /> Back to Week {quiz.week}
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
                <span className="font-mono text-xs font-black uppercase tracking-[0.24em]">Starpath Development Quiz</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-normal sm:text-5xl">{quiz.title}</h1>
              <p className="mt-3 font-mono text-sm font-bold uppercase tracking-[0.16em] text-violet-200">
                {quiz.levelLabel} · Week {quiz.week} · 15 Questions
              </p>
            </div>

            <div className="grid gap-8 px-7 py-8 sm:px-10 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
                  <Sparkles className="h-4 w-4" /> Ready to Build
                </div>
                <h2 className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Voyage coverage</h2>
                <p className="mt-3 text-lg leading-8 text-slate-100">{quiz.coverage}</p>
                <h2 className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Source missions</h2>
                <ol className="mt-3 space-y-2 text-lg text-slate-100">
                  {quiz.sourceLessons.map((title, index) => <li key={title}>{index + 1}. {title}</li>)}
                </ol>
              </div>

              <aside className="rounded-lg border border-white/10 bg-black/20 p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">Registry metadata</div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div><dt className="text-slate-400">Realm</dt><dd className="mt-1 font-mono font-bold text-cyan-100">space</dd></div>
                  <div><dt className="text-slate-400">Registry ID</dt><dd className="mt-1 break-all font-mono font-bold text-cyan-100">{quiz.registryId}</dd></div>
                  <div><dt className="text-slate-400">Content status</dt><dd className="mt-1 font-bold capitalize text-amber-200">{quiz.status}</dd></div>
                </dl>
              </aside>
            </div>
          </article>
        </section>

        <nav className="flex justify-center border-t border-cyan-200/15 pt-5" aria-label="Starpath quiz navigation">
          <Link href={quiz.weekHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-200 px-5 text-sm font-black text-slate-950 hover:bg-cyan-100">
            <ArrowLeft className="h-4 w-4" /> Return to Week {quiz.week}
          </Link>
        </nav>
      </div>
    </main>
  );
}
