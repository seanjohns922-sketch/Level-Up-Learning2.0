"use client";

import { Bot, Gem, Minus, Plus, Star } from "lucide-react";
import type { PrepNumberNexusQuizVisual } from "@/data/quizzes/prepNumberNexus";

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">{children}</div>;
}

function Token({ token = "crystal", muted = false }: { token?: string; muted?: boolean }) {
  const Icon = token === "star" ? Star : token === "robot" ? Bot : Gem;
  return <span className={`grid h-10 w-10 place-items-center rounded-lg border ${muted ? "border-slate-300 bg-slate-100 text-slate-400" : "border-cyan-700/30 bg-cyan-100 text-cyan-900"}`}><Icon className="h-5 w-5" aria-hidden /></span>;
}

function Tokens({ count, structured = false }: { count: number; structured?: boolean }) {
  return <div className={`grid w-fit justify-center gap-2 ${structured ? "grid-cols-5" : "grid-cols-4 sm:grid-cols-5"}`}>{Array.from({ length: count }, (_, index) => <Token key={index} />)}</div>;
}

function PatternToken({ token }: { token: string }) {
  if (token === "?") return <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-dashed border-slate-400 bg-white text-2xl font-black">?</span>;
  return <Token token={token} />;
}

export default function GroundNumberNexusQuizVisual({ visual }: { visual: PrepNumberNexusQuizVisual }) {
  if (visual.type === "ground_quiz_collection") {
    return <Surface><div className="flex flex-wrap items-start justify-center gap-5">{visual.groups.map((count, index) => <div key={index} className="flex min-w-32 flex-col items-center gap-3 rounded-lg border border-cyan-800/20 bg-white p-4">{visual.labels?.[index] ? <div className="text-sm font-black text-slate-700">{visual.labels[index]}</div> : null}<Tokens count={count} structured={visual.structured} /></div>)}</div></Surface>;
  }

  if (visual.type === "ground_quiz_sequence") {
    return <Surface><div className="flex flex-wrap items-center justify-center gap-3">{visual.values.map((value, index) => <span key={index} className={`grid h-16 min-w-16 place-items-center rounded-lg border px-3 text-3xl font-black ${value === null ? "border-dashed border-slate-400 bg-white text-slate-500" : "border-cyan-700/30 bg-cyan-50"}`}>{value ?? "?"}</span>)}</div></Surface>;
  }

  if (visual.type === "ground_quiz_part_whole") {
    return <Surface><div className="flex flex-col items-center gap-4"><span className="grid h-16 min-w-20 place-items-center rounded-lg border border-emerald-700/30 bg-emerald-50 px-4 text-3xl font-black">{visual.whole}</span><div className="h-5 w-px bg-cyan-900/30" /><div className="flex gap-4">{visual.parts.map((part, index) => <span key={index} className={`grid h-16 min-w-20 place-items-center rounded-lg border px-4 text-3xl font-black ${part === null ? "border-dashed border-slate-400 bg-white text-slate-500" : "border-cyan-700/30 bg-cyan-50"}`}>{part ?? "?"}</span>)}</div></div></Surface>;
  }

  if (visual.type === "ground_quiz_change") {
    const removing = visual.action === "remove";
    return <Surface><div className="flex flex-wrap items-center justify-center gap-5"><div className="rounded-lg border border-cyan-800/20 bg-white p-4"><Tokens count={visual.start} structured /></div><span className={`grid h-12 w-12 place-items-center rounded-full ${removing ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>{removing ? <Minus aria-hidden /> : <Plus aria-hidden />}</span><div className={`rounded-lg border p-4 ${removing ? "border-rose-700/25 bg-rose-50" : "border-emerald-700/25 bg-emerald-50"}`}><Tokens count={visual.change} structured /></div></div></Surface>;
  }

  if (visual.type === "ground_quiz_share") {
    const trayCount = visual.groups ?? Math.ceil(visual.total / Math.max(1, visual.groupSize ?? 1));
    return <Surface><div className="space-y-5"><div className="flex justify-center"><Tokens count={visual.total} structured /></div><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{Array.from({ length: trayCount }, (_, index) => <div key={index} className="min-h-20 rounded-lg border-2 border-dashed border-cyan-800/25 bg-white p-3">{visual.groupSize ? <div className="flex justify-center"><Tokens count={visual.groupSize} /></div> : null}</div>)}</div></div></Surface>;
  }

  return <Surface><div className="space-y-4"><div className="flex flex-wrap justify-center gap-3">{visual.sequence.map((token, index) => <PatternToken key={index} token={token} />)}</div>{visual.choices ? <div className="grid gap-3 sm:grid-cols-3">{visual.choices.map((choice, choiceIndex) => <div key={choiceIndex} className="rounded-lg border border-cyan-800/20 bg-white p-3"><div className="mb-2 text-center text-sm font-black">Pattern {String.fromCharCode(65 + choiceIndex)}</div><div className="flex flex-wrap justify-center gap-2">{choice.map((token, index) => <PatternToken key={index} token={token} />)}</div></div>)}</div> : null}</div></Surface>;
}
