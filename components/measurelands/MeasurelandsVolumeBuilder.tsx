"use client";

// Measurelands Volume Builder — a premium isometric unit-cube engine (Level 6).
// Draws a rectangular prism of unit cubes, with an optional target wireframe,
// tappable base cells (build), layer highlighting and a lifted layer view.

export type Cube = { x: number; y: number; z: number };
export type Dims = { l: number; w: number; h: number };

const U = 20, V = 10, HH = 22; // iso half-width, half-height, cube height (px)

function projraw(x: number, y: number, z: number, ox: number, oy: number): [number, number] {
  return [ox + (x - y) * U, oy + (x + y) * V - z * HH];
}

export function volumeViewBox(dims: Dims, lift = false) {
  const { l, w, h } = dims;
  const PAD = 18;
  const liftExtra = lift ? (h - 1) * HH * 0.85 : 0;
  const ox = w * U + PAD;
  const oy = h * HH + PAD + liftExtra;
  const VW = (l + w) * U + PAD * 2;
  const VH = (l + w) * V + h * HH + PAD * 2 + liftExtra;
  return { PAD, ox, oy, VW, VH };
}

export function MeasurelandsVolumeBuilder({
  dims, cubes, outline, litLayer, lift, tapCells, onTapCell, faded, size,
}: {
  dims: Dims;
  cubes: Cube[];
  outline?: boolean;
  litLayer?: number | null;
  lift?: boolean;
  tapCells?: Cube[];
  onTapCell?: (x: number, y: number) => void;
  faded?: boolean;
  size?: number;
}) {
  const { l, w, h } = dims;
  const { ox, oy, VW, VH } = volumeViewBox(dims, lift);
  const liftGap = lift ? HH * 0.85 : 0;
  const zoff = (z: number) => z * liftGap;

  const P = (x: number, y: number, z: number): [number, number] => {
    const [px, py] = projraw(x, y, z, ox, oy);
    return [px, py - zoff(z)];
  };
  const pts = (arr: Array<[number, number]>) => arr.map((p) => p.join(",")).join(" ");

  const cubeFaces = (c: Cube) => ({
    left: [P(c.x, c.y + 1, c.z), P(c.x + 1, c.y + 1, c.z), P(c.x + 1, c.y + 1, c.z + 1), P(c.x, c.y + 1, c.z + 1)],
    right: [P(c.x + 1, c.y, c.z), P(c.x + 1, c.y + 1, c.z), P(c.x + 1, c.y + 1, c.z + 1), P(c.x + 1, c.y, c.z + 1)],
    top: [P(c.x, c.y, c.z + 1), P(c.x + 1, c.y, c.z + 1), P(c.x + 1, c.y + 1, c.z + 1), P(c.x, c.y + 1, c.z + 1)],
  });

  const sorted = [...cubes].sort((a, b) => a.z - b.z || (a.x + a.y) - (b.x + b.y) || a.y - b.y);

  // Target wireframe (12 edges of the l×w×h box).
  const corners: Cube[] = [
    { x: 0, y: 0, z: 0 }, { x: l, y: 0, z: 0 }, { x: l, y: w, z: 0 }, { x: 0, y: w, z: 0 },
    { x: 0, y: 0, z: h }, { x: l, y: 0, z: h }, { x: l, y: w, z: h }, { x: 0, y: w, z: h },
  ];
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

  return (
    <div className="mx-auto" style={{ maxWidth: Math.min(VW * 1.4, 460) }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ maxHeight: size ?? 300 }} role="img" aria-label={`prism ${l} by ${w} by ${h}`}>
        {outline ? edges.map(([a, b], i) => {
          const [x1, y1] = P(corners[a]!.x, corners[a]!.y, corners[a]!.z);
          const [x2, y2] = P(corners[b]!.x, corners[b]!.y, corners[b]!.z);
          return <line key={`e${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(124,58,237,0.5)" strokeWidth={1.6} strokeDasharray="5 4" />;
        }) : null}

        {sorted.map((c, i) => {
          const f = cubeFaces(c);
          const lit = litLayer != null && c.z === litLayer;
          const op = faded ? 0.5 : 1;
          const topC = lit ? "#fde68a" : "#b39dfb";
          const rightC = lit ? "#f59e0b" : "#7c3aed";
          const leftC = lit ? "#d97706" : "#5b21b6";
          return (
            <g key={`c${i}`} opacity={op}>
              <polygon points={pts(f.left)} fill={leftC} stroke="#2e1065" strokeWidth={1} strokeLinejoin="round" />
              <polygon points={pts(f.right)} fill={rightC} stroke="#2e1065" strokeWidth={1} strokeLinejoin="round" />
              <polygon points={pts(f.top)} fill={topC} stroke="#2e1065" strokeWidth={1} strokeLinejoin="round" />
            </g>
          );
        })}

        {(tapCells ?? []).map((c) => {
          const floor = [P(c.x, c.y, c.z), P(c.x + 1, c.y, c.z), P(c.x + 1, c.y + 1, c.z), P(c.x, c.y + 1, c.z)];
          return <polygon key={`t${c.x}-${c.y}-${c.z}`} points={pts(floor)} fill="rgba(124,58,237,0.12)" stroke="#7c3aed" strokeWidth={1.6} strokeDasharray="4 3" style={{ cursor: "pointer" }} onClick={() => onTapCell?.(c.x, c.y)} />;
        })}
      </svg>
    </div>
  );
}

// A full solid prism's cube list.
export function prismCubes(dims: Dims): Cube[] {
  const out: Cube[] = [];
  for (let z = 0; z < dims.h; z++) for (let y = 0; y < dims.w; y++) for (let x = 0; x < dims.l; x++) out.push({ x, y, z });
  return out;
}
