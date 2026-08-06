import { Bot, Circle, Gem, Square, Star, Triangle } from "lucide-react";
import type { Year1PatternToken } from "@/data/activities/year1/practice-task";

const TOKEN_STYLE: Record<Year1PatternToken, string> = {
  "amber-star": "border-amber-500 bg-amber-100 text-amber-800",
  "cyan-gem": "border-cyan-500 bg-cyan-100 text-cyan-800",
  "rose-robot": "border-rose-500 bg-rose-100 text-rose-800",
  "blue-circle": "border-blue-500 bg-blue-100 text-blue-800",
  "green-square": "border-emerald-500 bg-emerald-100 text-emerald-800",
  "violet-triangle": "border-violet-500 bg-violet-100 text-violet-800",
};

const TOKEN_ICON = {
  "amber-star": Star,
  "cyan-gem": Gem,
  "rose-robot": Bot,
  "blue-circle": Circle,
  "green-square": Square,
  "violet-triangle": Triangle,
} as const;

export function RepeatingPatternToken({ token, size = "md" }: { token: Year1PatternToken; size?: "sm" | "md" }) {
  const Icon = TOKEN_ICON[token];
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg border-2 ${TOKEN_STYLE[token]} ${size === "sm" ? "h-11 w-11" : "h-14 w-14"}`} aria-label={token.replace("-", " ")}>
      <Icon className={size === "sm" ? "h-5 w-5" : "h-7 w-7"} aria-hidden />
    </span>
  );
}

export function RepeatingPatternStrip({ sequence, compact = false }: { sequence: readonly Year1PatternToken[]; compact?: boolean }) {
  return (
    <div className="flex min-h-16 flex-wrap items-center justify-center gap-3">
      {sequence.map((token, index) => <RepeatingPatternToken key={`${token}-${index}`} token={token} size={compact ? "sm" : "md"} />)}
    </div>
  );
}

