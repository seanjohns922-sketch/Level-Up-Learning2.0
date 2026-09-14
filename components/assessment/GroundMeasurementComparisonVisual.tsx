"use client";

export default function GroundMeasurementComparisonVisual({ visual }: { visual: Record<string, unknown> }) {
  const labels = visual.labels as string[];
  const values = visual.values as number[];
  const mass = visual.attribute === "mass";
  return <svg viewBox="0 0 400 210" role="img" aria-label={String(visual.description)} className="mx-auto w-full max-w-md rounded-xl bg-amber-50">
    {mass ? <>
      <path d="M200 80 L170 180 L230 180 Z" fill="#b68b38" />
      <line x1="85" y1={values[0]} x2="315" y2={values[1]} stroke="#725221" strokeWidth="7" />
      {labels.map((label, i) => <g key={label}>
        <line x1={i ? 315 : 85} y1={values[i]} x2={i ? 315 : 85} y2={values[i]+36} stroke="#725221" strokeWidth="3" />
        <path d={`M${i ? 275 : 45} ${values[i]+36} Q${i ? 315 : 85} ${values[i]+76} ${i ? 355 : 125} ${values[i]+36} Z`} fill={i ? "#8675b8" : "#329991"} />
        <text x={i ? 315 : 85} y={values[i]+24} textAnchor="middle" fontSize="18" fill="#332408">{label}</text>
      </g>)}
    </> : <>
      <line x1="85" y1="30" x2="85" y2="175" stroke="#80683b" strokeWidth="2" strokeDasharray="5 4" />
      {labels.map((label, i) => <g key={label}>
        <text x="72" y={72+i*75} textAnchor="end" fontSize="17" fill="#332408">{label}</text>
        <rect x="85" y={50+i*75} width={values[i]} height="32" rx="4" fill={i ? "#8675b8" : "#329991"} />
      </g>)}
    </>}
  </svg>;
}
