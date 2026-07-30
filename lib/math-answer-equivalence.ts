const PARTITION_PROMPT_PATTERNS = [
  /different way to partition\s+([\d,]+)/i,
  /expanded form matches\s+([\d,]+)/i,
];

export function evaluateAdditiveExpression(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const source = String(value).replaceAll(",", "").replaceAll("−", "-").trim();
  if (!source || !/^[+-]?\d+(?:\.\d+)?(?:\s*[+-]\s*\d+(?:\.\d+)?)*$/.test(source)) {
    return null;
  }

  const terms = source.match(/[+-]?\s*\d+(?:\.\d+)?/g);
  if (!terms?.length) return null;
  const total = terms.reduce((sum, term) => sum + Number(term.replace(/\s/g, "")), 0);
  return Number.isFinite(total) ? total : null;
}

export function expectedPartitionTarget(prompt: string): number | null {
  for (const pattern of PARTITION_PROMPT_PATTERNS) {
    const match = prompt.match(pattern);
    if (!match) continue;
    const target = Number(match[1].replaceAll(",", ""));
    if (Number.isFinite(target)) return target;
  }
  return null;
}

export function additiveAnswerMatchesTarget(answer: unknown, target: number | null | undefined) {
  if (typeof target !== "number" || !Number.isFinite(target)) return false;
  const evaluated = evaluateAdditiveExpression(answer);
  return evaluated !== null && Math.abs(evaluated - target) < 1e-9;
}
