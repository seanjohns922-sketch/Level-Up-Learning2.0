begin;

-- Public read of the active gem catalogue (no student context) so the Gem Vault
-- can be previewed in Demo mode with nothing owned and zero progress. Real
-- students always use get_gem_vault_secure (progress + ownership). Catalogue
-- data is not private, so this is safe to expose to anon/authenticated.
create or replace function public.get_gem_catalog_secure()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    to_jsonb(d)
    || jsonb_build_object('current', 0)
    || jsonb_build_object('target', case when d.milestone_type = 'all_live_legends' then 0 else d.threshold end)
    order by d.display_order, d.slug
  ), '[]'::jsonb)
  from public.gem_definitions d where d.is_active;
$$;
revoke all on function public.get_gem_catalog_secure() from public;
grant execute on function public.get_gem_catalog_secure() to anon, authenticated;

commit;
