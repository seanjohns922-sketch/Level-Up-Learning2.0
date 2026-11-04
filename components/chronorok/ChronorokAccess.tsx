"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { useChronorokProgress } from "@/lib/useChronorokProgress";
import { CHRONOROK_OPEN_DAYS } from "@/lib/chronorok";

/** Direct game URLs retain the same five-learning-day gate as the hub. */
export default function ChronorokAccess({ children }: { children: ReactNode }) {
  const { loading, error, progress, signedIn, preview } = useChronorokProgress();
  if (progress?.open) return children;
  return <main className="grid min-h-screen place-items-center bg-[#21160d] p-6 text-center text-amber-50"><div className="max-w-md">
    <h1 className="text-3xl font-black">Chronorok</h1>
    <p className="my-5" role="status">{loading ? "Loading your Chrono Crystals…" : error ?? (!signedIn && !preview ? "Sign in to enter Chronorok." : `Complete a lesson or quiz on ${CHRONOROK_OPEN_DAYS} different days to open the games. ${progress?.learningDays ?? 0} of ${CHRONOROK_OPEN_DAYS} days completed.`)}</p>
    {!loading && <Link href={!signedIn && !preview ? "/login" : "/world/chronorok"} className="inline-block rounded-xl bg-amber-200 px-6 py-3 font-bold text-slate-950">{!signedIn && !preview ? "Sign in" : "Back to Chronorok"}</Link>}
  </div></main>;
}
