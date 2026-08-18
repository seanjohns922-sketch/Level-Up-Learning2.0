begin;

-- Parent read-boundary hardening redefined this function without avatar_base.
-- Wardrobe writes still succeeded, but every save/read response then rebuilt
-- the client avatar from an empty base and visually reverted to the default.
create or replace function public.get_student_economy_secure(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  perform public.assert_student_read(p_student_id);
  insert into public.student_economy_wallets(student_id)
  values (p_student_id)
  on conflict do nothing;

  select jsonb_build_object(
    'wallet', jsonb_build_object(
      'xp_earned', wallet.xp_earned,
      'xp_spent', wallet.xp_spent,
      'xp_balance', wallet.xp_earned - wallet.xp_spent,
      'essence', wallet.essence
    ),
    'items', coalesce((
      select jsonb_agg(to_jsonb(item) order by item.sort_order, item.name)
      from public.economy_items item
      where item.active
    ), '[]'::jsonb),
    'inventory', coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_key', inventory.item_key,
        'acquired_at', inventory.acquired_at,
        'acquisition_type', inventory.acquisition_type
      ) order by inventory.acquired_at desc)
      from public.student_inventory inventory
      where inventory.student_id = p_student_id
    ), '[]'::jsonb),
    'equipped', coalesce((
      select jsonb_object_agg(equipped.slot, equipped.item_key)
      from public.student_equipped_items equipped
      where equipped.student_id = p_student_id
    ), '{}'::jsonb),
    'avatar_base', coalesce((
      select avatar.base
      from public.student_avatar_base avatar
      where avatar.student_id = p_student_id
    ), '{}'::jsonb)
  ) into result
  from public.student_economy_wallets wallet
  where wallet.student_id = p_student_id;

  return result;
end;
$$;

revoke all on function public.get_student_economy_secure(uuid) from public;
grant execute on function public.get_student_economy_secure(uuid) to anon, authenticated;

commit;
