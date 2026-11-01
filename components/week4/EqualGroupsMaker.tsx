"use client";

import { useState } from "react";
import GroundDragPiece from "@/components/ground/GroundDragPiece";
import { Counter } from "@/components/week4/GroupPicture";

export default function EqualGroupsMaker({
  groups,
  perGroup,
  onCorrect,
  onWrong,
}: {
  groups: number;
  perGroup: number;
  onCorrect?: () => void;
  onWrong?: (studentAnswer?: string | number | null, correctAnswer?: string | null) => void;
}) {
  const total = groups * perGroup;
  const [plates, setPlates] = useState<number[]>(() => Array(groups).fill(0));
  const [turn, setTurn] = useState(0);
  const [done, setDone] = useState(false);
  const placed = plates.reduce((a, b) => a + b, 0);
  const left = total - placed;

  function place(target: string | null) {
    const plate = target === null ? turn : Number(target);
    if (done || left === 0 || !Number.isInteger(plate) || plate < 0 || plate >= groups) return;
    setPlates((current) => current.map((n, i) => (i === plate ? n + 1 : n)));
    setTurn((plate + 1) % groups);
  }

  function takeBack(plate: number) {
    if (done) return;
    setPlates((current) => current.map((n, i) => (i === plate ? n - 1 : n)));
  }

  function check() {
    setDone(true);
    if (plates.every((n) => n === perGroup)) onCorrect?.();
    else onWrong?.(plates.join(", "), `${perGroup} in each group`);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="text-2xl font-extrabold text-slate-900">Share {total} counters equally into {groups} groups.</div>
      <div className="mt-1 text-sm text-slate-600">Drag each counter into a group, or tap it to share them one at a time.</div>

      <div className="mt-4 flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#e7f8f4] p-3">
        {left === 0 ? <span className="font-bold text-teal-800">All shared. Press Check.</span> : Array.from({ length: left }, (_, i) => (
          <GroundDragPiece key={i} label="Counter" disabled={done} onPlace={place}><Counter size={48} /></GroundDragPiece>
        ))}
      </div>

      <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: `repeat(${groups}, minmax(0, 1fr))` }}>
        {plates.map((count, plate) => (
          <div key={plate} data-ground-drop={plate} className="flex min-h-40 flex-col rounded-2xl border-4 border-dashed border-teal-400 bg-white p-2">
            <div className="flex flex-1 flex-wrap content-start items-center justify-center gap-1">
              {Array.from({ length: count }, (_, i) => (
                <button key={i} type="button" aria-label="Take this counter back" onClick={() => takeBack(plate)} className="rounded-full"><Counter size={38} /></button>
              ))}
            </div>
            <div className="text-center text-2xl font-black text-teal-800">{count}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={check} disabled={done || left > 0} style={{ background: "#0d9488", color: "#fff" }} className="min-h-14 rounded-xl px-8 text-lg font-extrabold transition disabled:opacity-40">Check</button>
      </div>
    </div>
  );
}
