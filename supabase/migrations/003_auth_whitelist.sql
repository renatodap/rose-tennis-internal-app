-- Rose-Hulman Tennis App - Auth Whitelist & Captain Role
-- Adds email whitelist check and updates user trigger for captain role

-- =====================================================
-- EMAIL WHITELIST CHECK FUNCTION
-- Only allows signup for emails in players or staff tables
-- =====================================================
CREATE OR REPLACE FUNCTION is_email_whitelisted(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM players WHERE email = check_email
    UNION
    SELECT 1 FROM staff WHERE email = check_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATED HANDLE_NEW_USER TRIGGER
-- Now assigns 'captain' role for players with is_captain = true
-- And 'admin' role for head_coach staff
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  matched_player players%ROWTYPE;
  matched_staff staff%ROWTYPE;
  assigned_role TEXT;
BEGIN
  -- Try to match by email to existing player
  SELECT * INTO matched_player FROM players WHERE email = NEW.email;

  -- Try to match by email to existing staff
  SELECT * INTO matched_staff FROM staff WHERE email = NEW.email;

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

  INSERT INTO profiles (id, email, role, player_id, staff_id)
  VALUES (
    NEW.id,
    NEW.email,
    assigned_role,
    matched_player.id,
    matched_staff.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (already exists from schema, this updates the function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ADD CAPTAIN ROLE TO PROFILES CHECK CONSTRAINT
-- =====================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('player', 'captain', 'coach', 'admin', 'pending'));

-- =====================================================
-- RLS POLICY FOR CAPTAINS (same as coaches)
-- =====================================================

-- Update events policy to include captains
DROP POLICY IF EXISTS "Coaches can manage events" ON events;
CREATE POLICY "Coaches and captains can manage events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'captain'))
  );

-- Update announcements policy to include captains
DROP POLICY IF EXISTS "Coaches can manage announcements" ON announcements;
CREATE POLICY "Coaches and captains can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'captain'))
  );

-- Update forms policy to include captains
DROP POLICY IF EXISTS "Coaches can manage forms" ON forms;
CREATE POLICY "Coaches and captains can manage forms" ON forms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'captain'))
  );

-- Update form_questions policy to include captains
DROP POLICY IF EXISTS "Coaches can manage form_questions" ON form_questions;
CREATE POLICY "Coaches and captains can manage form_questions" ON form_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'captain'))
  );
