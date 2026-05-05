-- Run this only when you are ready for the browser app to read the member directory.
-- It exposes SELECT access to the anon and authenticated roles for active members.

grant select on table public.members to anon, authenticated;

drop policy if exists "anon can read active members" on public.members;

create policy "anon can read active members"
on public.members
for select
to anon, authenticated
using (is_active = true);
