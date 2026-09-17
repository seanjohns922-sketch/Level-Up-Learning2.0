import assert from 'node:assert/strict';
import { LEVEL1_STARPATH_FORMS as forms, LEVEL1_STARPATH_BLUEPRINT, routeCells, type Direction } from '../data/assessments/revisions/level1StarpathFiveForms';
import {emptyLevel1Response,scoreLevel1Response,level1ResponseReady,routeIsCorrect,sameCell} from '../lib/starpath-level1-review';
const ids=new Set<string>();
for(const [form,items] of Object.entries(forms)){
 assert.equal(items.length,20);assert.deepEqual(items.map(q=>q.skillLabel),LEVEL1_STARPATH_BLUEPRINT);
 assert.equal(items.filter(q=>q.primaryDescriptorCode==='AC9M1SP01').length,10);
 assert.equal(items.filter(q=>q.primaryDescriptorCode==='AC9M1SP02').length,10);
 const positions:number[]=[];
 for(const [index,item] of items.entries()){
  assert(!ids.has(item.id));ids.add(item.id);assert.equal(item.form,form);assert(item.id.endsWith('-v5'));
  assert(item.readAloudText.includes(item.prompt));assert(!item.readAloudText.includes('Done'));
  const a=emptyLevel1Response(item);assert(!scoreLevel1Response(item,a));assert(!level1ResponseReady(item,a));
  if(item.kind==='shape'){
   const t=item.task;
   if(t.mode==='draw'){
    a.shape.points=t.drawShape==='triangle'?[{x:50,y:50},{x:250,y:150},{x:50,y:250}]:[{x:150,y:50},{x:250,y:150},{x:150,y:250},{x:50,y:150}];
    assert(!scoreLevel1Response(item,{...a,shape:{...a.shape,points:[{x:50,y:50},{x:150,y:150},{x:250,y:250}]}}));
   }else{
    assert.equal(new Set(t.options!.map(o=>o.id)).size,t.options!.length);
    a.shape.selected=t.correctIds!;a.shape.reason=t.correctReason??null;
    const wrong=t.options!.find(o=>!t.correctIds!.includes(o.id))!;
    assert(!scoreLevel1Response(item,{...a,shape:{...a.shape,selected:[wrong.id]}}));
    if(t.mode==='multi')assert(!scoreLevel1Response(item,{...a,shape:{...a.shape,selected:[...t.correctIds!,wrong.id]}}));
    if(t.reasons)assert(!scoreLevel1Response(item,{...a,shape:{...a.shape,reason:t.reasons.find(r=>r.id!==t.correctReason)!.id}}));
    if(t.mode==='choice')positions.push(t.options!.findIndex(o=>o.id===t.correctIds![0]));
   }
   if(index===1)for(const o of t.options!){const sides=o.shape?.vertices?.length??({square:4,rectangle:4,triangle:3,circle:0,oval:0}[o.shape!.shape]);assert.equal(t.correctIds!.includes(o.id),sides===4);}
   if(index===4)for(const o of t.options!){const target=form==='posttest'||form==='mid'?'square':'triangle';assert.equal(t.correctIds!.includes(o.id),o.shape!.shape===target&&o.shape!.colour==='#fbbf24');}
  }else{
   const t=item.task;
   for(const c of [t.start,...t.blocked,...t.landmarks.map(l=>l.cell),...(t.goal?[t.goal]:[])])assert(c.r>=0&&c.r<4&&c.c>=0&&c.c<4);
   if(t.mode==='choice'){
    if(index===15){const mismatches=t.given!.flatMap((d,i)=>d===t.shown![i]?[]:[i]);assert.equal(mismatches.length,1);assert.equal(t.options!.find(o=>o.id===t.correctId)!.label,`Step ${mismatches[0]+1}`);}
    if(index===16)for(const o of t.options!){const moves=o.label.match(/up|right|down|left/g) as Direction[];assert.equal(routeIsCorrect({...t,mode:'build'},moves),o.id===t.correctId);}
    if(index===12){const order:Direction[]=['up','right','down','left'];const expected=order[(order.indexOf(t.facing!)+(t.turn==='left'?3:1))%4];assert(t.options!.find(o=>o.id===t.correctId)!.label.toLowerCase().includes(expected));}
    a.choice=t.correctId!;for(const o of t.options!)if(o.id!==t.correctId)assert(!scoreLevel1Response(item,{...a,choice:o.id}));positions.push(t.options!.findIndex(o=>o.id===t.correctId));
   }else if(t.mode==='destination'){
    a.cell=routeCells(t.start,t.given!).at(-1)!;assert(!scoreLevel1Response(item,{...a,cell:t.start}));
   }else{
    a.moves=t.example;assert(routeIsCorrect(t,a.moves),`${item.id}: example must meet every constraint`);
    assert(!scoreLevel1Response(item,{...a,moves:['left','left','left','left']}));
    assert(!scoreLevel1Response(item,{...a,moves:a.moves.slice(0,-1)}));
    if(t.mode==='build'){
     let valid=0,violations=0;const queue:Direction[][]=[[]];
     while(queue.length){const ds=queue.shift()!;if(ds.length>6)continue;const path=routeCells(t.start,ds),last=path.at(-1)!;if(path.some(p=>p.r<0||p.r>3||p.c<0||p.c>3))continue;
      if(sameCell(last,t.goal!)){
       const violates=path.some(p=>t.blocked.some(b=>sameCell(b,p)))||!!t.checkpoint&&!path.slice(0,-1).some(p=>sameCell(p,t.checkpoint!));
       if(violates){assert(!routeIsCorrect(t,ds));violations++;}else{assert(routeIsCorrect(t,ds));valid++;}continue;
      }
      if(ds.length<6)for(const d of ['up','right','down','left'] as Direction[])queue.push([...ds,d]);
     }
     assert(valid>1,`${item.id}: accept alternative routes`);if(t.blocked.length||t.checkpoint)assert(violations>0);
    }
   }
  }
  assert(level1ResponseReady(item,a));assert(scoreLevel1Response(item,a),`${item.id}: valid response`);
 }
 assert(new Set(positions).size>=3,'Answer position varies across the form');
}
assert.equal(ids.size,100);
for(let i=0;i<20;i++)assert(new Set(Object.values(forms).map(items=>JSON.stringify(items[i].task))).size>=3,`Slot ${i+1} needs varied forms`);
console.log('PASS: 100 Level 1 items; matched curriculum blueprint; varied forms; construction alternatives; route order, bounds, obstacles and checkpoints; no empty/distractor acceptance.');
