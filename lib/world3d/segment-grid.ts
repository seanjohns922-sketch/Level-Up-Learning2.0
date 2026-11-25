/**
 * Exact nearest-segment lookup over a fixed set of polylines on the ground plane (x, z).
 *
 * The expedition terrain asks "which trail point is nearest?" for every vertex, tree and step, and a full scan
 * of every segment made the volcano summit take seconds to build. This index divides the map into square cells
 * and keeps, per cell, only the segments that can be nearest to some point in that cell:
 *
 *   U = min over segments of dist(cell centre, s) + h     (h = half the cell diagonal)
 *   keep s when dist(cell centre, s) − h ≤ U
 *
 * For any point p in the cell the true nearest segment s* satisfies dist(p, s*) ≤ U and
 * dist(centre, s*) − h ≤ dist(p, s*), so s* is always kept and the answer is identical to a full scan.
 * Candidates keep their original order, so ties resolve to the same segment as before. Points outside
 * the grid fall back to the full scan.
 */
export type SegmentHit = { segment: number; t: number; distance: number };

type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number };

export function createSegmentGrid(segments: { ax: number; az: number; bx: number; bz: number }[], bounds: Bounds, cell: number) {
  const n = segments.length, ax = new Float64Array(n), az = new Float64Array(n), dx = new Float64Array(n), dz = new Float64Array(n), len2 = new Float64Array(n);
  segments.forEach((s, i) => { ax[i] = s.ax; az[i] = s.az; dx[i] = s.bx - s.ax; dz[i] = s.bz - s.az; len2[i] = dx[i] * dx[i] + dz[i] * dz[i]; });
  const all = Uint32Array.from({ length: n }, (_, i) => i);
  const cols = Math.ceil((bounds.maxX - bounds.minX) / cell), rows = Math.ceil((bounds.maxZ - bounds.minZ) / cell);
  let cells: Uint32Array[] | null = null;

  /** Distance from (x, z) to segment i; zero-length segments never count (Infinity). Sets `along` to the position t. */
  let along = 0;
  const distanceTo = (i: number, x: number, z: number) => {
    if (len2[i] === 0) return Infinity;
    along = Math.max(0, Math.min(1, ((x - ax[i]) * dx[i] + (z - az[i]) * dz[i]) / len2[i]));
    const ex = x - ax[i] - along * dx[i], ez = z - az[i] - along * dz[i];
    return Math.sqrt(ex * ex + ez * ez);
  };
  /** Segments from `from` that can be nearest anywhere in the square centred on (x, z) with half-diagonal h. */
  const keepFor = (x: number, z: number, h: number, from: ArrayLike<number>) => {
    let best = Infinity;
    const d = new Float64Array(from.length);
    for (let k = 0; k < from.length; k++) { d[k] = distanceTo(from[k], x, z); if (d[k] < best) best = d[k]; }
    const limit = best + 2 * h + 1e-9, keep: number[] = [];
    for (let k = 0; k < from.length; k++) if (d[k] <= limit) keep.push(from[k]);
    return Uint32Array.from(keep);
  };
  // Built on first use, so importing the module costs nothing. Two levels keep it cheap: each block of 4 × 4 cells
  // is filtered against every segment, then its cells against the block's list only. That stays exact: a segment
  // kept for a cell (d ≤ best + 2h at the cell centre) is within best + 2H of the block centre, so the block kept it.
  const BLOCK = 4;
  const build = () => {
    const out: Uint32Array[] = new Array(cols * rows), h = Math.SQRT2 * cell / 2, H = h * BLOCK;
    for (let br = 0; br < rows; br += BLOCK) for (let bc = 0; bc < cols; bc += BLOCK) {
      const block = keepFor(bounds.minX + (bc + BLOCK / 2) * cell, bounds.minZ + (br + BLOCK / 2) * cell, H, all);
      for (let r = br; r < Math.min(rows, br + BLOCK); r++) for (let c = bc; c < Math.min(cols, bc + BLOCK); c++)
        out[r * cols + c] = keepFor(bounds.minX + (c + .5) * cell, bounds.minZ + (r + .5) * cell, h, block);
    }
    return out;
  };
  const candidates = (x: number, z: number) => {
    const c = Math.floor((x - bounds.minX) / cell), r = Math.floor((z - bounds.minZ) / cell);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return all;
    cells ??= build();
    return cells[r * cols + c];
  };

  // Terrain code often asks about the same point several times in a row (height, colour, threat), so the last answer is kept.
  let lastX = NaN, lastZ = NaN, last: SegmentHit = { segment: -1, t: 0, distance: Infinity };
  return function nearest(x: number, z: number): SegmentHit {
    if (x === lastX && z === lastZ) return last;
    let segment = -1, t = 0, distance = Infinity;
    const list = candidates(x, z);
    for (let k = 0; k < list.length; k++) { const i = list[k], d = distanceTo(i, x, z); if (d < distance) { distance = d; t = along; segment = i; } }
    lastX = x; lastZ = z; last = { segment, t, distance };
    return last;
  };
}
