"use client";

import { useEffect, useRef } from "react";
import { Check, ChevronRight, Volume2 } from "lucide-react";
import type { CoachReview } from "@/lib/lesson-coach";
import { speak, useAutoReadSetting, useSpeakState, useSpeechInteractionReady } from "@/lib/speak";
import { getRealmTheme } from "@/lib/useRealmTheme";

// Post-lesson "coach" screen — performance guidance only (the Reflection screen
// owns celebration + confidence). Clean, premium Level Up styling (no emojis),
// with a Read Aloud button for non-readers, Ground Level → Level 6.

function buildSpokenSummary(review: CoachReview): string {
  const parts: string[] = ["Great work!"];
  if (review.practised.length) parts.push(`You practised ${review.practised.join(", ")}.`);
  if (review.didWell.length) parts.push(review.didWell.join(" "));
  if (review.keepPractising.length) parts.push(`Keep practising: ${review.keepPractising.join(" ")}`);
  if (review.coachTip) parts.push(`Coach tip: ${review.coachTip}`);
  if (review.nextUpLabel) parts.push(`Next up: ${review.nextUpLabel}.`);
  return parts.join(" ");
}

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
  const accent = theme.accentText;
  const { autoReadEnabled } = useAutoReadSetting();
  const speechReady = useSpeechInteractionReady();
  const speakState = useSpeakState();
  const spoken = buildSpokenSummary(review);
  const autoReadOnceRef = useRef(false);

  useEffect(() => {
    if (!junior || !autoReadEnabled || !speechReady || autoReadOnceRef.current) return;
    autoReadOnceRef.current = true;
    void speak(spoken, undefined, "auto");
  }, [junior, autoReadEnabled, speechReady, spoken]);

  const isReading = speakState.isSpeaking && speakState.currentText === spoken;

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-7"
      style={{
        background: theme.cardSurface,
        boxShadow: theme.cardInsetShadow,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <div className="text-[11px] font-mono font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
            Coach Review
          </div>
          <div className="mt-1 text-2xl font-black text-white">Great work</div>
        </div>
        <button
          type="button"
          onClick={() => void speak(spoken, undefined, "manual")}
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition",
            isReading
              ? "text-white"
              : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10",
          ].join(" ")}
          style={
            isReading
              ? {
                  borderColor: theme.borderRing,
                  background: theme.surfaceTint,
                }
              : undefined
          }
          aria-label="Read the coach review aloud"
        >
          <Volume2 className="h-4 w-4" />
          Read Aloud
        </button>
      </div>

      {review.practised.length > 0 ? (
        <Section title="What you practised" titleClassName="text-white/55">
          <div className="flex flex-wrap gap-2">
            {review.practised.map((s) => (
              <span
                key={s}
                className="rounded-full border px-3 py-1 text-sm font-semibold text-white"
                style={{ borderColor: `${accent}40`, background: `${accent}14` }}
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {review.didWell.length > 0 ? (
        <Section title="What you did well" titleClassName="text-white/55">
          <div className="grid gap-1.5">
            {review.didWell.map((s) => (
              <div key={s} className="flex items-start gap-2 text-left text-base font-semibold text-white">
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {review.keepPractising.length > 0 ? (
        <Section title="Keep practising" titleClassName="text-white/55">
          <div className="grid gap-1.5">
            {review.keepPractising.map((s) => (
              <div
                key={s}
                className="rounded-lg border-l-2 bg-white/5 py-1.5 pl-3 pr-2 text-left text-base font-semibold text-white/90"
                style={{ borderColor: accent }}
              >
                {s}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {review.coachTip ? (
        <div className="mt-5 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-left">
          <div className="text-[11px] font-mono font-black uppercase tracking-[0.18em] text-white/55">Coach Tip</div>
          <div className="mt-1 text-base font-bold text-white">{review.coachTip}</div>
        </div>
      ) : null}

      {review.nextUpLabel ? (
        <div className="mt-5 flex items-center gap-2 text-sm font-bold text-white/85">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-white/45">Next up</span>
          <ChevronRight className="h-4 w-4" style={{ color: accent }} />
          <span className="font-black text-white">{review.nextUpLabel}</span>
        </div>
      ) : null}

      <button
        onClick={onContinue}
        className="mt-5 w-full rounded-2xl px-6 py-4 text-base font-extrabold text-white transition active:scale-[0.98]"
        style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
      >
        Continue
      </button>
    </div>
  );
}

function Section({
  title,
  children,
  titleClassName,
}: {
  title: string;
  children: React.ReactNode;
  titleClassName: string;
}) {
  return (
    <div className="mt-5">
      <div className={`text-[11px] font-mono font-black uppercase tracking-[0.18em] ${titleClassName}`}>{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
