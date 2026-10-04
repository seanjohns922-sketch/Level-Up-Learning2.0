import type {Measurement7Visual} from '@/data/assessments/revisions/year7MeasurementFiveForms';

// Intersect tangents of a circle: the turn at each vertex is 180° − its interior angle.
// This keeps the drawn geometry consistent with every displayed angle.
export function polygonAngleVisual(angles:number[],labels:string[]):Measurement7Visual{
 let normal=0;
 const points=angles.map(angle=>{
  const next=normal+(180-angle)*Math.PI/180;
  const radius=1/Math.cos((next-normal)/2),mid=(normal+next)/2;
  normal=next;return [radius*Math.cos(mid),radius*Math.sin(mid)];
 });
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
 const scale=Math.min(400/width,260/height);
 return {type:'measurement_year7_panel',task:'polygonAngles',values:[],polygonPoints:points.map(([x,y])=>[320+(x-left-width/2)*scale,195+(y-top-height/2)*scale]),polygonAngleLabels:labels,description:'Interior angles are labelled at each corner.'};
}
