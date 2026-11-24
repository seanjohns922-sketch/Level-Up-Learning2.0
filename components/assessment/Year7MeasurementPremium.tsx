"use client";
// Level 7 Measurelands diagrams in the approved Level 8 style (24 Nov 2026): each measurement once, on the
// shape with dimension lines; the unknown is the orange chip; real materials for real objects.
import { Box, boxFit, Dim, Frame, H, INK, Lab, ORANGE_LINE, PANEL, rightMark, shade, TriPrism, useKit, W } from './Measurement8Kit';

/** Triangle or parallelogram with the perpendicular height drawn inside the shape. */
export function AreaPlan({ b, h, unit, parallel = false, unknown = false }: { b: number; h: number; unit: string; parallel?: boolean; unknown?: boolean }) {
  const k = useKit(), s = Math.min(380 / b, 270 / h), w = Math.max(b * s, 160), ht = Math.max(h * s, 120), shift = parallel ? Math.min(110, w * 0.3) : 0;
  const x = (W - w - shift) / 2, y = 370, apex = parallel ? x + shift : x + w * 0.35;
  const path = parallel ? `M${x} ${y}H${x + w}L${x + w + shift} ${y - ht}H${x + shift}Z` : `M${x} ${y}H${x + w}L${apex} ${y - ht}Z`;
  return <Frame k={k} horizontalOnly>
    <g {...shade(k)}><path d={path} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round" /></g>
    <path d={`M${apex} ${y - ht}V${y}`} stroke="#fff" strokeWidth="2.5" strokeDasharray="9 6" />
    {rightMark(apex, y - 20, 1, 1, '#fff')}
    {Lab(apex + 64, y - ht / 2, unknown ? `? ${unit}` : `${h} ${unit}`, { bg: '#fff' })}
    {Dim(x, y + 32, x + w, y + 32, `${b} ${unit}`)}
  </Frame>;
}

/** Two triangles side by side (two sails). */
export function PairTrianglesPlan({ n, unit }: { n: number[]; unit: string }) {
  const k = useKit(), big = Math.max(n[0], n[2]), tall = Math.max(n[1], n[3]), s = Math.min(250 / big, 250 / tall);
  const tri = (x: number, b: number, h: number, name: string) => {
    const w = Math.max(b * s, 110), ht = Math.max(h * s, 90), y = 360, apex = x + w * 0.4;
    return <g key={name}>
      <g {...shade(k)}><path d={`M${x} ${y}H${x + w}L${apex} ${y - ht}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round" /></g>
      <path d={`M${apex} ${y - ht}V${y}`} stroke="#fff" strokeWidth="2.5" strokeDasharray="8 6" />
      {Lab(apex + 52, y - ht / 2, `${h} ${unit}`, { bg: '#fff', size: 20 })}
      {Dim(x, y + 30, x + w, y + 30, `${b} ${unit}`)}
      {Lab(x + w / 2, y - ht - 30, name, { size: 20 })}
    </g>;
  };
  return <Frame k={k} horizontalOnly>{tri(70, n[0], n[1], 'Sail A')}{tri(410, n[2], n[3], 'Sail B')}</Frame>;
}

/** Rectangular prism; a tank holds water. The unknown length shows as "?". */
export function RectPrismPlan7({ n, unit, water = false, unknown = false }: { n: number[]; unit: string; water?: boolean; unknown?: boolean }) {
  const k = useKit(), [l, w, h] = n, f = boxFit(l, w, h), x = (W - f.w - f.d * 0.62) / 2 - 10, y = 372;
  return <Frame k={k}>{Box(k, x, y, f.w, f.h, f.d, water ? { water: 0.72 } : {})}{Dim(x, y + 30, x + f.w, y + 30, unknown ? `? ${unit}` : `${l} ${unit}`)}{Dim(x - 32, y, x - 32, y - f.h, `${h} ${unit}`)}{Dim(x + f.w + 26, y + 12, x + f.w + f.d * 0.62 + 26, y - f.d * 0.42 + 12, `${w} ${unit}`)}</Frame>;
}

export function TriPrismPlan7({ n, unit }: { n: number[]; unit: string }) {
  const k = useKit();
  return <Frame k={k}>{TriPrism(k, `${n[0]} ${unit}`, `${n[1]} ${unit}`, `${n[2]} ${unit}`, n[0], n[1], n[2])}</Frame>;
}

/** A circle, or a wheel with a tyre and spokes. Symbolic labels (r, d) are kept. */
export function CirclePlan7({ value, unit, measure, symbolic, wheel }: { value: number; unit: string; measure: 'radius' | 'diameter'; symbolic: boolean; wheel: boolean }) {
  const k = useKit(), cx = W / 2, cy = 222, r = 168, text = symbolic ? (measure === 'radius' ? 'r' : 'd') : `${value} ${unit}`;
  return <Frame k={k}>
    {wheel ? <g>
      <g {...shade(k)}><circle cx={cx} cy={cy} r={r} fill="#2b2b33" /></g>
      <circle cx={cx} cy={cy} r={r - 26} fill="#c7ccd6" stroke="#868e9c" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <path key={i} d={`M${cx} ${cy}L${cx + Math.cos(a) * (r - 30)} ${cy + Math.sin(a) * (r - 30)}`} stroke="#868e9c" strokeWidth="2" />; })}
      <circle cx={cx} cy={cy} r="16" fill="#868e9c" />
    </g> : <g>
      <g {...shade(k)}><circle cx={cx} cy={cy} r={r} fill={k.u('violet')} stroke={INK} strokeWidth="3.5" /></g>
      <ellipse cx={cx - 52} cy={cy - 74} rx="74" ry="40" fill="#fff" opacity=".13" />
    </g>}
    <circle cx={cx} cy={cy} r="5" fill="#fff" />
    {measure === 'diameter' ? Dim(cx - r, cy, cx + r, cy, text, { bg: '#fff' }) : Dim(cx, cy, cx + r, cy, text, { bg: '#fff' })}
  </Frame>;
}

/** A regular polygon split into triangles by diagonals from one corner (the count of triangles is left to the student). */
export function PolygonSplitPlan({ sides }: { sides: number }) {
  const k = useKit(), cx = W / 2, cy = H / 2 + 6, r = 180;
  const pts = Array.from({ length: sides }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const tones = ['#c9b3f5', '#a98be8'];
  return <Frame k={k}>
    {pts.slice(1, -1).map((p, i) => <path key={i} d={`M${pts[0].join(' ')}L${p.join(' ')}L${pts[i + 2].join(' ')}Z`} fill={tones[i % 2]} stroke={INK} strokeWidth="2" />)}
    <path d={`M${pts.map((p) => p.join(' ')).join('L')}Z`} fill="none" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
    <circle cx={pts[0][0]} cy={pts[0][1]} r="8" fill={ORANGE_LINE} />
    {Lab(cx, H - 26, `${sides} sides`, { bg: PANEL, size: 20 })}
  </Frame>;
}

/** Parallel lines drawn as railway tracks or timber rails/shelves; a road or brace crosses them. */
export function TrackLines({ y, road }: { y: number[]; road: boolean }) {
  return <g>
    {y.map((yy) => <g key={yy}>
      {road ? <g>
        {Array.from({ length: 22 }, (_, i) => <rect key={i} x={70 + i * 24} y={yy - 14} width="10" height="28" rx="2" fill="#8a6440" />)}
        <path d={`M60 ${yy - 8}H580M60 ${yy + 8}H580`} stroke="#6b7280" strokeWidth="4.5" />
      </g> : <rect x={60} y={yy - 9} width={520} height={18} rx="3" fill="#c99a63" stroke="#7a4f27" strokeWidth="2" />}
    </g>)}
  </g>;
}
