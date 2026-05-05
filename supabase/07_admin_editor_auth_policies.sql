grant select, insert, update on table public.staff_permissions to authenticated;

create or replace function public.current_user_can_assign_member_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_members()
    and (
      coalesce(nullif(lower(target_role), ''), 'member') = 'member'
      or public.current_user_can_manage_roles()
    );
$$;

drop policy if exists "staff can read own profile" on public.staff_permissions;

create policy "staff can read own profile"
on public.staff_permissions
for select
to authenticated
using (
  (lower(email) = public.current_staff_email() and is_active = true)
  or public.current_user_can_manage_roles()
);

drop policy if exists "role managers can insert staff profiles" on public.staff_permissions;

create policy "role managers can insert staff profiles"
on public.staff_permissions
for insert
to authenticated
with check (public.current_user_can_manage_roles());

drop policy if exists "role managers can update staff profiles" on public.staff_permissions;

create policy "role managers can update staff profiles"
on public.staff_permissions
for update
to authenticated
using (public.current_user_can_manage_roles())
with check (public.current_user_can_manage_roles());

drop policy if exists "staff can insert members" on public.members;

create policy "staff can insert members"
on public.members
for insert
to authenticated
with check (public.current_user_can_assign_member_role(group_role));

drop policy if exists "staff can update members" on public.members;

create policy "staff can update members"
on public.members
for update
to authenticated
using (
  public.current_user_can_manage_members()
  and (
    coalesce(nullif(lower(group_role), ''), 'member') = 'member'
    or public.current_user_can_manage_roles()
  )
)
with check (public.current_user_can_assign_member_role(group_role));

-- Hard deletes remain disabled on purpose.
-- Use is_active = false to remove a member from the live directory.