# YAWL Hub Migration Workflow

This repo existed before Supabase CLI was initialized, so the top-level SQL files in `supabase/` are still the source of truth for the initial manual setup.

Recommended workflow:

1. Link the repo to the hosted project.
2. Apply existing setup SQL with `supabase db query --linked -f ...` or the helper script in `scripts/apply-supabase-sql.ps1`.
3. For new schema changes, create real migration files in this folder with `supabase migration new <name>`.
4. Push future migrations with `supabase db push`.

If your hosted database already has the old SQL changes applied, do not copy those old files into this folder retroactively without first baselining the remote history.