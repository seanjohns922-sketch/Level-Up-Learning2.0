"use client";

import { useEffect, useRef } from "react";
import type { CoachReview } from "@/lib/lesson-coach";
import { speak, useAutoReadSetting, useSpeechInteractionReady } from "@/lib/speak";
import { getRealmTheme } from "@/lib/useRealmTheme";

// Post-lesson "coach" screen — performance guidance only (the Reflection screen
// owns celebration + confidence). Short, positive, actionable. Ground-friendly:
// big icons, minimal text, auto read-aloud.

export default function LessonCoachReview({
  review,
  levelNumber,
  realmId,
  onContinue,
}: {
  review: CoachReview;
  levelNumber?: number;
  realmId?: string;
  onContinue: () => void;
}) {
  const junior = (levelNumber ?? 1) <= 2;
  const theme = getRealmTheme(realmId);
  const isMeasurement = theme.isMeasurement;
  const { autoReadEnabled } = useAutoReadSetting();
  const speechReady = useSpeechInteractionReady();
  const readOnceRef = useRef(false);

  // Ground levels: read the encouragement + tip aloud once (best-effort).
  useEffect(() => {
    if (!junior || !autoReadEnabled || !speechReady || readOnceRef.current) return;
    readOnceRef.current = true;
    const lines = [
      "Great work!",
      review.didWell[0] ?? "",
      review.keepPractising[0] ?? "",
      review.coachTip ? `Coach tip: ${review.coachTip}` : "",
    ].filter(Boolean);
    void speak(lines.join(" "), undefined, "auto");
  }, [junior, autoReadEnabled, speechReady, review]);

  const accent = theme.accentText;

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-7 text-center"
      style={{
        background: theme.cardSurface,
        boxShadow: theme.cardInsetShadow,
      }}
    >
      <div className="relative">
        <div className="text-5xl" aria-hidden>🏆</div>
        <div className="mt-1 text-2xl font-black text-white">Great Work!</div>
        <div className="mt-0.5 text-[11px] font-mono font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
          Your Coach
        </div>

        {/* What you practised */}
        {review.practised.length > 0 ? (
          <Section title="What you practised">
            {review.practised.map((s) => (
              <Line key={s} icon="✅">{s}</Line>
            ))}
          </Section>
        ) : null}

        {/* What you did well */}
        {review.didWell.length > 0 ? (
          <Section title="What you did well">
            {review.didWell.map((s) => (
              <Line key={s} icon="🌟">{s}</Line>
            ))}
          </Section>
        ) : null}

        {/* Keep practising — only when meaningful */}
        {review.keepPractising.length > 0 ? (
          <Section title="Keep practising">
            {review.keepPractising.map((s) => (
              <Line key={s} icon="🎯">{s}</Line>
            ))}
          </Section>
        ) : null}

        {/* Coach tip */}
        {review.coachTip ? (
          <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left">
            <div className="text-[11px] font-mono font-black uppercase tracking-[0.18em] text-white/55">💡 Coach Tip</div>
            <div className="mt-1 text-base font-bold text-white">{review.coachTip}</div>
          </div>
        ) : null}

        {/* Next up */}
        {review.nextUpLabel ? (
          <div
            className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold text-white"
            style={{ borderColor: `${accent}55`, background: `${accent}1a` }}
          >
            ⏭️ Next up: <span className="font-black">{review.nextUpLabel}</span>
          </div>
        ) : null}

        <button
          onClick={onContinue}
          className="mt-5 w-full rounded-2xl px-6 py-4 text-base font-extrabold text-white transition active:scale-[0.98]"
          style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-[11px] font-mono font-black uppercase tracking-[0.18em] text-white/55">{title}</div>
      <div className="mt-2 inline-flex flex-col items-start gap-1.5 text-left">{children}</div>
    </div>
  );
}

function Line({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="text-base font-semibold text-white">
      <span className="mr-1">{icon}</span>
      {children}
    </div>
  );
}
