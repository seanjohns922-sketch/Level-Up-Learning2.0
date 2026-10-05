import fs from 'node:fs';
import sharp from 'sharp';
const styles={};
for(const style of ['swept','sidepart','short','fade']){
 const {data,info}=await sharp(`public/avatars/hair/hair_${style}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let minX=info.width,maxX=0,minY=info.height;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>160){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);}
 const columns=[];
 for(let x=minX;x<=maxX;x+=2){let top=info.height,bottom=-1;for(let y=0;y<info.height;y++)if(data[(y*info.width+x)*4+3]>160){top=Math.min(y,top);bottom=Math.max(y,bottom);}if(bottom>=top)columns.push([x,top,bottom]);}
 styles[style]={width:info.width,height:info.height,minX,maxX,minY,columns};
}
fs.writeFileSync('lib/avatar/reference-hair-contour.json',JSON.stringify(styles)+'\n');
console.log('Traced the four short hairstyles directly from wardrobe artwork.');
