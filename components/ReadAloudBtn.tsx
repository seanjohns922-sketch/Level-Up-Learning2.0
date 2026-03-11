"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speak";

/**
 * Small 🔊 button that reads the given text aloud.
 * Drop this next to any label, heading, or paragraph.
 */
export default function ReadAloudBtn({
  text,
  size = "sm",
  className = "",
}: {
  text: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "md" ? "p-2" : "p-1.5";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      aria-label="Read aloud"
      className={`inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition ${px} ${className}`}
    >
      <Volume2 className={icon} />
    </button>
  );
}
