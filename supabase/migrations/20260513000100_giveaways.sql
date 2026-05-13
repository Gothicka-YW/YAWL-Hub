-- Apply after 14_invite_code_account_claims.sql and 20260512000100_self_owned_posting.sql.
-- Adds live giveaways, public entrant lists, giveaway image uploads, and a server-side random winner picker.

create extension if not exists pgcrypto;

create or replace function public.current_user_can_manage_giveaways()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_members()
    or public.current_user_can_manage_events();
$$;

create or replace function public.current_user_can_manage_giveaway_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_member_id is not null
    and (
      public.current_user_can_manage_giveaways()
      or public.current_member_id() = target_member_id
    );
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'giveaway-images',
  'giveaway-images',
  true,
  8388608,
  array['image/png', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.giveaway_storage_member_id(object_name text)
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

drop policy if exists "public can read giveaway images" on storage.objects;

create policy "public can read giveaway images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'giveaway-images');

drop policy if exists "giveaway owners can upload images" on storage.objects;

create policy "giveaway owners can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'giveaway-images'
  and public.current_user_can_manage_giveaway_member(public.giveaway_storage_member_id(name))
);

drop policy if exists "giveaway owners can update images" on storage.objects;

create policy "giveaway owners can update images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'giveaway-images'
  and public.current_user_can_manage_giveaway_member(public.giveaway_storage_member_id(name))
)
with check (
  bucket_id = 'giveaway-images'
  and public.current_user_can_manage_giveaway_member(public.giveaway_storage_member_id(name))
);

drop policy if exists "giveaway owners can delete images" on storage.objects;

create policy "giveaway owners can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'giveaway-images'
  and public.current_user_can_manage_giveaway_member(public.giveaway_storage_member_id(name))
);

create table if not exists public.giveaways (
  id uuid primary key default gen_random_uuid(),
  giver_member_id uuid not null references public.members(id) on delete restrict,
  giver_name_snapshot text not null,
  giver_in_game_name_snapshot text not null default '',
  title text not null,
  item_text text not null,
  image_url text,
  image_path text,
  image_mime_type text,
  image_name text,
  ends_at timestamptz not null,
  winner_member_id uuid references public.members(id) on delete set null,
  winner_name_snapshot text,
  winner_in_game_name_snapshot text,
  winner_selected_at timestamptz,
  is_active boolean not null default true,
  created_by_user_id uuid not null default auth.uid(),
  created_by_email text default public.current_user_email(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint giveaways_giver_name_check
    check (length(btrim(giver_name_snapshot)) > 0),
  constraint giveaways_title_check
    check (length(btrim(title)) > 0 and length(btrim(title)) <= 120),
  constraint giveaways_item_text_check
    check (length(btrim(item_text)) > 0 and length(btrim(item_text)) <= 2000),
  constraint giveaways_image_url_check
    check (image_url is null or image_url ~* '^https?://'),
  constraint giveaways_image_mime_type_check
    check (image_mime_type is null or image_mime_type in ('image/png', 'image/jpeg')),
  constraint giveaways_ends_at_check
    check (ends_at > created_at),
  constraint giveaways_winner_consistency_check
    check (
      (winner_member_id is null and winner_name_snapshot is null and winner_in_game_name_snapshot is null and winner_selected_at is null)
      or (winner_member_id is not null and winner_name_snapshot is not null and winner_selected_at is not null)
    )
);

comment on table public.giveaways is 'Live member-owned giveaway posts with optional images, entrant tracking, and a saved winner.';
comment on column public.giveaways.item_text is 'Freeform item details the giver writes for the giveaway.';
comment on column public.giveaways.ends_at is 'The timestamp when new giveaway entries should stop being accepted.';

create index if not exists giveaways_active_ends_at_idx
  on public.giveaways (is_active, ends_at, created_at desc);

create index if not exists giveaways_owner_lookup_idx
  on public.giveaways (giver_member_id, created_by_user_id, created_by_email);

drop trigger if exists set_giveaways_updated_at on public.giveaways;

create trigger set_giveaways_updated_at
before update on public.giveaways
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.giveaways enable row level security;

grant select on table public.giveaways to anon, authenticated;
grant insert, update on table public.giveaways to authenticated;

create or replace function public.giveaway_is_visible(target_giveaway_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.giveaways
    where id = target_giveaway_id
      and is_active = true
  );
$$;

create or replace function public.giveaway_is_open(target_giveaway_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.giveaways
    where id = target_giveaway_id
      and is_active = true
      and winner_selected_at is null
      and ends_at > now()
  );
$$;

create or replace function public.current_user_can_post_giveaway_row(
  target_member_id uuid,
  target_member_name text,
  target_member_in_game_name text,
  target_ends_at timestamptz,
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
    and target_ends_at is not null
    and target_ends_at > now()
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

create or replace function public.current_user_can_update_giveaway_row(
  target_giveaway_id uuid,
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
  select public.current_user_can_manage_giveaways()
    or (
      target_giveaway_id is not null
      and target_member_id is not null
      and public.current_member_id() = target_member_id
      and exists (
        select 1
        from public.members
        where id = target_member_id
          and lower(btrim(coalesce(facebook_name, ''))) = lower(btrim(coalesce(target_member_name, '')))
          and lower(btrim(coalesce(in_game_name, ''))) = lower(btrim(coalesce(target_member_in_game_name, '')))
      )
      and exists (
        select 1
        from public.giveaways
        where id = target_giveaway_id
          and giver_member_id = target_member_id
          and (
            created_by_user_id = auth.uid()
            or lower(coalesce(created_by_email, '')) = public.current_user_email()
          )
      )
      and (
        creator_user_id = auth.uid()
        or lower(coalesce(creator_email, '')) = public.current_user_email()
      )
    );
$$;

drop policy if exists "public can read active giveaways" on public.giveaways;

create policy "public can read active giveaways"
on public.giveaways
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "members can insert own giveaways" on public.giveaways;

create policy "members can insert own giveaways"
on public.giveaways
for insert
to authenticated
with check (
  public.current_user_can_post_giveaway_row(
    giver_member_id,
    giver_name_snapshot,
    giver_in_game_name_snapshot,
    ends_at,
    created_by_user_id,
    created_by_email
  )
);

drop policy if exists "members and staff can update giveaways" on public.giveaways;

create policy "members and staff can update giveaways"
on public.giveaways
for update
to authenticated
using (
  public.current_user_can_update_giveaway_row(
    id,
    giver_member_id,
    giver_name_snapshot,
    giver_in_game_name_snapshot,
    created_by_user_id,
    created_by_email
  )
)
with check (
  public.current_user_can_update_giveaway_row(
    id,
    giver_member_id,
    giver_name_snapshot,
    giver_in_game_name_snapshot,
    created_by_user_id,
    created_by_email
  )
);

create table if not exists public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways(id) on delete cascade,
  entrant_member_id uuid not null references public.members(id) on delete cascade,
  entrant_name_snapshot text not null,
  entrant_in_game_name_snapshot text not null default '',
  created_by_user_id uuid not null default auth.uid(),
  created_by_email text default public.current_user_email(),
  created_at timestamptz not null default now(),
  constraint giveaway_entries_name_check
    check (length(btrim(entrant_name_snapshot)) > 0)
);

comment on table public.giveaway_entries is 'Visible member giveaway entries used for reactions and winner picking.';

create unique index if not exists giveaway_entries_unique_giveaway_member_key
  on public.giveaway_entries (giveaway_id, entrant_member_id);

create index if not exists giveaway_entries_giveaway_created_at_idx
  on public.giveaway_entries (giveaway_id, created_at);

alter table public.giveaway_entries enable row level security;

grant select on table public.giveaway_entries to anon, authenticated;
grant insert, delete on table public.giveaway_entries to authenticated;

create or replace function public.current_user_can_enter_giveaway_row(
  target_giveaway_id uuid,
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
  select target_giveaway_id is not null
    and target_member_id is not null
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
    )
    and exists (
      select 1
      from public.giveaways
      where id = target_giveaway_id
        and is_active = true
        and winner_selected_at is null
        and ends_at > now()
        and giver_member_id <> target_member_id
    );
$$;

create or replace function public.current_user_can_delete_giveaway_entry_row(
  target_entry_id uuid,
  target_giveaway_id uuid,
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
  select public.current_user_can_manage_giveaways()
    or (
      public.current_user_can_enter_giveaway_row(
        target_giveaway_id,
        target_member_id,
        target_member_name,
        target_member_in_game_name,
        creator_user_id,
        creator_email
      )
      and exists (
        select 1
        from public.giveaway_entries
        where id = target_entry_id
          and giveaway_id = target_giveaway_id
          and entrant_member_id = target_member_id
          and (
            created_by_user_id = auth.uid()
            or lower(coalesce(created_by_email, '')) = public.current_user_email()
          )
      )
    );
$$;

drop policy if exists "public can read giveaway entries" on public.giveaway_entries;

create policy "public can read giveaway entries"
on public.giveaway_entries
for select
to anon, authenticated
using (public.giveaway_is_visible(giveaway_id));

drop policy if exists "members can enter giveaways" on public.giveaway_entries;

create policy "members can enter giveaways"
on public.giveaway_entries
for insert
to authenticated
with check (
  public.current_user_can_enter_giveaway_row(
    giveaway_id,
    entrant_member_id,
    entrant_name_snapshot,
    entrant_in_game_name_snapshot,
    created_by_user_id,
    created_by_email
  )
);

drop policy if exists "members and staff can remove giveaway entries" on public.giveaway_entries;

create policy "members and staff can remove giveaway entries"
on public.giveaway_entries
for delete
to authenticated
using (
  public.current_user_can_delete_giveaway_entry_row(
    id,
    giveaway_id,
    entrant_member_id,
    entrant_name_snapshot,
    entrant_in_game_name_snapshot,
    created_by_user_id,
    created_by_email
  )
);

create or replace function public.pick_giveaway_winner(p_giveaway_id uuid)
returns table (
  giveaway_id uuid,
  winner_member_id uuid,
  winner_name_snapshot text,
  winner_in_game_name_snapshot text,
  winner_selected_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_giveaway public.giveaways%rowtype;
  selected_entry public.giveaway_entries%rowtype;
  selected_at timestamptz := now();
begin
  if p_giveaway_id is null then
    raise exception 'Choose a giveaway before picking a winner.';
  end if;

  select *
    into target_giveaway
  from public.giveaways
  where id = p_giveaway_id
    and is_active = true
  limit 1;

  if not found then
    raise exception 'That giveaway could not be found.';
  end if;

  if not public.current_user_can_update_giveaway_row(
    target_giveaway.id,
    target_giveaway.giver_member_id,
    target_giveaway.giver_name_snapshot,
    target_giveaway.giver_in_game_name_snapshot,
    target_giveaway.created_by_user_id,
    target_giveaway.created_by_email
  ) then
    raise exception 'Only the giveaway creator or staff can pick a winner.';
  end if;

  if target_giveaway.winner_selected_at is not null then
    raise exception 'A winner was already selected for this giveaway.';
  end if;

  select *
    into selected_entry
  from public.giveaway_entries
  where giveaway_id = p_giveaway_id
  order by random()
  limit 1;

  if not found then
    raise exception 'Add at least one entry before picking a winner.';
  end if;

  update public.giveaways
  set winner_member_id = selected_entry.entrant_member_id,
      winner_name_snapshot = selected_entry.entrant_name_snapshot,
      winner_in_game_name_snapshot = selected_entry.entrant_in_game_name_snapshot,
      winner_selected_at = selected_at,
      updated_at = selected_at
  where id = p_giveaway_id;

  giveaway_id := p_giveaway_id;
  winner_member_id := selected_entry.entrant_member_id;
  winner_name_snapshot := selected_entry.entrant_name_snapshot;
  winner_in_game_name_snapshot := selected_entry.entrant_in_game_name_snapshot;
  winner_selected_at := selected_at;
  return next;
end;
$$;

grant execute on function public.pick_giveaway_winner(uuid) to authenticated;