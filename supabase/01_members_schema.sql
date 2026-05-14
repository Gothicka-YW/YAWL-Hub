create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  facebook_name text not null,
  in_game_name text,
  house_key text,
  icon_url text,
  icon_path text,
  icon_mime_type text,
  icon_name text,
  birthday_raw text,
  birthday_month smallint,
  birthday_day smallint,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_birthday_month_check
    check (birthday_month is null or birthday_month between 1 and 12),
  constraint members_birthday_day_check
    check (birthday_day is null or birthday_day between 1 and 31),
  constraint members_icon_url_check
    check (icon_url is null or icon_url ~* '^https?://'),
  constraint members_icon_mime_type_check
    check (icon_mime_type is null or icon_mime_type in ('image/png', 'image/jpeg', 'image/webp'))
);

comment on table public.members is 'YoAngels Wish List member directory.';

create unique index if not exists members_facebook_name_key
  on public.members (lower(facebook_name));

create unique index if not exists members_in_game_name_key
  on public.members (lower(in_game_name))
  where in_game_name is not null and btrim(in_game_name) <> '';

drop trigger if exists set_members_updated_at on public.members;

create trigger set_members_updated_at
before update on public.members
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.members enable row level security;

-- Keep the table locked down for now.
-- The table will exist, but anon clients still cannot read it until you run
-- 02_enable_member_directory_read.sql after you decide that is acceptable.
