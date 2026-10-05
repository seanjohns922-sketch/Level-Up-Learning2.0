import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import fs from 'node:fs';
const styles=[...Object.keys(JSON.parse(fs.readFileSync('lib/avatar/reference-hair-contour.json','utf8'))),'buzz','bald'],parts=[];
for(let i=0;i<styles.length;i++){
 execFileSync(process.execPath,['scripts/avatar-3d-review.mjs'],{env:{...process.env,REVIEW_HAIR:styles[i],REVIEW_HEAD:'1'},stdio:'pipe'});
 for(let j=0;j<3;j++){const view=['front','side','back'][j];parts.push({input:await sharp(`output/world3d-audit/${styles[i]}-head-${view}.png`).resize(200,160).png().toBuffer(),left:(i%3)*600+j*200,top:Math.floor(i/3)*190});}
 parts.push({input:Buffer.from(`<svg width="600" height="30"><text x="300" y="22" text-anchor="middle" font-size="20">${styles[i]} — front / side / back</text></svg>`),left:i%3*600,top:Math.floor(i/3)*190+160});
}
await sharp({create:{width:1800,height:Math.ceil(styles.length/3)*190,channels:4,background:'#e9e6dc'}}).composite(parts).png().toFile('output/world3d-audit/all-hair-profiles.png');
console.log('Rendered all 21 hairstyle choices from front, side and back.');
