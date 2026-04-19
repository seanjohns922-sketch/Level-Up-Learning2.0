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

/**
 * Background image per band.
 * L1 + L2 → Foundation City (shared)
 * L3 + L4 → Mid-City Data Canyon (shared)
 * L5     → High Spire (standalone)
 * L6     → Apex Sky-Vault (final)
 */
export function getHomeBg(levelNum: number): string {
  if (levelNum >= 6) return "/images/number-nexus-home-bg-y6.jpg";
  if (levelNum >= 5) return "/images/number-nexus-home-bg-y5.jpg";
  // L3 + L4 now share the L1/L2 Number Nexus look for visual continuity
  return "/images/number-nexus-home-bg.jpg";
}

/** Image filter per band — unified Level-5 "Clash Royale" crisp treatment across all levels */
export function getHomeBgFilter(_levelNum: number): string {
  // Single crisp recipe: punchy contrast, deeper blacks, vivid teals, no haze.
  return "brightness(1.12) contrast(1.22) saturate(1.28)";
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

/** Vignette intensity per band — unified crisp treatment, slightly stronger for apex */
export function getVignetteStyle(levelNum: number): string {
  const band = getLevelBand(levelNum);
  if (band === "apex") {
    return "inset 0 0 160px 60px rgba(5,15,30,0.55), inset 0 -60px 80px -20px rgba(5,15,30,0.4)";
  }
  // Foundation + advanced share the L5-style vignette for visual consistency
  return "inset 0 0 150px 55px rgba(5,18,35,0.48), inset 0 -60px 80px -20px rgba(5,18,35,0.36)";
}
