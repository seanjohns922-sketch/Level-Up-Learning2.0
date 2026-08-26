import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public", "marketplace", "central-world");
const backdropPath = path.join(root, "public", "images", "central-world-valley-panorama.png");
mkdirSync(outputDir, { recursive: true });

const items = [
  ["reflection_pond", "#38bdf8", "water", "pond"],
  ["willow_lake", "#0ea5e9", "water", "lake"],
  ["crystal_reservoir", "#8b5cf6", "water", "crystal"],
  ["practice_court", "#f59e0b", "training", "court"],
  ["explorer_gym", "#f97316", "training", "gym"],
  ["champion_arena", "#eab308", "training", "arena"],
  ["wildflower_garden", "#22c55e", "garden", "flowers"],
  ["scholar_grove", "#16a34a", "garden", "grove"],
  ["starlight_conservatory", "#a855f7", "garden", "conservatory"],
  ["timber_footbridge", "#a16207", "crossing", "timber"],
  ["stone_arch_bridge", "#64748b", "crossing", "stone"],
  ["lumina_bridge", "#06b6d4", "crossing", "lumina"],
  ["garden_fence", "#84cc16", "boundary", "fence"],
  ["stone_boundary", "#78716c", "boundary", "wall"],
  ["crystal_ward", "#c084fc", "boundary", "ward"],
  ["picnic_circle", "#fb7185", "community", "picnic"],
  ["explorer_plaza", "#14b8a6", "community", "plaza"],
  ["festival_courtyard", "#ec4899", "community", "festival"],
  ["tool_shed", "#a16207", "workshop", "shed"],
  ["maker_workshop", "#ea580c", "workshop", "maker"],
  ["inventor_hall", "#facc15", "workshop", "hall"],
  ["trail_lookout", "#60a5fa", "lookout", "trail"],
  ["skywatch_deck", "#6366f1", "lookout", "skydeck"],
  ["celestial_observatory", "#7c3aed", "lookout", "observatory"],
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function defs(accent, night = false) {
  return `
    <defs>
      <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f8fafc" stop-opacity="0.95"/>
        <stop offset="0.52" stop-color="${accent}" stop-opacity="0.42"/>
        <stop offset="1" stop-color="#0f172a" stop-opacity="0.18"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#fff7ad"/>
        <stop offset="0.48" stop-color="#facc15"/>
        <stop offset="1" stop-color="#a16207"/>
      </linearGradient>
      <linearGradient id="stone" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/>
        <stop offset="0.5" stop-color="#cbd5e1"/>
        <stop offset="1" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="wood" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f59e0b"/>
        <stop offset="0.5" stop-color="#a16207"/>
        <stop offset="1" stop-color="#451a03"/>
      </linearGradient>
      <radialGradient id="water" cx="50%" cy="38%" r="64%">
        <stop offset="0" stop-color="#ecfeff"/>
        <stop offset="0.46" stop-color="${accent}"/>
        <stop offset="1" stop-color="#0369a1"/>
      </radialGradient>
      <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="24" stdDeviation="18" flood-color="#052e16" flood-opacity="${night ? 0.54 : 0.34}"/>
      </filter>
      <filter id="lift" x="-25%" y="-30%" width="150%" height="170%">
        <feDropShadow dx="0" dy="16" stdDeviation="10" flood-color="#020617" flood-opacity="0.32"/>
      </filter>
      <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="10" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
}

function sceneGrade(accent, night = false) {
  const stars = night
    ? `<g fill="#f8fafc" opacity="0.88">${Array.from({ length: 42 }, (_, i) => `<circle cx="${80 + (i * 137) % 1120}" cy="${34 + (i * 61) % 220}" r="${1.5 + (i % 3)}"/>`).join("")}</g>`
    : "";
  return `
    <rect width="1280" height="720" fill="${night ? "#0f172a" : "#ffffff"}" opacity="${night ? 0.5 : 0.02}"/>
    ${stars}
    <ellipse cx="640" cy="584" rx="500" ry="104" fill="#022c22" opacity="0.28"/>
    <path d="M0 668 C214 604 392 642 598 604 C808 566 1004 622 1280 548 L1280 720 L0 720 Z" fill="${accent}" opacity="0.15"/>`;
}

function basePlatform(accent, wide = false) {
  const rx = wide ? 456 : 346;
  return `
    <ellipse cx="640" cy="626" rx="${rx}" ry="96" fill="#022c22" opacity="0.36" filter="url(#shadow)"/>
    <ellipse cx="640" cy="590" rx="${rx}" ry="92" fill="${accent}" opacity="0.34"/>
    <ellipse cx="640" cy="560" rx="${rx - 28}" ry="72" fill="#f8fafc" opacity="0.2"/>
    <path d="M${640 - rx + 42} 552 C492 504 788 502 ${640 + rx - 42} 552" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.32" stroke-linecap="round"/>`;
}

function water(type, accent) {
  const extras = type === "lake"
    ? `<g filter="url(#lift)"><path d="M360 504 C304 438 362 350 432 342 C496 334 532 398 498 474" fill="#4d7c0f"/><path d="M386 398 C350 480 388 526 350 584" stroke="#84cc16" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M464 394 C506 472 456 530 492 588" stroke="#84cc16" stroke-width="14" fill="none" stroke-linecap="round"/></g>`
    : type === "crystal"
      ? `<g filter="url(#glow)" opacity="0.96"><path d="M536 444 L588 322 L640 444 L588 544 Z" fill="#8b5cf6"/><path d="M640 466 L704 282 L770 466 L704 584 Z" fill="#a78bfa"/><path d="M754 452 L806 334 L858 452 L806 548 Z" fill="#7c3aed"/></g>`
      : `<g filter="url(#lift)"><path d="M346 542 C390 452 472 476 486 548" fill="#15803d"/><path d="M800 548 C834 456 932 466 962 548" fill="#15803d"/><circle cx="394" cy="456" r="52" fill="#22c55e"/><circle cx="454" cy="458" r="44" fill="#16a34a"/><circle cx="874" cy="462" r="46" fill="#22c55e"/><circle cx="928" cy="468" r="36" fill="#16a34a"/></g>`;
  const size = type === "pond" ? [300, 74] : [402, 100];
  return `${basePlatform(accent, type !== "pond")}<ellipse cx="640" cy="540" rx="${size[0] + 54}" ry="${size[1] + 18}" fill="#075985" opacity="0.42" filter="url(#lift)"/><ellipse cx="640" cy="516" rx="${size[0] + 26}" ry="${size[1] + 8}" fill="url(#water)" filter="url(#lift)"/><ellipse cx="640" cy="488" rx="${size[0] - 12}" ry="${Math.max(32, size[1] - 38)}" fill="#e0f2fe" opacity="0.5"/><path d="M398 506 C526 470 754 548 896 500" fill="none" stroke="#ecfeff" stroke-width="12" opacity="0.62" stroke-linecap="round"/>${extras}`;
}

function training(type, accent) {
  if (type === "court") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><path d="M352 464 L928 424 L1000 578 L422 624 Z" fill="#d97706"/><path d="M402 484 L884 452 L928 558 L446 590 Z" fill="#fff7ed"/><path d="M640 468 L674 570 M410 536 L918 502" stroke="#d97706" stroke-width="9"/><circle cx="668" cy="518" r="54" fill="none" stroke="#d97706" stroke-width="10"/><rect x="812" y="348" width="52" height="130" rx="8" fill="#f8fafc"/><circle cx="838" cy="486" r="30" fill="none" stroke="#fb923c" stroke-width="10"/></g>`;
  }
  if (type === "gym") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><path d="M362 398 L640 302 L918 398 L918 584 L362 584 Z" fill="#fed7aa"/><path d="M410 430 L870 430 L870 542 L410 542 Z" fill="#fff7ed"/><path d="M474 556 L474 424 L806 424 L806 556" stroke="#ea580c" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="456" y="552" width="364" height="34" rx="17" fill="#fdba74"/><circle cx="538" cy="500" r="36" fill="#fb923c"/><circle cx="742" cy="500" r="36" fill="#fb923c"/></g>`;
  }
  return `${basePlatform(accent, true)}<g filter="url(#lift)"><ellipse cx="640" cy="578" rx="350" ry="78" fill="#a16207" opacity="0.72"/><path d="M300 530 C362 374 490 292 640 292 C790 292 918 374 980 530 Z" fill="url(#gold)"/><path d="M372 510 C430 414 522 364 640 364 C758 364 850 414 908 510" fill="none" stroke="#a16207" stroke-width="30"/><rect x="574" y="462" width="132" height="74" rx="14" fill="#facc15"/><path d="M430 322 L430 480 M850 322 L850 480" stroke="#78350f" stroke-width="14"/><path d="M430 322 L524 350 L430 382 M850 322 L756 350 L850 382" fill="${accent}"/></g>`;
}

function garden(type, accent) {
  if (type === "flowers") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><ellipse cx="640" cy="532" rx="358" ry="100" fill="#dcfce7"/><path d="M360 588 C480 488 778 488 930 584" fill="none" stroke="#fef3c7" stroke-width="42" stroke-linecap="round"/><g>${Array.from({ length: 54 }, (_, index) => `<circle cx="${336 + (index * 53) % 610}" cy="${460 + (index * 37) % 126}" r="${7 + (index % 4) * 2}" fill="${["#f472b6", "#facc15", "#60a5fa", "#fb7185"][index % 4]}"/>`).join("")}</g></g>`;
  }
  if (type === "grove") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="520" y="500" width="244" height="80" rx="18" fill="#fef3c7"/><path d="M544 500 L640 552 L740 500" fill="none" stroke="${accent}" stroke-width="18"/><rect x="574" y="454" width="136" height="56" rx="12" fill="#dcfce7"/><circle cx="384" cy="420" r="70" fill="#22c55e"/><circle cx="336" cy="452" r="58" fill="#16a34a"/><rect x="356" y="458" width="34" height="122" rx="15" fill="#854d0e"/><circle cx="896" cy="420" r="72" fill="#22c55e"/><circle cx="946" cy="456" r="58" fill="#16a34a"/><rect x="888" y="458" width="34" height="122" rx="15" fill="#854d0e"/></g>`;
  }
  return `${basePlatform(accent, true)}<g filter="url(#lift)"><path d="M348 594 L932 594 L876 364 Q640 220 404 364 Z" fill="#ddd6fe"/><path d="M408 584 L872 584 L826 392 Q640 294 454 392 Z" fill="#f5f3ff" opacity="0.72"/><path d="M640 292 L640 594 M458 388 L822 388 M404 480 L876 480" stroke="#8b5cf6" stroke-width="11" opacity="0.72"/><circle cx="514" cy="540" r="22" fill="#f472b6"/><circle cx="600" cy="516" r="20" fill="#22c55e"/><circle cx="716" cy="536" r="24" fill="#a855f7"/></g>`;
}

function crossing(type, accent) {
  const stream = `<path d="M82 604 C280 526 438 598 626 542 C850 474 1030 560 1198 496" fill="none" stroke="#38bdf8" stroke-width="106" opacity="0.82"/>`;
  if (type === "timber") {
    return `${stream}<g filter="url(#lift)"><path d="M254 480 C412 410 856 410 1028 480 L1028 548 C830 498 450 498 254 548 Z" fill="url(#wood)"/><g stroke="#fef3c7" stroke-width="9" opacity="0.7">${Array.from({ length: 9 }, (_, index) => `<path d="M${326 + index * 78} 452 L${306 + index * 78} 532"/>`).join("")}</g></g>`;
  }
  if (type === "stone") {
    return `${stream}<g filter="url(#lift)"><path d="M248 532 C382 388 900 388 1032 532 L1032 606 L248 606 Z" fill="url(#stone)"/><path d="M466 606 C486 488 794 488 814 606 Z" fill="#38bdf8" opacity="0.82"/><g stroke="#64748b" stroke-width="5" opacity="0.5"><path d="M306 514 L360 596"/><path d="M430 474 L480 602"/><path d="M552 438 L570 602"/><path d="M728 438 L708 602"/><path d="M850 474 L800 602"/><path d="M974 514 L920 596"/></g></g>`;
  }
  return `${stream}<g filter="url(#glow)"><path d="M248 524 C386 378 898 378 1032 524 L1032 586 L248 586 Z" fill="#cffafe" opacity="0.94"/><path d="M304 516 C448 420 832 420 976 516" fill="none" stroke="${accent}" stroke-width="24"/><path d="M470 586 C490 484 790 484 810 586 Z" fill="#38bdf8" opacity="0.84"/></g>`;
}

function boundary(type, accent) {
  if (type === "fence") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)" fill="#fef3c7" stroke="#a16207" stroke-width="8">${Array.from({ length: 12 }, (_, index) => `<path d="M${150 + index * 88} 548 L${150 + index * 88} 420 L${180 + index * 88} 388 L${210 + index * 88} 420 L${210 + index * 88} 548 Z"/>`).join("")}<path d="M126 470 L1152 470 M126 528 L1152 528"/></g>`;
  }
  if (type === "wall") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><path d="M146 556 C318 496 506 524 668 494 C850 462 1010 492 1138 446 L1138 606 L146 606 Z" fill="url(#stone)"/><g stroke="#57534e" stroke-width="5" opacity="0.48"><path d="M160 514 L1120 514 M160 566 L1120 566"/><path d="M220 506 L272 602"/><path d="M384 488 L430 604"/><path d="M548 500 L596 604"/><path d="M720 486 L768 604"/><path d="M884 492 L930 604"/><path d="M1040 472 L1088 604"/></g></g>`;
  }
  return `${basePlatform(accent, true)}<g filter="url(#glow)"><path d="M178 540 C346 446 506 524 660 458 C820 392 990 474 1102 416" fill="none" stroke="#f3e8ff" stroke-width="34" stroke-linecap="round"/><g fill="${accent}">${[238, 380, 536, 696, 858, 1012].map((x, index) => `<path d="M${x} ${514 - (index % 2) * 42} L${x + 30} ${448 - (index % 2) * 42} L${x + 62} ${514 - (index % 2) * 42} L${x + 30} ${582 - (index % 2) * 42} Z"/>`).join("")}</g></g>`;
}

function community(type, accent) {
  if (type === "picnic") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="512" y="492" width="256" height="130" rx="24" fill="${accent}"/><path d="M512 558 L768 558 M640 492 L640 622" stroke="#fff1f2" stroke-width="12"/><rect x="404" y="456" width="124" height="56" rx="16" fill="#fef3c7"/><rect x="752" y="456" width="124" height="56" rx="16" fill="#fef3c7"/><circle cx="610" cy="526" r="18" fill="#fef3c7"/><circle cx="676" cy="584" r="16" fill="#fde68a"/></g>`;
  }
  if (type === "plaza") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><circle cx="640" cy="496" r="94" fill="#5eead4"/><circle cx="640" cy="472" r="56" fill="#ecfeff"/><path d="M640 334 C608 402 604 436 640 470 C676 436 672 402 640 334 Z" fill="${accent}" filter="url(#glow)"/><rect x="354" y="520" width="136" height="34" rx="17" fill="#0f766e"/><rect x="790" y="520" width="136" height="34" rx="17" fill="#0f766e"/></g>`;
  }
  return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="480" y="470" width="320" height="106" rx="20" fill="#be185d"/><path d="M390 410 C530 330 750 486 896 390" fill="none" stroke="#f9a8d4" stroke-width="16"/><g>${[420, 500, 580, 660, 740, 820].map((x, index) => `<path d="M${x} ${408 + (index % 2) * 20} L${x + 42} ${444 + (index % 2) * 20} L${x - 6} ${462 + (index % 2) * 20} Z" fill="${index % 2 ? "#facc15" : accent}"/>`).join("")}</g><circle cx="556" cy="526" r="16" fill="#fef3c7"/><circle cx="646" cy="526" r="16" fill="#fef3c7"/><circle cx="726" cy="526" r="16" fill="#fef3c7"/></g>`;
}

function workshop(type, accent) {
  if (type === "shed") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="420" y="388" width="430" height="214" rx="20" fill="#92400e"/><path d="M382 400 L640 270 L896 400 Z" fill="url(#wood)"/><rect x="492" y="434" width="116" height="168" rx="8" fill="#78350f"/><rect x="650" y="430" width="130" height="92" rx="10" fill="#fef3c7"/><path d="M742 566 L820 488 M804 492 L822 510" stroke="#facc15" stroke-width="15" stroke-linecap="round"/></g>`;
  }
  if (type === "maker") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="332" y="360" width="610" height="246" rx="24" fill="#fed7aa"/><path d="M388 360 L640 252 L888 360 Z" fill="#c2410c"/><rect x="420" y="432" width="156" height="76" rx="12" fill="#fff7ed"/><rect x="646" y="432" width="156" height="76" rx="12" fill="#fff7ed"/><circle cx="566" cy="556" r="36" fill="none" stroke="#ea580c" stroke-width="15"/><circle cx="720" cy="550" r="46" fill="none" stroke="#f97316" stroke-width="15"/></g>`;
  }
  return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="342" y="350" width="596" height="260" rx="24" fill="#fef3c7"/><path d="M316 360 L640 228 L964 360 Z" fill="url(#gold)"/><rect x="574" y="446" width="132" height="164" rx="66" fill="#92400e"/><circle cx="640" cy="348" r="38" fill="#facc15" filter="url(#glow)"/><circle cx="478" cy="516" r="36" fill="none" stroke="#ca8a04" stroke-width="13"/><circle cx="806" cy="516" r="36" fill="none" stroke="#ca8a04" stroke-width="13"/></g>`;
}

function lookout(type, accent) {
  if (type === "trail") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><path d="M190 666 C410 548 474 452 640 448 C810 444 854 548 1090 642" fill="none" stroke="#fef3c7" stroke-width="86" stroke-linecap="round"/><rect x="480" y="376" width="320" height="106" rx="20" fill="#92400e"/><path d="M500 376 L500 532 M780 376 L780 532 M470 426 L810 426" stroke="#fef3c7" stroke-width="15"/><path d="M528 318 L752 318 L810 376 L470 376 Z" fill="${accent}"/></g>`;
  }
  if (type === "skydeck") {
    return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="470" y="440" width="340" height="98" rx="20" fill="#312e81"/><path d="M504 440 L504 592 M776 440 L776 592 M450 488 L830 488" stroke="#c7d2fe" stroke-width="15"/><path d="M642 420 L742 338" stroke="${accent}" stroke-width="22" stroke-linecap="round"/><circle cx="760" cy="322" r="40" fill="#e0e7ff"/><rect x="612" y="414" width="64" height="84" rx="12" fill="#4338ca"/></g>`;
  }
  return `${basePlatform(accent, true)}<g filter="url(#lift)"><rect x="456" y="428" width="368" height="176" rx="28" fill="#ede9fe"/><path d="M450 428 Q640 254 830 428 Z" fill="${accent}"/><path d="M552 428 Q640 318 728 428" fill="#c4b5fd"/><circle cx="640" cy="354" r="50" fill="#f8fafc" opacity="0.9"/><path d="M538 508 L742 508 M640 428 L640 604" stroke="#7c3aed" stroke-width="10"/></g>`;
}

function overlay(key, accent, family, type) {
  const night = key.includes("starlight") || key.includes("skywatch") || key.includes("celestial") || key.includes("lumina");
  const object = family === "water" ? water(type, accent)
    : family === "training" ? training(type, accent)
      : family === "garden" ? garden(type, accent)
        : family === "crossing" ? crossing(type, accent)
          : family === "boundary" ? boundary(type, accent)
            : family === "community" ? community(type, accent)
              : family === "workshop" ? workshop(type, accent)
                : lookout(type, accent);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${escapeXml(key)} marketplace render">
      ${defs(accent, night)}
      ${sceneGrade(accent, night)}
      ${object}
      <rect x="38" y="38" width="1204" height="644" rx="52" fill="none" stroke="#ffffff" stroke-opacity="0.26" stroke-width="3"/>
    </svg>`);
}

for (const [key, accent, family, type] of items) {
  const svgPath = path.join(outputDir, `${key}.svg`);
  const webpPath = path.join(outputDir, `${key}.webp`);
  const layeredSvg = overlay(key, accent, family, type);
  writeFileSync(svgPath, layeredSvg);
  const overlayImage = await sharp(layeredSvg)
    .resize(1280, 720, { fit: "fill" })
    .png()
    .toBuffer();
  const backdrop = await sharp(backdropPath)
    .resize(1280, 720, { fit: "cover", position: "center" })
    .modulate({ brightness: key.includes("skywatch") || key.includes("celestial") ? 0.62 : 1.04, saturation: 1.12 })
    .blur(0.35)
    .png()
    .toBuffer();
  const composite = await sharp(backdrop)
    .composite([{ input: overlayImage }])
    .png()
    .toBuffer();
  await sharp(composite)
    .resize(960, 540, { fit: "cover" })
    .webp({ quality: 86, effort: 6 })
    .toFile(webpPath);
}

console.log(`Generated ${items.length} premium central-world marketplace WebP renders.`);
