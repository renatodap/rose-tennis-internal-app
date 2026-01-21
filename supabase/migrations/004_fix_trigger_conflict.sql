-- Rose-Hulman Tennis App - Fix Trigger Conflict Handling
-- This migration fixes the handle_new_user trigger to not fail on conflicts
-- The trigger was causing 500 errors when Admin API createUser was called

-- =====================================================
-- ROBUST HANDLE_NEW_USER TRIGGER
-- Now uses ON CONFLICT DO UPDATE to handle duplicate emails gracefully
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  matched_player players%ROWTYPE;
  matched_staff staff%ROWTYPE;
  assigned_role TEXT;
BEGIN
  -- Try to match by email to existing player (case-insensitive)
  SELECT * INTO matched_player FROM players WHERE LOWER(email) = LOWER(NEW.email);

  -- Try to match by email to existing staff (case-insensitive)
  SELECT * INTO matched_staff FROM staff WHERE LOWER(email) = LOWER(NEW.email);

  -- Determine role based on match
  IF matched_staff.id IS NOT NULL THEN
    -- Staff member: admin for head_coach, coach for others
    IF matched_staff.role = 'head_coach' THEN
      assigned_role := 'admin';
    ELSE
      assigned_role := 'coach';
    END IF;
  ELSIF matched_player.id IS NOT NULL THEN
    -- Player: captain if is_captain is true, otherwise player
    IF matched_player.is_captain = true THEN
      assigned_role := 'captain';
    ELSE
      assigned_role := 'player';
    END IF;
  ELSE
    -- No match found - should not happen if whitelist is enforced
    assigned_role := 'pending';
  END IF;

  -- Insert profile with conflict handling
  -- If profile already exists for this auth.users id, update it
  -- If profile exists with same email but different id, this will fail
  -- but we handle that gracefully
  INSERT INTO profiles (id, email, role, player_id, staff_id)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    assigned_role,
    matched_player.id,
    matched_staff.id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    player_id = EXCLUDED.player_id,
    staff_id = EXCLUDED.staff_id;

  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- If there's a unique violation on email, log it but don't fail
  -- The application will handle this case
  RAISE NOTICE 'Profile creation skipped - email already exists: %', NEW.email;
  RETURN NEW;
WHEN OTHERS THEN
  -- Log any other errors but don't fail the user creation
  RAISE NOTICE 'Profile creation failed: % - %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also clean up any orphaned profiles that might exist
-- (profiles where the auth.users record doesn't exist)
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);
