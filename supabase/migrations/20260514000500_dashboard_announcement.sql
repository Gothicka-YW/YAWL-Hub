-- Apply after 20260514000300_fix_invite_hash_pgcrypto_lookup.sql.
-- Adds a shared dashboard announcement editable by staff from the app.

create or replace function public.current_user_can_manage_dashboard_settings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_can_manage_members()
    or public.current_user_can_manage_events();
$$;

create table if not exists public.dashboard_settings (
  setting_key text primary key,
  announcement text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dashboard_settings_setting_key_check
    check (setting_key in ('main')),
  constraint dashboard_settings_announcement_length_check
    check (char_length(btrim(announcement)) between 1 and 500)
);

comment on table public.dashboard_settings is 'Singleton-style live dashboard settings editable by staff.';
comment on column public.dashboard_settings.announcement is 'Shared announcement shown on the dashboard announcement card.';

insert into public.dashboard_settings (setting_key, announcement)
values (
  'main',
  'Wish list uploads open Sunday night. Linked member accounts can now post their own weekly boards while admins keep member records and home links organized.'
)
on conflict (setting_key) do nothing;

grant select on table public.dashboard_settings to anon, authenticated;
grant insert, update on table public.dashboard_settings to authenticated;

drop trigger if exists set_dashboard_settings_updated_at on public.dashboard_settings;

create trigger set_dashboard_settings_updated_at
before update on public.dashboard_settings
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.dashboard_settings enable row level security;

drop policy if exists "public can read dashboard settings" on public.dashboard_settings;

create policy "public can read dashboard settings"
on public.dashboard_settings
for select
to anon, authenticated
using (true);

drop policy if exists "staff can insert dashboard settings" on public.dashboard_settings;

create policy "staff can insert dashboard settings"
on public.dashboard_settings
for insert
to authenticated
with check (public.current_user_can_manage_dashboard_settings());

drop policy if exists "staff can update dashboard settings" on public.dashboard_settings;

create policy "staff can update dashboard settings"
on public.dashboard_settings
for update
to authenticated
using (public.current_user_can_manage_dashboard_settings())
with check (public.current_user_can_manage_dashboard_settings());