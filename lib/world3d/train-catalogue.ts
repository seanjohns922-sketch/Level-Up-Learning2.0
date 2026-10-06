import type { EconomyItem } from '@/lib/economy';
export const TRAIN_DESIGNS = [
 {key:'train_steam',name:'Little Steam Engine',price:400,realm:'general',style:'steam',colour:'#347367',trim:'#e8bd63',cars:0,description:'A brass-trimmed steam engine with a tall chimney and bright headlamp.'},
 {key:'train_country',name:'Country Passenger Train',price:900,realm:'general',style:'country',colour:'#a63935',trim:'#f0d9a5',cars:1,description:'A heritage diesel with a cream roof and a window-lined passenger carriage.'},
 {key:'train_freight',name:'Freight Train',price:1400,realm:'general',style:'freight',colour:'#d38736',trim:'#344a51',cars:2,description:'An industrial shunter pulling a timber wagon and a covered cargo wagon.'},
 {key:'train_express',name:'Modern Express',price:2200,realm:'general',style:'express',colour:'#e4edf0',trim:'#227ca9',cars:1,description:'A streamlined electric express with a swept nose and panoramic windows.'},
 {key:'train_number',name:'Number Nexus Circuit Train',price:3000,realm:'number',style:'number',colour:'#164d58',trim:'#4ce7dd',cars:1,description:'An angular circuit engine with a glowing cube reactor and digital cargo.'},
 {key:'train_measurement',name:'Measurelands Clockwork Train',price:3000,realm:'measurement',style:'measurement',colour:'#71452c',trim:'#eac16b',cars:1,description:'A copper boiler engine with measuring bands, clockwork wheels and a survey carriage.'},
 {key:'train_space',name:'Starpath Comet Train',price:3000,realm:'space',style:'space',colour:'#302a6a',trim:'#67e8f9',cars:1,description:'A rocket-nosed engine with swept fins, glowing thrusters and an observatory carriage.'},
 {key:'train_pattern',name:'Pattern Peaks Prism Train',price:3000,realm:'pattern',style:'pattern',colour:'#047857',trim:'#a78bfa',cars:1,description:'A faceted engine crowned with repeating crystal spires and a mosaic carriage.'},
 {key:'train_statistics',name:'Statistica Survey Train',price:3000,realm:'statistics',style:'statistics',colour:'#a83e4b',trim:'#f2bc45',cars:1,description:'A research locomotive with rooftop scanning dishes and a mobile data laboratory.'},
 {key:'train_chance',name:'Chance Hollow Fortune Train',price:3000,realm:'chance',style:'chance',colour:'#be3455',trim:'#fbbf24',cars:1,description:'A lantern-lit engine with a domed roof and a dice-topped treasure carriage.'},
] as const;
export type TrainDesign = typeof TRAIN_DESIGNS[number];
export function trainDesign(key:string){return TRAIN_DESIGNS.find(d=>d.key===key);}
export function isTrainAsset(key:unknown):boolean{return key==='rail_train'||TRAIN_DESIGNS.some(d=>d.key===key);}
export const TRAIN_CATALOGUE:EconomyItem[]=TRAIN_DESIGNS.map((d,i)=>({item_key:d.key,name:d.name,description:d.description+' Place on existing rails. Includes its carriages; follows a closed loop and stops at stations.',category:'decoration',realm_id:null,rarity:d.price>=2200?'legendary':d.price>=900?'rare':'common',price:d.price,icon:'train-front',accent:d.colour,active:true,purchasable:true,discoverable:true,sort_order:200+i,metadata:{slot:'world_train',worldAssetKey:d.key,worldArea:'trains',marketplaceCategory:'trains',realmCollection:d.realm,gridSize:'1x1',tier:d.price>=2200?3:d.price>=900?2:1,marketplace_visual:{type:'asset',src:`/marketplace/world-renders/${d.key}.webp`,alt:d.name+' — actual world model',previewMode:'world'}}}));
