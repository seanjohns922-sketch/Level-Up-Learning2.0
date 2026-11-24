'use client';
// Level 7 Starpath cube nets in the premium style: shaded card faces, dashed fold lines between faces,
// solid cut edges around the outside, a soft shadow, and the marked face in orange. Level 5 keeps its own net.
import type { Cell } from '@/data/activities/starpath/level5/nets';

const S = 56, INK = '#3c2a63';
export function PremiumCubeNet({ cells, marked }: { cells: Cell[]; marked?: number }) {
  const minR = Math.min(...cells.map((c) => c.r)), minC = Math.min(...cells.map((c) => c.c));
  const w = (Math.max(...cells.map((c) => c.c)) - minC + 1) * S, h = (Math.max(...cells.map((c) => c.r)) - minR + 1) * S;
  const has = (r: number, c: number) => cells.some((x) => x.r === r && x.c === c);
  const edges: { d: string; fold: boolean }[] = [];
  for (const c of cells) {
    const x = (c.c - minC) * S, y = (c.r - minR) * S;
    // Each side is a fold if another face shares it; draw shared sides once (right and bottom).
    edges.push({ d: `M${x} ${y}H${x + S}`, fold: has(c.r - 1, c.c) }, { d: `M${x} ${y + S}H${x + S}`, fold: has(c.r + 1, c.c) },
      { d: `M${x} ${y}V${y + S}`, fold: has(c.r, c.c - 1) }, { d: `M${x + S} ${y}V${y + S}`, fold: has(c.r, c.c + 1) });
  }
  return <svg viewBox={`-10 -10 ${w + 20} ${h + 24}`} role="img" aria-hidden="true" style={{ width: '100%', maxWidth: Math.min(420, w * 1.6), maxHeight: 320, display: 'block', margin: 'auto' }}>
    <defs>
      <linearGradient id="s7-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9c8fa" /><stop offset="1" stopColor="#a98be8" /></linearGradient>
      <linearGradient id="s7-marked" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd28a" /><stop offset="1" stopColor="#ffb12e" /></linearGradient>
      <filter id="s7-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2a1a4a" floodOpacity=".28" /></filter>
    </defs>
    <g filter="url(#s7-shadow)">{cells.map((c, i) => <rect key={`${c.r}-${c.c}`} x={(c.c - minC) * S} y={(c.r - minR) * S} width={S} height={S} fill={i === marked ? 'url(#s7-marked)' : 'url(#s7-face)'} />)}</g>
    {edges.filter((e) => e.fold).map((e, i) => <path key={`f${i}`} d={e.d} stroke="#fff" strokeWidth="2" strokeDasharray="6 5" opacity=".9" />)}
    {edges.filter((e) => !e.fold).map((e, i) => <path key={`c${i}`} d={e.d} stroke={INK} strokeWidth="3" strokeLinecap="round" />)}
    {cells.map((c, i) => { const x = (c.c - minC) * S + S / 2, y = (c.r - minR) * S + S / 2; return <g key={`l${i}`}><circle cx={x} cy={y} r="15" fill="#fff" opacity=".92" /><text x={x} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>{String.fromCharCode(65 + i)}</text></g>; })}
  </svg>;
}
