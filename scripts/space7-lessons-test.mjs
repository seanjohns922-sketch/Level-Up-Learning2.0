import assert from 'node:assert/strict';
import {loadCave7 as loadAnswer} from './cave7-loader.mjs';
const {level7Answer:level7AnswerFn,markLevel7Answer:markFn}=loadAnswer('lib/level7-answer.ts');
import fs from 'node:fs';
import {loadSpace7} from './space7-loader.mjs';
import {loadCave7} from './cave7-loader.mjs';
const {foldNet,relationBetween}=loadCave7('data/activities/starpath/level5/nets.ts');
const {SPACE7_WEEKS,SPACE7_PROGRAM,SPACE7_SKILL_GROUPS}=loadSpace7('curriculum');
const {space7Question,space7Quiz}=loadSpace7('questions');
const pair=p=>`(${p.x}, ${p.y})`;
// Calculate from displayed coordinates and properties, independently of the
// generator's answer/explanation. Direction and order are deliberately tested.
// Build tasks: check the stored model independently from the prompt, and that the marker agrees.
function checkBuild(q){
 const h=q.answer.split(',').map(Number),p=q.prompt,num=t=>(t.match(/\d+/g)||[]).map(Number);
 assert.equal(h.length,6);assert.ok(h.every(n=>n>=0&&n<=4));
 const front=[0,1,2].map(i=>Math.max(h[i],h[i+3])),side=[Math.max(...h.slice(0,3)),Math.max(...h.slice(3))];
 if(q.build.mode==='plan'){const m=p.match(/Back row: ([\d, ]+)\. Front row: ([\d, ]+)\./);assert.deepEqual(h,[...num(m[1]),...num(m[2])]);}
 else{const m=p.match(/front view ([\d, ]+) \(left to right\) and side view ([\d, ]+) \(back row first\)/);assert.deepEqual(front,num(m[1]));assert.deepEqual(side,num(m[2]));
  const total=h.reduce((t,n)=>t+n,0);
  if(q.build.mode==='exact')assert.equal(total,num(p.match(/exactly (\d+) cubes/)[1])[0]);
  if(q.build.mode==='fewest'){let least=99;for(let c=0;c<5**6;c++){const g=Array.from({length:6},(_,i)=>Math.floor(c/5**i)%5);if([0,1,2].every(i=>Math.max(g[i],g[i+3])===front[i])&&Math.max(...g.slice(0,3))===side[0]&&Math.max(...g.slice(3))===side[1])least=Math.min(least,g.reduce((t,n)=>t+n,0));}assert.equal(total,least);}}
 const spec=level7AnswerFn(q);assert.equal(spec.kind,'build');assert.ok(markFn(spec,q.answer));
 assert.ok(!markFn(spec,'0,0,0,0,0,0'));
}
// Shape sorters: classify drawn shapes with geometry written independently of the app.
const QTEXT={all3:'All 3 sides equal?',exactly2:'Exactly 2 sides equal?',atLeast2:'At least 2 sides equal?',rightTri:'Any angle equal to 90°?',obtuseTri:'Any angle greater than 90°?',acuteTri:'All angles less than 90°?',fourRight:'Four right angles?',fourEqual:'Four equal sides?',twoParallel:'Two pairs of parallel sides?',oneParallel:'Exactly one pair of parallel sides?',kite:'Two pairs of equal adjacent sides?',concave:'Any interior angle greater than 180°?',regular:'All sides and all angles equal?',equalSides:'All sides equal?',fiveSides:'Exactly 5 sides?'};
const TEMPLATES={single:{s:0,y:{s:1},n:{s:2}},chain:{s:0,y:{s:1},n:{s:2,y:{s:3},n:{s:4}}},full:{s:0,y:{s:1,y:{s:2},n:{s:3}},n:{s:4,y:{s:5},n:{s:6}}}};
const FAMILY=['Trapezium','Parallelogram','Kite','Rectangle','Rhombus','Square'];
function geo(ps){const n=ps.length;let area=0;for(let i=0;i<n;i++){const a=ps[i],b=ps[(i+1)%n];area+=a.x*b.y-b.x*a.y;}const sg=Math.sign(area);
 const L=ps.map((p,i)=>Math.hypot(ps[(i+1)%n].x-p.x,ps[(i+1)%n].y-p.y)),eq=(a,b)=>Math.abs(a-b)<1e-5*Math.max(1,a,b);
 const ang=ps.map((p,i)=>{const a=ps[(i+n-1)%n],b=ps[(i+1)%n],u=[a.x-p.x,a.y-p.y],w=[b.x-p.x,b.y-p.y];let d=Math.acos(Math.max(-1,Math.min(1,(u[0]*w[0]+u[1]*w[1])/(Math.hypot(...u)*Math.hypot(...w)))))*180/Math.PI;const turn=(p.x-a.x)*(b.y-p.y)-(p.y-a.y)*(b.x-p.x);if(turn*sg<0)d=360-d;return d;});
 let pairs=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(eq(L[i],L[j]))pairs++;
 const d=ps.map((p,i)=>[ps[(i+1)%n].x-p.x,ps[(i+1)%n].y-p.y]),par=(i,j)=>Math.abs(d[i][0]*d[j][1]-d[i][1]*d[j][0])<1e-5*L[i]*L[j];
 const g={n,pairs,allSides:L.every(x=>eq(x,L[0])),allAngles:ang.every(x=>Math.abs(x-ang[0])<1e-3),right:ang.filter(x=>Math.abs(x-90)<1e-3).length,max:Math.max(...ang),reflex:ang.some(x=>x>180.001),parallel:n===4?[par(0,2),par(1,3)].filter(Boolean).length:0,kite:n===4&&((eq(L[0],L[1])&&eq(L[2],L[3]))||(eq(L[1],L[2])&&eq(L[3],L[0])))};return g;}
const YES={[QTEXT.all3]:g=>g.n===3&&g.pairs===3,[QTEXT.exactly2]:g=>g.n===3&&g.pairs===1,[QTEXT.atLeast2]:g=>g.n===3&&g.pairs>=1,[QTEXT.rightTri]:g=>g.right>0,[QTEXT.obtuseTri]:g=>g.max>90.001&&g.max<180,[QTEXT.acuteTri]:g=>g.max<89.999,[QTEXT.fourRight]:g=>g.n===4&&g.right===4,[QTEXT.fourEqual]:g=>g.n===4&&g.allSides,[QTEXT.twoParallel]:g=>g.parallel===2,[QTEXT.oneParallel]:g=>g.parallel===1,[QTEXT.kite]:g=>g.kite,[QTEXT.concave]:g=>g.reflex,[QTEXT.regular]:g=>g.allSides&&g.allAngles,[QTEXT.equalSides]:g=>g.allSides,[QTEXT.fiveSides]:g=>g.n===5};
function category(ps,groups){const g=geo(ps),has=x=>groups.includes(x);
 if(has('Equilateral'))return g.pairs===3?'Equilateral':g.pairs===1?'Isosceles':'Scalene';
 if(has('Right-angled'))return g.right?'Right-angled':g.max>90?'Obtuse':'Acute';
 if(has('Non-square rectangle'))return g.right===4?(g.allSides?'Square':'Non-square rectangle'):g.allSides?'Non-square rhombus':'Other quadrilateral';
 if(has('Rhombus')&&has('Square'))return g.right===4?(g.allSides?'Square':'Rectangle'):g.allSides?'Rhombus':g.parallel===2?'Parallelogram':g.parallel===1?'Trapezium':g.kite?'Kite':'?';
 if(has('Trapezium'))return g.parallel===2?'Parallelogram':g.parallel===1?'Trapezium':g.kite?'Kite':'?';
 const type=g.reflex?'Concave':g.allSides&&g.allAngles?'Regular':'Irregular';
 if(has('Concave'))return type==='Regular'?'Regular convex':type==='Irregular'?'Irregular convex':'Concave';
 return `${type} ${g.n===5?'pentagon':'hexagon'}`;}
const runFlow7=(node,ps)=>typeof node==='string'?node:runFlow7(YES[node.question](geo(ps))?node.yes:node.no,ps);
const runValues=(t,values,ps)=>{let node=t;while(node.y){const f=YES[QTEXT[values[node.s]]];if(!f)return null;node=f(geo(ps))?node.y:node.n;}return values[node.s];};
function checkSorter(q){const s=q.sorter;
 if(s.mode==='tree'){assert.deepEqual(s.target,FAMILY);assert.equal(q.answer,FAMILY.join('|'));s.start.forEach((v,i)=>{if(v)assert.equal(v,FAMILY[i]);});return;}
 const groups=s.mode==='sort'?s.bins:s.outputs;assert.deepEqual(s.target,s.shapes.map(sh=>category(sh.points,groups)),q.prompt);
 for(const g of new Set(s.target))assert.ok(groups.includes(g));
 if(s.mode==='sort'){assert.equal(q.answer,s.target.join('|'));return;}
 const t=TEMPLATES[s.template],ans=q.answer.split('|');assert.ok(s.shapes.every((sh,i)=>runValues(t,ans,sh.points)===s.target[i]),'model sorter works');
 s.start.forEach((v,i)=>{if(s.locked[i])assert.equal(v,ans[i]);});
 if(/puts some shapes in the wrong group/.test(q.prompt))assert.ok(s.shapes.some((sh,i)=>runValues(t,s.start,sh.points)!==s.target[i]),'broken sorter is broken');
 assert.ok(new Set(s.target).size>=2,'test shapes cover several groups');
}
function check(key,q){
 if(q.sorter)return checkSorter(q);
 if(q.build)return checkBuild(q);
 const A=q.tier==='apply_create',R=q.tier==='reasoning',F=!A&&!R,v=q.spaceVisual,p=q.prompt,n=(p.replaceAll('−','-').match(/-?\d+/g)||[]).map(Number);
 let answer;
 const h=v?.heights,front=h&&[0,1,2].map(i=>Math.max(h[i],h[i+3])),side=h&&[Math.max(...h.slice(0,3)),Math.max(...h.slice(3))],total=h&&h.reduce((s,x)=>s+x,0),occ=h&&h.filter(Boolean).length;
 // Coordinates read from the prompt's leading "P = (x, y)" and stated moves.
 const P=()=>{const m=p.match(/P = \((-?\d+), (-?\d+)\)/);return {x:+m[1],y:+m[2]};};
 const pt=(x,y)=>`(${x}, ${y})`;let alt=A;
 // Second application forms, recognised by their wording.
 if(!A){}
 else if(/Every cube costs \$2/.test(p))answer=String(2*total);
 else if(/front-left stack is removed completely/.test(p)){const nx=h.slice();nx[3]=0;answer=[0,1,2].map(i=>Math.max(nx[i],nx[i+3])).join(', ');}
 else if(/back row is moved to stand in front/.test(p))answer=[side[1],side[0]].join(', ');
 else if(/no stack is taller than 1 cube/.test(p))answer=String(total-occ);
 else if(/uses exactly \d+ cubes\. Every stack is at least 1/.test(p))answer=String(n[1]-(n[0]-1));
 else if(/Of these six families/.test(p)){const fam={square:[1,1,1,1],rectangle:[1,1,0,1],rhombus:[1,0,1,1],parallelogram:[1,0,0,1],kite:[0,0,0,0],trapezium:[0,0,0,1]},col=p.includes('always parallelograms')?0:p.includes('right angles')?1:p.includes('equal sides')?2:3;answer=String(Object.values(fam).filter(f=>f[col]).length);}
 else if(/regular polygon has a perimeter of \d+ cm and each side/.test(p))answer=String(n[0]/n[1]);
 else if(/How many different whole-number lengths/.test(p))answer=String(n[0]+n[1]-1-Math.abs(n[0]-n[1]));
 else if(/Find the third angle, then trace/.test(p)){const t=180-n[0]-n[1],ang=[n[0],n[1],t];answer=Math.max(...ang)>90?'Obtuse':ang.includes(90)?'Right-angled':'Acute';}
 else alt=false;
 // Transformations: read the triangle and moves from the prompt and apply them independently.
 if(key>=19&&key<=27){
  const tri=[...p.matchAll(/\b([PQR])\((-?\d+), (-?\d+)\)/g)].slice(0,3).map(m=>({x:+m[2],y:+m[3]}));assert.equal(tri.length,3,p);
  const vi='PQR'.indexOf((p.match(/(?:image|images) of ([PQR])\b/)||p.match(/between ([PQR]) and/)||[])[1]);
  const ts=(ps,a,b)=>ps.map(q=>({x:q.x+a,y:q.y+b})),rx=ps=>ps.map(q=>({x:q.x,y:-q.y})),ry=ps=>ps.map(q=>({x:-q.x,y:q.y})),at=(ps,m)=>ps.map(q=>({x:2*m-q.x,y:q.y}));
  const rot=(ps,c,deg)=>ps.map(q=>{const t=((deg%360)+360)%360,x=q.x-c.x,y=q.y-c.y,[a,b]=t===90?[y,-x]:t===180?[-x,-y]:t===270?[-y,x]:[x,y];return {x:c.x+a,y:c.y+b};});
  const C=(()=>{const m=p.match(/C\((-?\d+), (-?\d+)\)/);return m?{x:+m[1],y:+m[2]}:{x:0,y:0};})();
  const clockwiseDeg=()=>{const m=p.match(/(\d+)° (clockwise|anticlockwise)?/);const d=+m[1];return m[2]==='anticlockwise'?-d:d;};
  const mv=()=>{const r=+(p.match(/(\d+) units? right/)?.[1]??0),d=+(p.match(/(\d+) units? down/)?.[1]??0),l=+(p.match(/then (\d+) units? left/)?.[1]??0);return [r-l,-d];};
  const fmt=ps=>ps.map(pair).join('; ');let img;
  if(/Which single move/.test(p)){
   const shown=v.plane7.image,opts={'Reflection in the x-axis':rx(tri),'Reflection in the y-axis':ry(tri),'Rotation of 180° about the origin':rot(tri,{x:0,y:0},180),'Rotation of 90° clockwise about the origin':rot(tri,{x:0,y:0},90),'Rotation of 90° anticlockwise about the origin':rot(tri,{x:0,y:0},-90)};
   const matches=q.options.filter(o=>opts[o]&&fmt(opts[o])===fmt(shown));assert.deepEqual(matches,[q.answer],p);answer=q.answer;
  }else if(key===21&&!/twice in a row/.test(p)){const im=v.plane7.image,d={x:im[0].x-tri[0].x,y:im[0].y-tri[0].y};answer=pair(/back to the original/.test(p)?{x:-d.x,y:-d.y}:d);}
  else if(key===21){const m=p.match(/vector \((-?\d+), (-?\d+)\) twice/);img=ts(tri,2*m[1],2*m[2]);}
  else if(key===19){const [a,b]=mv();img=/repeat the same translation/.test(p)?ts(tri,2*a,2*b):ts(tri,a,b);}
  else if(key===20){const [a,b]=mv();img=ts(tri,a,b);}
  else if(key===22||key===23){img=/in the x-axis/.test(p)?rx(tri):ry(tri);if(/halfway between/.test(p))answer=pair(/x-axis/.test(p)?{x:tri[vi].x,y:0}:{x:0,y:tri[vi].y});}
  else if(key===24){const mirrors=[...p.matchAll(/x = (-?\d+)/g)].map(m=>+m[1]);if(/How many units right/.test(p))answer=String(2*(mirrors[1]-mirrors[0]));else img=mirrors.reduce((ps,m)=>at(ps,m),tri);}
  else if(key===25||key===26){img=rot(tri,C,clockwiseDeg());}
  else if(key===27){const d=+p.match(/(\d+) units? right/)[1];if(/How many units apart/.test(p))answer=String(2*d);else img=/^Reflect/.test(p)?ts(ry(tri),d,0):ry(ts(tri,d,0));}
  if(img&&answer===undefined)answer=q.place||/image of each corner/.test(p)?fmt(img):pair(img[vi]);
  if(q.place){assert.ok(!v,'place questions draw their own grid');assert.deepEqual(q.place.shape,tri);assert.ok([...q.place.shape,...q.place.solution].every(c=>Math.abs(c.x)<=5&&Math.abs(c.y)<=5),'place stays on grid');}
  else{const pl=v.plane7;assert.ok(pl,'transformations show a triangle');for(const c of [...pl.shape,...(pl.image??[]),...(pl.solution??[])])assert.ok(Math.abs(c.x)<=5&&Math.abs(c.y)<=5,'on grid '+p);}
 }
 else if(key>=28&&key<=35&&key!==34){
  const shapes=v?.shapes7,flows=v?.trees;
  // Week 9: classify with reasons.
  if(key===28&&F){const two=n.slice(0,2),t=[...two,180-two[0]-two[1]];answer=`${new Set(t).size===2?'Isosceles':'Scalene'} ${Math.max(...t)>90?'obtuse':Math.max(...t)===90?'right-angled':'acute'}`;}
  if(key===28&&R){const t=n.slice(0,3);assert.equal(t[0]+t[1]+t[2],180);const kind=p.match(/shows it is ([\w-]+)\?/)[1],ok={isosceles:new Set(t).size===2,'right-angled':t.includes(90),obtuse:Math.max(...t)>90,scalene:new Set(t).size===3,acute:Math.max(...t)<90}[kind];assert.ok(ok,p);}
  if(key===28&&A)answer=String(/between its two equal sides\. What size/.test(p)?(180-n[0])/2:180-2*n[0]);
  if(key===29&&F)answer=category(shapes[0].points,['Rhombus','Square']);
  if(key===29&&R){const m=p.match(/is a (\w+), not a (\w+)/),c=category(shapes[0].points,['Rhombus','Square']);assert.equal(c.toLowerCase(),m[1]);}
  if(key===29&&A){const X=n[0];answer=[180-X,X,180-X].join(', ');}
  if(key===30&&F)answer=category(shapes[0].points,[]);
  if(key===30&&R){const c=category(shapes[0].points,[]);if(/concave\?/.test(p))assert.ok(c.startsWith('Concave'));if(/is polygon A regular\?/.test(p))assert.ok(c.startsWith('Regular'));if(/not regular\?/.test(p))assert.ok(c.startsWith('Irregular'));}
  if(key===30&&A){const name=p.match(/regular (\w+), in degrees/);if(name){const k={pentagon:5,hexagon:6,octagon:8,decagon:10}[name[1]];answer=String((k-2)*180/k);}else answer=String(540-n.slice(0,4).reduce((t,x)=>t+x,0));}
  if(key===31&&F)answer=category(shapes[0].points,[]);
  if(key===31&&R){const what=p.match(/are (\w+)\?/)[1];answer=String(shapes.filter(sh=>{const c=category(sh.points,[]);return what==='concave'?c.startsWith('Concave'):what==='regular'?c.startsWith('Regular'):sh.points.length===6;}).length);}
  if(key===32){const wrong=shapes.filter(sh=>{const groups=[flows[0].root.yes,flows[0].root.no?.yes,flows[0].root.no?.no].filter(x=>typeof x==='string');const all=JSON.stringify(flows[0].root).match(/"(?:yes|no)":"(.*?)"/g).map(x=>x.split('":"')[1].slice(0,-1));return runFlow7(flows[0].root,sh.points)!==category(sh.points,all.concat(groups));});if(F){assert.equal(wrong.length,1);answer=wrong[0].id;}else answer=String(wrong.length);}
  if(key===35&&F)answer=String(n[0]-1);
  if(key===35&&R){answer=category(shapes[0].points,['Non-square rectangle']);for(const t of flows)assert.equal(runFlow7(t.root,shapes[0].points),answer);}
 }
 else if(!alt)switch(key){
  case 1:if(A){const solids={'one square and four triangles':'Square pyramid','two triangles and three rectangles':'Triangular prism','six rectangles in three matching pairs':'Rectangular prism','four triangles':'Triangular pyramid','two pentagons and five rectangles':'Pentagonal prism'};answer=solids[p.match(/made from (.*)\. What/)[1]];}break;
  case 2:if(true){const cells=v.cells,fold=foldNet(cells),target=cells.findIndex(c=>relationBetween(fold,cells[v.marked],c)==='opposite');answer=String.fromCharCode(65+target);}break;
  case 3:if(F)answer=String(n[0]);else if(R)answer=String(n[0]+2);else{const s=n[0];answer=String(p.includes('faces')?s+2:p.includes('edges')?3*s:2*s);}break;
  case 4:answer=String(R?total-occ:occ);break;
  case 5:answer=(A?front.slice().reverse():front).join(', ');break;
  case 6:if(A){const nx=h.slice();nx[3]+=1;answer=[Math.max(...nx.slice(0,3)),Math.max(...nx.slice(3))].join(', ');}else answer=side.join(', ');break;
  case 7:answer=String(A?6*Math.max(...h)-total:total);break;
  case 8:answer=String(F?n[0]:R?n[0]*n[2]-n[0]+1:n[0]*n[2]);break;
  case 9:if(!R)answer=/stack heights|number of blocks|rebuild/.test(p)?'Height plan':/sheet|fold|cut/.test(p)?'Net':'Isometric drawing';break;
  case 10:if(F){const d=new Set(n.slice(0,3)).size;answer=d===1?'Equilateral':d===2?'Isosceles':'Scalene';}else if(R)answer='Isosceles';else{answer=String(n[1]-2*n[0]);assert.notEqual(n[1]-2*n[0],n[0],'isosceles, not equilateral');}break;
  case 11:{const ang=A?[n[0],n[1],180-n[0]-n[1]]:n.slice(0,3);answer=Math.max(...ang)>90?'Obtuse':ang.includes(90)?'Right-angled':'Acute';break;}
  case 12:if(/braces are needed/.test(p))answer=String(n[0]-3);else if(/diagonal brace/.test(p))answer='Triangle';else if(!R)answer=String(A?Math.abs(n[0]-n[1])+1:n[0]+n[1]-1);break;
  case 15:if(/top angle of/.test(p))answer=String((360-n[0]-n[1])/2);else if(/bottom-left angle/.test(p))answer=String(180-n[0]);else if(/perimeter of/.test(p))answer=String((n[0]-2*n[1])/2);else if(/is a parallelogram because/.test(p))answer='Kite';else if(F)answer=p.includes('no parallel sides')?'Kite':p.includes('exactly one pair')&&!p.includes('two pairs')?'Trapezium':'Parallelogram';break;
  case 13:if(A)answer=String(n[0]/(p.includes('triangle')?3:4));else if(R)answer='Rhombus';break;
  case 16:if(A)answer=String(n[0]/({pentagon:5,hexagon:6,octagon:8}[p.match(/regular (\w+)/)[1]]));break;
  case 34:if(F)answer=String(n[0]);break;
 }
 if(answer!==undefined)assert.equal(q.answer,answer,JSON.stringify({key,q}));
 if(v?.polygons)for(const pg of v.polygons){assert.ok(pg.points.length>=3);assert.ok(pg.caption);}
 if(v?.shape)for(const pt of [...v.shape,...v.image??[]])assert.ok(Math.abs(pt.x)<=6&&Math.abs(pt.y)<=6);
 assert.ok(!/\b1 units\b/.test(p),'Grammar: 1 unit');
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));assert.equal(q.steps.length,3);
}
let count=0;assert.equal(SPACE7_WEEKS.length,10);assert.deepEqual([...new Set(SPACE7_SKILL_GROUPS.flat(2))].sort((a,b)=>a-b),Array.from({length:36},(_,i)=>i+1).filter(k=>![17,18,33,36].includes(k)));
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
