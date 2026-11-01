import type { Measurement8Visual } from '@/data/assessments/revisions/year8MeasurementFiveForms';
import { Box, boxFit, Dim, Facts, Frame, H, INK, Lab, matFill, matStroke, ORANGE_LINE, PANEL, rightMark, shade, TriPrism, useKit, W } from '@/components/assessment/Measurement8Kit';

// Controlled React SVG: every number comes from the question's supplied quantities.
const after = (label: string | undefined) => label?.split(': ').slice(1).join(': ') ?? '';
const find = (labels: string[], name: string) => after(labels.find(l => l.startsWith(`${name}:`)));
const value = (text: string) => Number.parseFloat(text.replaceAll(',', '').match(/\d[\d.]*/)?.[0] ?? '') || 0;
const triple = (text: string) => (text.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);

export default function MeasurementDiagram({ visual: v }: { visual: Measurement8Visual }) {
  const k = useKit(), n = v.values, labels = v.labels ?? [];
  const mat = v.material, fill = matFill(k, mat), edge = matStroke(mat);
  let content, facts: string[] = [];
  switch (v.variant) {
    case 'grid': {
      // Cells nearest the middle are whole; the next ring is half covered, so the outline reads as one region.
      const [full, partial] = n, total = full + partial, cols = Math.ceil(Math.sqrt(total * 1.5)) + 1, rows = Math.ceil(total / cols) + 2, size = Math.min(360 / rows, 400 / cols), ox = 70, oy = (H - rows * size) / 2;
      const cells = Array.from({ length: cols * rows }, (_, i) => ({ c: i % cols, r: Math.floor(i / cols) })).map(p => ({ ...p, d: ((p.c + .5 - cols / 2) / cols) ** 2 + ((p.r + .5 - rows / 2) / rows) ** 2 })).sort((a, b) => a.d - b.d);
      content = <Frame k={k}><rect x={ox} y={oy} width={cols * size} height={rows * size} fill="#fffdf7"/>
        {cells.slice(0, total).map(({ c, r }, i) => { const x = ox + c * size, y = oy + r * size; if (i < full) return <rect key={i} x={x} y={y} width={size} height={size} fill="#4f9e46"/>; const cx = c + .5 < cols / 2, cy = r + .5 < rows / 2, ax = cx ? x + size : x, ay = cy ? y + size : y, bx = cx ? x : x + size, by = cy ? y : y + size; return <path key={i} d={`M${ax} ${ay}L${bx} ${ay}L${ax} ${by}Z`} fill="#a9d68f"/>; })}
        <path d={Array.from({ length: cols + 1 }, (_, i) => `M${ox + i * size} ${oy}v${rows * size}`).join('') + Array.from({ length: rows + 1 }, (_, i) => `M${ox} ${oy + i * size}h${cols * size}`).join('')} stroke="#8d80ab" strokeWidth="1.2"/>
        <g fontSize="21" fontWeight="700" fill={INK}><rect x="520" y="120" width="34" height="34" fill="#4f9e46" stroke="#8d80ab"/><text x="566" y="145">{full} full</text><path d="M520 190h34v-0L520 224Z" fill="#a9d68f"/><rect x="520" y="190" width="34" height="34" fill="none" stroke="#8d80ab"/><text x="566" y="215">{partial} half covered</text></g>
      </Frame>;
      facts = labels;
      break;
    }
    case 'gridCompare':
      content = <Frame k={k}>{[0, 1].map(i => { const step = i ? 3 : 30, id = `${k.id}c${i}`; return <g key={i} transform={`translate(${70 + i * 340} 70)`}><clipPath id={id}><rect width="280" height="240"/></clipPath><rect width="280" height="240" fill="#fffdf7" stroke={INK} strokeWidth="2"/><path d="M40 190Q5 60 120 40Q270 10 245 150Q215 240 40 190" fill={k.u('violetTop')} stroke={INK} strokeWidth="3"/><g clipPath={`url(#${id})`}><path d={Array.from({ length: 100 }, (_, j) => `M${j * step} 0V240M0 ${j * step}H280`).join('')} stroke="#6d5a9c" strokeWidth={i ? .35 : 1.2}/></g>{Lab(140, 276, labels[i])}</g>; })}</Frame>;
      break;
    case 'strips': {
      const max = Math.max(...n), w = 480 / n.length, x0 = 140, mid = 225;
      content = <Frame k={k}><g {...shade(k)}>{n.map((len, i) => { const h = len / max * 310; return <rect key={i} x={x0 + i * w} y={mid - h / 2} width={w} height={h} fill={k.u('water')} stroke="#14598f" strokeWidth="2"/>; })}</g>{n.map((len, i) => <g key={i}>{Lab(x0 + (i + .5) * w, mid, `${len} m`, { size: 20, bg: '#fff' })}</g>)}</Frame>;
      facts = labels;
      break;
    }
    case 'boundary': {
      const p = [[150, 120], [370, 60], [590, 130], [620, 300], [380, 380], [140, 310]];
      content = <Frame k={k}><g {...shade(k)}><polygon points={p.map(q => q.join(',')).join(' ')} fill={fill}/></g><polygon points={p.map(q => q.join(',')).join(' ')} fill="none" stroke={edge} strokeWidth="3.5" strokeLinejoin="round"/>{p.map(([x, y], i) => { const [a, b] = p[(i + 1) % 6], mx = (x + a) / 2, my = (y + b) / 2, ox = mx - 380, oy = my - 220, l = Math.hypot(ox, oy); return <g key={i}>{Lab(mx + ox / l * 34, my + oy / l * 28, labels[i])}</g>; })}</Frame>;
      break;
    }
    case 'rectangle': case 'diagonal': {
      const a = value(labels[0]), b = value(labels[1]), s = Math.min(430 / a, 280 / b), w = Math.max(a * s, 150), h = Math.max(b * s, 110), x = (W - w) / 2, y = (H - h) / 2 + 6, diag = v.variant === 'diagonal';
      content = <Frame k={k}><g {...shade(k)}><rect x={x} y={y} width={w} height={h} fill={fill} stroke={edge} strokeWidth="3.5"/></g>{Dim(x, y - 28, x + w, y - 28, labels[0])}{Dim(x + w + 34, y, x + w + 34, y + h, labels[1])}{diag && <><path d={`M${x} ${y + h}L${x + w} ${y}`} stroke={ORANGE_LINE} strokeWidth="4" strokeDasharray="10 7"/>{Lab(x + w / 2, y + h / 2, '?')}</>}</Frame>;
      if (!diag) facts = labels.slice(2);
      break;
    }
    case 'prism': {
      const depth = find(labels, 'Water depth'), section = find(labels, 'Cross-section'), height = depth || find(labels, 'Height'), length = find(labels, 'Length'), width = find(labels, 'Width');
      if (section) {
        const x = 170, y = 360, h = 170, w = 170, dx = 230, dy = -96;
        content = <Frame k={k}><path d={`M${x + w} ${y}L${x + w + dx} ${y + dy}V${y + dy - h}L${x + w} ${y - h}Z`} fill={k.u('violetSide')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/><path d={`M${x} ${y - h}L${x + dx} ${y + dy - h}H${x + w + dx}L${x + w} ${y - h}Z`} fill={k.u('violetTop')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/><g {...shade(k)}><rect x={x} y={y - h} width={w} height={h} fill={k.u('violet')} stroke={INK} strokeWidth="3"/></g>{Lab(x + w / 2, y - h / 2, section, { bg: '#fff', size: 22 })}{Dim(x + w + 24, y + 22, x + w + dx + 24, y + dy + 22, length)}</Frame>;
        facts = labels.filter(l => !l.startsWith('Cross-section') && !l.startsWith('Length'));
        break;
      }
      const l = value(length), w = value(width), h = value(height) || Math.max(l, w) * .55, f = boxFit(l, w, h), x = (W - f.w - f.d * .62) / 2 - 10, y = 372;
      content = <Frame k={k}>{Box(k, x, y, f.w, f.h, f.d, depth ? { water: .72 } : {})}{Dim(x, y + 30, x + f.w, y + 30, length)}{Dim(x - 34, y, x - 34, y - f.h * (depth ? .72 : 1), height)}{Dim(x + f.w + 26, y + 12, x + f.w + f.d * .62 + 26, y - f.d * .42 + 12, width)}</Frame>;
      facts = labels.filter(a => a.startsWith('Volume') || a.startsWith('Water:'));
      break;
    }
    case 'cube': {
      const f = 210, x = 240, y = 360;
      content = <Frame k={k}>{Box(k, x, y, f, f, f)}{Dim(x, y + 30, x + f, y + 30, find(labels, 'Side'))}{Lab(x + f / 2, y - f / 2, find(labels, 'Volume'), { bg: '#fff' })}</Frame>;
      break;
    }
    case 'triPrism':
      content = <Frame k={k}>{TriPrism(k, find(labels, 'End base'), find(labels, 'End height'), find(labels, 'Length'), value(find(labels, 'End base')), value(find(labels, 'End height')), 0)}</Frame>;
      facts = labels.filter(l => l.startsWith('Volume'));
      break;
    case 'twoPrisms': {
      const sizes = labels.slice(0, 2).map(triple), big = Math.max(...sizes.flat()), s = 180 / big;
      content = <Frame k={k}>{sizes.map(([l, w, h], i) => { const x = 70 + i * 350, y = 340; return <g key={i}>{Box(k, x, y, l * s, h * s, w * s, { mat: i ? 'steel' : undefined })}{Lab(x + 130, y + 52, labels[i], { size: 21 })}</g>; })}</Frame>;
      break;
    }
    case 'packing': {
      const [l, w, h] = triple(labels[0]), f = boxFit(l, w, h, 360, 270), x = 70, y = 350;
      content = <Frame k={k}>{Box(k, x, y, f.w, f.h, f.d, { mat: 'timber' })}{Lab(x + 180, y + 50, labels[0], { size: 21 })}{Box(k, 590, 290, 54, 54, 54)}{Lab(620, 340, labels[1], { size: 20 })}</Frame>;
      break;
    }
    case 'layers': {
      const x = 240, y = 390, top = 50, room = value(labels[0]), box = value(labels[1]), bh = Math.max((y - top) * box / room, 28);
      content = <Frame k={k}><rect x={x} y={top} width="320" height={y - top} fill="#fffdf7"/><path d={`M${x} ${top}V${y}H${x + 320}V${top}`} fill="none" stroke={INK} strokeWidth="4"/><g {...shade(k)}><rect x={x + 24} y={y - bh} width="170" height={bh} fill={k.u('timber')} stroke="#7a4f27" strokeWidth="3"/></g><rect x={x + 24} y={y - 2 * bh} width="170" height={bh} fill="none" stroke="#7a4f27" strokeWidth="2" strokeDasharray="8 6"/>{Dim(x - 30, y, x - 30, top, labels[0].replace('Storeroom height: ', ''))}{Dim(x + 250, y, x + 250, y - bh, labels[1].replace('One box height: ', ''), { bg: '#fffdf7' })}</Frame>;
      break;
    }
    case 'capacity': {
      const bottle = labels.find(l => l.startsWith('Bottle:'));
      content = <Frame k={k}><path d="M150 110V340Q150 382 290 382Q430 382 430 340V110" fill={k.u('water')} stroke="#14598f" strokeWidth="3"/><ellipse cx="290" cy="110" rx="140" ry="36" fill="#9fe0f7" stroke="#14598f" strokeWidth="3"/>{Lab(290, 240, labels[0], { bg: '#fff' })}{bottle && <><path d="M556 170V210L526 246V360Q566 380 606 360V246L576 210V170Z" fill={k.u('water')} stroke="#14598f" strokeWidth="3"/><rect x="552" y="154" width="28" height="18" rx="3" fill={INK}/>{Lab(566, 410, bottle, { size: 21 })}</>}</Frame>;
      facts = labels.slice(1).filter(l => l !== bottle);
      break;
    }
    case 'circleUnknown': {
      const r = 170, cx = W / 2, cy = 222, area = find(labels, 'Area'), other = labels.find(l => !l.startsWith('Area')) ?? '', name = other.split(':')[0], val = after(other), unknown = val.includes('?');
      content = <Frame k={k}><g {...shade(k)}><circle cx={cx} cy={cy} r={r} fill={fill} stroke={name === 'Circumference' && unknown ? ORANGE_LINE : edge} strokeWidth={name === 'Circumference' && unknown ? 7 : 3.5}/></g>{Lab(cx, cy - 66, area, { bg: '#fff' })}{name === 'Radius' && Dim(cx, cy, cx + r, cy, '?', { bg: '#fff' })}{name === 'Diameter' && Dim(cx - r, cy, cx + r, cy, '?', { bg: '#fff' })}{name === 'Circumference' && unknown && Lab(cx, cy + 18, 'Distance around: ?')}</Frame>;
      if (name === 'Circumference' && !unknown) facts = [other];
      break;
    }
    case 'wheel': {
      const cx = W / 2, cy = 222, r = 170;
      content = <Frame k={k}><g {...shade(k)}><circle cx={cx} cy={cy} r={r} fill="none" stroke="#27222f" strokeWidth="20"/></g><circle cx={cx} cy={cy} r={r - 13} fill="none" stroke="#b6bdc9" strokeWidth="6"/>{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${cx} ${cy}L${cx + (r - 13) * Math.cos(i * Math.PI / 8)} ${cy + (r - 13) * Math.sin(i * Math.PI / 8)}`} stroke="#8f98a8" strokeWidth="2"/>)}<circle cx={cx} cy={cy} r="15" fill={INK}/><path d={`M${cx} ${cy}L${cx + (r - 13) * Math.cos(-.85)} ${cy + (r - 13) * Math.sin(-.85)}`} stroke={INK} strokeWidth="4"/>{Lab(cx + 66, cy - 76, after(labels[0]), { bg: '#fff' })}{Dim(cx - r - 10, cy + r + 28, cx + r + 10, cy + r + 28, '?')}</Frame>;
      break;
    }
    case 'squareCircle': {
      const side = 300, x = (W - side) / 2, y = 56, cx = x + side / 2, cy = y + side / 2, r = side / 2 * n[0], sq = find(labels, 'Square side'), radius = find(labels, 'Radius'), hole = find(labels, 'Hole diameter');
      content = <Frame k={k}><g {...shade(k)}><rect x={x} y={y} width={side} height={side} fill={k.u('violet')} stroke={INK} strokeWidth="3"/></g><circle cx={cx} cy={cy} r={r} fill={PANEL} stroke={INK} strokeWidth="3"/>{sq && Dim(x, y + side + 28, x + side, y + side + 28, sq)}{radius && Dim(cx, cy, cx + r, cy, radius, { bg: '#fff' })}{hole && Dim(cx - r, cy, cx + r, cy, hole, { bg: '#fff' })}{!hole && <circle cx={cx} cy={cy} r="4" fill={INK}/>}</Frame>;
      facts = labels.filter(l => !l.includes(': '));
      break;
    }
    case 'twoCircles': {
      const max = Math.max(...n);
      content = <Frame k={k}>{n.map((r, i) => { const cx = 200 + 360 * i, R = 140 * r / max; return <g key={i}><g {...shade(k)}><circle cx={cx} cy="190" r={R} fill={i ? k.u('violetTop') : k.u('violet')} stroke={INK} strokeWidth="3"/></g><path d={`M${cx} 190h${R}`} stroke={i ? INK : '#fff'} strokeWidth="3"/><circle cx={cx} cy="190" r="4" fill={i ? INK : '#fff'}/>{Lab(cx, 384, labels[i], { size: 21 })}</g>; })}</Frame>;
      break;
    }
    case 'quadrant': {
      const r = 300, x = 220, y = 380;
      content = <Frame k={k}><g {...shade(k)}><path d={`M${x} ${y}V${y - r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g>{rightMark(x, y - 20, 1, 1, '#fff')}{Dim(x, y + 30, x + r, y + 30, after(labels[0]))}</Frame>;
      break;
    }
    case 'arch': {
      const R = 280, I = R * n[1] / n[0], cx = W / 2, y = 340;
      content = <Frame k={k}><g {...shade(k)}><path d={`M${cx - R} ${y}A${R} ${R} 0 0 1 ${cx + R} ${y}H${cx + I}A${I} ${I} 0 0 0 ${cx - I} ${y}Z`} fill={k.u('brick')} stroke="#7c3f2a" strokeWidth="3"/></g>{Dim(cx, y + 30, cx + R, y + 30, after(labels[0]))}{Dim(cx, y, cx - I, y, after(labels[1]))}</Frame>;
      break;
    }
    case 'circleCompare':
      content = <Frame k={k}><g {...shade(k)}><circle cx="130" cy="190" r="92" fill={k.u('violet')} stroke={INK} strokeWidth="3"/><path d="M290 270A92 92 0 0 1 474 270Z" fill={k.u('violet')} stroke={INK} strokeWidth="3"/><path d="M544 270V164A106 106 0 0 1 650 270Z" fill={k.u('violet')} stroke={INK} strokeWidth="3"/></g>{labels.map((l, i) => <g key={i}>{Lab([130, 382, 610][i], 330 + (i === 1 ? 46 : 0), l, { size: 20 })}</g>)}</Frame>;
      break;
    case 'track': {
      const straight = value(find(labels, 'Each straight')), dia = value(find(labels, 'Semicircle diameter')), s = 640 / (straight + dia), sh = Math.min(dia * s, 280), sw = Math.max(straight * s, 160), x = (W - sw - sh) / 2, y = (H - sh) / 2, o = x + sh / 2;
      content = <Frame k={k}><g {...shade(k)}><rect x={x} y={y} width={sw + sh} height={sh} rx={sh / 2} fill="#c9553d"/></g><rect x={x + 16} y={y + 16} width={sw + sh - 32} height={sh - 32} rx={sh / 2 - 16} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2"/><rect x={x + 34} y={y + 34} width={sw + sh - 68} height={sh - 68} rx={sh / 2 - 34} fill={k.u('grass')} stroke="#fff" strokeWidth="3"/>{Dim(o, y - 26, o + sw, y - 26, find(labels, 'Each straight'))}{Dim(o, y + 4, o, y + sh - 4, find(labels, 'Semicircle diameter'), { bg: '#fff' })}</Frame>;
      break;
    }
    case 'triangle': case 'squares': {
      const [a, b, c] = n, px = (a * a + b * b - c * c) / (2 * a), py = Math.sqrt(Math.max(0, b * b - px * px)), tri = [[0, 0], [a, 0], [px, -py]];
      const sq = (p: number[], q: number[]) => { const dx = q[0] - p[0], dy = q[1] - p[1]; return [p, q, [q[0] - dy, q[1] + dx], [p[0] - dy, p[1] + dx]]; };
      const squares = [sq(tri[0], tri[1]), sq(tri[2], tri[0]), sq(tri[1], tri[2])], many = v.variant === 'squares', all = many ? squares.flat() : tri, xs = all.map(p => p[0]), ys = all.map(p => p[1]), lx = Math.min(...xs), ly = Math.min(...ys), s = Math.min(560 / (Math.max(...xs) - lx), 320 / (Math.max(...ys) - ly)), ox = (W - (Math.max(...xs) - lx) * s) / 2, oy = (H - (Math.max(...ys) - ly) * s) / 2 - 8;
      const pos = (p: number[]) => [ox + (p[0] - lx) * s, oy + (p[1] - ly) * s], points = tri.map(pos), mx = points.reduce((t, p) => t + p[0], 0) / 3, my = points.reduce((t, p) => t + p[1], 0) / 3;
      const place = many ? squares.map(q => { const [cx, cy] = pos([q.reduce((t, p) => t + p[0], 0) / 4, q.reduce((t, p) => t + p[1], 0) / 4]), side = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) * s, dx = cx - mx, dy = cy - my, l = Math.hypot(dx, dy) || 1, push = side < 120 ? 70 : 0; return [cx + dx / l * push, cy + dy / l * push]; }) : [[0, 1], [2, 0], [1, 2]].map(([i, j]) => { const qx = (points[i][0] + points[j][0]) / 2, qy = (points[i][1] + points[j][1]) / 2, dx = qx - mx, dy = qy - my, l = Math.hypot(dx, dy) || 1; return [qx + dx / l * 30, qy + dy / l * 30]; });
      content = <Frame k={k}>{many && squares.map((q, i) => <polygon key={i} points={q.map(p => pos(p).join(',')).join(' ')} fill={[k.u('violetTop'), '#a9d68f', '#f4cf8a'][i]} stroke={INK} strokeWidth="2.5" strokeLinejoin="round"/>)}<g {...shade(k)}><polygon points={points.map(p => p.join(',')).join(' ')} fill={many ? '#fff' : k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g>{place.map(([x, y], i) => <g key={i}>{Lab(x, y, labels[i], { size: many ? 21 : 24, bg: many ? '#fff' : PANEL })}</g>)}</Frame>;
      break;
    }
    case 'isoscelesHeight': {
      const base = value(find(labels, 'Base')), side = value(find(labels, 'Equal sides')), h = Math.sqrt(Math.max(1, side * side - base * base / 4)), s = Math.min(440 / base, 300 / h), w = base * s, ht = h * s, x = (W - w) / 2, y = 362, cx = W / 2;
      content = <Frame k={k}><g {...shade(k)}><path d={`M${x} ${y}H${x + w}L${cx} ${y - ht}Z`} fill={k.u('violet')} stroke={INK} strokeWidth="3" strokeLinejoin="round"/></g><path d={`M${cx} ${y - ht}V${y}`} stroke={ORANGE_LINE} strokeWidth="4" strokeDasharray="9 6"/>{rightMark(cx, y - 20, 1, 1, '#fff')}{Lab(cx + 4, y - ht * .46, '?')}{Dim(x, y + 32, x + w, y + 32, find(labels, 'Base'))}{Lab(x + w / 4 - 60, y - ht / 2 - 8, find(labels, 'Equal sides'))}</Frame>;
      break;
    }
    case 'walk': case 'mast': case 'glass': {
      const [p, q] = v.variant === 'walk' ? [find(labels, 'East'), find(labels, 'North')] : v.variant === 'mast' ? [find(labels, 'Ground'), find(labels, 'Mast')] : [find(labels, 'Glass width'), find(labels, 'Glass height')];
      const a = value(p), b = value(q), s = Math.min(420 / a, 300 / b), w = Math.max(a * s, 150), h = Math.max(b * s, 110), x = (W - w) / 2 - 40, y = 372;
      if (v.variant === 'walk') content = <Frame k={k}><rect width={W} height={H} rx="14" fill={k.u('grass')} opacity=".55"/><path d={`M${x} ${y}H${x + w}V${y - h}`} fill="none" stroke="#7a4f27" strokeWidth="7" strokeLinejoin="round"/><path d={`M${x} ${y}L${x + w} ${y - h}`} stroke={ORANGE_LINE} strokeWidth="4" strokeDasharray="10 7"/>{rightMark(x + w - 20, y - 20, 1, 1)}<circle cx={x} cy={y} r="11" fill={INK}/><circle cx={x + w} cy={y - h} r="11" fill={INK}/>{Lab(x + w / 2, y + 34, p, { bg: '#fff' })}{Lab(x + w + 62, y - h / 2, q, { bg: '#fff' })}{Lab(x + w / 2 - 36, y - h / 2 - 16, '?')}<path d="M690 90V40M690 40l-9 14M690 40l9 14" stroke={INK} strokeWidth="4" fill="none"/><text x="690" y="116" textAnchor="middle" fontSize="22" fontWeight="700" fill={INK}>N</text></Frame>;
      else if (v.variant === 'mast') content = <Frame k={k}><rect y={y} width={W} height={H - y} fill="#7cb86a"/><rect x={x + w - 7} y={y - h} width="14" height={h} fill={k.u('steel')} stroke={INK} strokeWidth="2"/><path d={`M${x} ${y}L${x + w} ${y - h}`} stroke={ORANGE_LINE} strokeWidth="4" strokeDasharray="10 7"/>{rightMark(x + w - 27, y - 20, 1, 1, '#fff')}{Lab(x + w / 2, y + 36, p, { bg: '#7cb86a' })}{Dim(x + w + 36, y, x + w + 36, y - h, q)}{Lab(x + w / 2 - 36, y - h / 2 - 16, '?')}</Frame>;
      else { const straw = value(find(labels, 'Whole straw')), len = Math.hypot(a, b), e = straw / len; content = <Frame k={k}><rect x={x} y={y - h * .62} width={w} height={h * .62} fill={k.u('water')} opacity=".7"/><path d={`M${x} ${y}L${x + w * e} ${y - h * e}`} stroke="#d9413c" strokeWidth="9" strokeLinecap="round"/><path d={`M${x} ${y - h}V${y}H${x + w}V${y - h}`} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>{Dim(x, y + 30, x + w, y + 30, p)}{Dim(x - 34, y, x - 34, y - h, q)}{Lab(x + w + 100, Math.max(y - h * e, 40) + 30, find(labels, 'Whole straw'), { size: 22 })}</Frame>; }
      break;
    }
    case 'scale': {
      const ruler = (y: number, x: number, w: number, c: string) => <g><g {...shade(k)}><rect x={x} y={y} width={w} height="58" rx="6" fill={c} stroke={INK} strokeWidth="2.5"/></g><path d={Array.from({ length: Math.floor(w / 24) + 1 }, (_, i) => `M${x + i * 24} ${y}v${i % 5 ? 12 : 22}`).join('')} stroke={INK} strokeWidth="2"/></g>;
      const real = labels.find(l => l.startsWith('Real')) ?? '', other = labels.find(l => /length: \?/i.test(l)) ?? '';
      content = <Frame k={k} height={320}>{ruler(70, 70, 620, '#f4cf8a')}{Lab(380, 44, real)}{ruler(210, 270, 220, '#d3c0f7')}{Lab(380, 296, other || 'Map or plan')}</Frame>;
      facts = labels.filter(l => l !== real && l !== other);
      break;
    }
    case 'ratio': {
      const total = n.reduce((a, b) => a + b, 0), x0 = 60, w = 640 / total, names = n.map((_, i) => labels[i].split(':')[0]), tot = labels[n.length], sum = tot ? after(tot) : '';
      const texture = (name: string, i: number) => name === 'Cement' ? k.u('cement') : name === 'Sand' ? k.u('sand') : name === 'Gravel' ? k.u('gravel') : name === 'Water' ? k.u('water') : ['#9a6cf0', '#7dd3c0', '#f4cf8a'][i];
      content = <Frame k={k} height={380}>{sum && Dim(x0, 62, x0 + 640, 62, `${sum} total`)}<g {...shade(k)}>{n.map((c, i) => { const x = x0 + n.slice(0, i).reduce((a, b) => a + b, 0) * w; return <rect key={i} x={x} y="104" width={c * w} height="120" fill={texture(names[i], i)}/>; })}</g><rect x={x0} y="104" width="640" height="120" fill="none" stroke={INK} strokeWidth="3"/><path d={Array.from({ length: total - 1 }, (_, i) => `M${x0 + (i + 1) * w} 104v120`).join('')} stroke="#fff" strokeOpacity=".85" strokeWidth="2" strokeDasharray="6 5"/>{n.map((c, i) => { const x = x0 + (n.slice(0, i).reduce((a, b) => a + b, 0) + c / 2) * w, cx = Math.min(Math.max(x, 110), 650), bits = after(labels[i]).split('; '); return <g key={i}>{Lab(cx, 256 + (c * w < 130 && i % 2 ? 76 : 0), names[i], { size: 22 })}{Lab(cx, 288 + (c * w < 130 && i % 2 ? 76 : 0), bits[0], { size: 20 })}{bits[1] && Lab(cx, 322 + (c * w < 130 && i % 2 ? 76 : 0), bits[1], { size: 20 })}</g>; })}</Frame>;
      break;
    }
    default: throw new Error('Missing Measurement lesson diagram: ' + v.variant);
  }
  return <div className="w-full">{content}<Facts items={facts}/></div>;
}

/** Describes visible geometry without narrating any computed or hidden value. */
export function measurementLessonDescription(v: Measurement8Visual): string {
  if(v.variant==='grid') return `${v.values[0]} full squares and ${v.values[1]} half-covered squares, arranged for counting.`;
  if(v.variant==='strips') return `Adjacent rectangular strips. Strip lengths in metres: ${v.values.join(', ')}.`;
  if(['triangle','squares','ratio'].includes(v.variant??'')) return `${v.variant==='squares'?'Squares are drawn outwards on the three triangle sides.':v.variant==='ratio'?'Each block represents one equal part.':'The triangle sides are labelled.'} ${(v.labels??[]).join('. ')}.`;
  const descriptions: Record<string,string> = {
    gridCompare:'The same curved outline on a coarse grid and a grid with ten times as many divisions in each direction.',
    boundary:'Six boundary pieces form one closed shape. Labels follow the boundary clockwise.',
    rectangle:'A rectangular region with its length and width labelled.',
    diagonal:'A dashed diagonal joins opposite corners of the rectangle; its length is unknown.',
    prism:'A prism with a constant cross-section. The measurements are marked on it.',
    cube:'A cube with unknown side length.', triPrism:'A triangular prism. The triangular end has a perpendicular base and height.',
    twoPrisms:'Container A on the left and container B on the right.', packing:'The container is on the left; one cube is on the right. Diagrams are not to the same scale.',
    layers:'One whole box layer is shown on the floor of the available space. A dashed outline shows where the next layer could fit.',
    capacity:'A container of water.', circleUnknown:'A circle with its unknown measurement marked.',
    wheel:'Spokes join the centre to the wheel rim.', squareCircle:'A circle is centred inside a square. The horizontal line passes through the circle centre.',
    twoCircles:'Two circles with a radius marked in each.', quadrant:'A quarter circle, bounded by two perpendicular radii and a curved edge.',
    arch:'The brick arch lies between two semicircles with the same centre.', circleCompare:'A full circle, a semicircle and a quarter circle, shown schematically.',
    track:'Two equal straights are joined by two semicircular ends.',
    isoscelesHeight:'A perpendicular height divides the isosceles triangle into two right triangles. The height is unknown.',
    walk:'An eastward leg is followed by a northward leg. The dashed line joins the start and finish.',
    mast:'The vertical mast and horizontal ground meet at a right angle. The cable joins the ground point to the top of the mast.',
    glass:'A vertical cross-section of the glass. The straw runs diagonally from the bottom corner through the opposite rim and extends above it.',
    scale:'The upper bar represents the real distance; the lower bar represents the map or model distance. Use the stated scale, not the screen lengths.',
  };
  return descriptions[v.variant??'']??'';
}
