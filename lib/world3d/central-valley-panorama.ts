import type { CentralWorldQuality } from "./central-world-config";

export const VALLEY_SECTION_COUNT = 6;
// Each native 1774px section supplies 60 degrees plus 15 degrees of overlap.
// Effective circumference: 6 * 1774 * .8 = 8515 unique horizontal samples.
export const VALLEY_SECTION_CROP = .8;
export function centralValleyAssets(quality: CentralWorldQuality, maxTextureSize = 4096) {
  const lite = quality === "low" || maxTextureSize < 1774;
  return Array.from({length:VALLEY_SECTION_COUNT}, (_,i) => `/images/central-valley-stylised/section-${i+1}${lite?"-lite":""}.webp`);
}

/** CPU mirror of the wraparound sampler for seam regression checks. */
export function valleySampleAt(u: number) {
  const position = ((u % 1 + 1) % 1) * VALLEY_SECTION_COUNT;
  const section = Math.floor(position), local = position - section;
  const currentU = (local - .5) * VALLEY_SECTION_CROP + .5;
  if (local < .04) return {section, currentU, neighbour:(section+5)%6, neighbourU:currentU+.8, weight: .5 * (1-local/.04)};
  if (local > .96) return {section, currentU, neighbour:(section+1)%6, neighbourU:currentU-.8, weight: .5 * (local-.96)/.04};
  return {section,currentU,neighbour:section,neighbourU:currentU,weight:0};
}
