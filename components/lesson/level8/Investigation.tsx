"use client";

import { useState } from "react";
import { tossTwoCoins, sampleCyclists } from "@/lib/level8-investigations";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import Cave7Visual from "@/components/lesson/cave7/Cave7Visual";
import { getRealmTheme } from "@/lib/useRealmTheme";
import type { Level8Realm } from "@/lib/level8-config";

/** Explorations are unscored: the normal lesson engine records practice results. */
export default function Investigation({
  realm,
  week,
}: {
  realm: Level8Realm;
  week: number;
}) {
  const visible =
    (realm === "pattern" && week >= 7) ||
    (realm === "chance" && week >= 8) ||
    (realm === "statistics" && week >= 5);
  if (!visible) return null;
  const theme = getRealmTheme(realm);
  return (
    <details
      className="mt-5 rounded-xl border bg-white p-4"
      style={{ borderColor: theme.ctaFrom }}
    >
      <summary className="cursor-pointer text-lg font-bold">
        Try it yourself ·{" "}
        {realm === "pattern"
          ? "Graph laboratory"
          : realm === "chance"
            ? "Two-coin experiment"
            : "Sampling investigation"}
      </summary>
      <div className="mt-4">
        {realm === "pattern" ? (
          <GraphLab />
        ) : realm === "chance" ? (
          <CoinLab />
        ) : (
          <SamplingLab />
        )}
      </div>
    </details>
  );
}

const buttonClass =
  "rounded-lg border border-current px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2";

function GraphLab() {
  const [rate, setRate] = useState(2),
    [start, setStart] = useState(1);
  const [trials, setTrials] = useState<{ rate: number; start: number }[]>([]);
  const instruction =
    "Change one value at a time. Predict what will happen to the line, then test it. Record up to six trials and explain what stayed the same.";
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p>{instruction}</p>
        <ReadAloudBtn text={instruction} />
      </div>
      <div className="flex flex-wrap gap-5">
        <label>
          Rate m: <strong>{rate}</strong>
          <input
            className="block"
            type="range"
            min="-4"
            max="4"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
        <label>
          Starting value b: <strong>{start}</strong>
          <input
            className="block"
            type="range"
            min="-5"
            max="5"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          />
        </label>
        <ReadAloudBtn
          text={`Rate m is ${rate}. Starting value b is ${start}. y equals ${rate} times x plus ${start}.`}
        />
      </div>
      <p className="text-xl font-bold">
        y = {rate}x {start < 0 ? "−" : "+"} {Math.abs(start)}
      </p>
      <svg
        viewBox="0 0 500 330"
        className="mx-auto max-h-80 w-full"
        role="img"
        aria-label={`Graph of y = ${rate}x + ${start}. x ranges from negative 3 to 3; y ranges from negative 20 to 20.`}
      >
        {[-20, -10, 0, 10, 20].map((y) => (
          <g key={y}>
            <path d={`M55 ${155 - y * 6}H445`} stroke="#d1d5db" />
            <text x="35" y={160 - y * 6} textAnchor="end" fill="currentColor">
              {y}
            </text>
          </g>
        ))}
        {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
          <g key={x}>
            <path d={`M${250 + x * 60} 30V280`} stroke="#d1d5db" />
            <text
              x={250 + x * 60}
              y="304"
              textAnchor="middle"
              fill="currentColor"
            >
              {x}
            </text>
          </g>
        ))}
        <path
          d="M55 155H445M250 30V280"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d={`M70 ${155 - (-3 * rate + start) * 6}L430 ${155 - (3 * rate + start) * 6}`}
          stroke="currentColor"
          strokeWidth="3"
        />
        <text x="468" y="160" fill="currentColor">
          x
        </text>
        <text x="260" y="24" fill="currentColor">
          y
        </text>
      </svg>
      <ReadAloudBtn
        label="Read graph"
        text={`Graph of y equals ${rate} times x plus ${start}. ${[-3, -2, -1, 0, 1, 2, 3].map((x) => `At x ${x}, y is ${rate * x + start}.`).join(" ")}`}
      />
      <button
        className={buttonClass}
        disabled={trials.length === 6}
        onClick={() => setTrials((t) => [...t, { rate, start }])}
      >
        Record trial
      </button>{" "}
      <button className={buttonClass} onClick={() => setTrials([])}>
        Clear trials
      </button>
      {trials.length > 0 && (
        <Cave7Visual
          realm="pattern"
          visual={{
            kind: "table",
            title: "Your recorded trials",
            headers: ["Trial", "Rate m", "Starting value b", "y when x = 2"],
            rows: trials.map((t, i) => [
              String(i + 1),
              String(t.rate),
              String(t.start),
              String(2 * t.rate + t.start),
            ]),
          }}
        />
      )}
      <label className="block">
        My conjecture
        <textarea
          className="mt-1 block w-full rounded-lg border p-3"
          aria-label="My conjecture"
          placeholder="When I change… the line…"
        />
      </label>
      <ReadAloudBtn text="My conjecture. When I change a value, how does the line change? Use your recorded trials as evidence." />
    </div>
  );
}

function CoinLab() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [last, setLast] = useState<string[]>([]);
  const names = ["HH", "HT", "TH", "TT"],
    total = counts.reduce((a, b) => a + b, 0),
    successes = counts[1] + counts[2];
  function run(n: number) {
    const batch = tossTwoCoins(n);
    setCounts((c) => c.map((v, i) => v + batch.counts[i]));
    setLast(batch.recent);
  }
  const instruction =
    "Toss two fair coins independently. H means heads; T means tails. Predict the chance of exactly one head, then compare your actual results. Each trial records both coins in order.";
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p>{instruction}</p>
        <ReadAloudBtn text={instruction} />
      </div>
      <div className="flex flex-wrap gap-3">
        {[1, 10, 100].map((n) => (
          <button className={buttonClass} key={n} onClick={() => run(n)}>
            Run {n} {n === 1 ? "trial" : "trials"}
          </button>
        ))}
        <button
          className={buttonClass}
          onClick={() => {
            setCounts([0, 0, 0, 0]);
            setLast([]);
          }}
        >
          Reset experiment
        </button>
      </div>
      <Cave7Visual
        realm="chance"
        visual={{
          kind: "table",
          title: "Actual simulated results",
          headers: ["Outcome", "Frequency"],
          rows: names.map((name, i) => [name, String(counts[i])]),
        }}
      />
      {total > 0 && (
        <>
          <p>
            Exactly one head: {successes}/{total} ={" "}
            {(successes / total).toFixed(3)}. The theoretical probability is
            1/2.
          </p>
          <p>Most recent trials: {last.join(", ")}.</p>
          <ReadAloudBtn
            text={`Exactly one head occurred ${successes} times in ${total} trials. Experimental probability ${(successes / total).toFixed(3)}. The theoretical probability is one half. Most recent trials: ${last.join(", ")}.`}
          />
        </>
      )}
      <p>
        More trials often bring the estimate closer to 1/2, but do not guarantee
        an exact match.
      </p>
      <ReadAloudBtn text="More trials often bring the estimate closer to one half, but do not guarantee an exact match." />
    </div>
  );
}

function SamplingLab() {
  const [size, setSize] = useState(10);
  const [runs, setRuns] = useState<{ size: number; cycling: number }[]>([]);
  function sample() {
    const cycling = sampleCyclists(size);
    setRuns((r) => [...r, { size, cycling }].slice(-12));
  }
  const instruction =
    "Investigate a fictional school of 100 students: 40 cycle. Draw random samples without selecting anyone twice within a sample. Everyone returns to the population before the next sample. Compare repeated samples of 10 and 50.";
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p>{instruction}</p>
        <ReadAloudBtn text={instruction} />
      </div>
      <label>
        Sample size{" "}
        <select
          className="ml-3 rounded-lg border p-2"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          <option value={10}>10 students</option>
          <option value={50}>50 students</option>
        </select>
      </label>{" "}
      <button className={buttonClass} onClick={sample}>
        Draw random sample
      </button>{" "}
      <button className={buttonClass} onClick={() => setRuns([])}>
        Clear records
      </button>
      <ReadAloudBtn
        text={`Sample size: ${size} students. Draw random sample or clear records.`}
      />
      {runs.length > 0 && (
        <Cave7Visual
          realm="statistics"
          visual={{
            kind: "table",
            title: "Your latest twelve samples",
            headers: ["Sample", "Size", "Cyclists", "Estimated percent"],
            rows: runs.map((r, i) => [
              String(i + 1),
              String(r.size),
              String(r.cycling),
              `${(100 * r.cycling) / r.size}%`,
            ]),
          }}
        />
      )}
      <label className="block">
        My finding
        <textarea
          className="mt-1 block w-full rounded-lg border p-3"
          placeholder="My samples suggest… The evidence is… One limitation is…"
        />
      </label>
      <ReadAloudBtn text="My finding. Describe the variation in your samples, support your conclusion with numbers, and state one limitation. This fictional simulation does not tell us how real students travel." />
      <p className="text-sm">
        Exploration notes stay on this screen and are not submitted or graded.
      </p>
    </div>
  );
}
