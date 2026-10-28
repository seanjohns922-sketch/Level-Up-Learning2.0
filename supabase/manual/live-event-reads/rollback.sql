-- Revert the corresponding app change before removing the optimized endpoint.
drop function if exists public.get_live_class_events_secure(uuid, uuid[], text[], boolean, integer);
notify pgrst, 'reload schema';
