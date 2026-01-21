-- NUCLEAR OPTION: Completely disable the auth trigger
-- The application will handle profile creation entirely
-- This bypasses whatever is causing the 500 error

-- Drop the trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function too (clean slate)
DROP FUNCTION IF EXISTS handle_new_user();

-- Clean up any orphaned profiles
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- Verify: This query should return nothing
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
