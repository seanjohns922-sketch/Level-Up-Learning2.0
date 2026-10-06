import * as THREE from 'three';
import contours from './reference-hair-contour.json' with {type: 'json'};
export type ReferenceHairStyle = keyof typeof contours;
/** Styles whose rear scalp is lumpy and uses the coiled strand texture. */
export const CURLY_STYLES = new Set<string>(['afro','curls','curlyPony','twists','fade']);
/** Styles whose rear scalp uses the rope (locs/braids) strand texture. */
export const ROPE_STYLES = new Set<string>(['locs','braids']);
export const REFERENCE_HAIR_STYLES = Object.keys(contours) as ReferenceHairStyle[];

/** Texture-matched hair hugs an ellipsoidal scalp instead of extruding a flat silhouette. */
export function createExplorerHairGeometry(style: ReferenceHairStyle = 'swept') {
  const contour = {vertices:[] as number[],indices:[] as number[]};
  const lookup=new Map<string,number>();
  const vertex=(x:number,y:number)=>{const key=`${x},${y}`;let index=lookup.get(key);if(index===undefined){index=contour.vertices.length/2;lookup.set(key,index);contour.vertices.push(x*4,y*4);}return index;};
  for(const [y,start,end] of contours[style].runs)for(let x=start;x<end;x++){
    const a=vertex(x,y),b=vertex(x+1,y),c=vertex(x,y+1),d=vertex(x+1,y+1);contour.indices.push(a,c,b,b,c,d);
  }
  const box = style==='locs'?[-5,5,130]:style==='waves'?[4,-8,112]:style==='curlyPony'?[0,0,115]:[-1,style==='long'?1:style==='bun'?-11:-6,122];
  const positions:number[]=[], uv:number[]=[], back:number[]=[], rim:number[]=[];
  const count=contour.vertices.length/2;
  const crown=Math.max(...contour.vertices.filter((_,i)=>i%2===1).map(py=>1.58-(box[1]+py/512*box[2]-18)*.0115));
  const edges=new Map<string,[number,number]>();
  for(let i=0;i<contour.indices.length;i+=3){
    const [a,b,c]=contour.indices.slice(i,i+3);back.push(count+a,count+c,count+b);
    for(const [u,v] of [[a,b],[b,c],[c,a]]){const key=u<v?`${u},${v}`:`${v},${u}`;if(edges.has(key))edges.delete(key);else edges.set(key,[u,v]);}
  }
  // The outline comes from a pixel mask, so its edge steps in 4-unit stairs. Relax the boundary
  // loop a few times so the hairline reads as a smooth painted curve, not a staircase.
  const boundaryNeighbours=new Map<number,number[]>();
  for(const [a,b] of edges.values()){boundaryNeighbours.set(a,[...(boundaryNeighbours.get(a)??[]),b]);boundaryNeighbours.set(b,[...(boundaryNeighbours.get(b)??[]),a]);}
  for(let pass=0;pass<6;pass++){
    const next=new Map<number,[number,number]>();
    for(const [v,ns] of boundaryNeighbours){if(ns.length!==2)continue;const [n1,n2]=ns;
      next.set(v,[contour.vertices[v*2]*.5+(contour.vertices[n1*2]+contour.vertices[n2*2])*.25,contour.vertices[v*2+1]*.5+(contour.vertices[n1*2+1]+contour.vertices[n2*2+1])*.25]);}
    for(const [v,[x,y]] of next){contour.vertices[v*2]=x;contour.vertices[v*2+1]=y;}
  }
  const adjacency=Array.from({length:count},()=>new Set<number>());
  for(let i=0;i<contour.indices.length;i+=3){const [a,b,c]=contour.indices.slice(i,i+3);for(const [u,v] of [[a,b],[b,c],[c,a]]){adjacency[u].add(v);adjacency[v].add(u);}}
  const distance=new Array<number>(count).fill(Infinity),queue:number[]=[];
  for(const [a,b] of edges.values())for(const v of [a,b])if(distance[v]!==0){distance[v]=0;queue.push(v);}
  for(let q=0;q<queue.length;q++){const v=queue[q];for(const n of adjacency[v])if(distance[n]>distance[v]+1){distance[n]=distance[v]+1;queue.push(n);}}
  for(let side=0;side<2;side++)for(let i=0;i<count;i++){
    const px=contour.vertices[i*2],py=contour.vertices[i*2+1];
    const x=(box[0]+px/512*box[2]-60)*.0125;
    const y=1.58-(box[1]+py/512*box[2]-18)*.0115;
    const radial=1-(x/.395)**2-((y-1.13)/.48)**2;
    const sphereZ=.018+.335*Math.sqrt(Math.max(0,radial));
    const blend=THREE.MathUtils.clamp((.12-radial)/.12,0,1);
    const puff=Math.min(.18,Math.sqrt(distance[i]/9)*.18);
    const outerZ=-.04+(side===0?puff:-puff);
    const z=THREE.MathUtils.lerp(sphereZ-(side===1?.05:0),outerZ,blend);
    // A shallow rolled edge over a rounded head: no tall front-to-back walls.
    positions.push(x,y,z);uv.push(px/512,1-py/512);
  }
  for(const [a,b] of edges.values())rim.push(a,b,count+a,b,count+b,count+a);
  const make=(indices:number[])=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;};
  // The actual rear scalp remains curved from crown to nape at every camera angle.
  const long=['long','locs','bob','braids','twists'].includes(style);
  const capPoints:number[]=[],capIndices:number[]=[],capUv:number[]=[];
  const capHeight=Math.min(crown,1.65)-1.15;
  const bottom=Math.min(...positions.filter((_,i)=>i%3===1));
  const napeHeight=long?Math.max(capHeight,(1.15-bottom-.08)/.74):capHeight;
  for(let r=0;r<=24;r++)for(let s=0;s<=64;s++){
    const angle=s/64*Math.PI*2;
    const front=Math.max(0,Math.sin(angle));
    const theta=(1.95-.95*front+(long?.45*(1-front):0))*r/24;
    // Curly and textured styles get soft lumps so their outline is not a smooth helmet from behind.
    const lump=CURLY_STYLES.has(style)&&r>2?1+(style==='afro'?.07:.045)*Math.sin(angle*(style==='afro'?11:14)+r*1.7)*Math.sin(r*1.3+angle*3):1;
    capPoints.push((style==='afro'?.43:.374)*Math.sin(theta)*Math.cos(angle)*lump,1.15+(Math.cos(theta)<0?napeHeight:capHeight)*Math.cos(theta),(.33*Math.sin(theta)*Math.sin(angle))*lump-.015);
    capUv.push(s/64,r/24);
  }
  for(let r=0;r<24;r++)for(let s=0;s<64;s++){const a=r*65+s,b=a+65;capIndices.push(a,a+1,b,a+1,b+1,b);}
  const rearScalp=new THREE.BufferGeometry();rearScalp.setAttribute('position',new THREE.Float32BufferAttribute(capPoints,3));rearScalp.setAttribute('uv',new THREE.Float32BufferAttribute(capUv,2));rearScalp.setIndex(capIndices);rearScalp.computeVertexNormals();
  const strands:THREE.BufferGeometry[]=[];
  if(style==='bun'){const core=new THREE.SphereGeometry(1,20,16);core.scale(.13,.13,.14);core.translate(.075,crown-.13,-.04);strands.push(core);}
  if(style==='spaceBuns')for(const side of [-1,1]){const core=new THREE.SphereGeometry(.105,20,16);core.translate(side*.365,1.49,-.065);strands.push(core);}
  if(['pigtails','braids','ponytail','curlyPony'].includes(style)){
    const sides=['ponytail','curlyPony'].includes(style)?[1]:[-1,1];
    for(const side of sides){const low=style==='braids';const path=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.29,low?1.07:1.23,-.09),new THREE.Vector3(side*.37,low?1:1.15,-.12),new THREE.Vector3(side*.43,low?.9:1.03,-.04)]);strands.push(new THREE.TubeGeometry(path,16,.047,8,false));}
  }
  return {scalp:make(contour.indices),rear:make([...back,...rim]),rearScalp,strands};
}

export function createBuzzHairGeometry(){
 const points:number[]=[],indices:number[]=[];
 for(let r=0;r<=20;r++)for(let s=0;s<=48;s++){
  const angle=s/48*Math.PI*2,theta=(1.85-.72*Math.max(0,Math.sin(angle)))*r/20;
  points.push(.357*Math.sin(theta)*Math.cos(angle),1.12+.377*Math.cos(theta),.318*Math.sin(theta)*Math.sin(angle)-.008);
 }
 for(let r=0;r<20;r++)for(let s=0;s<48;s++){const a=r*49+s,b=a+49;indices.push(a,a+1,b,a+1,b+1,b);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
