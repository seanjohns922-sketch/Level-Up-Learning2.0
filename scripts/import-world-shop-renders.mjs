import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { CENTRAL_WORLD_CUSTOMISATION_CATALOG as catalogue } from '../lib/world3d/central-world-customisation-catalog.ts';
const source=process.argv[2];
if(!source)throw new Error('Pass the JSON downloaded from /demo-review/marketplace-art');
const rows=JSON.parse(fs.readFileSync(source,'utf8'));
assert.equal(rows.length,catalogue.length);assert.equal(new Set(rows.map(r=>r.key)).size,catalogue.length);
const approved=[];
for(const item of catalogue){
 const key=item.metadata.worldAssetKey,row=rows.find(row=>row.key===key);
 assert(row&&/^[a-z0-9_]+$/.test(key));assert(row.png.startsWith('data:image/png;base64,'));
 const data=Buffer.from(row.png.split(',')[1],'base64'),metadata=await sharp(data).metadata();
 assert.equal(metadata.width,800);assert.equal(metadata.height,640);
 const stats=await sharp(data).stats();assert(stats.channels.some(c=>c.stdev>8),'Blank render: '+key);
 approved.push({item,key,data});
}
fs.mkdirSync('public/marketplace/world-renders',{recursive:true});
const manifest={};
for(const {item,key,data} of approved){
 const src='/marketplace/world-renders/'+key+'.webp';
 await sharp(data).webp({quality:93}).toFile('public'+src);
 manifest[item.item_key]={src,alt:item.name+' — actual world model'};
}
fs.writeFileSync('lib/world3d/world-shop-art.ts','// Generated from the actual models via /demo-review/marketplace-art.\nexport const WORLD_SHOP_ART: Record<string, {src:string;alt:string}> = '+JSON.stringify(manifest,null,2)+';\n');
console.log(`Imported ${approved.length} validated product renders.`);
