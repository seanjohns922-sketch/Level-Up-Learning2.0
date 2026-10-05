import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import sharp from 'sharp';
const setups=[
 ['Explorer',{hat:'explorer',hatColor:'#bb955b',glasses:'round',cape:'royal',capeColor:'#68498c',backpack:'explorer',backpackColor:'#536e50',held:'explorers_spear'}],
 ['Wizard',{hat:'wizard',hatColor:'#6853a8',hairStyle:'afro',cape:'hero',capeColor:'#645096',held:'archmage_staff'}],
 ['Crown',{hat:'crown',hairStyle:'afro',cape:'royal',capeColor:'#7f3971',held:'guardian_shield'}],
 ['Beanie',{hat:'beanie',hatColor:'#c46277',hairStyle:'bun',glasses:'shades',backpack:'explorer',held:'hunters_bow'}],
 ['Cap + rocket',{hat:'cap',hatColor:'#526f99',hairStyle:'swept',glasses:'visor',backpack:'rocket',backpackColor:'#556c9f',cape:'royal',held:'ocean_trident'}],
 ['No hat',{hat:'none',hairStyle:'sidepart',glasses:'round',backpack:'rocket',held:'flame_blade'}],
];
const parts=[];
for(let i=0;i<setups.length;i++){
 const [name,outfit]=setups[i],id=`accessory-review-${i}`;
 execFileSync(process.execPath,['scripts/avatar-3d-review.mjs'],{env:{...process.env,REVIEW_NAME:id,REVIEW_OUTFIT:JSON.stringify(outfit)},stdio:'pipe'});
 for(let j=0;j<3;j++)parts.push({input:await sharp(`output/world3d-audit/${id}-${['front','side','back'][j]}.png`).resize(300,240).png().toBuffer(),left:(i%2)*900+j*300,top:Math.floor(i/2)*275});
 parts.push({input:Buffer.from(`<svg width="900" height="35"><text x="450" y="25" text-anchor="middle" font-size="22">${name} — front / side / back</text></svg>`),left:i%2*900,top:Math.floor(i/2)*275+240});
}
await sharp({create:{width:1800,height:825,channels:4,background:'#e9e6dc'}}).composite(parts).png().toFile('output/world3d-audit/accessories-review.png');
const catalogue=fs.readFileSync('components/avatar/WeaponArt.tsx','utf8').split('export const WEAPONS:')[1].split('\n};')[0];
const keys=[...catalogue.matchAll(/^  (\w+):/gm)].map(m=>m[1]),gear=[];
for(let i=0;i<keys.length;i++){
 execFileSync(process.execPath,['scripts/avatar-3d-review.mjs'],{env:{...process.env,REVIEW_GEAR:'1',REVIEW_NAME:`gear-${keys[i]}`,REVIEW_OUTFIT:JSON.stringify({held:keys[i]})},stdio:'pipe'});
 gear.push({input:await sharp(`output/world3d-audit/gear-${keys[i]}-angle.png`).resize(300,240).png().toBuffer(),left:i%4*300,top:Math.floor(i/4)*275});
 const title=keys[i].replace(/^(patternox|datara|chanzia|meazurex|numbot|geospin)_/,'').replaceAll('_',' ');
 gear.push({input:Buffer.from(`<svg width="300" height="35"><text x="150" y="23" text-anchor="middle" font-size="16">${title}</text></svg>`),left:i%4*300,top:Math.floor(i/4)*275+240});
}
await sharp({create:{width:1200,height:Math.ceil(keys.length/4)*275,channels:4,background:'#e9e6dc'}}).composite(gear).png().toFile('output/world3d-audit/all-held-items.png');
console.log(`Rendered ${setups.length} accessory combinations and all ${keys.length} held items.`);
