"use client";

import { useTreehouseReturn } from "@/lib/world3d/use-treehouse-return";

/** "← Back to the Gem Cave" and friends: shown only when the page was opened from a treehouse room. */
export default function TreehouseBackLink({ tone }: { tone: "dark" | "light" }) {
  const target = useTreehouseReturn();
  if (!target) return null;
  const colour = tone === "dark" ? "text-amber-200 hover:text-white" : "text-slate-700 hover:text-slate-950";
  return <a href={target.href} className={`mb-4 inline-flex items-center gap-1 text-sm font-bold ${colour}`}>← {target.label}</a>;
}
