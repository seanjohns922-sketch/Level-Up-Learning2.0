// Level 7 Space drawings that the assessment renderer does not cover: a right prism,
// flat nets made of polygons, and a footprint grid. Drawn to suggest shape, not to measure.
export type Space7SolidNet = 'squarePyramid' | 'triangularPrism' | 'rectangularPrism' | 'triangularPyramid' | 'pentagonalPrism';

const STROKE = '#67419a', FILL = '#ddd0f6', BACK = '#9b86bd';
const poly = (pts: [number, number][]) => pts.map(p => p.join(',')).join(' ');
const regularPoints = (n: number, cx: number, cy: number, r: number, start: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => [cx + r * Math.cos(start + (2 * Math.PI * i) / n), cy + r * Math.sin(start + (2 * Math.PI * i) / n)]);

/** A right prism with regular n-sided ends; hidden back edges are dashed and every vertex is dotted. */
export function PrismDrawing({ sides }: { sides: number }) {
  const front = regularPoints(sides, 115, 135, 62, Math.PI / 2 + Math.PI / sides);
  const back = front.map(([x, y]) => [x + 80, y - 55] as [number, number]);
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label={`A right prism with ${sides}-sided ends`}>
      <polygon points={poly(back)} fill="none" stroke={BACK} strokeWidth="2" strokeDasharray="6 5" />
      {front.map((p, i) => <line key={i} x1={p[0]} y1={p[1]} x2={back[i][0]} y2={back[i][1]} stroke={STROKE} strokeWidth="2.5" />)}
      <polygon points={poly(front)} fill={FILL} fillOpacity="0.85" stroke={STROKE} strokeWidth="3" />
      {[...front, ...back].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={STROKE} />)}
    </svg>
  );
}

/** Flat nets for the pyramids and prisms named in Week 1. */
export function SolidNetDrawing({ net }: { net: Space7SolidNet }) {
  const shapes: [number, number][][] = [];
  if (net === 'squarePyramid') {
    shapes.push([[120, 80], [180, 80], [180, 140], [120, 140]], [[120, 80], [180, 80], [150, 28]], [[180, 80], [180, 140], [232, 110]], [[120, 140], [180, 140], [150, 192]], [[120, 80], [120, 140], [68, 110]]);
  } else if (net === 'triangularPyramid') {
    const a: [number, number] = [70, 190], b: [number, number] = [230, 190], c: [number, number] = [150, 51];
    const mid = (p: [number, number], q: [number, number]): [number, number] => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
    shapes.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
  } else if (net === 'triangularPrism') {
    for (let i = 0; i < 3; i++) shapes.push([[60 + 60 * i, 70], [120 + 60 * i, 70], [120 + 60 * i, 150], [60 + 60 * i, 150]]);
    shapes.push([[120, 70], [180, 70], [150, 18]], [[120, 150], [180, 150], [150, 202]]);
  } else if (net === 'rectangularPrism') {
    const widths = [55, 35, 55, 35]; let x = 40;
    widths.forEach(w => { shapes.push([[x, 85], [x + w, 85], [x + w, 135], [x, 135]]); x += w; });
    shapes.push([[40, 50], [95, 50], [95, 85], [40, 85]], [[40, 135], [95, 135], [95, 170], [40, 170]]);
  } else {
    for (let i = 0; i < 5; i++) shapes.push([[50 + 40 * i, 75], [90 + 40 * i, 75], [90 + 40 * i, 145], [50 + 40 * i, 145]]);
    const r = 40 / (2 * Math.sin(Math.PI / 5)), apothem = r * Math.cos(Math.PI / 5);
    shapes.push(regularPoints(5, 150, 75 - apothem, r, Math.PI / 2 + Math.PI / 5).map(([px, py]) => [px, 2 * (75 - apothem) - py] as [number, number]));
    shapes.push(regularPoints(5, 150, 145 + apothem, r, -Math.PI / 2 + Math.PI / 5).map(([px, py]) => [px, 2 * (145 + apothem) - py] as [number, number]));
  }
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label="Flat net of a solid">
      {shapes.map((s, i) => <polygon key={i} points={poly(s)} fill={FILL} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />)}
    </svg>
  );
}

/** Top view of a model: shaded squares are occupied positions; stack heights are not shown. */
export function FootprintDrawing({ cols, rows, occupied }: { cols: number; rows: number; occupied: number[] }) {
  const size = 44, w = cols * size, h = rows * size;
  return (
    <svg viewBox={`0 0 ${w + 20} ${h + 20}`} role="img" aria-label={`Footprint grid with ${occupied.length} shaded positions`}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <rect key={i} x={10 + (i % cols) * size} y={10 + Math.floor(i / cols) * size} width={size} height={size} fill={occupied.includes(i) ? '#b79adc' : 'white'} stroke={STROKE} strokeWidth="2" />
      ))}
    </svg>
  );
}

type LessonPoint = { x: number; y: number };
/** Lesson polygon: angle arcs (a square for 90°) with labels inside the corners, side labels outside the edges, framed tightly. */
export function LessonPolygon({ spec }: { spec: { points: LessonPoint[]; sideLabels?: string[]; angles?: string[]; caption: string } }) {
  const pad = 40, ps = spec.points;
  const minX = Math.min(...ps.map(p => p.x)), maxX = Math.max(...ps.map(p => p.x)), minY = Math.min(...ps.map(p => p.y)), maxY = Math.max(...ps.map(p => p.y));
  const scale = Math.min(260 / (maxX - minX || 1), 180 / (maxY - minY || 1));
  // Maths coordinates have y up; flip so the drawing is not upside down.
  const pts = ps.map(p => ({ x: pad + (p.x - minX) * scale, y: pad + (maxY - p.y) * scale }));
  const width = (maxX - minX) * scale + 2 * pad, height = (maxY - minY) * scale + 2 * pad;
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length, cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const unit = (x: number, y: number) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
  const text = { fontSize: 16, fontWeight: 700, fill: '#2c1f4a', paintOrder: 'stroke' as const, stroke: 'white', strokeWidth: 5, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={spec.caption} style={{ maxWidth: Math.min(width * 1.2, 420) }}>
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill={FILL} stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
      {spec.angles?.map((label, i) => {
        if (!label) return null;
        const v = pts[i], a = unit(pts[(i + pts.length - 1) % pts.length].x - v.x, pts[(i + pts.length - 1) % pts.length].y - v.y), b = unit(pts[(i + 1) % pts.length].x - v.x, pts[(i + 1) % pts.length].y - v.y);
        const theta = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y))), bis = unit(a.x + b.x, a.y + b.y);
        const right = label === '90°', r = 18, dist = Math.min(64, (r + 16) / Math.max(0.35, Math.sin(theta / 2)) * 0.62);
        const mark = right
          ? <path d={`M${v.x + a.x * 13} ${v.y + a.y * 13} L${v.x + (a.x + b.x) * 13} ${v.y + (a.y + b.y) * 13} L${v.x + b.x * 13} ${v.y + b.y * 13}`} fill="none" stroke={STROKE} strokeWidth="2" />
          : <path d={`M${v.x + a.x * r} ${v.y + a.y * r} A${r} ${r} 0 0 ${a.x * b.y - a.y * b.x > 0 ? 1 : 0} ${v.x + b.x * r} ${v.y + b.y * r}`} fill="none" stroke={STROKE} strokeWidth="2" />;
        return <g key={`a${i}`}>{mark}<text x={v.x + bis.x * dist} y={v.y + bis.y * dist + 5} textAnchor="middle" {...text}>{label}</text></g>;
      })}
      {spec.sideLabels?.map((label, i) => {
        if (!label) return null;
        const p = pts[i], q = pts[(i + 1) % pts.length], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
        let n = unit(-(q.y - p.y), q.x - p.x);
        if ((mx + n.x - cx) * n.x + (my + n.y - cy) * n.y < (mx - cx) * n.x + (my - cy) * n.y) n = { x: -n.x, y: -n.y };
        return <text key={`s${i}`} x={mx + n.x * 20} y={my + n.y * 20 + 5} textAnchor="middle" {...text}>{label}</text>;
      })}
    </svg>
  );
}
