begin;

-- Explorer Outfit Phase 2, step 3: earnable premium clothing.
-- Clothing garments can now be equipped from inventory into three new slots —
-- top / bottom / footwear — each carrying a garment style (+ signature colours)
-- in metadata. Equipping one overrides the free base style for that slot.

-- 1) Allow the new clothing slots on the equipped table.
alter table public.student_equipped_items
  drop constraint if exists student_equipped_items_slot_check;
alter table public.student_equipped_items
  add constraint student_equipped_items_slot_check check (slot in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect'
  ));

-- 2) Teach the equip RPC about the new slots.
create or replace function public.equip_economy_item_secure(
  p_student_id uuid,
  p_item_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.economy_items%rowtype;
  target_slot text;
begin
  perform public.assert_student_access(p_student_id);
  select * into target from public.economy_items where item_key = p_item_key and active;
  if target.item_key is null then raise exception 'Item is not available'; end if;
  if not exists(select 1 from public.student_inventory where student_id = p_student_id and item_key = p_item_key) then
    raise exception 'Item is not owned';
  end if;

  target_slot := coalesce(target.metadata->>'slot', target.category);
  if target_slot not in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect'
  ) then
    raise exception 'Item cannot be equipped';
  end if;

  insert into public.student_equipped_items(student_id, slot, item_key)
  values (p_student_id, target_slot, p_item_key)
  on conflict (student_id, slot) do update set item_key = excluded.item_key, equipped_at = now();
  return public.get_student_economy_secure(p_student_id);
end;
$$;
revoke all on function public.equip_economy_item_secure(uuid, text) from public;
grant execute on function public.equip_economy_item_secure(uuid, text) to anon, authenticated;

-- 3) Premium clothing catalogue. Each item ships a garment style (+ colours) in
--    metadata; equipping merges those over the free base look. Idempotent upsert.
insert into public.economy_items (
  item_key, name, description, category, realm_id, rarity, price, icon, accent,
  purchasable, discoverable, sort_order, metadata
) values
  -- Tops
  ('top_field_tee', 'Field Tee', 'A rugged olive tee for real fieldwork.', 'avatar', 'measurement', 'common', 80, 'Shirt', '#4d7c0f', true, false, 200,
    '{"slot":"top","top":"tshirt","shirt":"#4d7c0f","shirtTrim":"#d9f99d"}'),
  ('top_champion_polo', 'Champion Polo', 'A crisp polo for confident explorers.', 'avatar', null, 'uncommon', 150, 'Shirt', '#dc2626', true, false, 201,
    '{"slot":"top","top":"polo","shirt":"#dc2626","shirtTrim":"#fecaca"}'),
  ('top_realm_hoodie', 'Realm Hoodie', 'A circuit-trim hoodie for Number Nexus.', 'avatar', 'number', 'uncommon', 170, 'Shirt', '#0f766e', true, false, 202,
    '{"slot":"top","top":"hoodie","shirt":"#0f766e","shirtTrim":"#99f6e4"}'),
  ('top_explorer_jacket', 'Explorer Jacket', 'A khaki field jacket with roomy pockets.', 'avatar', null, 'rare', 320, 'Shirt', '#65a30d', true, false, 203,
    '{"slot":"top","top":"jacket","shirt":"#4d7c0f","shirtTrim":"#d9f99d"}'),
  ('top_varsity_jacket', 'Varsity Jacket', 'A classic navy varsity jacket.', 'avatar', null, 'rare', 340, 'Shirt', '#1e3a8a', true, false, 204,
    '{"slot":"top","top":"jacket","shirt":"#1e3a8a","shirtTrim":"#fde68a"}'),
  ('top_aurora_jumper', 'Aurora Jumper', 'A cosy jumper in shifting aurora violet.', 'avatar', null, 'epic', 620, 'Shirt', '#7c3aed', true, false, 205,
    '{"slot":"top","top":"jumper","shirt":"#7c3aed","shirtTrim":"#ddd6fe"}'),
  -- Bottoms
  ('bottom_cargo_shorts', 'Cargo Shorts', 'Practical shorts for warm-weather quests.', 'avatar', null, 'uncommon', 130, 'Shirt', '#7c5b21', true, false, 210,
    '{"slot":"bottom","bottom":"shorts","pants":"#7c5b21"}'),
  ('bottom_ranger_track', 'Ranger Track Pants', 'Sleek track pants built for speed.', 'avatar', null, 'uncommon', 170, 'Shirt', '#1f2937', true, false, 211,
    '{"slot":"bottom","bottom":"trackpants","pants":"#1f2937"}'),
  ('bottom_adventure_jeans', 'Adventure Jeans', 'Hard-wearing denim for any trail.', 'avatar', null, 'rare', 300, 'Shirt', '#2563eb', true, false, 212,
    '{"slot":"bottom","bottom":"jeans","pants":"#2563eb"}'),
  ('bottom_aurora_skirt', 'Aurora Skirt', 'A twirly skirt in aurora violet.', 'avatar', null, 'rare', 300, 'Shirt', '#7c3aed', true, false, 213,
    '{"slot":"bottom","bottom":"skirt","pants":"#7c3aed"}'),
  -- Footwear
  ('shoe_trail_sandals', 'Trail Sandals', 'Breezy sandals for sunny expeditions.', 'avatar', null, 'common', 80, 'Footprints', '#c68642', true, false, 220,
    '{"slot":"footwear","shoeStyle":"sandals","shoes":"#c68642"}'),
  ('shoe_explorer_boots', 'Explorer Boots', 'Sturdy boots that conquer any terrain.', 'avatar', null, 'rare', 320, 'Footprints', '#7c5b21', true, false, 221,
    '{"slot":"footwear","shoeStyle":"boots","shoes":"#7c5b21"}'),
  ('shoe_rocket_hightops', 'Rocket High-Tops', 'Blazing red high-tops with a spring in the step.', 'avatar', null, 'epic', 640, 'Footprints', '#dc2626', true, false, 222,
    '{"slot":"footwear","shoeStyle":"hightops","shoes":"#dc2626"}')
on conflict (item_key) do update set
  name = excluded.name, description = excluded.description, category = excluded.category,
  realm_id = excluded.realm_id, rarity = excluded.rarity, price = excluded.price,
  icon = excluded.icon, accent = excluded.accent, purchasable = excluded.purchasable,
  discoverable = excluded.discoverable, active = true, sort_order = excluded.sort_order,
  metadata = excluded.metadata;

commit;
