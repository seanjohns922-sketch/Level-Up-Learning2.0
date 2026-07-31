begin;

-- The first child-facing Realmies release contains the two realms currently
-- available to students. This migration changes presentation metadata only:
-- canonical discovery rules, ownership, receipts and progression are untouched.
alter table public.realmie_catalogue
  drop constraint if exists realmie_catalogue_asset_path_check,
  drop constraint if exists realmie_catalogue_silhouette_asset_path_check;

alter table public.realmie_catalogue
  add constraint realmie_catalogue_asset_path_check
    check (
      asset_path is null
      or asset_path ~ '^/realmies/[a-z0-9-]+/[a-z0-9-]+\.(png|webp)$'
      or asset_path ~ '^/realmies/(number|measurement|space|global)/[a-z0-9-]+\.(png|webp)$'
    ),
  add constraint realmie_catalogue_silhouette_asset_path_check
    check (
      silhouette_asset_path is null
      or silhouette_asset_path ~ '^/realmies/[a-z0-9-]+/[a-z0-9-]*silhouette\.(png|webp)$'
      or silhouette_asset_path ~ '^/realmies/(number|measurement|space|global)/[a-z0-9-]+-silhouette\.(png|webp)$'
    );

update public.realmie_catalogue
set
  asset_path = '/realmies/' || realmie_key || '/hero-transparent.png',
  silhouette_asset_path = '/realmies/' || realmie_key || '/silhouette.png',
  metadata = metadata || jsonb_build_object(
    'asset_status', 'ready',
    'collection_status', 'live',
    'digital_release', 'number-measurement-v1',
    'manufacturing_ready', false
  ),
  updated_at = now()
where realmie_key in (
  'number-nexus-bitling-standard',
  'number-nexus-carrybot-standard',
  'number-nexus-codekeeper-standard',
  'number-nexus-neon-sentinel-standard',
  'measurelands-gaugekin-standard',
  'measurelands-ruleroot-standard',
  'measurelands-compass-keeper-standard',
  'measurelands-golden-surveyor-standard'
);

update public.realmie_catalogue
set
  asset_path = null,
  silhouette_asset_path = null,
  metadata = metadata || jsonb_build_object(
    'asset_status', 'awaiting_production',
    'collection_status', 'coming_soon',
    'student_visible', false
  ),
  updated_at = now()
where realm_id = 'space'
  and is_collectible;

update public.realmie_catalogue
set
  asset_path = null,
  silhouette_asset_path = null,
  metadata = metadata || jsonb_build_object(
    'asset_status', 'awaiting_production',
    'collection_status', 'hidden',
    'student_visible', false
  ),
  updated_at = now()
where realm_id = 'global'
  and is_collectible;

do $$
declare
  v_ready_count integer;
begin
  select count(*)
  into v_ready_count
  from public.realmie_catalogue catalogue
  where catalogue.is_active
    and catalogue.is_collectible
    and catalogue.variant_type = 'standard'
    and catalogue.realm_id in ('number', 'measurement')
    and catalogue.metadata->>'asset_status' = 'ready'
    and catalogue.asset_path is not null
    and catalogue.silhouette_asset_path is not null;

  if v_ready_count <> 8 then
    raise exception 'Live Realmies release invariant failed: expected 8 ready assets, found %',
      v_ready_count;
  end if;
end;
$$;

commit;
