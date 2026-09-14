"use client";
import { useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";

export default function NumberReasoningResponse({ value, options, onChange, unit }: { value: string | null; options: string[]; unit?: string; onChange: (value: string) => void }) {
  const [answer, setAnswer] = useState(value?.split("||")[0] ?? "");
  const [reason, setReason] = useState(value?.split("||")[1] ?? "");
  function update(nextAnswer: string, nextReason: string) {
    setAnswer(nextAnswer); setReason(nextReason);
    onChange(nextAnswer.trim() && nextReason ? `${nextAnswer}||${nextReason}` : "");
  }
  return <div className="space-y-4 rounded-xl bg-white p-4 text-slate-950">
    <label className="block font-bold">Your answer{unit ? ` in ${unit}` : ""}
      <input aria-label={unit ? `Answer in ${unit}` : "Answer"} inputMode="decimal" value={answer} onChange={event => update(event.target.value, reason)} className="mt-2 min-h-12 w-full rounded-lg border-2 border-slate-400 bg-white px-4 text-xl text-slate-950" />
    </label>
    <fieldset className="space-y-2"><legend className="mb-2 font-bold">Choose the reason that supports your answer.</legend>
      {options.map((label,index)=><div key={label} className="relative">
        <button type="button" aria-pressed={reason===String(index+1)} onClick={()=>update(answer,String(index+1))} className={`min-h-12 w-full rounded-lg border-2 px-4 py-3 pr-12 text-left text-slate-950 ${reason===String(index+1)?"border-teal-600 bg-teal-50":"border-slate-300 bg-white"}`}>{label}</button>
        <OptionReadAloudButton text={label} className="absolute right-2 top-1/2 -translate-y-1/2" />
      </div>)}
    </fieldset>
  </div>;
}
