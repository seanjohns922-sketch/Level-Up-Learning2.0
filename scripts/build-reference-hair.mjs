import fs from 'node:fs';
import sharp from 'sharp';
const styles={};
for(const style of ['swept','sidepart','short','fade','locs','twists','waves','curlyPony','spaceBuns','long','tuft','spiky','curls','bob','ponytail','braids','pigtails','bun','afro']){
 const {data,info}=await sharp(`public/avatars/hair/hair_${style}.png`).resize(128,128).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const mask=Array.from({length:128*128},(_,i)=>data[i*4+3]>=160);
 if(['bun','pigtails'].includes(style)){
  const seen=new Set();
  for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!seen.has(seed)){
   const component=[seed];seen.add(seed);
   for(let q=0;q<component.length;q++){const v=component[q],x=v%128,y=Math.floor(v/128);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const nx=x+dx,ny=y+dy,n=ny*128+nx;if(nx>=0&&nx<128&&ny>=0&&ny<128&&mask[n]&&!seen.has(n)){seen.add(n);component.push(n);}}}
   if(component.length<60)for(const v of component)mask[v]=false;
  }
 }
 const runs=[];
 for(let y=0;y<127;y++){
  let start=-1;
  for(let x=0;x<=127;x++){
   const filled=x<127&&mask[y*info.width+x];
   if(filled&&start<0)start=x;
   if(!filled&&start>=0){runs.push([y,start,x]);start=-1;}
  }
 }
 styles[style]={runs};
}
fs.writeFileSync('lib/avatar/reference-hair-contour.json',JSON.stringify(styles)+'\n');
console.log(`Traced ${Object.keys(styles).length} wardrobe hairstyles, preserving gaps between strands.`);
