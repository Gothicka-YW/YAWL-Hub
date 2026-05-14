-- Apply after 20260514000100_yomodels_module.sql.
-- Fixes ambiguous member_id references inside public.create_member_invite().

create or replace function public.create_member_invite(
  p_member_id uuid,
  p_invite_code text,
  p_expires_in_days integer default 14
)
returns table (invite_id uuid, member_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text := public.normalize_member_invite_code(p_invite_code);
  next_expires_at timestamptz := now() + make_interval(days => least(greatest(coalesce(p_expires_in_days, 14), 1), 30));
  new_invite_id uuid;
begin
  if not public.current_user_can_manage_members() then
    raise exception 'Only staff with member access can create invite codes.';
  end if;

  if p_member_id is null then
    raise exception 'Choose a member before creating an invite code.';
  end if;

  if length(normalized_code) < 10 then
    raise exception 'Invite codes must be at least 10 characters long.';
  end if;

  if not exists (
    select 1
    from public.members
    where id = p_member_id
      and is_active = true
  ) then
    raise exception 'Choose an active member before creating an invite code.';
  end if;

  if public.member_has_linked_account(p_member_id) then
    raise exception 'That member already has a claimed account.';
  end if;

  update public.member_invites as invites
  set revoked_at = now()
  where invites.member_id = p_member_id
    and invites.claimed_at is null
    and invites.revoked_at is null;

  insert into public.member_invites (
    member_id,
    invite_code_hash,
    expires_at,
    created_by_email
  )
  values (
    p_member_id,
    public.hash_member_invite_code(p_invite_code),
    next_expires_at,
    public.current_staff_email()
  )
  returning id, public.member_invites.expires_at
  into new_invite_id, next_expires_at;

  invite_id := new_invite_id;
  member_id := p_member_id;
  expires_at := next_expires_at;
  return next;
exception
  when unique_violation then
    raise exception 'That invite code is already in use. Generate a new code and try again.';
end;
$$;