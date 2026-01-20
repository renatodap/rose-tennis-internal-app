-- Rose-Hulman Tennis Team App - Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PLAYERS
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  class_year TEXT CHECK (class_year IN ('Fr', 'So', 'Jr', 'Sr')),
  is_captain BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'trainer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('player', 'coach', 'admin', 'pending')),
  player_id INTEGER REFERENCES players(id),
  staff_id INTEGER REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAGS (varsity, jv, injured, florida_trip, etc.)
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#800000'
);

-- PLAYER_TAGS (junction)
CREATE TABLE IF NOT EXISTS player_tags (
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (player_id, tag_id)
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('practice', 'match', 'fitness', 'meeting', 'scrimmage', 'trip', 'other')),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  for_mens BOOLEAN DEFAULT TRUE,
  for_womens BOOLEAN DEFAULT TRUE,
  notes TEXT,
  meeting_notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MATCH_DETAILS (extends events)
CREATE TABLE IF NOT EXISTS match_details (
  event_id INTEGER PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  home_away TEXT CHECK (home_away IN ('home', 'away', 'neutral')),
  mens_score TEXT,
  womens_score TEXT,
  result TEXT CHECK (result IN ('win', 'loss', 'tie', 'cancelled', NULL))
);

-- TRIPS
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  max_men INTEGER DEFAULT 9,
  max_women INTEGER DEFAULT 9,
  notes TEXT,
  flight_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIP_ROSTER
CREATE TABLE IF NOT EXISTS trip_roster (
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  PRIMARY KEY (trip_id, player_id)
);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  for_mens BOOLEAN DEFAULT TRUE,
  for_womens BOOLEAN DEFAULT TRUE,
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORMS
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  for_mens BOOLEAN DEFAULT TRUE,
  for_womens BOOLEAN DEFAULT TRUE,
  target_tags INTEGER[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORM_QUESTIONS
CREATE TABLE IF NOT EXISTS form_questions (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'multiselect', 'date', 'time', 'boolean')),
  options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- FORM_RESPONSES
CREATE TABLE IF NOT EXISTS form_responses (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, player_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Coaches can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Players (everyone authenticated can read)
CREATE POLICY "Authenticated users can view players" ON players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage players" ON players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Staff
CREATE POLICY "Authenticated users can view staff" ON staff
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tags
CREATE POLICY "Authenticated users can view tags" ON tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage tags" ON tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Player Tags
CREATE POLICY "Authenticated users can view player_tags" ON player_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage player_tags" ON player_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Events
CREATE POLICY "Authenticated users can view events" ON events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Match Details
CREATE POLICY "Authenticated users can view match_details" ON match_details
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage match_details" ON match_details
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Trips
CREATE POLICY "Authenticated users can view trips" ON trips
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage trips" ON trips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Trip Roster
CREATE POLICY "Authenticated users can view trip_roster" ON trip_roster
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage trip_roster" ON trip_roster
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

CREATE POLICY "Players can update their own trip status" ON trip_roster
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = trip_roster.player_id
    )
  );

-- Announcements
CREATE POLICY "Authenticated users can view announcements" ON announcements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Forms
CREATE POLICY "Authenticated users can view active forms" ON forms
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Coaches can manage forms" ON forms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Form Questions
CREATE POLICY "Authenticated users can view form_questions" ON form_questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coaches can manage form_questions" ON form_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Form Responses
CREATE POLICY "Players can view their own responses" ON form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = form_responses.player_id
    )
  );

CREATE POLICY "Players can insert their own responses" ON form_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = form_responses.player_id
    )
  );

CREATE POLICY "Players can update their own responses" ON form_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = form_responses.player_id
    )
  );

CREATE POLICY "Coaches can view all responses" ON form_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Auto-link profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  matched_player_id INTEGER;
  matched_staff_id INTEGER;
BEGIN
  -- Try to match by email to existing player
  SELECT id INTO matched_player_id FROM players WHERE email = NEW.email;

  -- Try to match by email to existing staff
  SELECT id INTO matched_staff_id FROM staff WHERE email = NEW.email;

  INSERT INTO profiles (id, email, role, player_id, staff_id)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN matched_staff_id IS NOT NULL THEN 'coach'
      WHEN matched_player_id IS NOT NULL THEN 'player'
      ELSE 'pending'
    END,
    matched_player_id,
    matched_staff_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed data
INSERT INTO tags (name, color) VALUES
  ('varsity', '#800000'),
  ('jv', '#B3B2B1'),
  ('injured', '#E87722'),
  ('florida_trip', '#4CAF50'),
  ('academic_conflict', '#FFC107')
ON CONFLICT (name) DO NOTHING;

INSERT INTO staff (first_name, last_name, email, title, role) VALUES
  ('Matt', 'Wilson', 'wilson@rose-hulman.edu', 'Head Coach', 'head_coach'),
  ('Amanda', 'Lubold', 'lubold@rose-hulman.edu', 'Assistant Coach', 'assistant_coach')
ON CONFLICT (email) DO NOTHING;

INSERT INTO trips (name, destination, departure_date, return_date, max_men, max_women, notes) VALUES
  ('Spring Break Florida Trip', 'Orlando, FL', '2026-02-28', '2026-03-06', 9, 9, 'Annual spring training trip')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_gender ON players(gender);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_announcements_publish_at ON announcements(publish_at);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_due_date ON forms(due_date);
