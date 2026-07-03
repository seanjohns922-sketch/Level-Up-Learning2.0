"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MassUnitTask = Extract<PracticeTask, { kind: "massUnit" }>;
type Unit = "g" | "kg";

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
          background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
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

function UnitPill({ unit }: { unit: Unit }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-black uppercase tracking-[0.12em]"
      style={{
        color: unit === "kg" ? "#7c2d12" : "#5b21b6",
        background: unit === "kg" ? "rgba(251,146,60,0.16)" : "rgba(124,58,237,0.12)",
        border: unit === "kg" ? "1px solid rgba(251,146,60,0.38)" : "1px solid rgba(167,139,250,0.4)",
      }}
    >
      {unit === "kg" ? "Kilograms (kg)" : "Grams (g)"}
    </span>
  );
}

function ObjectTile({
  imageSrc,
  label,
  unit,
  sensibleMass,
  compact = false,
}: {
  imageSrc?: string;
  label: string;
  unit?: Unit;
  sensibleMass?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-[rgba(214,184,108,0.48)] bg-white px-4 py-4 shadow-sm">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={label}
          className="object-contain"
          style={{ width: compact ? 92 : 132, height: compact ? 92 : 132 }}
        />
      ) : (
        <div className="grid h-24 w-24 place-items-center rounded-[24px] bg-[rgba(214,184,108,0.16)] text-4xl">⚖️</div>
      )}
      <div className="mt-2 text-center text-lg font-black text-[#2c1c07]">{label}</div>
      {sensibleMass ? <div className="text-sm font-black uppercase tracking-[0.12em] text-[#7c4a12]">{sensibleMass}</div> : null}
      {unit ? <div className="mt-2"><UnitPill unit={unit} /></div> : null}
    </div>
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            className={`relative min-h-[86px] rounded-[24px] border-2 px-4 py-3 text-xl font-black text-[#2c1c07] shadow-sm transition ${
              isWrong ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-white hover:-translate-y-0.5"
            }`}
          >
            <span>{option}</span>
            <OptionReadAloudButton text={option} className="absolute right-3 top-3" />
          </button>
        );
      })}
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: MassUnitTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Mass Works"} prompt={task.prompt} speakText={task.speakText}>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-[rgba(214,184,108,0.45)] bg-white p-5 shadow-sm">
          <div className="text-center text-lg font-black text-[#2c1c07]">1 kilogram</div>
          <div className="mx-auto my-3 grid h-28 w-28 place-items-center rounded-[28px] border-2 border-[#8a5a16] bg-gradient-to-br from-[#f3dd9b] to-[#9c7a35] text-3xl font-black text-[#2c1c07] shadow-lg">
            1 kg
          </div>
          <div className="text-center text-xl font-black text-[#5b21b6]">= 1000 g</div>
          <p className="mt-2 text-center text-sm font-bold text-[#6b5a3f]">Just a benchmark today. No converting yet.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ObjectTile imageSrc="/images/measurelands/week2-3d/feather-v2.png" label="Feather" unit="g" compact />
          <ObjectTile imageSrc="/images/measurelands/week2-3d/apple.png" label="Apple" unit="g" compact />
          <ObjectTile imageSrc="/images/measurelands/week2-3d/backpack.png" label="Backpack" unit="kg" compact />
          <ObjectTile imageSrc="/images/measurelands/week2-3d/chair.png" label="Chair" unit="kg" compact />
        </div>
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

function ChooseUnitScene({ task, onCorrect, onWrong }: { task: MassUnitTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Grams or Kilograms?"} prompt={task.prompt} speakText={task.speakText}>
      {task.object ? (
        <ObjectTile
          imageSrc={task.object.imageSrc}
          label={task.object.label}
          sensibleMass={task.object.sensibleMass}
        />
      ) : null}
      <ChoiceGrid options={task.options ?? []} correct={task.correctOption} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function SortScene({ task, onCorrect, onWrong }: { task: MassUnitTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, Unit>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const unplaced = items.filter((item) => !(item.label in placed));

  const place = (unit: Unit) => {
    if (!selected) return;
    const item = items.find((candidate) => candidate.label === selected);
    if (!item) return;
    if (item.unit === unit) {
      const next = { ...placed, [selected]: unit };
      setPlaced(next);
      setSelected(null);
      setWrong(null);
      if (Object.keys(next).length === items.length) onCorrect();
      return;
    }
    setWrong(selected);
    setSelected(null);
    onWrong();
    window.setTimeout(() => setWrong(null), 650);
  };

  const Bin = ({ unit }: { unit: Unit }) => {
    const binItems = items.filter((item) => placed[item.label] === unit);
    return (
      <button
        type="button"
        onClick={() => place(unit)}
        className={`min-h-[150px] rounded-[26px] border-2 p-3 text-left transition ${
          selected ? "border-[#b4781e] bg-[rgba(214,184,108,0.14)]" : "border-[rgba(214,184,108,0.55)] bg-white"
        }`}
      >
        <UnitPill unit={unit} />
        <div className="mt-3 flex flex-wrap gap-2">
          {binItems.map((item) => (
            <span key={item.label} className="rounded-full border border-[rgba(15,118,110,0.32)] bg-[rgba(15,118,110,0.1)] px-3 py-1 text-sm font-black text-[#0f766e]">
              {item.label}
            </span>
          ))}
        </div>
      </button>
    );
  };

  return (
    <Shell badge={task.badgeLabel ?? "Sort the Objects"} prompt={task.prompt} speakText={task.speakText}>
      <div className="grid grid-cols-2 gap-3">
        <Bin unit="g" />
        <Bin unit="kg" />
      </div>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-3">
        <p className="mb-2 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">
          {unplaced.length ? "Tap an object, then tap its unit" : "All sorted!"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {unplaced.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelected((current) => (current === item.label ? null : item.label))}
              className={`flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-black text-[#2c1c07] transition ${
                wrong === item.label
                  ? "border-[#C0564E] bg-[#FCE0E0]"
                  : selected === item.label
                    ? "-translate-y-0.5 border-[#b4781e] bg-[rgba(214,184,108,0.3)] shadow"
                    : "border-[rgba(214,184,108,0.6)] bg-white"
              }`}
            >
              {item.imageSrc ? <img src={item.imageSrc} alt="" className="h-9 w-9 object-contain" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function MeasurelandsMassUnitCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MassUnitTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "sort") return <SortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <ChooseUnitScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
