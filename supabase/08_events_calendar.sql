create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null default 'hangout',
  title text not null,
  event_date date not null,
  start_time time,
  end_time time,
  timezone text not null default 'ET',
  host_member_id uuid references public.members(id) on delete set null,
  host_name text,
  location_text text,
  details text,
  event_link text,
  yes_count integer not null default 0,
  maybe_count integer not null default 0,
  no_count integer not null default 0,
  is_active boolean not null default true,
  created_by_email text not null default public.current_staff_email(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_type_check
    check (event_type in ('hangout', 'party', 'wishlist', 'game', 'meetup', 'other')),
  constraint events_time_window_check
    check (end_time is null or (start_time is not null and end_time > start_time)),
  constraint events_count_check
    check (yes_count >= 0 and maybe_count >= 0 and no_count >= 0),
  constraint events_link_check
    check (event_link is null or event_link ~* '^https?://')
);

comment on table public.events is 'Shared YoAngels event calendar for hangouts, parties, games, wish list nights, and meet ups.';

comment on column public.events.timezone is 'Display label such as ET, PT, or UTC shown beside event times.';

create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_is_active_idx on public.events (is_active);
create index if not exists events_event_type_idx on public.events (event_type);

drop trigger if exists set_events_updated_at on public.events;

create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.events enable row level security;

grant select on table public.events to anon, authenticated;
grant insert, update on table public.events to authenticated;

drop policy if exists "anyone can read active events" on public.events;

create policy "anyone can read active events"
on public.events
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "event managers can insert events" on public.events;

create policy "event managers can insert events"
on public.events
for insert
to authenticated
with check (public.current_user_can_manage_events());

drop policy if exists "event managers can update events" on public.events;

create policy "event managers can update events"
on public.events
for update
to authenticated
using (public.current_user_can_manage_events())
with check (public.current_user_can_manage_events());

-- Hard deletes stay disabled on purpose.
-- Deactivate an event by setting is_active = false instead.