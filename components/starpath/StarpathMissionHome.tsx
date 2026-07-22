"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  Flame,
  Gem,
  Medal,
  Orbit,
  Play,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { StarpathLessonContent } from "@/data/activities/starpath/lesson-blueprint";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export type StarpathMissionMetadata = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  lesson: number;
  title: string;
  focus: string;
  learningIntention: string;
  registryId: string;
  status: string;
  weekHref: string;
};

export default function StarpathMissionHome({
  lesson,
  content,
  onStart,
}: {
  lesson: StarpathMissionMetadata;
  content?: StarpathLessonContent;
  onStart?: () => void;
}) {
  const available = lesson.status === "implemented" && Boolean(content) && Boolean(onStart);
  const criteria = content?.successCriteria ?? [lesson.focus];
  const artworkSrc = content?.artworkSrc ?? "/images/starpath-home-bg-ground.png";
  const learningText = `Today I am learning to ${lesson.learningIntention.replace(/^I can /, "")}`;
  const criteriaText = `I can ${criteria.join(". I can ")}.`;
  const missionText = `${lesson.title}. ${content?.missionBrief ?? "This Starpath mission is being prepared for future explorers."} ${learningText}. ${criteriaText} This mission takes approximately nine minutes.`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a1b] px-3 py-3 text-white sm:px-5 sm:py-5">
      <div className="fixed inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artworkSrc}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "brightness(0.35) saturate(1.18)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,27,0.62),rgba(26,12,62,0.86))]" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:38px_38px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-200/20 bg-[#090d24]/90 px-3 py-3 backdrop-blur-md sm:px-5">
          <Link
            href={lesson.weekHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-200/25 bg-white/5 px-4 text-sm font-bold text-cyan-100 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Week {lesson.week}
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-200">
            <Orbit className="h-5 w-5 text-cyan-300" /> Starpath · Demo Mode
          </div>
        </header>

        <section className="mt-4 overflow-hidden rounded-lg border border-cyan-200/25 bg-[#0a102a]/95 shadow-[0_24px_90px_rgba(76,29,149,0.42)] backdrop-blur-xl">
          <div className="relative min-h-[280px] overflow-hidden border-b border-cyan-200/15 px-6 py-8 sm:px-10 sm:py-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artworkSrc}
              alt="A glowing Starpath world filled with planets and constellations"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,10,86,0.96)_0%,rgba(31,10,86,0.78)_48%,rgba(3,25,48,0.32)_100%)]" />
            <div className="relative max-w-3xl">
              <div className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-xs">
                {lesson.levelLabel} · Week {lesson.week} · Mission {lesson.lesson}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                <Sparkles className="h-4 w-4" /> Starpath Mission
              </div>
              <div className="mt-4 flex max-w-3xl flex-wrap items-center gap-3">
                <h1 className="max-w-2xl text-4xl font-black tracking-normal text-white sm:text-6xl">{lesson.title}</h1>
                <ReadAloudBtn
                  text={missionText}
                  speechKey={`starpath-mission-${lesson.registryId}`}
                  size="md"
                  label="Read mission"
                  className="border-cyan-200/30 bg-indigo-950/70 text-cyan-100 hover:border-cyan-200 hover:text-white"
                />
              </div>
              <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-violet-100 sm:text-lg">
                {content?.missionBrief ?? "This Starpath mission is being prepared for future explorers."}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            {/* Top: lesson video alongside the learning intentions */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Lesson video — placeholder until Starpath mission videos are produced */}
              <section className="rounded-lg border border-cyan-200/20 bg-white/[0.06] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)", boxShadow: "0 2px 6px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}
                  >
                    <Video className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-cyan-100">Lesson Video</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22d3ee", boxShadow: "0 0 6px #22d3ee" }} />
                    Coming soon
                  </span>
                </div>
                <div
                  className="relative flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-xl text-xs shadow-inner"
                  style={{ background: "linear-gradient(135deg, #1e1040 0%, #241a5e 55%, #0a2f52 100%)", boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.15)" }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.16]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                      maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                      WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                    }}
                  />
                  {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos, i) => (
                    <svg key={i} aria-hidden className={`absolute ${pos} h-5 w-5 pointer-events-none`} style={{ color: "rgba(103,232,249,0.6)" }} viewBox="0 0 20 20" fill="none">
                      {i === 0 && <path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                      {i === 1 && <path d="M18 8V2h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                      {i === 2 && <path d="M2 12v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                      {i === 3 && <path d="M18 12v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                    </svg>
                  ))}
                  <span
                    className="relative inline-flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm"
                    style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.45)", boxShadow: "0 0 24px rgba(34,211,238,0.3)" }}
                  >
                    <Play className="ml-0.5 h-5 w-5 fill-current" style={{ color: "#67e8f9" }} />
                  </span>
                  <span className="relative font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(207,250,254,0.85)" }}>
                    Video coming soon
                  </span>
                </div>
              </section>

              <div className="space-y-5">
              <section className="rounded-lg border border-violet-300/20 bg-white/[0.06] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Today I am learning to...</div>
                  <ReadAloudBtn text={learningText} label="Read" className="border-cyan-200/25 bg-white/10 text-cyan-100" />
                </div>
                <p className="mt-3 text-xl font-bold leading-8 text-white">{lesson.learningIntention.replace(/^I can /, "")}</p>
              </section>

              <section className="rounded-lg border border-violet-300/20 bg-white/[0.06] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">I can...</div>
                  <ReadAloudBtn text={criteriaText} label="Read" className="border-violet-200/25 bg-white/10 text-violet-100" />
                </div>
                <ul className="mt-3 space-y-3">
                  {criteria.map((criterion) => (
                    <li key={criterion} className="flex items-start gap-3 text-base font-semibold text-slate-100">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-indigo-950">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </section>
              </div>
            </div>

            {/* Bottom: one full-width widget — rewards + time + start */}
            <section className="rounded-lg border border-cyan-200/20 bg-gradient-to-br from-violet-500/15 to-cyan-400/10 p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Mission rewards</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "XP", Icon: Star },
                      { label: "Chain", Icon: Flame },
                      { label: "Gems", Icon: Gem },
                      { label: "Mission Complete", Icon: Medal },
                    ].map(({ label, Icon }) => (
                      <div key={label} className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                        <Icon className="h-6 w-6 text-amber-200" />
                        <span className="mt-2 text-xs font-black text-white">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:shrink-0">
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-violet-100">
                    <Clock3 className="h-5 w-5 text-cyan-300" />
                    <span className="font-bold whitespace-nowrap">Approximately 9 minutes</span>
                  </div>

                  {available ? (
                    <button
                      type="button"
                      onClick={onStart}
                      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-10 text-lg font-black text-white shadow-[0_16px_40px_rgba(34,211,238,0.24)] transition hover:brightness-110 active:scale-[0.99] sm:w-auto"
                    >
                      <Play className="h-6 w-6 fill-current" /> Start Mission
                    </button>
                  ) : (
                    <div className="rounded-lg border border-amber-200/25 bg-amber-300/10 px-5 py-4 text-center">
                      <div className="text-sm font-black text-amber-100">Mission preparation in progress</div>
                      <p className="mt-1 text-xs font-semibold text-amber-100/75">This mission will open when its three practice activities are ready.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
