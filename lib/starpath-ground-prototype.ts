// Review examples only. Not connected to diagnostic banks or student results.
export type Point = { x: number; y: number };
export type Piece = Point & { turn: number };

export function isTriangle(points: Point[]) {
  if (points.length !== 3) return false;
  const [a, b, c] = points;
  return (b.x - a.x) * (c.y - a.y) !== (b.y - a.y) * (c.x - a.x);
}

// Equal right-isosceles triangles form a square when their hypotenuses
// coincide and their interiors are on opposite sides. All quarter turns work.
export function isComposedSquare(pieces: Piece[]) {
  if (pieces.length !== 2) return false;
  const [a, b] = pieces;
  return a.x === b.x && a.y === b.y && ((a.turn - b.turn + 4) % 4 === 2);
}

export function isBeside(cell: number | null) {
  return cell === 3 || cell === 5;
}
