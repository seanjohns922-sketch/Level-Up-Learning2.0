// Level 7 Space Weeks 9–10: drawn shapes with standard markings, sorter flowcharts students can
// build, and the quadrilateral family tree. Tick marks show equal sides, matching arcs show equal
// angles, a small square is a right angle and arrowheads show parallel sides.
import {shapeFacts,SORTER7_QUESTIONS,FAMILY7_SLOTS,type Sorter7Node,type Sorter7Question,type Sorter7Shape} from '@/lib/level7-answer';

const STROKE = '#5b3a8c', FILL = '#e6dcf7', MARK = '#3b2a57';

/** Groups equal values; returns a mark count (1, 2, 3 …) per index, 0 when unmatched. */
function groups(values: number[], tol: (a: number, b: number) => boolean) {
  const mark = values.map(() => 0); let next = 1;
  values.forEach((v, i) => { if (mark[i]) return; const same = values.map((w, j) => j >= i && !mark[j] && tol(v, w) ? j : -1).filter(j => j >= 0); if (same.length > 1) { same.forEach(j => { mark[j] = next; }); next++; } });
  return mark;
}

export function ShapeCard({shape, size, caption}: {shape: Sorter7Shape; size?: number; caption?: React.ReactNode}) {
  const f = shapeFacts(shape.points), ps = shape.points, n = ps.length;
  const minX = Math.min(...ps.map(p => p.x)), maxX = Math.max(...ps.map(p => p.x)), minY = Math.min(...ps.map(p => p.y)), maxY = Math.max(...ps.map(p => p.y));
  const W = 160, H = 130, pad = shape.show === 'angles' ? 26 : 18, k = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1));
  const ox = (W - (maxX - minX) * k) / 2, oy = (H - (maxY - minY) * k) / 2;
  const pt = ps.map(p => ({x: ox + (p.x - minX) * k, y: oy + (maxY - p.y) * k}));
  const cx = pt.reduce((s, p) => s + p.x, 0) / n, cy = pt.reduce((s, p) => s + p.y, 0) / n;
  const unit = (x: number, y: number) => { const l = Math.hypot(x, y) || 1; return {x: x / l, y: y / l}; };
  const sideMarks = shape.show === 'angles' ? ps.map(() => 0) : groups(f.sides, (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, a, b));
  const angleMarks = shape.show === 'all' ? groups(f.angles.map(a => Math.abs(a - 90) < 1e-4 ? -1 : a), (a, b) => a > 0 && Math.abs(a - b) < 1e-4) : ps.map(() => 0);
  const parallel = n === 4 && shape.show === 'all' ? (() => { const d = pt.map((p, i) => ({x: pt[(i + 1) % n].x - p.x, y: pt[(i + 1) % n].y - p.y})), par = (i: number, j: number) => Math.abs(d[i].x * d[j].y - d[i].y * d[j].x) <= 1e-6 * Math.hypot(d[i].x, d[i].y) * Math.hypot(d[j].x, d[j].y); const m = [0, 0, 0, 0]; if (par(0, 2)) { m[0] = 1; m[2] = 1; } if (par(1, 3)) { m[1] = 2; m[3] = 2; } return m; })() : [0, 0, 0, 0];
  return <figure className="m-0 flex min-w-0 flex-col items-center rounded-xl border border-violet-200 bg-white p-1" style={{width: size ?? '100%'}}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Shape ${shape.id}`} className="w-full">
      <text x="8" y="18" fontSize="16" fontWeight="900" fill={MARK}>{shape.id}</text>
      <polygon points={pt.map(p => `${p.x},${p.y}`).join(' ')} fill={FILL} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
      {pt.map((p, i) => {
        const q = pt[(i + 1) % n], len = Math.hypot(q.x - p.x, q.y - p.y), split = parallel[i] ? 0.12 * len : 0, mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, t = unit(q.x - p.x, q.y - p.y), nn = {x: -t.y, y: t.x};
        const ticks = Array.from({length: sideMarks[i]}, (_, j) => { const off = (j - (sideMarks[i] - 1) / 2) * 5 + split; return <path key={j} d={`M${mx + t.x * off - nn.x * 6} ${my + t.y * off - nn.y * 6}L${mx + t.x * off + nn.x * 6} ${my + t.y * off + nn.y * 6}`} stroke={MARK} strokeWidth="2" />; });
        const arrows = Array.from({length: parallel[i]}, (_, j) => { const ax = mx - t.x * (split + j * 6 - 3), ay = my - t.y * (split + j * 6 - 3); return <path key={`p${j}`} d={`M${ax - t.x * 6 - nn.x * 4} ${ay - t.y * 6 - nn.y * 4}L${ax} ${ay}L${ax - t.x * 6 + nn.x * 4} ${ay - t.y * 6 + nn.y * 4}`} fill="none" stroke={MARK} strokeWidth="1.8" />; });
        return <g key={`s${i}`}>{ticks}{arrows}</g>;
      })}
      {pt.map((v, i) => {
        const a = unit(pt[(i + n - 1) % n].x - v.x, pt[(i + n - 1) % n].y - v.y), b = unit(pt[(i + 1) % n].x - v.x, pt[(i + 1) % n].y - v.y);
        let bis = unit(a.x + b.x, a.y + b.y); if (f.angles[i] > 180) bis = {x: -bis.x, y: -bis.y};
        if (Math.abs(bis.x) < 1e-9 && Math.abs(bis.y) < 1e-9) bis = unit(cx - v.x, cy - v.y);
        if (shape.show === 'angles') { const dist = Math.min(30, 9 / Math.max(0.2, Math.sin((f.angles[i] * Math.PI) / 360))); return <text key={`a${i}`} x={v.x + bis.x * dist} y={v.y + bis.y * dist + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={MARK} paintOrder="stroke" stroke="white" strokeWidth="3">{Math.round(f.angles[i])}°</text>; }
        if (Math.abs(f.angles[i] - 90) < 1e-4 && shape.show === 'all') return <path key={`a${i}`} d={`M${v.x + a.x * 9} ${v.y + a.y * 9}L${v.x + (a.x + b.x) * 9} ${v.y + (a.y + b.y) * 9}L${v.x + b.x * 9} ${v.y + b.y * 9}`} fill="none" stroke={MARK} strokeWidth="1.6" />;
        if (!angleMarks[i] || f.angles[i] > 180) return null;
        const sweep = a.x * b.y - a.y * b.x > 0 ? 1 : 0;
        return <g key={`a${i}`}>{Array.from({length: angleMarks[i]}, (_, j) => { const r = 10 + j * 4; return <path key={j} d={`M${v.x + a.x * r} ${v.y + a.y * r}A${r} ${r} 0 0 ${sweep} ${v.x + b.x * r} ${v.y + b.y * r}`} fill="none" stroke={MARK} strokeWidth="1.5" />; })}</g>;
      })}
    </svg>
    {caption}
  </figure>;
}

export const questionText = (v: string) => SORTER7_QUESTIONS[v as Sorter7Question] ?? v;

/** A sorter flowchart. With onSlot, blank or editable boxes are buttons. */
export function SorterFlow({node, values, editable, active, onSlot}: {node: Sorter7Node; values: string[]; editable?: boolean[]; active?: number | null; onSlot?: (slot: number) => void}) {
  const isQ = !!(node.yes && node.no), v = values[node.slot], can = !!onSlot && (editable?.[node.slot] ?? false);
  const label = v ? (isQ ? questionText(v) : v) : isQ ? 'Choose a question' : 'Choose a group';
  const cls = `min-h-11 w-full rounded-xl border-2 px-2 py-1.5 text-center text-sm font-semibold leading-snug ${isQ ? 'bg-violet-50' : 'rounded-full bg-white'} ${!v ? 'border-dashed text-violet-700' : ''} ${active === node.slot ? 'ring-4 ring-amber-300' : ''}`;
  const box = can
    ? <button type="button" data-slot={node.slot} onClick={() => onSlot!(node.slot)} className={`${cls} border-violet-500 hover:bg-amber-50`} aria-pressed={active === node.slot}>{label}</button>
    : <div className={`${cls} border-violet-300`}>{label}</div>;
  if (!isQ) return box;
  return <div className="flex w-full flex-col items-center gap-1">
    {box}
    <div className="grid w-full grid-cols-2 gap-2">
      {(['yes', 'no'] as const).map(side => <div key={side} className="flex flex-col items-center gap-1"><span className="text-xs font-bold">{side === 'yes' ? 'Yes ↓' : 'No ↓'}</span><SorterFlow node={node[side]!} values={values} editable={editable} active={active} onSlot={onSlot} /></div>)}
    </div>
  </div>;
}

const TREE_POS = [{x: 90, y: 112}, {x: 260, y: 112}, {x: 430, y: 112}, {x: 175, y: 196}, {x: 345, y: 196}, {x: 260, y: 280}];
const TREE_EDGES: [number, number][] = [[-1, 0], [-1, 1], [-1, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]];
/** The quadrilateral family tree; each family has every property of the families above it. */
export function FamilyTree({values, active, onSlot, editable}: {values: string[]; active?: number | null; onSlot?: (slot: number) => void; editable?: boolean[]}) {
  const at = (i: number) => i < 0 ? {x: 260, y: 30} : TREE_POS[i];
  return <svg viewBox="0 0 520 310" className="mx-auto w-full max-w-[520px]" role={onSlot ? 'group' : 'img'} aria-label={`Quadrilateral family tree: ${values.map((v, i) => v || `blank box ${i + 1}`).join(', ')}`}>
    {TREE_EDGES.map(([a, b]) => <path key={`${a}-${b}`} d={`M${at(a).x} ${at(a).y + 18}L${at(b).x} ${at(b).y - 18}`} stroke="#9b86bd" strokeWidth="2.5" />)}
    {[-1, ...TREE_POS.map((_, i) => i)].map(i => {
      const p = at(i), v = i < 0 ? 'Quadrilateral' : values[i], can = i >= 0 && !!onSlot && (editable?.[i] ?? true);
      return <g key={i} data-slot={can ? i : undefined} onClick={can ? () => onSlot!(i) : undefined} className={can ? 'cursor-pointer' : ''} role={can ? 'button' : undefined} aria-label={can ? `Box ${i + 1}: ${v || 'blank'}` : undefined} tabIndex={can ? 0 : undefined} onKeyDown={can ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSlot!(i); } } : undefined}>
        <rect x={p.x - 70} y={p.y - 18} width="140" height="36" rx="12" fill={i < 0 ? '#5b3a8c' : v ? '#f3edfc' : 'white'} stroke={active === i ? '#f59e0b' : '#7c5cb0'} strokeWidth={active === i ? 4 : 2} strokeDasharray={!v && i >= 0 ? '6 4' : undefined} />
        <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={i < 0 ? 'white' : v ? '#2c1f4a' : '#7c5cb0'}>{v || '?'}</text>
      </g>;
    })}
  </svg>;
}
export const FAMILY_TREE_NAMES = FAMILY7_SLOTS;
