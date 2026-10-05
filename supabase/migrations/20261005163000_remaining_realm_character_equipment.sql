-- Signature equipment from the existing Patternox, Datara and Chanzia artwork.
-- Existing avatar_hand purchase/equip flow; no endpoint or permission changes.
begin;
insert into public.economy_items
(item_key,name,description,category,realm_id,rarity,price,icon,accent,active,purchasable,discoverable,sort_order,metadata)
values
('avatar_hand_patternox_codemaster_gauntlet','Codemaster’s Crystal Gauntlet','Wear a gauntlet inspired by Patternox Codemaster’s dark armour, gold bands and violet crystal spikes. Cosmetic equipment.','avatar',null,'legendary',1400,'gem','#bc7cf4',true,true,false,613,'{"slot":"avatar_hand","held":"patternox_codemaster_gauntlet","characterSource":"patternox-codemaster","realmCollection":"pattern"}'),
('avatar_hand_datara_insightkeeper_tablet','Insightkeeper’s Data Tablet','Carry Datara Insightkeeper’s crystal-edged tablet, with luminous charts and gold trim. Cosmetic equipment.','avatar',null,'rare',850,'tablet','#8bdcfa',true,true,false,614,'{"slot":"avatar_hand","held":"datara_insightkeeper_tablet","characterSource":"datara-insightkeeper","realmCollection":"statistics"}'),
('avatar_hand_chanzia_master_die','Chanzia Master’s Glowing Die','Carry Chanzia Master’s dark violet die, with glowing pink pips and an orbit of magic. Cosmetic equipment.','avatar',null,'legendary',1400,'dice-5','#df83ec',true,true,false,615,'{"slot":"avatar_hand","held":"chanzia_master_die","characterSource":"chanzia-master","realmCollection":"chance"}')
on conflict (item_key) do nothing;
commit;
