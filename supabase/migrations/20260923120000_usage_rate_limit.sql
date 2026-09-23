-- Atomically checks and increments a user's daily usage count for a
-- feature (e.g. 'chat'), used by Edge Functions for rate limiting.
-- security definer so it can write usage_limits (which has no INSERT/UPDATE
-- policy) even when called by a normal authenticated user's own client.
create or replace function public.increment_usage(
  p_user_id uuid,
  p_feature text,
  p_daily_limit int
) returns table (allowed boolean, current_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.usage_limits (user_id, feature, day, count)
  values (p_user_id, p_feature, current_date, 1)
  on conflict (user_id, feature, day)
  do update set count = usage_limits.count + 1
  where usage_limits.count < p_daily_limit
  returning count into v_count;

  if v_count is null then
    select count into v_count
    from public.usage_limits
    where user_id = p_user_id and feature = p_feature and day = current_date;

    return query select false, coalesce(v_count, 0);
  else
    return query select true, v_count;
  end if;
end;
$$;

grant execute on function public.increment_usage(uuid, text, int) to authenticated, service_role;
