"use client";

import { forwardRef, useRef, useState } from "react";
import type { MeasurelandsAnswerFormat } from "@/data/assessments/measurelandsPresentation";

const Slot = forwardRef<HTMLInputElement, { value: string; onChange: (value: string) => void; label: string; maxLength?: number; inputMode?: "decimal" | "numeric"; className?: string }>(function Slot({ value, onChange, label, maxLength = 8, inputMode = "decimal", className = "w-44" }, ref) {
  return <input ref={ref} type="text" inputMode={inputMode} value={value} maxLength={maxLength} aria-label={label} onChange={(event) => onChange(event.target.value.replace(inputMode === "numeric" ? /\D/g : /[^\d.-]/g, ""))} className={`${className} h-20 rounded-lg border-2 border-[#b8893a]/70 bg-[#fffaf0] px-4 text-center text-3xl font-black tabular-nums text-[#2c1c07] outline-none transition focus:border-[#f2c14e] focus:ring-4 focus:ring-[#b8893a]/20`} />;
});

export default function MeasurelandsAnswerWidget({ format, value, onChange, inputMode = "decimal" }: { format: MeasurelandsAnswerFormat; value: string | null; onChange: (value: string) => void; inputMode?: "decimal" | "text" }) {
  const initial = value ?? "";
  const [first, setFirst] = useState(format.kind === "time" ? initial.slice(0, 2) : format.kind === "pair" ? initial.split(format.separator)[0] ?? "" : initial);
  const [second, setSecond] = useState(format.kind === "time" ? initial.slice(2, 4) : format.kind === "pair" ? initial.split(format.separator)[1] ?? "" : "");
  const secondInput = useRef<HTMLInputElement | null>(null);

  if (format.kind === "number") {
    return <div className="mt-6 flex flex-wrap items-center justify-center gap-4"><Slot value={value ?? ""} onChange={onChange} label={format.ariaLabel} inputMode={inputMode === "text" ? "numeric" : "decimal"} />{format.unit ? <span className="min-w-12 text-3xl font-black text-white" aria-hidden>{format.unit}</span> : null}</div>;
  }

  if (format.kind === "time") {
    const update = (part: "hour" | "minute", next: string) => {
      const clipped = next.replace(/\D/g, "").slice(0, 2);
      const hour = part === "hour" ? clipped : first;
      const minute = part === "minute" ? clipped : second;
      if (part === "hour") { setFirst(clipped); if (clipped.length === 2) secondInput.current?.focus(); } else setSecond(clipped);
      onChange(hour.length === 2 && minute.length === 2 ? `${hour}${minute}` : "");
    };
    return <div className="mt-6 flex items-center justify-center gap-3" aria-label={format.ariaLabel}><Slot value={first} onChange={(next) => update("hour", next)} label="Hour" maxLength={2} inputMode="numeric" className="w-28" /><span className="pb-2 text-5xl font-black text-[#f2c14e]">:</span><Slot ref={secondInput} value={second} onChange={(next) => update("minute", next)} label="Minutes" maxLength={2} inputMode="numeric" className="w-28" /></div>;
  }

  const updatePair = (part: 0 | 1, next: string) => {
    const a = part === 0 ? next : first;
    const b = part === 1 ? next : second;
    if (part === 0) setFirst(next); else setSecond(next);
    onChange(a && b ? `${a}${format.separator}${b}` : "");
  };
  return <div className="mt-6 flex flex-wrap items-end justify-center gap-4">{format.labels.map((label, index) => <div key={label} className="grid gap-2 text-center"><span className="text-sm font-black uppercase text-[#f2c14e]">{label}</span><Slot value={index === 0 ? first : second} onChange={(next) => updatePair(index as 0 | 1, next)} label={label} /></div>)}</div>;
}
