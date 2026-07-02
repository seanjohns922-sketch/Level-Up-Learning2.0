"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type AnalogClockTask = Extract<PracticeTask, { kind: "analogClock" }>;
type ClockMinute = 0 | 15 | 30 | 45;
type ClockFocus = "minute" | "hour" | "time";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

function normalizeHour(hour: number) {
  const normalized = ((Math.round(hour) - 1) % 12) + 1;
  return normalized <= 0 ? normalized + 12 : normalized;
}

function minuteLabel(minute: ClockMinute) {
  if (minute === 0) return "O'Clock";
  if (minute === 30) return "Half Past";
  if (minute === 15) return "Quarter Past";
  return "Quarter To";
}

function timeLabel(hour: number, minute: ClockMinute) {
  const h = normalizeHour(hour);
  if (minute === 0) return `${h} o'clock`;
  if (minute === 30) return `Half past ${h}`;
  if (minute === 15) return `Quarter past ${h}`;
  return `Quarter to ${normalizeHour(h + 1)}`;
}

function displayHourForTime(hour: number, minute: ClockMinute) {
  return minute === 45 ? normalizeHour(hour + 1) : normalizeHour(hour);
}

function internalHourForDisplay(displayHour: number, minute: ClockMinute) {
  return minute === 45 ? normalizeHour(displayHour - 1) : normalizeHour(displayHour);
}

function digitalLabel(hour: number, minute: ClockMinute) {
  return `${normalizeHour(hour)}:${String(minute).padStart(2, "0")}`;
}

function ClockFace({
  hour,
  minute,
  size = 300,
  focus = "time",
}: {
  hour: number;
  minute: ClockMinute;
  size?: number;
  focus?: ClockFocus;
}) {
  const center = size / 2;
  const radius = size * 0.43;
  const hourAngle = (normalizeHour(hour) % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  const handEnd = (angle: number, length: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + Math.cos(radians) * length,
      y: center + Math.sin(radians) * length,
    };
  };
  const hourEnd = handEnd(hourAngle, size * 0.22);
  const minuteEnd = handEnd(minuteAngle, size * 0.33);
  const highlightMinute = focus === "minute" || focus === "time";
  const highlightHour = focus === "hour" || focus === "time";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-[0_20px_34px_rgba(92,56,14,0.22)]"
      role="img"
      aria-label={`Analog clock showing ${timeLabel(hour, minute)}`}
    >
      <defs>
        <radialGradient id="ml-clock-face" cx="42%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff9e9" />
          <stop offset="62%" stopColor="#f6dfaa" />
          <stop offset="100%" stopColor="#b77a23" />
        </radialGradient>
        <linearGradient id="ml-clock-rim" x1="12%" y1="12%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#ffeab2" />
          <stop offset="45%" stopColor="#b7791f" />
          <stop offset="100%" stopColor="#5a3210" />
        </linearGradient>
        <filter id="ml-clock-inner-shadow">
          <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#7c4a12" floodOpacity="0.22" />
        </filter>
      </defs>
      <circle cx={center} cy={center} r={size * 0.47} fill="url(#ml-clock-rim)" />
      <circle cx={center} cy={center} r={size * 0.415} fill="url(#ml-clock-face)" filter="url(#ml-clock-inner-shadow)" />
      <circle cx={center} cy={center} r={size * 0.365} fill="rgba(255,255,255,0.58)" stroke="rgba(92,56,14,0.14)" strokeWidth="2" />

      {Array.from({ length: 60 }, (_, index) => {
        const isHour = index % 5 === 0;
        const angle = index * 6;
        const outer = handEnd(angle, radius);
        const inner = handEnd(angle, radius - (isHour ? 14 : 7));
        return (
          <line
            key={index}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={isHour ? "#7c4a12" : "rgba(124,74,18,0.42)"}
            strokeWidth={isHour ? 4 : 1.7}
            strokeLinecap="round"
          />
        );
      })}

      {HOUR_OPTIONS.map((value) => {
        const pos = handEnd(value * 30, size * 0.305);
        return (
          <text
            key={value}
            x={pos.x}
            y={pos.y + 7}
            textAnchor="middle"
            className="fill-[#3a2408] text-[22px] font-black"
            style={{ fontFamily: "inherit", letterSpacing: "0.02em" }}
          >
            {value}
          </text>
        );
      })}

      {highlightMinute ? (
        <line
          x1={center}
          y1={center}
          x2={minuteEnd.x}
          y2={minuteEnd.y}
          stroke="#a78bfa"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.32"
        />
      ) : null}
      {highlightHour ? (
        <line
          x1={center}
          y1={center}
          x2={hourEnd.x}
          y2={hourEnd.y}
          stroke="#f59e0b"
          strokeWidth="24"
          strokeLinecap="round"
          opacity="0.28"
        />
      ) : null}
      <line
        x1={center}
        y1={center}
        x2={hourEnd.x}
        y2={hourEnd.y}
        stroke={highlightHour ? "#78350f" : "#9a7b54"}
        strokeWidth={highlightHour ? "14" : "11"}
        strokeLinecap="round"
        opacity={focus === "minute" ? "0.45" : "1"}
      />
      <line
        x1={center}
        y1={center}
        x2={minuteEnd.x}
        y2={minuteEnd.y}
        stroke={highlightMinute ? "#5b21b6" : "#9a7b54"}
        strokeWidth={highlightMinute ? "9" : "7"}
        strokeLinecap="round"
        opacity={focus === "hour" ? "0.45" : "1"}
      />
      <circle cx={center} cy={center} r={13} fill="#7c4a12" stroke="#fff0c2" strokeWidth="5" />
    </svg>
  );
}

function Shell({
  task,
  children,
}: {
  task: AnalogClockTask;
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
          {task.badgeLabel ?? "Clockwork Crossing"}
        </div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{task.prompt}</div>
          <ReadAloudBtn text={task.speakText ?? task.prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: AnalogClockTask; onCorrect: () => void }) {
  const steps = task.teachingSteps;
  return (
    <Shell task={task}>
      <div className="measurelands-clock-intro grid gap-5 rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)] md:grid-cols-[340px_1fr]">
        <div className="measurelands-clock-face-wrap flex justify-center">
          <ClockFace hour={task.targetHour} minute={task.targetMinute} />
        </div>
        <div className="measurelands-clock-steps flex flex-col justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Clock3 className="h-8 w-8" />
          </div>
          {steps?.length ? (
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={step.label} className="measurelands-clock-step grid items-center gap-3 rounded-[24px] border border-[rgba(214,184,108,0.28)] bg-white/75 p-3 sm:grid-cols-[118px_1fr]">
                  <div className="measurelands-clock-step-preview flex justify-center">
                    <ClockFace hour={task.targetHour} minute={task.targetMinute} size={112} focus={step.focus} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[#5b21b6]">Step {index + 1} · {step.label}</div>
                    <div className="mt-1 text-lg font-black leading-tight text-[#3a2408]">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(task.teachingPoints ?? []).map((point) => (
                <p key={point} className="text-lg font-semibold leading-relaxed text-[#4a3412]">
                  {point}
                </p>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onCorrect}
            className="mt-2 w-fit rounded-full px-6 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
          >
            Start
          </button>
        </div>
      </div>
    </Shell>
  );
}

function ReadScene({ task, onCorrect, onWrong }: { task: AnalogClockTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell task={task}>
      <div className="measurelands-clock-read rounded-[30px] border border-[rgba(214,184,108,0.34)] bg-white/90 p-5">
        <div className="measurelands-clock-face-wrap flex justify-center">
          <ClockFace hour={task.targetHour} minute={task.targetMinute} />
        </div>
        {task.showDigital ? (
          <div className="mt-2 text-center text-lg font-black uppercase tracking-[0.18em] text-[#7c4a12]">
            {digitalLabel(task.targetHour, task.targetMinute)}
          </div>
        ) : null}
      </div>
      <div className="measurelands-option-bank grid gap-3 sm:grid-cols-3">
        {(task.options ?? []).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative min-h-[96px] rounded-[26px] border-2 border-[rgba(214,184,108,0.5)] bg-[#fffaf0] px-4 py-5 text-center text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)] active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={option.label} /></span>
            {option.label}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function ChooseClockScene({ task, onCorrect, onWrong }: { task: AnalogClockTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell task={task}>
      <div className="measurelands-option-bank grid gap-3 sm:grid-cols-3">
        {(task.options ?? []).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative rounded-[26px] border-2 border-[rgba(214,184,108,0.5)] bg-[#fffaf0] px-3 py-4 text-center shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)] active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={option.label} /></span>
            <div className="measurelands-clock-face-wrap flex justify-center">
              <ClockFace hour={option.hour} minute={option.minute} size={190} />
            </div>
            <div className="mt-2 text-lg font-black text-[#2c1c07]">{option.label}</div>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function BuildScene({ task, onCorrect, onWrong }: { task: AnalogClockTask; onCorrect: () => void; onWrong: () => void }) {
  const minuteChoices = useMemo<ClockMinute[]>(() => {
    if (task.granularity === "hour") return [0];
    if (task.granularity === "halfHour") return [0, 30];
    return [0, 15, 30, 45];
  }, [task.granularity]);
  const targetDisplayHour = displayHourForTime(task.targetHour, task.targetMinute);
  const initialHour = targetDisplayHour === 12 ? 1 : 12;
  const initialMinute = minuteChoices.includes(30) && task.targetMinute === 0 ? 30 : 0;
  const [selectedHour, setSelectedHour] = useState<number>(initialHour);
  const [selectedMinute, setSelectedMinute] = useState<ClockMinute>(initialMinute);
  const renderHour = internalHourForDisplay(selectedHour, selectedMinute);

  const isCorrect = normalizeHour(selectedHour) === targetDisplayHour && selectedMinute === task.targetMinute;

  return (
    <Shell task={task}>
      <div className="measurelands-clock-build grid gap-5 rounded-[30px] border border-[rgba(214,184,108,0.34)] bg-white/90 p-5 lg:grid-cols-[360px_1fr]">
        <div className="measurelands-clock-face-wrap flex flex-col items-center justify-center">
          <ClockFace hour={renderHour} minute={selectedMinute} />
          <div className="mt-3 rounded-full bg-[rgba(91,33,182,0.08)] px-5 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">
            {timeLabel(renderHour, selectedMinute)}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#7c4a12]">Choose the hour</div>
            <div className="grid grid-cols-6 gap-2">
              {HOUR_OPTIONS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => setSelectedHour(hour)}
                  className={`min-h-[52px] rounded-2xl border-2 text-xl font-black transition active:scale-[0.98] ${
                    normalizeHour(selectedHour) === hour
                      ? "border-[#7c3aed] bg-[#ede9fe] text-[#4c1d95]"
                      : "border-[rgba(214,184,108,0.42)] bg-[#fffaf0] text-[#2c1c07]"
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-[#7c4a12]">Choose the minute hand</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {minuteChoices.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => setSelectedMinute(minute)}
                  className={`relative min-h-[64px] rounded-2xl border-2 px-4 text-lg font-black transition active:scale-[0.98] ${
                    selectedMinute === minute
                      ? "border-[#7c3aed] bg-[#ede9fe] text-[#4c1d95]"
                      : "border-[rgba(214,184,108,0.42)] bg-[#fffaf0] text-[#2c1c07]"
                  }`}
                >
                  <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={minuteLabel(minute)} /></span>
                  {minuteLabel(minute)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => (isCorrect ? onCorrect() : onWrong())}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#78350f,#b7791f)] px-6 py-4 text-lg font-black uppercase tracking-[0.14em] text-[#fff8e1] shadow-[0_14px_28px_rgba(120,53,15,0.22)] transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <CheckCircle2 className="h-5 w-5" />
            Check Time
          </button>
        </div>
      </div>

      {process.env.NODE_ENV === "development" ? (
        <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/70 p-3 text-xs font-mono text-amber-950">
          Target: {digitalLabel(task.targetHour, task.targetMinute)} ({timeLabel(task.targetHour, task.targetMinute)}) | Current: {digitalLabel(renderHour, selectedMinute)} ({timeLabel(renderHour, selectedMinute)}) | Mode: {task.mode} | Granularity: {task.granularity} | Display hour: {selectedHour} | Internal hour: {renderHour} | Minute: {selectedMinute}
        </div>
      ) : null}
    </Shell>
  );
}

export function MeasurelandsAnalogClockCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: AnalogClockTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "build") return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "chooseClock") return <ChooseClockScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
