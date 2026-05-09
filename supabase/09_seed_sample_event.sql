-- Optional sample event seed for the live YAWL Hub calendar.
-- Safe to run more than once: it only inserts the event if it does not already exist.

insert into public.events (
  event_type,
  title,
  event_date,
  start_time,
  end_time,
  timezone,
  host_name,
  location_text,
  details,
  yes_count,
  maybe_count,
  no_count,
  is_active
)
select
  'Special Event',
  'Garden Glow Party',
  date '2026-05-10',
  time '19:00',
  time '21:00',
  'ET',
  'Gothicka',
  'YoAngels clubhouse party house',
  'Sample live event for the shared calendar. Edit or deactivate it from Admin Tools once you are ready to post real events.',
  4,
  2,
  0,
  true
where not exists (
  select 1
  from public.events
  where title = 'Garden Glow Party'
    and event_date = date '2026-05-10'
    and is_active = true
);