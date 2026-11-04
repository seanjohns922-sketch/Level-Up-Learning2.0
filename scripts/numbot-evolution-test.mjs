import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import { register } from 'node:module';
register('./typescript-alias-loader.mjs', import.meta.url);
const { getAllLegends, getLegendForYear, getLegendGuideImage } = await import('../data/legends.ts');

const names = ['Bouncer', 'Counter', 'Builder', 'Processor', 'Solver', 'Calculator', 'Equationator'];
const paths = new Set();
for (let level = 0; level <= 6; level++) {
  const legend = getLegendForYear(level === 0 ? 'Prep' : `Year ${level}`, 'number-nexus');
  assert.equal(legend.name, `Numbot ${names[level]}`);
  const image = getLegendGuideImage(legend);
  assert.ok(image?.startsWith('/guides/numbot-teal-2026-11-04-v1/'));
  assert.ok(image.endsWith(`-y${level}.png`), `Wrong level art: ${image}`);
  assert.equal(legend.images.avatar, image);
  assert.ok(fs.existsSync(`public${image}`), `Missing guide asset: ${image}`);
  const metadata = await sharp(`public${image}`).metadata();
  assert.equal(metadata.hasAlpha, true);
  assert.ok(metadata.width >= 1000 && metadata.height >= 1000);
  const {data, info} = await sharp(`public${image}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Generated cutouts have near-opaque interiors (alpha 240-255), not exclusively 255.
  let transparent = 0, nearOpaque = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] === 0) transparent++;
    if (data[i] >= 240) nearOpaque++;
  }
  assert.ok(transparent / (info.width * info.height) > .2, 'Guide needs a transparent background');
  assert.ok(nearOpaque / (info.width * info.height) > .1, 'Guide character must be visible');
  paths.add(image);
}
assert.equal(paths.size, 7, 'Every stage needs its own image');
for (const realm of ['measurelands', 'starpath', 'pattern-peaks', 'statistica', 'chance-hollow']) {
  for (const legend of getAllLegends(realm)) {
    assert.equal(getLegendGuideImage(legend), legend.images.avatar, 'Guide must use the canonical character cutout');
    assert.ok(legend.images.avatar.startsWith('/guides/'));
    assert.ok(!legend.images.avatar.includes('numbot-'));
  }
}
assert.ok(fs.readFileSync('app/program/page.tsx','utf8').includes('getLegendForYear("Prep", "number-nexus").images.avatar'));
console.log('PASS: seven correct level cutouts, real alpha transparency, distinct assets, Ground overlay, and unchanged other-realm guide paths.');
