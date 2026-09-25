import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import { centralValleyAssets,valleySampleAt,VALLEY_SECTION_CROP } from '../lib/world3d/central-valley-panorama.ts';
let highBytes=0,liteBytes=0,coverage=0;
for(const quality of ['high','medium','low']){
 const assets=centralValleyAssets(quality);
 assert.equal(assets.length,6);assert.equal(new Set(assets).size,6);
 for(const asset of assets){
  const file='public'+asset,metadata=await sharp(file).metadata();
  assert.equal(metadata.format,'webp');
  assert.equal(metadata.width,quality==='low'?888:1774);
  assert.equal(metadata.height,quality==='low'?444:887);
  if(quality==='high'){highBytes+=fs.statSync(file).size;coverage+=metadata.width*VALLEY_SECTION_CROP;}
  if(quality==='low')liteBytes+=fs.statSync(file).size;
 }
}
assert.ok(coverage>=8192,'Native section detail, after overlap, exceeds 8K around the horizon');
assert.ok(highBytes<5*1024*1024&&liteBytes<1024*1024,'Download budgets');
assert.deepEqual(centralValleyAssets('high',1024),centralValleyAssets('low'),'Limited GPU receives lightweight assets');
for(let i=-100;i<=1100;i++){
 const s=valleySampleAt(i/1000);
 assert.ok(s.section>=0&&s.section<6&&s.neighbour>=0&&s.neighbour<6);
 assert.ok(s.currentU>=0&&s.currentU<=1&&s.neighbourU>=0&&s.neighbourU<=1,'No texture samples escape their section');
 assert.ok(s.weight>=0&&s.weight<=.5);
}
for(let i=0;i<6;i++){
 const left=valleySampleAt(i/6-1e-8),right=valleySampleAt(i/6+1e-8);
 assert.equal(left.section,right.neighbour);assert.equal(left.neighbour,right.section);
 assert.ok(Math.abs(left.currentU-right.neighbourU)<1e-6);
 assert.ok(Math.abs(left.neighbourU-right.currentU)<1e-6);
 assert.ok(Math.abs(left.weight-.5)<1e-6&&Math.abs(right.weight-.5)<1e-6,'Both sides converge to the same blend, including 360-to-0 seam');
}
console.log(`Central valley: 12 assets, ${Math.round(coverage)} native horizontal samples, ${(highBytes/1024/1024).toFixed(2)} MB high / ${(liteBytes/1024/1024).toFixed(2)} MB light; GPU fallback and all six wrap joins passed.`);
