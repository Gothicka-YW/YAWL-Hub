# YAWL Hub Handoff

Last updated: 2026-05-10

## Current State

- Repo: `https://github.com/Gothicka-YW/YAWL-Hub.git`
- Stack: static HTML, CSS, and vanilla JS. No build step.
- Backend: Supabase.
- Local-only data: private notes, gifted status, visited status.
- Shared live data: member directory in Supabase.
- Shared event calendar: supported in the app and enabled after `supabase/08_events_calendar.sql` is run. Existing projects that already used the older event-type constraint should also run `supabase/10_event_type_customization.sql`.
- Weekly wishlist board now supports a live Supabase-backed current-week image-post workflow after `supabase/11_weekly_wishlists.sql` and `supabase/13_wishlist_image_uploads_and_comments.sql` are run.
- Supabase CLI is initialized for this repo; use the helper scripts in `scripts/` to link the project and run top-level SQL files from the terminal.

## What Is Working

- Live member directory reads are wired into `src/main.js`.
- Members page uses a Facebook-first row layout.
- Members page now supports search, role filtering, and a home-link-only view for gifting runs.
- YoWorld name is shown as the confirmation field for gifting.
- Member roles are supported in the UI: admin, event planner, moderator, helper, member.
- The Wishlists tab now supports one PNG/JPEG image post per member for the current week, owner-only updates to that same post, public gift comments, and member-home links pulled from the linked member record.
- Admin Tools now includes a member-email linking form so non-staff accounts can be tied to a member row for self-service wishlist posting.
- Account section now supports:
  - Supabase email/password sign-in
  - account creation
  - private member login flow for non-staff accounts
- Admin Tools is staff-only and supports:
  - add member
  - edit member
  - add birthdays through the member editor
  - deactivate member
  - change visible member roles when the signed-in staff account has role permission
  - add and edit shared events when the signed-in staff account has event permission

## Important Files

- `src/main.js`: main UI, live reads, account auth flow, and staff-only admin editor logic.
- `src/lib/supabase.js`: Supabase REST + auth/session helpers.
- `src/styles.css`: app styling, directory rows, account/admin UI styling, and the live wishlist board/editor layout.
- `Example Wish Lists/`: sample weekly wishlist images used by the current mock-backed gallery.
- `supabase/01_members_schema.sql`: base members table.
- `supabase/02_enable_member_directory_read.sql`: anon/authenticated read access for active members.
- `supabase/04_backfill_birthday_parts.sql`: fills birthday month/day after CSV import.
- `supabase/05_member_roles_and_permissions.sql`: adds `group_role`, `staff_permissions`, and base write scaffolding.
- `supabase/06_gothicka_admin_access.sql`: seeds `ywa.paint@gmail.com` as Gothicka admin.
- `supabase/07_admin_editor_auth_policies.sql`: required for the Account/Admin Tools flow to read staff permissions and perform role-safe writes.
- `supabase/08_events_calendar.sql`: creates the shared events table, read policies, and event-manager write policies.
- `supabase/10_event_type_customization.sql`: updates older event rows and constraints so Birthday Party, Meet Up, Game, Special Event, and custom event labels are supported.
- `supabase/11_weekly_wishlists.sql`: creates member account links plus the live weekly wishlist and legacy item tables with RLS.
- `supabase/12_member_owned_events.sql`: lets linked member accounts post and manage only their own events.
- `supabase/13_wishlist_image_uploads_and_comments.sql`: adds the wishlist image storage bucket, image-post columns, and public gift comments.

## Required Supabase Run Order

If setting up from scratch:

1. Run `supabase/01_members_schema.sql`
2. Import `supabase/members_seed.csv` locally if needed
3. Run `supabase/04_backfill_birthday_parts.sql`
4. Run `supabase/02_enable_member_directory_read.sql`
5. Run `supabase/05_member_roles_and_permissions.sql`
6. Run `supabase/06_gothicka_admin_access.sql`
7. Run `supabase/07_admin_editor_auth_policies.sql`
8. Run `supabase/08_events_calendar.sql`
9. If the database already used the earlier event-type constraint, run `supabase/10_event_type_customization.sql`
10. Run `supabase/11_weekly_wishlists.sql`
11. Run `supabase/12_member_owned_events.sql` if linked members should manage their own events
12. Run `supabase/13_wishlist_image_uploads_and_comments.sql`

## Sensitive Files Kept Local

These are intentionally excluded from git:

- `Home Links.txt`
- `YAWL Members - Sheet1.csv`
- `supabase/members_seed.csv`
- `supabase/03_members_seed.sql`

They contain real member names, birthdays, and/or house-link data.

## Immediate Next Step

Apply and test the live weekly wishlist flow against the real Supabase project:

1. Confirm `supabase/11_weekly_wishlists.sql` and `supabase/13_wishlist_image_uploads_and_comments.sql` have been run.
2. Reload the app.
3. Sign in as a staff account and open Admin Tools.
4. Link at least one email to a member row.
5. Open the Wishlists tab and verify:
  - the current-week board loads from Supabase
  - a linked member can upload a PNG/JPEG wishlist for the current Sunday reset
  - saving again updates the same post instead of creating a duplicate
  - another normal member cannot update someone else's post
  - people can add gift comments under the post
  - the home link button opens the member's saved house link

## Likely Next Improvement

- Extend private member login features beyond auth, such as saved preferences or private profile settings.
- Move giveaways and weekly highlights off mock data and into the live backend.

## Resume Prompt

Use this prompt in a new chat if needed:

"Continue work on YAWL Hub. The repo already has live Supabase member reads, a shared event calendar, and a live current-week wishlist image/comment system backed by `supabase/11_weekly_wishlists.sql` plus `supabase/13_wishlist_image_uploads_and_comments.sql`. Verify the new wishlist schema is applied, link a member email, and finish testing the self-service wishlist posting flow."
