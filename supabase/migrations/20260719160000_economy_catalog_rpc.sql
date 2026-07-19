begin;

-- Read-only catalogue of every active economy item. economy_items has RLS with
-- all grants revoked, so the client cannot select it directly. Demo Preview
-- mode uses this to show the full Marketplace / Wardrobe / Home themes with
-- everything owned, without a real student wallet. No student context needed,
-- so it is safe to expose to anon/authenticated (catalogue data is not private).
create or replace function public.get_economy_catalog_secure()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(to_jsonb(i) order by i.sort_order, i.item_key), '[]'::jsonb)
  from public.economy_items i
  where i.active;
$$;

revoke all on function public.get_economy_catalog_secure() from public;
grant execute on function public.get_economy_catalog_secure() to anon, authenticated;

commit;
