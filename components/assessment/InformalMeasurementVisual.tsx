"use client";

type UnitRow = { label: string; units: number };
export default function InformalMeasurementVisual({ visual }: { visual: Record<string, unknown> }) {
  const rows = visual.rows as UnitRow[];
  return <svg viewBox={`0 0 440 ${rows.length * 85 + 20}`} role="img"
    aria-label={rows.map(row => `${row.label}. Equal blocks touching end to end: ${Array(row.units).fill("block").join("; ")}.`).join(" ")}
    className="mx-auto w-full max-w-lg rounded-xl bg-amber-50">
    {rows.map((row, index) => <g key={row.label} transform={`translate(0 ${index*85})`}>
      <text x="15" y="25" fontSize="17" fill="#332408">{row.label}</text>
      <rect x="110" y="12" width={row.units*32} height="19" rx="3" fill="#8664a2" />
      {Array.from({length:row.units}, (_, unit) => <rect key={unit} x={110+unit*32} y="38" width="32" height="27" fill={unit%2 ? "#b2e5de" : "#79c5b9"} stroke="#255e54" />)}
    </g>)}
  </svg>;
}
