import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public", "marketplace", "central-world");
const backdropPath = path.join(root, "public", "images", "central-world-valley-panorama.png");
mkdirSync(outputDir, { recursive: true });

const items = [
  ["clubhouse", "#2563eb", "buildings", "clubhouse"],
  ["games_room", "#7c3aed", "buildings", "games"],
  ["treehouse", "#16a34a", "buildings", "treehouse"],
  ["training_centre", "#22c55e", "buildings", "training"],
  ["workshop", "#0ea5e9", "buildings", "workshop"],
  ["observatory", "#8b5cf6", "buildings", "observatory"],
  ["puppy_yard", "#f59e0b", "animals", "puppy"],
  ["bunny_garden", "#f472b6", "animals", "bunny"],
  ["pony_paddock", "#a16207", "animals", "pony"],
  ["farmyard", "#84cc16", "animals", "farmyard"],
  ["wildlife_habitat", "#059669", "animals", "wildlife"],
  ["backyard_pool", "#0ea5e9", "play", "pool"],
  ["splash_pool", "#06b6d4", "play", "splash"],
  ["water_park", "#0284c7", "play", "waterpark"],
  ["adventure_playground", "#f97316", "play", "playground"],
  ["trampoline_park", "#22c55e", "play", "trampoline"],
  ["sports_stadium", "#2563eb", "special", "stadium"],
  ["cinema", "#dc2626", "special", "cinema"],
  ["arcade", "#a855f7", "special", "arcade"],
  ["party_house", "#ec4899", "special", "party"],
  ["pet_sanctuary", "#14b8a6", "special", "sanctuary"],
];

const activeFiles = new Set(items.flatMap(([key]) => [`${key}.svg`, `${key}.webp`]));
for (const file of readdirSync(outputDir)) {
  if ((file.endsWith(".svg") || file.endsWith(".webp")) && !activeFiles.has(file)) {
    unlinkSync(path.join(outputDir, file));
  }
}

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function defs(accent, night = false) {
  return `
    <defs>
      <linearGradient id="front" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/>
        <stop offset="0.42" stop-color="${accent}"/>
        <stop offset="1" stop-color="#111827"/>
      </linearGradient>
      <linearGradient id="roof" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#60a5fa"/>
        <stop offset="0.5" stop-color="${accent}"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="wood" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f59e0b"/>
        <stop offset="0.5" stop-color="#a16207"/>
        <stop offset="1" stop-color="#451a03"/>
      </linearGradient>
      <linearGradient id="stone" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/>
        <stop offset="0.48" stop-color="#cbd5e1"/>
        <stop offset="1" stop-color="#64748b"/>
      </linearGradient>
      <radialGradient id="water" cx="50%" cy="34%" r="68%">
        <stop offset="0" stop-color="#ecfeff"/>
        <stop offset="0.52" stop-color="#38bdf8"/>
        <stop offset="1" stop-color="#0369a1"/>
      </radialGradient>
      <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="26" stdDeviation="18" flood-color="#020617" flood-opacity="${night ? 0.58 : 0.36}"/>
      </filter>
      <filter id="lift" x="-25%" y="-30%" width="150%" height="170%">
        <feDropShadow dx="0" dy="16" stdDeviation="9" flood-color="#020617" flood-opacity="0.32"/>
      </filter>
      <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="9" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
}

function sceneGrade(accent, night = false) {
  const stars = night
    ? `<g fill="#f8fafc" opacity="0.88">${Array.from({ length: 46 }, (_, i) => `<circle cx="${72 + (i * 139) % 1136}" cy="${30 + (i * 59) % 216}" r="${1.5 + (i % 3)}"/>`).join("")}</g>`
    : "";
  return `
    <rect width="1280" height="720" fill="${night ? "#0f172a" : "#ffffff"}" opacity="${night ? 0.52 : 0.02}"/>
    ${stars}
    <ellipse cx="640" cy="614" rx="520" ry="102" fill="#022c22" opacity="0.28"/>
    <path d="M0 668 C214 604 392 642 598 604 C808 566 1004 622 1280 548 L1280 720 L0 720 Z" fill="${accent}" opacity="0.14"/>`;
}

function platform(accent, wide = true) {
  const rx = wide ? 470 : 360;
  return `
    <ellipse cx="640" cy="628" rx="${rx}" ry="94" fill="#022c22" opacity="0.36" filter="url(#shadow)"/>
    <ellipse cx="640" cy="592" rx="${rx}" ry="90" fill="${accent}" opacity="0.28"/>
    <ellipse cx="640" cy="562" rx="${rx - 36}" ry="70" fill="#f8fafc" opacity="0.18"/>`;
}

function windows(points, color = "#fde68a") {
  return points.map(([x, y, w = 44, h = 58]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${color}" filter="url(#glow)"/><path d="M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}" stroke="#92400e" stroke-width="4" opacity="0.45"/>`).join("");
}

function building(type, accent) {
  if (type === "treehouse") {
    return `${platform(accent, false)}<g filter="url(#lift)"><rect x="574" y="340" width="82" height="260" rx="34" fill="#78350f"/><circle cx="496" cy="320" r="104" fill="#166534"/><circle cx="612" cy="270" r="118" fill="#15803d"/><circle cx="750" cy="326" r="112" fill="#16a34a"/><path d="M430 484 L640 370 L850 484 L810 594 L470 594 Z" fill="url(#wood)"/><rect x="530" y="496" width="92" height="98" rx="12" fill="#451a03"/><rect x="672" y="502" width="92" height="62" rx="12" fill="#fde68a"/><path d="M446 600 L380 676 M830 600 L900 676" stroke="#92400e" stroke-width="16"/></g>`;
  }
  if (type === "observatory") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="450" y="394" width="380" height="206" rx="30" fill="url(#stone)"/><path d="M408 396 Q640 212 872 396 Z" fill="url(#roof)"/><path d="M544 396 Q640 284 736 396" fill="#ddd6fe"/><circle cx="640" cy="308" r="58" fill="#f8fafc" opacity="0.94" filter="url(#glow)"/><path d="M826 340 L958 256" stroke="${accent}" stroke-width="38" stroke-linecap="round"/><circle cx="986" cy="238" r="50" fill="#e0e7ff"/><rect x="574" y="492" width="132" height="108" rx="18" fill="#312e81"/></g>`;
  }
  if (type === "games") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="360" y="350" width="560" height="248" rx="34" fill="#1e1b4b"/><path d="M330 378 Q640 244 950 378 L910 434 L370 434 Z" fill="#312e81"/><rect x="472" y="456" width="336" height="142" rx="28" fill="#111827"/><rect x="530" y="400" width="220" height="60" rx="24" fill="#e0f2fe"/><circle cx="584" cy="430" r="16" fill="#2563eb"/><circle cx="704" cy="430" r="16" fill="#ec4899"/><path d="M604 430 L660 430 M632 402 L632 458" stroke="#2563eb" stroke-width="12"/><rect x="398" y="470" width="54" height="94" rx="10" fill="#7c3aed"/><rect x="828" y="470" width="54" height="94" rx="10" fill="#7c3aed"/></g>`;
  }
  if (type === "training") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="370" y="384" width="540" height="216" rx="28" fill="#334155"/><path d="M410 384 L640 272 L870 384 Z" fill="#94a3b8"/><rect x="498" y="460" width="284" height="140" rx="26" fill="#0f172a"/><path d="M490 354 L490 484 M790 354 L790 484" stroke="#64748b" stroke-width="30"/><circle cx="460" cy="354" r="52" fill="#64748b"/><circle cx="820" cy="354" r="52" fill="#64748b"/><path d="M864 430 L830 508 L890 508 L850 594" stroke="#38bdf8" stroke-width="18" fill="none" filter="url(#glow)"/></g>`;
  }
  if (type === "workshop") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="386" y="370" width="508" height="230" rx="28" fill="#92400e"/><path d="M338 386 L640 248 L942 386 Z" fill="#1d4ed8"/><rect x="484" y="460" width="100" height="140" rx="12" fill="#451a03"/><rect x="656" y="454" width="134" height="74" rx="12" fill="#fde68a"/><path d="M744 580 L848 474 M824 476 L852 504" stroke="#38bdf8" stroke-width="18" stroke-linecap="round"/></g>`;
  }
  return `${platform(accent, true)}<g filter="url(#lift)"><rect x="360" y="360" width="560" height="240" rx="30" fill="#0f172a"/><rect x="390" y="332" width="500" height="240" rx="24" fill="url(#front)"/><path d="M326 358 L640 228 L954 358 Z" fill="url(#roof)"/><rect x="572" y="478" width="136" height="94" rx="16" fill="#1e293b"/><rect x="414" y="414" width="110" height="84" rx="12" fill="#bae6fd"/><rect x="756" y="414" width="110" height="84" rx="12" fill="#bae6fd"/><path d="M494 330 L494 286 L548 302 L494 318" fill="${accent}"/></g>`;
}

function animal(type, accent) {
  const fence = `<path d="M250 538 L1030 538 M250 588 L1030 588" stroke="#fef3c7" stroke-width="18" stroke-linecap="round"/><g fill="#fef3c7">${Array.from({ length: 10 }, (_, i) => `<rect x="${276 + i * 78}" y="492" width="26" height="120" rx="10"/>`).join("")}</g>`;
  const body = type === "bunny"
    ? `<ellipse cx="622" cy="484" rx="96" ry="70" fill="#f8fafc"/><circle cx="708" cy="448" r="56" fill="#f8fafc"/><path d="M690 400 C650 302 700 292 728 394 M740 402 C768 304 814 322 772 410" stroke="#f8fafc" stroke-width="32" fill="none" stroke-linecap="round"/><circle cx="730" cy="444" r="8" fill="#111827"/><circle cx="756" cy="462" r="9" fill="#f472b6"/>`
    : type === "pony"
      ? `<ellipse cx="640" cy="486" rx="142" ry="72" fill="#92400e"/><circle cx="770" cy="430" r="54" fill="#92400e"/><path d="M742 394 L784 338 L806 410" fill="#78350f"/><path d="M560 536 L540 606 M628 540 L618 612 M704 538 L724 610" stroke="#451a03" stroke-width="18" stroke-linecap="round"/><path d="M506 450 C452 392 446 490 506 506" stroke="#fbbf24" stroke-width="22" fill="none" stroke-linecap="round"/>`
      : type === "wildlife"
        ? `<circle cx="508" cy="448" r="88" fill="#166534"/><circle cx="742" cy="432" r="104" fill="#15803d"/><rect x="488" y="476" width="44" height="112" rx="18" fill="#854d0e"/><rect x="724" y="466" width="48" height="124" rx="20" fill="#854d0e"/><ellipse cx="640" cy="516" rx="90" ry="52" fill="#f59e0b"/><circle cx="714" cy="486" r="36" fill="#f59e0b"/><circle cx="724" cy="482" r="6" fill="#111827"/>`
        : type === "farmyard"
          ? `<rect x="504" y="394" width="272" height="184" rx="20" fill="#dc2626"/><path d="M460 404 L640 284 L820 404 Z" fill="#facc15"/><rect x="594" y="484" width="92" height="94" rx="46" fill="#7f1d1d"/><circle cx="858" cy="506" r="42" fill="#f8fafc"/><circle cx="890" cy="486" r="30" fill="#f8fafc"/><circle cx="898" cy="482" r="5" fill="#111827"/>`
          : `<ellipse cx="628" cy="500" rx="118" ry="68" fill="#f59e0b"/><circle cx="724" cy="452" r="48" fill="#f59e0b"/><path d="M700 412 L672 372 L716 400 M746 414 L792 376 L772 430" fill="#92400e"/><circle cx="742" cy="448" r="7" fill="#111827"/><path d="M536 542 L520 598 M618 552 L612 610 M702 540 L724 596" stroke="#92400e" stroke-width="14" stroke-linecap="round"/>`;
  return `${platform(accent, true)}<g filter="url(#lift)">${fence}${body}</g>`;
}

function play(type, accent) {
  if (type === "waterpark") {
    return `${platform(accent, true)}<g filter="url(#lift)"><ellipse cx="640" cy="560" rx="356" ry="96" fill="url(#water)"/><path d="M468 500 C520 354 668 340 724 478" fill="none" stroke="#f97316" stroke-width="42" stroke-linecap="round"/><path d="M724 478 C780 550 872 498 910 420" fill="none" stroke="#facc15" stroke-width="42" stroke-linecap="round"/><path d="M530 428 L530 318 L592 318 L592 414" stroke="#38bdf8" stroke-width="26"/><path d="M760 454 C746 386 772 334 824 306" stroke="#ecfeff" stroke-width="12" fill="none" stroke-linecap="round"/></g>`;
  }
  if (type === "playground") {
    return `${platform(accent, true)}<g filter="url(#lift)"><path d="M430 578 L542 378 L654 578 Z M642 578 L754 378 L866 578 Z" fill="#f97316"/><path d="M518 422 L778 422 M482 488 L814 488" stroke="#fde68a" stroke-width="18"/><path d="M824 438 C936 476 922 568 804 594" stroke="#38bdf8" stroke-width="34" fill="none"/><rect x="538" y="332" width="212" height="70" rx="16" fill="#2563eb"/></g>`;
  }
  if (type === "trampoline") {
    return `${platform(accent, false)}<g filter="url(#lift)"><ellipse cx="640" cy="548" rx="260" ry="78" fill="#111827"/><ellipse cx="640" cy="536" rx="218" ry="56" fill="#38bdf8"/><path d="M430 544 L394 628 M850 544 L886 628 M514 588 L494 652 M766 588 L786 652" stroke="#64748b" stroke-width="18"/><path d="M610 382 C650 318 714 382 670 438 C642 472 592 438 610 382" fill="#fde68a" filter="url(#glow)"/></g>`;
  }
  const jets = type === "splash" ? `<path d="M540 500 C506 412 566 388 590 492 M662 496 C626 402 706 380 728 492 M782 512 C744 436 802 414 832 508" stroke="#ecfeff" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#glow)"/>` : "";
  return `${platform(accent, true)}<g filter="url(#lift)"><ellipse cx="640" cy="548" rx="${type === "pool" ? 320 : 370}" ry="${type === "pool" ? 88 : 108}" fill="#075985"/><ellipse cx="640" cy="522" rx="${type === "pool" ? 292 : 340}" ry="${type === "pool" ? 66 : 84}" fill="url(#water)"/><path d="M430 514 C542 478 740 548 868 506" stroke="#ecfeff" stroke-width="12" opacity="0.64" fill="none" stroke-linecap="round"/>${jets}</g>`;
}

function special(type, accent) {
  if (type === "stadium") {
    return `${platform(accent, true)}<g filter="url(#lift)"><path d="M302 534 C370 376 504 310 640 310 C776 310 910 376 978 534 L908 600 L372 600 Z" fill="#1d4ed8"/><path d="M410 514 C468 426 544 390 640 390 C736 390 812 426 870 514" fill="none" stroke="#bfdbfe" stroke-width="36"/><circle cx="640" cy="492" r="46" fill="#f8fafc"/><path d="M384 318 L384 470 M896 318 L896 470" stroke="#e0f2fe" stroke-width="18"/><circle cx="384" cy="300" r="34" fill="#f8fafc" filter="url(#glow)"/><circle cx="896" cy="300" r="34" fill="#f8fafc" filter="url(#glow)"/></g>`;
  }
  if (type === "cinema") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="392" y="354" width="496" height="246" rx="28" fill="#7f1d1d"/><path d="M352 376 L640 242 L928 376 Z" fill="#facc15"/><rect x="484" y="394" width="312" height="78" rx="18" fill="#111827"/><text x="640" y="450" fill="#facc15" font-family="Arial Black, sans-serif" font-size="54" text-anchor="middle">CINEMA</text><rect x="560" y="500" width="160" height="100" rx="16" fill="#450a0a"/></g>`;
  }
  if (type === "arcade") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="384" y="360" width="512" height="240" rx="28" fill="#581c87"/><path d="M424 332 L856 332 L910 394 L370 394 Z" fill="#a855f7"/><text x="640" y="386" fill="#67e8f9" font-family="Arial Black, sans-serif" font-size="56" text-anchor="middle">ARCADE</text><rect x="476" y="452" width="110" height="130" rx="14" fill="#111827"/><rect x="694" y="452" width="110" height="130" rx="14" fill="#111827"/><circle cx="532" cy="526" r="12" fill="#facc15"/><circle cx="750" cy="526" r="12" fill="#22c55e"/></g>`;
  }
  if (type === "party") {
    return `${platform(accent, true)}<g filter="url(#lift)"><rect x="410" y="386" width="460" height="214" rx="28" fill="#fdf2f8"/><path d="M366 396 L640 270 L914 396 Z" fill="#a855f7"/><rect x="576" y="500" width="128" height="100" rx="18" fill="#7e22ce"/><path d="M380 432 C492 364 566 484 660 418 C750 356 824 450 900 398" stroke="#facc15" stroke-width="14" fill="none"/><circle cx="480" cy="514" r="26" fill="#ec4899"/><circle cx="804" cy="516" r="26" fill="#22c55e"/></g>`;
  }
  return `${platform(accent, true)}<g filter="url(#lift)"><path d="M360 566 C434 410 540 354 640 354 C740 354 846 410 920 566 Z" fill="#ccfbf1"/><path d="M420 566 C470 464 552 422 640 422 C728 422 810 464 860 566" fill="#14b8a6"/><circle cx="520" cy="448" r="58" fill="#16a34a"/><circle cx="760" cy="448" r="58" fill="#16a34a"/><path d="M604 474 C604 430 676 430 676 474 C676 522 640 532 640 560 C640 532 604 522 604 474 Z" fill="#f472b6" filter="url(#glow)"/></g>`;
}

function objectFor(family, type, accent) {
  if (family === "buildings") return building(type, accent);
  if (family === "animals") return animal(type, accent);
  if (family === "play") return play(type, accent);
  return special(type, accent);
}

function overlay(key, accent, family, type) {
  const night = key === "observatory" || key === "cinema" || key === "arcade" || key === "party_house";
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${escapeXml(key)} marketplace render">
      ${defs(accent, night)}
      ${sceneGrade(accent, night)}
      ${objectFor(family, type, accent)}
      <rect x="38" y="38" width="1204" height="644" rx="52" fill="none" stroke="#ffffff" stroke-opacity="0.26" stroke-width="3"/>
    </svg>`);
}

for (const [key, accent, family, type] of items) {
  const svgPath = path.join(outputDir, `${key}.svg`);
  const webpPath = path.join(outputDir, `${key}.webp`);
  const layeredSvg = overlay(key, accent, family, type);
  writeFileSync(svgPath, layeredSvg);
  const overlayImage = await sharp(layeredSvg).resize(1280, 720, { fit: "fill" }).png().toBuffer();
  const night = key === "observatory" || key === "cinema" || key === "arcade" || key === "party_house";
  const backdrop = await sharp(backdropPath)
    .resize(1280, 720, { fit: "cover", position: "center" })
    .modulate({ brightness: night ? 0.64 : 1.05, saturation: 1.14 })
    .blur(0.32)
    .png()
    .toBuffer();
  const composite = await sharp(backdrop).composite([{ input: overlayImage }]).png().toBuffer();
  await sharp(composite).resize(960, 540, { fit: "cover" }).webp({ quality: 87, effort: 6 }).toFile(webpPath);
}

console.log(`Generated ${items.length} launch central-world marketplace WebP renders.`);
