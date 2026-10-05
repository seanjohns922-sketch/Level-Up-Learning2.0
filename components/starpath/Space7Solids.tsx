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
