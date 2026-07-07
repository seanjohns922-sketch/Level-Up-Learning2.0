"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Time24Task = Extract<PracticeTask, { kind: "time24" }>;

function fmt24(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function fmt12(min: number): string {
  const h24 = Math.floor(min / 60), m = min % 60;
  const period = h24 < 12 ? "am" : "pm";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]" style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>{badge}</div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function AnalogClock({ minutes, size = 168 }: { minutes: number; size?: number }) {
  const h24 = Math.floor(minutes / 60), m = minutes % 60;
  const minAngle = m * 6;
  const hourAngle = ((h24 % 12) + m / 60) * 30;
  const hand = (deg: number, len: number, w: number, color: string) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return <line x1="100" y1="100" x2={100 + len * Math.cos(rad)} y2={100 + len * Math.sin(rad)} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };
  const pmTint = h24 >= 12;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="clock">
      <circle cx="100" cy="100" r="92" fill={pmTint ? "#ede7fb" : "#fff9ee"} stroke="#5b21b6" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        return <line key={i} x1={100 + 82 * Math.cos(a)} y1={100 + 82 * Math.sin(a)} x2={100 + 90 * Math.cos(a)} y2={100 + 90 * Math.sin(a)} stroke="#5b21b6" strokeWidth={i % 3 === 0 ? 4 : 2} />;
      })}
      {[12, 3, 6, 9].map((n, i) => {
        const a = ((i * 90 - 90) * Math.PI) / 180;
        return <text key={n} x={100 + 68 * Math.cos(a)} y={100 + 68 * Math.sin(a) + 6} textAnchor="middle" fontSize="18" fontWeight="900" fill="#2c1c07">{n}</text>;
      })}
      {hand(hourAngle, 48, 6, "#2c1c07")}
      {hand(minAngle, 70, 4, "#7c3aed")}
      <circle cx="100" cy="100" r="5" fill="#5b21b6" />
    </svg>
  );
}

function Digital({ text, tint }: { text: string; tint?: "am" | "pm" | "24" }) {
  const bg = tint === "24" ? "rgba(91,33,182,0.1)" : "rgba(245,158,11,0.12)";
  const col = tint === "24" ? "#5b21b6" : "#b45309";
  return <div className="rounded-[18px] border-2 px-5 py-3 text-4xl font-black tabular-nums shadow-sm" style={{ background: bg, borderColor: col, color: col }}>{text}</div>;
}

function OptionRow({ task, onCorrect, onWrong }: { task: Time24Task; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-3 gap-3">
      {(task.options ?? []).map((o) => (
        <button key={o} type="button" onClick={() => (o === task.correctOption ? onCorrect() : (setWrong(o), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[68px] items-center justify-center rounded-[22px] border-2 px-3 text-2xl font-black tabular-nums text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
        </button>
      ))}
    </div>
  );
}

function ConvertScene({ task, onCorrect, onWrong }: { task: Time24Task; onCorrect: () => void; onWrong: () => void }) {
  const min = task.minutes ?? 0;
  const to24 = (task.direction ?? "to24") === "to24";
  return (
    <Shell badge={task.badgeLabel ?? "Convert the Time"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-3 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        {task.showClock ? <AnalogClock minutes={min} /> : null}
        <div className="flex items-center gap-3">
          <Digital text={to24 ? fmt12(min) : fmt24(min)} tint={to24 ? (min < 720 ? "am" : "pm") : "24"} />
          <span className="text-3xl font-black text-[#a98b52]">→</span>
          <span className="rounded-[18px] border-2 border-dashed border-[#5b21b6] px-5 py-3 text-3xl font-black text-[#5b21b6]">?</span>
        </div>
      </div>
      <OptionRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function MatchScene({ task, onCorrect, onWrong }: { task: Time24Task; onCorrect: () => void; onWrong: () => void }) {
  const min = task.minutes ?? 0;
  return (
    <Shell badge={task.badgeLabel ?? "Match the Time"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <AnalogClock minutes={min} />
        <Digital text={fmt12(min)} tint={min < 720 ? "am" : "pm"} />
      </div>
      <p className="text-center text-[13px] font-black uppercase tracking-[0.14em] text-[#a98b52]">Which is the same time in 24-hour?</p>
      <OptionRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function MistakeScene({ task, onCorrect, onWrong }: { task: Time24Task; onCorrect: () => void; onWrong: () => void }) {
  const min = task.minutes ?? 0;
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-3 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <AnalogClock minutes={min} />
        <Digital text={fmt12(min)} tint={min < 720 ? "am" : "pm"} />
        {task.statement ? <div className="rounded-full border-2 border-[rgba(192,86,78,0.5)] bg-[rgba(252,224,224,0.5)] px-4 py-1.5 text-lg font-black text-[#8a2b24]">{task.statement}</div> : null}
      </div>
      <p className="text-center text-[13px] font-black uppercase tracking-[0.14em] text-[#a98b52]">What is the correct 24-hour time?</p>
      <OptionRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: Time24Task; onCorrect: () => void }) {
  const rows: Array<[number]> = [[450], [855], [1245]]; // 07:30, 14:15, 20:45
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <p className="text-[16px] font-bold leading-snug text-[#2c1c07]">Many timetables don&apos;t use am and pm — they use <span className="font-black text-[#5b21b6]">24-hour time</span>. After midday, keep counting: 1 pm is 13:00, 2 pm is 14:00.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {rows.map(([m]) => (
            <div key={m} className="flex items-center justify-center gap-2 rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2">
              <span className="text-lg font-black text-[#b45309]">{fmt12(m)}</span>
              <span className="text-[#a98b52]">→</span>
              <span className="text-lg font-black text-[#5b21b6]">{fmt24(m)}</span>
            </div>
          ))}
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s convert! →</button>
    </Shell>
  );
}

export function MeasurelandsTime24Card({ task, onCorrect, onWrong }: { task: Time24Task; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "match": return <MatchScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "mistake": return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <ConvertScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
