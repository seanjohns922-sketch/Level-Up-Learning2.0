"use client";

import { useEffect, useMemo, useState } from "react";

type PartitionExpandConfig = {
  min?: number;
  max?: number;
  mode?: "partition" | "expand" | "flexible_partition";
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function partitionNumber(value: number) {
  const hundreds = Math.floor(value / 100) * 100;
  const tens = Math.floor((value % 100) / 10) * 10;
  const ones = value % 10;
  return { hundreds, tens, ones };
}

export default function PartitionExpand({
  config,
}: {
  config?: Record<string, unknown>;
}) {
  const typedConfig = (config ?? {}) as PartitionExpandConfig;
  const min = typeof typedConfig.min === "number" ? typedConfig.min : 100;
  const max = typeof typedConfig.max === "number" ? typedConfig.max : 999;
  const mode = typedConfig.mode ?? "partition";

  const [seed, setSeed] = useState(0);
  const [values, setValues] = useState({ hundreds: "", tens: "", ones: "" });
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const target = useMemo(() => randInt(min, max), [min, max, seed]);
  const correct = useMemo(() => partitionNumber(target), [target]);

  useEffect(() => {
    setStatus("idle");
    if (mode === "flexible_partition") {
      setValues({
        hundreds: String(correct.hundreds),
        tens: "0",
        ones: "0",
      });
      return;
    }

    setValues({ hundreds: "", tens: "", ones: "" });
  }, [correct.hundreds, mode, seed]);

  function setValue(key: "hundreds" | "tens" | "ones", next: string) {
    setValues((current) => ({ ...current, [key]: next.replace(/[^\d]/g, "") }));
    setStatus("idle");
  }

  function numericValue(key: "hundreds" | "tens" | "ones") {
    return Number(values[key] || "0");
  }

  function check() {
    const hundreds = numericValue("hundreds");
    const tens = numericValue("tens");
    const ones = numericValue("ones");

    const isCorrect =
      mode === "flexible_partition"
        ? hundreds + tens + ones === target
        : hundreds === correct.hundreds &&
          tens === correct.tens &&
          ones === correct.ones;

    setStatus(isCorrect ? "correct" : "wrong");
  }

  function nextChallenge() {
    setSeed((current) => current + 1);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Partition & Expand
          </div>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            {mode === "partition"
              ? "Break the number into hundreds, tens, and ones"
              : mode === "expand"
              ? "Write the expanded form"
              : "Partition the number in a different valid way"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Target number:{" "}
            <span className="font-black text-gray-900">{target}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={nextChallenge}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          New number
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { key: "hundreds" as const, label: "Hundreds" },
          { key: "tens" as const, label: "Tens" },
          { key: "ones" as const, label: "Ones" },
        ].map((item) => (
          <label
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {item.label}
            </div>
            <input
              value={values[item.key]}
              onChange={(event) => setValue(item.key, event.target.value)}
              inputMode="numeric"
              className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-3xl font-black text-gray-900 outline-none focus:border-indigo-500"
              placeholder="0"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">
          Your expression
        </div>
        <div className="mt-2 text-3xl font-black text-indigo-900">
          {numericValue("hundreds")} + {numericValue("tens")} + {numericValue("ones")} ={" "}
          {numericValue("hundreds") + numericValue("tens") + numericValue("ones")}
        </div>
        {mode !== "flexible_partition" ? (
          <p className="mt-2 text-sm text-indigo-700">
            Standard partition: {correct.hundreds} + {correct.tens} + {correct.ones}
          </p>
        ) : (
          <p className="mt-2 text-sm text-indigo-700">
            Any correct partition works as long as the total stays {target}.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-black text-white hover:bg-indigo-700"
        >
          Check answer
        </button>
        <div className="text-sm font-bold">
          {status === "correct" ? (
            <span className="text-emerald-700">Correct.</span>
          ) : status === "wrong" ? (
            <span className="text-red-700">Not yet. Rework the partition.</span>
          ) : (
            <span className="text-gray-500">Enter the parts, then check.</span>
          )}
        </div>
      </div>
    </div>
  );
}
