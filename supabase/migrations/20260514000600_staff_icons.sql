-- Apply after 20260514000500_dashboard_announcement.sql.
-- Adds reusable staff account icons with self-service uploads for staff/admin accounts.

alter table public.staff_permissions
  add column if not exists icon_url text,
  add column if not exists icon_path text,
  add column if not exists icon_mime_type text,
  add column if not exists icon_name text;

comment on column public.staff_permissions.icon_url is 'Public URL for the staff account square icon shown in account/admin identity surfaces.';
comment on column public.staff_permissions.icon_path is 'Storage object path for the staff account icon.';
comment on column public.staff_permissions.icon_mime_type is 'Uploaded MIME type for the staff account icon.';
comment on column public.staff_permissions.icon_name is 'Original or processed file name for the staff account icon.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_permissions_icon_url_check'
  ) then
    alter table public.staff_permissions
      add constraint staff_permissions_icon_url_check
      check (icon_url is null or icon_url ~* '^https?://');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_permissions_icon_mime_type_check'
  ) then
    alter table public.staff_permissions
      add constraint staff_permissions_icon_mime_type_check
      check (icon_mime_type is null or icon_mime_type in ('image/png', 'image/jpeg', 'image/webp'));
  end if;
end;
$$;

create or replace function public.current_user_can_manage_staff_icon(target_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select nullif(lower(btrim(coalesce(target_email, ''))), '') is not null
    and (
      public.current_user_can_manage_roles()
      or public.current_staff_email() = nullif(lower(btrim(coalesce(target_email, ''))), '')
    );
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-icons',
  'staff-icons',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.staff_icon_storage_email(object_name text)
returns text
language sql
immutable
as $$
  select nullif(lower(split_part(coalesce(object_name, ''), '/', 1)), '');
$$;

drop policy if exists "public can read staff icons" on storage.objects;

create policy "public can read staff icons"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'staff-icons');

drop policy if exists "staff can upload staff icons" on storage.objects;

create policy "staff can upload staff icons"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'staff-icons'
  and public.current_user_can_manage_staff_icon(public.staff_icon_storage_email(name))
);

drop policy if exists "staff can update staff icons" on storage.objects;

create policy "staff can update staff icons"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'staff-icons'
  and public.current_user_can_manage_staff_icon(public.staff_icon_storage_email(name))
)
with check (
  bucket_id = 'staff-icons'
  and public.current_user_can_manage_staff_icon(public.staff_icon_storage_email(name))
);

drop policy if exists "staff can delete staff icons" on storage.objects;

create policy "staff can delete staff icons"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'staff-icons'
  and public.current_user_can_manage_staff_icon(public.staff_icon_storage_email(name))
);

create or replace function public.set_staff_icon(
  p_staff_email text,
  p_icon_url text default null,
  p_icon_path text default null,
  p_icon_mime_type text default null,
  p_icon_name text default null
)
returns table (
  email text,
  display_name text,
  permission_role text,
  can_manage_members boolean,
  can_manage_roles boolean,
  can_manage_events boolean,
  is_active boolean,
  notes text,
  icon_url text,
  icon_path text,
  icon_mime_type text,
  icon_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := nullif(lower(btrim(coalesce(p_staff_email, ''))), '');
  normalized_icon_url text := nullif(btrim(coalesce(p_icon_url, '')), '');
  normalized_icon_path text := nullif(btrim(coalesce(p_icon_path, '')), '');
  normalized_icon_mime_type text := lower(nullif(btrim(coalesce(p_icon_mime_type, '')), ''));
  normalized_icon_name text := nullif(btrim(coalesce(p_icon_name, '')), '');
begin
  if normalized_email is null then
    raise exception 'Choose a valid staff account before saving an icon.';
  end if;

  if not exists (
    select 1
    from public.staff_permissions
    where lower(public.staff_permissions.email) = normalized_email
      and public.staff_permissions.is_active = true
  ) then
    raise exception 'Choose an active staff account before saving an icon.';
  end if;

  if not public.current_user_can_manage_staff_icon(normalized_email) then
    raise exception 'Only the signed-in staff account or a role manager can change this icon.';
  end if;

  if normalized_icon_url is null then
    return query
    update public.staff_permissions
    set icon_url = null,
        icon_path = null,
        icon_mime_type = null,
        icon_name = null
    where lower(public.staff_permissions.email) = normalized_email
    returning
      public.staff_permissions.email,
      public.staff_permissions.display_name,
      public.staff_permissions.permission_role,
      public.staff_permissions.can_manage_members,
      public.staff_permissions.can_manage_roles,
      public.staff_permissions.can_manage_events,
      public.staff_permissions.is_active,
      public.staff_permissions.notes,
      public.staff_permissions.icon_url,
      public.staff_permissions.icon_path,
      public.staff_permissions.icon_mime_type,
      public.staff_permissions.icon_name;

    return;
  end if;

  if normalized_icon_url !~* '^https?://' then
    raise exception 'Staff icon URL is invalid.';
  end if;

  if normalized_icon_path is null then
    raise exception 'Staff icon storage path is required.';
  end if;

  if normalized_icon_mime_type is null or normalized_icon_mime_type not in ('image/png', 'image/jpeg', 'image/webp') then
    raise exception 'Staff icons must be PNG, JPEG, or WebP images.';
  end if;

  return query
  update public.staff_permissions
  set icon_url = normalized_icon_url,
      icon_path = normalized_icon_path,
      icon_mime_type = normalized_icon_mime_type,
      icon_name = coalesce(normalized_icon_name, 'staff-icon')
  where lower(public.staff_permissions.email) = normalized_email
  returning
    public.staff_permissions.email,
    public.staff_permissions.display_name,
    public.staff_permissions.permission_role,
    public.staff_permissions.can_manage_members,
    public.staff_permissions.can_manage_roles,
    public.staff_permissions.can_manage_events,
    public.staff_permissions.is_active,
    public.staff_permissions.notes,
    public.staff_permissions.icon_url,
    public.staff_permissions.icon_path,
    public.staff_permissions.icon_mime_type,
    public.staff_permissions.icon_name;
end;
$$;

grant execute on function public.set_staff_icon(text, text, text, text, text) to authenticated;