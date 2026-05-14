-- Apply after 20260513000300_winner_closes_giveaway.sql.
-- Adds tabbed member chat, admin moderation, and chat image uploads.

create extension if not exists pgcrypto;

create or replace function public.current_user_can_manage_chat_messages()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_members();
$$;

create or replace function public.current_user_can_manage_chat_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and (
      public.current_user_can_manage_chat_messages()
      or public.current_member_id() = target_member_id
    );
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-images',
  'chat-images',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.chat_storage_member_id(object_name text)
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

drop policy if exists "public can read chat images" on storage.objects;

create policy "public can read chat images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'chat-images');

drop policy if exists "chat members can upload images" on storage.objects;

create policy "chat members can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-images'
  and public.current_user_can_manage_chat_member(public.chat_storage_member_id(name))
);

drop policy if exists "chat members can update images" on storage.objects;

create policy "chat members can update images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'chat-images'
  and public.current_user_can_manage_chat_member(public.chat_storage_member_id(name))
)
with check (
  bucket_id = 'chat-images'
  and public.current_user_can_manage_chat_member(public.chat_storage_member_id(name))
);

drop policy if exists "chat members can delete images" on storage.objects;

create policy "chat members can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-images'
  and public.current_user_can_manage_chat_member(public.chat_storage_member_id(name))
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel_key text not null,
  sender_member_id uuid not null references public.members(id) on delete restrict,
  sender_name_snapshot text not null,
  sender_in_game_name_snapshot text not null default '',
  message_text text,
  image_url text,
  image_path text,
  image_mime_type text,
  image_name text,
  created_by_user_id uuid not null default auth.uid(),
  created_by_email text default public.current_user_email(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_messages_channel_key_check
    check (channel_key in ('general', 'giveaways', 'models')),
  constraint chat_messages_sender_name_check
    check (length(btrim(sender_name_snapshot)) > 0),
  constraint chat_messages_message_text_check
    check (
      message_text is null
      or (length(btrim(message_text)) > 0 and length(btrim(message_text)) <= 2000)
    ),
  constraint chat_messages_image_url_check
    check (image_url is null or image_url ~* '^https?://'),
  constraint chat_messages_image_mime_type_check
    check (image_mime_type is null or image_mime_type in ('image/png', 'image/jpeg', 'image/webp')),
  constraint chat_messages_content_check
    check (coalesce(length(btrim(message_text)), 0) > 0 or image_url is not null)
);

comment on table public.chat_messages is 'Tabbed member chat for General, Giveaways, and Models, with optional image uploads.';
comment on column public.chat_messages.channel_key is 'Fixed room key for the chat tab the message belongs to.';

create index if not exists chat_messages_channel_created_at_idx
  on public.chat_messages (channel_key, created_at desc);

create index if not exists chat_messages_sender_lookup_idx
  on public.chat_messages (sender_member_id, created_at desc);

drop trigger if exists set_chat_messages_updated_at on public.chat_messages;

create trigger set_chat_messages_updated_at
before update on public.chat_messages
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.chat_messages enable row level security;

grant select, insert, delete on table public.chat_messages to authenticated;

create or replace function public.current_user_can_post_chat_message(
  target_member_id uuid,
  target_member_name text,
  target_member_in_game_name text,
  creator_user_id uuid,
  creator_email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and public.current_member_id() = target_member_id
    and exists (
      select 1
      from public.members
      where id = target_member_id
        and lower(btrim(coalesce(facebook_name, ''))) = lower(btrim(coalesce(target_member_name, '')))
        and lower(btrim(coalesce(in_game_name, ''))) = lower(btrim(coalesce(target_member_in_game_name, '')))
    )
    and (
      creator_user_id = auth.uid()
      or lower(coalesce(creator_email, '')) = public.current_user_email()
    );
$$;

create or replace function public.current_user_can_delete_chat_message_row(
  target_member_id uuid,
  creator_user_id uuid,
  creator_email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_chat_messages()
    or (
      target_member_id is not null
      and public.current_member_id() = target_member_id
      and (
        creator_user_id = auth.uid()
        or lower(coalesce(creator_email, '')) = public.current_user_email()
      )
    );
$$;

drop policy if exists "authenticated can read chat messages" on public.chat_messages;

create policy "authenticated can read chat messages"
on public.chat_messages
for select
to authenticated
using (true);

drop policy if exists "members can insert own chat messages" on public.chat_messages;

create policy "members can insert own chat messages"
on public.chat_messages
for insert
to authenticated
with check (
  public.current_user_can_post_chat_message(
    sender_member_id,
    sender_name_snapshot,
    sender_in_game_name_snapshot,
    created_by_user_id,
    created_by_email
  )
);

drop policy if exists "members and admins can delete chat messages" on public.chat_messages;

create policy "members and admins can delete chat messages"
on public.chat_messages
for delete
to authenticated
using (
  public.current_user_can_delete_chat_message_row(
    sender_member_id,
    created_by_user_id,
    created_by_email
  )
);