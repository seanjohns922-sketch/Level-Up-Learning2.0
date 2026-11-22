import type { EconomyItem } from "./economy";
export type MarketplaceDepartment = "world" | "avatar";
export type WorldShopCategory = "buildings" | "animals" | "pools_play" | "special" | "trains" | "kits" | "defence" | "city_life";
export function centralWorldCategory(item: EconomyItem): WorldShopCategory | null {
 const value=item.metadata.marketplaceCategory;
 return value==="buildings"||value==="animals"||value==="pools_play"||value==="special"||value==="trains"||value==="kits"||value==="defence"||value==="city_life"?value:null;
}
export function marketplaceDepartment(item: EconomyItem): MarketplaceDepartment {
 if(centralWorldCategory(item))return "world";
 return ["avatar","pet","trail","emote","nameplate","title","victory_effect"].includes(item.category)?"avatar":"world";
}
export function marketplaceCategory(item: EconomyItem): string {
 const world=centralWorldCategory(item);if(world)return world;
 if(item.category==="avatar")return "outfits";
 if(item.category==="pet")return "companions";
 if(["trail","emote","victory_effect"].includes(item.category))return "effects";
 if(["nameplate","title"].includes(item.category))return "identity";
 if(["home","background"].includes(item.category))return "home";
 return "decorations";
}
export const MARKETPLACE_CATEGORIES = {
 world: [{id:"all",label:"All world items"},{id:"trains",label:"Trains"},{id:"buildings",label:"Buildings"},{id:"animals",label:"Animals"},{id:"pools_play",label:"Pools & play"},{id:"kits",label:"Build kits"},{id:"city_life",label:"City Life"},{id:"defence",label:"Protect the Tower"},{id:"special",label:"Landmarks"},{id:"home",label:"My home"},{id:"decorations",label:"Decorations"}],
 avatar: [{id:"all",label:"All avatar items"},{id:"outfits",label:"Outfits & accessories"},{id:"companions",label:"Companions"},{id:"effects",label:"Effects & emotes"},{id:"identity",label:"Titles & nameplates"}],
} as const;
/** The world shop tab's name for an item (e.g. "City Life"), or null for avatar items. */
export function worldCategoryLabel(item: EconomyItem): string | null {
 const id=centralWorldCategory(item);
 return id?MARKETPLACE_CATEGORIES.world.find(category=>category.id===id)?.label??null:null;
}
