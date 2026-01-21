-- Rose-Hulman Tennis App - Fix form_responses policies (correct column name)
-- The form_responses table uses player_id, not user_id

-- =====================================================
-- STEP 1: Create helper function if not exists
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
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

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon;

-- =====================================================
-- STEP 2: Create helper to get user's player_id
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_player_id()
RETURNS INTEGER AS $$
DECLARE
  pid INTEGER;
BEGIN
  SELECT player_id INTO pid
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN pid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_player_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_player_id() TO anon;

-- =====================================================
-- STEP 3: Drop all existing profiles policies
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- =====================================================
-- STEP 4: Recreate profiles policies WITHOUT self-reference
-- =====================================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Staff can view all profiles" ON profiles
  FOR SELECT USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (public.get_user_role() = 'admin');

-- =====================================================
-- STEP 5: Update other tables' policies
-- =====================================================

-- Players table
DROP POLICY IF EXISTS "Authenticated users can view players" ON players;
DROP POLICY IF EXISTS "Coaches can manage players" ON players;

CREATE POLICY "Authenticated users can view players" ON players
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage players" ON players
  FOR ALL USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Events table
DROP POLICY IF EXISTS "Authenticated users can view events" ON events;
DROP POLICY IF EXISTS "Coaches can manage events" ON events;

CREATE POLICY "Authenticated users can view events" ON events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage events" ON events
  FOR ALL USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Announcements table
DROP POLICY IF EXISTS "Authenticated users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Coaches can manage announcements" ON announcements;

CREATE POLICY "Authenticated users can view announcements" ON announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage announcements" ON announcements
  FOR ALL USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Forms table
DROP POLICY IF EXISTS "Authenticated users can view forms" ON forms;
DROP POLICY IF EXISTS "Coaches can manage forms" ON forms;

CREATE POLICY "Authenticated users can view forms" ON forms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage forms" ON forms
  FOR ALL USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Form responses table (FIXED: uses player_id not user_id)
DROP POLICY IF EXISTS "Users can view own responses" ON form_responses;
DROP POLICY IF EXISTS "Users can create own responses" ON form_responses;
DROP POLICY IF EXISTS "Players can view their own responses" ON form_responses;
DROP POLICY IF EXISTS "Players can insert their own responses" ON form_responses;
DROP POLICY IF EXISTS "Players can update their own responses" ON form_responses;
DROP POLICY IF EXISTS "Coaches can view all responses" ON form_responses;

CREATE POLICY "Players can view their own responses" ON form_responses
  FOR SELECT USING (player_id = public.get_user_player_id());

CREATE POLICY "Players can insert their own responses" ON form_responses
  FOR INSERT WITH CHECK (player_id = public.get_user_player_id());

CREATE POLICY "Players can update their own responses" ON form_responses
  FOR UPDATE USING (player_id = public.get_user_player_id());

CREATE POLICY "Coaches can view all responses" ON form_responses
  FOR SELECT USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Tags table
DROP POLICY IF EXISTS "Authenticated users can view tags" ON tags;
DROP POLICY IF EXISTS "Coaches can manage tags" ON tags;

CREATE POLICY "Authenticated users can view tags" ON tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage tags" ON tags
  FOR ALL USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Player tags table
DROP POLICY IF EXISTS "Authenticated users can view player_tags" ON player_tags;
DROP POLICY IF EXISTS "Coaches can manage player_tags" ON player_tags;

CREATE POLICY "Authenticated users can view player_tags" ON player_tags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coaches can manage player_tags" ON player_tags
  FOR ALL USING (public.get_user_role() IN ('coach', 'captain', 'admin'));

-- Staff table
DROP POLICY IF EXISTS "Authenticated users can view staff" ON staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON staff;

CREATE POLICY "Authenticated users can view staff" ON staff
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (public.get_user_role() = 'admin');
