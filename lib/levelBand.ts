/**
 * Level-band theming system for Number Nexus visual evolution.
 *
 * Level 1–3: Foundation City — clean, bright, beginner tech feel
 * Level 4–5: Advanced Nexus Core — darker, sharper, data-stream aesthetic
 * Level 6:   Tower Apex — epic, cinematic, endgame energy
 */

export type LevelBand = "foundation" | "advanced" | "apex";

export function getLevelBand(levelNum: number): LevelBand {
  if (levelNum >= 6) return "apex";
  if (levelNum >= 4) return "advanced";
  return "foundation";
}

/** Background image per band */
export function getHomeBg(levelNum: number): string {
  if (levelNum >= 6) return "/images/number-nexus-home-bg-y5.jpg"; // apex reuses y5 for now
  if (levelNum >= 5) return "/images/number-nexus-home-bg-y5.jpg";
  if (levelNum >= 4) return "/images/number-nexus-home-bg-y4.jpg";
  if (levelNum >= 3) return "/images/number-nexus-home-bg-y3.jpg";
  return "/images/number-nexus-home-bg.jpg";
}

/** Image filter per band */
export function getHomeBgFilter(levelNum: number): string {
  const band = getLevelBand(levelNum);
  switch (band) {
    case "apex":
      return "brightness(1.15) contrast(1.2) saturate(1.25)";
    case "advanced":
      return "brightness(1.1) contrast(1.18) saturate(1.2)";
    default:
      return levelNum >= 3
        ? "brightness(1.05) contrast(1.18) saturate(1.2)"
        : "brightness(1.08) contrast(1.16) saturate(1.18)";
  }
}

/** Particle palette per band */
export type ParticleColors = [string, string, string, string];

export function getParticleColors(levelNum: number): ParticleColors {
  const band = getLevelBand(levelNum);
  switch (band) {
    case "apex":
      return [
        "rgba(255,220,100,0.8)",
        "rgba(31,209,181,0.7)",
        "rgba(255,255,255,0.6)",
        "rgba(200,160,255,0.5)",
      ];
    case "advanced":
      return [
        "rgba(31,209,181,0.8)",
        "rgba(0,255,200,0.6)",
        "rgba(100,220,255,0.5)",
        "rgba(255,220,100,0.4)",
      ];
    default:
      return [
        "rgba(31,209,181,0.7)",
        "rgba(56,230,200,0.5)",
        "rgba(255,255,255,0.5)",
        "rgba(255,220,100,0.4)",
      ];
  }
}

/** Glow colour per band */
export function getGlowColor(levelNum: number): string {
  const band = getLevelBand(levelNum);
  switch (band) {
    case "apex":
      return "rgba(255,200,80,0.45)";
    case "advanced":
      return "rgba(0,230,200,0.5)";
    default:
      return "rgba(31,209,181,0.45)";
  }
}

/** Vignette intensity per band */
export function getVignetteStyle(levelNum: number): string {
  const band = getLevelBand(levelNum);
  switch (band) {
    case "apex":
      return "inset 0 0 160px 60px rgba(5,15,30,0.55), inset 0 -60px 80px -20px rgba(5,15,30,0.4)";
    case "advanced":
      return "inset 0 0 140px 50px rgba(5,18,35,0.45), inset 0 -60px 80px -20px rgba(5,18,35,0.35)";
    default:
      return levelNum >= 3
        ? "inset 0 0 140px 50px rgba(5,18,35,0.42), inset 0 -60px 80px -20px rgba(5,18,35,0.32)"
        : "inset 0 0 135px 45px rgba(5,18,35,0.40), inset 0 -60px 80px -20px rgba(5,18,35,0.30)";
  }
}
