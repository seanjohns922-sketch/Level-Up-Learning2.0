import type { EconomyItem } from './economy';
export const REALM_FILTER_OPTIONS = [
 ['all','All realms'],['number','Number Nexus'],['measurement','Measurelands'],
 ['space','Starpath'],['pattern','Pattern Peaks'],['statistics','Statistica'],
 ['chance','Chance Hollow'],['general','General items'],
] as const;
export type ItemRealmFilter = typeof REALM_FILTER_OPTIONS[number][0];
/** Collection metadata identifies cosmetics whose database realm_id is null. */
export function itemRealm(item: Pick<EconomyItem,'metadata'|'realm_id'>): ItemRealmFilter {
 const raw=item.metadata?.realmCollection ?? item.realm_id;
 return REALM_FILTER_OPTIONS.some(([key])=>key===raw&&key!=='all'&&key!=='general') ? raw as ItemRealmFilter : 'general';
}
export function matchesItemRealm(item: Pick<EconomyItem,'metadata'|'realm_id'>,filter:ItemRealmFilter){
 return filter==='all'||itemRealm(item)===filter;
}
