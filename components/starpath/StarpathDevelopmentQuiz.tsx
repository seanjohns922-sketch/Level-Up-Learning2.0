"use client";

import { BookOpen, Rocket, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { REALM_QUIZ_THEMES, RealmWeeklyQuizChrome } from "@/components/quiz/RealmWeeklyQuizChrome";
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
  const router = useRouter();
  const levelNumber = quiz.level === "Prep" ? 0 : Number(quiz.level.replace(/\D/g, "")) || 0;
  const theme = REALM_QUIZ_THEMES.space;

  useEffect(() => {
    writeStarpathDemoJourney(quiz.level, { currentWeek: quiz.week, currentLesson: 3 });
  }, [quiz.level, quiz.week]);

  return (
    <main className="relative isolate min-h-screen px-3 py-4 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1500px]">
        <RealmWeeklyQuizChrome
          realm="space"
          levelNumber={levelNumber}
          levelLabel={quiz.levelLabel}
          year={quiz.level}
          week={quiz.week}
          questionCount={15}
          focus={quiz.coverage}
          demoMode
          onBack={() => router.push(quiz.weekHref)}
        />

        <section
          className="rounded-b-lg border px-4 py-6 text-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:px-7"
          style={{ background: theme.workspaceBg, borderColor: theme.panelBorder }}
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <article className="rounded-lg border border-violet-200/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(49,46,129,0.12)] sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-800">
                <Sparkles className="h-4 w-4" /> Voyage preview
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">{quiz.title}</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">{quiz.coverage}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {quiz.sourceLessons.map((title, index) => (
                  <div key={title} className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-4">
                    <div className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800">Mission {index + 1}</div>
                    <div className="mt-2 font-bold text-slate-900">{title}</div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="rounded-lg border border-cyan-200/70 bg-[#101536] p-5 text-white shadow-[0_18px_50px_rgba(49,46,129,0.2)]">
              <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                <Rocket className="h-4 w-4" /> Voyage status
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-violet-100"><BookOpen className="h-4 w-4" /> Content is being prepared</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">This preview preserves Starpath routing without loading another realm&apos;s quiz.</p>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div><dt className="text-slate-400">Realm</dt><dd className="mt-1 font-mono font-bold text-cyan-100">space</dd></div>
                <div><dt className="text-slate-400">Registry ID</dt><dd className="mt-1 break-all font-mono font-bold text-cyan-100">{quiz.registryId}</dd></div>
                <div><dt className="text-slate-400">Status</dt><dd className="mt-1 font-bold capitalize text-amber-200">{quiz.status}</dd></div>
              </dl>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
