-- Apply after 14_invite_code_account_claims.sql.
-- Locks new wish list and event posts to the signed-in member account.

create or replace function public.current_user_can_post_wishlist_post(
  target_member_id uuid,
  target_member_name text,
  target_member_in_game_name text,
  target_house_key text
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
        and lower(btrim(coalesce(house_key, ''))) = lower(btrim(coalesce(target_house_key, '')))
    );
$$;

create or replace function public.current_user_can_update_wishlist_post(
  target_wishlist_post_id uuid,
  target_member_id uuid,
  target_member_name text,
  target_member_in_game_name text,
  target_house_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_post_wishlist_post(
    target_member_id,
    target_member_name,
    target_member_in_game_name,
    target_house_key
  )
  or (
    public.current_user_can_manage_members()
    and exists (
      select 1
      from public.wishlist_posts
      where id = target_wishlist_post_id
        and member_id = target_member_id
    )
  );
$$;

drop policy if exists "owners can insert wishlist posts" on public.wishlist_posts;
drop policy if exists "members can insert own wishlist posts" on public.wishlist_posts;

create policy "members can insert own wishlist posts"
on public.wishlist_posts
for insert
to authenticated
with check (
  public.current_user_can_post_wishlist_post(
    member_id,
    member_name_snapshot,
    member_in_game_name_snapshot,
    house_key_snapshot
  )
);

drop policy if exists "owners can update wishlist posts" on public.wishlist_posts;
drop policy if exists "members and staff can update wishlist posts" on public.wishlist_posts;

create policy "members and staff can update wishlist posts"
on public.wishlist_posts
for update
to authenticated
using (
  public.current_user_can_update_wishlist_post(
    id,
    member_id,
    member_name_snapshot,
    member_in_game_name_snapshot,
    house_key_snapshot
  )
)
with check (
  public.current_user_can_update_wishlist_post(
    id,
    member_id,
    member_name_snapshot,
    member_in_game_name_snapshot,
    house_key_snapshot
  )
);

create or replace function public.current_user_can_post_event_row(
  target_member_id uuid,
  target_host_name text,
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
    and lower(btrim(coalesce(target_host_name, ''))) = lower(
      btrim(
        coalesce(
          (
            select facebook_name
            from public.members
            where id = target_member_id
          ),
          ''
        )
      )
    )
    and (
      creator_user_id = auth.uid()
      or lower(coalesce(creator_email, '')) = public.current_user_email()
    );
$$;

create or replace function public.current_user_can_update_event_row(
  target_event_id uuid,
  target_member_id uuid,
  target_host_name text,
  creator_user_id uuid,
  creator_email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_events()
    or (
      public.current_user_can_post_event_row(
        target_member_id,
        target_host_name,
        creator_user_id,
        creator_email
      )
      and exists (
        select 1
        from public.events
        where id = target_event_id
          and host_member_id = target_member_id
          and (
            created_by_user_id = auth.uid()
            or lower(coalesce(created_by_email, '')) = public.current_user_email()
          )
      )
    );
$$;

drop policy if exists "event managers can insert events" on public.events;
drop policy if exists "members and event managers can insert events" on public.events;
drop policy if exists "members can insert own events" on public.events;

create policy "members can insert own events"
on public.events
for insert
to authenticated
with check (public.current_user_can_post_event_row(host_member_id, host_name, created_by_user_id, created_by_email));

drop policy if exists "event managers can update events" on public.events;
drop policy if exists "members and event managers can update events" on public.events;

create policy "members and event managers can update events"
on public.events
for update
to authenticated
using (public.current_user_can_update_event_row(id, host_member_id, host_name, created_by_user_id, created_by_email))
with check (public.current_user_can_update_event_row(id, host_member_id, host_name, created_by_user_id, created_by_email));