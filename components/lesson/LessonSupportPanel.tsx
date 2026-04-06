"use client";

import { BookOpen, Lightbulb } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export function LessonSupportPanel({
  taskDescription,
  hint,
}: {
  taskDescription: string;
  hint?: string | null;
}) {
  return (
    <div className="space-y-2.5">
      {/* Task description */}
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/90 via-emerald-50/80 to-white px-4 py-3.5 shadow-sm">
        <div className="mb-1.5 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-100 shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-teal-700" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
            Your Task
          </span>
          <ReadAloudBtn text={taskDescription} size="sm" className="ml-auto" />
        </div>
        <p className="text-sm font-semibold text-teal-950 leading-relaxed md:text-[15px]">
          {taskDescription}
        </p>
      </div>

      {/* Hint / support */}
      {hint && (
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
      )}
    </div>
  );
}
