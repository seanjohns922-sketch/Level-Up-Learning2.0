"use client";

import type { IntegerContextVisualData } from "@/data/activities/year2/lessonEngine";
import IntegerNumberLineVisual from "@/components/activities/IntegerNumberLineVisual";

function formatSignedValue(
  value: number,
  {
    unitPrefix = "",
    unitSuffix = "",
  }: {
    unitPrefix?: string;
    unitSuffix?: string;
  }
) {
  const absolute = Math.abs(value);
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${unitPrefix}${absolute}${unitSuffix}`;
}

function formatCurrentValue(
  value: number,
  {
    unitPrefix = "",
    unitSuffix = "",
  }: {
    unitPrefix?: string;
    unitSuffix?: string;
  }
) {
  if (value < 0) return `-${unitPrefix}${Math.abs(value)}${unitSuffix}`;
  return `${unitPrefix}${value}${unitSuffix}`;
}

function getContextTheme(context: IntegerContextVisualData["context"]) {
  switch (context) {
    case "temperature":
      return {
        badge: "Temperature",
        shell: "border-cyan-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(236,254,255,0.92)_55%,_rgba(224,242,254,0.95))]",
        accent: "from-cyan-500 to-sky-500",
        panel: "bg-cyan-50 text-cyan-900",
        note: "Rise and drop",
      };
    case "elevator":
      return {
        badge: "Elevator",
        shell: "border-indigo-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(238,242,255,0.92)_55%,_rgba(224,231,255,0.95))]",
        accent: "from-indigo-500 to-sky-500",
        panel: "bg-indigo-50 text-indigo-950",
        note: "Up and down floors",
      };
    case "balance":
      return {
        badge: "Balance",
        shell: "border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(236,253,245,0.92)_55%,_rgba(209,250,229,0.94))]",
        accent: "from-emerald-500 to-teal-500",
        panel: "bg-emerald-50 text-emerald-950",
        note: "Deposit and spend",
      };
    case "score":
      return {
        badge: "Score",
        shell: "border-violet-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(245,243,255,0.92)_55%,_rgba(237,233,254,0.94))]",
        accent: "from-violet-500 to-fuchsia-500",
        panel: "bg-violet-50 text-violet-950",
        note: "Gain and loss",
      };
    case "elevation":
      return {
        badge: "Elevation",
        shell: "border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(239,246,255,0.92)_55%,_rgba(224,242,254,0.94))]",
        accent: "from-sky-500 to-cyan-500",
        panel: "bg-sky-50 text-sky-950",
        note: "Above and below",
      };
  }
}

function ContextScene({
  visual,
  accent,
}: {
  visual: IntegerContextVisualData;
  accent: string;
}) {
  const current = formatCurrentValue(visual.currentValue, visual);
  const change = formatSignedValue(visual.change, visual);
  const secondaryChange =
    typeof visual.secondaryChange === "number"
      ? formatSignedValue(visual.secondaryChange, visual)
      : null;
  const endValue =
    typeof visual.endValue === "number"
      ? formatCurrentValue(visual.endValue, visual)
      : null;

  if (visual.context === "temperature") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sky-100 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="relative h-24 w-8 rounded-full bg-slate-200">
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t ${accent}`}
              style={{ height: `${Math.min(88, Math.max(18, (Math.abs(visual.currentValue) / 12) * 88 + 18))}%` }}
            />
            <div className="absolute -bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border-4 border-white bg-cyan-500 shadow-md" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Now</div>
            <div className="mt-1 text-3xl font-black text-slate-950">{current}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!visual.hidePrimaryChange ? (
                <div className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-sm font-black text-white">
                  {change}
                </div>
              ) : null}
              {secondaryChange ? (
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-black text-slate-950 shadow-sm">
                  {secondaryChange}
                </div>
              ) : null}
            </div>
            {endValue ? (
              <div className="mt-3 text-sm font-black text-cyan-900">Ends at {endValue}</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (visual.context === "elevator") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-sm">
        <div className="grid grid-cols-[84px_1fr] gap-4">
          <div className="relative rounded-[20px] bg-slate-900 p-3 text-white">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Lift</div>
            <div className="mt-3 rounded-xl bg-white/10 px-3 py-4 text-center text-3xl font-black">{current}</div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl bg-indigo-50 px-4 py-3">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">Current floor</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{current}</div>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                {visual.hidePrimaryChange ? visual.endLabel ?? "End" : "Movement"}
              </div>
              <div className="mt-1 text-2xl font-black text-slate-950">
                {visual.hidePrimaryChange && endValue ? endValue : change}
              </div>
            </div>
            {secondaryChange ? (
              <div className="rounded-2xl bg-sky-50 px-4 py-3 md:col-span-2">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Next move</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{secondaryChange}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (visual.context === "balance") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-sm">
        <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${accent} opacity-15`} />
        <div className="relative rounded-[22px] bg-slate-950 p-5 text-white">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Account</div>
          <div className="mt-3 text-3xl font-black">{current}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!visual.hidePrimaryChange ? (
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-black">
                Change {change}
              </div>
            ) : null}
            {secondaryChange ? (
              <div className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-black text-emerald-100">
                Then {secondaryChange}
              </div>
            ) : null}
          </div>
          {endValue ? <div className="mt-3 text-sm font-black text-emerald-100">Ends at {endValue}</div> : null}
        </div>
      </div>
    );
  }

  if (visual.context === "score") {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-slate-950 px-4 py-5 text-center text-white">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Score now</div>
            <div className="mt-2 text-3xl font-black">{current}</div>
          </div>
          <div className="rounded-[22px] bg-violet-50 px-4 py-5 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">Change</div>
            <div className="mt-2 text-3xl font-black text-slate-950">{change}</div>
          </div>
          {secondaryChange ? (
            <div className="rounded-[22px] bg-white px-4 py-5 text-center shadow-sm col-span-2">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Next change</div>
              <div className="mt-2 text-3xl font-black text-slate-950">{secondaryChange}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-sm">
      <div className="grid gap-3">
        <div className="relative h-20 overflow-hidden rounded-[22px] bg-sky-50">
          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-sky-300" />
          <div
            className={`absolute left-6 h-9 w-9 rounded-full bg-gradient-to-br ${accent} shadow-lg`}
            style={{
              top: visual.currentValue >= 0 ? "18px" : "44px",
            }}
          />
          <div className="absolute left-20 top-3 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
            Sea level
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Position</div>
            <div className="mt-1 text-2xl font-black text-slate-950">{current}</div>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
              {visual.hidePrimaryChange ? visual.endLabel ?? "End" : "Change"}
            </div>
            <div className="mt-1 text-2xl font-black text-slate-950">
              {visual.hidePrimaryChange && endValue ? endValue : change}
            </div>
          </div>
          {secondaryChange ? (
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm col-span-2">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Next move</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{secondaryChange}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function IntegerContextVisual({
  visual,
}: {
  visual: IntegerContextVisualData;
}) {
  const theme = getContextTheme(visual.context);

  return (
    <div className={`mt-5 rounded-[28px] border p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${theme.shell}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            {theme.badge}
          </div>
          <div className="mt-1 text-2xl font-black text-slate-950">{visual.title}</div>
        </div>
        <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm ${theme.accent}`}>
          {theme.note}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <ContextScene visual={visual} accent={theme.accent} />
        <div className={`rounded-[24px] border border-white/70 p-4 ${theme.panel}`}>
          <div
            className={[
              "grid gap-3",
              visual.endValue !== undefined || visual.secondaryChange !== undefined
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2",
            ].join(" ")}
          >
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                {visual.currentLabel ?? "Start"}
              </div>
              <div className="mt-1 text-2xl font-black text-slate-950">
                {formatCurrentValue(visual.currentValue, visual)}
              </div>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                {visual.hidePrimaryChange ? visual.endLabel ?? "End" : visual.changeLabel ?? "Change"}
              </div>
              <div className="mt-1 text-2xl font-black text-slate-950">
                {visual.hidePrimaryChange && visual.endValue !== undefined
                  ? formatCurrentValue(visual.endValue, visual)
                  : formatSignedValue(visual.change, visual)}
              </div>
            </div>
            {visual.endValue !== undefined && !visual.hidePrimaryChange ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {visual.endLabel ?? "End"}
                </div>
                <div className="mt-1 text-2xl font-black text-slate-950">
                  {formatCurrentValue(visual.endValue, visual)}
                </div>
              </div>
            ) : visual.secondaryChange !== undefined ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {visual.secondaryChangeLabel ?? "Step 2"}
                </div>
                <div className="mt-1 text-2xl font-black text-slate-950">
                  {formatSignedValue(visual.secondaryChange, visual)}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-4 text-sm font-semibold text-slate-600">
            {visual.noteText ?? "Use the context card, then track the movement on the number line."}
          </div>
        </div>
      </div>

      <IntegerNumberLineVisual visual={visual.numberLine} title="Integer movement" />
    </div>
  );
}
