"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { MeasurelandsScale } from "@/components/measurelands/MeasurelandsScale";

type MassScaleTask = Extract<PracticeTask, { kind: "massScale" }>;
type MassItem = NonNullable<MassScaleTask["object"]>;

function massLabel(item: Pick<MassItem, "mass" | "unit">) {
  return `${item.mass} ${item.unit}`;
}

function scaleConfig(unit: "g" | "kg", mass: number) {
  if (unit === "g") return { max: 1000, majorStep: 250 };
  return { max: mass > 10 ? 20 : 10, majorStep: mass > 10 ? 5 : 1 };
}

function Shell({
  badge,
  prompt,
  speakText,
  children,
}: {
  badge: string;
  prompt: string;
  speakText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="measurelands-shell space-y-4">
      <div
        className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{
          borderColor: "rgba(214,184,108,0.38)",
          background:
            "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
        }}
      >
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}
        >
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">
            {prompt}
          </div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function ObjectBadge({ item, showMass = false }: { item: MassItem; showMass?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[26px] border border-[rgba(214,184,108,0.48)] bg-white px-4 py-3 shadow-sm">
      <div className="grid h-24 w-24 place-items-center rounded-[24px] border-2 border-[rgba(214,184,108,0.42)] bg-[#fff7df] text-5xl shadow-sm">
        {item.emoji}
      </div>
      <div className="mt-2 text-center text-lg font-black text-[#2c1c07]">{item.label}</div>
      {showMass ? <div className="text-sm font-black uppercase tracking-[0.12em] text-[#7c4a12]">{massLabel(item)}</div> : null}
    </div>
  );
}

function ScaleView({ item, size = 230 }: { item: MassItem; size?: number }) {
  const config = scaleConfig(item.unit, item.mass);
  return (
    <MeasurelandsScale
      value={item.mass}
      unit={item.unit}
      max={config.max}
      majorStep={config.majorStep}
      display={item.unit === "g" ? "dial" : "digital"}
      object={{ label: item.label, emoji: item.emoji }}
      size={size}
    />
  );
}

function ChoiceGrid({
  options,
  correct,
  onCorrect,
  onWrong,
}: {
  options: string[];
  correct?: string;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const isWrong = wrong === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (option === correct) onCorrect();
              else {
                setWrong(option);
                onWrong();
                window.setTimeout(() => setWrong(null), 650);
              }
            }}
            className={`relative min-h-[78px] rounded-[24px] border-2 px-4 py-3 text-xl font-black text-[#2c1c07] shadow-sm transition ${
              isWrong ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-white hover:-translate-y-0.5"
            }`}
          >
            <span>{option}</span>
            <OptionReadAloudButton text={option} className="absolute right-2 top-2" />
          </button>
        );
      })}
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: MassScaleTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Mass Works"} prompt={task.prompt} speakText={task.speakText}>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "kitchen scale", emoji: "🍎", mass: 250, unit: "g" as const },
          { label: "bag scale", emoji: "🎒", mass: 5, unit: "kg" as const },
          { label: "luggage scale", emoji: "🧳", mass: 12, unit: "kg" as const },
        ].map((item) => (
          <div key={item.label} className="rounded-[28px] border border-[rgba(214,184,108,0.45)] bg-white p-4 shadow-sm">
            <ScaleView item={item} size={210} />
            <div className="mt-1 text-center text-lg font-black text-[#2c1c07]">{item.label}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onCorrect}
        className="w-full rounded-[24px] border-2 border-[#b4781e] bg-[#fff7df] px-5 py-4 text-xl font-black uppercase tracking-[0.12em] text-[#7c4a12] shadow-sm transition hover:-translate-y-0.5"
      >
        Start
      </button>
    </Shell>
  );
}

function ReadScene({ task, onCorrect, onWrong }: { task: MassScaleTask; onCorrect: () => void; onWrong: () => void }) {
  const item = task.object;
  if (!item) return null;
  return (
    <Shell badge={task.badgeLabel ?? "Read the Scale"} prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[28px] border border-[rgba(214,184,108,0.45)] bg-white p-4 shadow-sm">
        <ScaleView item={item} />
      </div>
      <ChoiceGrid options={task.options ?? []} correct={task.correctOption} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function MatchScene({ task, onCorrect, onWrong }: { task: MassScaleTask; onCorrect: () => void; onWrong: () => void }) {
  const item = task.object;
  const scales = task.scales ?? [];
  const [wrong, setWrong] = useState<string | null>(null);
  if (!item) return null;
  return (
    <Shell badge={task.badgeLabel ?? "Match the Scale"} prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[28px] border border-[rgba(214,184,108,0.45)] bg-white p-4 text-center shadow-sm">
        <ObjectBadge item={item} showMass />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {scales.map((scale) => {
          const candidate = { label: item.label, emoji: item.emoji, mass: scale.mass, unit: scale.unit };
          const label = massLabel(candidate);
          return (
            <button
              key={scale.id}
              type="button"
              onClick={() => {
                if (scale.id === task.correctOptionId) onCorrect();
                else {
                  setWrong(scale.id);
                  onWrong();
                  window.setTimeout(() => setWrong(null), 650);
                }
              }}
              className={`relative rounded-[24px] border-2 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 ${
                wrong === scale.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)]"
              }`}
            >
              <ScaleView item={candidate} size={170} />
              <div className="text-center text-lg font-black text-[#2c1c07]">{label}</div>
              <OptionReadAloudButton text={label} className="absolute right-2 top-2" />
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function MultiObjectScene({ task, onCorrect, onWrong }: { task: MassScaleTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "order") return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return (
    <Shell badge={task.badgeLabel ?? "Compare Mass"} prompt={task.prompt} speakText={task.speakText}>
      {task.items?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {task.items.map((item) => (
            <ObjectBadge key={item.label} item={item} showMass />
          ))}
        </div>
      ) : task.object ? (
        <ObjectBadge item={task.object} />
      ) : null}
      {task.statement ? (
        <div className="rounded-[24px] border-2 border-[rgba(251,146,60,0.34)] bg-[#fff7ed] px-4 py-4 text-center text-xl font-black text-[#7c2d12] shadow-sm">
          {task.statement}
        </div>
      ) : null}
      <ChoiceGrid options={task.options ?? []} correct={task.correctOption} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function OrderScene({ task, onCorrect, onWrong }: { task: MassScaleTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const ordered = task.orderedLabels ?? [];
  const [position, setPosition] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const placed = ordered.slice(0, position);
  const remaining = items.filter((item) => !placed.includes(item.label));

  return (
    <Shell badge={task.badgeLabel ?? "Order the Masses"} prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-white p-3">
        <div className="mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-[#a98b52]">Lightest to Heaviest</div>
        <div className="flex min-h-[58px] flex-wrap justify-center gap-2">
          {placed.map((label) => (
            <span key={label} className="rounded-full border border-[rgba(15,118,110,0.32)] bg-[rgba(15,118,110,0.1)] px-4 py-2 text-sm font-black text-[#0f766e]">
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {remaining.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.label === ordered[position]) {
                const next = position + 1;
                setPosition(next);
                if (next === ordered.length) onCorrect();
                return;
              }
              setWrong(item.label);
              onWrong();
              window.setTimeout(() => setWrong(null), 650);
            }}
            className={`rounded-[26px] border-2 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 ${
              wrong === item.label ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)]"
            }`}
          >
            <ObjectBadge item={item} showMass />
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsMassScaleCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MassScaleTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "read") return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "match") return <MatchScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <MultiObjectScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
