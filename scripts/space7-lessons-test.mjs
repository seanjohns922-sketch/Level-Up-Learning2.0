import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadSpace7} from './space7-loader.mjs';
import {loadCave7} from './cave7-loader.mjs';
const {foldNet,relationBetween}=loadCave7('data/activities/starpath/level5/nets.ts');
const {SPACE7_WEEKS,SPACE7_PROGRAM,SPACE7_SKILL_GROUPS}=loadSpace7('curriculum');
const {space7Question,space7Quiz}=loadSpace7('questions');
const pair=p=>`(${p.x}, ${p.y})`;
// Calculate from displayed coordinates and properties, independently of the
// generator's answer/explanation. Direction and order are deliberately tested.
function check(key,q){
 const A=q.tier==='apply_create',R=q.tier==='reasoning',F=!A&&!R,v=q.spaceVisual,p=q.prompt,n=(p.replaceAll('−','-').match(/-?\d+/g)||[]).map(Number);
 let answer;
 const h=v?.heights,front=h&&[0,1,2].map(i=>Math.max(h[i],h[i+3])),side=h&&[Math.max(...h.slice(0,3)),Math.max(...h.slice(3))],total=h&&h.reduce((s,x)=>s+x,0),occ=h&&h.filter(Boolean).length;
 // Coordinates read from the prompt's leading "P = (x, y)" and stated moves.
 const P=()=>{const m=p.match(/P = \((-?\d+), (-?\d+)\)/);return {x:+m[1],y:+m[2]};};
 switch(key){
  case 1:if(A){const solids={'one square and four triangles':'Square pyramid','two triangles and three rectangles':'Triangular prism','six rectangles in three matching pairs':'Rectangular prism','four triangles':'Triangular pyramid','two pentagons and five rectangles':'Pentagonal prism'};answer=solids[p.match(/made from (.*)\. What/)[1]];}break;
  case 2:if(true){const cells=v.cells,fold=foldNet(cells),target=cells.findIndex(c=>relationBetween(fold,cells[v.marked],c)==='opposite');answer=String.fromCharCode(65+target);}break;
  case 3:if(F)answer=String(n[0]);else if(R)answer=String(n[0]+2);else{const s=n[0];answer=String(p.includes('faces')?s+2:p.includes('edges')?3*s:2*s);}break;
  case 4:answer=String(R?total-occ:occ);break;
  case 5:answer=(A?front.slice().reverse():front).join(', ');break;
  case 6:if(A){const nx=h.slice();nx[3]+=1;answer=[Math.max(...nx.slice(0,3)),Math.max(...nx.slice(3))].join(', ');}else answer=side.join(', ');break;
  case 7:answer=String(A?6*Math.max(...h)-total:total);break;
  case 8:answer=String(F?n[0]:R?n[0]*n[2]-n[0]+1:n[0]*n[2]);break;
  case 9:if(!R)answer=p.includes('sheet')?'A labelled net':p.includes('stack heights')?'A height plan':'An isometric drawing';break;
  case 10:if(F){const d=new Set(n.slice(0,3)).size;answer=d===1?'Equilateral':d===2?'Isosceles':'Scalene';}else if(R)answer='Isosceles';else{answer=String(n[1]-2*n[0]);assert.notEqual(n[1]-2*n[0],n[0],'isosceles, not equilateral');}break;
  case 11:{const ang=A?[n[0],n[1],180-n[0]-n[1]]:n.slice(0,3);answer=Math.max(...ang)>90?'Obtuse':ang.includes(90)?'Right-angled':'Acute';break;}
  case 12:if(!R)answer=String(A?Math.abs(n[0]-n[1])+1:n[0]+n[1]-1);break;
  case 13:if(A)answer=String(n[0]/(p.includes('triangle')?3:4));else if(R)answer='Rhombus';break;
  case 16:if(A)answer=String(n[0]/({pentagon:5,hexagon:6,octagon:8}[p.match(/regular (\w+)/)[1]]));break;
  case 17:if(!R)answer=F?(v.polygons[0].points.length===5&&v.polygons[0].caption.includes('dent')?'Concave':'Convex'):'Concave';break;
  case 19:{const s=P(),[d1,d2]=[n[2],n[3]],k=A?2:1;answer=pair({x:s.x+d1*k,y:s.y-d2*k});break;}
  case 20:{const right=n[6],shift=A?-1:0;if(R){const vx=n.slice(-2);answer=pair({x:vx[0]+right,y:vx[1]-2});}else answer=v.shape.map(pt=>pair({x:pt.x+right+shift,y:pt.y-2})).join('; ');break;}
  case 21:{const s=P(),img=v.image[0],d={x:img.x-s.x,y:img.y-s.y};answer=pair(A?{x:-d.x,y:-d.y}:d);break;}
  case 22:case 23:{const s=P(),both=A,rx=key===22;answer=pair(both?{x:-s.x,y:-s.y}:rx?{x:s.x,y:-s.y}:{x:-s.x,y:s.y});break;}
  case 24:{const [m1,m2]=v.mirrorX;if(R)answer=String(2*(m2-m1));else{const s=P(),[first,second]=A?[m2,m1]:[m1,m2];answer=pair({x:2*second-(2*first-s.x),y:s.y});}break;}
  case 25:{const s=P();answer=pair(A?{x:-s.x,y:-s.y}:{x:s.y,y:-s.x});break;}
  case 26:{const s=P(),c=v.centre,rx=s.x-c.x,ry=s.y-c.y;answer=pair(A?{x:c.x-ry,y:c.y+rx}:{x:c.x+ry,y:c.y-rx});break;}
  case 27:{const s=P(),d=+p.match(/translate (\d+) units? right/i)[1];answer=R?String(2*d):pair({x:A?-s.x+d:-(s.x+d),y:s.y});break;}
  case 28:if(F){const d=new Set(n.slice(0,3)).size;answer=d===1?'Equilateral':d===2?'Isosceles':'Scalene';}else if(R)answer='Equilateral';else{const ang=n.slice(0,3);answer=Math.max(...ang)>90?'Obtuse':ang.includes(90)?'Right-angled':'Acute';}break;
  case 30:if(!R){const right=p.includes('four right angles'),equal=/four sides of/.test(p);answer=right?(equal?'Square':'Non-square rectangle'):(equal?'Non-square rhombus':'Other quadrilateral');}break;
  case 34:if(F)answer=String(n[0]);break;
  case 36:if(!R){const names=['Square','Non-square rectangle','Non-square rhombus','Other quadrilateral'];answer=names.find(x=>!p.split('Type')[0].includes(x+',')&&!p.split('Type')[0].includes(x+'.')&&!new RegExp(x+'(,|\\.)').test(p));}break;
 }
 if(answer!==undefined)assert.equal(q.answer,answer,JSON.stringify({key,q}));
 if(v?.polygons)for(const pg of v.polygons){assert.ok(pg.points.length>=3);assert.ok(pg.caption);}
 if(v?.shape)for(const pt of [...v.shape,...v.image??[]])assert.ok(Math.abs(pt.x)<=6&&Math.abs(pt.y)<=6);
 assert.ok(!/\b1 units\b/.test(p),'Grammar: 1 unit');
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));assert.equal(q.steps.length,3);
}
let count=0;assert.equal(SPACE7_WEEKS.length,10);assert.deepEqual([...new Set(SPACE7_SKILL_GROUPS.flat(2))].sort((a,b)=>a-b),Array.from({length:36},(_,i)=>i+1));
for(let w=1;w<=10;w++)for(let l=1;l<=3;l++)for(let seed=1;seed<=200;seed++)for(const role of ['fast_thinking','reasoning','apply_create']){{const q=space7Question(w,l,seed*7919,role);check(q.skillKey,q)};count++;}
for(let w=1;w<=9;w++){
 const qs=space7Quiz(w);assert.equal(qs.length,15);assert.equal(new Set(qs.map(q=>q.id)).size,15);
 for(let l=1;l<=3;l++){const rows=qs.filter(q=>q.lessonTag===l);assert.equal(rows.length,5);assert.equal(rows.filter(q=>q.tier==='reasoning').length,1);assert.equal(rows.filter(q=>q.tier==='apply_create').length,2);assert.equal(new Set(rows.map(q=>q.prompt+JSON.stringify(q.spaceVisual)+q.options.slice().sort().join('|'))).size,5);}
 qs.forEach(q=>check(q.skillKey,q));
}
assert.throws(()=>space7Quiz(10));
assert.equal(fs.readFileSync('public/curriculum/space-level7-scope-and-sequence.csv','utf8').trim().split('\n').length,41);
// Regression guards: reasoning never repeats fluency, most answers are typed, answers vary.
{const {level7Answer}=loadCave7('lib/level7-answer.ts');let typed=0,all=0;
 for(let w=1;w<=10;w++)for(let l=1;l<=3;l++){const seen={fast_thinking:new Set(),apply_create:new Set()};
  for(let seed=1;seed<=100;seed++){const f=space7Question(w,l,seed*7919,'fast_thinking'),r=space7Question(w,l,seed*7919,'reasoning'),a=space7Question(w,l,seed*7919,'apply_create');
   assert.ok(!(f.prompt===r.prompt&&f.answer===r.answer),`Space W${w}L${l}: reasoning repeats fluency`);
   for(const q of [f,r,a]){all++;if(level7Answer(q))typed++;}seen.fast_thinking.add(f.answer);seen.apply_create.add(a.answer);}
  for(const [role,set] of Object.entries(seen))assert.ok(set.size>=2,`Space W${w}L${l} ${role}: one answer only`);}
 assert.ok(typed/all>=0.75,`Space typed share ${typed}/${all}`);console.log(`PASS Space: reasoning distinct from fluency, ${Math.round(typed/all*100)}% typed, varied answers.`);}
console.log(`PASS ${count} Space practice variants and 135 quiz questions; independent numeric/coordinate checks, unique choices, quiz balance and export.`);
