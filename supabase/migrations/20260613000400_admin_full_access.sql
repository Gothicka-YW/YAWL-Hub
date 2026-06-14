-- Makes Admin a universal permission override.
-- An active Admin staff profile or linked active Admin member receives all management capabilities.

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_permissions
    where lower(email) = public.current_user_email()
      and is_active = true
      and permission_role = 'admin'
  )
  or exists (
    select 1
    from public.members
    where id = public.current_member_id()
      and is_active = true
      and group_role = 'admin'
  );
$$;

create or replace function public.current_user_can_manage_members()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin()
    or exists (
      select 1
      from public.staff_permissions
      where lower(email) = public.current_user_email()
        and is_active = true
        and can_manage_members = true
    );
$$;

create or replace function public.current_user_can_manage_roles()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin()
    or exists (
      select 1
      from public.staff_permissions
      where lower(email) = public.current_user_email()
        and is_active = true
        and can_manage_roles = true
    );
$$;

create or replace function public.current_user_can_manage_events()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin()
    or exists (
      select 1
      from public.staff_permissions
      where lower(email) = public.current_user_email()
        and is_active = true
        and can_manage_events = true
    );
$$;

create or replace function public.current_user_is_yomodels_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin();
$$;

comment on function public.current_user_is_admin() is
  'Returns true for an active Admin staff profile or a linked active member assigned the Admin role.';
