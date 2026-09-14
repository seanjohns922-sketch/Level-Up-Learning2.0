import type { PracticeTask } from "@/data/activities/year1/practice-task";
type WorkshopTask = Extract<PracticeTask, { kind: "starpathShapeWorkshop" }>;
type Point = WorkshopTask["points"][number];

function orientation(a: Point, b: Point, c: Point) {
  return (b.c - a.c) * (c.r - a.r) - (b.r - a.r) * (c.c - a.c);
}

function liesOnSegment(a: Point, b: Point, point: Point) {
  return orientation(a, b, point) === 0
    && point.c >= Math.min(a.c, b.c)
    && point.c <= Math.max(a.c, b.c)
    && point.r >= Math.min(a.r, b.r)
    && point.r <= Math.max(a.r, b.r);
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  return (abC * abD < 0 && cdA * cdB < 0)
    || (abC === 0 && liesOnSegment(a, b, c))
    || (abD === 0 && liesOnSegment(a, b, d))
    || (cdA === 0 && liesOnSegment(c, d, a))
    || (cdB === 0 && liesOnSegment(c, d, b));
}

function isSimplePolygon(points: Point[]) {
  if (points.length < 3) return false;
  if (points.some((point, index) => orientation(points[index - 1] ?? points.at(-1)!, point, points[(index + 1) % points.length]!) === 0)) {
    return false;
  }
  for (let first = 0; first < points.length; first += 1) {
    const firstNext = (first + 1) % points.length;
    for (let second = first + 1; second < points.length; second += 1) {
      const secondNext = (second + 1) % points.length;
      if (first === second || firstNext === second || secondNext === first) continue;
      if (segmentsIntersect(points[first]!, points[firstNext]!, points[second]!, points[secondNext]!)) return false;
    }
  }
  return true;
}

function parallelPairCount(points: Point[]) {
  const edges = points.map((point, index) => {
    const next = points[(index + 1) % points.length]!;
    return { x: next.c - point.c, y: next.r - point.r };
  });
  let pairs = 0;
  for (let first = 0; first < edges.length; first += 1) {
    for (let second = first + 1; second < edges.length; second += 1) {
      if (edges[first]!.x * edges[second]!.y === edges[first]!.y * edges[second]!.x) pairs += 1;
    }
  }
  return pairs;
}

export function assessmentConstructionIsCorrect(task: WorkshopTask, points: Point[]) {
  if (points.length !== task.points.length || !isSimplePolygon(points)) return false;
  const edges = points.map((p, i) => ({x: points[(i + 1) % points.length]!.c - p.c, y: points[(i + 1) % points.length]!.r - p.r}));
  const rightAngles = edges.every((edge, i) => edge.x * edges[(i + 1) % edges.length]!.x + edge.y * edges[(i + 1) % edges.length]!.y === 0);
  const lengths = edges.map(edge => edge.x * edge.x + edge.y * edge.y);
  if (task.orientationConstraint === "oblique" && edges.some(edge => edge.x === 0 || edge.y === 0)) return false;
  const rule = task.constructionRule;
  if (!rule) return false; // Assessment authors must declare the property being assessed.
  if (rule === "square") return points.length === 4 && rightAngles && lengths.every(length => length === lengths[0]);
  if (rule === "rectangle") return points.length === 4 && rightAngles;
  if (rule === "parallel-pair") return parallelPairCount(points) >= 1;
  if (rule === "two-parallel-pairs") return points.length === 4 && parallelPairCount(points) === 2;
  return rule === "polygon";
}
