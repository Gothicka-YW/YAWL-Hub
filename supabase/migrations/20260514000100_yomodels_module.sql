-- Apply after 20260513000500_admin_chat_posting.sql.
-- Adds the YoModels gallery, Gothicka-only publishing, and image uploads.

create extension if not exists pgcrypto;

create or replace function public.current_user_can_manage_yomodels()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_permissions
    where lower(coalesce(email, '')) = lower('ywa.paint@gmail.com')
      and lower(coalesce(email, '')) = public.current_user_email()
      and permission_role = 'admin'
      and is_active = true
  );
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'yomodels-images',
  'yomodels-images',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read yomodels images" on storage.objects;

create policy "public can read yomodels images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'yomodels-images');

drop policy if exists "gothicka can upload yomodels images" on storage.objects;

create policy "gothicka can upload yomodels images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'yomodels-images'
  and public.current_user_can_manage_yomodels()
);

drop policy if exists "gothicka can update yomodels images" on storage.objects;

create policy "gothicka can update yomodels images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'yomodels-images'
  and public.current_user_can_manage_yomodels()
)
with check (
  bucket_id = 'yomodels-images'
  and public.current_user_can_manage_yomodels()
);

drop policy if exists "gothicka can delete yomodels images" on storage.objects;

create policy "gothicka can delete yomodels images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'yomodels-images'
  and public.current_user_can_manage_yomodels()
);

create table if not exists public.yomodel_posts (
  id uuid primary key default gen_random_uuid(),
  theme_title text,
  image_url text not null,
  image_path text,
  image_mime_type text,
  image_name text,
  is_active boolean not null default true,
  posted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid not null default auth.uid(),
  created_by_email text not null default public.current_user_email(),
  constraint yomodel_posts_theme_title_check
    check (theme_title is null or length(btrim(theme_title)) <= 120),
  constraint yomodel_posts_image_url_check
    check (image_url ~* '^https?://'),
  constraint yomodel_posts_image_mime_type_check
    check (image_mime_type is null or image_mime_type in ('image/png', 'image/jpeg', 'image/webp'))
);

comment on table public.yomodel_posts is 'YoModels gallery entries posted by Gothicka.';
comment on column public.yomodel_posts.theme_title is 'Optional theme title for a YoModels gallery post.';

create index if not exists yomodel_posts_posted_at_idx
  on public.yomodel_posts (posted_at desc);

drop trigger if exists set_yomodel_posts_updated_at on public.yomodel_posts;

create trigger set_yomodel_posts_updated_at
before update on public.yomodel_posts
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.yomodel_posts enable row level security;

grant select on table public.yomodel_posts to anon, authenticated;
grant insert, update, delete on table public.yomodel_posts to authenticated;

drop policy if exists "public can read active yomodel posts" on public.yomodel_posts;

create policy "public can read active yomodel posts"
on public.yomodel_posts
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "gothicka can insert yomodel posts" on public.yomodel_posts;

create policy "gothicka can insert yomodel posts"
on public.yomodel_posts
for insert
to authenticated
with check (public.current_user_can_manage_yomodels());

drop policy if exists "gothicka can update yomodel posts" on public.yomodel_posts;

create policy "gothicka can update yomodel posts"
on public.yomodel_posts
for update
to authenticated
using (public.current_user_can_manage_yomodels())
with check (public.current_user_can_manage_yomodels());

drop policy if exists "gothicka can delete yomodel posts" on public.yomodel_posts;

create policy "gothicka can delete yomodel posts"
on public.yomodel_posts
for delete
to authenticated
using (public.current_user_can_manage_yomodels());