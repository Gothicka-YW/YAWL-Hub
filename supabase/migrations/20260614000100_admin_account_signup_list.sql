-- Gives Admins a safe account-signup list without exposing passwords or auth secrets.

create or replace function public.list_account_signups()
returns table (
  auth_user_id uuid,
  email text,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  linked_member_id uuid,
  linked_member_name text,
  member_role text,
  is_staff boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access is required to list account signups.';
  end if;

  return query
  select
    account.id,
    lower(coalesce(account.email, ''))::text,
    account.created_at,
    account.last_sign_in_at,
    account.email_confirmed_at,
    linked_member.id,
    linked_member.facebook_name,
    linked_member.group_role,
    (staff.email is not null)
  from auth.users as account
  left join public.member_auth_links as auth_link
    on auth_link.auth_user_id = account.id
  left join public.member_accounts as legacy_link
    on lower(legacy_link.email) = lower(coalesce(account.email, ''))
  left join public.members as linked_member
    on linked_member.id = coalesce(auth_link.member_id, legacy_link.member_id)
  left join public.staff_permissions as staff
    on lower(staff.email) = lower(coalesce(account.email, ''))
    and staff.is_active = true
  order by account.created_at desc;
end;
$$;

revoke all on function public.list_account_signups() from public;
grant execute on function public.list_account_signups() to authenticated;

comment on function public.list_account_signups() is
  'Admin-only account activity list containing email, timestamps, confirmation state, and linked member identity. Passwords and auth secrets are excluded.';
