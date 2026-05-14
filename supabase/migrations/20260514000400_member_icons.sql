-- Apply after 20260514000300_fix_invite_hash_pgcrypto_lookup.sql.
-- Adds reusable member icons with self-service uploads for linked accounts.

alter table public.members
  add column if not exists icon_url text,
  add column if not exists icon_path text,
  add column if not exists icon_mime_type text,
  add column if not exists icon_name text;

comment on column public.members.icon_url is 'Public URL for the member square icon shown across the app.';
comment on column public.members.icon_path is 'Storage object path for the member icon.';
comment on column public.members.icon_mime_type is 'Uploaded MIME type for the member icon.';
comment on column public.members.icon_name is 'Original or processed file name for the member icon.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'members_icon_url_check'
  ) then
    alter table public.members
      add constraint members_icon_url_check
      check (icon_url is null or icon_url ~* '^https?://');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'members_icon_mime_type_check'
  ) then
    alter table public.members
      add constraint members_icon_mime_type_check
      check (icon_mime_type is null or icon_mime_type in ('image/png', 'image/jpeg', 'image/webp'));
  end if;
end;
$$;

create or replace function public.current_user_can_manage_member_icon(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and (
      public.current_user_can_manage_members()
      or public.current_member_id() = target_member_id
    );
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-icons',
  'member-icons',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.member_icon_storage_member_id(object_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  first_segment text;
begin
  first_segment := split_part(coalesce(object_name, ''), '/', 1);

  if first_segment = '' then
    return null;
  end if;

  return first_segment::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

drop policy if exists "public can read member icons" on storage.objects;

create policy "public can read member icons"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'member-icons');

drop policy if exists "members can upload member icons" on storage.objects;

create policy "members can upload member icons"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'member-icons'
  and public.current_user_can_manage_member_icon(public.member_icon_storage_member_id(name))
);

drop policy if exists "members can update member icons" on storage.objects;

create policy "members can update member icons"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'member-icons'
  and public.current_user_can_manage_member_icon(public.member_icon_storage_member_id(name))
)
with check (
  bucket_id = 'member-icons'
  and public.current_user_can_manage_member_icon(public.member_icon_storage_member_id(name))
);

drop policy if exists "members can delete member icons" on storage.objects;

create policy "members can delete member icons"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'member-icons'
  and public.current_user_can_manage_member_icon(public.member_icon_storage_member_id(name))
);

create or replace function public.set_member_icon(
  p_member_id uuid,
  p_icon_url text default null,
  p_icon_path text default null,
  p_icon_mime_type text default null,
  p_icon_name text default null
)
returns table (
  member_id uuid,
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
  normalized_icon_url text := nullif(btrim(coalesce(p_icon_url, '')), '');
  normalized_icon_path text := nullif(btrim(coalesce(p_icon_path, '')), '');
  normalized_icon_mime_type text := lower(nullif(btrim(coalesce(p_icon_mime_type, '')), ''));
  normalized_icon_name text := nullif(btrim(coalesce(p_icon_name, '')), '');
begin
  if p_member_id is null then
    raise exception 'Choose a valid member before saving an icon.';
  end if;

  if not exists (
    select 1
    from public.members
    where id = p_member_id
      and is_active = true
  ) then
    raise exception 'Choose an active member before saving an icon.';
  end if;

  if not public.current_user_can_manage_member_icon(p_member_id) then
    raise exception 'Only staff or the linked member can change this icon.';
  end if;

  if normalized_icon_url is null then
    update public.members
    set icon_url = null,
        icon_path = null,
        icon_mime_type = null,
        icon_name = null
    where id = p_member_id
    returning id, public.members.icon_url, public.members.icon_path, public.members.icon_mime_type, public.members.icon_name
      into member_id, icon_url, icon_path, icon_mime_type, icon_name;

    return next;
  end if;

  if normalized_icon_url !~* '^https?://' then
    raise exception 'Member icon URL is invalid.';
  end if;

  if normalized_icon_path is null then
    raise exception 'Member icon storage path is required.';
  end if;

  if normalized_icon_mime_type is null or normalized_icon_mime_type not in ('image/png', 'image/jpeg', 'image/webp') then
    raise exception 'Member icons must be PNG, JPEG, or WebP images.';
  end if;

  update public.members
  set icon_url = normalized_icon_url,
      icon_path = normalized_icon_path,
      icon_mime_type = normalized_icon_mime_type,
      icon_name = coalesce(normalized_icon_name, 'member-icon')
  where id = p_member_id
  returning id, public.members.icon_url, public.members.icon_path, public.members.icon_mime_type, public.members.icon_name
    into member_id, icon_url, icon_path, icon_mime_type, icon_name;

  return next;
end;
$$;

grant execute on function public.set_member_icon(uuid, text, text, text, text) to authenticated;