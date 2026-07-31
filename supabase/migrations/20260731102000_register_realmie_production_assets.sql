begin;

-- R3 adds standalone transparent figure artwork without changing the secure R2
-- ownership model. Locked silhouettes are derived from these alpha assets by
-- the client so each Realmie retains one canonical production render.
with production_assets(realmie_key, asset_path) as (
  values
    ('number-nexus-numbot-counter-standard', '/realmies/number/numbot-counter.png'),
    ('number-nexus-numbot-builder-standard', '/realmies/number/numbot-builder.png'),
    ('number-nexus-numbot-processor-standard', '/realmies/number/numbot-processor.png'),
    ('number-nexus-numbot-solver-standard', '/realmies/number/numbot-solver.png'),
    ('number-nexus-numbot-calculator-standard', '/realmies/number/numbot-calculator.png'),
    ('number-nexus-numbot-equationator-standard', '/realmies/number/numbot-equationator.png'),
    ('measurelands-meazurex-ticklet-standard', '/realmies/measurement/meazurex-ticklet.png'),
    ('measurelands-meazurex-measurer-standard', '/realmies/measurement/meazurex-measurer.png'),
    ('measurelands-meazurex-tracker-standard', '/realmies/measurement/meazurex-tracker.png'),
    ('measurelands-meazurex-balancer-standard', '/realmies/measurement/meazurex-balancer.png'),
    ('measurelands-meazurex-calibrator-standard', '/realmies/measurement/meazurex-calibrator.png'),
    ('measurelands-meazurex-timewielder-standard', '/realmies/measurement/meazurex-timewielder.png'),
    ('starpath-geospin-roller-standard', '/realmies/space/geospin-roller.png'),
    ('starpath-geospin-mapper-standard', '/realmies/space/geospin-mapper.png'),
    ('starpath-geospin-navigator-standard', '/realmies/space/geospin-navigator.png'),
    ('starpath-geospin-shapeshifter-standard', '/realmies/space/geospin-shapeshifter.png'),
    ('starpath-geospin-galaxycrafter-standard', '/realmies/space/geospin-galaxycrafter.png'),
    ('starpath-geospin-starweaver-standard', '/realmies/space/geospin-starweaver.png')
)
update public.realmie_catalogue catalogue
set
  asset_path = production_assets.asset_path,
  silhouette_asset_path = null,
  metadata = (catalogue.metadata - 'asset_status') || jsonb_build_object(
    'asset_status', 'ready',
    'artwork_phase', 'R3',
    'canvas', '1200x1600',
    'silhouette_mode', 'derived',
    'collection_status', case
      when catalogue.realm_id in ('number', 'measurement') then 'live'
      else 'coming_soon'
    end
  ),
  updated_at = now()
from production_assets
where catalogue.realmie_key = production_assets.realmie_key;

do $$
declare
  v_registered integer;
begin
  select count(*)
  into v_registered
  from public.realmie_catalogue
  where category = 'legend'
    and variant_type = 'standard'
    and realm_id in ('number', 'measurement', 'space')
    and asset_path like '/realmies/%'
    and metadata ->> 'asset_status' = 'ready';

  if v_registered <> 18 then
    raise exception
      'Realmie production asset registration expected 18 catalogue rows, found %',
      v_registered;
  end if;
end;
$$;

-- Collection availability is intentionally separate from realm content and
-- artwork readiness. Starpath assets can be prepared without exposing Geospin
-- to production students before the realm launches.
create or replace function public.get_realmie_collection_availability_secure()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_array(
    jsonb_build_object(
      'realm_id', 'number',
      'display_name', 'Number Nexus',
      'character_name', 'Numbot',
      'status', 'live'
    ),
    jsonb_build_object(
      'realm_id', 'measurement',
      'display_name', 'Measurelands',
      'character_name', 'Meazurex',
      'status', 'live'
    ),
    jsonb_build_object(
      'realm_id', 'space',
      'display_name', 'Starpath',
      'character_name', 'Geospin',
      'status', 'coming_soon'
    )
  );
$$;

revoke all on function public.get_realmie_collection_availability_secure()
  from public, anon, authenticated;
grant execute on function public.get_realmie_collection_availability_secure()
  to anon, authenticated;

commit;
