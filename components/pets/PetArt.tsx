// Procedural collectible-pet art. Each species is a self-contained SVG with
// heavy gloss + radial shading so it reads as a rounded, 3D-ish companion (the
// same technique as the gems/avatar). Rendered as an inline data-URI <img> so
// gradient ids never collide when many pets share a page (e.g. the marketplace
// grid). Fixed palette per species — no external image assets.

export type PetSpecies =
  | "puppy"
  | "bunny"
  | "turtle"
  | "cat"
  | "penguin"
  | "owl"
  | "fox"
  | "dino"
  | "dragon"
  | "unicorn";

export const PET_SPECIES: PetSpecies[] = ["puppy", "bunny", "turtle", "cat", "penguin", "owl", "fox", "dino", "dragon", "unicorn"];

// Map marketplace pet items → species. Prefer metadata.species; fall back to a
// key lookup (so the seeded pets render even before metadata is migrated).
const KEY_TO_SPECIES: Record<string, PetSpecies> = {
  pet_circuit_owl: "owl",
  pet_baby_turtle: "turtle",
  pet_ember_dragon: "dragon",
  pet_rusty_fox: "fox",
  pet_pebble_kitten: "cat",
  pet_cloud_bunny: "bunny",
  pet_spark_dino: "dino",
  pet_frost_penguin: "penguin",
  pet_scout_pup: "puppy",
  pet_star_unicorn: "unicorn",
};

export function petSpeciesForItem(itemKey: string, metadata?: Record<string, unknown> | null): PetSpecies {
  const fromMeta = metadata?.species;
  if (typeof fromMeta === "string" && (PET_SPECIES as string[]).includes(fromMeta)) return fromMeta as PetSpecies;
  return KEY_TO_SPECIES[itemKey] ?? "cat";
}

// ── Shared drawing helpers (return SVG string fragments) ───────────────────
const eyes = (lx = 55, rx = 85, y = 60, r = 9) =>
  `<ellipse cx="${lx}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="#fff"/><ellipse cx="${rx}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="#fff"/>` +
  `<circle cx="${lx}" cy="${y + 2.5}" r="${r * 0.62}" fill="#241c26"/><circle cx="${rx}" cy="${y + 2.5}" r="${r * 0.62}" fill="#241c26"/>` +
  `<circle cx="${lx + 2}" cy="${y}" r="${r * 0.24}" fill="#fff"/><circle cx="${rx + 2}" cy="${y}" r="${r * 0.24}" fill="#fff"/>` +
  `<circle cx="${lx - 2.5}" cy="${y + 4}" r="${r * 0.13}" fill="#fff" opacity="0.8"/><circle cx="${rx - 2.5}" cy="${y + 4}" r="${r * 0.13}" fill="#fff" opacity="0.8"/>`;
const cheeks = (c = "#ff9db0") =>
  `<ellipse cx="48" cy="70" rx="5" ry="3.2" fill="${c}" opacity="0.55"/><ellipse cx="92" cy="70" rx="5" ry="3.2" fill="${c}" opacity="0.55"/>`;
const sheen = (cx = 54, cy = 42) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="16" ry="11" fill="url(#glow)" opacity="0.5" transform="rotate(-20 ${cx} ${cy})"/>`;

type Pal = [string, string, string];
const BODIES: Record<PetSpecies, { pal: Pal; body: string }> = {
  puppy: {
    pal: ["#f6ddb0", "#d9a066", "#a9713a"],
    body:
      `<path d="M100 104 Q116 100 112 116 Q108 126 98 120 Q106 116 104 108 Z" fill="url(#Ib)"/>` +
      `<ellipse cx="70" cy="110" rx="26" ry="24" fill="url(#Ib)"/><ellipse cx="70" cy="116" rx="15" ry="14" fill="#f6e6cd" opacity="0.7"/>` +
      `<circle cx="70" cy="60" r="37" fill="url(#Ih)"/>` +
      `<path d="M40 44 Q26 46 28 72 Q30 88 44 82 Q38 66 44 50 Z" fill="#a9713a"/>` +
      `<path d="M100 44 Q114 46 112 72 Q110 88 96 82 Q102 66 96 50 Z" fill="#a9713a"/>` +
      `<path d="M40 46 Q30 50 31 68 Q33 80 43 78 Q39 64 44 52 Z" fill="#8a5a2c" opacity="0.5"/>` +
      `<ellipse cx="70" cy="72" rx="14" ry="11" fill="#f6e6cd" opacity="0.65"/>` +
      eyes(57, 83, 58, 8.5) +
      `<ellipse cx="70" cy="72" rx="4" ry="3.2" fill="#3d2b33"/>` +
      `<path d="M70 75 L70 79 M70 79 Q66 81 63 80 M70 79 Q74 81 77 80" stroke="#8a5a2c" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M70 79 Q70 86 74 88" stroke="#ff8fa3" stroke-width="3.4" stroke-linecap="round" fill="none"/>` +
      cheeks() + sheen(),
  },
  bunny: {
    pal: ["#ffffff", "#efe9df", "#cabda6"],
    body:
      `<path d="M52 20 Q46 -8 58 -6 Q66 -4 62 24 Z" fill="url(#Ih)"/><path d="M53 18 Q49 0 57 0 Q60 6 59 22 Z" fill="#f9a8d4" opacity="0.55"/>` +
      `<path d="M88 20 Q94 -8 82 -6 Q74 -4 78 24 Z" fill="url(#Ih)"/><path d="M87 18 Q91 0 83 0 Q80 6 81 22 Z" fill="#f9a8d4" opacity="0.55"/>` +
      `<ellipse cx="70" cy="108" rx="27" ry="26" fill="url(#Ib)"/><ellipse cx="70" cy="114" rx="16" ry="15" fill="#fff" opacity="0.7"/>` +
      `<circle cx="70" cy="62" r="36" fill="url(#Ih)"/>` +
      eyes(57, 83, 62, 8.5) +
      `<path d="M67 74 L70 77 L73 74 Z" fill="#f472b6"/>` +
      `<path d="M70 77 L70 80 M70 80 Q66 82 63 81 M70 80 Q74 82 77 81" stroke="#cabda6" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M44 66 L32 64 M44 71 L32 72 M96 66 L108 64 M96 71 L108 72" stroke="#cabda6" stroke-width="1" opacity="0.6" stroke-linecap="round"/>` +
      cheeks() + sheen(54, 46),
  },
  turtle: {
    pal: ["#bbf0c0", "#4ade80", "#15803d"],
    body:
      `<ellipse cx="46" cy="120" rx="8" ry="6" fill="#38a169"/><ellipse cx="94" cy="120" rx="8" ry="6" fill="#38a169"/>` +
      `<path d="M70 66 Q34 70 34 104 Q34 128 70 128 Q106 128 106 104 Q106 70 70 66 Z" fill="url(#Ib)"/>` +
      `<g stroke="#166534" stroke-width="1.6" fill="none" opacity="0.55">` +
      `<path d="M70 82 L70 70 M70 82 L54 76 M70 82 L86 76 M70 82 L58 96 M70 82 L82 96"/>` +
      `<path d="M46 100 Q58 96 58 96 M94 100 Q82 96 82 96 M58 96 L58 118 M82 96 L82 118 M58 118 Q70 122 82 118"/></g>` +
      `<ellipse cx="58" cy="86" rx="7" ry="5" fill="#86efac" opacity="0.5"/>` +
      `<ellipse cx="70" cy="48" rx="27" ry="24" fill="url(#Ih)"/>` +
      eyes(59, 81, 48, 8.5) +
      `<path d="M63 59 Q70 64 77 59" stroke="#166534" stroke-width="1.8" stroke-linecap="round" fill="none"/>` +
      `<ellipse cx="50" cy="56" rx="5" ry="3.2" fill="#fca5a5" opacity="0.55"/><ellipse cx="90" cy="56" rx="5" ry="3.2" fill="#fca5a5" opacity="0.55"/>` +
      sheen(58, 36),
  },
  cat: {
    pal: ["#d7dbe0", "#94a3b8", "#556072"],
    body:
      `<path d="M98 100 Q126 96 120 122 Q114 136 100 128 Q112 122 108 108 Q104 100 98 104 Z" fill="url(#Ib)"/>` +
      `<ellipse cx="70" cy="110" rx="26" ry="24" fill="url(#Ib)"/><ellipse cx="70" cy="116" rx="15" ry="14" fill="#f1f5f9" opacity="0.6"/>` +
      `<circle cx="70" cy="60" r="37" fill="url(#Ih)"/><path d="M44 32 L40 10 L60 28 Z" fill="url(#Ih)"/><path d="M96 32 L100 10 L80 28 Z" fill="url(#Ih)"/>` +
      `<path d="M46 28 L44 16 L54 26 Z" fill="#ff9db0" opacity="0.7"/><path d="M94 28 L96 16 L86 26 Z" fill="#ff9db0" opacity="0.7"/>` +
      eyes(57, 83, 60, 8.5) +
      `<path d="M66 74 L70 77 L74 74 Z" fill="#ff9db0"/>` +
      `<path d="M70 77 L70 80 M70 80 Q66 82 63 81 M70 80 Q74 82 77 81" stroke="#556072" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M40 62 L30 60 M40 68 L30 68 M100 62 L110 60 M100 68 L110 68" stroke="#fff" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/>` +
      cheeks() + sheen(),
  },
  penguin: {
    pal: ["#7c8ba1", "#3b4758", "#1e2732"],
    body:
      `<path d="M40 92 Q30 104 38 120 Q44 118 46 104 Z" fill="url(#Ib)"/><path d="M100 92 Q110 104 102 120 Q96 118 94 104 Z" fill="url(#Ib)"/>` +
      `<ellipse cx="70" cy="102" rx="32" ry="34" fill="url(#Ib)"/>` +
      `<path d="M70 74 Q50 80 50 106 Q58 128 70 130 Q82 128 90 106 Q90 80 70 74 Z" fill="#f8fafc"/>` +
      `<circle cx="70" cy="56" r="34" fill="url(#Ih)"/>` +
      `<path d="M70 44 Q46 46 48 66 Q58 74 70 74 Q82 74 92 66 Q94 46 70 44 Z" fill="#f8fafc"/>` +
      eyes(60, 80, 56, 8) +
      `<path d="M64 66 L70 74 L76 66 Z" fill="#f59e0b"/><path d="M66 70 L74 70" stroke="#b45309" stroke-width="1" opacity="0.6"/>` +
      `<ellipse cx="58" cy="126" rx="8" ry="4" fill="#f59e0b"/><ellipse cx="82" cy="126" rx="8" ry="4" fill="#f59e0b"/>` +
      sheen(56, 40),
  },
  owl: {
    pal: ["#a5f3fc", "#22d3ee", "#0e7490"],
    body:
      `<ellipse cx="70" cy="98" rx="34" ry="36" fill="url(#Ib)"/>` +
      `<path d="M70 70 Q52 76 50 100 Q58 120 70 122 Q82 120 90 100 Q88 76 70 70 Z" fill="#ecfeff" opacity="0.6"/>` +
      `<path d="M42 66 L34 44 Q48 50 52 64 Z" fill="url(#Ib)"/><path d="M98 66 L106 44 Q92 50 88 64 Z" fill="url(#Ib)"/>` +
      `<circle cx="70" cy="60" r="34" fill="url(#Ih)"/><path d="M52 34 L58 20 L66 32 Z" fill="url(#Ih)"/><path d="M88 34 L82 20 L74 32 Z" fill="url(#Ih)"/>` +
      `<circle cx="56" cy="58" r="15" fill="#ecfeff"/><circle cx="84" cy="58" r="15" fill="#ecfeff"/>` +
      `<circle cx="56" cy="59" r="9" fill="#0e7490"/><circle cx="84" cy="59" r="9" fill="#0e7490"/>` +
      `<circle cx="56" cy="60" r="5" fill="#241c26"/><circle cx="84" cy="60" r="5" fill="#241c26"/>` +
      `<circle cx="59" cy="56" r="2.4" fill="#fff"/><circle cx="87" cy="56" r="2.4" fill="#fff"/>` +
      `<path d="M64 68 L70 76 L76 68 Z" fill="#fbbf24"/>` +
      `<path d="M40 96 H30 M40 104 H30 M100 96 H110 M100 104 H110" stroke="#67e8f9" stroke-width="1.4" opacity="0.7" stroke-linecap="round"/>` +
      sheen(),
  },
  fox: {
    pal: ["#ffc182", "#f97316", "#c2410c"],
    body:
      `<path d="M96 96 Q128 88 122 120 Q116 138 98 128 Q112 120 108 104 Q104 96 96 100 Z" fill="url(#Ib)"/>` +
      `<path d="M112 108 Q124 104 120 122 Q116 132 106 126 Q114 120 112 110 Z" fill="#fff" opacity="0.85"/>` +
      `<ellipse cx="70" cy="110" rx="27" ry="25" fill="url(#Ib)"/><ellipse cx="70" cy="116" rx="16" ry="15" fill="#fff" opacity="0.9"/>` +
      `<circle cx="70" cy="60" r="38" fill="url(#Ih)"/>` +
      `<path d="M40 34 L34 6 L58 28 Z" fill="url(#Ih)"/><path d="M100 34 L106 6 L82 28 Z" fill="url(#Ih)"/>` +
      `<path d="M42 30 L40 14 L52 26 Z" fill="#7c2d12" opacity="0.6"/><path d="M98 30 L100 14 L88 26 Z" fill="#7c2d12" opacity="0.6"/>` +
      `<path d="M70 58 Q48 62 46 82 Q58 92 70 90 Q82 92 94 82 Q92 62 70 58 Z" fill="#fff" opacity="0.92"/>` +
      eyes(58, 82, 60, 8.5) +
      `<path d="M66 76 L70 80 L74 76 Z" fill="#3d2b33"/>` +
      cheeks() + sheen(),
  },
  dino: {
    pal: ["#a7f3d0", "#34d399", "#047857"],
    body:
      `<path d="M66 30 L60 18 L72 26 Z" fill="#059669"/><path d="M58 40 L50 28 L64 36 Z" fill="#059669"/><path d="M50 54 L40 46 L56 50 Z" fill="#059669"/>` +
      `<ellipse cx="72" cy="106" rx="30" ry="28" fill="url(#Ib)"/><ellipse cx="72" cy="114" rx="17" ry="15" fill="#d1fae5" opacity="0.6"/>` +
      `<path d="M46 100 Q34 100 34 112 Q34 122 44 120 Q40 112 48 108 Z" fill="url(#Ib)"/>` +
      `<ellipse cx="66" cy="58" rx="36" ry="33" fill="url(#Ih)"/>` +
      `<path d="M40 66 Q30 66 30 74 Q30 80 40 78 Z" fill="url(#Ih)"/>` +
      eyes(58, 84, 50, 9) +
      `<path d="M40 70 Q54 78 74 74" stroke="#065f46" stroke-width="2.2" stroke-linecap="round" fill="none"/>` +
      `<path d="M46 72 L48 76 M54 74 L55 78 M62 75 L63 79" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>` +
      cheeks("#fca5a5") + sheen(52, 38),
  },
  dragon: {
    pal: ["#c4a0ff", "#8b5cf6", "#5b21b6"],
    body:
      `<path d="M30 78 Q18 70 20 84 Q22 96 34 92 Z" fill="url(#Ib)"/><path d="M110 78 Q122 70 120 84 Q118 96 106 92 Z" fill="url(#Ib)"/>` +
      `<path d="M30 80 Q22 74 24 84 Q26 92 34 89 Z" fill="#6d28d9" opacity="0.5"/><path d="M110 80 Q118 74 116 84 Q114 92 106 89 Z" fill="#6d28d9" opacity="0.5"/>` +
      `<ellipse cx="70" cy="108" rx="30" ry="28" fill="url(#Ib)"/><ellipse cx="70" cy="116" rx="17" ry="16" fill="#ede9fe" opacity="0.5"/>` +
      `<circle cx="70" cy="58" r="40" fill="url(#Ih)"/>` +
      `<path d="M52 26 L48 8 L62 22 Z" fill="#fbbf24"/><path d="M88 26 L92 8 L78 22 Z" fill="#fbbf24"/>` +
      `<ellipse cx="70" cy="70" rx="15" ry="11" fill="#ede9fe" opacity="0.55"/><ellipse cx="64" cy="72" rx="2" ry="2.4" fill="#5b21b6"/><ellipse cx="76" cy="72" rx="2" ry="2.4" fill="#5b21b6"/>` +
      eyes(56, 84, 56, 10) + cheeks("#f0abfc") +
      `<path d="M63 66 Q70 71 77 66" stroke="#4c1d95" stroke-width="2" stroke-linecap="round" fill="none"/>` +
      sheen(),
  },
  unicorn: {
    pal: ["#ffffff", "#f3ecfb", "#d8c7e8"],
    body:
      `<ellipse cx="70" cy="110" rx="28" ry="26" fill="url(#Ib)"/><ellipse cx="70" cy="116" rx="16" ry="15" fill="#fff" opacity="0.7"/>` +
      `<circle cx="70" cy="58" r="39" fill="url(#Ih)"/>` +
      `<path d="M62 28 L70 3 L78 28 Z" fill="#fcd34d"/><path d="M64 24 L76 24 M66 18 L74 18 M67.5 12 L72.5 12" stroke="#f59e0b" stroke-width="1.5" opacity="0.7" stroke-linecap="round"/>` +
      `<path d="M40 34 Q30 22 34 44 Q26 40 32 58 Q40 52 44 42 Z" fill="#f9a8d4"/>` +
      `<path d="M44 30 Q36 22 40 40 Q34 38 38 52 Q44 48 48 40 Z" fill="#a5b4fc" opacity="0.9"/>` +
      `<path d="M100 34 Q110 22 106 44 Q114 40 108 58 Q100 52 96 42 Z" fill="#fca5a5"/>` +
      `<path d="M96 30 Q104 22 100 40 Q106 38 102 52 Q96 48 92 40 Z" fill="#fcd34d" opacity="0.9"/>` +
      eyes(56, 84, 58, 9.5) + cheeks() +
      `<path d="M66 72 Q70 76 74 72" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" fill="none"/>` +
      sheen(),
  },
};

function petSvg(species: PetSpecies): string {
  const { pal, body } = BODIES[species];
  const [light, base, dark] = pal;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 150">` +
    `<defs>` +
    `<radialGradient id="Ib" cx="0.38" cy="0.30" r="0.85"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></radialGradient>` +
    `<radialGradient id="Ih" cx="0.40" cy="0.28" r="0.9"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></radialGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    `<ellipse cx="70" cy="140" rx="33" ry="6.5" fill="#000" opacity="0.15"/>` +
    body +
    `</svg>`
  );
}

export default function PetArt({ species, size = 72, className }: { species: PetSpecies; size?: number; className?: string }) {
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(petSvg(species))}`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={Math.round((size * 150) / 140)} alt="" aria-hidden="true" className={className} draggable={false} />;
}
