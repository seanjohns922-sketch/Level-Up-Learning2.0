"use client";

import { Lightbulb } from "lucide-react";

export function LessonSupportPanel({
  hint,
}: {
  hint?: string | null;
}) {
  return (
    hint ? (
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/90 to-white px-4 py-3.5 shadow-sm">
        <div className="mb-1.5 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 shadow-sm">
            <Lightbulb className="h-3.5 w-3.5 text-amber-700" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
            Hint
          </span>
        </div>
        <p className="text-sm font-medium text-amber-950 leading-relaxed whitespace-pre-line md:text-[15px]">
          {hint}
        </p>
      </div>
    ) : null
  );
}
