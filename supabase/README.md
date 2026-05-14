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
11. If your project already used the earlier event-type constraint, run `10_event_type_customization.sql` to switch to Birthday Party, Meet Up, Game, Special Event, and custom event labels.
12. Run `11_weekly_wishlists.sql` before using the live Wish Lists tab, wish list editor, or the original member email-link flow.
13. Run `12_member_owned_events.sql` after `11_weekly_wishlists.sql` if linked members should be able to post events and manage only their own entries.
14. Run `13_wishlist_image_uploads_and_comments.sql` to add the wishlist image bucket, image-post columns, and gift comments.
15. Run `14_invite_code_account_claims.sql` to switch member ownership to `auth.uid()`, add admin-generated invite codes, and let signed-in users claim their member profile after account creation.
16. Push the self-owned posting migration in `supabase/migrations/20260512000100_self_owned_posting.sql` after `14_invite_code_account_claims.sql` if wish lists and new events should be locked to the signed-in member profile.
17. Push `supabase/migrations/20260513000100_giveaways.sql` after the self-owned posting migration to add live giveaways, entrant reactions, image uploads, and the random winner picker.
18. Push `supabase/migrations/20260513000200_staff_posting_and_giveaway_rerolls.sql` after the giveaways migration if staff should also be able to post shared wish lists, events, and giveaways, and if giveaway winners should support rerolls.
19. Push `supabase/migrations/20260513000300_winner_closes_giveaway.sql` after the reroll migration so winner selection also stamps the giveaway closed immediately.
20. Push `supabase/migrations/20260513000400_chat_module.sql` after the winner-close migration to add the General, Giveaways, and Models chat rooms, admin moderation, and chat image uploads.
21. Create or sign in to a Supabase Auth account that uses the same email as your `staff_permissions` row.

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
- `08_events_calendar.sql` creates the shared event calendar for Birthday Party, Meet Up, Game, Special Event, and custom event labels, with reads for active events and initial write policies.
- `10_event_type_customization.sql` updates older projects that still use the original event-type constraint so custom event labels can be saved.
- `11_weekly_wishlists.sql` adds live weekly wish lists, the legacy item limits, and the original member-email link table used for self-service wish list posting.
- `12_member_owned_events.sql` extends the events policies so linked members can post events and manage only the events created under their own linked member profile.
- `13_wishlist_image_uploads_and_comments.sql` adds the public wishlist image bucket, owner-only image post updates, and public gift comments.
- `14_invite_code_account_claims.sql` adds invite-code claiming, links member ownership to `auth.uid()`, and keeps self-service email/password resets inside Supabase Auth.
- `supabase/migrations/20260512000100_self_owned_posting.sql` locks new wish list and event posts to the signed-in member profile while still allowing staff to moderate existing event posts.
- `supabase/migrations/20260513000100_giveaways.sql` adds live giveaways, public entrant lists, the giveaway image bucket, and a server-side random winner picker for creators and staff.
- `supabase/migrations/20260513000200_staff_posting_and_giveaway_rerolls.sql` reopens staff posting access for shared posts after the self-owned launch migration and adds the giveaway reroll RPC.
- `supabase/migrations/20260513000300_winner_closes_giveaway.sql` updates the winner RPCs so the selected winner is posted and the giveaway is stamped closed at the same moment.
- `supabase/migrations/20260513000400_chat_module.sql` adds fixed chat rooms, authenticated message reads, linked-member posting, admin moderation, and the chat image bucket.

## Supabase CLI Workflow

The repo is now initialized for Supabase CLI usage.

One-time setup:

1. Open a new terminal in `YAWL-Hub`.
2. Log in to Supabase CLI: `supabase login`
3. Link this repo to the hosted project: `./scripts/link-supabase-project.ps1 -DatabasePassword '<your-db-password>'`

Apply the existing SQL files from the terminal:

- Single file: `supabase db query --linked -f supabase/08_events_calendar.sql`
- Helper script, one file: `./scripts/apply-supabase-sql.ps1 -Files supabase/08_events_calendar.sql`
- Helper script, event-type update for existing projects: `./scripts/apply-supabase-sql.ps1 -Files supabase/10_event_type_customization.sql`
- Helper script, wish list board setup: `./scripts/apply-supabase-sql.ps1 -Files supabase/11_weekly_wishlists.sql`
- Helper script, member-owned event setup: `./scripts/apply-supabase-sql.ps1 -Files supabase/12_member_owned_events.sql`
- Helper script, wish list image/comment setup: `./scripts/apply-supabase-sql.ps1 -Files supabase/13_wishlist_image_uploads_and_comments.sql`
- Helper script, invite-code account claim setup: `./scripts/apply-supabase-sql.ps1 -Files supabase/14_invite_code_account_claims.sql`
- Helper script, live launch ownership setup: `./scripts/apply-supabase-sql.ps1 -Files supabase/14_invite_code_account_claims.sql,supabase/migrations/20260512000100_self_owned_posting.sql`
- Helper script, giveaways setup: `./scripts/apply-supabase-sql.ps1 -Files supabase/migrations/20260513000100_giveaways.sql`
- Helper script, staff posting + giveaway rerolls: `./scripts/apply-supabase-sql.ps1 -Files supabase/migrations/20260513000200_staff_posting_and_giveaway_rerolls.sql`
- Helper script, winner closes giveaway: `./scripts/apply-supabase-sql.ps1 -Files supabase/migrations/20260513000300_winner_closes_giveaway.sql`
- Helper script, chat module: `./scripts/apply-supabase-sql.ps1 -Files supabase/migrations/20260513000400_chat_module.sql`
- Helper script, full ordered set: `./scripts/apply-supabase-sql.ps1 -All`
- Optional sample event seed: `./scripts/apply-supabase-sql.ps1 -Files supabase/09_seed_sample_event.sql`

Future schema changes:

1. Create a migration file: `supabase migration new <change_name>`
2. Edit the new SQL file in `supabase/migrations/`
3. Push it to the linked project: `supabase db push`

Important:

- The hosted YAWL Hub database likely predates the CLI setup. Use the helper script or `supabase db query --linked -f ...` for the existing top-level SQL files.
- Use `supabase migration new` for new changes going forward instead of adding more top-level SQL files when possible.
- If you ever want to baseline the current hosted schema into CLI migration history, start with `supabase db pull <baseline_name>` after linking the project.
- If you publish the app with GitHub Pages, the expected URL is `https://gothicka-yw.github.io/YAWL-Hub/`. Add that URL in Supabase Auth settings for your hosted project before relying on password-reset or email-confirmation links.
