import fs from 'node:fs';
import React from 'react';
import path from 'node:path';
import crypto from 'node:crypto';
import postcss from 'postcss';
import {renderToStaticMarkup} from 'react-dom/server';
import {domHarness} from './test-support/react-dom-harness.mjs';
const speech=({text,label})=>React.createElement('button',{'data-speech':text},label??'Read');
const mocks={'@/components/ReadAloudBtn':{__esModule:true,default:speech}};
const cssFiles=new Map();
function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())walk(p);else if(/\.tsx?$/.test(p)){const source=fs.readFileSync(p,'utf8');for(const m of source.matchAll(/from ['"]([^'"]+\.css)['"]/g)){
 const file=m[1].startsWith('@/')?path.resolve(m[1].slice(2)):path.resolve(path.dirname(p),m[1]);
 const prefix='audit'+crypto.createHash('md5').update(file).digest('hex').slice(0,8)+'_';
 mocks[m[1]]={__esModule:true,default:new Proxy({},{get:(_,key)=>prefix+String(key)})};
 if(!cssFiles.has(file)){const css=postcss.parse(fs.readFileSync(file,'utf8'));css.walkRules(rule=>{rule.selector=rule.selector.replace(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g,(_,name)=>'.'+prefix+name)});cssFiles.set(file,css.toString());}
 }}}}
walk('components');walk('lib');fs.writeFileSync('/tmp/reliq-audit-modules.css',[...cssFiles.values()].join('\n'));
const h=domHarness(mocks);
try {
 const {TaskRenderer}=h.load('components/TaskRenderer.tsx');
 const {LessonRenderer}=h.load('components/lesson/LessonRenderer.tsx');
 const {PracticeRunner}=h.load('components/PracticeRunner.tsx');
 const snapshots=Object.values(JSON.parse(fs.readFileSync(process.env.AUDIT_SNAPSHOTS ?? '/tmp/reliq-lower-lesson-snapshots.json')));
 const output=[];
 for(const q of snapshots){
  const [realm,level]=q.context.split(':');
  const modern=Number(level)>=7||realm==='pattern'||realm==='number'&&Number(level)>=2;
  try {
   const html=renderToStaticMarkup(React.createElement(modern?LessonRenderer:['mcq','count','order3','audioPick','numberHunt','groupCountVisual'].includes(q.task.kind)?PracticeRunner:TaskRenderer,modern?{
    activity:{activityType:q.task.kind,weight:1,config:{}},prompt:q.task.prompt??'',questionData:q.task,realmId:realm,onCorrect:()=>{},onWrong:()=>{}
   }:['mcq','count','order3','audioPick','numberHunt','groupCountVisual'].includes(q.task.kind)?{getTask:()=>q.task,onComplete:()=>{},realmId:realm,levelNumber:Number(level),brainBreakFrequency:'none'}:{task:q.task,taskNonce:1,callbacks:{markCorrect:()=>{},markWrong:()=>{},markCorrectSoft:()=>{},advanceIntro:()=>{}}}));
   output.push({...q,html});
  }catch(error){output.push({...q,error:error.message});}
 }
 fs.writeFileSync(process.env.AUDIT_RENDER_OUTPUT ?? '/tmp/reliq-lower-rendered.json',JSON.stringify(output));
 console.log(JSON.stringify({total:output.length,errors:output.filter(q=>q.error).map(q=>({context:q.context,kind:q.task.kind,error:q.error})),fallbacks:output.filter(q=>q.html?.includes('Loading the next challenge')).map(q=>q.context)},null,2));
 if(output.some(q=>q.error||q.html?.includes('Loading the next challenge')))process.exitCode=1;
} finally {await h.close();}

process.exit(process.exitCode ?? 0);
