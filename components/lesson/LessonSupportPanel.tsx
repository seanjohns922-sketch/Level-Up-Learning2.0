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
    <div className="space-y-3">
      {/* Task description */}
      <div className="rounded-3xl border border-teal-100 bg-gradient-to-r from-teal-50/90 via-emerald-50/80 to-white px-5 py-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-teal-100 shadow-sm">
            <BookOpen className="h-4 w-4 text-teal-700" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Your Task
          </span>
          <ReadAloudBtn text={taskDescription} size="sm" className="ml-auto" />
        </div>
        <p className="text-base font-semibold text-teal-950 leading-relaxed">
          {taskDescription}
        </p>
      </div>

      {/* Hint / support */}
      {hint && (
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-r from-amber-50/90 to-white px-5 py-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-100 shadow-sm">
              <Lightbulb className="h-4 w-4 text-amber-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              Hint
            </span>
          </div>
          <p className="text-base font-medium text-amber-950 leading-relaxed whitespace-pre-line">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}
