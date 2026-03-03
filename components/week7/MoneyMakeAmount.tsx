"use client";

import { useEffect, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { COINS, renderCoins } from "./moneyAssets";

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

export default function MoneyMakeAmount({
  target,
  allowTen = false,
  hideCheck = false,
  hideTotal = false,
  onAttempt,
  onCorrect,
  onWrong,
}: {
  target: number;
  allowTen?: boolean;
  hideCheck?: boolean;
  hideTotal?: boolean;
  onAttempt?: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [total, setTotal] = useState(0);
  const [last, setLast] = useState<number | null>(null);
  const [pickedCoins, setPickedCoins] = useState<number[]>([]);
  const [autoMarked, setAutoMarked] = useState(false);

  useEffect(() => {
    setTotal(0);
    setLast(null);
    setPickedCoins([]);
    setAutoMarked(false);
  }, [target, allowTen]);

  function add(value: number) {
    onAttempt?.();
    setTotal((t) => t + value);
    setLast(value);
    setPickedCoins((prev) => [...prev, value]);
  }

  function reset() {
    setTotal(0);
    setLast(null);
    setPickedCoins([]);
  }

  function check() {
    if (total === target) onCorrect?.();
    else onWrong?.();
  }

  useEffect(() => {
    if (!hideCheck) return;
    if (total !== target || autoMarked) return;
    setAutoMarked(true);
    onCorrect?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideCheck, total, target, autoMarked]);

  const prompt = `Show me $${target} using the money below.`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-3xl font-black text-gray-900">{prompt}</div>
        <button
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
          type="button"
        >
          🔊 Read
        </button>
      </div>

      {!hideTotal ? (
        <div className="mt-2 text-sm font-bold text-gray-600">
          Total: <span className="text-gray-900">${total}</span>
        </div>
      ) : null}
      <div className="text-xs text-gray-500 mt-1">
        {allowTen ? "Use $10, $5, $2, and $1 coins." : "Use $5, $2, and $1 coins."}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pickedCoins.length === 0 ? (
          <div className="text-sm text-gray-500">$0</div>
        ) : (
          pickedCoins.map((v, i) => {
            const coin = COINS.find((c) => c.value === v);
            if (!coin) return null;
            return (
              <img
                key={`${v}-${i}`}
                src={coin.src}
                alt={coin.label}
                className={
                  coin.type === "note"
                    ? "h-11 w-20 object-contain"
                    : "h-11 w-11 object-contain"
                }
              />
            );
          })
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {COINS.filter((c) => (allowTen ? c.value <= 10 : c.value <= 5)).map((coin) => (
          <button
            key={coin.value}
            onClick={() => add(coin.value)}
            className="px-4 py-3 rounded-2xl border hover:bg-gray-50 flex items-center gap-3 justify-center"
            type="button"
          >
            <img
              src={coin.src}
              alt={coin.label}
              className={coin.type === "note" ? "h-12 w-20 object-contain" : "h-12 w-12 object-contain"}
            />
            <span className="text-xl font-black">{coin.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {!hideCheck ? (
          <button
            onClick={check}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
            type="button"
          >
            Check
          </button>
        ) : null}
        <button
          onClick={reset}
          className="px-5 py-3 rounded-xl bg-gray-100 font-extrabold hover:bg-gray-200"
          type="button"
        >
          Reset
        </button>
        {last ? (
          <div className="text-sm text-gray-500">Last coin: ${last}</div>
        ) : null}
      </div>
    </div>
  );
}
