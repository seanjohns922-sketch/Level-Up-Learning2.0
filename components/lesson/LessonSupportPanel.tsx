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
      <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100">
            <BookOpen className="h-3 w-3 text-teal-700" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Your Task
          </span>
          <ReadAloudBtn text={taskDescription} size="sm" className="ml-auto" />
        </div>
        <p className="text-sm font-medium text-teal-900 leading-relaxed">
          {taskDescription}
        </p>
      </div>

      {/* Hint / support */}
      {hint && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
              <Lightbulb className="h-3 w-3 text-amber-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Hint
            </span>
          </div>
          <p className="text-sm font-medium text-amber-900 leading-relaxed whitespace-pre-line">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}
