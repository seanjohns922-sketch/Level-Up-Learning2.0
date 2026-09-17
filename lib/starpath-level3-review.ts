import type {Cell} from '@/data/assessments/revisions/level1StarpathFiveForms';
import type {Level3Item,LayoutTask,MapConstraint} from '@/data/assessments/revisions/level3StarpathFiveForms';
import {emptyLevel2Response,level2ResponseReady,scoreLevel2Response,level2Expected,type Level2Response} from './starpath-level2-review';
import {sameCell} from './starpath-level1-review';
import type {Level2Item} from '@/data/assessments/revisions/level2StarpathFiveForms';
export type Level3Response={selected:string[];reason:string|null;heights:number[];placements:Record<string,Cell>;map:Level2Response};
export const mapItem=(item:Level3Item):Level2Item=>({...item,primaryDescriptorCode:'AC9M2SP02'}) as Level2Item;
export const emptyLevel3Response=(item:Level3Item):Level3Response=>({selected:[],reason:null,heights:item.kind==='solid'&&item.task.build?Array(item.task.build.cols*item.task.build.rows).fill(0):[],placements:{},map:emptyLevel2Response(mapItem(item))});
export function constraintMatches(c:MapConstraint,p:Record<string,Cell>){const a=p[c.subject],b=p[c.reference];if(!a||!b)return false;return c.relation==='above'?a.c===b.c&&a.r<b.r:c.relation==='below'?a.c===b.c&&a.r>b.r:c.relation==='left'?a.r===b.r&&a.c<b.c:a.r===b.r&&a.c>b.c;}
export function layoutCorrect(t:LayoutTask,p:Record<string,Cell>){const cells=t.landmarks.map(l=>p[l.id]);return cells.every(c=>c&&Number.isInteger(c.r)&&Number.isInteger(c.c)&&c.r>=0&&c.r<4&&c.c>=0&&c.c<4)&&cells.every((c,i)=>cells.every((other,j)=>i===j||!sameCell(c,other)))&&!!t.constraints?.every(c=>constraintMatches(c,p));}
export function level3ResponseReady(item:Level3Item,a:Level3Response){if(item.kind==='map')return level2ResponseReady(mapItem(item),a.map);if(item.kind==='layout'&&item.task.mode==='build')return item.task.landmarks.every(l=>a.placements[l.id]);if(item.kind==='solid'&&item.task.mode==='blocks')return a.heights.some(h=>h>0);return a.selected.length>0&&(item.kind!=='solid'||!item.task.reasons||a.reason!==null);}
export function scoreLevel3Response(item:Level3Item,a:Level3Response){
 if(item.kind==='map')return scoreLevel2Response(mapItem(item),a.map);
 if(item.kind==='layout')return item.task.mode==='build'?layoutCorrect(item.task,a.placements):a.selected.length===1&&a.selected[0]===item.task.correctId;
 const t=item.task;if(t.build)return a.heights.length===t.build.cols*t.build.rows&&a.heights.every(h=>h===t.build!.height);
 return !!t.correctIds&&a.selected.length===t.correctIds.length&&new Set(a.selected).size===a.selected.length&&t.correctIds.every(id=>a.selected.includes(id))&&(!t.reasons||a.reason===t.correctReason);
}
export function constraintText(t:LayoutTask,c:MapConstraint){const name=(id:string)=>t.landmarks.find(l=>l.id===id)!.label;return `${name(c.subject)} is directly ${c.relation==='left'||c.relation==='right'?`to the ${c.relation} of`:c.relation} ${name(c.reference)}.`;}
export function level3Expected(item:Level3Item){if(item.kind==='map')return level2Expected(mapItem(item));if(item.kind==='layout')return item.task.mode==='build'?`Any non-overlapping map satisfying: ${item.task.constraints!.map(c=>constraintText(item.task,c)).join(' ')}`:item.task.options!.find(o=>o.id===item.task.correctId)!.label!;const t=item.task;if(t.build)return `Every column ${t.build.height} cubes high; ${t.build.cols*t.build.rows*t.build.height} cubes in total.`;return t.options!.filter(o=>t.correctIds!.includes(o.id)).map(o=>o.label??o.object).join(', ')+(t.correctReason?` · ${t.reasons!.find(r=>r.id===t.correctReason)!.label}`:'');}
