import assert from 'node:assert/strict';
import fs from 'node:fs';
import {centralWorldCategory,marketplaceDepartment,marketplaceCategory,MARKETPLACE_CATEGORIES} from '../lib/marketplace-categories.ts';
import {resolveMarketplaceVisual} from '../lib/marketplace-visuals.ts';
import {CENTRAL_WORLD_CUSTOMISATION_CATALOG as catalogue,mergeCentralWorldCatalogue} from '../lib/world3d/central-world-customisation-catalog.ts';
const sample={...catalogue[0],metadata:{}};
for(const item of catalogue){
 assert.equal(marketplaceDepartment(item),'world');assert(centralWorldCategory(item));
 const visual=resolveMarketplaceVisual({...item,metadata:{...item.metadata,image:'/old-flat-image.png',marketplace_visual:{type:'asset',src:'/obsolete.png',alt:'old',previewMode:'background'}}});
 assert.equal(visual.previewMode,'world');assert(visual.src.startsWith('/marketplace/world-renders/'));
 assert(fs.existsSync('public'+visual.src),'Rendered product image exists: '+item.name);
}
const expectations={avatar:['avatar','outfits'],pet:['avatar','companions'],trail:['avatar','effects'],emote:['avatar','effects'],victory_effect:['avatar','effects'],nameplate:['avatar','identity'],title:['avatar','identity'],home:['world','home'],background:['world','home'],decoration:['world','decorations'],collectible:['world','decorations']};
for(const [category,[department,filter]] of Object.entries(expectations)){
 const item={...sample,category};assert.equal(marketplaceDepartment(item),department);assert.equal(marketplaceCategory(item),filter);
 assert(MARKETPLACE_CATEGORIES[department].some(c=>c.id===filter),'Every supported reward has a visible category');
}
assert.equal(marketplaceDepartment({...sample,category:'pet',metadata:{marketplaceCategory:'animals'}}),'world','Habitat is distinct from avatar companion');
const serverItem={...catalogue[0],price:1234,purchasable:false,description:'Server description',metadata:{...catalogue[0].metadata,customFlag:true}};
const state={items:[serverItem],inventory:[{item_key:serverItem.item_key}],equipped:{},wallet:{xp_balance:77}};
const merged=mergeCentralWorldCatalogue(state),item=merged.items.find(i=>i.item_key===serverItem.item_key);
assert.equal(item.price,1234);assert.equal(item.purchasable,false);assert.equal(item.description,'Server description');assert.equal(item.metadata.customFlag,true);
assert.equal(item.metadata.marketplace_visual.previewMode,'world');assert.equal(merged.wallet,state.wallet);assert.equal(merged.inventory,state.inventory);
assert.equal(resolveMarketplaceVisual({...sample,item_key:'unknown'}).type,'unavailable','Unknown artwork does not receive a generic purchasable image');
console.log('PASS: world/avatar classification, 42 approved model previews, legacy art replacement and server pricing/ownership preservation.');
