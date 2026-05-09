alter table public.events
  alter column event_type set default 'Special Event';

alter table public.events
  drop constraint if exists events_type_check;

update public.events
set event_type = case
  when length(btrim(coalesce(event_type, ''))) = 0 then 'Special Event'
  when lower(btrim(event_type)) in ('birthday_party', 'birthday party') then 'Birthday Party'
  when lower(btrim(event_type)) in ('meet_up', 'meet up', 'meetup', 'hangout') then 'Meet Up'
  when lower(btrim(event_type)) in ('game') then 'Game'
  when lower(btrim(event_type)) in ('special_event', 'special event', 'other', 'wishlist', 'party') then 'Special Event'
  else regexp_replace(btrim(event_type), '\s+', ' ', 'g')
end;

alter table public.events
  add constraint events_type_check
  check (length(btrim(event_type)) > 0);

comment on table public.events is 'Shared YoAngels event calendar for Birthday Party, Meet Up, Game, Special Event, and custom event types.';

comment on column public.events.event_type is 'Human-readable event type label. Built-in options are Birthday Party, Meet Up, Game, and Special Event, but custom labels are allowed.';