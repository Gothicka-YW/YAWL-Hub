# Supabase Member Setup

Use these files in order:

1. Run `01_members_schema.sql` in the Supabase SQL editor.
2. Import `members_seed.csv` into the `public.members` table.
3. If you used the CSV import path, run `04_backfill_birthday_parts.sql` to populate `birthday_month` and `birthday_day` from `birthday_raw`.
4. If the CSV preview still reports row-width errors, skip the CSV import and run `03_members_seed.sql` in the SQL editor instead.
5. Leave the table locked down until you are ready for the browser app to read it.
6. When ready, run `02_enable_member_directory_read.sql`.
7. Run `05_member_roles_and_permissions.sql` when you are ready to add visible member roles and future write-permission scaffolding.
8. Replace the placeholder email in `06_gothicka_admin_access.sql`, then run it to register Gothicka as your first admin for future authenticated editing.
9. Run `07_admin_editor_auth_policies.sql` before using the Account section to sign in and the Admin Tools section to edit members from the app.
10. Run `08_events_calendar.sql` before using the Events tab or Admin Tools to load and manage the shared event calendar.
11. Create or sign in to a Supabase Auth account that uses the same email as your `staff_permissions` row.

Notes:

- The real member seed files are intentionally kept local and excluded from git because they contain private group data.
- The cleaned seed file uses the CSV as the primary source of truth.
- `house_key` is stored as the YoWorld key value only, not the full URL.
- `birthday_raw` keeps the original month/day text. The CSV import file omits `birthday_month` and `birthday_day` on purpose so Supabase's importer does not choke on rows with blank birthdays.
- After a CSV import, run `04_backfill_birthday_parts.sql` to fill `birthday_month` and `birthday_day` from `birthday_raw`.
- Three members currently have no in-game name, no house key, and no birthday.
- One member uses an `APKitchen-...` house key prefix instead of `h...` or `APLiving-...`.
- Twelve members currently have no birthday in the source CSV.
- `03_members_seed.sql` is a fallback that inserts the same cleaned rows without relying on the CSV import UI.
- `05_member_roles_and_permissions.sql` adds a `group_role` column on members plus a `staff_permissions` table and authenticated write policies for future admin workflows.
- `06_gothicka_admin_access.sql` now seeds `ywa.paint@gmail.com` as Gothicka's admin staff record.
- `07_admin_editor_auth_policies.sql` lets signed-in staff read their own permissions record and enforces safer role-aware member editing rules.
- `08_events_calendar.sql` creates the shared event calendar for hangouts, parties, games, meet ups, and wish list events, with reads for active events and writes restricted to staff who can manage events.
