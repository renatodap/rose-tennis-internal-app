-- Rose-Hulman Tennis App - Enable Public Read Access
-- Allows anonymous users to browse schedule, announcements, and forms
-- CUD operations still require authentication with appropriate role

-- =====================================================
-- STEP 1: Add anonymous read policies for public data
-- =====================================================

-- Events (schedule) - anyone can view
DROP POLICY IF EXISTS "Authenticated users can view events" ON events;
DROP POLICY IF EXISTS "Anyone can view events" ON events;

CREATE POLICY "Anyone can view events" ON events
  FOR SELECT TO anon, authenticated USING (true);

-- Match Details - anyone can view
DROP POLICY IF EXISTS "Authenticated users can view match_details" ON match_details;
DROP POLICY IF EXISTS "Anyone can view match_details" ON match_details;

CREATE POLICY "Anyone can view match_details" ON match_details
  FOR SELECT TO anon, authenticated USING (true);

-- Announcements - anyone can view published ones
DROP POLICY IF EXISTS "Authenticated users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;

CREATE POLICY "Anyone can view announcements" ON announcements
  FOR SELECT TO anon, authenticated USING (
    publish_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Forms - anyone can view active forms (but not fill without auth)
DROP POLICY IF EXISTS "Authenticated users can view forms" ON forms;
DROP POLICY IF EXISTS "Anyone can view forms" ON forms;

CREATE POLICY "Anyone can view forms" ON forms
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Form Questions - anyone can view (to see what's being asked)
DROP POLICY IF EXISTS "Authenticated users can view form_questions" ON form_questions;
DROP POLICY IF EXISTS "Anyone can view form_questions" ON form_questions;

CREATE POLICY "Anyone can view form_questions" ON form_questions
  FOR SELECT TO anon, authenticated USING (true);

-- Tags - anyone can view
DROP POLICY IF EXISTS "Authenticated users can view tags" ON tags;
DROP POLICY IF EXISTS "Anyone can view tags" ON tags;

CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT TO anon, authenticated USING (true);

-- Staff - anyone can view (public info)
DROP POLICY IF EXISTS "Authenticated users can view staff" ON staff;
DROP POLICY IF EXISTS "Anyone can view staff" ON staff;

CREATE POLICY "Anyone can view staff" ON staff
  FOR SELECT TO anon, authenticated USING (true);

-- =====================================================
-- NOTE: The following remain authenticated-only:
-- - players (contains emails)
-- - profiles (auth data)
-- - form_responses (private submissions)
-- - trips (logistics)
-- - trip_roster (RSVP data)
-- - player_tags (player categorization)
-- =====================================================
