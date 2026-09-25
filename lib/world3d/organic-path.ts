import * as THREE from "three";
import type { CentralWorldGroundTile } from "./central-world-layout";

const CELL = 2;
const STEP = 0.5;
const RADIUS = 1.3;
type Point = [number, number];

/** A graph of painted cells, not a permanent route. Only neighbouring cells
 * connect, so an erased gap stays a gap. Diagonal-only legacy bends reconnect. */
export function pathCentreLines(tiles: CentralWorldGroundTile[]): Point[][] {
  const nodes = new Map(tiles.filter(t => t.tileType === "path").map(t => [`${t.gridX}:${t.gridZ}`, t]));
  const links = new Map<string, string[]>();
  for (const [key, tile] of nodes) {
    const neighbours: string[] = [];
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const neighbour = `${tile.gridX + dx}:${tile.gridZ + dz}`;
      if (!nodes.has(neighbour)) continue;
      if (dx && dz && (nodes.has(`${tile.gridX + dx}:${tile.gridZ}`) || nodes.has(`${tile.gridX}:${tile.gridZ + dz}`))) continue;
      neighbours.push(neighbour);
    }
    links.set(key, neighbours);
  }
  const visited = new Set<string>();
  const edge = (a: string, b: string) => [a, b].sort().join("|");
  const point = (key: string): Point => { const t = nodes.get(key)!; return [t.gridX * CELL, t.gridZ * CELL]; };
  const lines: Point[][] = [];
  const walk = (start: string, next: string) => {
    if (visited.has(edge(start, next))) return;
    const line = [point(start)];
    let previous = start, current = next;
    for (;;) {
      visited.add(edge(previous, current));
      line.push(point(current));
      const neighbours = links.get(current)!;
      if (neighbours.length !== 2 || current === start) break;
      const onward = neighbours.find(n => n !== previous)!;
      if (visited.has(edge(current, onward))) break;
      previous = current; current = onward;
    }
    lines.push(line);
  };
  for (const [key, neighbours] of links) {
    if (!neighbours.length) lines.push([point(key)]);
    if (neighbours.length !== 2) for (const next of neighbours) walk(key, next);
  }
  for (const [key, neighbours] of links) for (const next of neighbours) walk(key, next);
  return lines;
}

/** Union the curved strokes into one surface: junctions never overlap/flicker,
 * ends are rounded, and world-space UVs keep gravel at a consistent scale. */
export function buildOrganicPath(tiles: CentralWorldGroundTile[], radius = RADIUS) {
  const lines = pathCentreLines(tiles);
  if (!lines.length) return { surface: new THREE.BufferGeometry(), edge: new THREE.BufferGeometry() };
  const points = lines.flat();
  const originX = Math.floor((Math.min(...points.map(p => p[0])) - radius - 1) / STEP) * STEP;
  const originZ = Math.floor((Math.min(...points.map(p => p[1])) - radius - 1) / STEP) * STEP;
  const columns = Math.ceil((Math.max(...points.map(p => p[0])) + radius + 1 - originX) / STEP) + 1;
  const rows = Math.ceil((Math.max(...points.map(p => p[1])) + radius + 1 - originZ) / STEP) + 1;
  const field = new Float32Array(columns * rows).fill(-3);
  const stamp = ([x, z]: Point) => {
    const extent = radius + 0.5;
    const minX = Math.max(0, Math.floor((x - extent - originX) / STEP)), maxX = Math.min(columns - 1, Math.ceil((x + extent - originX) / STEP));
    const minZ = Math.max(0, Math.floor((z - extent - originZ) / STEP)), maxZ = Math.min(rows - 1, Math.ceil((z + extent - originZ) / STEP));
    for (let row = minZ; row <= maxZ; row++) for (let col = minX; col <= maxX; col++) {
      const index = row * columns + col;
      field[index] = Math.max(field[index], radius - Math.hypot(originX + col * STEP - x, originZ + row * STEP - z));
    }
  };
  for (const line of lines) {
    if (line.length === 1) { stamp(line[0]); continue; }
    // Relax grid stair-steps while retaining branch junctions and erased ends.
    let relaxed = line;
    for (let pass = 0; pass < 2; pass++) relaxed = relaxed.map((p, i, points): Point => {
      if (i === 0 || i === points.length - 1) return p;
      return [p[0] * .5 + (points[i - 1][0] + points[i + 1][0]) * .25,
        p[1] * .5 + (points[i - 1][1] + points[i + 1][1]) * .25];
    });
    const curve = new THREE.CatmullRomCurve3(relaxed.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");
    const samples = Math.ceil(curve.getLength() * 4);
    for (let i = 0; i <= samples; i++) { const p = curve.getPoint(i / samples); stamp([p.x, p.z]); }
  }
  // Other painted surfaces win in their cells. No path can grow across water
  // just because a neighbouring stroke has a rounded shoulder.
  for (const tile of tiles) {
    if (tile.tileType === "path") continue;
    const x = tile.gridX * CELL, z = tile.gridZ * CELL;
    const minX = Math.max(0, Math.ceil((x - 1 - originX) / STEP)), maxX = Math.min(columns - 1, Math.floor((x + 1 - originX) / STEP));
    const minZ = Math.max(0, Math.ceil((z - 1 - originZ) / STEP)), maxZ = Math.min(rows - 1, Math.floor((z + 1 - originZ) / STEP));
    for (let row = minZ; row <= maxZ; row++) for (let col = minX; col <= maxX; col++) {
      // Cut at the shared cell boundary, rather than pulling both materials
      // back from it and leaving a strip of grass between a path and road.
      const boundaryDistance = Math.max(Math.abs(originX + col * STEP - x) - 1, Math.abs(originZ + row * STEP - z) - 1);
      const index = row * columns + col;
      field[index] = Math.min(field[index], boundaryDistance);
    }
  }
  const geometry = (threshold: number, y: number) => {
    const vertices: number[] = [], uv: number[] = [];
    type Vertex = { x: number; z: number; value: number };
    const triangle = (a: Vertex, b: Vertex, c: Vertex) => {
      const polygon: Vertex[] = [];
      const input = [a, b, c];
      for (let i = 0; i < 3; i++) {
        const current = input[i], next = input[(i + 1) % 3];
        const inside = current.value >= threshold;
        if (inside) polygon.push(current);
        if (inside !== (next.value >= threshold)) {
          const t = (threshold - current.value) / (next.value - current.value);
          polygon.push({ x: current.x + (next.x - current.x) * t, z: current.z + (next.z - current.z) * t, value: threshold });
        }
      }
      for (let i = 1; i + 1 < polygon.length; i++) for (const p of [polygon[0], polygon[i], polygon[i + 1]]) {
        vertices.push(p.x, y, p.z); uv.push(p.x / 2, p.z / 2);
      }
    };
    const vertex = (col: number, row: number): Vertex => ({ x: originX + col * STEP, z: originZ + row * STEP, value: field[row * columns + col] });
    for (let row = 0; row < rows - 1; row++) for (let col = 0; col < columns - 1; col++) {
      const a = vertex(col, row), b = vertex(col, row + 1), c = vertex(col + 1, row + 1), d = vertex(col + 1, row);
      if (Math.max(a.value, b.value, c.value, d.value) < threshold) continue;
      triangle(a, b, c); triangle(a, c, d);
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    result.computeVertexNormals();
    return result;
  };
  return { surface: geometry(0, 0.087), edge: geometry(-0.14, 0.065) };
}
