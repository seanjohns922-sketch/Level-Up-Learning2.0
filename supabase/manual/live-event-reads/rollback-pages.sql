-- The paginated app falls back to RLS-protected table pages if this RPC is absent.
drop function if exists public.get_live_class_event_page_secure(uuid,uuid[],text[],timestamptz,uuid,timestamptz,uuid);
notify pgrst, 'reload schema';
-- Keep the migration ledger intact; restore through a new migration if redeploying.
