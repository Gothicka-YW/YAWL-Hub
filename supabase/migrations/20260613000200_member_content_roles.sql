-- Adds member-assigned Editor and Game Master content permissions.

alter table public.members
drop constraint if exists members_group_role_check;

alter table public.members
add constraint members_group_role_check
check (
  group_role in (
    'member',
    'admin',
    'event_planner',
    'moderator',
    'helper',
    'editor',
    'game_master'
  )
);

create or replace function public.current_user_has_member_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members
    where id = public.current_member_id()
      and is_active = true
      and group_role = lower(btrim(coalesce(target_role, '')))
  );
$$;

create or replace function public.current_user_is_yomodels_admin()
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

create or replace function public.current_user_can_manage_yomodels()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_yomodels_admin()
    or public.current_user_has_member_role('editor');
$$;

create or replace function public.current_user_can_edit_yomodel_post(
  creator_user_id uuid,
  creator_email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_yomodels_admin()
    or (
      public.current_user_has_member_role('editor')
      and (
        creator_user_id = auth.uid()
        or lower(coalesce(creator_email, '')) = public.current_user_email()
      )
    );
$$;

create or replace function public.current_user_can_edit_yomodel_image(target_path text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_yomodels_admin()
    or (
      public.current_user_has_member_role('editor')
      and exists (
        select 1
        from public.yomodel_posts
        where image_path = target_path
          and (
            created_by_user_id = auth.uid()
            or lower(coalesce(created_by_email, '')) = public.current_user_email()
          )
      )
    );
$$;

drop policy if exists "gothicka can upload yomodels images" on storage.objects;
drop policy if exists "gothicka can update yomodels images" on storage.objects;
drop policy if exists "gothicka can delete yomodels images" on storage.objects;
drop policy if exists "editors can upload yomodels images" on storage.objects;
drop policy if exists "editors can update own yomodels images" on storage.objects;
drop policy if exists "editors can delete own yomodels images" on storage.objects;

create policy "editors can upload yomodels images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'yomodels-images'
  and public.current_user_can_manage_yomodels()
);

create policy "editors can update own yomodels images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'yomodels-images'
  and public.current_user_can_edit_yomodel_image(name)
)
with check (
  bucket_id = 'yomodels-images'
  and public.current_user_can_edit_yomodel_image(name)
);

create policy "editors can delete own yomodels images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'yomodels-images'
  and public.current_user_can_edit_yomodel_image(name)
);

drop policy if exists "gothicka can insert yomodel posts" on public.yomodel_posts;
drop policy if exists "gothicka can update yomodel posts" on public.yomodel_posts;
drop policy if exists "gothicka can delete yomodel posts" on public.yomodel_posts;
drop policy if exists "editors can insert yomodel posts" on public.yomodel_posts;
drop policy if exists "editors can update own yomodel posts" on public.yomodel_posts;
drop policy if exists "editors can delete own yomodel posts" on public.yomodel_posts;

create policy "editors can insert yomodel posts"
on public.yomodel_posts
for insert
to authenticated
with check (public.current_user_can_manage_yomodels());

create policy "editors can update own yomodel posts"
on public.yomodel_posts
for update
to authenticated
using (public.current_user_can_edit_yomodel_post(created_by_user_id, created_by_email))
with check (public.current_user_can_edit_yomodel_post(created_by_user_id, created_by_email));

create policy "editors can delete own yomodel posts"
on public.yomodel_posts
for delete
to authenticated
using (public.current_user_can_edit_yomodel_post(created_by_user_id, created_by_email));

comment on table public.yomodel_posts is
  'YoModels gallery entries posted by Gothicka or members assigned the Editor role.';

create or replace function public.current_user_can_manage_game_event_member(
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
      public.current_user_has_member_role('game_master')
      and lower(btrim(coalesce(target_event_type, ''))) = 'game'
      and target_member_id is not null
      and public.current_member_id() = target_member_id
      and (
        creator_user_id = auth.uid()
        or lower(coalesce(creator_email, '')) = public.current_user_email()
      )
    );
$$;

drop policy if exists "event managers can insert events" on public.events;
drop policy if exists "event managers can update events" on public.events;
drop policy if exists "members and event managers can insert events" on public.events;
drop policy if exists "members and event managers can update events" on public.events;
drop policy if exists "game masters and event managers can insert events" on public.events;
drop policy if exists "game masters and event managers can update events" on public.events;

create policy "game masters and event managers can insert events"
on public.events
for insert
to authenticated
with check (
  public.current_user_can_manage_game_event_member(
    host_member_id,
    created_by_user_id,
    created_by_email,
    event_type
  )
);

create policy "game masters and event managers can update events"
on public.events
for update
to authenticated
using (
  public.current_user_can_manage_game_event_member(
    host_member_id,
    created_by_user_id,
    created_by_email,
    event_type
  )
)
with check (
  public.current_user_can_manage_game_event_member(
    host_member_id,
    created_by_user_id,
    created_by_email,
    event_type
  )
);

comment on function public.current_user_can_manage_game_event_member(uuid, uuid, text, text) is
  'Allows staff event managers to manage all events and Game Masters to manage only their own Game posts.';
