"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Compass, Sunrise, Sun, Sunset, Moon, type LucideIcon } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsEventBadge } from "@/components/measurelands/MeasurelandsEventBadge";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type RoutineTask = Extract<PracticeTask, { kind: "routineSequence" }>;
type RoutineItem = NonNullable<RoutineTask["items"]>[number];

const STORY_LABEL_IMAGE_OVERRIDES: Record<string, string> = {
  Seed: "/images/measurelands/story-3d/story-seed-1.png",
  "Water the Soil": "/images/measurelands/story-3d/story-seed-2.png",
  Sprout: "/images/measurelands/story-3d/story-seed-3.png",
  Flower: "/images/measurelands/story-3d/story-seed-4.png",
  Egg: "/images/measurelands/story-3d/story-butterfly-1.png",
  Caterpillar: "/images/measurelands/story-3d/story-butterfly-2.png",
  Chrysalis: "/images/measurelands/story-3d/story-butterfly-3.png",
  Butterfly: "/images/measurelands/story-3d/story-butterfly-4-v2.png",
  "Brush and Paste": "/images/measurelands/story-3d/story-teeth-1.png",
  "Add Toothpaste": "/images/measurelands/story-3d/story-teeth-2.png",
  "Brush Teeth": "/images/measurelands/story-3d/story-teeth-3.png",
  Rinse: "/images/measurelands/story-3d/story-teeth-4.png",
  Bread: "/images/measurelands/story-3d/story-toast-1-v2.png",
  "Into the Toaster": "/images/measurelands/story-3d/story-toast-2-v2.png",
  "Toast Pops Up": "/images/measurelands/story-3d/story-toast-3-v2.png",
  "Buttered Toast": "/images/measurelands/story-3d/story-toast-4-v2.png",
};

function resolveRoutineImageSrc(item: RoutineItem): string | undefined {
  if (item.icon === "story") {
    return STORY_LABEL_IMAGE_OVERRIDES[item.label] ?? item.imageSrc;
  }
  return item.imageSrc;
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
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function RoutineCard({
  item,
  compact = false,
  highlight = false,
}: {
  item: RoutineItem;
  compact?: boolean;
  highlight?: boolean;
}) {
  const imageSize = compact ? "h-14 w-14" : "h-20 w-20";
  const imageSrc = resolveRoutineImageSrc(item);
  return (
    <div
      className="measurelands-routine-card flex min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-[24px] border-2 px-3 py-3 text-center"
      style={{
        borderColor: highlight ? "rgba(91,33,182,0.72)" : "rgba(214,184,108,0.5)",
        background: highlight ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.94)",
      }}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={item.label} className={`${imageSize} object-contain drop-shadow-[0_10px_16px_rgba(120,53,15,0.18)]`} />
      ) : (
        <MeasurelandsEventBadge iconKey={item.icon} label={item.label} size={compact ? "md" : "lg"} />
      )}
      <div className="text-sm font-black leading-tight text-[#2c1c07]">{item.label}</div>
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: RoutineTask; onCorrect: () => void }) {
  const items = task.items ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">We can put familiar events in order.</p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">Wake up happens first. Then breakfast. Then school.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-[rgba(214,184,108,0.32)] bg-[rgba(255,252,245,0.9)] p-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="w-[150px]">
                <RoutineCard item={item} compact highlight={index === 0} />
              </div>
              {index < items.length - 1 ? <ArrowRight className="h-6 w-6 shrink-0 text-[#b4781e]" strokeWidth={3} /> : null}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onCorrect}
            className="rounded-full px-6 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
          >
            Start
          </button>
        </div>
      </div>
    </Shell>
  );
}

function FirstScene({ task, onCorrect, onWrong }: { task: RoutineTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const correctId = useMemo(
    () => items.slice().sort((a, b) => a.order - b.order)[0]?.id ?? null,
    [items],
  );
  return (
    <Shell badge={task.badgeLabel ?? "What Comes First?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === correctId ? onCorrect() : onWrong())}
            className="relative rounded-[24px] transition hover:-translate-y-0.5"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={item.label} />
            </span>
            <RoutineCard item={item} compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function BuildContent({
  items,
  onCorrect,
  onWrong,
}: {
  items: RoutineItem[];
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const expected = items.slice().sort((a, b) => a.order - b.order);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const byId = (id: string) => items.find((item) => item.id === id);
  const tray = items.filter((item) => !placedIds.includes(item.id));

  function pick(id: string) {
    if (locked || placedIds.includes(id)) return;
    const item = byId(id);
    const slotIndex = placedIds.length;
    if (!item || item.id !== expected[slotIndex]?.id) {
      onWrong();
      return;
    }
    const next = [...placedIds, id];
    setPlacedIds(next);
    if (next.length === expected.length) {
      setLocked(true);
      window.setTimeout(onCorrect, 450);
    }
  }

  return (
    <>
      <div className="measurelands-routine-slots mx-auto rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          {expected.map((slot, index) => {
            const filled = placedIds[index] ? byId(placedIds[index]!) : null;
            return filled ? (
              <RoutineCard key={slot.id} item={filled} compact highlight />
            ) : (
              <div
                key={slot.id}
                className="measurelands-routine-slot flex min-h-[132px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-3 py-3 text-center"
                style={{ borderColor: "rgba(214,184,108,0.6)", background: "rgba(255,248,232,0.45)" }}
              >
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a98b52]">
                  {index === 0 ? "First" : index === expected.length - 1 ? "Last" : "Next"}
                </div>
                <div className="mt-1 text-xs font-bold text-[#a98b52]">tap the routine card</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="measurelands-option-bank grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tray.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pick(item.id)}
            disabled={locked}
            className="relative rounded-[24px] transition hover:-translate-y-0.5"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={item.label} />
            </span>
            <RoutineCard item={item} compact />
          </button>
        ))}
      </div>
    </>
  );
}

function BuildScene({ task, onCorrect, onWrong }: { task: RoutineTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.buildItems ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Build the Timeline"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <BuildContent items={items} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function FixScene({ task, onCorrect, onWrong }: { task: RoutineTask; onCorrect: () => void; onWrong: () => void }) {
  const broken = task.brokenItems ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Fix the Timeline"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.38)] bg-[rgba(255,248,232,0.8)] p-4">
        <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#b45309]">What&apos;s Wrong?</div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          {broken.map((item) => (
            <RoutineCard key={item.id} item={item} compact />
          ))}
        </div>
      </div>
      <BuildContent items={broken} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

const DAYPART_ICON: Record<string, LucideIcon> = {
  Morning: Sunrise,
  Afternoon: Sun,
  Evening: Sunset,
  Night: Moon,
};

/* ── Classify one event into morning / afternoon / evening / night ── */
function PartOfDayScene({ task, onCorrect, onWrong }: { task: RoutineTask; onCorrect: () => void; onWrong: () => void }) {
  const event = (task.items ?? [])[0];
  const options = task.textOptions ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "When Does It Happen?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {event ? (
        <div className="measurelands-routine-focus mx-auto max-w-[260px]">
          <RoutineCard item={event} highlight />
        </div>
      ) : null}
      <div className="measurelands-option-bank grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((value) => {
          const Icon = DAYPART_ICON[value];
          return (
            <button
              key={value}
              type="button"
              onClick={() => (value === task.correctTextOption ? onCorrect() : onWrong())}
              className="relative flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={value} /></span>
              {Icon ? <Icon className="h-7 w-7 text-[#7c3aed]" /> : null}
              {value}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

/* ── Continue a routine: chain shown so far, a "?" tile, pick the next event ── */
function NextScene({ task, onCorrect, onWrong }: { task: RoutineTask; onCorrect: () => void; onWrong: () => void }) {
  const chain = (task.items ?? []).slice().sort((a, b) => a.order - b.order);
  const options = task.buildItems ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "What Happens Next?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="measurelands-routine-chain mx-auto flex max-w-[560px] flex-wrap items-center justify-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        {chain.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="w-[130px]"><RoutineCard item={item} compact /></div>
            <ArrowRight className="h-6 w-6 shrink-0 text-[#b4781e]" strokeWidth={3} />
          </div>
        ))}
        <div
          className="measurelands-routine-slot flex min-h-[132px] w-[130px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed px-3 py-3 text-center shadow-[0_0_22px_rgba(124,58,237,0.3)]"
          style={{ borderColor: "rgba(124,58,237,0.7)", background: "rgba(124,58,237,0.1)" }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[rgba(124,58,237,0.5)] bg-white text-3xl font-black text-[#7c3aed]">?</span>
          <span className="text-xs font-black text-[#7c3aed]">Next</span>
        </div>
      </div>
      <div className="measurelands-option-bank grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === task.correctTextOption ? onCorrect() : onWrong())}
            className="relative rounded-[24px] transition hover:-translate-y-0.5"
          >
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={item.label} /></span>
            <RoutineCard item={item} compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function MeaningScene({ task, onCorrect, onWrong }: { task: RoutineTask; onCorrect: () => void; onWrong: () => void }) {
  const options = task.textOptions ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "What Does It Mean?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-3">
        {options.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctTextOption ? onCorrect() : onWrong())}
            className="relative flex min-h-[64px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10">
              <OptionReadAloudButton text={value} />
            </span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsRoutineSequenceCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: RoutineTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "first") return <FirstScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "build") return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "fix") return <FixScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "partOfDay") return <PartOfDayScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "next") return <NextScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <MeaningScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
