import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AdminPageHeading({
  eyebrow,
  title,
  detail,
  action,
  media,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
  media?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {media}
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0E7C86]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#121314] md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5A5E63]">{detail}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

/** One figure on a white card. "warning" tones the icon amber; everything else uses the owner accent. */
/** A plain number card: label, value, detail. Icons are accepted for older
 * callers but no longer drawn, so the numbers lead. */
export function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number | string;
  detail?: string;
  icon?: LucideIcon;
  tone?: "emerald" | "blue" | "amber" | "violet" | "warning";
}) {
  const warning = tone === "warning";
  return (
    <div className={`rounded-2xl border bg-white p-5 ${warning ? "border-[#F0C24B]" : "border-[#E3E5E0]"}`}>
      <p className="text-xs font-bold text-[#5A5E63]">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums tracking-tight text-[#121314] [font-family:var(--font-display)]">{value}</p>
      {detail ? <p className={`mt-1 text-xs ${warning ? "font-semibold text-[#8A5A00]" : "text-[#8F948C]"}`}>{detail}</p> : null}
    </div>
  );
}

export function FutureMetric({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#C9CCC6] bg-[#FAFBF8] p-5">
      <p className="text-sm font-bold text-[#3F4246]">{label}</p>
      <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#8A8E89]">Not active yet</p>
    </div>
  );
}
