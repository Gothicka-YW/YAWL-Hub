insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wishlist-images',
  'wishlist-images',
  true,
  8388608,
  array['image/png', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.wishlist_storage_member_id(object_name text)
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

drop policy if exists "public can read wishlist images" on storage.objects;

create policy "public can read wishlist images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'wishlist-images');

drop policy if exists "wishlist owners can upload images" on storage.objects;

create policy "wishlist owners can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wishlist-images'
  and public.current_user_can_manage_wishlist_member(public.wishlist_storage_member_id(name))
);

drop policy if exists "wishlist owners can update images" on storage.objects;

create policy "wishlist owners can update images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'wishlist-images'
  and public.current_user_can_manage_wishlist_member(public.wishlist_storage_member_id(name))
)
with check (
  bucket_id = 'wishlist-images'
  and public.current_user_can_manage_wishlist_member(public.wishlist_storage_member_id(name))
);

drop policy if exists "wishlist owners can delete images" on storage.objects;

create policy "wishlist owners can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wishlist-images'
  and public.current_user_can_manage_wishlist_member(public.wishlist_storage_member_id(name))
);

alter table public.wishlist_posts
  add column if not exists board_image_url text,
  add column if not exists board_image_path text,
  add column if not exists board_image_mime_type text,
  add column if not exists board_image_name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wishlist_posts_board_image_url_check'
  ) then
    alter table public.wishlist_posts
      add constraint wishlist_posts_board_image_url_check
      check (board_image_url is null or board_image_url ~* '^https?://');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'wishlist_posts_board_image_mime_type_check'
  ) then
    alter table public.wishlist_posts
      add constraint wishlist_posts_board_image_mime_type_check
      check (board_image_mime_type is null or board_image_mime_type in ('image/png', 'image/jpeg'));
  end if;
end;
$$;

create table if not exists public.wishlist_comments (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlist_posts(id) on delete cascade,
  commenter_name text not null,
  comment_text text,
  did_gift boolean not null default true,
  is_hidden boolean not null default false,
  created_by_email text not null default public.current_user_email(),
  created_at timestamptz not null default now(),
  constraint wishlist_comments_name_check
    check (length(btrim(commenter_name)) > 0),
  constraint wishlist_comments_text_length_check
    check (comment_text is null or length(btrim(comment_text)) <= 600),
  constraint wishlist_comments_has_content_check
    check (did_gift = true or length(btrim(coalesce(comment_text, ''))) > 0)
);

comment on table public.wishlist_comments is 'Gift comments on active weekly wish list image posts.';
comment on column public.wishlist_comments.did_gift is 'Marks comments where the commenter is telling the poster they gifted.';

create index if not exists wishlist_comments_wishlist_created_at_idx
  on public.wishlist_comments (wishlist_id, created_at);

alter table public.wishlist_comments enable row level security;

grant select, insert on table public.wishlist_comments to anon, authenticated;
grant update on table public.wishlist_comments to authenticated;

drop policy if exists "public can read visible wishlist comments" on public.wishlist_comments;

create policy "public can read visible wishlist comments"
on public.wishlist_comments
for select
to anon, authenticated
using (
  is_hidden = false
  and public.wishlist_post_is_active(wishlist_id)
);

drop policy if exists "public can add wishlist comments" on public.wishlist_comments;

create policy "public can add wishlist comments"
on public.wishlist_comments
for insert
to anon, authenticated
with check (
  is_hidden = false
  and public.wishlist_post_is_active(wishlist_id)
);

drop policy if exists "staff can hide wishlist comments" on public.wishlist_comments;

create policy "staff can hide wishlist comments"
on public.wishlist_comments
for update
to authenticated
using (public.current_user_can_manage_members())
with check (public.current_user_can_manage_members());
