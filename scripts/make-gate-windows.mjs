// Cuts the slice of each realm's cave painting that its Level 7 trail gate frames, at gate size.
// The arches only ever show this slice, so loading the full 1672 × 941 paintings cost about 0.6 s of
// texture upload on a slow iPad for detail no one could see. Run again whenever a cave painting changes:
//   node scripts/make-gate-windows.mjs
import sharp from 'sharp';
import fs from 'node:fs';

// Must match ARCH_RADIUS, ARCH_SPRING (components/world3d/VolcanicKit.tsx) and the window centre in ExpeditionCrossroads.
const ARCH_RADIUS = 2.25, ARCH_SPRING = 5.05, CENTRE = .56, WIDTH = 320;
const REALMS = ['number', 'measurement', 'space', 'statistics', 'pattern', 'chance'];
fs.mkdirSync('public/images/shattered-realms/gates', { recursive: true });
for (const realm of REALMS) {
  const source = `public/images/shattered-realms/${realm}-cavern.webp`, { width, height } = await sharp(source).metadata();
  const slice = (2 * ARCH_RADIUS / (ARCH_SPRING + ARCH_RADIUS)) / (width / height), left = Math.round((CENTRE - slice / 2) * width);
  await sharp(source).extract({ left, top: 0, width: Math.round(slice * width), height }).resize({ width: WIDTH }).webp({ quality: 82 }).toFile(`public/images/shattered-realms/gates/${realm}-gate.webp`);
  console.log(`${realm}: ${Math.round(slice * width)} × ${height} slice from x ${left} → ${WIDTH} wide`);
}
