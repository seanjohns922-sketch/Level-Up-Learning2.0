"use client";

import { Square, Volume2 } from "lucide-react";
import { prepareSpeechText, speak, stopSpeaking, useSpeakState } from "@/lib/speak";

export default function ReadAloudBtn({
  text,
  speechKey,
  size = "sm",
  className = "",
}: {
  text: string;
  speechKey?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "md" ? "p-2" : "p-1.5";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const { currentText, isSpeaking } = useSpeakState();
  const normalizedText = prepareSpeechText(text);
  const isCurrentSpeech = isSpeaking && currentText === normalizedText;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (isCurrentSpeech) {
          stopSpeaking();
          return;
        }
        void speak(text, speechKey);
      }}
      aria-label={isCurrentSpeech ? "Stop read aloud" : "Read aloud"}
      title={isCurrentSpeech ? "Stop read aloud" : "Read aloud"}
      className={`inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition ${px} ${className}`}
    >
      {isCurrentSpeech ? <Square className={icon} /> : <Volume2 className={icon} />}
    </button>
  );
}
