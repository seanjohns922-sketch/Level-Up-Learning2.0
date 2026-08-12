begin;

create or replace function public.get_platform_admin_audit(p_limit integer default 100)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_owner() then
    raise exception 'Platform owner access required' using errcode = '42501';
  end if;
  return (
    select coalesce(jsonb_agg(to_jsonb(entry) order by entry."createdAt" desc), '[]'::jsonb)
    from (
      select audit.id, audit.actor_user_id as "actorUserId", audit.action,
        audit.entity_type as "entityType", audit.entity_id as "entityId",
        audit.before_state as "beforeState", audit.after_state as "afterState",
        audit.reason, audit.created_at as "createdAt"
      from public.platform_admin_audit_log audit
      order by audit.created_at desc
      limit least(greatest(coalesce(p_limit, 100), 1), 500)
    ) entry
  );
end;
$$;

revoke all on function public.get_platform_admin_audit(integer) from public, anon;
grant execute on function public.get_platform_admin_audit(integer) to authenticated;

commit;
