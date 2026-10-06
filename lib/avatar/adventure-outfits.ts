import type { AvatarOutfit } from '@/components/avatar/StudentAvatar';
import type { EconomyItem } from '@/lib/economy';
export const ADVENTURE_OUTFITS = [
 {key:'trailblazer',name:'Trailblazer Explorer',price:400,colour:'#b99b64',trim:'#496b54',pants:'#596442',shoes:'#624535',hat:'explorer',hatColor:'#af8b50',cape:'none',capeColor:'#496b54',backpack:'explorer',backpackColor:'#496b54',held:'none',detail:'A pocketed field vest, compass badge, hiking boots, explorer hat and trail backpack.'},
 {key:'champion',name:'Stadium Champion',price:450,colour:'#e7eef5',trim:'#e55d35',pants:'#1f3857',shoes:'#e55d35',hat:'cap',hatColor:'#1f3857',cape:'none',capeColor:'#1f3857',backpack:'none',backpackColor:'#1f3857',held:'none',detail:'A numbered team jersey, shoulder stripes, medal, trainers and matching sports cap.'},
 {key:'guardian',name:'Royal Guardian',price:650,colour:'#9bafc0',trim:'#dfb760',pants:'#263b5b',shoes:'#778b9f',hat:'knight',hatColor:'#9bafc0',cape:'royal',capeColor:'#284f87',backpack:'none',backpackColor:'#284f87',held:'knights_sword',detail:'Sculpted silver armour, blue shield crest, open-face helmet, royal cape and knight’s sword.'},
 {key:'mage',name:'Moonlight Mage',price:750,colour:'#223b5e',trim:'#e5cd85',pants:'#263047',shoes:'#374665',hat:'wizard',hatColor:'#223b5e',cape:'hero',capeColor:'#31547a',backpack:'none',backpackColor:'#31547a',held:'crystal_wand',detail:'A split midnight robe, crescent clasp, embroidered stars, pointed hat, cape and crystal wand.'},
 {key:'astronaut',name:'Orbital Astronaut',price:900,colour:'#e3eaf0',trim:'#ed813e',pants:'#b8c7d4',shoes:'#dbe5ee',hat:'astronaut',hatColor:'#e3eaf0',cape:'none',capeColor:'#e3eaf0',backpack:'rocket',backpackColor:'#dbe5ee',held:'none',detail:'A panelled pressure suit, control console, clear bubble helmet, moon boots and rocket pack.'},
] as const;
export type AdventureTopStyle=`adventure_${typeof ADVENTURE_OUTFITS[number]['key']}`;
export function adventureOutfit(top:unknown){return ADVENTURE_OUTFITS.find(d=>`adventure_${d.key}`===top);}
export const ADVENTURE_OUTFIT_CATALOGUE:EconomyItem[]=ADVENTURE_OUTFITS.map((d,i)=>({
 item_key:`avatar_outfit_${d.key}`,name:d.name,description:d.detail+' Matching accessories are included. Separately equipped accessories can be worn over this look.',category:'avatar',realm_id:null,rarity:d.price>=650?'rare':'common',price:d.price,icon:'Shirt',accent:d.trim,active:true,purchasable:true,discoverable:false,sort_order:650+i,
 metadata:{slot:'avatar_outfit',realmCollection:'general',top:`adventure_${d.key}`,bottom:d.key==='champion'?'trackpants':'joggers',shoeStyle:d.key==='champion'?'sneakers':'boots',shirt:d.colour,shirtTrim:d.trim,pants:d.pants,shoes:d.shoes,hat:d.hat,hatColor:d.hatColor,cape:d.cape,capeColor:d.capeColor,backpack:d.backpack,backpackColor:d.backpackColor,held:d.held,glasses:'none'},
}));
export function adventurePreview(key:string):AvatarOutfit{return ADVENTURE_OUTFIT_CATALOGUE.find(d=>d.item_key===`avatar_outfit_${key}`)?.metadata as AvatarOutfit??{};}
