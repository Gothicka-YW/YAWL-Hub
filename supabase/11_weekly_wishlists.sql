create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create table if not exists public.member_accounts (
  email text primary key,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_accounts_email_lower_check
    check (email = lower(email))
);

comment on table public.member_accounts is 'Links Supabase Auth emails to a single member row for self-service features like weekly wishlists.';

create unique index if not exists member_accounts_member_id_key
  on public.member_accounts (member_id);

drop trigger if exists set_member_accounts_updated_at on public.member_accounts;

create trigger set_member_accounts_updated_at
before update on public.member_accounts
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.member_accounts enable row level security;

grant select, insert, update on table public.member_accounts to authenticated;

drop policy if exists "users can read their member link" on public.member_accounts;

create policy "users can read their member link"
on public.member_accounts
for select
to authenticated
using (
  lower(email) = public.current_user_email()
  or public.current_user_can_manage_members()
);

drop policy if exists "staff can manage member links" on public.member_accounts;

create policy "staff can manage member links"
on public.member_accounts
for insert
to authenticated
with check (public.current_user_can_manage_members());

drop policy if exists "staff can update member links" on public.member_accounts;

create policy "staff can update member links"
on public.member_accounts
for update
to authenticated
using (public.current_user_can_manage_members())
with check (public.current_user_can_manage_members());

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select member_id
  from public.member_accounts
  where lower(email) = public.current_user_email()
  limit 1;
$$;

create or replace function public.current_user_can_manage_wishlist_member(target_member_id uuid)
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

create table if not exists public.wishlist_posts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  week_start_date date not null,
  member_name_snapshot text not null,
  member_in_game_name_snapshot text,
  house_key_snapshot text,
  summary text not null default 'Weekly wishlist for the current Sunday reset.',
  status_note text not null default 'Wishlist posted for this week.',
  thank_you_note text,
  is_active boolean not null default true,
  created_by_email text not null default public.current_user_email(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wishlist_posts_member_name_check
    check (length(btrim(member_name_snapshot)) > 0),
  constraint wishlist_posts_summary_check
    check (length(btrim(summary)) > 0),
  constraint wishlist_posts_status_check
    check (length(btrim(status_note)) > 0)
);

comment on table public.wishlist_posts is 'One current-week wishlist board per member, with snapshots of the member label and house key for stable rendering.';

create unique index if not exists wishlist_posts_member_week_key
  on public.wishlist_posts (member_id, week_start_date);

drop trigger if exists set_wishlist_posts_updated_at on public.wishlist_posts;

create trigger set_wishlist_posts_updated_at
before update on public.wishlist_posts
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.wishlist_posts enable row level security;

grant select on table public.wishlist_posts to anon, authenticated;
grant insert, update on table public.wishlist_posts to authenticated;

drop policy if exists "public can read active wishlist posts" on public.wishlist_posts;

create policy "public can read active wishlist posts"
on public.wishlist_posts
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "owners can read wishlist posts" on public.wishlist_posts;

create policy "owners can read wishlist posts"
on public.wishlist_posts
for select
to authenticated
using (public.current_user_can_manage_wishlist_member(member_id));

drop policy if exists "owners can insert wishlist posts" on public.wishlist_posts;

create policy "owners can insert wishlist posts"
on public.wishlist_posts
for insert
to authenticated
with check (public.current_user_can_manage_wishlist_member(member_id));

drop policy if exists "owners can update wishlist posts" on public.wishlist_posts;

create policy "owners can update wishlist posts"
on public.wishlist_posts
for update
to authenticated
using (public.current_user_can_manage_wishlist_member(member_id))
with check (public.current_user_can_manage_wishlist_member(member_id));

create or replace function public.current_user_can_manage_wishlist(wishlist_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.wishlist_posts
    where id = wishlist_post_id
      and public.current_user_can_manage_wishlist_member(member_id)
  );
$$;

create or replace function public.wishlist_post_is_active(wishlist_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.wishlist_posts
    where id = wishlist_post_id
      and is_active = true
  );
$$;

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlist_posts(id) on delete cascade,
  sort_order smallint not null,
  item_name text not null,
  item_image_url text,
  item_source_url text,
  availability_status text not null default 'in_store',
  is_received boolean not null default false,
  received_from text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wishlist_items_sort_order_check
    check (sort_order between 1 and 20),
  constraint wishlist_items_name_check
    check (length(btrim(item_name)) > 0),
  constraint wishlist_items_availability_check
    check (availability_status in ('in_store', 'out_of_store')),
  constraint wishlist_items_image_url_check
    check (item_image_url is null or item_image_url ~* '^https?://'),
  constraint wishlist_items_source_url_check
    check (item_source_url is null or item_source_url ~* '^https?://')
);

comment on table public.wishlist_items is 'Structured items inside a member''s weekly wishlist board.';

create unique index if not exists wishlist_items_wishlist_sort_order_key
  on public.wishlist_items (wishlist_id, sort_order);

drop trigger if exists set_wishlist_items_updated_at on public.wishlist_items;

create trigger set_wishlist_items_updated_at
before update on public.wishlist_items
for each row
execute function public.set_current_timestamp_updated_at();

create or replace function public.enforce_wishlist_item_limits()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  existing_count integer;
  out_of_store_count integer;
  current_id uuid;
begin
  if tg_op = 'DELETE' then
    return old;
  end if;

  current_id := coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  select count(*), count(*) filter (where availability_status = 'out_of_store')
    into existing_count, out_of_store_count
  from public.wishlist_items
  where wishlist_id = new.wishlist_id
    and id <> current_id;

  if existing_count >= 20 then
    raise exception 'Each weekly wishlist can contain at most 20 items.';
  end if;

  if new.availability_status = 'out_of_store' and out_of_store_count >= 10 then
    raise exception 'Each weekly wishlist can contain at most 10 out-of-store items.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_wishlist_item_limits on public.wishlist_items;

create trigger enforce_wishlist_item_limits
before insert or update on public.wishlist_items
for each row
execute function public.enforce_wishlist_item_limits();

alter table public.wishlist_items enable row level security;

grant select on table public.wishlist_items to anon, authenticated;
grant insert, update, delete on table public.wishlist_items to authenticated;

drop policy if exists "public can read active wishlist items" on public.wishlist_items;

create policy "public can read active wishlist items"
on public.wishlist_items
for select
to anon, authenticated
using (public.wishlist_post_is_active(wishlist_id));

drop policy if exists "owners can read wishlist items" on public.wishlist_items;

create policy "owners can read wishlist items"
on public.wishlist_items
for select
to authenticated
using (public.current_user_can_manage_wishlist(wishlist_id));

drop policy if exists "owners can insert wishlist items" on public.wishlist_items;

create policy "owners can insert wishlist items"
on public.wishlist_items
for insert
to authenticated
with check (public.current_user_can_manage_wishlist(wishlist_id));

drop policy if exists "owners can update wishlist items" on public.wishlist_items;

create policy "owners can update wishlist items"
on public.wishlist_items
for update
to authenticated
using (public.current_user_can_manage_wishlist(wishlist_id))
with check (public.current_user_can_manage_wishlist(wishlist_id));

drop policy if exists "owners can delete wishlist items" on public.wishlist_items;

create policy "owners can delete wishlist items"
on public.wishlist_items
for delete
to authenticated
using (public.current_user_can_manage_wishlist(wishlist_id));