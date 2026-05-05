alter table public.members
add column if not exists group_role text not null default 'member';

comment on column public.members.group_role is 'Visible YoAngels role shown in the member directory.';

alter table public.members
drop constraint if exists members_group_role_check;

alter table public.members
add constraint members_group_role_check
check (group_role in ('member', 'admin', 'event_planner', 'moderator', 'helper'));

update public.members
set group_role = 'admin'
where lower(coalesce(in_game_name, '')) = 'gothicka'
   or lower(coalesce(facebook_name, '')) in ('gothicka yw', 'gothicka');

create table if not exists public.staff_permissions (
  email text primary key,
  display_name text not null,
  permission_role text not null default 'helper',
  can_manage_members boolean not null default false,
  can_manage_roles boolean not null default false,
  can_manage_events boolean not null default false,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_permissions_role_check
    check (permission_role in ('admin', 'event_planner', 'moderator', 'helper'))
);

comment on table public.staff_permissions is 'Authenticated staff accounts that can manage the YoAngels directory later.';

drop trigger if exists set_staff_permissions_updated_at on public.staff_permissions;

create trigger set_staff_permissions_updated_at
before update on public.staff_permissions
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.staff_permissions enable row level security;

create or replace function public.current_staff_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.current_user_can_manage_members()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_permissions
    where lower(email) = public.current_staff_email()
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
  select exists (
    select 1
    from public.staff_permissions
    where lower(email) = public.current_staff_email()
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
  select exists (
    select 1
    from public.staff_permissions
    where lower(email) = public.current_staff_email()
      and is_active = true
      and can_manage_events = true
  );
$$;

grant insert, update on table public.members to authenticated;

drop policy if exists "staff can insert members" on public.members;

create policy "staff can insert members"
on public.members
for insert
to authenticated
with check (public.current_user_can_manage_members());

drop policy if exists "staff can update members" on public.members;

create policy "staff can update members"
on public.members
for update
to authenticated
using (public.current_user_can_manage_members())
with check (public.current_user_can_manage_members());

-- Intentionally do not allow hard deletes.
-- Staff can "remove" a member later by updating is_active = false.