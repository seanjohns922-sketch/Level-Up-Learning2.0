"use client";

import { Orbit, Play, Sparkles } from "lucide-react";
import type { PracticeTaskTransition } from "@/components/PracticeRunner";

export default function StarpathChallengeTransition({
  transition,
  onBegin,
}: {
  transition: PracticeTaskTransition;
  onBegin: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-cyan-200/25 bg-[linear-gradient(135deg,#210a54_0%,#17205e_55%,#063b50_100%)] px-6 py-10 text-center text-white shadow-[0_20px_60px_rgba(76,29,149,0.32)] sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="relative mx-auto max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-300/10 shadow-[0_0_35px_rgba(103,232,249,0.22)]">
          <Orbit className="h-9 w-9 text-cyan-200" />
        </div>
        <div className="mt-5 font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-200">{transition.eyebrow}</div>
        <h2 className="mt-3 text-3xl font-black sm:text-4xl">{transition.title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-base font-semibold leading-7 text-violet-100">{transition.description}</p>
        <button
          type="button"
          onClick={onBegin}
          className="mx-auto mt-7 flex min-h-14 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-8 text-lg font-black text-white shadow-[0_12px_30px_rgba(34,211,238,0.24)] transition hover:brightness-110 active:scale-[0.99]"
        >
          <Play className="h-5 w-5 fill-current" /> Begin Challenge
        </button>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-violet-200">
          <Sparkles className="h-4 w-4" /> Mission timer pauses while you prepare
        </div>
      </div>
    </div>
  );
}
