-- Kart garage: six realm karts and six kart parts, plus four kart equip slots.
-- A realm kart costs XP and can only be bought once the learner has finished a level in that realm
-- (a student_realm_progress row for the realm with a completed post-test). Any economy item can now
-- carry that rule in metadata.requiresFinishedLevelIn; nothing else about purchasing changes.
-- Shop rows generated from lib/world3d/kart-garage.ts (checked by scripts/kart-garage-audit.mjs).
-- Rollback: delete the rows below (item_key like 'central_world_kart_%'), restore the slot check and
-- equip/purchase functions from 20260826152000 and 20260718110000, drop get_student_finished_realms_secure.
begin;

alter table public.student_equipped_items
  drop constraint if exists student_equipped_items_slot_check;
alter table public.student_equipped_items
  add constraint student_equipped_items_slot_check check (slot in (
    'avatar', 'avatar_outfit', 'avatar_hat', 'avatar_glasses', 'avatar_cape',
    'avatar_backpack', 'avatar_hand', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect',
    'world_plot_1', 'world_plot_2', 'world_plot_3', 'world_plot_4',
    'world_plot_5', 'world_plot_6', 'world_plot_7', 'world_plot_8',
    'kart', 'kart_spoiler', 'kart_wheels', 'kart_trail'
  ));

-- Realms where the learner has finished a level (completed a post-test).
create or replace function public.get_student_finished_realms_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_student_access(p_student_id);
  return coalesce((
    select jsonb_agg(distinct realm_id order by realm_id)
    from public.student_realm_progress
    where student_id = p_student_id and posttest_completed_at is not null
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.get_student_finished_realms_secure(uuid) from public;
grant execute on function public.get_student_finished_realms_secure(uuid) to anon, authenticated;

create or replace function public.purchase_economy_item_secure(
  p_student_id uuid,
  p_item_key text,
  p_purchase_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.economy_items%rowtype;
  wallet public.student_economy_wallets%rowtype;
  required_realm text;
begin
  perform public.assert_student_access(p_student_id);
  select * into target from public.economy_items
  where item_key = p_item_key and active and purchasable and price is not null;
  if target.item_key is null then raise exception 'Item is not available'; end if;

  if exists(select 1 from public.student_inventory where student_id = p_student_id and item_key = p_item_key) then
    raise exception 'Item is already owned';
  end if;

  required_realm := target.metadata->>'requiresFinishedLevelIn';
  if required_realm is not null and not exists(
    select 1 from public.student_realm_progress
    where student_id = p_student_id and realm_id = required_realm and posttest_completed_at is not null
  ) then
    raise exception 'Finish a level in this realm first';
  end if;

  insert into public.student_economy_wallets(student_id) values (p_student_id) on conflict do nothing;
  select * into wallet from public.student_economy_wallets where student_id = p_student_id for update;
  if wallet.xp_earned - wallet.xp_spent < target.price then raise exception 'Not enough XP'; end if;

  insert into public.student_economy_transactions(
    student_id, transaction_type, xp_delta, source_type, source_key, item_key
  ) values (
    p_student_id, 'purchase', -target.price, 'marketplace', p_purchase_key::text, p_item_key
  );
  insert into public.student_inventory(student_id, item_key, acquisition_type)
  values (p_student_id, p_item_key, 'purchase');
  update public.student_economy_wallets
  set xp_spent = xp_spent + target.price, updated_at = now()
  where student_id = p_student_id;

  return public.get_student_economy_secure(p_student_id);
end;
$$;
revoke all on function public.purchase_economy_item_secure(uuid, text, uuid) from public;
grant execute on function public.purchase_economy_item_secure(uuid, text, uuid) to anon, authenticated;

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
    'avatar_backpack', 'avatar_hand', 'top', 'bottom', 'footwear',
    'pet', 'home', 'background', 'trail', 'nameplate', 'title', 'victory_effect',
    'world_plot_1', 'world_plot_2', 'world_plot_3', 'world_plot_4',
    'world_plot_5', 'world_plot_6', 'world_plot_7', 'world_plot_8',
    'kart', 'kart_spoiler', 'kart_wheels', 'kart_trail'
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

insert into public.economy_items (item_key, name, description, category, realm_id, rarity, price, icon, accent, active, purchasable, discoverable, sort_order, metadata) values
('central_world_kart_number', 'Number Nexus Kart', 'Race in Number Nexus colours. Unlocks once you finish a level in Number Nexus.', 'decoration', null, 'epic', 400, 'car', '#14b8a6', true, true, false, 960, '{"slot":"kart","kart":"number","requiresFinishedLevelIn":"number","marketplaceCategory":"karts","marketplaceHidden":true}'::jsonb),
('central_world_kart_measurement', 'Measurelands Kart', 'Race in Measurelands colours. Unlocks once you finish a level in Measurelands.', 'decoration', null, 'epic', 400, 'car', '#b8893a', true, true, false, 961, '{"slot":"kart","kart":"measurement","requiresFinishedLevelIn":"measurement","marketplaceCategory":"karts","marketplaceHidden":true}'::jsonb),
('central_world_kart_space', 'Starpath Kart', 'Race in Starpath colours. Unlocks once you finish a level in Starpath.', 'decoration', null, 'epic', 400, 'car', '#7c3aed', true, true, false, 962, '{"slot":"kart","kart":"space","requiresFinishedLevelIn":"space","marketplaceCategory":"karts","marketplaceHidden":true}'::jsonb),
('central_world_kart_statistics', 'Statistica Kart', 'Race in Statistica colours. Unlocks once you finish a level in Statistica.', 'decoration', null, 'epic', 400, 'car', '#a83e4b', true, true, false, 963, '{"slot":"kart","kart":"statistics","requiresFinishedLevelIn":"statistics","marketplaceCategory":"karts","marketplaceHidden":true}'::jsonb),
('central_world_kart_pattern', 'Pattern Peaks Kart', 'Race in Pattern Peaks colours. Unlocks once you finish a level in Pattern Peaks.', 'decoration', null, 'epic', 400, 'car', '#059669', true, true, false, 964, '{"slot":"kart","kart":"pattern","requiresFinishedLevelIn":"pattern","marketplaceCategory":"karts","marketplaceHidden":true}'::jsonb),
('central_world_kart_chance', 'Chance Hollow Kart', 'Race in Chance Hollow colours. Unlocks once you finish a level in Chance Hollow.', 'decoration', null, 'epic', 400, 'car', '#be3455', true, true, false, 965, '{"slot":"kart","kart":"chance","requiresFinishedLevelIn":"chance","marketplaceCategory":"karts","marketplaceHidden":true}'::jsonb),
('central_world_kart_part_wing', 'Racing Wing', 'A spoiler for your kart. Buy it once and fit it to any kart.', 'decoration', null, 'uncommon', 150, 'wrench', '#3fd0ff', true, true, false, 970, '{"slot":"kart_spoiler","kartPart":"wing","marketplaceCategory":"kart_parts","marketplaceHidden":true}'::jsonb),
('central_world_kart_part_fin', 'Shark Fin', 'A spoiler for your kart. Buy it once and fit it to any kart.', 'decoration', null, 'uncommon', 200, 'wrench', '#3fd0ff', true, true, false, 971, '{"slot":"kart_spoiler","kartPart":"fin","marketplaceCategory":"kart_parts","marketplaceHidden":true}'::jsonb),
('central_world_kart_part_jet', 'Twin Jets', 'A spoiler for your kart. Buy it once and fit it to any kart.', 'decoration', null, 'epic', 500, 'wrench', '#3fd0ff', true, true, false, 972, '{"slot":"kart_spoiler","kartPart":"jet","marketplaceCategory":"kart_parts","marketplaceHidden":true}'::jsonb),
('central_world_kart_part_chunky', 'Chunky Tyres', 'A wheels for your kart. Buy it once and fit it to any kart.', 'decoration', null, 'uncommon', 150, 'wrench', '#3fd0ff', true, true, false, 973, '{"slot":"kart_wheels","kartPart":"chunky","marketplaceCategory":"kart_parts","marketplaceHidden":true}'::jsonb),
('central_world_kart_part_neon', 'Neon Rims', 'A wheels for your kart. Buy it once and fit it to any kart.', 'decoration', null, 'rare', 350, 'wrench', '#3fd0ff', true, true, false, 974, '{"slot":"kart_wheels","kartPart":"neon","marketplaceCategory":"kart_parts","marketplaceHidden":true}'::jsonb),
('central_world_kart_part_trail', 'Sparkle Trail', 'A trail for your kart. Buy it once and fit it to any kart.', 'decoration', null, 'epic', 400, 'wrench', '#3fd0ff', true, true, false, 975, '{"slot":"kart_trail","kartPart":"trail","marketplaceCategory":"kart_parts","marketplaceHidden":true}'::jsonb)
on conflict (item_key) do nothing;

commit;
