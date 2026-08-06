"use client";

import { Bot, Gem, Star } from "lucide-react";

type Visual = Record<string, unknown>;

export function GroundAssessmentToken({ token, muted = false }: { token: string; muted?: boolean }) {
  const Icon = token === "star" ? Star : token === "robot" ? Bot : Gem;
  return (
    <span className={`grid h-11 w-11 place-items-center rounded-lg border-2 ${muted ? "border-slate-300 bg-slate-100 text-slate-400" : token === "star" ? "border-amber-500 bg-amber-100 text-amber-800" : token === "robot" ? "border-rose-500 bg-rose-100 text-rose-800" : "border-cyan-500 bg-cyan-100 text-cyan-800"}`}>
      <Icon className="h-6 w-6" />
    </span>
  );
}

function TokenCollection({ count, token = "crystal", mutedFrom, layout }: { count: number; token?: string; mutedFrom?: number; layout?: string }) {
  const layoutClass = layout === "line"
    ? "grid grid-cols-5"
    : layout === "dice"
      ? "grid grid-cols-3"
      : layout === "spread"
        ? "grid grid-cols-3 gap-5"
        : "flex flex-wrap";
  return (
    <div className={`${layoutClass} min-h-16 items-center justify-center gap-2`}>
      {Array.from({ length: count }, (_, index) => <GroundAssessmentToken key={index} token={token} muted={mutedFrom !== undefined && index >= mutedFrom} />)}
    </div>
  );
}

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border-2 border-cyan-800/25 bg-[#f8fbfc] p-5 shadow-sm">{children}</div>;
}

export default function NumberNexusGroundAssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (type === "number_ground_collection") {
    return <Surface><TokenCollection count={Number(visual.count ?? 0)} token={String(visual.token ?? "crystal")} layout={typeof visual.arrangement === "string" ? visual.arrangement : undefined} /></Surface>;
  }

  if (type === "number_ground_compare") {
    const groups = Array.isArray(visual.groups) ? visual.groups as Array<{ id: string; count: number; token?: string }> : [];
    return (
      <div className="grid grid-cols-2 gap-4">
        {groups.map((group) => (
          <Surface key={group.id}>
            <div className="mb-3 text-center text-2xl font-black text-slate-800">{group.id}</div>
            <TokenCollection count={group.count} token={group.token} layout={(group as { layout?: string }).layout} />
          </Surface>
        ))}
      </div>
    );
  }

  if (type === "number_ground_path") {
    const values = Array.isArray(visual.values) ? visual.values : [];
    return (
      <Surface>
        <div className="flex flex-wrap justify-center gap-3">
          {values.map((value, index) => (
            <span key={index} className="grid h-16 min-w-16 place-items-center rounded-lg border-2 border-cyan-700 bg-white px-3 text-3xl font-black text-slate-900">
              {value === null ? "?" : String(value)}
            </span>
          ))}
        </div>
      </Surface>
    );
  }

  if (type === "number_ground_part_whole") {
    const whole = visual.whole === null ? null : Number(visual.whole ?? 0);
    const parts = Array.isArray(visual.parts) ? visual.parts : [];
    return (
      <Surface>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
          {parts.map((part, index) => (
            <div key={index} className="grid min-h-24 place-items-center rounded-lg border-2 border-cyan-600 bg-white text-4xl font-black text-slate-900">
              {part === null ? "?" : String(part)}
            </div>
          ))}
          <div className="col-span-2 mx-auto grid h-24 w-40 place-items-center rounded-lg border-2 border-emerald-700 bg-emerald-50 text-4xl font-black text-slate-900">
            {whole === null ? "?" : whole}
          </div>
        </div>
      </Surface>
    );
  }

  if (type === "number_ground_change") {
    const start = Number(visual.start ?? 0);
    const change = Number(visual.change ?? 0);
    const action = String(visual.action ?? "add");
    const token = String(visual.token ?? "crystal");
    return (
      <Surface>
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <TokenCollection count={start} token={token} />
          <span className="text-center text-4xl font-black text-cyan-800">{action === "add" ? "+" : "-"}</span>
          <TokenCollection count={change} token={token} mutedFrom={action === "remove" ? 0 : undefined} />
        </div>
      </Surface>
    );
  }

  if (type === "number_ground_groups") {
    const total = Number(visual.total ?? 0);
    const bins = Number(visual.bins ?? 0);
    const distribution = Array.isArray(visual.distribution) ? visual.distribution.map(Number) : [];
    return (
      <div className="space-y-4">
        {distribution.length === 0 ? <Surface><TokenCollection count={total} /></Surface> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: bins }, (_, index) => (
            <Surface key={index}>
              <TokenCollection count={distribution[index] ?? 0} />
            </Surface>
          ))}
        </div>
      </div>
    );
  }

  if (type === "number_ground_pattern") {
    const sequence = Array.isArray(visual.sequence) ? visual.sequence.map(String) : [];
    return (
      <Surface>
        <div className="flex min-h-16 flex-wrap items-center justify-center gap-3">
          {sequence.map((token, index) => token === "?"
            ? <span key={index} className="grid h-11 w-11 place-items-center rounded-lg border-2 border-dashed border-slate-400 text-2xl font-black text-slate-700">?</span>
            : <GroundAssessmentToken key={index} token={token} />)}
        </div>
      </Surface>
    );
  }

  return null;
}
