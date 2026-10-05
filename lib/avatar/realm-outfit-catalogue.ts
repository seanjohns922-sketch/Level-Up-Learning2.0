import type { EconomyItem } from '@/lib/economy';
import { REALM_OUTFITS } from './realm-outfits';
const PRICES: Record<string,number> = {equationator:1000,timewielder:1600,starweaver:1500,codemaster:1600,insightkeeper:1000,chanzia:1400};
const REALMS: Record<string,string> = {equationator:'number',timewielder:'measurement',starweaver:'space',codemaster:'pattern',insightkeeper:'statistics',chanzia:'chance'};
/** Demo fallback only. Production availability and prices come from the server. */
export const REALM_OUTFIT_CATALOGUE: EconomyItem[] = REALM_OUTFITS.map((item,i)=>({
 item_key:`avatar_outfit_${item.key}`,name:item.name,description:`${item.detail} Outfit only; character equipment is sold separately.`,
 category:'avatar',realm_id:null,rarity:PRICES[item.key]>=1400?'legendary':'rare',price:PRICES[item.key],icon:'Shirt',accent:item.colour,
 active:true,purchasable:true,discoverable:false,sort_order:620+i,
 metadata:{slot:'avatar_outfit',top:`realm_${item.key}`,bottom:'joggers',shoeStyle:'boots',shirt:item.colour,shirtTrim:item.trim,pants:item.pants,shoes:item.shoes,realmCollection:REALMS[item.key]},
}));
