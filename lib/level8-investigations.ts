/** Called only by explicit experiment controls; injected randomness supports checks. */
export function tossTwoCoins(
  trials: number,
  random: () => number = Math.random,
) {
  const counts = [0, 0, 0, 0];
  const recent: string[] = [];
  const labels = ["HH", "HT", "TH", "TT"];
  for (let i = 0; i < trials; i++) {
    const first = random() < 0.5 ? 0 : 1;
    const second = random() < 0.5 ? 0 : 1;
    const outcome = first * 2 + second;
    counts[outcome]++;
    recent.push(labels[outcome]);
  }
  return { counts, recent: recent.slice(-10) };
}

export function sampleCyclists(
  size: number,
  random: () => number = Math.random,
) {
  if (!Number.isInteger(size) || size < 1 || size > 100)
    throw new Error("Invalid sample size");
  const population = Array.from({ length: 100 }, (_, i) => i < 40);
  for (let i = population.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [population[i], population[j]] = [population[j], population[i]];
  }
  return population.slice(0, size).filter(Boolean).length;
}
