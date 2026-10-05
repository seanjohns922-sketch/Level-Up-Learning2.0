// Level 7 Space transformations: a lettered triangle on the −6 to 6 grid. A lopsided shape shows
// what a turn or a flip does, which a single dot cannot. The worked image is drawn dashed with
// a guide from each corner to its image, and a turn arc for rotations.
import type {Level7Plane} from '@/lib/level7-answer';
type P = {x: number; y: number};

const SHAPE = '#7045a3', IMAGE = '#087f9c', MIRROR = '#c2410c', PLACED = '#b45309';
const px = (x: number) => 200 + x * 26, py = (y: number) => 200 - y * 26;
const prime = (l: string) => `${l}′`;

/** Places a vertex label outside the shape, away from its centroid. */
function labelAt(ps: P[], i: number) {
  const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length, cy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
  const dx = ps[i].x - cx, dy = ps[i].y - cy, l = Math.hypot(dx, dy) || 1;
  return {x: px(ps[i].x) + (dx / l) * 15, y: py(ps[i].y) - (dy / l) * 15 + 5};
}

function Shape({ps, labels, colour, dash}: {ps: P[]; labels: string[]; colour: string; dash?: string}) {
  return <g>
    {ps.length > 1 && <polygon points={ps.map(p => `${px(p.x)},${py(p.y)}`).join(' ')} fill={colour + '22'} stroke={colour} strokeWidth="3" strokeDasharray={dash} strokeLinejoin="round" />}
    {ps.map((p, i) => <circle key={i} cx={px(p.x)} cy={py(p.y)} r="4.5" fill={colour} />)}
    {ps.map((_, i) => { const at = labelAt(ps, i); return <text key={`l${i}`} x={at.x} y={at.y} textAnchor="middle" fontSize="15" fontWeight="800" fill={colour} paintOrder="stroke" stroke="white" strokeWidth="4">{labels[i]}</text>; })}
  </g>;
}

export function LessonPlane({spec, reveal = false, placed, onPick, disabled = false}: {spec: Level7Plane; reveal?: boolean; placed?: P[]; onPick?: (p: P) => void; disabled?: boolean}) {
  const image = reveal ? spec.solution ?? spec.image : spec.image;
  const t = reveal ? spec.turn : undefined;
  let arc: React.ReactNode = null;
  if (t && image) {
    // Turn arc from the first corner to its image, about the centre, with an arrowhead.
    const from = spec.shape[0], c = t.centre, r = Math.hypot(from.x - c.x, from.y - c.y) * 26;
    const a0 = Math.atan2(-(from.y - c.y), from.x - c.x), sweep = (t.clockwise ? 1 : -1) * (t.degrees * Math.PI) / 180;
    const steps = 24, pts = Array.from({length: steps + 1}, (_, i) => { const a = a0 + (sweep * i) / steps; return [px(c.x) + r * Math.cos(a), py(c.y) + r * Math.sin(a)]; });
    const [ex, ey] = pts[steps], [qx, qy] = pts[steps - 2], ang = Math.atan2(ey - qy, ex - qx);
    arc = <g stroke={MIRROR} strokeWidth="2.5" fill="none">
      <polyline points={pts.map(p => p.join(',')).join(' ')} strokeDasharray="6 4" />
      <path d={`M${ex} ${ey} L${ex - 11 * Math.cos(ang - 0.45)} ${ey - 11 * Math.sin(ang - 0.45)} M${ex} ${ey} L${ex - 11 * Math.cos(ang + 0.45)} ${ey - 11 * Math.sin(ang + 0.45)}`} />
    </g>;
  }
  const label = `Coordinate grid from minus 6 to 6. Triangle ${spec.labels.join('')}.`;
  return <svg viewBox="0 0 400 400" role={onPick ? 'group' : 'img'} aria-label={label} className="mx-auto w-full max-w-[380px] select-none">
    {Array.from({length: 13}, (_, i) => i - 6).map(n => <g key={n}>
      <path d={`M${px(n)} ${py(6)}V${py(-6)}M${px(-6)} ${py(n)}H${px(6)}`} stroke={n === 0 ? '#4b3a5e' : '#ddd5e7'} strokeWidth={n === 0 ? 2 : 1} />
      {n !== 0 && <><text x={px(n)} y={py(0) + 15} textAnchor="middle" fontSize="11" fill="#4b3a5e">{n}</text><text x={px(0) - 6} y={py(n) + 4} textAnchor="end" fontSize="11" fill="#4b3a5e">{n}</text></>}
    </g>)}
    <text x={px(0) - 6} y={py(0) + 15} textAnchor="end" fontSize="11" fill="#4b3a5e">0</text>
    <text x={px(6) + 8} y={py(0) + 4} fontSize="14" fontStyle="italic" fill="#4b3a5e">x</text><text x={px(0) + 6} y={py(6) - 6} fontSize="14" fontStyle="italic" fill="#4b3a5e">y</text>
    {spec.mirror && <g><path d={spec.mirror === 'x' ? `M${px(-6)} ${py(0)}H${px(6)}` : `M${px(0)} ${py(6)}V${py(-6)}`} stroke={MIRROR} strokeWidth="4" opacity="0.8" /><text x={spec.mirror === 'x' ? px(-6) : px(0) + 8} y={spec.mirror === 'x' ? py(0) - 8 : py(-6) + 4} fontSize="13" fontWeight="700" fill={MIRROR}>mirror</text></g>}
    {spec.mirrorX?.map(m => <g key={m}><path d={`M${px(m)} ${py(6)}V${py(-6)}`} stroke={MIRROR} strokeWidth="3" strokeDasharray="7 5" /><text x={px(m) + 4} y={py(6) - 6} fontSize="13" fontWeight="700" fill={MIRROR}>x = {m}</text></g>)}
    {spec.centre && <g><circle cx={px(spec.centre.x)} cy={py(spec.centre.y)} r="5.5" fill={MIRROR} /><text x={px(spec.centre.x) + 9} y={py(spec.centre.y) + 16} fontSize="14" fontWeight="800" fill={MIRROR} paintOrder="stroke" stroke="white" strokeWidth="4">C</text></g>}
    {reveal && image && !t && spec.shape.map((p, i) => <path key={`g${i}`} d={`M${px(p.x)} ${py(p.y)}L${px(image[i].x)} ${py(image[i].y)}`} stroke="#8a7a9c" strokeWidth="1.5" strokeDasharray="2 4" />)}
    {arc}
    <Shape ps={spec.shape} labels={spec.labels} colour={SHAPE} />
    {image && <Shape ps={image} labels={spec.labels.map(prime)} colour={IMAGE} dash="7 5" />}
    {placed && placed.length > 0 && <Shape ps={placed} labels={spec.labels.map(prime)} colour={PLACED} dash="5 4" />}
    {onPick && Array.from({length: 169}, (_, i) => ({x: (i % 13) - 6, y: Math.floor(i / 13) - 6})).map(p => {
      const on = placed?.some(q => q.x === p.x && q.y === p.y);
      return <circle key={`${p.x},${p.y}`} data-point={`${p.x},${p.y}`} cx={px(p.x)} cy={py(p.y)} r="11" fill="transparent" role="button" aria-label={`Point ${p.x}, ${p.y}`} aria-pressed={on} aria-disabled={disabled} className={disabled ? '' : 'cursor-pointer hover:fill-amber-500/20'} onClick={() => !disabled && onPick(p)} />;
    })}
  </svg>;
}

/** Plain-language description of the grid for read-aloud. */
export function lessonPlaneSpeech(spec: Level7Plane, reveal = false) {
  const at = (ps: P[], names: string[]) => ps.map((p, i) => `${names[i]} at ${p.x}, ${p.y}`).join('; ');
  const image = reveal ? spec.solution ?? spec.image : spec.image;
  return [`Triangle ${spec.labels.join('')}: ${at(spec.shape, spec.labels)}.`,
    spec.mirror ? `The mirror line is the ${spec.mirror}-axis.` : '',
    spec.mirrorX ? `Mirror lines: ${spec.mirrorX.map(m => `x = ${m}`).join(' and ')}.` : '',
    spec.centre ? `Centre C at ${spec.centre.x}, ${spec.centre.y}.` : '',
    image ? `Image: ${at(image, spec.labels.map(l => `${l} prime`))}.` : ''].filter(Boolean).join(' ');
}
