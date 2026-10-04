export type Number7RatioModel={kind:'crystals'|'mixture'|'sharing';parts:[number,number];labels:[string,string];total?:string};
/** Read only the givens, never an answer or explanation. Works for saved questions too. */
export function number7RatioVisual(q:{lessonId?:string;prompt:string}):Number7RatioModel|null{
 if(!/^y7-w\d+-l[1-3]$/.test(q.lessonId??''))return null;
 let m=q.prompt.match(/^Blue:gold crystals = (\d+):(\d+)\./);
 if(m)return model('crystals',m,['Blue crystals','Gold crystals']);
 m=q.prompt.match(/^Concentrate:water = (\d+):(\d+)\./);
 if(m){const total=q.prompt.match(/(?:totals |a )(\d+) mL/);return model('mixture',m,['Concentrate','Water'],total?`${total[1]} mL altogether`:undefined);}
 m=q.prompt.match(/^Share \$(\d+) in the ratio (\d+):(\d+)\./);
 if(m)return model('sharing',[m[0],m[2],m[3]],['First share','Second share'],`$${m[1]} altogether`);
 return null;
}
function model(kind:Number7RatioModel['kind'],m:string[],labels:[string,string],total?:string):Number7RatioModel|null{
 const a=Number(m[1]),b=Number(m[2]);
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<1||a+b>20)return null;
 return {kind,parts:[a,b],labels,total};
}
export function number7RatioSpeech(model:Number7RatioModel){
 const unit=model.kind==='crystals'?'crystal':'equal part';
 return `${model.labels[0]}: ${model.parts[0]} ${unit}${model.parts[0]===1?'':'s'}. ${model.labels[1]}: ${model.parts[1]} ${unit}${model.parts[1]===1?'':'s'}. ${model.total??''}${model.kind==='crystals'?'':' Each square represents one equal part.'}`;
}
