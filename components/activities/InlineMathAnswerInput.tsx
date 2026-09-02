"use client";

export type InlineMathInputMode = "numeric" | "decimal";

export default function InlineMathAnswerInput({
  value,
  onChange,
  inputMode,
  tone = "light",
  ariaLabel = "Missing value",
}: {
  value: string;
  onChange: (value: string) => void;
  inputMode?: InlineMathInputMode;
  tone?: "light" | "dark";
  ariaLabel?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) =>
        onChange(inputMode ? event.target.value.replace(/[^\d.,-]/g, "") : event.target.value)
      }
      inputMode={inputMode}
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder="?"
      className={[
        "h-12 w-[88px] rounded-xl border-2 border-dashed px-2 text-center text-2xl font-black shadow-sm outline-none transition",
        tone === "dark"
          ? "border-violet-300 bg-slate-900 text-white placeholder:text-violet-300 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/20"
          : "border-violet-400 bg-white text-slate-900 placeholder:text-violet-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200",
      ].join(" ")}
    />
  );
}
