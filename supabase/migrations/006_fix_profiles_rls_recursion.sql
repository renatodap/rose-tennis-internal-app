-- Rose-Hulman Tennis App - Fix Profiles RLS Infinite Recursion
-- The profiles table policies were self-referencing, causing infinite recursion
-- Solution: Use a SECURITY DEFINER function to check roles without triggering RLS

-- =====================================================
-- STEP 1: Create a helper function with SECURITY DEFINER
-- This function can read profiles without triggering RLS checks
-- =====================================================
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(user_role, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;

-- =====================================================
-- STEP 2: Drop all existing profiles policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- =====================================================
-- STEP 3: Recreate profiles policies WITHOUT self-reference
-- =====================================================

-- Users can always view their own profile (no recursion - direct ID check)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Coaches/captains/admins can view all profiles (uses helper function)
CREATE POLICY "Staff can view all profiles" ON profiles
  FOR SELECT USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Admins can do everything
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (auth.get_user_role() = 'admin');

-- =====================================================
-- STEP 4: Update other tables' policies to use the helper function
-- This prevents any potential recursion from other tables too
-- =====================================================

-- Players table
DROP POLICY IF EXISTS "Authenticated users can view players" ON players;
DROP POLICY IF EXISTS "Coaches can manage players" ON players;

CREATE POLICY "Authenticated users can view players" ON players
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage players" ON players
  FOR ALL USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Events table
DROP POLICY IF EXISTS "Authenticated users can view events" ON events;
DROP POLICY IF EXISTS "Coaches can manage events" ON events;

CREATE POLICY "Authenticated users can view events" ON events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage events" ON events
  FOR ALL USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Announcements table
DROP POLICY IF EXISTS "Authenticated users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Coaches can manage announcements" ON announcements;

CREATE POLICY "Authenticated users can view announcements" ON announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage announcements" ON announcements
  FOR ALL USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Forms table
DROP POLICY IF EXISTS "Authenticated users can view forms" ON forms;
DROP POLICY IF EXISTS "Coaches can manage forms" ON forms;

CREATE POLICY "Authenticated users can view forms" ON forms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage forms" ON forms
  FOR ALL USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Form responses table
DROP POLICY IF EXISTS "Users can view own responses" ON form_responses;
DROP POLICY IF EXISTS "Users can create own responses" ON form_responses;
DROP POLICY IF EXISTS "Coaches can view all responses" ON form_responses;

CREATE POLICY "Users can view own responses" ON form_responses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own responses" ON form_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Coaches can view all responses" ON form_responses
  FOR SELECT USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Tags table
DROP POLICY IF EXISTS "Authenticated users can view tags" ON tags;
DROP POLICY IF EXISTS "Coaches can manage tags" ON tags;

CREATE POLICY "Authenticated users can view tags" ON tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage tags" ON tags
  FOR ALL USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Player tags table
DROP POLICY IF EXISTS "Authenticated users can view player_tags" ON player_tags;
DROP POLICY IF EXISTS "Coaches can manage player_tags" ON player_tags;

CREATE POLICY "Authenticated users can view player_tags" ON player_tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage player_tags" ON player_tags
  FOR ALL USING (auth.get_user_role() IN ('coach', 'captain', 'admin'));

-- Staff table
DROP POLICY IF EXISTS "Authenticated users can view staff" ON staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON staff;

CREATE POLICY "Authenticated users can view staff" ON staff
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (auth.get_user_role() = 'admin');
