import fs from 'node:fs';import path from 'node:path';import Module,{createRequire} from 'node:module';import {execFileSync} from 'node:child_process';import ts from 'typescript';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import sharp from 'sharp';
const require=createRequire(import.meta.url),cache=new Map();
function compile(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m=new Module(file);cache.set(file,m);m.require=name=>{if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(file),name);return compile([base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()));}return require(name);};m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {ADVENTURE_OUTFIT_CATALOGUE:items}=compile('lib/avatar/adventure-outfits.ts');const {default:Avatar}=compile('components/avatar/StudentAvatar.tsx');
const layers=[];fs.mkdirSync('output/world3d-audit',{recursive:true});
for(let i=0;i<items.length;i++){
 const item=items[i],outfit={...item.metadata,hairStyle:'swept',face:'smile'};
 const html=renderToStaticMarkup(React.createElement(Avatar,{outfit,height:320,alive:false,floatAnimation:'none'}));const svg=html.match(/<svg[\s\S]*?<\/svg>/)[0].replace(/href="(\/avatars\/[^\"]+)"/g,(_,src)=>`href="data:image/png;base64,${fs.readFileSync('public'+src).toString('base64')}"`);
 layers.push({input:await sharp(Buffer.from(svg)).resize({height:300}).png().toBuffer(),left:40,top:i*340+30});
 execFileSync(process.execPath,['scripts/avatar-3d-review.mjs'],{env:{...process.env,REVIEW_OUTFIT:JSON.stringify(outfit),REVIEW_NAME:item.item_key},stdio:'pipe'});
 for(const [j,view] of ['angle','side','back'].entries())layers.push({input:await sharp(`output/world3d-audit/${item.item_key}-${view}.png`).resize(350,280).png().toBuffer(),left:220+j*350,top:i*340+40});
 layers.push({input:Buffer.from(`<svg width="1270" height="30"><text x="20" y="23" font-family="Arial" font-size="17" fill="#24392f">${item.name} — ${item.price} XP · wardrobe / world / side / back</text></svg>`),left:0,top:i*340});
}
await sharp({create:{width:1270,height:1700,channels:4,background:'#e9e6dc'}}).composite(layers).png().toFile('output/world3d-audit/adventure-outfits.png');
console.log('Rendered all five actual wardrobe and 3D outfits from three angles.');
