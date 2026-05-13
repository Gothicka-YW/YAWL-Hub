-- Apply after 20260513000100_giveaways.sql.
-- Restores staff posting access for shared posts and adds giveaway rerolls.

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
    and exists (
      select 1
      from public.members
      where id = target_member_id
        and lower(btrim(coalesce(facebook_name, ''))) = lower(btrim(coalesce(target_member_name, '')))
        and lower(btrim(coalesce(in_game_name, ''))) = lower(btrim(coalesce(target_member_in_game_name, '')))
        and lower(btrim(coalesce(house_key, ''))) = lower(btrim(coalesce(target_house_key, '')))
    )
    and (
      public.current_user_can_manage_members()
      or public.current_member_id() = target_member_id
    );
$$;

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
      public.current_user_can_manage_events()
      or (
        public.current_member_id() = target_member_id
        and (
          creator_user_id = auth.uid()
          or lower(coalesce(creator_email, '')) = public.current_user_email()
        )
      )
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
    and exists (
      select 1
      from public.members
      where id = target_member_id
        and lower(btrim(coalesce(facebook_name, ''))) = lower(btrim(coalesce(target_member_name, '')))
        and lower(btrim(coalesce(in_game_name, ''))) = lower(btrim(coalesce(target_member_in_game_name, '')))
    )
    and (
      public.current_user_can_manage_giveaways()
      or public.current_member_id() = target_member_id
    )
    and (
      creator_user_id = auth.uid()
      or lower(coalesce(creator_email, '')) = public.current_user_email()
    );
$$;

create or replace function public.reroll_giveaway_winner(p_giveaway_id uuid)
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
    raise exception 'Choose a giveaway before rerolling the winner.';
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
    raise exception 'Only the giveaway creator or staff can reroll a winner.';
  end if;

  if target_giveaway.winner_selected_at is null or target_giveaway.winner_member_id is null then
    raise exception 'Pick the first winner before rerolling this giveaway.';
  end if;

  select *
    into selected_entry
  from public.giveaway_entries
  where giveaway_id = p_giveaway_id
    and entrant_member_id is distinct from target_giveaway.winner_member_id
  order by random()
  limit 1;

  if not found then
    raise exception 'Add at least two unique entries before rerolling the winner.';
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

grant execute on function public.reroll_giveaway_winner(uuid) to authenticated;