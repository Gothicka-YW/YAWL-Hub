-- Apply after 20260514000600_staff_icons.sql.
-- Adds a dedicated RPC for activating or deactivating members without relying on the broader members table PATCH policy.

create or replace function public.current_user_can_set_member_active(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and exists (
      select 1
      from public.members
      where id = target_member_id
        and public.current_user_can_manage_members()
        and (
          coalesce(nullif(lower(group_role), ''), 'member') = 'member'
          or public.current_user_can_manage_roles()
        )
    );
$$;

create or replace function public.set_member_active(
  p_member_id uuid,
  p_is_active boolean default true
)
returns table (
  member_id uuid,
  is_active boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_member_id is null then
    raise exception 'Choose a valid member before updating their status.';
  end if;

  if not public.current_user_can_set_member_active(p_member_id) then
    raise exception 'Only staff with member access can change this member''s active status.'
      using errcode = '42501';
  end if;

  update public.members
  set is_active = coalesce(p_is_active, true)
  where id = p_member_id
  returning id, public.members.is_active
    into member_id, is_active;

  if member_id is null then
    raise exception 'That member could not be found.';
  end if;

  return next;
end;
$$;

grant execute on function public.set_member_active(uuid, boolean) to authenticated;