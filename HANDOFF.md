# YAWL Hub Handoff

Last updated: 2026-05-05

## Current State

- Repo: `https://github.com/Gothicka-YW/YAWL-Hub.git`
- Stack: static HTML, CSS, and vanilla JS. No build step.
- Backend: Supabase.
- Local-only data: private notes, gifted status, visited status.
- Shared live data: member directory in Supabase.

## What Is Working

- Live member directory reads are wired into `src/main.js`.
- Members page uses a Facebook-first row layout.
- YoWorld name is shown as the confirmation field for gifting.
- Member roles are supported in the UI: admin, event planner, moderator, helper, member.
- Admin tab now supports:
  - Supabase email/password sign-in
  - create account
  - add member
  - edit member
  - deactivate member
  - change visible member roles when the signed-in staff account has role permission

## Important Files

- `src/main.js`: main UI, live reads, admin auth/editor logic.
- `src/lib/supabase.js`: Supabase REST + auth/session helpers.
- `src/styles.css`: app styling, directory rows, admin editor styling.
- `supabase/01_members_schema.sql`: base members table.
- `supabase/02_enable_member_directory_read.sql`: anon/authenticated read access for active members.
- `supabase/04_backfill_birthday_parts.sql`: fills birthday month/day after CSV import.
- `supabase/05_member_roles_and_permissions.sql`: adds `group_role`, `staff_permissions`, and base write scaffolding.
- `supabase/06_gothicka_admin_access.sql`: seeds `ywa.paint@gmail.com` as Gothicka admin.
- `supabase/07_admin_editor_auth_policies.sql`: required for the Admin tab to read staff permissions and perform role-safe writes.

## Required Supabase Run Order

If setting up from scratch:

1. Run `supabase/01_members_schema.sql`
2. Import `supabase/members_seed.csv` locally if needed
3. Run `supabase/04_backfill_birthday_parts.sql`
4. Run `supabase/02_enable_member_directory_read.sql`
5. Run `supabase/05_member_roles_and_permissions.sql`
6. Run `supabase/06_gothicka_admin_access.sql`
7. Run `supabase/07_admin_editor_auth_policies.sql`

## Sensitive Files Kept Local

These are intentionally excluded from git:

- `Home Links.txt`
- `YAWL Members - Sheet1.csv`
- `supabase/members_seed.csv`
- `supabase/03_members_seed.sql`

They contain real member names, birthdays, and/or house-link data.

## Immediate Next Step

Test the Admin tab against the real Supabase project:

1. Confirm `07_admin_editor_auth_policies.sql` has been run.
2. Reload the app.
3. Open the Admin tab.
4. Sign in or create the Supabase Auth account for `ywa.paint@gmail.com`.
5. Verify:
   - staff profile loads
   - add member works
   - edit member works
   - deactivate member works
   - role change works for Gothicka

## Likely Next Improvement

- Split the current Admin access UX into a more general account flow so normal members can have private logins without the tab reading as admin-only.
- Add search and filtering to the Facebook-first directory.

## Resume Prompt

Use this prompt in a new chat if needed:

"Continue work on YAWL Hub. The repo already has live Supabase member reads, Facebook-first member rows, member roles, and an admin auth/editor UI. Verify that `supabase/07_admin_editor_auth_policies.sql` is applied, then test and finish the admin sign-in/editing flow."