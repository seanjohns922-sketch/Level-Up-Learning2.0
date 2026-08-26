import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outputDir = path.join(process.cwd(), "public", "marketplace", "central-world");
mkdirSync(outputDir, { recursive: true });

const items = [
  ["reflection_pond", "#38bdf8", ["pond", "small-reeds", "soft-ripples"]],
  ["willow_lake", "#0ea5e9", ["lake", "willow", "wide-ripples"]],
  ["crystal_reservoir", "#8b5cf6", ["reservoir", "crystals", "glow"]],
  ["practice_court", "#f59e0b", ["court", "cones", "hoop"]],
  ["explorer_gym", "#f97316", ["gym", "bars", "mats"]],
  ["champion_arena", "#eab308", ["arena", "banners", "podium"]],
  ["wildflower_garden", "#22c55e", ["garden", "flowers", "path"]],
  ["scholar_grove", "#16a34a", ["grove", "books", "shade"]],
  ["starlight_conservatory", "#a855f7", ["conservatory", "stars", "glass"]],
  ["timber_footbridge", "#a16207", ["timber-bridge", "stream", "planks"]],
  ["stone_arch_bridge", "#64748b", ["stone-bridge", "stream", "arch"]],
  ["lumina_bridge", "#06b6d4", ["lumina-bridge", "stream", "glow"]],
  ["garden_fence", "#84cc16", ["fence", "flowers", "gate"]],
  ["stone_boundary", "#78716c", ["wall", "stones", "path"]],
  ["crystal_ward", "#c084fc", ["ward", "crystals", "barrier"]],
  ["picnic_circle", "#fb7185", ["picnic", "blanket", "table"]],
  ["explorer_plaza", "#14b8a6", ["plaza", "fountain", "benches"]],
  ["festival_courtyard", "#ec4899", ["festival", "flags", "stage"]],
  ["tool_shed", "#a16207", ["shed", "tools", "garden"]],
  ["maker_workshop", "#ea580c", ["workshop", "bench", "gears"]],
  ["inventor_hall", "#facc15", ["hall", "lamp", "gears"]],
  ["trail_lookout", "#60a5fa", ["lookout", "trail", "rail"]],
  ["skywatch_deck", "#6366f1", ["skydeck", "telescope", "night"]],
  ["celestial_observatory", "#7c3aed", ["observatory", "dome", "stars"]],
];

const esc = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function sky(tone, night = false) {
  return `
  <defs>
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${night ? "#172554" : "#7dd3fc"}"/>
      <stop offset="58%" stop-color="${night ? "#312e81" : "#fde68a"}"/>
      <stop offset="100%" stop-color="${night ? "#4338ca" : "#fef3c7"}"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>
  <circle cx="1060" cy="${night ? 116 : 150}" r="${night ? 42 : 72}" fill="${night ? "#f8fafc" : "#fde68a"}" opacity="${night ? 0.88 : 0.78}"/>
  <path d="M0 336 C160 274 252 306 390 246 C530 184 668 314 810 248 C970 174 1082 276 1280 222 L1280 720 L0 720 Z" fill="#166534" opacity="0.34"/>
  <path d="M0 420 C168 360 280 392 426 348 C596 298 738 408 900 354 C1064 300 1164 378 1280 328 L1280 720 L0 720 Z" fill="#15803d" opacity="0.48"/>
  <path d="M0 520 C190 466 350 500 512 458 C674 418 840 526 1014 466 C1128 428 1206 458 1280 436 L1280 720 L0 720 Z" fill="url(#grass)"/>
  <path d="M0 648 C172 608 340 614 520 640 C704 668 876 610 1046 626 C1132 634 1208 668 1280 646 L1280 720 L0 720 Z" fill="#15803d" opacity="0.42"/>
  <path d="M134 482 C232 452 312 466 400 438" stroke="#fef9c3" stroke-width="18" stroke-linecap="round" opacity="0.42"/>
  <path d="M56 568 C250 516 408 572 586 520 C790 462 1012 514 1216 462" fill="none" stroke="${tone}" stroke-width="6" opacity="0.32"/>`;
}

function water(cx, cy, rx, ry, fill = "#38bdf8") {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="0.82" filter="url(#soft)"/>
  <ellipse cx="${cx}" cy="${cy - 10}" rx="${Math.round(rx * 0.78)}" ry="${Math.round(ry * 0.42)}" fill="#e0f2fe" opacity="0.32"/>
  <path d="M${cx - rx * 0.65} ${cy} C${cx - rx * 0.34} ${cy - 18} ${cx + rx * 0.32} ${cy + 18} ${cx + rx * 0.64} ${cy}" fill="none" stroke="#e0f2fe" stroke-width="8" opacity="0.55" stroke-linecap="round"/>`;
}

function tree(x, y, scale = 1, willow = false) {
  const crown = willow
    ? `<ellipse cx="${x}" cy="${y - 86 * scale}" rx="${76 * scale}" ry="${94 * scale}" fill="#65a30d"/><path d="M${x - 54 * scale} ${y - 90 * scale} C${x - 72 * scale} ${y - 30 * scale} ${x - 46 * scale} ${y + 14 * scale} ${x - 68 * scale} ${y + 58 * scale}" stroke="#84cc16" stroke-width="${12 * scale}" fill="none" stroke-linecap="round"/><path d="M${x + 48 * scale} ${y - 94 * scale} C${x + 70 * scale} ${y - 30 * scale} ${x + 36 * scale} ${y + 6 * scale} ${x + 60 * scale} ${y + 56 * scale}" stroke="#84cc16" stroke-width="${12 * scale}" fill="none" stroke-linecap="round"/>`
    : `<circle cx="${x}" cy="${y - 92 * scale}" r="${54 * scale}" fill="#15803d"/><circle cx="${x - 36 * scale}" cy="${y - 72 * scale}" r="${44 * scale}" fill="#16a34a"/><circle cx="${x + 36 * scale}" cy="${y - 70 * scale}" r="${45 * scale}" fill="#22c55e"/>`;
  return `<rect x="${x - 12 * scale}" y="${y - 80 * scale}" width="${24 * scale}" height="${100 * scale}" rx="${10 * scale}" fill="#854d0e"/>${crown}`;
}

function building(kind, tone) {
  if (kind === "court") return `<rect x="350" y="376" width="580" height="260" rx="30" fill="#d97706" opacity="0.9" filter="url(#soft)"/><rect x="392" y="416" width="496" height="176" rx="14" fill="#fef3c7" opacity="0.92"/><path d="M640 416 L640 592 M392 504 L888 504" stroke="#d97706" stroke-width="9"/><circle cx="640" cy="504" r="52" fill="none" stroke="#d97706" stroke-width="8"/><rect x="764" y="354" width="62" height="88" rx="8" fill="#f8fafc"/><circle cx="795" cy="454" r="28" fill="none" stroke="#f97316" stroke-width="8"/>`;
  if (kind === "gym") return `<rect x="342" y="330" width="596" height="292" rx="28" fill="#fed7aa" filter="url(#soft)"/><rect x="398" y="376" width="484" height="188" rx="18" fill="#fff7ed"/><path d="M476 536 L476 418 L812 418 L812 536" stroke="#ea580c" stroke-width="18" fill="none" stroke-linecap="round"/><rect x="458" y="544" width="364" height="32" rx="16" fill="#fdba74"/><circle cx="532" cy="496" r="32" fill="#fb923c"/><circle cx="748" cy="496" r="32" fill="#fb923c"/>`;
  if (kind === "arena") return `<ellipse cx="640" cy="590" rx="362" ry="74" fill="#ca8a04" opacity="0.65"/><path d="M290 520 C350 370 470 300 640 300 C810 300 930 370 990 520 Z" fill="#fde68a" filter="url(#soft)"/><path d="M364 502 C430 408 512 366 640 366 C768 366 850 408 916 502" fill="none" stroke="#ca8a04" stroke-width="28"/><rect x="576" y="472" width="128" height="70" rx="12" fill="#facc15"/><path d="M428 326 L428 470 M852 326 L852 470" stroke="#92400e" stroke-width="14"/><path d="M428 326 L512 352 L428 378 M852 326 L768 352 L852 378" fill="${tone}"/>`;
  if (kind === "conservatory") return `<path d="M344 604 L936 604 L884 372 Q640 230 396 372 Z" fill="#ddd6fe" opacity="0.88" filter="url(#soft)"/><path d="M398 596 L882 596 L838 394 Q640 286 442 394 Z" fill="#f5f3ff" opacity="0.62"/><path d="M640 300 L640 604 M464 384 L816 384 M408 480 L872 480" stroke="#8b5cf6" stroke-width="10" opacity="0.7"/><circle cx="518" cy="540" r="20" fill="#f472b6"/><circle cx="598" cy="520" r="18" fill="#22c55e"/><circle cx="704" cy="536" r="22" fill="#a855f7"/>`;
  if (kind === "shed") return `<rect x="420" y="382" width="430" height="210" rx="18" fill="#92400e" filter="url(#soft)"/><path d="M382 396 L640 270 L896 396 Z" fill="#a16207"/><rect x="492" y="430" width="116" height="162" rx="8" fill="#78350f"/><rect x="650" y="426" width="130" height="88" rx="10" fill="#fef3c7"/><path d="M742 562 L818 484 M804 488 L820 504" stroke="#facc15" stroke-width="14" stroke-linecap="round"/>`;
  if (kind === "workshop") return `<rect x="332" y="360" width="610" height="238" rx="22" fill="#fed7aa" filter="url(#soft)"/><path d="M388 360 L640 252 L888 360 Z" fill="#c2410c"/><rect x="420" y="430" width="156" height="74" rx="12" fill="#fff7ed"/><rect x="646" y="430" width="156" height="74" rx="12" fill="#fff7ed"/><circle cx="566" cy="552" r="34" fill="none" stroke="#ea580c" stroke-width="14"/><circle cx="720" cy="548" r="44" fill="none" stroke="#f97316" stroke-width="14"/>`;
  if (kind === "hall") return `<rect x="342" y="350" width="596" height="256" rx="22" fill="#fef3c7" filter="url(#soft)"/><path d="M316 360 L640 228 L964 360 Z" fill="#eab308"/><rect x="574" y="444" width="132" height="162" rx="66" fill="#92400e"/><circle cx="640" cy="348" r="36" fill="#facc15" filter="url(#glow)"/><circle cx="478" cy="514" r="34" fill="none" stroke="#ca8a04" stroke-width="12"/><circle cx="806" cy="514" r="34" fill="none" stroke="#ca8a04" stroke-width="12"/>`;
  return "";
}

function bridge(kind, tone) {
  const deck = kind === "timber"
    ? `<path d="M264 478 C412 418 858 418 1016 478 L1016 538 C832 492 448 492 264 538 Z" fill="#92400e" filter="url(#soft)"/><g stroke="#fef3c7" stroke-width="9" opacity="0.7">${Array.from({ length: 9 }, (_, index) => `<path d="M${330 + index * 76} 456 L${306 + index * 76} 526"/>`).join("")}</g>`
    : kind === "stone"
      ? `<path d="M250 526 C380 394 900 394 1030 526 L1030 594 L250 594 Z" fill="#cbd5e1" filter="url(#soft)"/><path d="M470 594 C488 486 792 486 810 594 Z" fill="#38bdf8" opacity="0.72"/><g stroke="#64748b" stroke-width="5" opacity="0.5">${Array.from({ length: 10 }, (_, index) => `<path d="M${300 + index * 74} 510 L${348 + index * 74} 584"/>`).join("")}</g>`
      : `<path d="M250 520 C380 382 900 382 1030 520 L1030 578 L250 578 Z" fill="#cffafe" filter="url(#soft)" opacity="0.9"/><path d="M302 516 C448 430 832 430 978 516" fill="none" stroke="${tone}" stroke-width="22" filter="url(#glow)"/><path d="M472 578 C490 480 790 480 808 578 Z" fill="#38bdf8" opacity="0.72"/>`;
  return `<path d="M80 590 C280 536 416 596 620 548 C850 494 1028 564 1200 514" fill="none" stroke="#38bdf8" stroke-width="96" opacity="0.76"/>${deck}`;
}

function fence(kind, tone) {
  if (kind === "fence") return `<g filter="url(#soft)" fill="#fef3c7" stroke="#a16207" stroke-width="8">${Array.from({ length: 12 }, (_, index) => `<path d="M${160 + index * 86} 520 L${160 + index * 86} 402 L${188 + index * 86} 374 L${216 + index * 86} 402 L${216 + index * 86} 520 Z"/>`).join("")}<path d="M136 454 L1140 454 M136 512 L1140 512"/></g>`;
  if (kind === "wall") return `<path d="M142 540 C318 482 500 510 662 482 C850 450 1010 480 1140 436 L1140 586 L142 586 Z" fill="#a8a29e" filter="url(#soft)"/><g stroke="#57534e" stroke-width="5" opacity="0.45">${Array.from({ length: 8 }, (_, index) => `<path d="M${190 + index * 116} 512 L${242 + index * 116} 580"/>`).join("")}<path d="M160 500 L1120 500 M160 552 L1120 552"/></g>`;
  return `<path d="M178 532 C346 444 506 520 660 456 C820 390 990 472 1102 416" fill="none" stroke="#e9d5ff" stroke-width="32" stroke-linecap="round" filter="url(#glow)"/><g fill="${tone}" filter="url(#glow)">${[240, 382, 538, 696, 856, 1010].map((x, index) => `<path d="M${x} ${510 - (index % 2) * 42} L${x + 28} ${450 - (index % 2) * 42} L${x + 58} ${510 - (index % 2) * 42} L${x + 28} ${572 - (index % 2) * 42} Z"/>`).join("")}</g>`;
}

function community(kind, tone) {
  if (kind === "picnic") return `<ellipse cx="640" cy="564" rx="360" ry="94" fill="#bbf7d0" filter="url(#soft)"/><rect x="514" y="496" width="252" height="126" rx="22" fill="#fb7185"/><path d="M514 560 L766 560 M640 496 L640 622" stroke="#fff1f2" stroke-width="12"/><rect x="408" y="462" width="118" height="52" rx="14" fill="#fef3c7"/><rect x="754" y="462" width="118" height="52" rx="14" fill="#fef3c7"/>`;
  if (kind === "plaza") return `<ellipse cx="640" cy="578" rx="420" ry="96" fill="#ccfbf1" filter="url(#soft)"/><circle cx="640" cy="492" r="92" fill="#5eead4"/><circle cx="640" cy="470" r="56" fill="#ecfeff"/><path d="M640 336 C610 402 604 438 640 470 C676 438 670 402 640 336 Z" fill="${tone}" filter="url(#glow)"/><rect x="354" y="514" width="132" height="32" rx="16" fill="#0f766e"/><rect x="794" y="514" width="132" height="32" rx="16" fill="#0f766e"/>`;
  return `<ellipse cx="640" cy="588" rx="430" ry="92" fill="#fbcfe8" filter="url(#soft)"/><rect x="480" y="470" width="320" height="104" rx="18" fill="#be185d"/><path d="M390 410 C530 330 750 486 896 390" fill="none" stroke="#f9a8d4" stroke-width="16"/><g>${[420, 500, 580, 660, 740, 820].map((x, index) => `<path d="M${x} ${408 + (index % 2) * 20} L${x + 42} ${444 + (index % 2) * 20} L${x - 6} ${462 + (index % 2) * 20} Z" fill="${index % 2 ? "#facc15" : tone}"/>`).join("")}</g>`;
}

function lookout(kind, tone) {
  if (kind === "trail") return `<path d="M190 660 C410 548 474 452 640 448 C810 444 854 548 1090 642" fill="none" stroke="#fef3c7" stroke-width="86" stroke-linecap="round" filter="url(#soft)"/><rect x="480" y="376" width="320" height="104" rx="20" fill="#92400e"/><path d="M500 376 L500 530 M780 376 L780 530 M470 424 L810 424" stroke="#fef3c7" stroke-width="14"/><path d="M528 320 L752 320 L808 376 L472 376 Z" fill="${tone}"/>`;
  if (kind === "skydeck") return `${sky(tone, true)}<ellipse cx="640" cy="598" rx="370" ry="82" fill="#c7d2fe" opacity="0.56"/><rect x="470" y="440" width="340" height="96" rx="18" fill="#312e81" filter="url(#soft)"/><path d="M504 440 L504 590 M776 440 L776 590 M450 486 L830 486" stroke="#c7d2fe" stroke-width="14"/><path d="M642 420 L742 338" stroke="${tone}" stroke-width="22" stroke-linecap="round"/><circle cx="760" cy="322" r="38" fill="#e0e7ff"/><rect x="612" y="414" width="64" height="82" rx="12" fill="#4338ca"/>`;
  return `${sky(tone, true)}<ellipse cx="640" cy="608" rx="380" ry="78" fill="#ddd6fe" opacity="0.58"/><rect x="456" y="428" width="368" height="174" rx="26" fill="#ede9fe" filter="url(#soft)"/><path d="M450 428 Q640 254 830 428 Z" fill="#7c3aed"/><path d="M552 428 Q640 318 728 428" fill="#c4b5fd"/><circle cx="640" cy="354" r="48" fill="#f8fafc" opacity="0.88"/><path d="M538 506 L742 506 M640 428 L640 602" stroke="#7c3aed" stroke-width="10"/>`;
}

function scene(key, tone, tags) {
  const night = tags.includes("stars") || tags.includes("night") || key.includes("observatory");
  let art = sky(tone, night);
  if (tags.includes("pond")) art += water(642, 536, 310, 92, "#38bdf8") + tree(306, 502, 0.8) + tree(978, 510, 0.72);
  else if (tags.includes("lake")) art += water(642, 532, 390, 116, "#0ea5e9") + tree(304, 526, 1.05, true);
  else if (tags.includes("reservoir")) art += water(640, 540, 360, 104, "#67e8f9") + `<g fill="${tone}" filter="url(#glow)"><path d="M520 438 L560 350 L606 438 L562 514 Z"/><path d="M704 442 L748 326 L802 442 L750 538 Z"/><path d="M622 480 L654 402 L690 480 L654 542 Z"/></g>`;
  else if (tags.includes("court")) art += building("court", tone);
  else if (tags.includes("gym")) art += building("gym", tone);
  else if (tags.includes("arena")) art += building("arena", tone);
  else if (tags.includes("garden")) art += `<ellipse cx="640" cy="568" rx="400" ry="108" fill="#bbf7d0" filter="url(#soft)"/><path d="M292 606 C450 486 804 486 988 604" fill="none" stroke="#fef3c7" stroke-width="48" stroke-linecap="round"/><g>${Array.from({ length: 36 }, (_, index) => `<circle cx="${260 + (index * 73) % 780}" cy="${500 + (index * 47) % 126}" r="${8 + (index % 4) * 3}" fill="${["#f472b6", "#facc15", "#60a5fa", "#fb7185"][index % 4]}"/>`).join("")}</g>`;
  else if (tags.includes("grove")) art += tree(362, 526, 1.02) + tree(898, 530, 1.08) + `<rect x="516" y="506" width="244" height="76" rx="18" fill="#fef3c7" filter="url(#soft)"/><path d="M540 506 L640 556 L740 506" fill="none" stroke="${tone}" stroke-width="16"/><rect x="572" y="462" width="136" height="56" rx="12" fill="#dcfce7"/>`;
  else if (tags.includes("conservatory")) art += building("conservatory", tone);
  else if (tags.includes("timber-bridge")) art += bridge("timber", tone);
  else if (tags.includes("stone-bridge")) art += bridge("stone", tone);
  else if (tags.includes("lumina-bridge")) art += bridge("lumina", tone);
  else if (tags.includes("fence")) art += fence("fence", tone);
  else if (tags.includes("wall")) art += fence("wall", tone);
  else if (tags.includes("ward")) art += fence("ward", tone);
  else if (tags.includes("picnic")) art += community("picnic", tone);
  else if (tags.includes("plaza")) art += community("plaza", tone);
  else if (tags.includes("festival")) art += community("festival", tone);
  else if (tags.includes("shed")) art += building("shed", tone);
  else if (tags.includes("workshop")) art += building("workshop", tone);
  else if (tags.includes("hall")) art += building("hall", tone);
  else if (tags.includes("lookout")) art += lookout("trail", tone);
  else if (tags.includes("skydeck")) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${esc(key)} marketplace preview">${lookout("skydeck", tone)}</svg>`;
  else if (tags.includes("observatory")) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${esc(key)} marketplace preview">${lookout("observatory", tone)}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${esc(key)} marketplace preview">${art}</svg>`;
}

for (const [key, tone, tags] of items) {
  writeFileSync(path.join(outputDir, `${key}.svg`), scene(key, tone, tags), "utf8");
}

console.log(`Generated ${items.length} central-world marketplace thumbnails.`);
