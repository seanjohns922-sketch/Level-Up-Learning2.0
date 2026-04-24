"use client";

type TopicPerformanceSummary = {
  label: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSpentSeconds: number;
};

type LessonPerformanceSummary = {
  lessonTitle: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timeSpentSeconds: number;
  topicSummaries: TopicPerformanceSummary[];
  strengths: TopicPerformanceSummary[];
  areasToImprove: TopicPerformanceSummary[];
  struggledQuestionTypes: string[];
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function PerformanceSummaryCard({
  summary,
  onStartPostTest,
  onPractiseWeakAreas,
}: {
  summary: LessonPerformanceSummary;
  onStartPostTest: () => void;
  onPractiseWeakAreas: () => void;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={{
          clipPath:
            "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          background:
            "linear-gradient(135deg, rgba(94,234,212,0.4) 0%, rgba(15,118,110,0.2) 50%, rgba(94,234,212,0.3) 100%)",
        }}
      />
      <div
        className="relative overflow-hidden"
        style={{
          clipPath:
            "polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px)",
          background:
            "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
        }}
      >
        <div className="px-6 py-7 text-center border-b border-teal-300/15">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-500/10 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/90">
            Performance Summary
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.01em] text-white">
            {summary.lessonTitle}
          </h2>
          <p className="mt-2 text-sm font-medium text-teal-50/85">
            Accuracy by topic, time spent, and the question types that needed the most care.
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Questions", value: summary.questionsAnswered },
              { label: "Accuracy", value: `${summary.accuracy}%` },
              { label: "Time", value: formatDuration(summary.timeSpentSeconds) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-teal-300/20 bg-teal-500/5 px-2 py-3 text-center"
                style={{ boxShadow: "inset 0 1px 0 rgba(94,234,212,0.12)" }}
              >
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="mt-0.5 text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-teal-200/70">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-teal-300/20 bg-teal-500/5 p-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-teal-200/75">
              Accuracy Per Topic
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {summary.topicSummaries.map((topic) => (
                <div
                  key={topic.label}
                  className="rounded-lg border border-teal-300/15 bg-black/10 px-3 py-3"
                >
                  <div className="text-sm font-bold text-white">{topic.label}</div>
                  <div className="mt-1 text-lg font-black text-teal-100">
                    {topic.correct}/{topic.total} · {topic.accuracy}%
                  </div>
                  <div className="text-xs text-teal-100/70">
                    {formatDuration(topic.timeSpentSeconds)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-500/10 p-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-emerald-200/80">
                Strengths
              </div>
              <div className="mt-2 space-y-2">
                {summary.strengths.length > 0 ? (
                  summary.strengths.map((item) => (
                    <div key={item.label} className="text-sm font-semibold text-emerald-50">
                      {item.label} · {item.accuracy}%
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-emerald-50">
                    No clear strength yet in this run.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-amber-200/80">
                Areas to Improve
              </div>
              <div className="mt-2 space-y-2">
                {summary.areasToImprove.length > 0 ? (
                  summary.areasToImprove.map((item) => (
                    <div key={item.label} className="text-sm font-semibold text-amber-50">
                      {item.label} · {item.accuracy}%
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-amber-50">
                    No major gaps showed up in this session.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-sky-300/20 bg-sky-500/10 p-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-sky-200/80">
              Question Types Struggled With
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.struggledQuestionTypes.length > 0 ? (
                summary.struggledQuestionTypes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-sky-300/25 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-50"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm font-semibold text-sky-50">
                  No repeated struggle pattern showed up.
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={onStartPostTest}
              className="w-full rounded-lg px-6 py-3 text-sm font-bold text-white transition active:scale-[0.99]"
              style={{
                background:
                  "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(204,251,241,0.3), 0 0 18px rgba(45,212,191,0.25)",
              }}
            >
              Start Post-Test
            </button>
            <button
              type="button"
              onClick={onPractiseWeakAreas}
              className="w-full rounded-lg border border-teal-300/30 bg-teal-500/10 px-6 py-3 text-sm font-bold text-teal-50 transition hover:bg-teal-500/15 active:scale-[0.99]"
            >
              Practise weak areas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
