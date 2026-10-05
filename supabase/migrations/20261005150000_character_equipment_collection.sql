-- Additive XP equipment, based on existing RELIQ character artwork.
-- Uses the existing avatar_hand slot and guarded purchase/equip endpoints.
-- No changes to student sessions, grants, ownership, balances or existing items.
begin;
insert into public.economy_items
(item_key,name,description,category,realm_id,rarity,price,icon,accent,active,purchasable,discoverable,sort_order,metadata)
values
('avatar_hand_meazurex_timewielder_staff','Meazurex Timewielder’s Staff','Carry Meazurex’s large gold staff, with its violet core, concentric rings and hanging crystals. Cosmetic equipment.','avatar',null,'legendary',1500,'wand-sparkles','#a78bfa',true,true,false,610,'{"slot":"avatar_hand","held":"meazurex_timewielder_staff","characterSource":"meazurex-timewielder","realmCollection":"measurement"}'),
('avatar_hand_numbot_equationator_calculator','Numbot Equationator’s Calculator','Carry Equationator’s signature calculator, with its green display and gold digits. Cosmetic equipment.','avatar',null,'rare',650,'calculator','#40a9c5',true,true,false,611,'{"slot":"avatar_hand","held":"numbot_equationator_calculator","characterSource":"numbot-equationator","realmCollection":"number"}'),
('avatar_hand_geospin_starweaver_orb','Geospin Starweaver’s Orb','Carry Starweaver’s violet geometric sphere, surrounded by gold orbit rings. Cosmetic equipment.','avatar',null,'legendary',1400,'orbit','#a78bfa',true,true,false,612,'{"slot":"avatar_hand","held":"geospin_starweaver_orb","characterSource":"geospin-starweaver","realmCollection":"space"}')
on conflict (item_key) do nothing;
commit;
