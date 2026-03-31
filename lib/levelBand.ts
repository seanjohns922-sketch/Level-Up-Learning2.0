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
  const band = getLevelBand(levelNum);
  switch (band) {
    case "apex":
      // TODO: generate apex bg when Level 6 content is ready
      return "/images/number-nexus-home-bg-y4.jpg";
    case "advanced":
      return "/images/number-nexus-home-bg-y4.jpg";
    default:
      return levelNum >= 3
        ? "/images/number-nexus-home-bg-y3.jpg"
        : "/images/number-nexus-home-bg.jpg";
  }
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
      return "brightness(1.3) contrast(1.12) saturate(1.15)";
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
      return "inset 0 0 120px 40px rgba(5,20,35,0.35), inset 0 -60px 80px -20px rgba(5,20,35,0.25)";
  }
}
