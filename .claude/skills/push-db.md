---
name: push-db
description: Push SQL migration files to the Supabase database
user_invocable: true
---

# Push Database Changes

Run pending SQL migrations against the Supabase database using the DATABASE_URL from `.env.local`.

## Steps

1. Read DATABASE_URL from `.env.local`
2. Identify the migration file(s) to push. If the user specifies a file, use that. Otherwise, ask which migration to run.
3. Execute with: `psql "$DATABASE_URL" -f <migration_file>`
4. Report the results (rows affected, any errors)

## Important

- Always confirm which migration file before running
- If a migration fails partway, note which statements succeeded so the user can fix and re-run only the failed parts
- The DATABASE_URL is already stored in `.env.local` — read it from there, never hardcode it
