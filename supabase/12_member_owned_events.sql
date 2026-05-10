alter table public.events
  alter column created_by_email set default public.current_user_email();

create index if not exists events_owner_lookup_idx
  on public.events (host_member_id, created_by_email);

create or replace function public.current_user_can_manage_event_member(target_member_id uuid, creator_email text)
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
      and lower(coalesce(creator_email, '')) = public.current_user_email()
    );
$$;

drop policy if exists "event managers can insert events" on public.events;
drop policy if exists "event managers can update events" on public.events;
drop policy if exists "members and event managers can insert events" on public.events;
drop policy if exists "members and event managers can update events" on public.events;

create policy "members and event managers can insert events"
on public.events
for insert
to authenticated
with check (public.current_user_can_manage_event_member(host_member_id, created_by_email));

create policy "members and event managers can update events"
on public.events
for update
to authenticated
using (public.current_user_can_manage_event_member(host_member_id, created_by_email))
with check (public.current_user_can_manage_event_member(host_member_id, created_by_email));