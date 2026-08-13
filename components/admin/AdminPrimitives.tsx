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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: number | string;
  detail?: string;
  icon: LucideIcon;
  tone?: "emerald" | "blue" | "amber" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-950">{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function FutureMetric({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-slate-300 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Not active yet</p>
    </div>
  );
}
