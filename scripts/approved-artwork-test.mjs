import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { getAllLegends, getLegendForYear, getLegendGuideImage } from '../data/legends.ts';
import { getLegendArtwork } from '../data/legend-artwork.ts';
const expected = {
 'number-nexus': ['bouncer','counter','builder','processor','solver','calculator','equationator'],
 measurelands: ['pebble','ticklet','measurer','tracker','balancer','calibrator','timewielder'],
 starpath: ['explorer','roller','mapper','navigator','shapeshifter','galaxycrafter','starweaver'],
 'pattern-peaks': [null,null,null,'wigglecode','sequencer','solver','codemaster'],
 'chance-hollow': [null,null,null,'spin','flick','roller','master'],
 statistica: [null,'picker','sorter','grapher','analyst','decoder','insightkeeper'],
};
// Snapshot of non-artwork fields before this import: identities, names, stats and video/unlock metadata.
assert.equal(crypto.createHash('sha256').update(JSON.stringify(getAllLegends().map(({images,...legend})=>legend))).digest('hex'), '4440c0a09bfd1af9fa2076f613aaba7b34c67a160f332fe43b88126edf39cce4');
const unique = new Set();
for (const [realm,names] of Object.entries(expected)) {
 for (const [level,name] of names.entries()) {
  const year=level===0?'Prep':`Year ${level}`;
  const l=getLegendForYear(year,realm);
  if(!name){ assert.match(l.images.cardFront,/artwork-unavailable/);continue; }
  assert.ok(l.name.toLowerCase().split(' ').includes(name));
  assert.deepEqual(l.images,getLegendArtwork(realm,year));
  const refreshed = level >= 4 && ['number-nexus','measurelands'].includes(realm);
  const version = refreshed ? 'levels-4-6-2026-11-04-v2' : 'approved-2026-11-04-v1';
  const extension = refreshed ? 'png' : 'webp';
  const prefix = realm === 'number-nexus' ? 'numbot' : realm === 'measurelands' ? 'meazurex' : null;
  if (refreshed) assert.equal(l.images.cardFront,`/cards/${version}/${realm}/${prefix}-${name}-y${level}-front.${extension}`);
  else assert.match(l.images.cardFront,new RegExp(`/${realm}/[a-z]+-${name}-y${level}-front.webp$`));
  assert.equal(l.images.cardBack,`/cards/${version}/${realm}/back.${extension}`);
  unique.add(l.images.cardFront);
  for(const path of [l.images.cardFront,l.images.cardBack]){
   const m=await sharp(`public${path}`).metadata(); assert.equal(m.width,1008);assert.equal(m.height,1408);assert.equal(m.space,'srgb');
  }
  assert.equal(getLegendGuideImage(l),l.images.avatar);
  const m=await sharp(`public${l.images.avatar}`).metadata();assert.equal(m.hasAlpha,true);
  assert.ok(fs.existsSync(`public${l.unlockVideoUrl}`));assert.equal(l.unlockVideoUrl,l.showcaseVideoUrl);
 }
}
assert.equal(unique.size,35);assert.equal(getAllLegends().length,35);
for(const realm of Object.keys(expected)) assert.match(getLegendForYear('Year 8',realm).images.avatar,/artwork-unavailable/);
const sources=JSON.parse(fs.readFileSync('docs/artwork/approved-2026-11-04-sources.json'));
for(const e of sources){const bytes=fs.readFileSync(`public/${e.output}`);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),e.outputSha256);}
assert.equal(sources.length,48);
const refreshedSources=JSON.parse(fs.readFileSync('docs/artwork/levels-4-6-2026-11-04-v2-sources.json'));
assert.equal(refreshedSources.length,8);
for(const e of refreshedSources) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`public/${e.output}`)).digest('hex'),e.outputSha256);
const reveal=fs.readFileSync('components/LegendUnlockReveal.tsx','utf8');assert.ok(reveal.includes('src={legend.images.cardBack}'));
console.log('PASS: all 35 exact level mappings, six realm backs, trimmed sRGB proportions, transparent guides, preserved videos, 56 output hashes and unavailable-level fallback.');
