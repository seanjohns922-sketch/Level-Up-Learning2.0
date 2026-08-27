"use client";

import { Square, Volume2 } from "lucide-react";
import { prepareSpeechText, speak, stopSpeaking, useSpeakState } from "@/lib/speak";

export function joinSpeechParts(parts: Array<string | null | undefined | false>) {
  return parts.filter((part): part is string => typeof part === "string" && part.trim().length > 0).join(". ");
}

export function WorldVoiceButton({
  text,
  label = "Read aloud",
  className = "",
  compact = false,
}: {
  text: string;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const { currentText, isSpeaking } = useSpeakState();
  const normalized = prepareSpeechText(text);
  const active = isSpeaking && currentText === normalized;

  return (
    <button
      type="button"
      className={`worldVoiceButton ${compact ? "worldVoiceButtonCompact" : ""} ${active ? "worldVoiceButtonActive" : ""} ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        if (active) {
          stopSpeaking();
          return;
        }
        void speak(text, undefined, "manual", { rate: 0.9 });
      }}
      aria-label={active ? "Stop voice over" : label}
      title={active ? "Stop voice over" : label}
    >
      {active ? <Square size={compact ? 13 : 15} /> : <Volume2 size={compact ? 14 : 16} />}
      <style>{`
        .worldVoiceButton{display:inline-grid;place-items:center;width:34px;height:34px;min-height:0;border:1px solid rgba(255,235,195,.32);border-radius:999px;background:rgba(24,22,21,.84);color:#fff4dd;box-shadow:0 8px 22px rgba(0,0,0,.2);cursor:pointer;backdrop-filter:blur(9px);padding:0;line-height:1}
        .worldVoiceButton:hover,.worldVoiceButtonActive{border-color:var(--world-accent,#efbd61);color:#1d2422;background:var(--world-accent,#efbd61)}
        .worldVoiceButtonCompact{width:28px;height:28px}
      `}</style>
    </button>
  );
}
