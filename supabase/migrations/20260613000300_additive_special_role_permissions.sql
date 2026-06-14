-- Makes special member roles additive to normal Member access.
-- Helper intentionally remains Member-only until its elevated permission is defined.

create or replace function public.current_user_can_manage_member_event(
  target_member_id uuid,
  creator_user_id uuid,
  creator_email text,
  target_event_type text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_events()
    or (
      target_member_id is not null
      and public.current_member_id() = target_member_id
      and (
        creator_user_id = auth.uid()
        or lower(coalesce(creator_email, '')) = public.current_user_email()
      )
      and (
        public.current_user_has_member_role('event_planner')
        or (
          public.current_user_has_member_role('game_master')
          and lower(btrim(coalesce(target_event_type, ''))) = 'game'
        )
      )
    );
$$;

drop policy if exists "game masters and event managers can insert events" on public.events;
drop policy if exists "game masters and event managers can update events" on public.events;
drop policy if exists "members can insert own events" on public.events;
drop policy if exists "special roles and event managers can insert events" on public.events;
drop policy if exists "special roles and event managers can update events" on public.events;

create policy "special roles and event managers can insert events"
on public.events
for insert
to authenticated
with check (
  public.current_user_can_manage_member_event(
    host_member_id,
    created_by_user_id,
    created_by_email,
    event_type
  )
);

create policy "special roles and event managers can update events"
on public.events
for update
to authenticated
using (
  public.current_user_can_manage_member_event(
    host_member_id,
    created_by_user_id,
    created_by_email,
    event_type
  )
)
with check (
  public.current_user_can_manage_member_event(
    host_member_id,
    created_by_user_id,
    created_by_email,
    event_type
  )
);

comment on function public.current_user_can_manage_member_event(uuid, uuid, text, text) is
  'Allows event staff to manage all events, Event Planners to manage their own events, and Game Masters to manage their own Game events.';

create or replace function public.current_user_can_manage_chat_messages()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_members()
    or public.current_user_has_member_role('moderator');
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
      public.current_user_can_manage_members()
      or public.current_member_id() = target_member_id
    );
$$;

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
    and exists (
      select 1
      from public.members
      where id = target_member_id
        and lower(btrim(coalesce(facebook_name, ''))) = lower(btrim(coalesce(target_member_name, '')))
        and lower(btrim(coalesce(in_game_name, ''))) = lower(btrim(coalesce(target_member_in_game_name, '')))
    )
    and (
      public.current_user_can_manage_members()
      or public.current_member_id() = target_member_id
    )
    and (
      creator_user_id = auth.uid()
      or lower(coalesce(creator_email, '')) = public.current_user_email()
    );
$$;

comment on function public.current_user_can_manage_chat_messages() is
  'Allows member-management staff and members assigned the Moderator role to remove chat messages.';
