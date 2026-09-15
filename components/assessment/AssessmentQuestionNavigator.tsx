"use client";

import { canVisitAssessmentQuestion } from "@/lib/assessment-navigation";
import { getRealmTheme } from "@/lib/useRealmTheme";

export default function AssessmentQuestionNavigator({ answeredFlags, currentIndex, onJump, realmId, disabled = false, reviewMode = false }: {
  answeredFlags: boolean[];
  currentIndex: number;
  onJump: (index: number) => void;
  realmId?: string;
  disabled?: boolean;
  /** Only for protected author review; never enable on a student route. */
  reviewMode?: boolean;
}) {
  const theme = getRealmTheme(realmId);
  return <nav aria-label="Assessment questions" className="assessment-nav-strip mt-4">
    <p className="mb-2 text-sm font-semibold text-slate-300">{reviewMode ? "Choose any question to review." : "Go back to check an answer. Answer each question to unlock the next."}</p>
    <div className="assessment-nav-buttons flex flex-wrap gap-2">
      {answeredFlags.map((answered, index) => {
        const reachable = reviewMode || canVisitAssessmentQuestion(index, answeredFlags, currentIndex);
        const current = index === currentIndex;
        return <button key={index} type="button" disabled={disabled || !reachable}
          aria-current={current ? "step" : undefined}
          aria-label={`Question ${index + 1}${answered ? ", answered" : ""}${!reachable ? ", locked" : ""}`}
          onClick={() => { if (!disabled && reachable) onJump(index); }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm font-black transition hover:brightness-110 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-45"
          style={{background: reachable ? theme.chipBg : "rgba(148,163,184,0.10)", color: reachable ? theme.accentText : "#94a3b8", border: `${current ? 2 : 1}px ${!answered && !current && reachable ? "dashed" : "solid"} ${current ? theme.accentText : theme.chipBorder}`}}>
          {index + 1}
        </button>;
      })}
    </div>
  </nav>;
}
